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
// ÁREA 3: SAÚDE E QUALIDADE DE VIDA (/saude/)
// -------------------------------------------------------------
const saudeSubnav = [
  { name: 'Visão Geral', url: '/saude/' },
  { name: 'Reabilitação (CER IV)', url: '/saude/reabilitacao/' },
  { name: 'Fisioterapia SUS', url: '/saude/fisioterapia/' },
  { name: 'Terapias (ABA & T.O.)', url: '/saude/terapias/' },
  { name: 'Saúde Mental', url: '/saude/saude-mental/' },
  { name: 'Direitos na Saúde', url: '/saude/direitos-na-saude/' }
];

const saudeTools = [
  { name: 'Diretório de Centros de Reabilitação', url: '/instituicoes/' },
  { name: 'Gerador de Pedidos Médicos', url: '/ferramentas/gerador-requerimentos/' }
];

// /saude/ (Hub)
writePage('saude/index.html', {
  url: '/saude/',
  title: 'Saúde e Qualidade de Vida para Pessoas com Deficiência • SUS e Direitos',
  description: 'Conheça os direitos de saúde da pessoa com deficiência: Centros de Reabilitação CER IV, fornecimento de remédios de alto custo pelo SUS, fisioterapia e terapias.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Saúde & Qualidade de Vida', url: '/saude/' }],
  badge: 'SUS & REDE DE CUIDADOS PCD',
  h1: 'Saúde, Reabilitação e Qualidade de Vida',
  lead: 'O Sistema Único de Saúde (SUS) e a legislação asseguram atendimento prioritário, terapias contínuas especializadas e reabilitação integral sem custos para pessoas com deficiência.',
  subnavLinks: saudeSubnav,
  bodyHtml: `
    <h2>Acesso Universal e Gratuito à Saúde Especializada</h2>
    <p>A Lei Brasileira de Inclusão (Arts. 18 a 26) estabelece que a pessoa com deficiência tem direito a atenção integral à saúde em todos os níveis de complexidade do SUS, incluindo habilitação, reabilitação física, auditiva, visual e intelectual, bem como suporte precoce e intervenções multidisciplinares.</p>

    <div class="category-grid" style="grid-template-columns:1fr 1fr; gap:1.25rem; margin:1.5rem 0;">
      <a href="/saude/reabilitacao/" class="category-card">
        <h3 class="category-title">Centros de Reabilitação (CER IV)</h3>
        <p class="category-desc">Rede especializada com equipes multiprofissionais de médicos, fonoaudiólogos e psicólogos.</p>
      </a>
      <a href="/saude/fisioterapia/" class="category-card">
        <h3 class="category-title">Fisioterapia e Hidroterapia</h3>
        <p class="category-desc">Acesso contínuo a sessões de fisioterapia motora, respiratória e hidroterapia pelo SUS.</p>
      </a>
      <a href="/saude/terapias/" class="category-card">
        <h3 class="category-title">Terapias Multidisciplinares (ABA)</h3>
        <p class="category-desc">Direito a método ABA, fonoaudiologia e terapia ocupacional sem limitação de sessões pelos planos.</p>
      </a>
      <a href="/saude/saude-mental/" class="category-card">
        <h3 class="category-title">Saúde Mental e Acolhimento</h3>
        <p class="category-desc">Prevenção do esgotamento emocional de cuidadores familiares e mães atípicas.</p>
      </a>
      <a href="/saude/direitos-na-saude/" class="category-card">
        <h3 class="category-title">Remédios de Alto Custo & Home Care</h3>
        <p class="category-desc">Como solicitar medicamentos especiais pelo Componente Especializado do SUS e internação domiciliar.</p>
      </a>
    </div>
  `,
  sidebarTitle: 'Guias de Saúde',
  sidebarLinks: saudeSubnav,
  sidebarTools: saudeTools
});

