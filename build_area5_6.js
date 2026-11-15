const fs = require('fs');
const path = require('path');
const { buildPageHtml } = require('./build_multipage_portal');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writePage(relPath, pageData) {
  const fullPath = path.join(__dirname, relPath);
  ensureDir(path.dirname(fullPath));
  const html = buildPageHtml(pageData);
  fs.writeFileSync(fullPath, html, 'utf8');
  console.log(`✅ Gerada página: ${relPath}`);
}

// -------------------------------------------------------------
// ÁREA 5: EMPREGO E CARREIRA (/emprego/)
// -------------------------------------------------------------
const empregoSubnav = [
  { name: 'Visão Geral', url: '/emprego/' },
  { name: 'Lei de Cotas (Art. 93)', url: '/emprego/lei-de-cotas/' },
  { name: 'Vagas PcD', url: '/emprego/vagas-pcd/' },
  { name: 'Currículo Inclusivo', url: '/emprego/curriculo/' },
  { name: 'Entrevistas', url: '/emprego/entrevistas/' },
  { name: 'Qualificação', url: '/emprego/qualificacao/' },
  { name: 'Direitos Trabalhistas', url: '/emprego/direitos-trabalhistas/' }
];

const empregoTools = [
  { name: 'Calculadora da Lei de Cotas', url: '/ferramentas/calculadora-cotas/' },
  { name: 'Mural de Oportunidades', url: '/oportunidades/' },
  { name: 'Palestras para RHs com Moisés Souza', url: '/palestras/' }
];

// /emprego/ (Hub)
writePage('emprego/index.html', {
  url: '/emprego/',
  title: 'Emprego e Carreira para Pessoas com Deficiência • Vagas e Lei de Cotas',
  description: 'Mural de vagas afirmativas, cumprimento da Lei de Cotas (Art. 93 da Lei 8.213/91), elaboração de currículo inclusivo e direitos no ambiente corporativo.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Emprego & Carreira', url: '/emprego/' }],
  badge: 'INCLUSÃO & MERCADO DE TRABALHO',
  h1: 'Emprego, Carreira e Lei de Cotas PcD',
  lead: 'Trabalho é dignidade e independência. Descubra como funciona a Lei de Cotas, conheça seus direitos trabalhistas e encontre vagas em empresas comprometidas com a inclusão.',
  subnavLinks: empregoSubnav,
  bodyHtml: `
    <h2>Inclusão Real no Mercado Corporativo</h2>
    <p>O Brasil conta com a <strong>Lei Federal nº 8.213/1991 (Artigo 93)</strong>, que obriga empresas com 100 ou mais empregados a preencherem de 2% a 5% dos seus cargos com beneficiários reabilitados ou pessoas com deficiência habilitadas.</p>

    <div class="category-grid" style="grid-template-columns:1fr 1fr; gap:1.25rem; margin:1.5rem 0;">
      <a href="/emprego/lei-de-cotas/" class="category-card">
        <h3 class="category-title">A Lei de Cotas em Detalhes</h3>
        <p class="category-desc">Faixas de percentual obrigatório, fiscalização do Ministério do Trabalho e multas.</p>
      </a>
      <a href="/emprego/vagas-pcd/" class="category-card">
        <h3 class="category-title">Mural de Vagas Afirmativas</h3>
        <p class="category-desc">Oportunidades de emprego em regime presencial, híbrido e 100% home office para PcD.</p>
      </a>
      <a href="/emprego/curriculo/" class="category-card">
        <h3 class="category-title">Currículo Inclusivo</h3>
        <p class="category-desc">Como mencionar laudo médico, CID e necessidades de acessibilidade de forma estratégica.</p>
      </a>
      <a href="/emprego/entrevistas/" class="category-card">
        <h3 class="category-title">Entrevistas e Processos Seletivos</h3>
        <p class="category-desc">Acessibilidade nas dinâmicas, o que pode e não pode ser perguntado pelos recrutadores.</p>
      </a>
      <a href="/emprego/qualificacao/" class="category-card">
        <h3 class="category-title">Cursos e Qualificação Gratuita</h3>
        <p class="category-desc">Capacitação profissional gratuita em tecnologia, administração e programas de aprendizagem.</p>
      </a>
      <a href="/emprego/direitos-trabalhistas/" class="category-card">
        <h3 class="category-title">Direitos Trabalhistas da PcD</h3>
        <p class="category-desc">Horário especial, estabilidade na demissão imotivada e adaptações razoáveis no posto.</p>
      </a>
    </div>

    <div class="info-callout success">
      <strong>Ferramenta Corporativa:</strong> Use nossa <a href="/ferramentas/calculadora-cotas/"><strong>Calculadora da Lei de Cotas</strong></a> para calcular o número de vagas exigidas e o risco fiscal de autuações para sua empresa.
    </div>
  `,
  sidebarTitle: 'Guias de Emprego',
  sidebarLinks: empregoSubnav,
  sidebarTools: empregoTools
});

