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
        `SELECT id, nome, username, email, cargo 
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

      res.writeHead(200);
      res.end(JSON.stringify({
        totalLeads: leadsTotal.total,
        leadsNovos: leadsNovos.total,
        leadsEmContato: leadsEmContato.total,
        leadsFechados: leadsFechados.total,
        totalPalestras: palestrasTotal.total,
        totalVagas: vagasTotal.total
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

  // Rota não encontrada
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Endpoint não encontrado.' }));
}

module.exports = handleApi;