// /saude/reabilitacao/
writePage('saude/reabilitacao/index.html', {
  url: '/saude/reabilitacao/',
  title: 'Centros Especializados em Reabilitação (CER IV) • Como Acessar pelo SUS',
  description: 'Saiba o que são os Centros Especializados em Reabilitação (CER), como ser encaminhado via UBS e quais tratamentos gratuitos são oferecidos.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Saúde', url: '/saude/' }, { name: 'Reabilitação (CER IV)', url: '/saude/reabilitacao/' }],
  badge: 'PORTARIA MS Nº 793/2012',
  h1: 'Centros Especializados em Reabilitação (CER)',
  lead: 'Os CER são unidades ambulatoriais do SUS voltadas ao atendimento diagnóstico e reabilitatório de pessoas com deficiência física, intelectual, visual e auditiva.',
  subnavLinks: saudeSubnav,
  bodyHtml: `
    <h2>Modalidades de Atendimento no CER</h2>
    <p>Conforme o número de deficiências atendidas, a unidade é classificada pelo Ministério da Saúde em CER II, CER III ou CER IV (atendendo as quatro modalidades):</p>
    <ul>
      <li><strong>Deficiência Física:</strong> Sequelas de AVC, traumatismos, paralisia cerebral, amputações e distrofias;</li>
      <li><strong>Deficiência Intelectual / Autismo:</strong> Estimulação precoce, avaliação neuropsicológica e adaptação;</li>
      <li><strong>Deficiência Visual:</strong> Treinamento de orientação e mobilidade com bengala, recursos ópticos e estimulação visual;</li>
      <li><strong>Deficiência Auditiva:</strong> Triagem auditiva, fonoaudiologia e adaptação de aparelhos de amplificação sonora (AASI).</li>
    </ul>

    <h2>Como Conseguir Encaminhamento</h2>
    <p>O primeiro passo é comparecer à <strong>Unidade Básica de Saúde (UBS / Posto de Saúde)</strong> mais próxima. O médico da família avaliará o caso e inserirá a solicitação no sistema de regulação municipal/estadual (CROSS / SISREG).</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: saudeSubnav,
  sidebarTools: saudeTools
});

// /saude/fisioterapia/
writePage('saude/fisioterapia/index.html', {
  url: '/saude/fisioterapia/',
  title: 'Direito a Fisioterapia e Hidroterapia pelo SUS • Acesso sem Interrupção',
  description: 'Conheça o direito a sessões contínuas de fisioterapia motora e hidroterapia pelo SUS para manutenção funcional e prevenção de deformidades.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Saúde', url: '/saude/' }, { name: 'Fisioterapia', url: '/saude/fisioterapia/' }],
  badge: 'DIREITO À REABILITAÇÃO',
  h1: 'Fisioterapia e Hidroterapia no SUS',
  lead: 'A reabilitação motora contínua é fundamental para manter a autonomia e prevenir complicações osteomoleculares em pessoas com deficiência física ou neurológica.',
  subnavLinks: saudeSubnav,
  bodyHtml: `
    <h2>Continuidade do Tratamento</h2>
    <p>A jurisprudência brasileira reconhece que a interrupção arbitrária de fisioterapia prescrita por médico para pessoas com deficiência viola o direito à saúde e o princípio da dignidade da pessoa humana.</p>
    <div class="info-callout success">
      <strong>Direito à Hidroterapia:</strong> Caso o município não possua piscina aquecida na rede própria, a Justiça determina que o poder público custeie o tratamento em clínicas conveniadas ou particulares.
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: saudeSubnav,
  sidebarTools: saudeTools
});