// /emprego/lei-de-cotas/
writePage('emprego/lei-de-cotas/index.html', {
  url: '/emprego/lei-de-cotas/',
  title: 'Lei de Cotas PcD (Artigo 93 da Lei 8.213/91) • Tabela de Percentuais e Multas',
  description: 'Tudo sobre a Lei de Cotas: tabela de 2% a 5%, quem conta para a cota, fiscalização da SIT/MTE e jurisprudência sobre estabilidade e demissão.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Emprego', url: '/emprego/' }, { name: 'Lei de Cotas', url: '/emprego/lei-de-cotas/' }],
  badge: 'ARTIGO 93 DA LEI 8.213/1991',
  h1: 'Tudo Sobre a Lei de Cotas PcD (Art. 93)',
  lead: 'A Lei de Cotas é o principal mecanismo afirmativo de empregabilidade da pessoa com deficiência no setor privado brasileiro há mais de 30 anos.',
  subnavLinks: empregoSubnav,
  bodyHtml: `
    <h2>Tabela de Percentuais Obrigatórios</h2>
    <div class="legal-box">
      <strong>Art. 93 da Lei 8.213/91:</strong> A empresa com 100 (cem) ou mais empregados está obrigada a preencher de 2% (dois por cento) a 5% (cinco por cento) dos seus cargos com beneficiários reabilitados ou pessoas portadoras de deficiência, habilitadas, na seguinte proporção:<br><br>
      • Até 200 empregados: <strong>2%</strong>;<br>
      • De 201 a 500 empregados: <strong>3%</strong>;<br>
      • De 501 a 1.000 empregados: <strong>4%</strong>;<br>
      • De 1.001 em diante: <strong>5%</strong>.
    </div>

    <h2>Proteção Contra a Demissão Imotivada (§ 1º do Art. 93)</h2>
    <p>A dispensa de empregado com deficiência ou reabilitado ao final de contrato por prazo determinado de mais de 90 dias e a imotivada, no contrato por prazo indeterminado, <strong>só poderá ocorrer após a contratação de outro trabalhador com deficiência ou reabilitado</strong>, caso a empresa não esteja com a cota preenchida.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: empregoSubnav,
  sidebarTools: empregoTools
});

// /emprego/vagas-pcd/
writePage('emprego/vagas-pcd/index.html', {
  url: '/emprego/vagas-pcd/',
  title: 'Vagas de Emprego PcD • Oportunidades Inclusivas no Brasil',
  description: 'Encontre vagas de trabalho exclusivas para pessoas com deficiência: cargos administrativos, tecnologia, teletrabalho e programas de estágio e trainee.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Emprego', url: '/emprego/' }, { name: 'Vagas PcD', url: '/emprego/vagas-pcd/' }],
  badge: 'MURAL DE EMPREGOS',
  h1: 'Oportunidades de Emprego PcD',
  lead: 'Acompanhe vagas afirmativas cadastradas por organizações comprometidas com a acessibilidade atitudinal e a inclusão profissional de talentos com deficiência.',
  subnavLinks: empregoSubnav,
  bodyHtml: `
    <h2>Vagas Ativas no Portal</h2>
    <p>Abaixo estão as oportunidades com processo seletivo aberto. Candidate-se diretamente através dos links de contato:</p>
    
    <div class="instituicoes-grid" id="vagasGrid" style="margin:2rem 0;">
      <!-- Carregado dinamicamente via StackCP MySQL -->
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: empregoSubnav,
  sidebarTools: empregoTools
});

