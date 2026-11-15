const fs = require('fs');
const path = require('path');
const { buildPageHtml } = require('./build_multipage_portal.js');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writePage(relPath, config) {
  const fullPath = path.join(__dirname, relPath);
  ensureDir(path.dirname(fullPath));
  const html = buildPageHtml(config);
  fs.writeFileSync(fullPath, html, 'utf8');
  console.log(`✅ Gerada página: ${relPath}`);
}

async function buildAll() {
  const pool = require('./db.js');

  // 1. ARTIGOS INDIVIDUAIS DO BLOG
  const [artigos] = await pool.execute('SELECT * FROM artigos_blog');
  for (const a of artigos) {
    const slug = a.slug;
    writePage(`blog/${slug}/index.html`, {
      title: `${a.titulo} | Já Te Contaram PcD?`,
      description: a.resumo || a.titulo,
      url: `/blog/${slug}/`,
      badge: a.categoria || 'Artigo Editorial',
      h1: a.titulo,
      lead: a.resumo || '',
      breadcrumbs: [
        { label: 'Início', url: '/' },
        { label: 'Blog', url: '/blog/' },
        { label: a.titulo, url: `/blog/${slug}/` }
      ],
      bodyHtml: `
        <div style="font-size:0.9rem; color:#64748b; margin-bottom:1.5rem; display:flex; gap:1.5rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.75rem;">
            <span><strong>Autor:</strong> ${a.autor || 'Moisés Souza'}</span>
            <span><strong>Publicado em:</strong> ${new Date(a.criado_em).toLocaleDateString('pt-BR')}</span>
            <span><strong>Categoria:</strong> ${a.categoria || 'Geral'}</span>
        </div>
        <div style="font-size:1.05rem; line-height:1.8; color:#334155;">
            ${a.conteudo ? a.conteudo.split('\n\n').map(p => `<p>${p}</p>`).join('') : '<p>Conteúdo em atualização.</p>'}
        </div>
        <div style="margin-top:2rem; padding:1.25rem; background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0;">
            <h4 style="margin-top:0; color:#001B44;">Compartilhe este artigo</h4>
            <p style="font-size:0.875rem; color:#64748b; margin-bottom:1rem;">Ajude a disseminar informações corretas sobre inclusão e direitos das pessoas com deficiência.</p>
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(a.titulo + ' - https://jtpcd.vercel.app/blog/' + slug + '/')}" target="_blank" class="btn btn-whatsapp btn-sm">WhatsApp</a>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://jtpcd.vercel.app/blog/' + slug + '/')}" target="_blank" class="btn btn-primary btn-sm">LinkedIn</a>
            </div>
        </div>
      `
    });
  }

  // 2. INSTITUIÇÕES INDIVIDUAIS
  const [instituicoes] = await pool.execute('SELECT * FROM instituicoes_apoio');
  for (const inst of instituicoes) {
    const slug = inst.nome.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    writePage(`instituicoes/${slug}/index.html`, {
      title: `${inst.nome} (${inst.estado}) — Atendimento e Reabilitação | Já Te Contaram PcD?`,
      description: `Informações de contato, serviços e endereço da instituição ${inst.nome} em ${inst.cidade} - ${inst.estado}.`,
      url: `/instituicoes/${slug}/`,
      badge: inst.tipo || 'Instituição de Apoio',
      h1: inst.nome,
      lead: `Centro de atendimento e reabilitação localizado em ${inst.cidade} - ${inst.estado}.`,
      breadcrumbs: [
        { label: 'Início', url: '/' },
        { label: 'Instituições', url: '/instituicoes/' },
        { label: inst.nome, url: `/instituicoes/${slug}/` }
      ],
      bodyHtml: `
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.5rem; margin-bottom:1.5rem; box-shadow:0 2px 4px rgba(0,0,0,0.04);">
            <h2 style="font-size:1.3rem; color:#001B44; margin-top:0;">Dados de Atendimento</h2>
            <ul style="list-style:none; padding:0; margin:1rem 0; line-height:2;">
                <li>📍 <strong>Localização:</strong> ${inst.cidade} - ${inst.estado}</li>
                <li>🏛️ <strong>Tipo de Entidade:</strong> ${inst.tipo}</li>
                ${inst.telefone ? `<li>📞 <strong>Telefone:</strong> <a href="tel:${inst.telefone.replace(/\D/g, '')}">${inst.telefone}</a></li>` : ''}
                ${inst.email ? `<li>✉️ <strong>E-mail:</strong> <a href="mailto:${inst.email}">${inst.email}</a></li>` : ''}
                ${inst.site ? `<li>🌐 <strong>Website Oficial:</strong> <a href="${inst.site}" target="_blank" rel="noopener noreferrer">${inst.site}</a></li>` : ''}
                ${inst.endereco ? `<li>📌 <strong>Endereço:</strong> ${inst.endereco}</li>` : ''}
            </ul>
        </div>
        <h2>Sobre o Atendimento e Especialidades</h2>
        <p>${inst.descricao || 'Instituição dedicada ao acolhimento, habilitação, reabilitação física, intelectual, visual e auditiva e suporte às famílias atípicas.'}</p>
        <div class="legal-box" style="margin-top:1.5rem;">
            <h4>Como Agendar Atendimento pelo SUS</h4>
            <p>Para agendamento de consultas ou reabilitação via Sistema Único de Saúde, procure a Unidade Básica de Saúde (UBS/Clínica da Família) mais próxima com seu laudo médico e documento de identidade para solicitação de encaminhamento pelo sistema de regulação (SISREG/CROSS).</p>
        </div>
      `
    });
  }

  // 3. VAGAS / OPORTUNIDADES INDIVIDUAIS
  const [vagas] = await pool.execute('SELECT * FROM vagas_pcd');
  for (const v of vagas) {
    const slug = v.titulo.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + v.id;

    writePage(`oportunidades/${slug}/index.html`, {
      title: `${v.titulo} — ${v.empresa} | Já Te Contaram PcD?`,
      description: `Oportunidade de emprego inclusiva para PcD: ${v.titulo} na empresa ${v.empresa}. Local: ${v.localizacao}.`,
      url: `/oportunidades/${slug}/`,
      badge: `Vaga Afirmativa PcD • ${v.modalidade || 'Efetivo'}`,
      h1: v.titulo,
      lead: `Oportunidade na empresa ${v.empresa} (${v.localizacao}).`,
      breadcrumbs: [
        { label: 'Início', url: '/' },
        { label: 'Oportunidades', url: '/oportunidades/' },
        { label: v.titulo, url: `/oportunidades/${slug}/` }
      ],
      bodyHtml: `
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.5rem; margin-bottom:1.5rem; box-shadow:0 2px 4px rgba(0,0,0,0.04);">
            <div style="display:flex; flex-wrap:wrap; gap:1.5rem; font-size:0.95rem; color:#475569;">
                <div>🏢 <strong>Empresa:</strong> ${v.empresa}</div>
                <div>📍 <strong>Localização:</strong> ${v.localizacao}</div>
                <div>💼 <strong>Contrato:</strong> ${v.tipo_contrato || 'CLT'}</div>
                <div>⚡ <strong>Modalidade:</strong> ${v.modalidade || 'Presencial/Híbrido'}</div>
            </div>
        </div>

        <h2>Descrição da Vaga</h2>
        <div style="font-size:1rem; line-height:1.7; color:#334155;">
            ${v.descricao ? v.descricao.split('\n').map(l => `<p>${l}</p>`).join('') : '<p>Empresa com processo seletivo inclusivo aberto para profissionais com deficiência ou reabilitados do INSS.</p>'}
        </div>

        ${v.requisitos ? `
            <h2>Requisitos e Qualificações</h2>
            <div style="font-size:1rem; line-height:1.7; color:#334155;">
                ${v.requisitos.split('\n').map(r => `<p>${r}</p>`).join('')}
            </div>
        ` : ''}

        <div style="margin-top:2rem; padding:1.5rem; background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; text-align:center;">
            <h3 style="color:#1d4ed8; margin-top:0;">Interessado nesta vaga?</h3>
            <p style="color:#1e40af; font-size:0.95rem; margin-bottom:1.25rem;">Envie seu currículo atualizado mencionando a condição de PcD ou laudo anexado.</p>
            <a href="${v.link_candidatura || 'https://wa.me/5521984145167'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding:0.75rem 2rem; font-size:1.05rem;">
                Candidatar-se a esta Oportunidade
            </a>
        </div>
      `
    });
  }

  console.log('✅ Todas as páginas individuais de artigos, instituições e vagas geradas com sucesso!');
  process.exit(0);
}

buildAll().catch(e => {
  console.error('Erro:', e);
  process.exit(1);
});
