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

// ==========================================
// ÁREA 11: DIRETÓRIO DE INSTITUIÇÕES (/instituicoes/)
// ==========================================
writePage('instituicoes/index.html', {
  title: 'Diretório Nacional de Instituições de Apoio e Reabilitação PcD | Já Te Contaram PcD?',
  description: 'Encontre APAEs, Centros Especializados em Reabilitação (CER IV), AACDs, associações de autismo e entidades de apoio em todo o Brasil.',
  url: '/instituicoes/',
  badge: 'Área 11 — Diretório Nacional de Apoio',
  h1: 'Diretório Nacional de Entidades e Reabilitação PcD',
  lead: 'Localize centros de atendimento, reabilitação física e intelectual, associações de famílias e órgãos públicos de defesa de direitos no seu estado.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Instituições de Apoio', url: '/instituicoes/' }
  ],
  bodyHtml: `
    <p>O apoio de instituições especializadas é indispensável no desenvolvimento, reabilitação e acolhimento das pessoas com deficiência e de seus familiares. Reunimos aqui os principais centros de referência do Brasil com atendimento pelo SUS e filantrópico.</p>

    <div style="margin:2rem 0;">
        <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.5rem;">
            <h2 style="font-size:1.3rem; color:#001B44; margin:0;">Filtrar Entidades por Estado (UF)</h2>
            <div id="instUfFilterBar" class="inst-uf-filter-bar" style="display:flex; flex-wrap:wrap; gap:6px;">
                <button type="button" class="inst-uf-btn is-active" data-uf="Todos">Todos os Estados</button>
            </div>
        </div>

        <div id="instituicoesGrid" class="instituicoes-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1.5rem;">
            <!-- Carregado via app.js a partir da API /api/public/instituicoes -->
            <p style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:2rem 0;">
                Carregando rede de instituições cadastradas...
            </p>
        </div>
    </div>

    <h2>Como Cadastrar sua Instituição</h2>
    <div class="legal-box">
        <p>É dirigente de uma APAE, Pestalozzi, associação comunitária de doenças raras ou centro de reabilitação? O cadastro no diretório do <strong>Já Te Contaram PcD?</strong> é 100% gratuito. Envie os dados da sua instituição (nome, CNPJ, serviços oferecidos, telefone e endereço) para nosso time pelo WhatsApp ou email de atendimento.</p>
    </div>
  `
});

