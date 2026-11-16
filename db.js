const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Carrega variáveis locais de .env se existir e não estiver em ambiente gerenciado
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

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// =========================================================================
// RUNTIME SECURITY GUARD — BLOQUEIO ESTRITO E INVIOLÁVEL DE DDL NO RUNTIME
// =========================================================================
// Garante o princípio do menor privilégio na camada de aplicação: mesmo que
// a conta de tenant da hospedagem StackCP possua privilégios DDL no schema,
// a aplicação em runtime fica estritamente restrita a operações DML (SELECT,
// INSERT, UPDATE, DELETE).
//
// O analisador normaliza a consulta removendo comentários (bloco, linha e hash),
// espaços, quebras de linha e delimitadores residuais, prevenindo qualquer
// tentativa de bypass ou injeção de DDL em multi-statements.
function isDdlQuery(sql) {
  if (typeof sql !== 'string') return false;

  // 1. Remove comentários de bloco /* ... */
  let cleanSql = sql.replace(/\/\*[\s\S]*?\*\//g, ' ');

  // 2. Remove comentários de linha (-- e #)
  cleanSql = cleanSql.replace(/(--|#)[^\r\n]*/g, ' ');

  // 3. Normaliza múltiplos espaços e quebras de linha
  cleanSql = cleanSql.replace(/\s+/g, ' ').trim();

  // 4. Remove pontuações iniciais como parênteses ou ponto-e-vírgula residuais
  cleanSql = cleanSql.replace(/^[;\s()]+/, '');

  // 5. Detecta palavras-chave DDL no início de qualquer comando da cadeia
  const ddlPattern = /(?:^|[;()]\s*)(CREATE|DROP|ALTER|TRUNCATE|RENAME|GRANT|REVOKE)\b/i;

  return ddlPattern.test(cleanSql);
}

function wrapWithDdlBlocker(target, methodName) {
  const original = target[methodName].bind(target);
  target[methodName] = function(sql, params) {
    // Em produção (Vercel ou NODE_ENV=production), DDL é ESTRITAMENTE PROIBIDO (ALLOW_DDL é ignorado)
    const isProd = (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production');
    const allowDdl = !isProd && (process.env.ALLOW_DDL === 'true');

    if (typeof sql === 'string' && isDdlQuery(sql) && !allowDdl) {
      console.error(`[SECURITY GUARD] Bloqueio de segurança: Comando DDL barrado no runtime da aplicação.`);
      return Promise.reject(new Error(`Operação DDL negada no runtime da aplicação. Permissão estrita DML.`));
    }
    return original(sql, params);
  };
}

wrapWithDdlBlocker(pool, 'execute');
wrapWithDdlBlocker(pool, 'query');

const originalGetConnection = pool.getConnection.bind(pool);
pool.getConnection = async function() {
  const conn = await originalGetConnection();
  wrapWithDdlBlocker(conn, 'execute');
  wrapWithDdlBlocker(conn, 'query');
  return conn;
};

module.exports = pool;