// /saude/terapias/
writePage('saude/terapias/index.html', {
  url: '/saude/terapias/',
  title: 'Terapias para Autismo e PcD • ABA, Fono e T.O. sem Limite de Sessões',
  description: 'Decisão da ANS e Lei Berenice Piana garantem cobertura ilimitada de terapia ABA, fonoaudiologia e terapia ocupacional por planos de saúde e no SUS.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Saúde', url: '/saude/' }, { name: 'Terapias Multidisciplinares', url: '/saude/terapias/' }],
  badge: 'RESOLUÇÃO NORMATIVA ANS Nº 539/22',
  h1: 'Cobertura de Terapias Especiais (ABA, Fono e T.O.)',
  lead: 'Desde 2022, a Agência Nacional de Saúde Suplementar (ANS) proibiu os planos de saúde de limitarem a quantidade de sessões de psicoterapia, fonoaudiologia, terapia ocupacional e fisioterapia para pessoas com TEA e PcD.',
  subnavLinks: saudeSubnav,
  bodyHtml: `
    <h2>Fim da Limitação de Sessões</h2>
    <p>A Resolução Normativa nº 539/2022 da ANS tornou obrigatória a cobertura de qualquer método ou técnica prescrita pelo médico assistente para o tratamento de transtornos globais do desenvolvimento (como autismo e síndromes raras).</p>
    <ul>
      <li><strong>Método ABA (Applied Behavior Analysis);</strong></li>
      <li><strong>Integração Sensorial de Ayres na Terapia Ocupacional;</strong></li>
      <li><strong>Método Bobath e Pediasuit para reabilitação neurofuncional.</strong></li>
    </ul>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: saudeSubnav,
  sidebarTools: saudeTools
});

// /saude/saude-mental/
writePage('saude/saude-mental/index.html', {
  url: '/saude/saude-mental/',
  title: 'Saúde Mental para Famílias Atípicas e Cuidadores de PcD',
  description: 'Acolhimento psicológico, suporte emocional e prevenção da síndrome de burnout em mães atípicas e cuidadores principais de pessoas com deficiência.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Saúde', url: '/saude/' }, { name: 'Saúde Mental', url: '/saude/saude-mental/' }],
  badge: 'ACOLHIMENTO & AUTOCUIDADO',
  h1: 'Saúde Mental da Família e dos Cuidadores',
  lead: 'Cuidar de quem cuida é indispensável. A sobrecarga física e emocional de famílias atípicas requer políticas públicas de apoio e redes de solidariedade.',
  subnavLinks: saudeSubnav,
  bodyHtml: `
    <h2>A Realidade das Mães Atípicas no Brasil</h2>
    <p>Estudos apontam que mais de 75% dos cuidadores principais de pessoas com deficiência severa são mulheres (mães ou avós), muitas vezes em situação de abandono paterno. O estresse crônico decorrente de rotinas hospitalares intensas e preconceito exige acompanhamento psicológico preventivo.</p>
    <div class="info-callout success">
      <strong>Programa Respira:</strong> Desenvolvido por Moisés Souza, a consultoria oferece encontros e palestras corporativas com foco no acolhimento de colaboradores que são pais de pessoas com deficiência.
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: saudeSubnav,
  sidebarTools: saudeTools
});