// /emprego/curriculo/
writePage('emprego/curriculo/index.html', {
  url: '/emprego/curriculo/',
  title: 'Como Fazer um Currículo PcD Atraente • Dicas e Cuidados com Laudo',
  description: 'Aprenda como estruturar seu currículo destacando competências e experiências profissionais, como mencionar o laudo médico (CID) e recursos de acessibilidade.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Emprego', url: '/emprego/' }, { name: 'Currículo Inclusivo', url: '/emprego/curriculo/' }],
  badge: 'DICAS DE CARREIRA',
  h1: 'Como Estruturar um Currículo PcD Eficiente',
  lead: 'O currículo deve valorizar seu talento profissional em primeiro lugar. A menção à deficiência deve ser clara e orientada às condições de acessibilidade.',
  subnavLinks: empregoSubnav,
  bodyHtml: `
    <h2>Estrutura Recomendada</h2>
    <ul>
      <li><strong>Dados Pessoais:</strong> Nome completo, telefone/WhatsApp, e-mail e cidade/estado. Não coloque números de CPF nem endereço completo por segurança;</li>
      <li><strong>Enquadramento PcD:</strong> Mencione de forma sucinta ao final dos dados pessoais (Exemplo: <em>Pessoa com Deficiência Física - CID 10: G80.0 / Necessita de rampa e leitor de tela</em>);</li>
      <li><strong>Objetivo Profissional:</strong> Direto e claro para a área de interesse;</li>
      <li><strong>Experiência Profissional:</strong> Em ordem cronológica inversa (da mais recente para a mais antiga);</li>
      <li><strong>Formação e Cursos:</strong> Graduação, cursos técnicos e certificações.</li>
    </ul>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: empregoSubnav,
  sidebarTools: empregoTools
});

// /emprego/entrevistas/
writePage('emprego/entrevistas/index.html', {
  url: '/emprego/entrevistas/',
  title: 'Entrevistas de Emprego PcD • O que é Permitido e Como se Preparar',
  description: 'Dicas práticas para se destacar em entrevistas de seleção, solicitar recursos de acessibilidade prévios e conhecer perguntas proibidas pela legislação.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Emprego', url: '/emprego/' }, { name: 'Entrevistas', url: '/emprego/entrevistas/' }],
  badge: 'PROCESSOS SELETIVOS',
  h1: 'Acessibilidade em Entrevistas de Emprego',
  lead: 'A entrevista deve avaliar sua capacidade técnica e perfil profissional. A empresa é obrigada a fornecer todos os recursos de acessibilidade para sua participação plena.',
  subnavLinks: empregoSubnav,
  bodyHtml: `
    <h2>Direito à Acessibilidade no Processo Seletivo</h2>
    <p>O candidato tem direito a solicitar com antecedência intérprete de Libras, link de entrevista com legendas em tempo real ou sala acessível no caso de dinâmicas presenciais.</p>
    <div class="info-callout warning">
      <strong>Perguntas Proibidas:</strong> É vedado ao recrutador fazer perguntas invasivas sobre a causa íntima da deficiência, planos reprodutivos ou questionar a capacidade de viver sozinho de forma capacitista.
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: empregoSubnav,
  sidebarTools: empregoTools
});

