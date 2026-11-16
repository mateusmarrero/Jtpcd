const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const SALT = 'jtpcd_salt_2026';
const SESSIONS = new Map(); // Simple secure memory session map token -> user
const LOGIN_ATTEMPTS = new Map(); // IP-based Rate Limiter (ip -> { count, firstAttempt, lockedUntil })

function getTrustedClientIp(req) {
  // 1. Ambiente Vercel Edge / Serverless:
  // Conforme documentação oficial da Vercel (https://vercel.com/docs/headers/request-headers):
  // - 'x-forwarded-for': Contém o IP público do cliente. A Vercel sobrescreve esse cabeçalho
  //   na borda para evitar spoofing (descartando headers externos forjados).
  // - 'x-real-ip': É idêntico a 'x-forwarded-for' e contém o IP público do cliente.
  // - 'x-vercel-forwarded-for': Idêntico a 'x-forwarded-for'.
  // O IP público original do cliente situa-se na primeira posição (parts[0]).
  if (process.env.VERCEL === '1') {
    const xForwarded = req.headers['x-forwarded-for'];
    if (xForwarded && typeof xForwarded === 'string') {
      const parts = xForwarded.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length > 0 && parts[0] !== 'unknown') return parts[0];
    }
    const xRealIp = req.headers['x-real-ip'];
    if (xRealIp && typeof xRealIp === 'string') {
      const clean = xRealIp.split(',')[0].trim();
      if (clean && clean !== 'unknown') return clean;
    }
    const xVercelFwd = req.headers['x-vercel-forwarded-for'];
    if (xVercelFwd && typeof xVercelFwd === 'string') {
      const clean = xVercelFwd.split(',')[0].trim();
      if (clean && clean !== 'unknown') return clean;
    }
    return req.socket?.remoteAddress || '127.0.0.1';
  }

  // 2. Ambiente Local / Dev / Suítes de Testes (Loopback):
  const socketIp = req.socket?.remoteAddress || '127.0.0.1';
  const isLoopback = (
    socketIp === '127.0.0.1' ||
    socketIp === '::1' ||
    socketIp === '::ffff:127.0.0.1' ||
    socketIp === 'localhost'
  );

  if (isLoopback) {
    const devReal = req.headers['x-real-ip'];
    if (devReal && typeof devReal === 'string' && devReal.trim()) {
      return devReal.split(',')[0].trim();
    }
    const devFwd = req.headers['x-forwarded-for'];
    if (devFwd && typeof devFwd === 'string') {
      const parts = devFwd.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length > 0) return parts[0];
    }
  }

  // 3. Em conexões externas diretas ao Node.js (sem Vercel à frente), NUNCA confiar em headers HTTP enviados pelo cliente:
  return socketIp;
}

function maskIp(ip) {
  if (!ip) return '0.0.0.xxx';
  const clean = String(ip).trim();
  if (clean.includes('.')) {
    return clean.replace(/\.\d+$/, '.xxx');
  }
  if (clean.includes(':')) {
    const parts = clean.split(':');
    return parts.slice(0, 3).join(':') + ':xxxx:xxxx';
  }
  return 'anonymized';
}

function consumeMemoryRateLimit(ip, maxAttempts = 5, windowMinutes = 15, lockoutMinutes = 15) {
  const now = Date.now();
  const record = LOGIN_ATTEMPTS.get(ip) || { count: 0, firstAttempt: now, lockedUntil: null };

  // 1. Bloqueio ativo: NÃO estende o bloqueio (evita rolling lockout)
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    record.count += 1;
    LOGIN_ATTEMPTS.set(ip, record);
    return { allowed: false, remainingSeconds, source: 'memory' };
  }

  // 2. Bloqueio expirou: reinicia o contador estritamente em 1
  if (record.lockedUntil && now >= record.lockedUntil) {
    record.count = 1;
    record.firstAttempt = now;
    record.lockedUntil = null;
    LOGIN_ATTEMPTS.set(ip, record);
    return { allowed: true, ticket: 1, source: 'memory' };
  }

  // 3. Janela de tempo expirou sem bloqueio: reinicia em 1
  if (now - record.firstAttempt > windowMinutes * 60 * 1000) {
    record.count = 1;
    record.firstAttempt = now;
    record.lockedUntil = null;
    LOGIN_ATTEMPTS.set(ip, record);
    return { allowed: true, ticket: 1, source: 'memory' };
  }

  const nextCount = record.count + 1;
  record.count = nextCount;

  if (nextCount > maxAttempts) {
    return { allowed: false, remainingSeconds: lockoutMinutes * 60, source: 'memory' };
  }

  if (nextCount === maxAttempts) {
    record.lockedUntil = now + lockoutMinutes * 60 * 1000;
  }

  LOGIN_ATTEMPTS.set(ip, record);
  return { allowed: true, ticket: nextCount, source: 'memory' };
}

// Rate Limiter Centralizado & Compartilhado com Atomic Ticket via LAST_INSERT_ID
// e Proteção Estrita contra Rolling Lockout e Erro de Avaliação Sequencial no MariaDB 10.11
async function consumeDistributedRateLimit(ip, endpoint, maxAttempts = 5, windowMinutes = 15, lockoutMinutes = 15, failClosed = false) {
  let conn;
  try {
    conn = await pool.getConnection();

    const windowSec = windowMinutes * 60;
    const lockoutSec = lockoutMinutes * 60;

    // A ordem de avaliação na cláusula UPDATE é fundamental no MariaDB 10.11:
    // 1. 'attempts' é avaliado PRIMEIRO, antes que 'first_attempt' seja alterado.
    // 2. Se 'locked_until' expirou (<= NOW()), 'attempts' reseta para 1 e 'first_attempt' para NOW().
    // 3. Se 'locked_until' está ativo (> NOW()), 'locked_until' NÃO é renovado (previne rolling lockout perpétuo).
    const [res] = await conn.execute(
      `INSERT INTO security_rate_limits (ip, endpoint, attempts, first_attempt, locked_until)
       VALUES (?, ?, 1, NOW(), NULL)
       ON DUPLICATE KEY UPDATE
         attempts = LAST_INSERT_ID(
           IF(locked_until IS NOT NULL AND locked_until > NOW(), attempts + 1,
             IF(locked_until IS NOT NULL AND locked_until <= NOW(), 1,
               IF(TIMESTAMPDIFF(SECOND, first_attempt, NOW()) > ${windowSec}, 1, attempts + 1)))
         ),
         first_attempt = IF(locked_until IS NOT NULL AND locked_until > NOW(), first_attempt,
                           IF(locked_until IS NOT NULL AND locked_until <= NOW(), NOW(),
                             IF(TIMESTAMPDIFF(SECOND, first_attempt, NOW()) > ${windowSec}, NOW(), first_attempt))),
         locked_until = IF(locked_until IS NOT NULL AND locked_until > NOW(), locked_until,
                          IF(attempts = 1, NULL,
                            IF(attempts >= ${maxAttempts}, DATE_ADD(NOW(), INTERVAL ${lockoutSec} SECOND), NULL)))`,
      [ip, endpoint]
    );

    // Determina o ticket atribuído a esta conexão
    const isInsert = (res.affectedRows === 1);
    let ticket = 1;
    if (!isInsert) {
      const [[{ t }]] = await conn.execute('SELECT LAST_INSERT_ID() AS t');
      ticket = t;
    }

    // Se o ticket ultrapassou o limite de tentativas
    if (ticket > maxAttempts) {
      const [[lockInfo]] = await conn.execute(
        'SELECT TIMESTAMPDIFF(SECOND, NOW(), locked_until) AS rem_sec FROM security_rate_limits WHERE ip = ? AND endpoint = ?',
        [ip, endpoint]
      );
      conn.release();
      const remSec = lockInfo?.rem_sec && lockInfo.rem_sec > 0 ? lockInfo.rem_sec : lockoutSec;
      return { allowed: false, ticket, remainingSeconds: remSec, source: 'database' };
    }

    conn.release();
    return { allowed: true, ticket, source: 'database' };

  } catch (err) {
    if (conn) conn.release();
    console.error('Falha no Rate Limiter centralizado:', err.message);
    if (failClosed) {
      return { allowed: false, failClosed: true, source: 'fail-closed' };
    }
    return consumeMemoryRateLimit(ip, maxAttempts, windowMinutes, lockoutMinutes);
  }
}

async function clearDistributedRateLimit(ip, endpoint) {
  try {
    LOGIN_ATTEMPTS.delete(ip);
    await pool.execute('DELETE FROM security_rate_limits WHERE ip = ? AND endpoint = ?', [ip, endpoint]);
  } catch (err) {
    console.error('Erro ao limpar rate limit:', err.message);
  }
}

async function cleanupExpiredRateLimits() {
  try {
    await pool.execute(
      `DELETE FROM security_rate_limits
       WHERE (locked_until IS NOT NULL AND locked_until < DATE_SUB(NOW(), INTERVAL 1 HOUR))
          OR (locked_until IS NULL AND first_attempt < DATE_SUB(NOW(), INTERVAL 2 HOUR))`
    );
  } catch (e) {
    // Silencioso em caso de falha de conexão na limpeza em segundo plano
  }
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    return await bcrypt.compare(password, storedHash);
  }
  const legacyHash = crypto.createHash('sha256').update(password + SALT).digest('hex');
  if (legacyHash === storedHash) {
    return 'legacy_match';
  }
  return false;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function verifyAuth(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token || !SESSIONS.has(token)) {
    return null;
  }
  const session = SESSIONS.get(token);
  // Expira em 24h
  if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
    SESSIONS.delete(token);
    return null;
  }
  return session.user;
}

