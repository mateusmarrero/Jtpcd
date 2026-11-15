const http = require('http');
const fs = require('fs');
const path = require('path');
const handleApi = require('./api');

const PORT = process.env.PORT || 4123;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let reqPath = urlObj.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ---------- ROTA DE API BACKEND ----------
  if (reqPath.startsWith('/api/')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Proteção de tamanho (máx 5MB)
      if (body.length > 5 * 1024 * 1024) {
        req.destroy();
      }
    });

    req.on('end', () => {
      handleApi(req, res, urlObj, body).catch(err => {
        console.error('Unhandled API Error:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Erro interno no servidor de API.' }));
        }
      });
    });
    return;
  }

  // ---------- ROTA DE ARQUIVOS ESTÁTICOS ----------
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  if (reqPath === '/admin' || reqPath === '/admin/') reqPath = '/admin.html';

  const filePath = path.join(__dirname, reqPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 - Arquivo não encontrado');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n🚀 Servidor Já te contaram PcD? (Site + API + Painel Admin) rodando com sucesso!`);
  console.log(`👉 Site Principal: http://localhost:${PORT}/`);
  console.log(`👉 Painel Administrativo: http://localhost:${PORT}/admin\n`);
});