// /saude/direitos-na-saude/
writePage('saude/direitos-na-saude/index.html', {
  url: '/saude/direitos-na-saude/',
  title: 'Remédios de Alto Custo e Home Care pelo SUS • Como Conseguir na Justiça',
  description: 'Passo a passo para requerer medicamentos que não constam na lista do SUS (Farmácia de Alto Custo) e serviços de internação domiciliar (Home Care).',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Saúde', url: '/saude/' }, { name: 'Direitos na Saúde', url: '/saude/direitos-na-saude/' }],
  badge: 'TEMA 106 DO STJ',
  h1: 'Medicamentos de Alto Custo & Home Care',
  lead: 'O direito à vida e à saúde sobrepõe-se a restrições orçamentárias. Conheça as regras fixadas pelos tribunais para obtenção de remédios especiais.',
  subnavLinks: saudeSubnav,
  bodyHtml: `
    <h2>Critérios do STJ para Fornecimento de Remédios (Tema 106)</h2>
    <p>Para obter judicialmente remédios não incorporados ao SUS, a pessoa com deficiência deve comprovar através de laudo médico fundamentado:</p>
    <ol>
      <li>Comprovação da imprescindibilidade ou necessidade do medicamento e a ineficácia dos fármacos fornecidos pelo SUS;</li>
      <li>Incapacidade financeira da família de arcar com o custo do medicamento prescrito;</li>
      <li>Existência de registro do medicamento na Anvisa.</li>
    </ol>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: saudeSubnav,
  sidebarTools: saudeTools
});

// -------------------------------------------------------------
// ÁREA 4: EDUCAÇÃO INCLUSIVA (/educacao/)
// -------------------------------------------------------------
const educacaoSubnav = [
  { name: 'Visão Geral', url: '/educacao/' },
  { name: 'Apoio Escolar & AEE', url: '/educacao/educacao-inclusiva/' },
  { name: 'Universidade', url: '/educacao/universidade/' },
  { name: 'Cotas no SISU', url: '/educacao/cotas/' },
  { name: 'Tecnologia Pedagógica', url: '/educacao/tecnologia-assistiva/' },
  { name: 'Direitos do Estudante', url: '/educacao/direitos-do-estudante/' }
];

const educacaoTools = [
  { name: 'Requerimento de Apoio Escolar Gratuito', url: '/ferramentas/gerador-requerimentos/' }
];

// /educacao/ (Hub)
writePage('educacao/index.html', {
  url: '/educacao/',
  title: 'Educação Inclusiva • Direitos do Estudante com Deficiência no Brasil',
  description: 'Garantias do estudante com deficiência: Profissional de Apoio Escolar sem cobrança de taxas, Atendimento Educacional Especializado (AEE) e cotas.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Educação Inclusiva', url: '/educacao/' }],
  badge: 'LBI ART. 28 & CONSTITUIÇÃO FEDERAL',
  h1: 'Educação Inclusiva & Cidadania Escolar',
  lead: 'A educação é direito de todos e dever do Estado e da família. Conheça as leis que garantem a matrícula obrigatória, adaptações curriculares e proibição de taxas extras.',
  subnavLinks: educacaoSubnav,
  bodyHtml: `
    <h2>A Escola Inclusiva é Obrigação Legal</h2>
    <p>O Artigo 28 da Lei Brasileira de Inclusão veda categoricamente qualquer forma de segregação escolar. Todas as instituições de ensino, públicas ou privadas, da educação infantil à pós-graduação, devem assegurar sistema educacional inclusivo em todos os níveis.</p>

    <div class="category-grid" style="grid-template-columns:1fr 1fr; gap:1.25rem; margin:1.5rem 0;">
      <a href="/educacao/educacao-inclusiva/" class="category-card">
        <h3 class="category-title">Profissional de Apoio Escolar</h3>
        <p class="category-desc">Direito a mediador individual sem cobrança de valor adicional em mensalidade ou matrícula.</p>
      </a>
      <a href="/educacao/universidade/" class="category-card">
        <h3 class="category-title">Acessibilidade no Ensino Superior</h3>
        <p class="category-desc">Núcleos de Acessibilidade (NAI), materiais em formato digital acessível e adaptação em provas.</p>
      </a>
      <a href="/educacao/cotas/" class="category-card">
        <h3 class="category-title">Cotas no SISU, ProUni e Fies</h3>
        <p class="category-desc">Reserva de vagas para estudantes com deficiência em universidades federais e faculdades privadas.</p>
      </a>
      <a href="/educacao/tecnologia-assistiva/" class="category-card">
        <h3 class="category-title">Recursos e Tecnologia Assistiva</h3>
        <p class="category-desc">Pranchas de comunicação, softwares de leitura e adaptações pedagógicas curriculares.</p>
      </a>
      <a href="/educacao/direitos-do-estudante/" class="category-card">
        <h3 class="category-title">Direitos do Estudante & PDI</h3>
        <p class="category-desc">Obrigatoriedade do Plano de Desenvolvimento Individualizado (PDI) e combate ao bullying escolar.</p>
      </a>
    </div>
  `,
  sidebarTitle: 'Guias de Educação',
  sidebarLinks: educacaoSubnav,
  sidebarTools: educacaoTools
});

// /educacao/educacao-inclusiva/
writePage('educacao/educacao-inclusiva/index.html', {
  url: '/educacao/educacao-inclusiva/',
  title: 'Profissional de Apoio Escolar e AEE • Regras da LBI e STF',
  description: 'Saiba como exigir profissional de apoio escolar e mediador sem cobrança de taxa adicional em escolas particulares e na rede pública.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Educação', url: '/educacao/' }, { name: 'Apoio Escolar', url: '/educacao/educacao-inclusiva/' }],
  badge: 'ADI 5357/STF & LBI ART. 28',
  h1: 'Profissional de Apoio Escolar & Atendimento Especializado',
  lead: 'O Supremo Tribunal Federal declarou a constitucionalidade da regra da LBI que proíbe escolas privadas de cobrarem valores extras para disponibilizar suporte a alunos com deficiência.',
  subnavLinks: educacaoSubnav,
  bodyHtml: `
    <h2>Quem é o Profissional de Apoio Escolar?</h2>
    <p>Conforme o Artigo 3º, XIII da LBI, o profissional de apoio escolar é a pessoa que exerce atividades de alimentação, higiene e locomoção do estudante com deficiência e atua em todas as atividades escolares nas quais se fizer necessária sua mediação.</p>

    <div class="legal-box">
      <strong>Decisão do STF na ADI 5357:</strong><br>
      As escolas privadas não podem repassar custos de adaptação ou cobrar mensalidades e taxas maiores de famílias de alunos com deficiência. O custo da inclusão é responsabilidade social da instituição de ensino.
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: educacaoSubnav,
  sidebarTools: educacaoTools
});