// ==========================================
// ÁREA 12: BLOG E NOTÍCIAS (/blog/)
// ==========================================
writePage('blog/index.html', {
  title: 'Blog Editorial e Notícias PcD: Legislação, Inclusão e Cidadania | Já Te Contaram PcD?',
  description: 'Artigos aprofundados, análises jurídicas, tendências de mercado de trabalho e guias de cidadania escritos por especialistas.',
  url: '/blog/',
  badge: 'Área 12 — Editorial & Notícias',
  h1: 'Portal Editorial Já Te Contaram PcD?',
  lead: 'Informação qualificada com curadoria do consultor Moisés Souza para empoderar a comunidade PcD, gestores de RH e lideranças públicas.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Blog e Notícias', url: '/blog/' }
  ],
  bodyHtml: `
    <p>Acompanhe análises técnicas, posicionamentos jurídicos e reportagens exclusivas sobre direitos humanos, inclusão social e melhores práticas corporativas no Brasil.</p>

    <div style="margin:2.5rem 0;">
        <h2 style="font-size:1.35rem; color:#001B44; margin-bottom:1.25rem;">Artigos em Destaque</h2>
        
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:1.75rem;">
            <article style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; flex-direction:column;">
                <div style="height:180px; background:linear-gradient(135deg, #001B44, #0284c7); display:flex; align-items:center; justify-content:center; color:#fff; font-size:3rem;">
                    ⚖️
                </div>
                <div style="padding:1.5rem; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <span style="font-size:0.75rem; font-weight:700; color:#0284c7; text-transform:uppercase; letter-spacing:0.05em;">Legislação & Cotas</span>
                        <h3 style="font-size:1.15rem; color:#0f172a; margin:0.5rem 0 0.75rem 0; line-height:1.4;">
                            Como Cumprir a Lei de Cotas com Eficiência e Retenção de Talentos
                        </h3>
                        <p style="font-size:0.875rem; color:#64748b; line-height:1.5; margin-bottom:1rem;">
                            Estratégias práticas para ir além da contratação protocolar e criar trilhas de desenvolvimento sustentáveis para colaboradores com deficiência.
                        </p>
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between; font-size:0.8rem; color:#94a3b8; border-top:1px solid #f1f5f9; pt:0.75rem; padding-top:0.75rem;">
                        <span>Por Moisés Souza</span>
                        <span>Tempo de leitura: 5 min</span>
                    </div>
                </div>
            </article>

            <article style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; flex-direction:column;">
                <div style="height:180px; background:linear-gradient(135deg, #0f766e, #14b8a6); display:flex; align-items:center; justify-content:center; color:#fff; font-size:3rem;">
                    🤝
                </div>
                <div style="padding:1.5rem; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <span style="font-size:0.75rem; font-weight:700; color:#0d9488; text-transform:uppercase; letter-spacing:0.05em;">Cultura & Inclusão</span>
                        <h3 style="font-size:1.15rem; color:#0f172a; margin:0.5rem 0 0.75rem 0; line-height:1.4;">
                            Acessibilidade Atitudinal: A Barreira Invisível nas Organizações
                        </h3>
                        <p style="font-size:0.875rem; color:#64748b; line-height:1.5; margin-bottom:1rem;">
                            Rampas e banheiros adaptados não bastam se o preconceito e o capacitismo ainda ditam as relações interpessoais no ambiente de trabalho.
                        </p>
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between; font-size:0.8rem; color:#94a3b8; border-top:1px solid #f1f5f9; padding-top:0.75rem;">
                        <span>Por Moisés Souza</span>
                        <span>Tempo de leitura: 4 min</span>
                    </div>
                </div>
            </article>

            <article style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; flex-direction:column;">
                <div style="height:180px; background:linear-gradient(135deg, #4338ca, #6366f1); display:flex; align-items:center; justify-content:center; color:#fff; font-size:3rem;">
                    🚀
                </div>
                <div style="padding:1.5rem; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <span style="font-size:0.75rem; font-weight:700; color:#6366f1; text-transform:uppercase; letter-spacing:0.05em;">Carreira & Liderança</span>
                        <h3 style="font-size:1.15rem; color:#0f172a; margin:0.5rem 0 0.75rem 0; line-height:1.4;">
                            Liderança PcD: Do Assistencialismo ao Protagonismo Corporativo
                        </h3>
                        <p style="font-size:0.875rem; color:#64748b; line-height:1.5; margin-bottom:1rem;">
                            Por que pessoas com deficiência raramente alcançam cargos de coordenação e diretoria e como acelerar essa transformação.
                        </p>
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between; font-size:0.8rem; color:#94a3b8; border-top:1px solid #f1f5f9; padding-top:0.75rem;">
                        <span>Por Equipe Editorial</span>
                        <span>Tempo de leitura: 6 min</span>
                    </div>
                </div>
            </article>
        </div>
    </div>

    <div class="info-callout">
        <h4>Quer publicar um artigo ou relato de experiência?</h4>
        <p>Se você é pesquisador, advogado, terapeuta ou profissional com deficiência e deseja publicar um artigo de opinião em nosso portal, entre em contato pelo email <strong>redacao@jatecontarampcd.com.br</strong> com sua proposta editorial.</p>
    </div>
  `
});

