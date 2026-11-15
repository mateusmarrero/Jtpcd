const crypto = require('crypto');
const pool = require('./db');

const SALT = 'jtpcd_salt_2026';
const SESSIONS = new Map(); // Simple secure memory session map token -> user

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + SALT).digest('hex');
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
    await pool.execute(
      'INSERT INTO audit_logs (usuario, acao, modulo, detalhes, ip) VALUES (?, ?, ?, ?, ?)',
      [usuario || 'admin', acao, modulo, detalhes || '', ip || '127.0.0.1']
    );
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

async function handleApi(req, res, urlObj, body) {
  const path = urlObj.pathname;
  const method = req.method;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // ---------- 1. ROTA PÚBLICA: ENVIO DE NOVO LEAD ----------
  if (path === '/api/leads' && method === 'POST') {
    try {
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

  // ---------- 2. ROTA PÚBLICA: LOGIN DO ADMINISTRADOR ----------
  if (path === '/api/admin/login' && method === 'POST') {
    try {
      const bodyData = JSON.parse(body || '{}');
      const loginIdentifier = (bodyData.usuario || bodyData.email || '').trim();
      const senha = bodyData.senha || '';

      if (!loginIdentifier || !senha) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Informe usuário/e-mail e senha.' }));
        return;
      }

      const senhaHash = hashPassword(senha);
      const [rows] = await pool.execute(
        `SELECT id, nome, username, email, cargo, role 
         FROM admin_users 
         WHERE (username = ? OR email = ? OR (? = 'admin' AND id = 1)) 
           AND senha_hash = ? 
           AND ativo = 1`,
        [loginIdentifier, loginIdentifier, loginIdentifier, senhaHash]
      );

      if (rows.length === 0) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Usuário ou senha incorretos.' }));
        return;
      }

      const user = rows[0];
      const token = generateToken();
      SESSIONS.set(token, { user, timestamp: Date.now() });

      // Atualiza último login
      await pool.execute('UPDATE admin_users SET ultimo_login = NOW() WHERE id = ?', [user.id]);
      const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
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

      const atualHash = hashPassword(senhaAtual);
      const [rows] = await pool.execute(
        'SELECT id FROM admin_users WHERE id = ? AND senha_hash = ?',
        [authUser.id, atualHash]
      );

      if (rows.length === 0) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Senha atual incorreta.' }));
        return;
      }

      const novaHash = hashPassword(novaSenha);
      await pool.execute('UPDATE admin_users SET senha_hash = ? WHERE id = ?', [novaHash, authUser.id]);

      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: 'Senha atualizada com sucesso!' }));
    } catch (err) {
      console.error('Erro ao trocar senha:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Erro ao atualizar senha.' }));
    }
    return;
  }

  // ---------- 11. GESTÃO DE USUÁRIOS E PERMISSÕES ----------
  if (path === '/api/admin/users') {
    if (method === 'GET') {
      try {
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
        const senhaHash = hashPassword(senha);

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
          params.push(hashPassword(novaSenha));
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

  // Rota não encontrada
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Endpoint não encontrado.' }));
}

module.exports = handleApi;
