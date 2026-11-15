const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of list) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (['node_modules', '_backup_original', '.git'].includes(file.name)) continue;
      results = results.concat(getHtmlFiles(fullPath, baseDir));
    } else if (file.name.endsWith('.html')) {
      if (['admin.html', '404.html'].includes(file.name)) continue;
      const rel = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push(rel);
    }
  }
  return results;
}

const files = getHtmlFiles(__dirname);
const today = new Date().toISOString().split('T')[0];

const urls = files.map(f => {
  let cleanUrl = '/' + f;
  if (cleanUrl.endsWith('index.html')) {
    cleanUrl = cleanUrl.replace('index.html', '');
  }
  const isHome = cleanUrl === '/';
  const priority = isHome ? '1.0' : (cleanUrl.split('/').filter(Boolean).length === 1 ? '0.8' : '0.7');
  const changefreq = isHome ? 'daily' : 'weekly';

  return `  <url>
    <loc>https://jtpcd.vercel.app${cleanUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf8');
console.log(`✅ sitemap.xml gerado com sucesso! Total de páginas indexadas: ${urls.length}`);