// ==========================================
// ÁREA 13: OPORTUNIDADES E CARREIRA (/oportunidades/)
// ==========================================
writePage('oportunidades/index.html', {
  title: 'Mural de Vagas e Oportunidades Profissionais PcD | Já Te Contaram PcD?',
  description: 'Encontre vagas de emprego afirmativas e inclusivas para pessoas com deficiência em grandes empresas do Brasil.',
  url: '/oportunidades/',
  badge: 'Área 13 — Oportunidades & Vagas PcD',
  h1: 'Mural de Oportunidades e Carreiras Inclusivas',
  lead: 'Conectando profissionais com deficiência a empresas comprometidas com a verdadeira inclusão, acessibilidade e respeito à Lei de Cotas.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Oportunidades PcD', url: '/oportunidades/' }
  ],
  bodyHtml: `
    <p>O mercado de trabalho brasileiro dispõe de milhares de postos de trabalho reservados para profissionais reabilitados ou com deficiência. Conheça as posições ativas homologadas pela nossa equipe editorial.</p>

    <div style="margin:2rem 0;">
        <div id="vagasGrid" class="vagas-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:1.5rem;">
            <!-- Carregado via app.js a partir da API /api/public/vagas -->
            <p style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:2rem 0;">
                Buscando vagas inclusivas em tempo real...
            </p>
        </div>
    </div>

    <h2>Para Empresas: Como Divulgar Vagas PcD</h2>
    <div class="legal-box">
        <h4>Sua Empresa Precisa Cumprir a Cota Legal com Qualidade?</h4>
        <p>A Já Te Contaram PcD? oferece assessoria especializada em recrutamento inclusivo, análise biopsicossocial de postos de trabalho e palestras de sensibilização de equipes com Moisés Souza (fornecedor homologado Petrobras). Divulgue suas oportunidades diretamente para milhares de candidatos qualificados em todo o Brasil.</p>
        <a href="/palestras/" class="btn btn-primary" style="margin-top:1rem;">Conhecer Soluções Corporativas</a>
    </div>
  `
});