// /educacao/universidade/
writePage('educacao/universidade/index.html', {
  url: '/educacao/universidade/',
  title: 'Acessibilidade no Ensino Superior • Núcleos de Acessibilidade (NAI)',
  description: 'Conheça as garantias de acessibilidade em faculdades e universidades: NAI, tempo adicional em exames, materiais acessíveis e suporte a surdos e cegos.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Educação', url: '/educacao/' }, { name: 'Universidade', url: '/educacao/universidade/' }],
  badge: 'PORTARIA MEC Nº 3.284/03',
  h1: 'Acessibilidade nas Universidades e Faculdades',
  lead: 'Todas as instituições de ensino superior no Brasil devem manter Núcleos de Acessibilidade ativos para apoiar os alunos durante toda a graduação.',
  subnavLinks: educacaoSubnav,
  bodyHtml: `
    <h2>Atribuições do Núcleo de Acessibilidade</h2>
    <ul>
      <li>Adaptação de livros e apostilas para formato digital acessível ou áudio;</li>
      <li>Disponibilização de intérpretes de Libras nas aulas e eventos acadêmicos;</li>
      <li>Adequação de laboratórios, mesas de estudo e sanitários adaptados;</li>
      <li>Treinamento do corpo docente para práticas inclusivas de avaliação.</li>
    </ul>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: educacaoSubnav,
  sidebarTools: educacaoTools
});

// /educacao/cotas/
writePage('educacao/cotas/index.html', {
  url: '/educacao/cotas/',
  title: 'Cotas para PcD no SISU, ProUni e Fies • Lei Federal 12.711/12',
  description: 'Entenda como funciona a reserva de vagas em universidades federais e institutos federais para estudantes com deficiência pelo SISU.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Educação', url: '/educacao/' }, { name: 'Cotas Universitárias', url: '/educacao/cotas/' }],
  badge: 'LEI FEDERAL Nº 13.409/2016',
  h1: 'Cotas para PcD no SISU, ProUni e FIES',
  lead: 'A Lei nº 13.409/2016 alterou a Lei de Cotas para incluir expressamente pessoas com deficiência na reserva de vagas em universidades e institutos federais.',
  subnavLinks: educacaoSubnav,
  bodyHtml: `
    <h2>Cálculo das Vagas Reservadas</h2>
    <p>O número de vagas reservadas para pessoas com deficiência em cada curso é proporcional à porcentagem de pessoas com deficiência no Estado da instituição de ensino, conforme o último Censo do IBGE.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: educacaoSubnav,
  sidebarTools: educacaoTools
});