// /emprego/qualificacao/
writePage('emprego/qualificacao/index.html', {
  url: '/emprego/qualificacao/',
  title: 'Cursos Gratuitos e Capacitação Profissional para PcD',
  description: 'Onde encontrar cursos gratuitos de qualificação, programas do Sistema S (Senai/Senac), certificações em tecnologia e programas de aprendizagem profissional.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Emprego', url: '/emprego/' }, { name: 'Qualificação', url: '/emprego/qualificacao/' }],
  badge: 'CAPACITAÇÃO PROFISSIONAL',
  h1: 'Cursos e Formação Profissional para PcD',
  lead: 'A qualificação contínua é a chave para disputar cargos de liderança, superar barreiras salariais e construir uma carreira de sucesso no mercado de trabalho.',
  subnavLinks: empregoSubnav,
  bodyHtml: `
    <h2>Onde Encontrar Cursos Gratuitos com Acessibilidade</h2>
    <ul>
      <li><strong>Programa SENAI de Ações Inclusivas (PSAI):</strong> Cursos profissionalizantes com tradutores de Libras e materiais adaptados;</li>
      <li><strong>Escola Virtual de Governo (EV.G):</strong> Cursos online e gratuitos de administração, gestão e comunicação;</li>
      <li><strong>Plataformas de Tecnologia:</strong> Cursos de programação, QA e dados voltados à inclusão de pessoas com deficiência.</li>
    </ul>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: empregoSubnav,
  sidebarTools: empregoTools
});

// /emprego/direitos-trabalhistas/
writePage('emprego/direitos-trabalhistas/index.html', {
  url: '/emprego/direitos-trabalhistas/',
  title: 'Direitos Trabalhistas da PcD • Horário Especial, Adaptação e Estabilidade',
  description: 'Conheça os direitos trabalhistas previstos na CLT e LBI: adaptações ergonômicas no trabalho, horário especial para terapias e estabilidade.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Emprego', url: '/emprego/' }, { name: 'Direitos Trabalhistas', url: '/emprego/direitos-trabalhistas/' }],
  badge: 'DIREITO DO TRABALHO & LBI',
  h1: 'Direitos Trabalhistas da Pessoa com Deficiência',
  lead: 'A CLT e a Lei Brasileira de Inclusão asseguram a igualdade salarial, a adaptação obrigatória do mobiliário e a vedação absoluta de discriminação no ambiente de trabalho.',
  subnavLinks: empregoSubnav,
  bodyHtml: `
    <h2>Adaptações Razoáveis no Posto de Trabalho</h2>
    <p>O empregador é obrigado a fornecer mobiliário ergonômico, teclados adaptados, softwares leitores de tela e banheiros acessíveis. A recusa injustificada de adaptações razoáveis configura discriminação punível por lei (Art. 34 da LBI).</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: empregoSubnav,
  sidebarTools: empregoTools
});

// -------------------------------------------------------------
// ÁREA 6: TECNOLOGIA ASSISTIVA (/tecnologia-assistiva/)
// -------------------------------------------------------------
const tecnologiaSubnav = [
  { name: 'Visão Geral', url: '/tecnologia-assistiva/' },
  { name: 'Aplicativos', url: '/tecnologia-assistiva/aplicativos/' },
  { name: 'Leitores de Tela', url: '/tecnologia-assistiva/leitores-de-tela/' },
  { name: 'Comunicação (CAA)', url: '/tecnologia-assistiva/comunicacao/' },
  { name: 'Equipamentos & FGTS', url: '/tecnologia-assistiva/equipamentos/' },
  { name: 'Inteligência Artificial', url: '/tecnologia-assistiva/inteligencia-artificial/' }
];