// ==========================================
// ÁREA INSTITUCIONAL: PALESTRAS E CONSULTORIA (/palestras/)
// ==========================================
writePage('palestras/index.html', {
  title: 'Palestras Corporativas e Consultoria de Inclusão com Moisés Souza | Já Te Contaram PcD?',
  description: 'Contrate palestras sobre diversidade, liderança, Lei de Cotas e acessibilidade atitudinal com Moisés Souza, fornecedor homologado Petrobras.',
  url: '/palestras/',
  badge: 'Soluções Corporativas B2B',
  h1: 'Palestras Corporativas e Consultoria em Inclusão PcD',
  lead: 'Transforme a cultura da sua organização com palestras de alto impacto, conformidade jurídica e metodologias práticas ministradas por Moisés Souza.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Palestras e Consultoria', url: '/palestras/' }
  ],
  bodyHtml: `
    <div style="display:flex; flex-wrap:wrap; gap:2rem; align-items:center; background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:2rem; margin-bottom:2.5rem; box-shadow:0 10px 25px -5px rgba(0,0,0,0.06);">
        <div style="width:140px; height:140px; border-radius:50%; background:linear-gradient(135deg, #001B44, #0284c7); display:flex; align-items:center; justify-content:center; color:#fff; font-size:3.5rem; font-weight:800; flex-shrink:0;">
            MS
        </div>
        <div style="flex:1; min-width:280px;">
            <div style="display:inline-block; background:#e0f2fe; color:#0369a1; font-size:0.8rem; font-weight:700; padding:4px 10px; border-radius:99px; margin-bottom:0.5rem;">
                FORNECEDOR HOMOLOGADO PETROBRAS
            </div>
            <h2 style="font-size:1.5rem; color:#001B44; margin:0 0 0.5rem 0;">Moisés Souza</h2>
            <p style="font-size:0.95rem; color:#475569; line-height:1.6; margin:0 0 1rem 0;">
                Especialista em Diversidade e Inclusão, consultor corporativo, palestrante motivacional e ativista dos direitos da pessoa com deficiência. Com larga experiência no setor corporativo de óleo, gás, telecomunicações e serviços, lidera projetos de transformação cultural que desmistificam o capacitismo e impulsionam a retenção de talentos diversos.
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                <span style="font-size:0.8rem; background:#f1f5f9; color:#334155; padding:4px 10px; border-radius:6px; font-weight:600;">Lei Brasileira de Inclusão</span>
                <span style="font-size:0.8rem; background:#f1f5f9; color:#334155; padding:4px 10px; border-radius:6px; font-weight:600;">Gestão da Lei de Cotas</span>
                <span style="font-size:0.8rem; background:#f1f5f9; color:#334155; padding:4px 10px; border-radius:6px; font-weight:600;">Acessibilidade Atitudinal</span>
                <span style="font-size:0.8rem; background:#f1f5f9; color:#334155; padding:4px 10px; border-radius:6px; font-weight:600;">SIPAT & Eventos ESG</span>
            </div>
        </div>
    </div>

    <h2>Temas Principais de Palestras e Workshops</h2>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem; margin:1.5rem 0;">
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem;">
            <div style="font-size:2rem; margin-bottom:0.5rem;">🎤</div>
            <h3 style="font-size:1.15rem; color:#0f172a; margin-bottom:0.5rem;">Além do Óbvio: A Força da Diversidade Humana</h3>
            <p style="font-size:0.875rem; color:#64748b; line-height:1.5;">Uma palestra inspiradora para SIPATs e convenções de colaboradores sobre superação de estigmas, resiliência e acolhimento das diferenças.</p>
        </div>
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem;">
            <div style="font-size:2rem; margin-bottom:0.5rem;">🏛️</div>
            <h3 style="font-size:1.15rem; color:#0f172a; margin-bottom:0.5rem;">Conformidade Jurídica na Lei de Cotas</h3>
            <p style="font-size:0.875rem; color:#64748b; line-height:1.5;">Treinamento imersivo para RH, Jurídico e DHO sobre riscos de multas do MTE, termos de ajustamento de conduta (TAC) e recrutamento biopsicossocial.</p>
        </div>
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem;">
            <div style="font-size:2rem; margin-bottom:0.5rem;">🧠</div>
            <h3 style="font-size:1.15rem; color:#0f172a; margin-bottom:0.5rem;">Neurodiversidade no Ambiente de Trabalho</h3>
            <p style="font-size:0.875rem; color:#64748b; line-height:1.5;">Como acolher e liderar profissionais no espectro autista, TDAH e altas habilidades, adaptando processos e aproveitando potenciais analíticos únicos.</p>
        </div>
    </div>

    <h2>Solicite uma Proposta Corporativa</h2>
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:2rem; box-shadow:0 10px 25px -5px rgba(0,0,0,0.08); margin-bottom:2rem;">
        <form id="corporateLeadForm" style="display:grid; grid-template-columns:1fr; gap:1.25rem;">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
                <div>
                    <label for="leadNome" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">Nome do Solicitante:</label>
                    <input type="text" id="leadNome" name="leadNome" required placeholder="Digite seu nome completo" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;">
                </div>
                <div>
                    <label for="leadEmpresa" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">Nome da Empresa:</label>
                    <input type="text" id="leadEmpresa" name="leadEmpresa" required placeholder="Nome da empresa ou instituição" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;">
                </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
                <div>
                    <label for="leadCargo" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">Cargo / Setor:</label>
                    <input type="text" id="leadCargo" name="leadCargo" placeholder="Seu cargo na organização" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;">
                </div>
                <div>
                    <label for="leadEmail" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">E-mail Corporativo:</label>
                    <input type="email" id="leadEmail" name="leadEmail" required placeholder="seu.email@empresa.com.br" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;">
                </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
                <div>
                    <label for="leadTelefone" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">Telefone / WhatsApp Comercial:</label>
                    <input type="text" id="leadTelefone" name="leadTelefone" required placeholder="Telefone ou WhatsApp com DDD" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;">
                </div>
                <div>
                    <label for="leadServico" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">Serviço de Interesse:</label>
                    <select id="leadServico" name="leadServico" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem; background:#fff;">
                        <option value="palestra" selected>Palestra Presencial ou Online</option>
                        <option value="consultoria">Consultoria em Lei de Cotas</option>
                        <option value="treinamento">Treinamento de Lideranças</option>
                        <option value="recrutamento">Apoio em Recrutamento PcD</option>
                    </select>
                </div>
            </div>

            <div>
                <label for="leadMensagem" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">Mensagem / Data Pretendida:</label>
                <textarea id="leadMensagem" name="leadMensagem" rows="3" placeholder="Conte brevemente sobre as necessidades do evento, quantidade estimada de participantes e datas sugeridas..." style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;"></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="padding:0.9rem 1.5rem; font-size:1.05rem; font-weight:700; width:100%; justify-content:center; margin-top:0.5rem;">
                Enviar Solicitação de Orçamento
            </button>
        </form>

        <div id="corporateLeadFeedback" style="display:none; margin-top:1.5rem; padding:1.25rem; border-radius:10px; background:#f0fdf4; color:#166534; font-weight:600; text-align:center;">
            Obrigado! Sua mensagem foi recebida com sucesso. Nossa equipe entrará em contato comercial em até 24 horas úteis.
        </div>
    </div>
  `
});