// /educacao/tecnologia-assistiva/
writePage('educacao/tecnologia-assistiva/index.html', {
  url: '/educacao/tecnologia-assistiva/',
  title: 'Tecnologia Assistiva Pedagógica na Educação Inclusiva',
  description: 'Recursos didáticos acessíveis: pranchas de comunicação, teclados colmeia, softwares leitores de tela e materiais táteis na sala de aula.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Educação', url: '/educacao/' }, { name: 'Tecnologia Pedagógica', url: '/educacao/tecnologia-assistiva/' }],
  badge: 'RECURSOS DIDÁTICOS ACESSÍVEIS',
  h1: 'Tecnologia Assistiva na Sala de Aula',
  lead: 'A utilização de recursos assistivos no ambiente escolar elimina as barreiras de comunicação e viabiliza o aprendizado autônomo do aluno com deficiência.',
  subnavLinks: educacaoSubnav,
  bodyHtml: `
    <h2>Recursos Mais Utilizados</h2>
    <ul>
      <li><strong>Comunicação Alternativa:</strong> Pranchas com símbolos PCS ou comunicadores eletrônicos com saída de voz;</li>
      <li><strong>Adaptações Físicas:</strong> Engrossadores de lápis, tesouras adaptadas e apoios para leitura com inclinação;</li>
      <li><strong>Softwares Acessíveis:</strong> Leitores de tela gratuitos como o NVDA para alunos cegos e aplicativos de conversão texto-voz.</li>
    </ul>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: educacaoSubnav,
  sidebarTools: educacaoTools
});

// /educacao/direitos-do-estudante/
writePage('educacao/direitos-do-estudante/index.html', {
  url: '/educacao/direitos-do-estudante/',
  title: 'Direitos do Estudante com Deficiência • PDI e Proibição de Taxas',
  description: 'Conheça o Plano de Desenvolvimento Individualizado (PDI), direitos de adaptação curricular e canais de denúncia contra cobranças indevidas de escolas.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Educação', url: '/educacao/' }, { name: 'Direitos do Estudante', url: '/educacao/direitos-do-estudante/' }],
  badge: 'DIREITOS PEDAGÓGICOS',
  h1: 'Direitos do Estudante & Plano Individual (PDI)',
  lead: 'Todo estudante com deficiência tem direito a adaptações curriculares razoáveis e avaliação pedagógica baseada em suas habilidades e potencialidades.',
  subnavLinks: educacaoSubnav,
  bodyHtml: `
    <h2>O que é o PDI?</h2>
    <p>O Plano de Desenvolvimento Individualizado (PDI) é o documento pedagógico elaborado pela escola em conjunto com os pais e terapeutas do aluno, definindo os objetivos de aprendizagem, as adaptações nos materiais e as estratégias de ensino adaptadas.</p>
    <div class="info-callout success">
      <strong>Modelo Gratuito:</strong> Gere uma solicitação formal de elaboração do PDI e profissional de apoio utilizando nosso <a href="/ferramentas/gerador-requerimentos/">Gerador de Requerimentos</a>.
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: educacaoSubnav,
  sidebarTools: educacaoTools
});

console.log('✅ Áreas 3 e 4 concluídas com sucesso!');