// /tecnologia-assistiva/ (Hub)
writePage('tecnologia-assistiva/index.html', {
  url: '/tecnologia-assistiva/',
  title: 'Tecnologia Assistiva para PcD • Equipamentos, Softwares e Aplicativos',
  description: 'Guia de tecnologia assistiva: leitores de tela gratuitos (NVDA), comunicação alternativa, cadeiras motorizadas, próteses pelo SUS e saque do FGTS.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Tecnologia Assistiva', url: '/tecnologia-assistiva/' }],
  badge: 'INOVAÇÃO & AUTONOMIA',
  h1: 'Tecnologia Assistiva & Recursos de Acessibilidade',
  lead: 'A tecnologia assistiva abrange produtos, recursos, metodologias, estratégias e serviços que promovem a funcionalidade e autonomia da pessoa com deficiência.',
  subnavLinks: tecnologiaSubnav,
  bodyHtml: `
    <h2>Autonomia Através da Tecnologia</h2>
    <p>Conforme o Artigo 74 da Lei Brasileira de Inclusão, é garantido à pessoa com deficiência acesso a produtos, recursos, estratégias, práticas, processos, métodos e serviços de tecnologia assistiva que maximizem sua autonomia e inclusão social.</p>

    <div class="category-grid" style="grid-template-columns:1fr 1fr; gap:1.25rem; margin:1.5rem 0;">
      <a href="/tecnologia-assistiva/aplicativos/" class="category-card">
        <h3 class="category-title">Aplicativos Úteis</h3>
        <p class="category-desc">Apps de navegação acessível, transcrição de áudio e rotas para cadeirantes.</p>
      </a>
      <a href="/tecnologia-assistiva/leitores-de-tela/" class="category-card">
        <h3 class="category-title">Leitores de Tela Gratuitos</h3>
        <p class="category-desc">Como configurar e utilizar NVDA no Windows, TalkBack no Android e VoiceOver no iOS.</p>
      </a>
      <a href="/tecnologia-assistiva/comunicacao/" class="category-card">
        <h3 class="category-title">Comunicação Alternativa (CAA)</h3>
        <p class="category-desc">Pranchas de comunicação, símbolos e comunicadores com sintetizador de voz.</p>
      </a>
      <a href="/tecnologia-assistiva/equipamentos/" class="category-card">
        <h3 class="category-title">Equipamentos & Saque do FGTS</h3>
        <p class="category-desc">Como sacar o FGTS para adquirir próteses e cadeiras de rodas de alto padrão.</p>
      </a>
      <a href="/tecnologia-assistiva/inteligencia-artificial/" class="category-card">
        <h3 class="category-title">Inteligência Artificial Acessível</h3>
        <p class="category-desc">Audiodescrição em tempo real, reconhecimento de imagens e legendagem instantânea.</p>
      </a>
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: tecnologiaSubnav,
  sidebarTools: [{ name: 'Requerimento de FGTS para Prótese', url: '/ferramentas/gerador-requerimentos/' }]
});

// /tecnologia-assistiva/aplicativos/
writePage('tecnologia-assistiva/aplicativos/index.html', {
  url: '/tecnologia-assistiva/aplicativos/',
  title: 'Melhores Aplicativos de Acessibilidade para PcD no Celular',
  description: 'Seleção de apps gratuitos para smartphones: Be My Eyes, Lookout do Google, VLibras, Cittamobi Acessível e Guias de Rota para cadeirantes.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Tecnologia Assistiva', url: '/tecnologia-assistiva/' }, { name: 'Aplicativos', url: '/tecnologia-assistiva/aplicativos/' }],
  badge: 'APPS & SMARTPHONES',
  h1: 'Aplicativos Móveis de Acessibilidade',
  lead: 'Ferramentas gratuitas na palma da mão para transformar seu smartphone em um assistente de visão, audição, mobilidade e comunicação diária.',
  subnavLinks: tecnologiaSubnav,
  bodyHtml: `
    <h2>Principais Aplicativos Gratuitos</h2>
    <ul>
      <li><strong>Be My Eyes:</strong> Conecta pessoas cegas a voluntários que auxiliam na identificação de objetos e leitura de rótulos por vídeo em tempo real;</li>
      <li><strong>Lookout (Google):</strong> Utiliza a câmera do celular com inteligência artificial para ler textos, identificar dinheiro e reconhecer alimentos;</li>
      <li><strong>VLibras:</strong> Traduz automaticamente textos e áudios em português para a Língua Brasileira de Sinais através de um avatar 3D;</li>
      <li><strong>Cittamobi Acessível:</strong> Avisos sonoros e vibração que informam ao passageiro com deficiência visual a aproximação e parada do ônibus.</li>
    </ul>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: tecnologiaSubnav
});

// /tecnologia-assistiva/leitores-de-tela/
writePage('tecnologia-assistiva/leitores-de-tela/index.html', {
  url: '/tecnologia-assistiva/leitores-de-tela/',
  title: 'Leitores de Tela Gratuitos • NVDA, TalkBack e VoiceOver',
  description: 'Guia completo para aprender a usar leitores de tela no computador e no celular. Atalhos de teclado, configuração de velocidade de voz e vozes pt-BR.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Tecnologia Assistiva', url: '/tecnologia-assistiva/' }, { name: 'Leitores de Tela', url: '/tecnologia-assistiva/leitores-de-tela/' }],
  badge: 'SOFTWARES DE LEITURA',
  h1: 'Leitores de Tela no Computador e Celular',
  lead: 'Os leitores de tela convertem o conteúdo visual da tela em fala sintetizada ou saída em linha braille, garantindo a autonomia completa de pessoas cegas.',
  subnavLinks: tecnologiaSubnav,
  bodyHtml: `
    <h2>NVDA (NonVisual Desktop Access)</h2>
    <p>O NVDA é o leitor de tela gratuito e de código aberto mais utilizado no mundo para computadores com sistema operacional Windows. Suporta navegação web, pacotes de escritório e comandos acessíveis.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: tecnologiaSubnav
});

// /tecnologia-assistiva/comunicacao/
writePage('tecnologia-assistiva/comunicacao/index.html', {
  url: '/tecnologia-assistiva/comunicacao/',
  title: 'Comunicação Aumentativa e Alternativa (CAA) para PcD',
  description: 'Conheça pranchas de comunicação, aplicativos com sintetizador de voz e recursos para pessoas não-verbais ou com dificuldades severas de fala.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Tecnologia Assistiva', url: '/tecnologia-assistiva/' }, { name: 'Comunicação (CAA)', url: '/tecnologia-assistiva/comunicacao/' }],
  badge: 'COMUNICAÇÃO ALTERNATIVA',
  h1: 'Comunicação Aumentativa e Alternativa (CAA)',
  lead: 'Garantir que todas as pessoas possam expressar seus desejos, sentimentos e pensamentos, independentemente do uso da fala oral articulada.',
  subnavLinks: tecnologiaSubnav,
  bodyHtml: `
    <h2>Recursos de Baixa e Alta Tecnologia</h2>
    <p>A CAA utiliza pranchas com figuras e símbolos táteis (baixa tecnologia) ou tablets e softwares com saída de voz sintetizada (alta tecnologia), viabilizando a socialização de pessoas com paralisia cerebral, autismo e ELA.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: tecnologiaSubnav
});