// ==========================================
// PÁGINA 404 PERSONALIZADA (404.html)
// ==========================================
const html404 = buildPageHtml({
  title: 'Página Não Encontrada (404) | Já Te Contaram PcD?',
  description: 'A página que você procura não foi encontrada ou foi remanejada na nova arquitetura multipáginas do portal Já Te Contaram PcD?.',
  url: '/404.html',
  badge: 'Erro 404 — Conteúdo Não Encontrado',
  h1: 'Ops! Esta página não foi encontrada',
  lead: 'O conteúdo solicitado pode ter sido atualizado ou transferido para uma das novas seções especializadas do portal Já Te Contaram PcD?.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Página 404', url: '/404.html' }
  ],
  bodyHtml: `
    <div style="text-align:center; padding:2rem 0;">
        <div style="font-size:4rem; margin-bottom:1rem;">🧭</div>
        <h2 style="font-size:1.5rem; color:#001B44; margin-bottom:1rem;">Navegue pelas Áreas do Nosso Portal</h2>
        <p style="font-size:1rem; color:#64748b; max-width:600px; margin:0 auto 2rem auto;">
            Para ajudá-lo a encontrar rapidamente o que procura, confira as principais seções do portal:
        </p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; text-align:left; margin-bottom:2.5rem;">
            <a href="/direitos/" style="display:block; padding:1rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; text-decoration:none; color:#0f172a; font-weight:600;">
                ⚖️ Direitos & Legislação
            </a>
            <a href="/beneficios/" style="display:block; padding:1rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; text-decoration:none; color:#0f172a; font-weight:600;">
                🛡️ Benefícios & BPC
            </a>
            <a href="/saude/" style="display:block; padding:1rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; text-decoration:none; color:#0f172a; font-weight:600;">
                🏥 Saúde & Terapias
            </a>
            <a href="/educacao/" style="display:block; padding:1rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; text-decoration:none; color:#0f172a; font-weight:600;">
                🎓 Educação Inclusiva
            </a>
            <a href="/emprego/" style="display:block; padding:1rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; text-decoration:none; color:#0f172a; font-weight:600;">
                💼 Emprego & Cotas
            </a>
            <a href="/tecnologia-assistiva/" style="display:block; padding:1rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; text-decoration:none; color:#0f172a; font-weight:600;">
                💻 Tecnologia Assistiva
            </a>
            <a href="/mobilidade/" style="display:block; padding:1rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; text-decoration:none; color:#0f172a; font-weight:600;">
                🚗 Mobilidade Urbana
            </a>
            <a href="/isencoes/" style="display:block; padding:1rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; text-decoration:none; color:#0f172a; font-weight:600;">
                🏷️ Isenções Tributárias
            </a>
            <a href="/documentacao/" style="display:block; padding:1rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; text-decoration:none; color:#0f172a; font-weight:600;">
                📋 Laudos & Documentos
            </a>
            <a href="/ferramentas/" style="display:block; padding:1rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; text-decoration:none; color:#0f172a; font-weight:600;">
                🧮 Central de Ferramentas
            </a>
            <a href="/instituicoes/" style="display:block; padding:1rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; text-decoration:none; color:#0f172a; font-weight:600;">
                🤝 Diretório de Apoio
            </a>
            <a href="/palestras/" style="display:block; padding:1rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; text-decoration:none; color:#0f172a; font-weight:600;">
                🎤 Palestras Corporativas
            </a>
        </div>

        <a href="/" class="btn btn-primary" style="padding:0.85rem 2rem; font-size:1.05rem;">
            Voltar para a Página Inicial
        </a>
    </div>
  `
});

fs.writeFileSync(path.join(__dirname, '404.html'), html404, 'utf8');
console.log('✅ Atualizado 404.html');

console.log('✅ Áreas 11, 12, 13 e Institucional concluídas com sucesso!');
