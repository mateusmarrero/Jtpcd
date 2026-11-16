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
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let reqPath = decodeURIComponent(urlObj.pathname);

  // CORS Diferenciado: Rotas Públicas vs Rotas Administrativas
  const origin = req.headers['origin'] || '';
  const isApiAdmin = reqPath.startsWith('/api/admin');

  const allowedAdminOrigins = [
    'http://localhost:4123',
    'http://127.0.0.1:4123',
    'https://jtpcd.com.br',
    'https://www.jtpcd.com.br'
  ];
  const isAllowedAdminOrigin = allowedAdminOrigins.includes(origin) ||
    /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin);

  if (isApiAdmin) {
    if (isAllowedAdminOrigin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (!origin) {
      res.setHeader('Access-Control-Allow-Origin', 'self');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self'; form-action 'self' https://wa.me https://api.whatsapp.com;");

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

  // ---------- ROTA DE ARQUIVOS ESTÁTICOS MULTIPÁGINAS & CLEAN URLS ----------
  let targetPath = reqPath;
  if (targetPath === '/' || targetPath === '') targetPath = '/index.html';
  if (targetPath === '/admin' || targetPath === '/admin/') targetPath = '/admin.html';

  let filePath = path.join(__dirname, targetPath);

  // Se for diretório, procura index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    }
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  // Se não encontrar o arquivo, serve a 404 personalizada
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const errorPage = path.join(__dirname, '404.html');
    if (fs.existsSync(errorPage)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(errorPage).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 - Página não encontrada');
    }
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n🚀 Servidor Portal Nacional Já Te Contaram PcD (Multi-páginas) rodando com sucesso!`);
  console.log(`👉 Portal Principal: http://localhost:${PORT}/`);
  console.log(`👉 Painel Administrativo: http://localhost:${PORT}/admin\n`);
});
