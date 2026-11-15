const fs = require('fs');
const path = require('path');

async function auditPortal() {
  console.log('🚀 Iniciando Auditoria Completa das Rotas do Portal...');

  // 1. Ler todas as URLs do sitemap.xml
  const sitemapContent = fs.readFileSync(path.join(__dirname, 'sitemap.xml'), 'utf8');
  const locMatches = [...sitemapContent.matchAll(/<loc>https:\/\/jtpcd\.vercel\.app([^<]*)<\/loc>/g)];
  const urls = locMatches.map(m => m[1] || '/');

  console.log(`📋 Total de rotas extraídas do sitemap: ${urls.length}`);

  const results = {
    totalChecked: 0,
    successful: 0,
    failures: [],
    emptyPages: [],
    shortContent: [],
    brokenInternalLinks: [],
    missingImages: [],
    missingBreadcrumbs: [],
    missingTitles: [],
    missingDescriptions: [],
    duplicateTitles: {},
    duplicateH1: {}
  };

  const localBase = 'http://localhost:4123';

  for (const route of urls) {
    results.totalChecked++;
    const fullUrl = localBase + route;
    try {
      const res = await fetch(fullUrl);
      if (res.status !== 200) {
        results.failures.push({ route, status: res.status });
        continue;
      }
      results.successful++;
      const html = await res.text();

      // Verificar title
      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      if (!title) {
        results.missingTitles.push(route);
      } else {
        results.duplicateTitles[title] = (results.duplicateTitles[title] || []).concat(route);
      }

      // Verificar description
      const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
      const description = descMatch ? descMatch[1].trim() : '';
      if (!description) {
        results.missingDescriptions.push(route);
      }

      // Verificar h1
      const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
      const h1 = h1Match ? h1Match[1].trim() : '';
      if (h1) {
        results.duplicateH1[h1] = (results.duplicateH1[h1] || []).concat(route);
      }

      // Verificar Breadcrumbs (para páginas que não são a Home)
      if (route !== '/') {
        const hasBreadcrumb = html.includes('portal-breadcrumbs') || html.includes('breadcrumb');
        if (!hasBreadcrumb) {
          results.missingBreadcrumbs.push(route);
        }
      }

      // Verificar Cabeçalho e Rodapé
      const hasHeader = html.includes('site-header');
      const hasFooter = html.includes('site-footer') || html.includes('site-foot');
      const hasA11yBar = html.includes('skip-links-bar');

      // Verificar Conteúdo substancial (tamanho mínimo do texto)
      const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const words = textOnly.split(' ').length;
      if (words < 100) {
        results.emptyPages.push({ route, words });
      } else if (words < 250 && route !== '/') {
        results.shortContent.push({ route, words });
      }

      // Verificar Imagens locais
      const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
      for (const imgM of imgMatches) {
        const src = imgM[1];
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) continue;
        const localImgPath = path.join(__dirname, src.startsWith('/') ? src.slice(1) : src);
        if (!fs.existsSync(localImgPath)) {
          results.missingImages.push({ route, src });
        }
      }

      // Verificar links internos
      const hrefMatches = [...html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)];
      for (const hrefM of hrefMatches) {
        const href = hrefM[1];
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http://') || href.startsWith('https://')) continue;
        // link interno relativo ou absoluto
        let targetPath = href.split('#')[0].split('?')[0];
        if (!targetPath) continue;
        if (targetPath.startsWith('/')) targetPath = targetPath.slice(1);
        
        // Verifica existência física de arquivo ou pasta com index.html
        let exists = false;
        const candidate1 = path.join(__dirname, targetPath);
        const candidate2 = path.join(__dirname, targetPath, 'index.html');
        const candidate3 = path.join(__dirname, targetPath + '.html');
        if (fs.existsSync(candidate1) && fs.statSync(candidate1).isFile()) exists = true;
        else if (fs.existsSync(candidate2)) exists = true;
        else if (fs.existsSync(candidate3)) exists = true;
        else if (targetPath === '' || targetPath === '/') exists = true;

        if (!exists) {
          results.brokenInternalLinks.push({ fromRoute: route, toHref: href });
        }
      }

    } catch (err) {
      results.failures.push({ route, error: err.message });
    }
  }

  // Filtrar títulos e H1s realmente duplicados (> 1)
  const realDupTitles = Object.entries(results.duplicateTitles).filter(([_, routes]) => routes.length > 1);
  const realDupH1 = Object.entries(results.duplicateH1).filter(([_, routes]) => routes.length > 1);

  console.log('\n=============================================');
  console.log('📊 RESULTADOS DA AUDITORIA AUTOMATIZADA:');
  console.log('=============================================');
  console.log(`✅ Total de Rotas Verificadas: ${results.totalChecked}`);
  console.log(`✅ Respostas HTTP 200 com Sucesso: ${results.successful}`);
  console.log(`❌ Falhas HTTP / Erros de Conexão: ${results.failures.length}`);
  console.log(`❌ Páginas Vazias (< 100 palavras): ${results.emptyPages.length}`);
  console.log(`⚠️ Páginas com Conteúdo Curto (< 250 palavras): ${results.shortContent.length}`);
  console.log(`❌ Imagens Ausentes no Disco: ${results.missingImages.length}`);
  console.log(`❌ Links Internos Quebrados: ${results.brokenInternalLinks.length}`);
  console.log(`❌ Páginas sem Breadcrumbs: ${results.missingBreadcrumbs.length}`);
  console.log(`❌ Páginas sem Title: ${results.missingTitles.length}`);
  console.log(`❌ Páginas sem Description: ${results.missingDescriptions.length}`);
  console.log(`⚠️ Títulos Duplicados: ${realDupTitles.length}`);
  console.log(`⚠️ H1s Duplicados: ${realDupH1.length}`);

  if (results.failures.length > 0) {
    console.log('\n❌ Detalhes das Falhas HTTP:', results.failures);
  }
  if (results.brokenInternalLinks.length > 0) {
    console.log('\n❌ Detalhes dos Links Quebrados (primeiros 10):', results.brokenInternalLinks.slice(0, 10));
  }
  if (results.missingImages.length > 0) {
    console.log('\n❌ Detalhes das Imagens Ausentes:', results.missingImages);
  }
  if (results.emptyPages.length > 0) {
    console.log('\n❌ Páginas Vazias:', results.emptyPages);
  }
  if (results.shortContent.length > 0) {
    console.log('\n⚠️ Páginas com Conteúdo Curto:', results.shortContent);
  }

  fs.writeFileSync('audit_results.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    realDupTitles,
    realDupH1
  }, null, 2), 'utf8');

  console.log('\n💾 Relatório salvo em audit_results.json');
}

auditPortal();