async function logAudit(usuario, acao, modulo, detalhes, ip) {
  try {
    const safeIp = maskIp(ip);
    await pool.execute(
      'INSERT INTO audit_logs (usuario, acao, modulo, detalhes, ip) VALUES (?, ?, ?, ?, ?)',
      [usuario || 'admin', acao, modulo, detalhes || '', safeIp]
    );
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

async function handleApi(req, res, urlObj, body) {
  const path = urlObj.pathname;
  const method = req.method;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // ---------- 0. MONITORAMENTO: HEALTH CHECK PÚBLICO (UPTIME MONITORS) ----------
  if (path === '/api/health' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // ---------- 1. ROTA PÚBLICA: ENVIO DE NOVO LEAD ----------
  if (path === '/api/leads' && method === 'POST') {
    try {
      const clientIp = getTrustedClientIp(req);
      const rateCheck = await consumeDistributedRateLimit(clientIp, 'public_leads', 10, 60, 60);
      if (!rateCheck.allowed) {
        res.writeHead(429);
        res.end(JSON.stringify({ error: 'Muitas mensagens enviadas recentemente. Por favor, aguarde alguns instantes.' }));
        return;
      }
      const data = JSON.parse(body || '{}');
      const { nome, empresa, cargo, email, telefone, servico_interesse, mensagem } = data;

      if (!nome || !telefone) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Nome e telefone são campos obrigatórios.' }));
        return;
      }

      const [result] = await pool.execute(
        `INSERT INTO leads (nome, empresa, cargo, email, telefone, servico_interesse, mensagem, status, origem) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'novo', 'site_formulario')`,
        [nome, empresa || null, cargo || null, email || null, telefone, servico_interesse || null, mensagem || null]
      );

      res.writeHead(201);
      res.end(JSON.stringify({ success: true, message: 'Mensagem registrada com sucesso!', leadId: result.insertId }));
    } catch (err) {
      console.error('Erro ao salvar lead:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro interno ao salvar contato.' }));
    }
    return;
  }

  // ---------- 1.1 ROTA PÚBLICA: TRACK DE VISITAS (ANALYTICS) ----------
  if (path === '/api/analytics/track' && method === 'POST') {
    try {
      const data = JSON.parse(body || '{}');
      const pagina = data.pagina || '/';
      const origem = data.origem || 'Direto';
      const dispositivo = data.dispositivo || 'Desktop';
      const estado = data.estado || 'SP';
      const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
      const ipHash = crypto.createHash('md5').update(clientIp).digest('hex').substring(0, 16);

      await pool.execute(
        'INSERT INTO analytics_visitas (pagina, origem, dispositivo, estado, ip_hash) VALUES (?, ?, ?, ?, ?)',
        [pagina, origem, dispositivo, estado, ipHash]
      );
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      res.writeHead(200);
      res.end(JSON.stringify({ success: false }));
    }
    return;
  }

  // ---------- 1.2 ROTA PÚBLICA: DADOS PÚBLICOS DO SITE (ALERTA, DEPOIMENTOS, CONFIGS) ----------
  if (path === '/api/public/site-data' && method === 'GET') {
    try {
      const [configRows] = await pool.execute('SELECT chave, valor FROM site_config');
      const configMap = {};
      configRows.forEach(r => { configMap[r.chave] = r.valor; });

      const [depoimentos] = await pool.execute('SELECT nome, cargo_empresa, foto_url, texto, estrelas FROM depoimentos WHERE ativo = 1 ORDER BY destaque DESC, id DESC LIMIT 6');

      res.writeHead(200);
      res.end(JSON.stringify({
        configs: configMap,
        depoimentos
      }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao carregar dados públicos.' }));
    }
    return;
  }

  // ---------- 1.3 ROTAS PÚBLICAS DO PORTAL NACIONAL: DIREITOS E BENEFÍCIOS ----------
  if (path === '/api/public/direitos' && method === 'GET') {
    try {
      const cat = urlObj.searchParams.get('categoria');
      const q = urlObj.searchParams.get('q');
      let query = 'SELECT id, slug, titulo, categoria, resumo, o_que_e, quem_tem_direito, documentos_necessarios, passo_a_passo, base_legal, orgao_responsavel, link_oficial, icone, destaque FROM direitos_beneficios WHERE 1=1';
      const params = [];
      if (cat && cat !== 'todas') {
        query += ' AND categoria = ?';
        params.push(cat);
      }
      if (q) {
        query += ' AND (titulo LIKE ? OR resumo LIKE ? OR o_que_e LIKE ? OR base_legal LIKE ?)';
        const like = `%${q}%`;
        params.push(like, like, like, like);
      }
      query += ' ORDER BY destaque DESC, id ASC';
      const [rows] = await pool.execute(query, params);
      res.writeHead(200);
      res.end(JSON.stringify(rows));
    } catch (e) {
      console.error('Erro ao buscar direitos:', e);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao carregar catálogo de direitos.' }));
    }
    return;
  }

  if (path.startsWith('/api/public/direitos/') && method === 'GET') {
    try {
      const slug = decodeURIComponent(path.replace('/api/public/direitos/', ''));
      const [rows] = await pool.execute('SELECT * FROM direitos_beneficios WHERE slug = ? OR id = ?', [slug, isNaN(slug) ? -1 : parseInt(slug)]);
      if (rows.length === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Direito não encontrado.' }));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify(rows[0]));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao carregar detalhes do direito.' }));
    }
    return;
  }

  // ---------- 1.4 ROTAS PÚBLICAS: INSTITUIÇÕES DE APOIO E CENTROS DE REABILITAÇÃO ----------
  if (path === '/api/public/instituicoes' && method === 'GET') {
    try {
      const uf = urlObj.searchParams.get('uf');
      const tipo = urlObj.searchParams.get('tipo');
      const q = urlObj.searchParams.get('q');
      let query = 'SELECT * FROM instituicoes_apoio WHERE 1=1';
      const params = [];
      if (uf && uf !== 'todos') {
        query += ' AND (estado = ? OR estado = "Nacional" OR estado = "BR")';
        params.push(uf);
      }
      if (tipo && tipo !== 'todos') {
        query += ' AND tipo = ?';
        params.push(tipo);
      }
      if (q) {
        query += ' AND (nome LIKE ? OR descricao LIKE ? OR cidade LIKE ? OR sigla LIKE ?)';
        const like = `%${q}%`;
        params.push(like, like, like, like);
      }
      query += ' ORDER BY id ASC';
      const [rows] = await pool.execute(query, params);
      res.writeHead(200);
      res.end(JSON.stringify(rows));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao buscar instituições.' }));
    }
    return;
  }

  // ---------- 1.5 ROTAS PÚBLICAS: BIBLIOTECA DE MODELOS E REQUERIMENTOS ----------
  if (path === '/api/public/documentos' && method === 'GET') {
    try {
      const cat = urlObj.searchParams.get('categoria');
      const q = urlObj.searchParams.get('q');
      let query = 'SELECT id, titulo, categoria, descricao, arquivo_url, formato, tamanho, downloads, conteudo_texto FROM documentos_modelos WHERE 1=1';
      const params = [];
      if (cat && cat !== 'todas') {
        query += ' AND categoria = ?';
        params.push(cat);
      }
      if (q) {
        query += ' AND (titulo LIKE ? OR descricao LIKE ?)';
        const like = `%${q}%`;
        params.push(like, like);
      }
      query += ' ORDER BY id ASC';
      const [rows] = await pool.execute(query, params);
      res.writeHead(200);
      res.end(JSON.stringify(rows));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao buscar modelos de documentos.' }));
    }
    return;
  }

  if (path.startsWith('/api/public/documentos/') && method === 'GET') {
    try {
      const docId = decodeURIComponent(path.replace('/api/public/documentos/', ''));
      const [rows] = await pool.execute('SELECT * FROM documentos_modelos WHERE id = ? OR titulo LIKE ?', [isNaN(docId) ? -1 : parseInt(docId), `%${docId}%`]);
      if (rows.length === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Modelo não encontrado.' }));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify(rows[0]));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao carregar modelo de documento.' }));
    }
    return;
  }

  // ---------- 1.6 ROTAS PÚBLICAS: FAQ NACIONAL ----------
  if (path === '/api/public/faq-portal' && method === 'GET') {
    try {
      const cat = urlObj.searchParams.get('categoria');
      let query = 'SELECT * FROM faq_portal WHERE ativo = 1';
      const params = [];
      if (cat && cat !== 'todas') {
        query += ' AND categoria = ?';
        params.push(cat);
      }
      query += ' ORDER BY ordem ASC, id ASC';
      const [rows] = await pool.execute(query, params);
      res.writeHead(200);
      res.end(JSON.stringify(rows));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao buscar FAQ.' }));
    }
    return;
  }

  // ---------- 1.7 ROTAS PÚBLICAS: VAGAS, ARTIGOS E PALESTRAS ----------
  if (path === '/api/public/vagas' && method === 'GET') {
    try {
      const [rows] = await pool.execute('SELECT * FROM vagas_pcd WHERE ativo = 1 ORDER BY id DESC LIMIT 20');
      res.writeHead(200);
      res.end(JSON.stringify(rows));
    } catch (e) {
      console.error('Erro ao buscar vagas:', e);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao buscar vagas.' }));
    }
    return;
  }

  if (path === '/api/public/artigos' && method === 'GET') {
    try {
      const [rows] = await pool.execute("SELECT id, slug, titulo, resumo, autor, categoria, imagem_url, criado_em FROM artigos_blog WHERE status = 'publicado' ORDER BY id DESC LIMIT 12");
      res.writeHead(200);
      res.end(JSON.stringify(rows));
    } catch (e) {
      console.error('Erro ao buscar artigos:', e);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao buscar artigos.' }));
    }
    return;
  }

  if (path === '/api/public/palestras' && method === 'GET') {
    try {
      const [rows] = await pool.execute('SELECT * FROM palestras WHERE ativo = 1 ORDER BY ordem ASC, id ASC');
      res.writeHead(200);
      res.end(JSON.stringify(rows));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao buscar palestras.' }));
    }
    return;
  }

  // ---------- 1.8 FERRAMENTAS INTELIGENTES: SIMULADOR DE BPC/LOAS ----------
  if (path === '/api/ferramentas/simulador-bpc' && method === 'POST') {
    try {
      const data = JSON.parse(body || '{}');
      const rendaBruta = parseFloat(data.renda_total || 0);
      const membros = Math.max(1, parseInt(data.qtd_pessoas || 1));
      const gastosSaude = parseFloat(data.gastos_comprovados || 0);
      const idade = parseInt(data.idade || 0);
      const temDeficiencia = Boolean(data.tem_deficiencia_longo_prazo);
      const temCadUnico = Boolean(data.tem_cadunico);

      const SALARIO_MINIMO = 1412.00;
      const LIMITE_ESTRITO = SALARIO_MINIMO / 4; // R$ 353,00
      const LIMITE_FLEXIBILIZADO = SALARIO_MINIMO / 2; // R$ 706,00 (jurisprudência consolidada STF RE 567.985)

      const rendaLiquida = Math.max(0, rendaBruta - gastosSaude);
      const rendaPerCapita = rendaLiquida / membros;

      const aptoIdade = idade >= 65;
      const aptoDeficiencia = temDeficiencia;
      const aptoPerfil = aptoIdade || aptoDeficiencia;

      const elegivelRendaEstrita = rendaPerCapita <= LIMITE_ESTRITO;
      const elegivelRendaFlex = rendaPerCapita <= LIMITE_FLEXIBILIZADO;

      let status = 'inapto';
      let recomendacao = '';

      if (!aptoPerfil) {
        status = 'perfil_invalido';
        recomendacao = 'O BPC é destinado a pessoas com deficiência de qualquer idade com impedimentos de longo prazo (mínimo de 2 anos) ou idosos com 65 anos ou mais.';
      } else if (elegivelRendaEstrita) {
        status = 'alta_probabilidade';
        recomendacao = `Sua renda familiar líquida per capita calculada é de R$ ${rendaPerCapita.toFixed(2)}, estando dentro do limite estrito da Lei 8.742/93 (até R$ ${LIMITE_ESTRITO.toFixed(2)} por pessoa). Você preenche os critérios objetivos para concessão do BPC/LOAS no valor de 1 salário mínimo mensal (R$ ${SALARIO_MINIMO.toFixed(2)}).`;
      } else if (elegivelRendaFlex) {
        status = 'provavel_com_comprovacao';
        recomendacao = `Sua renda per capita líquida é de R$ ${rendaPerCapita.toFixed(2)}. Embora ultrapasse o 1/4 estrito, está abaixo de 1/2 salário mínimo (R$ ${LIMITE_FLEXIBILIZADO.toFixed(2)}). A jurisprudência pacífica do STF e TNU autoriza a concessão deduzindo gastos contínuos essenciais comprovados com remédios, fraldas e tratamentos médicos não fornecidos pelo SUS.`;
      } else {
        status = 'renda_excedente';
        recomendacao = `Sua renda por pessoa (R$ ${rendaPerCapita.toFixed(2)}) ultrapassa os parâmetros de vulnerabilidade da LOAS. Caso a família tenha custos médicos contínuos elevados comprovados por laudo do SUS, é possível requerer abatimento administrativo ou ação com assistência da Defensoria Pública da União (DPU).`;
      }

      res.writeHead(200);
      res.end(JSON.stringify({
        rendaBruta,
        gastosSaude,
        rendaLiquida,
        membros,
        rendaPerCapita: parseFloat(rendaPerCapita.toFixed(2)),
        limiteEstrito: LIMITE_ESTRITO,
        limiteFlexibilizado: LIMITE_FLEXIBILIZADO,
        salarioMinimo: SALARIO_MINIMO,
        valorBeneficioMensal: SALARIO_MINIMO,
        aptoPerfil,
        temCadUnico,
        status,
        recomendacao,
        proximosPassos: [
          'Cadastrar ou atualizar o CadÚnico no CRAS do seu município (obrigatório)',
          'Reunir laudos médicos detalhados com CID, histórico e relatórios de especialistas',
          'Guardar notas fiscais e receituários de gastos com saúde e medicamentos',
          'Solicitar o benefício pelo portal ou aplicativo "Meu INSS" ou telefone 135',
          'Comparecer à avaliação social e perícia médica do INSS agendadas'
        ]
      }));
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Erro ao processar simulação do BPC.' }));
    }
    return;
  }

  // ---------- 1.9 FERRAMENTAS INTELIGENTES: CALCULADORA DE ISENÇÃO VEICULAR PCD ----------
  if (path === '/api/ferramentas/calculadora-isencao' && method === 'POST') {
    try {
      const data = JSON.parse(body || '{}');
      const valor = parseFloat(data.valor_veiculo || 0);
      const uf = (data.estado_uf || 'SP').toUpperCase();
      const ehCondutor = Boolean(data.eh_condutor !== false);

      const TETO_IPI = 200000.00; // Lei Federal 14.287/2021
      const TETO_ICMS_COMPRA = 120000.00; // Convênio CONFAZ 147/2023
      const TETO_ICMS_ISENCAO = 70000.00; // Parcela isenta
      const ALIQUOTA_MEDIA_IPI = 0.08; // ~8% para veículos flex comuns
      const ALIQUOTA_MEDIA_ICMS = 0.12; // 12% a 14.5% conforme estado
      const ALIQUOTA_IPVA = uf === 'SP' || uf === 'RJ' || uf === 'MG' ? 0.04 : 0.03;

      let elegivelIpi = valor <= TETO_IPI;
      let economiaIpi = elegivelIpi ? valor * ALIQUOTA_MEDIA_IPI : 0;

      let elegivelIcms = valor <= TETO_ICMS_COMPRA;
      let economiaIcms = 0;
      if (elegivelIcms) {
        const baseCalculo = Math.min(valor, TETO_ICMS_ISENCAO);
        economiaIcms = baseCalculo * ALIQUOTA_MEDIA_ICMS;
      }

      let elegivelIpva = valor <= TETO_ICMS_COMPRA;
      let economiaIpvaAnual = elegivelIpva ? Math.min(valor, TETO_ICMS_ISENCAO) * ALIQUOTA_IPVA : 0;
      let economiaTotalPrimeiroAno = economiaIpi + economiaIcms + economiaIpvaAnual;
      let valorFinalEstimado = valor - economiaIpi - economiaIcms;

      res.writeHead(200);
      res.end(JSON.stringify({
        valorOriginal: valor,
        uf,
        ehCondutor,
        tetoIpi: TETO_IPI,
        tetoIcmsCompra: TETO_ICMS_COMPRA,
        tetoIcmsIsencao: TETO_ICMS_ISENCAO,
        elegivelIpi,
        economiaIpi: parseFloat(economiaIpi.toFixed(2)),
        elegivelIcms,
        economiaIcms: parseFloat(economiaIcms.toFixed(2)),
        elegivelIpva,
        economiaIpvaAnual: parseFloat(economiaIpvaAnual.toFixed(2)),
        economiaTotalPrimeiroAno: parseFloat(economiaTotalPrimeiroAno.toFixed(2)),
        valorFinalEstimado: parseFloat(valorFinalEstimado.toFixed(2)),
        observacoes: [
          'Isenção de IPI válida para carros novos de até R$ 200.000,00 (motores até 2.0).',
          'Isenção de ICMS autorizada para carros até R$ 120.000,00, incidindo gratuidade sobre a cota de R$ 70.000,00.',
          'Dispensa do Rodízio Municipal de Veículos aplicável em grandes centros como São Paulo.',
          'Isenção de IPVA deve ser solicitada à Secretaria da Fazenda do seu Estado após o faturamento.'
        ]
      }));
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Erro ao calcular isenções veiculares.' }));
    }
    return;
  }

  // ---------- 1.10 FERRAMENTAS INTELIGENTES: CALCULADORA DE COTAS PCD (LEI 8.213/91) ----------
  if (path === '/api/ferramentas/calculadora-cotas' && method === 'POST') {
    try {
      const data = JSON.parse(body || '{}');
      const totalColaboradores = parseInt(data.total_funcionarios || 0);

      let percentual = 0;
      let faixa = '';

      if (totalColaboradores < 100) {
        percentual = 0;
        faixa = 'Menos de 100 colaboradores (Isento de cota legal obrigatória)';
      } else if (totalColaboradores <= 200) {
        percentual = 0.02;
        faixa = 'De 100 a 200 empregados: 2%';
      } else if (totalColaboradores <= 500) {
        percentual = 0.03;
        faixa = 'De 201 a 500 empregados: 3%';
      } else if (totalColaboradores <= 1000) {
        percentual = 0.04;
        faixa = 'De 501 a 1.000 empregados: 4%';
      } else {
        percentual = 0.05;
        faixa = 'De 1.001 empregados em diante: 5%';
      }

      const vagasObrigatorias = Math.ceil(totalColaboradores * percentual);
      const multaMinimaPorVaga = 3100.00;
      const multaMaximaPorVaga = 31000.00;

      res.writeHead(200);
      res.end(JSON.stringify({
        totalColaboradores,
        percentual: percentual * 100,
        faixa,
        vagasObrigatorias,
        baseLegal: 'Artigo 93 da Lei Federal nº 8.213/1991',
        riscoFiscal: vagasObrigatorias > 0 ? {
          multaEstimadaMinima: vagasObrigatorias * multaMinimaPorVaga,
          multaEstimadaMaxima: vagasObrigatorias * multaMaximaPorVaga,
          aviso: 'O descumprimento da cota gera autuação pelo Ministério do Trabalho e Emprego (MTE) e Termo de Ajustamento de Conduta (TAC) do Ministério Público do Trabalho (MPT).'
        } : null,
        recomendacaoConsultoria: 'Para estruturar seu programa de atração, inclusão real e acessibilidade atitudinal corporativa, conheça as palestras e consultoria de Moisés Souza.'
      }));
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Erro ao calcular cota legal de PcD.' }));
    }
    return;
  }

  // ---------- 1.11 FERRAMENTAS INTELIGENTES: GERADOR DE REQUERIMENTOS E PETIÇÕES ----------
  if (path === '/api/ferramentas/gerador-peticao' && method === 'POST') {
    try {
      const data = JSON.parse(body || '{}');
      const { tipo, nome, cpf, rg, endereco, cidade, uf, cid, detalhes, orgao_ou_empresa } = data;

      if (!nome || !cpf) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Nome e CPF são obrigatórios para emissão do requerimento.' }));
        return;
      }

      const dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      let titulo = '';
      let corpo = '';

      if (tipo === 'apoio_escolar') {
        titulo = 'REQUERIMENTO ADMINISTRATIVO DE PROFISSIONAL DE APOIO ESCOLAR / AEE';
        corpo = `ILUSTRÍSSIMO(A) SENHOR(A) DIRETOR(A) DA INSTITUIÇÃO DE ENSINO: ${orgao_ou_empresa || '[NOME DA ESCOLA / SECRETARIA DE EDUCAÇÃO]'}\n\nREQUERENTE / RESPONSÁVEL LEGAL:\nNome: ${nome}\nCPF: ${cpf} | RG: ${rg || '---'}\nEndereço: ${endereco || '[Endereço completo]'}, ${cidade || '[Cidade]'} - ${uf || '[UF]'}\nDiagnóstico / Condição: ${cid ? `CID: ${cid}` : '[Anexar laudo médico multiprofissional]'}\n\nVenho respeitosamente, com fundamento no Art. 205 e 208, III da Constituição Federal de 1988, e nos Arts. 27 e 28, XVII da Lei Brasileira de Inclusão da Pessoa com Deficiência (Lei nº 13.146/2015), REQUERER:\n\n1. A disponibilização imediata de PROFISSIONAL DE APOIO ESCOLAR e Atendimento Educacional Especializado (AEE), sem qualquer taxa adicional de matrícula ou mensalidade (conforme expressamente vedado pelo Art. 28, § 1º da Lei 13.146/15).\n2. A elaboração do Plano de Desenvolvimento Individualizado (PDI) com adaptação curricular e recursos de tecnologia assistiva.\n\nEspecificidades do educando:\n${detalhes || 'Necessidade de suporte contínuo para locomoção, alimentação, higiene pessoal e mediação pedagógica conforme laudo.'}\n\nNestes termos, pede e aguarda deferimento tempestivo no prazo legal de 10 (dez) dias.\n\n${cidade || 'Localidade'}, ${dataHoje}.\n\n___________________________________________________\n${nome}\nCPF: ${cpf}`;
      } else if (tipo === 'adaptacao_trabalho') {
        titulo = 'REQUERIMENTO DE ADAPTAÇÃO RAZOÁVEL DE POSTO DE TRABALHO E HORÁRIO ESPECIAL';
        corpo = `À DIRETORIA DE RECURSOS HUMANOS DA EMPRESA: ${orgao_ou_empresa || '[NOME DA EMPRESA]'}\n\nCOLABORADOR(A):\nNome: ${nome}\nCPF: ${cpf} | RG: ${rg || '---'}\nEndereço: ${endereco || '[Endereço completo]'}, ${cidade || '[Cidade]'} - ${uf || '[UF]'}\n\nCom amparo no Art. 34, § 2º e Art. 37 da Lei Brasileira de Inclusão (Lei Federal nº 13.146/2015) e na Convenção da ONU sobre Direitos das Pessoas com Deficiência (Decreto nº 6.949/2009), venho solicitar formalmente a ADAPTAÇÃO RAZOÁVEL DO POSTO DE TRABALHO:\n\nNecessidades específicas solicitadas:\n${detalhes || 'Adequação ergonômica, ferramentas de tecnologia assistiva acessíveis e flexibilidade de escala/teletrabalho para acompanhamento de sessões terapêuticas contínuas.'}\n\nRessalta-se que a recusa injustificada de adaptações razoáveis configura discriminação em razão de deficiência nos termos do Art. 4º, § 1º da Lei 13.146/2015.\n\nTermos em que pede deferimento.\n\n${cidade || 'Localidade'}, ${dataHoje}.\n\n___________________________________________________\n${nome}\nCPF: ${cpf}`;
      } else {
        titulo = 'RECURSO ADMINISTRATIVO CONTRA INDEFERIMENTO DE BENEFÍCIO';
        corpo = `À JUNTA DE RECURSOS DA PREVIDÊNCIA SOCIAL (CRPS) / ÓRGÃO COMPETENTE\nÓrgão Destino: ${orgao_ou_empresa || 'Instituto Nacional do Seguro Social - INSS'}\n\nRECORRENTE:\nNome: ${nome}\nCPF: ${cpf} | RG: ${rg || '---'}\nEndereço: ${endereco || '[Endereço completo]'}, ${cidade || '[Cidade]'} - ${uf || '[UF]'}\n\nVem respeitosamente interpor o presente RECURSO ORDINÁRIO contra a decisão administrativa de indeferimento, expondo e requerendo o quanto segue:\n\n1. DA VULNERABILIDADE E IMPEDIMENTO DE LONGO PRAZO:\nO(a) Recorrente é pessoa com impedimento de longo prazo de natureza física, mental, intelectual ou sensorial (CID: ${cid || '[CID conforme laudo]'}), o qual obstrui sua participação plena e efetiva na sociedade em igualdade de condições (Art. 2º da Lei 13.146/15).\n\n2. DOS MOTIVOS DA REFORMA:\n${detalhes || 'A avaliação desconsiderou os gastos contínuos essenciais com medicamentos e tratamentos indispensáveis à subsistência, reduzindo a renda líquida real a patamar inferior ao critério de vulnerabilidade do STF (RE 567.985).'}\n\n3. DO PEDIDO:\nRequer-se a reconsideração da decisão para DEFERIMENTO INTEGRAL do benefício com pagamento dos valores retroativos desde a Data de Entrada do Requerimento (DER).\n\nPede e espera deferimento.\n\n${cidade || 'Localidade'}, ${dataHoje}.\n\n___________________________________________________\n${nome}\nCPF: ${cpf}`;
      }

      res.writeHead(200);
      res.end(JSON.stringify({
        titulo,
        documentoTexto: corpo,
        geradoEm: new Date().toISOString()
      }));
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Erro ao gerar documento.' }));
    }
    return;
  }

  // ---------- 2. ROTA PÚBLICA: LOGIN DO ADMINISTRADOR ----------
  if (path === '/api/admin/login' && method === 'POST') {
    try {
      cleanupExpiredRateLimits(); // Limpeza oportunística em background
      const clientIp = getTrustedClientIp(req);
      const rateCheck = await consumeDistributedRateLimit(clientIp, 'admin_login', 5, 15, 15, true);
      if (rateCheck.failClosed) {
        res.writeHead(503);
        res.end(JSON.stringify({
          error: 'Serviço de autenticação temporariamente indisponível para proteção do sistema. Tente novamente mais tarde.'
        }));
        return;
      }
      if (!rateCheck.allowed) {
        res.writeHead(429);
        res.end(JSON.stringify({
          error: `Muitas tentativas incorretas de login. Acesso bloqueado temporariamente por ${rateCheck.remainingSeconds} segundos.`
        }));
        return;
      }

      const bodyData = JSON.parse(body || '{}');
      const loginIdentifier = (bodyData.usuario || bodyData.email || '').trim();
      const senha = bodyData.senha || '';

      if (!loginIdentifier || !senha) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Informe usuário/e-mail e senha.' }));
        return;
      }

      const [rows] = await pool.execute(
        `SELECT id, nome, username, email, cargo, role, senha_hash 
         FROM admin_users 
         WHERE (username = ? OR email = ? OR (? = 'admin' AND id = 1)) 
           AND ativo = 1`,
        [loginIdentifier, loginIdentifier, loginIdentifier]
      );

      if (rows.length === 0) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Usuário ou senha incorretos.' }));
        return;
      }

      const candidateUser = rows[0];
      const match = await verifyPassword(senha, candidateUser.senha_hash);

      if (!match) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Usuário ou senha incorretos.' }));
        return;
      }

      // Login com sucesso: reseta tentativas e grava auditoria
      await clearDistributedRateLimit(clientIp, 'admin_login');

      // Se era hash legado SHA-256, atualiza em tempo de execução para Bcrypt
      if (match === 'legacy_match') {
        const newBcrypt = await hashPassword(senha);
        await pool.execute('UPDATE admin_users SET senha_hash = ? WHERE id = ?', [newBcrypt, candidateUser.id]);
      }

      const user = {
        id: candidateUser.id,
        nome: candidateUser.nome,
        username: candidateUser.username,
        email: candidateUser.email,
        cargo: candidateUser.cargo,
        role: candidateUser.role
      };

      const token = generateToken();
      SESSIONS.set(token, { user, timestamp: Date.now() });

      // Atualiza último login
      await pool.execute('UPDATE admin_users SET ultimo_login = NOW() WHERE id = ?', [user.id]);
      logAudit(user.username, 'Login no Painel', 'Autenticação', `Acesso autorizado para ${user.nome}`, clientIp);

      res.writeHead(200);
      res.end(JSON.stringify({ success: true, token, user }));
    } catch (err) {
      console.error('Erro no login:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro no servidor durante o login.' }));
    }
    return;
  }

  // ---------- 3. CHECK DE SESSÃO ----------
  if (path === '/api/admin/check' && method === 'GET') {
    const user = verifyAuth(req);
    if (!user) {
      res.writeHead(401);
      res.end(JSON.stringify({ authenticated: false }));
      return;
    }
    res.writeHead(200);
    res.end(JSON.stringify({ authenticated: true, user }));
    return;
  }

  // ---------- 4. LOGOUT ----------
  if (path === '/api/admin/logout' && method === 'POST') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (token) SESSIONS.delete(token);
    res.writeHead(200);
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Todas as rotas abaixo requerem AUTENTICAÇÃO
  const authUser = verifyAuth(req);
  if (!authUser) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Não autorizado. Faça login novamente.' }));
    return;
  }

  // ---------- 4.1 TELEMETRIA DE INFRAESTRUTURA (RESTRITA A ADMIN) ----------
  if (path === '/api/admin/health' && method === 'GET') {
    if (authUser.role !== 'admin') {
      res.writeHead(403);
      res.end(JSON.stringify({ error: 'Acesso negado: Requer privilégios de Administrador.' }));
      return;
    }
    const startTime = Date.now();
    let dbStatus = 'ok';
    let dbLatencyMs = 0;
    try {
      await pool.execute('SELECT 1 + 1 AS check_val');
      dbLatencyMs = Date.now() - startTime;
    } catch (e) {
      dbStatus = 'degraded';
    }

    const uptimeSeconds = Math.floor(process.uptime());
    const memUsage = process.memoryUsage();

    res.writeHead(dbStatus === 'ok' ? 200 : 503);
    res.end(JSON.stringify({
      status: dbStatus === 'ok' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        provider: 'StackCP MySQL'
      },
      memory: {
        rssMb: Math.round(memUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024)
      },
      activeSessions: SESSIONS.size
    }));
    return;
  }

  // ---------- 5. ESTATÍSTICAS DO DASHBOARD ----------
  if (path === '/api/admin/stats' && method === 'GET') {
    try {
      const [[leadsTotal]] = await pool.execute('SELECT COUNT(*) AS total FROM leads');
      const [[leadsNovos]] = await pool.execute("SELECT COUNT(*) AS total FROM leads WHERE status = 'novo'");
      const [[leadsEmContato]] = await pool.execute("SELECT COUNT(*) AS total FROM leads WHERE status = 'em_contato'");
      const [[leadsFechados]] = await pool.execute("SELECT COUNT(*) AS total FROM leads WHERE status = 'fechado'");
      const [[palestrasTotal]] = await pool.execute('SELECT COUNT(*) AS total FROM palestras WHERE ativo = 1');
      const [[vagasTotal]] = await pool.execute('SELECT COUNT(*) AS total FROM vagas_pcd WHERE ativo = 1');
      const [[depoimentosTotal]] = await pool.execute('SELECT COUNT(*) AS total FROM depoimentos WHERE ativo = 1');
      const [[artigosTotal]] = await pool.execute("SELECT COUNT(*) AS total FROM artigos_blog WHERE status = 'publicado'");
      const [[visitasTotal]] = await pool.execute('SELECT COUNT(*) AS total FROM analytics_visitas');
      const [[visitasHoje]] = await pool.execute('SELECT COUNT(*) AS total FROM analytics_visitas WHERE DATE(criado_em) = CURDATE()');
      const [[usuariosTotal]] = await pool.execute('SELECT COUNT(*) AS total FROM admin_users WHERE ativo = 1');

      res.writeHead(200);
      res.end(JSON.stringify({
        totalLeads: leadsTotal.total || 0,
        leadsNovos: leadsNovos.total || 0,
        leadsEmContato: leadsEmContato.total || 0,
        leadsFechados: leadsFechados.total || 0,
        totalPalestras: palestrasTotal.total || 0,
        totalVagas: vagasTotal.total || 0,
        totalDepoimentos: depoimentosTotal.total || 0,
        totalArtigos: artigosTotal.total || 0,
        totalVisitas: visitasTotal.total || 0,
        visitasHoje: visitasHoje.total || 0,
        totalUsuarios: usuariosTotal.total || 0
      }));
    } catch (err) {
      console.error('Erro em stats:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao carregar estatísticas.' }));
    }
    return;
  }

  // ---------- 6. LEADS (LISTAR, ATUALIZAR, EXCLUIR) ----------
  if (path === '/api/admin/leads') {
    if (method === 'GET') {
      try {
        const statusFilter = urlObj.searchParams.get('status');
        let query = 'SELECT * FROM leads';
        const params = [];

        if (statusFilter && statusFilter !== 'todos') {
          query += ' WHERE status = ?';
          params.push(statusFilter);
        }
        query += ' ORDER BY criado_em DESC';

        const [rows] = await pool.execute(query, params);
        res.writeHead(200);
        res.end(JSON.stringify(rows));
      } catch (err) {
        console.error('Erro ao listar leads:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao buscar leads.' }));
      }
      return;
    }
  }

  const matchLeadId = path.match(/^\/api\/admin\/leads\/(\d+)$/);
  if (matchLeadId) {
    const leadId = matchLeadId[1];

    if (method === 'PUT') {
      try {
        const { status, notas_internas } = JSON.parse(body || '{}');
        await pool.execute(
          'UPDATE leads SET status = COALESCE(?, status), notas_internas = COALESCE(?, notas_internas) WHERE id = ?',
          [status, notas_internas, leadId]
        );
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Lead atualizado!' }));
      } catch (err) {
        console.error('Erro ao atualizar lead:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao atualizar lead.' }));
      }
      return;
    }

    if (method === 'DELETE') {
      try {
        await pool.execute('DELETE FROM leads WHERE id = ?', [leadId]);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Lead removido com sucesso.' }));
      } catch (err) {
        console.error('Erro ao excluir lead:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao excluir lead.' }));
      }
      return;
    }
  }

  // ---------- 7. PALESTRAS (LISTAR, CRIAR, ATUALIZAR, EXCLUIR) ----------
  if (path === '/api/admin/palestras') {
    if (method === 'GET') {
      try {
        const [rows] = await pool.execute('SELECT * FROM palestras ORDER BY ordem ASC, id DESC');
        res.writeHead(200);
        res.end(JSON.stringify(rows));
      } catch (err) {
        console.error('Erro ao listar palestras:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao listar palestras.' }));
      }
      return;
    }

    if (method === 'POST') {
      try {
        const { titulo, categoria, cliente_empresa, imagem_url, destaque, ordem } = JSON.parse(body || '{}');
        if (!titulo || !imagem_url) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Título e URL da imagem são obrigatórios.' }));
          return;
        }

        const [result] = await pool.execute(
          `INSERT INTO palestras (titulo, categoria, cliente_empresa, imagem_url, destaque, ordem, ativo) 
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [titulo, categoria || 'Corporativo', cliente_empresa || '', imagem_url, destaque ? 1 : 0, ordem || 0]
        );
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, id: result.insertId }));
      } catch (err) {
        console.error('Erro ao criar palestra:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao cadastrar palestra.' }));
      }
      return;
    }
  }

  const matchPalestraId = path.match(/^\/api\/admin\/palestras\/(\d+)$/);
  if (matchPalestraId) {
    const palId = matchPalestraId[1];

    if (method === 'PUT') {
      try {
        const data = JSON.parse(body || '{}');
        await pool.execute(
          `UPDATE palestras SET 
            titulo = COALESCE(?, titulo),
            categoria = COALESCE(?, categoria),
            cliente_empresa = COALESCE(?, cliente_empresa),
            imagem_url = COALESCE(?, imagem_url),
            destaque = COALESCE(?, destaque),
            ordem = COALESCE(?, ordem),
            ativo = COALESCE(?, ativo)
           WHERE id = ?`,
          [data.titulo, data.categoria, data.cliente_empresa, data.imagem_url, data.destaque, data.ordem, data.ativo, palId]
        );
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Erro ao editar palestra:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao atualizar palestra.' }));
      }
      return;
    }

    if (method === 'DELETE') {
      try {
        await pool.execute('DELETE FROM palestras WHERE id = ?', [palId]);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Erro ao excluir palestra:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao excluir palestra.' }));
      }
      return;
    }
  }

  // ---------- 8. VAGAS PCD (LISTAR, CRIAR, EDITAR, EXCLUIR) ----------
  if (path === '/api/admin/vagas') {
    if (method === 'GET') {
      try {
        const [rows] = await pool.execute('SELECT * FROM vagas_pcd ORDER BY id DESC');
        res.writeHead(200);
        res.end(JSON.stringify(rows));
      } catch (err) {
        console.error('Erro ao listar vagas:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao listar vagas.' }));
      }
      return;
    }

    if (method === 'POST') {
      try {
        const { titulo, empresa, localizacao, modalidade, tipo_contrato, descricao, link_candidatura } = JSON.parse(body || '{}');
        if (!titulo || !empresa) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Título e empresa são obrigatórios.' }));
          return;
        }

        const [result] = await pool.execute(
          `INSERT INTO vagas_pcd (titulo, empresa, localizacao, modalidade, tipo_contrato, descricao, link_candidatura, ativo)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [titulo, empresa, localizacao || 'Remoto', modalidade || 'hibrido', tipo_contrato || 'CLT', descricao || '', link_candidatura || '']
        );
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, id: result.insertId }));
      } catch (err) {
        console.error('Erro ao criar vaga:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao salvar vaga.' }));
      }
      return;
    }
  }

  const matchVagaId = path.match(/^\/api\/admin\/vagas\/(\d+)$/);
  if (matchVagaId) {
    const vagaId = matchVagaId[1];

    if (method === 'PUT') {
      try {
        const data = JSON.parse(body || '{}');
        await pool.execute(
          `UPDATE vagas_pcd SET
            titulo = COALESCE(?, titulo),
            empresa = COALESCE(?, empresa),
            localizacao = COALESCE(?, localizacao),
            modalidade = COALESCE(?, modalidade),
            tipo_contrato = COALESCE(?, tipo_contrato),
            descricao = COALESCE(?, descricao),
            link_candidatura = COALESCE(?, link_candidatura),
            ativo = COALESCE(?, ativo)
           WHERE id = ?`,
          [data.titulo, data.empresa, data.localizacao, data.modalidade, data.tipo_contrato, data.descricao, data.link_candidatura, data.ativo, vagaId]
        );
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Erro ao editar vaga:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao atualizar vaga.' }));
      }
      return;
    }

    if (method === 'DELETE') {
      try {
        await pool.execute('DELETE FROM vagas_pcd WHERE id = ?', [vagaId]);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Erro ao excluir vaga:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao excluir vaga.' }));
      }
      return;
    }
  }

  // ---------- 9. CONFIGURAÇÕES GERAIS ----------
  if (path === '/api/admin/config') {
    if (method === 'GET') {
      try {
        const [rows] = await pool.execute('SELECT chave, valor, descricao FROM site_config');
        const configMap = {};
        rows.forEach(r => { configMap[r.chave] = r.valor; });
        res.writeHead(200);
        res.end(JSON.stringify(configMap));
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao ler configurações.' }));
      }
      return;
    }

    if (method === 'POST') {
      try {
        if (authUser.role !== 'admin') {
          res.writeHead(403);
          res.end(JSON.stringify({ error: 'Acesso negado: Apenas administradores podem modificar configurações.' }));
          return;
        }

        const configs = JSON.parse(body || '{}');
        for (const [chave, valor] of Object.entries(configs)) {
          await pool.execute(
            'INSERT INTO site_config (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)',
            [chave, String(valor)]
          );
        }
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Configurações salvas!' }));
      } catch (err) {
        console.error('Erro ao salvar configurações:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao salvar configurações.' }));
      }
      return;
    }
  }

  // ---------- 10. TROCAR SENHA ----------
  if (path === '/api/admin/change-password' && method === 'POST') {
    try {
      const { senhaAtual, novaSenha } = JSON.parse(body || '{}');
      if (!senhaAtual || !novaSenha || novaSenha.length < 6) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'A nova senha deve ter no mínimo 6 caracteres.' }));
        return;
      }

      const [rows] = await pool.execute(
        'SELECT id, senha_hash FROM admin_users WHERE id = ?',
        [authUser.id]
      );

      if (rows.length === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Usuário não encontrado.' }));
        return;
      }

      const match = await verifyPassword(senhaAtual, rows[0].senha_hash);
      if (!match) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Senha atual incorreta.' }));
        return;
      }

      const novaHash = await hashPassword(novaSenha);
      await pool.execute('UPDATE admin_users SET senha_hash = ? WHERE id = ?', [novaHash, authUser.id]);
      logAudit(authUser.username, 'Alteração de Senha', 'Autenticação', 'Senha própria atualizada com sucesso', req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1');

      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: 'Senha atualizada com sucesso com criptografia Bcrypt!' }));
    } catch (e) {
      console.error('Erro ao alterar senha:', e);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao alterar senha.' }));
    }
    return;
  }

  // ---------- 11. GESTÃO DE USUÁRIOS E PERMISSÕES ----------
  if (path === '/api/admin/users') {
    if (method === 'GET') {
      try {
        if (authUser.role !== 'admin') {
          res.writeHead(403);
          res.end(JSON.stringify({ error: 'Acesso negado: Listagem de usuários restrita a administradores.' }));
          return;
        }

        const [rows] = await pool.execute(
          'SELECT id, nome, username, email, cargo, role, ativo, ultimo_login, criado_em FROM admin_users ORDER BY id ASC'
        );
        res.writeHead(200);
        res.end(JSON.stringify(rows));
      } catch (err) {
        console.error('Erro ao listar usuários:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao buscar usuários.' }));
      }
      return;
    }

    if (method === 'POST') {
      try {
        if (authUser.role !== 'admin') {
          res.writeHead(403);
          res.end(JSON.stringify({ error: 'Acesso negado: Apenas administradores podem cadastrar novos usuários.' }));
          return;
        }

        const { nome, username, email, senha, cargo, role } = JSON.parse(body || '{}');
        const cleanUser = (username || '').trim().toLowerCase();
        const cleanEmail = (email || '').trim().toLowerCase();

        if (!nome || !cleanUser || !cleanEmail || !senha) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Nome, usuário, e-mail e senha são obrigatórios.' }));
          return;
        }

        if (senha.length < 6) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'A senha deve conter no mínimo 6 caracteres.' }));
          return;
        }

        // Verifica se já existe username ou email
        const [existing] = await pool.execute(
          'SELECT id FROM admin_users WHERE username = ? OR email = ?',
          [cleanUser, cleanEmail]
        );
        if (existing.length > 0) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Já existe um usuário cadastrado com este nome de usuário ou e-mail.' }));
          return;
        }

        const validRoles = ['admin', 'moderador', 'consultor', 'editor'];
        const userRole = validRoles.includes(role) ? role : 'moderador';
        const userCargo = cargo || (userRole === 'admin' ? 'Administrador' : userRole === 'moderador' ? 'Moderador' : userRole === 'consultor' ? 'Consultor PcD' : 'Editor');
        const senhaHash = await hashPassword(senha);

        const [result] = await pool.execute(
          `INSERT INTO admin_users (nome, username, email, senha_hash, cargo, role, ativo) 
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [nome.trim(), cleanUser, cleanEmail, senhaHash, userCargo, userRole]
        );

        res.writeHead(201);
        res.end(JSON.stringify({ success: true, message: 'Usuário cadastrado com sucesso!', id: result.insertId }));
      } catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro interno ao salvar usuário.' }));
      }
      return;
    }
  }

  const matchUserId = path.match(/^\/api\/admin\/users\/(\d+)$/);
  if (matchUserId) {
    const targetUserId = parseInt(matchUserId[1], 10);

    if (authUser.role !== 'admin') {
      res.writeHead(403);
      res.end(JSON.stringify({ error: 'Acesso negado: Requer privilégios de Administrador.' }));
      return;
    }

    if (method === 'PUT') {
      try {
        const { nome, username, email, cargo, role, ativo, novaSenha } = JSON.parse(body || '{}');
        const updates = [];
        const params = [];

        if (nome) { updates.push('nome = ?'); params.push(nome.trim()); }
        if (username) { updates.push('username = ?'); params.push(username.trim().toLowerCase()); }
        if (email) { updates.push('email = ?'); params.push(email.trim().toLowerCase()); }
        if (cargo) { updates.push('cargo = ?'); params.push(cargo.trim()); }
        if (role) { updates.push('role = ?'); params.push(role); }
        if (typeof ativo !== 'undefined') { updates.push('ativo = ?'); params.push(ativo ? 1 : 0); }
        if (novaSenha && novaSenha.length >= 6) {
          updates.push('senha_hash = ?');
          params.push(await hashPassword(novaSenha));
        }

        if (updates.length > 0) {
          params.push(targetUserId);
          await pool.execute(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`, params);
        }

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Usuário atualizado com sucesso!' }));
      } catch (err) {
        console.error('Erro ao editar usuário:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao salvar alterações do usuário.' }));
      }
      return;
    }

    if (method === 'DELETE') {
      try {
        if (targetUserId === 1) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'O administrador principal (ID 1) não pode ser excluído.' }));
          return;
        }
        if (targetUserId === authUser.id) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Você não pode excluir sua própria conta.' }));
          return;
        }

        await pool.execute('DELETE FROM admin_users WHERE id = ?', [targetUserId]);
        logAudit(authUser.username, 'Excluir Usuário', 'Usuários', `Usuário ID #${targetUserId} removido`, req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1');
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Usuário removido com sucesso.' }));
      } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao remover usuário.' }));
      }
      return;
    }
  }

  // ---------- 12. ANALYTICS & TRÁFEGO DETALHADO ----------
  if (path === '/api/admin/analytics' && method === 'GET') {
    try {
      const [[totalVisitas]] = await pool.execute('SELECT COUNT(*) AS total FROM analytics_visitas');
      const [[visitasHoje]] = await pool.execute('SELECT COUNT(*) AS total FROM analytics_visitas WHERE DATE(criado_em) = CURDATE()');
      const [[visitasMes]] = await pool.execute('SELECT COUNT(*) AS total FROM analytics_visitas WHERE MONTH(criado_em) = MONTH(CURDATE()) AND YEAR(criado_em) = YEAR(CURDATE())');
      const [porDispositivo] = await pool.execute('SELECT dispositivo, COUNT(*) AS total FROM analytics_visitas GROUP BY dispositivo');
      const [porOrigem] = await pool.execute('SELECT origem, COUNT(*) AS total FROM analytics_visitas GROUP BY origem ORDER BY total DESC LIMIT 6');
      const [porPagina] = await pool.execute('SELECT pagina, COUNT(*) AS total FROM analytics_visitas GROUP BY pagina ORDER BY total DESC LIMIT 6');
      const [porEstado] = await pool.execute('SELECT estado, COUNT(*) AS total FROM analytics_visitas GROUP BY estado ORDER BY total DESC LIMIT 8');

      res.writeHead(200);
      res.end(JSON.stringify({
        totalVisitas: totalVisitas.total || 0,
        visitasHoje: visitasHoje.total || 0,
        visitasMes: visitasMes.total || 0,
        porDispositivo,
        porOrigem,
        porPagina,
        porEstado
      }));
    } catch (err) {
      console.error('Erro em analytics:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao carregar dados de tráfego.' }));
    }
    return;
  }

  // ---------- 13. DEPOIMENTOS & CASOS DE SUCESSO ----------
  if (path === '/api/admin/depoimentos') {
    if (method === 'GET') {
      try {
        const [rows] = await pool.execute('SELECT * FROM depoimentos ORDER BY destaque DESC, id DESC');
        res.writeHead(200);
        res.end(JSON.stringify(rows));
      } catch (err) {
        console.error('Erro ao listar depoimentos:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao buscar depoimentos.' }));
      }
      return;
    }

    if (method === 'POST') {
      try {
        const data = JSON.parse(body || '{}');
        const { nome, cargo_empresa, foto_url, texto, estrelas, destaque, ativo } = data;
        if (!nome || !texto) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Nome e texto são obrigatórios.' }));
          return;
        }

        const [result] = await pool.execute(
          `INSERT INTO depoimentos (nome, cargo_empresa, foto_url, texto, estrelas, destaque, ativo)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [nome.trim(), cargo_empresa || 'Cliente Corporativo', foto_url || 'assets/images/depoimentos/default.jpg', texto.trim(), parseInt(estrelas || 5, 10), destaque ? 1 : 0, typeof ativo === 'undefined' ? 1 : (ativo ? 1 : 0)]
        );

        logAudit(authUser.username, 'Novo Depoimento', 'Depoimentos', `Depoimento de ${nome} cadastrado`, req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1');

        res.writeHead(201);
        res.end(JSON.stringify({ success: true, message: 'Depoimento adicionado!', id: result.insertId }));
      } catch (err) {
        console.error('Erro ao cadastrar depoimento:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao cadastrar depoimento.' }));
      }
      return;
    }
  }

  const matchDepId = path.match(/^\/api\/admin\/depoimentos\/(\d+)$/);
  if (matchDepId) {
    const depId = matchDepId[1];

    if (method === 'PUT') {
      try {
        const data = JSON.parse(body || '{}');
        const updates = [];
        const params = [];

        if (typeof data.nome !== 'undefined') { updates.push('nome = ?'); params.push(data.nome.trim()); }
        if (typeof data.cargo_empresa !== 'undefined') { updates.push('cargo_empresa = ?'); params.push(data.cargo_empresa.trim()); }
        if (typeof data.foto_url !== 'undefined') { updates.push('foto_url = ?'); params.push(data.foto_url.trim()); }
        if (typeof data.texto !== 'undefined') { updates.push('texto = ?'); params.push(data.texto.trim()); }
        if (typeof data.estrelas !== 'undefined') { updates.push('estrelas = ?'); params.push(parseInt(data.estrelas, 10)); }
        if (typeof data.destaque !== 'undefined') { updates.push('destaque = ?'); params.push(data.destaque ? 1 : 0); }
        if (typeof data.ativo !== 'undefined') { updates.push('ativo = ?'); params.push(data.ativo ? 1 : 0); }

        if (updates.length > 0) {
          params.push(depId);
          await pool.execute(`UPDATE depoimentos SET ${updates.join(', ')} WHERE id = ?`, params);
        }

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Depoimento atualizado!' }));
      } catch (err) {
        console.error('Erro ao atualizar depoimento:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao atualizar depoimento.' }));
      }
      return;
    }

    if (method === 'DELETE') {
      try {
        await pool.execute('DELETE FROM depoimentos WHERE id = ?', [depId]);
        logAudit(authUser.username, 'Excluir Depoimento', 'Depoimentos', `Depoimento ID #${depId} removido`, req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1');
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Depoimento removido com sucesso!' }));
      } catch (err) {
        console.error('Erro ao excluir depoimento:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao remover depoimento.' }));
      }
      return;
    }
  }

  // ---------- 14. ARTIGOS & BLOG DE CONSCIENTIZAÇÃO PCD ----------
  if (path === '/api/admin/artigos') {
    if (method === 'GET') {
      try {
        const [rows] = await pool.execute('SELECT * FROM artigos_blog ORDER BY id DESC');
        res.writeHead(200);
        res.end(JSON.stringify(rows));
      } catch (err) {
        console.error('Erro ao listar artigos:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao buscar artigos.' }));
      }
      return;
    }

    if (method === 'POST') {
      try {
        const data = JSON.parse(body || '{}');
        const { titulo, categoria, resumo, conteudo, autor, imagem_url, status } = data;
        if (!titulo) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'O título do artigo é obrigatório.' }));
          return;
        }

        const slug = titulo.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);

        const [result] = await pool.execute(
          `INSERT INTO artigos_blog (titulo, slug, categoria, resumo, conteudo, autor, imagem_url, status, visualizacoes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          [titulo.trim(), slug, categoria || 'Inclusão & Direitos', resumo || null, conteudo || null, autor || authUser.nome || 'Moisés Souza', imagem_url || 'assets/images/blog/default.jpg', status || 'publicado']
        );

        logAudit(authUser.username, 'Novo Artigo Blog', 'Blog', `Artigo "${titulo}" publicado`, req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1');

        res.writeHead(201);
        res.end(JSON.stringify({ success: true, message: 'Artigo publicado com sucesso!', id: result.insertId }));
      } catch (err) {
        console.error('Erro ao cadastrar artigo:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao cadastrar artigo.' }));
      }
      return;
    }
  }

  const matchArtId = path.match(/^\/api\/admin\/artigos\/(\d+)$/);
  if (matchArtId) {
    const artId = matchArtId[1];

    if (method === 'PUT') {
      try {
        const data = JSON.parse(body || '{}');
        const updates = [];
        const params = [];

        if (data.titulo) { updates.push('titulo = ?'); params.push(data.titulo.trim()); }
        if (data.categoria) { updates.push('categoria = ?'); params.push(data.categoria.trim()); }
        if (typeof data.resumo !== 'undefined') { updates.push('resumo = ?'); params.push(data.resumo.trim()); }
        if (typeof data.conteudo !== 'undefined') { updates.push('conteudo = ?'); params.push(data.conteudo); }
        if (data.autor) { updates.push('autor = ?'); params.push(data.autor.trim()); }
        if (data.imagem_url) { updates.push('imagem_url = ?'); params.push(data.imagem_url.trim()); }
        if (data.status) { updates.push('status = ?'); params.push(data.status); }

        if (updates.length > 0) {
          params.push(artId);
          await pool.execute(`UPDATE artigos_blog SET ${updates.join(', ')} WHERE id = ?`, params);
        }

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Artigo atualizado!' }));
      } catch (err) {
        console.error('Erro ao atualizar artigo:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao atualizar artigo.' }));
      }
      return;
    }

    if (method === 'DELETE') {
      try {
        await pool.execute('DELETE FROM artigos_blog WHERE id = ?', [artId]);
        logAudit(authUser.username, 'Excluir Artigo Blog', 'Blog', `Artigo ID #${artId} excluído`, req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1');
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Artigo excluído com sucesso!' }));
      } catch (err) {
        console.error('Erro ao excluir artigo:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao remover artigo.' }));
      }
      return;
    }
  }

  // ---------- 15. AUDITORIA & LOGS DO SISTEMA ----------
  if (path === '/api/admin/audit-logs' && method === 'GET') {
    try {
      if (authUser.role !== 'admin') {
        res.writeHead(403);
        res.end(JSON.stringify({ error: 'Acesso negado: Visualização de logs de auditoria restrita a administradores.' }));
        return;
      }

      const [rows] = await pool.execute('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100');
      res.writeHead(200);
      res.end(JSON.stringify(rows));
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao buscar logs de auditoria.' }));
    }
    return;
  }

  // ---------- 16. EXPORTAÇÃO DE DADOS (CSV & BACKUP JSON) ----------
  if (path === '/api/admin/export/leads' && method === 'GET') {
    try {
      const [rows] = await pool.execute('SELECT id, nome, empresa, cargo, email, telefone, servico_interesse, status, criado_em FROM leads ORDER BY id DESC');
      let csv = 'ID;Nome;Empresa;Cargo;Email;Telefone;Serviço;Status;Data\n';
      rows.forEach(r => {
        csv += `"${r.id}";"${r.nome || ''}";"${r.empresa || ''}";"${r.cargo || ''}";"${r.email || ''}";"${r.telefone || ''}";"${r.servico_interesse || ''}";"${r.status || ''}";"${r.criado_em || ''}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="leads_jtpcd.csv"');
      res.writeHead(200);
      res.end('\uFEFF' + csv);
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao exportar leads.' }));
    }
    return;
  }

  if (path === '/api/admin/export/vagas' && method === 'GET') {
    try {
      const [rows] = await pool.execute('SELECT id, titulo, empresa, localizacao, modalidade, link_candidatura, ativo, criado_em FROM vagas_pcd ORDER BY id DESC');
      let csv = 'ID;Título;Empresa;Localização;Modalidade;Link;Ativo;Data\n';
      rows.forEach(r => {
        csv += `"${r.id}";"${r.titulo || ''}";"${r.empresa || ''}";"${r.localizacao || ''}";"${r.modalidade || ''}";"${r.link_candidatura || ''}";"${r.ativo ? 'Sim' : 'Não'}";"${r.criado_em || ''}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="vagas_pcd.csv"');
      res.writeHead(200);
      res.end('\uFEFF' + csv);
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao exportar vagas.' }));
    }
    return;
  }

  if (path === '/api/admin/export/backup' && method === 'GET') {
    try {
      if (authUser.role !== 'admin') {
        res.writeHead(403);
        res.end(JSON.stringify({ error: 'Acesso negado: Exportação de backup restrita a administradores.' }));
        return;
      }

      const [leads] = await pool.execute('SELECT * FROM leads');
      const [palestras] = await pool.execute('SELECT * FROM palestras');
      const [vagas] = await pool.execute('SELECT * FROM vagas_pcd');
      const [depoimentos] = await pool.execute('SELECT * FROM depoimentos');
      const [artigos] = await pool.execute('SELECT * FROM artigos_blog');
      const [configs] = await pool.execute('SELECT * FROM site_config');

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="backup_jtpcd.json"');
      res.writeHead(200);
      res.end(JSON.stringify({
        geradoEm: new Date().toISOString(),
        leads,
        palestras,
        vagas,
        depoimentos,
        artigos,
        configs
      }, null, 2));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao gerar backup.' }));
    }
    return;
  }

  // ---------- 17. ADMIN: GESTÃO DE DIREITOS E BENEFÍCIOS ----------
  if (path === '/api/admin/direitos') {
    if (method === 'GET') {
      try {
        const [rows] = await pool.execute('SELECT * FROM direitos_beneficios ORDER BY destaque DESC, ordem ASC, id DESC');
        res.writeHead(200);
        res.end(JSON.stringify(rows));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao listar direitos.' }));
      }
      return;
    }

    if (method === 'POST') {
      try {
        const data = JSON.parse(body || '{}');
        const { slug, titulo, categoria, resumo, base_legal, requisitos, passo_a_passo, links_oficiais, icon_class, badge, destaque, ordem } = data;
        const [result] = await pool.execute(
          `INSERT INTO direitos_beneficios (slug, titulo, categoria, resumo, base_legal, requisitos, passo_a_passo, links_oficiais, icon_class, badge, destaque, ordem, ativo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [slug, titulo, categoria, resumo, base_legal, requisitos, passo_a_passo, links_oficiais, icon_class || 'fas fa-gavel', badge || '', destaque ? 1 : 0, ordem || 0]
        );
        logAudit(authUser.username, 'Criação de Direito', 'Direitos e Benefícios', `Criado direito: ${titulo}`);
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, id: result.insertId }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao criar direito.' }));
      }
      return;
    }

    if (method === 'PUT') {
      try {
        const data = JSON.parse(body || '{}');
        const { id, slug, titulo, categoria, resumo, base_legal, requisitos, passo_a_passo, links_oficiais, icon_class, badge, destaque, ordem, ativo } = data;
        await pool.execute(
          `UPDATE direitos_beneficios SET slug = ?, titulo = ?, categoria = ?, resumo = ?, base_legal = ?, requisitos = ?, passo_a_passo = ?, links_oficiais = ?, icon_class = ?, badge = ?, destaque = ?, ordem = ?, ativo = ? WHERE id = ?`,
          [slug, titulo, categoria, resumo, base_legal, requisitos, passo_a_passo, links_oficiais, icon_class, badge, destaque ? 1 : 0, ordem || 0, ativo !== undefined ? ativo : 1, id]
        );
        logAudit(authUser.username, 'Atualização de Direito', 'Direitos e Benefícios', `Atualizado ID ${id}`);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao atualizar direito.' }));
      }
      return;
    }

    if (method === 'DELETE') {
      try {
        const id = urlObj.searchParams.get('id');
        await pool.execute('DELETE FROM direitos_beneficios WHERE id = ?', [id]);
        logAudit(authUser.username, 'Exclusão de Direito', 'Direitos e Benefícios', `Excluído ID ${id}`);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao excluir direito.' }));
      }
      return;
    }
  }

  // ---------- 18. ADMIN: GESTÃO DE INSTITUIÇÕES DE APOIO ----------
  if (path === '/api/admin/instituicoes') {
    if (method === 'GET') {
      try {
        const [rows] = await pool.execute('SELECT * FROM instituicoes_apoio ORDER BY destaque DESC, nome ASC');
        res.writeHead(200);
        res.end(JSON.stringify(rows));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao listar instituições.' }));
      }
      return;
    }

    if (method === 'POST') {
      try {
        const data = JSON.parse(body || '{}');
        const { nome, sigla, tipo, abrangencia, uf, cidade, telefone, email, site_url, descricao, servicos_oferecidos, destaque } = data;
        const [result] = await pool.execute(
          `INSERT INTO instituicoes_apoio (nome, sigla, tipo, abrangencia, uf, cidade, telefone, email, site_url, descricao, servicos_oferecidos, destaque, ativo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [nome, sigla || '', tipo, abrangencia || 'Nacional', uf || '', cidade || '', telefone || '', email || '', site_url || '', descricao || '', servicos_oferecidos || '', destaque ? 1 : 0]
        );
        logAudit(authUser.username, 'Criação de Instituição', 'Instituições de Apoio', `Criada instituição: ${nome}`);
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, id: result.insertId }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao criar instituição.' }));
      }
      return;
    }

    if (method === 'DELETE') {
      try {
        const id = urlObj.searchParams.get('id');
        await pool.execute('DELETE FROM instituicoes_apoio WHERE id = ?', [id]);
        logAudit(authUser.username, 'Exclusão de Instituição', 'Instituições de Apoio', `Excluído ID ${id}`);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao excluir instituição.' }));
      }
      return;
    }
  }

  // ---------- 19. ADMIN: GESTÃO DE DOCUMENTOS E MODELOS ----------
  if (path === '/api/admin/documentos') {
    if (method === 'GET') {
      try {
        const [rows] = await pool.execute('SELECT * FROM documentos_modelos ORDER BY id DESC');
        res.writeHead(200);
        res.end(JSON.stringify(rows));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao listar documentos.' }));
      }
      return;
    }

    if (method === 'POST') {
      try {
        const data = JSON.parse(body || '{}');
        const { slug, titulo, categoria, orgao_destino, descricao, base_legal, template_texto, instrucoes_uso } = data;
        const [result] = await pool.execute(
          `INSERT INTO documentos_modelos (slug, titulo, categoria, orgao_destino, descricao, base_legal, template_texto, instrucoes_uso, ativo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [slug, titulo, categoria, orgao_destino, descricao, base_legal, template_texto, instrucoes_uso]
        );
        logAudit(authUser.username, 'Criação de Modelo', 'Documentos Modelos', `Criado modelo: ${titulo}`);
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, id: result.insertId }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao criar modelo de documento.' }));
      }
      return;
    }

    if (method === 'DELETE') {
      try {
        const id = urlObj.searchParams.get('id');
        await pool.execute('DELETE FROM documentos_modelos WHERE id = ?', [id]);
        logAudit(authUser.username, 'Exclusão de Modelo', 'Documentos Modelos', `Excluído ID ${id}`);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erro ao excluir documento.' }));
      }
      return;
    }
  }

  // Rota não encontrada
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Endpoint não encontrado.' }));
}

module.exports = handleApi;