// /tecnologia-assistiva/equipamentos/
writePage('tecnologia-assistiva/equipamentos/index.html', {
  url: '/tecnologia-assistiva/equipamentos/',
  title: 'Saque do FGTS para Órteses e Próteses • Decreto 9.345/18',
  description: 'Saiba como utilizar o saldo da conta do FGTS para comprar cadeiras de rodas motorizadas, próteses e órteses de alta tecnologia conforme a lei.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Tecnologia Assistiva', url: '/tecnologia-assistiva/' }, { name: 'Equipamentos & FGTS', url: '/tecnologia-assistiva/equipamentos/' }],
  badge: 'DECRETO FEDERAL Nº 9.345/2018',
  h1: 'Saque do FGTS para Aquisição de Órteses e Próteses',
  lead: 'Trabalhadores com deficiência podem utilizar o saldo de sua conta vinculada do FGTS para custear a aquisição ou adaptação de próteses e órteses.',
  subnavLinks: tecnologiaSubnav,
  bodyHtml: `
    <h2>Quem pode sacar o FGTS?</h2>
    <p>O trabalhador titular da conta que possua deficiência de natureza física ou sensorial (ou que tenha dependente com deficiência) pode solicitar a liberação do valor mediante prescrição médica que ateste a necessidade da tecnologia assistiva.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: tecnologiaSubnav
});

// /tecnologia-assistiva/inteligencia-artificial/
writePage('tecnologia-assistiva/inteligencia-artificial/index.html', {
  url: '/tecnologia-assistiva/inteligencia-artificial/',
  title: 'Inteligência Artificial e Acessibilidade • Novas Fronteiras para PcD',
  description: 'Como a IA generativa está revolucionando a acessibilidade: audiodescrição automática, reconhecimento de gestos em Libras e navegação por voz preditiva.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Tecnologia Assistiva', url: '/tecnologia-assistiva/' }, { name: 'Inteligência Artificial', url: '/tecnologia-assistiva/inteligencia-artificial/' }],
  badge: 'FUTURO DA ACESSIBILIDADE',
  h1: 'Inteligência Artificial a Serviço da Inclusão',
  lead: 'Modelos de visão computacional e processamento de linguagem natural estão tornando o mundo digital cada vez mais autônomo para pessoas com deficiência.',
  subnavLinks: tecnologiaSubnav,
  bodyHtml: `
    <h2>Aplicações Práticas da IA</h2>
    <ul>
      <li><strong>Audiodescrição em Tempo Real:</strong> Algoritmos que leem telas e descrevem fotos e gráficos complexos para pessoas cegas;</li>
      <li><strong>Tradução Automática para Libras:</strong> Redes neurais que captam expressões faciais e convertem fala em sinais;</li>
      <li><strong>Controle de Computador por Movimento Ocular:</strong> Softwares inteligentes que permitem pessoas tetraplégicas controlarem o cursor com os olhos.</li>
    </ul>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: tecnologiaSubnav
});

console.log('✅ Áreas 5 e 6 concluídas com sucesso!');
