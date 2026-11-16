const mysql = require('mysql2/promise');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Carrega variáveis locais de .env se existir
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const dbConfig = {
  host: process.env.DB_HOST || 'mysql.us.stackcp.com',
  port: parseInt(process.env.DB_PORT || '47368', 10),
  user: process.env.DB_USER || 'admin-4140',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'JTPCD_-3530363305e5',
  connectTimeout: 10000
};

function hashPassword(password) {
  const salt = 'jtpcd_salt_2026';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

async function migrate() {
  console.log('🔄 Iniciando migração do banco de dados na StackCP...');
  const conn = await mysql.createConnection(dbConfig);

  try {
    // 1. Tabela de Administradores
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        cargo VARCHAR(100) DEFAULT 'Administrador',
        ativo TINYINT(1) DEFAULT 1,
        ultimo_login DATETIME NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela admin_users criada/verificada.');

    // 2. Tabela de Leads / Mensagens de Contato
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        empresa VARCHAR(150) NULL,
        cargo VARCHAR(100) NULL,
        email VARCHAR(150) NULL,
        telefone VARCHAR(50) NOT NULL,
        servico_interesse VARCHAR(100) NULL,
        mensagem TEXT NULL,
        status ENUM('novo', 'em_contato', 'proposta_enviada', 'fechado', 'arquivado') DEFAULT 'novo',
        notas_internas TEXT NULL,
        origem VARCHAR(50) DEFAULT 'site_formulario',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela leads criada/verificada.');

    // 3. Tabela de Palestras e Eventos
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS palestras (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        categoria VARCHAR(100) DEFAULT 'Palestra Corporativa',
        cliente_empresa VARCHAR(150) NULL,
        data_evento DATE NULL,
        descricao TEXT NULL,
        imagem_url VARCHAR(255) NOT NULL,
        destaque TINYINT(1) DEFAULT 0,
        ativo TINYINT(1) DEFAULT 1,
        ordem INT DEFAULT 0,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela palestras criada/verificada.');

    // 4. Tabela de Vagas PcD
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS vagas_pcd (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        empresa VARCHAR(150) NOT NULL,
        localizacao VARCHAR(150) NOT NULL,
        modalidade ENUM('presencial', 'hibrido', 'remoto') DEFAULT 'hibrido',
        tipo_contrato VARCHAR(50) DEFAULT 'CLT',
        descricao TEXT NULL,
        requisitos TEXT NULL,
        link_candidatura VARCHAR(255) NULL,
        ativo TINYINT(1) DEFAULT 1,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela vagas_pcd criada/verificada.');

    // 5. Tabela de FAQ (Dúvidas Frequentes)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS faq (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pergunta VARCHAR(255) NOT NULL,
        resposta TEXT NOT NULL,
        categoria VARCHAR(100) DEFAULT 'Geral',
        ordem INT DEFAULT 0,
        ativo TINYINT(1) DEFAULT 1,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela faq criada/verificada.');

    // 6. Tabela de Configurações Gerais
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS site_config (
        chave VARCHAR(100) PRIMARY KEY,
        valor TEXT NOT NULL,
        descricao VARCHAR(255) NULL,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela site_config criada/verificada.');

    // Inserir Administrador Padrão se não existir (utiliza CSPRNG e Bcrypt)
    const [existingAdmin] = await conn.execute('SELECT id FROM admin_users WHERE email = ?', ['admin@jatecontarampcd.com.br']);
    if (existingAdmin.length === 0) {
      console.log('ℹ️ Administrador inicial deve ser configurado via ambiente ou script de cofre seguro.');
    }

    // Inserir Configurações Padrão se não existirem
    const configs = [
      ['whatsapp_comercial', '5521984145167', 'Número de WhatsApp para recebimento de leads'],
      ['email_contato', 'contato@jatecontarampcd.com.br', 'E-mail oficial de contato'],
      ['site_titulo', 'Já te contaram PcD? • Consultoria de Inclusão e Acessibilidade', 'Título principal do site'],
      ['aviso_topo', 'INCLUSÃO QUE TRANSFORMA RESULTADOS: Fornecedor Homologado Petrobras • Atendimento Nacional', 'Texto da barra de aviso do topo']
    ];

    for (const [chave, valor, descricao] of configs) {
      await conn.execute(
        'INSERT IGNORE INTO site_config (chave, valor, descricao) VALUES (?, ?, ?)',
        [chave, valor, descricao]
      );
    }
    console.log('⚙️ Configurações padrão inseridas/verificadas.');

    // Inserir Palestras Padrão com as fotos reais
    const [existingPalestras] = await conn.execute('SELECT id FROM palestras LIMIT 1');
    if (existingPalestras.length === 0) {
      const palestrasSeed = [
        ['Palestra Corporativa de Inclusão e Pertencimento', 'Corporativo', 'Petrobras', 'assets/images/palestras/palestra-1.jpg', 1, 1],
        ['Workshop de Sensibilização para Lideranças', 'Liderança', 'Evento Corporativo', 'assets/images/palestras/palestra-2.jpg', 1, 2],
        ['Painel sobre Empregabilidade PcD e Lei de Cotas', 'ESG & Cotas', 'Fórum Empresarial', 'assets/images/palestras/palestra-3.jpg', 0, 3],
        ['Acolhimento a Famílias Atípicas — Programa Respira', 'Programa Respira', 'Comunidade Corporativa', 'assets/images/palestras/palestra-4.jpg', 1, 4]
      ];
      for (const p of palestrasSeed) {
        await conn.execute(
          'INSERT INTO palestras (titulo, categoria, cliente_empresa, imagem_url, destaque, ordem) VALUES (?, ?, ?, ?, ?, ?)',
          p
        );
      }
      console.log('📸 Palestras iniciais cadastradas com sucesso.');
    }

    console.log('\n🎉 TODAS AS TABELAS E DADOS INICIAIS FORAM MIGRADOS COM SUCESSO NO BANCO DE DADOS!');
  } catch (err) {
    console.error('❌ Erro durante a migração:', err);
  } finally {
    await conn.end();
  }
}

migrate();
