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
// ÁREA 7: MOBILIDADE E ACESSIBILIDADE (/mobilidade/)
// -------------------------------------------------------------
const mobilidadeSubnav = [
  { name: 'Visão Geral', url: '/mobilidade/' },
  { name: 'Transporte Público', url: '/mobilidade/transporte-publico/' },
  { name: 'Passe Livre Interestadual', url: '/mobilidade/passe-livre/' },
  { name: 'Cartão DeFis', url: '/mobilidade/estacionamento/' },
  { name: 'Acessibilidade Urbana', url: '/mobilidade/acessibilidade-urbana/' },
  { name: 'Viagens Aéreas', url: '/mobilidade/viagens/' }
];

// /mobilidade/ (Hub)
writePage('mobilidade/index.html', {
  url: '/mobilidade/',
  title: 'Mobilidade e Transporte Acessível para PcD • Passe Livre e Direitos',
  description: 'Guia completo de mobilidade: Passe Livre Interestadual, gratuidade no transporte público municipal, cartão de estacionamento DeFis e voos acessíveis.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Mobilidade & Acessibilidade', url: '/mobilidade/' }],
  badge: 'DIREITO DE IR E VIR',
  h1: 'Mobilidade Urbana & Transporte Acessível',
  lead: 'A locomoção livre, segura e autônoma é direito fundamental. Conheça as gratuidades no transporte coletivo, regras do Passe Livre e direitos em viagens.',
  subnavLinks: mobilidadeSubnav,
  bodyHtml: `
    <h2>O Direito ao Transporte sem Barreiras</h2>
    <p>A Lei Brasileira de Inclusão e leis específicas garantem a gratuidade e a prioridade no transporte público coletivo municipal, intermunicipal e interestadual, eliminando barreiras econômicas para o deslocamento de pessoas com deficiência e seus acompanhantes.</p>

    <div class="category-grid" style="grid-template-columns:1fr 1fr; gap:1.25rem; margin:1.5rem 0;">
      <a href="/mobilidade/transporte-publico/" class="category-card">
        <h3 class="category-title">Transporte Público Municipal</h3>
        <p class="category-desc">Gratuidade em ônibus, metrôs e trens urbanos e emissão do Bilhete Único Especial.</p>
      </a>
      <a href="/mobilidade/passe-livre/" class="category-card">
        <h3 class="category-title">Passe Livre Interestadual</h3>
        <p class="category-desc">Como solicitar a carteirinha federal para viajar de graça de um Estado para outro em ônibus e barcos.</p>
      </a>
      <a href="/mobilidade/estacionamento/" class="category-card">
        <h3 class="category-title">Vagas Reservadas & Cartão DeFis</h3>
        <p class="category-desc">Reserva de vagas em estacionamentos públicos e shoppings e regras de uso da credencial.</p>
      </a>
      <a href="/mobilidade/acessibilidade-urbana/" class="category-card">
        <h3 class="category-title">Acessibilidade Urbana</h3>
        <p class="category-desc">Calçadas rebaixadas, piso tátil direcional e normas ABNT NBR 9050 em vias públicas.</p>
      </a>
      <a href="/mobilidade/viagens/" class="category-card">
        <h3 class="category-title">Viagens Aéreas e Resolução ANAC 280</h3>
        <p class="category-desc">Atendimento especial em aeroportos e desconto de até 80% na passagem do acompanhante necessário.</p>
      </a>
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: mobilidadeSubnav,
  sidebarTools: [{ name: 'Isenções na Compra de Carro', url: '/isencoes/compra-de-veiculos/' }]
});

// /mobilidade/transporte-publico/
writePage('mobilidade/transporte-publico/index.html', {
  url: '/mobilidade/transporte-publico/',
  title: 'Gratuidade no Transporte Público Municipal para PcD • Bilhete Especial',
  description: 'Como funciona a gratuidade em ônibus municipais, metrô e trens: regras por cidade, documentos para emissão do cartão e direito a acompanhante.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Mobilidade', url: '/mobilidade/' }, { name: 'Transporte Público', url: '/mobilidade/transporte-publico/' }],
  badge: 'GRATUIDADE MUNICIPAL',
  h1: 'Gratuidade no Transporte Público Municipal',
  lead: 'A maioria dos municípios e regiões metropolitanas do Brasil concede isenção tarifária integral em ônibus urbanos, trens e metrôs para pessoas com deficiência.',
  subnavLinks: mobilidadeSubnav,
  bodyHtml: `
    <h2>Como Solicitar o Cartão de Gratuidade</h2>
    <p>O processo é administrado pela Secretaria de Transportes do seu município (como a SPTrans em São Paulo ou a RioCard no Rio de Janeiro). É necessário agendar perícia médica e apresentar laudo médico com CID que comprove o impedimento funcional.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: mobilidadeSubnav
});

// /mobilidade/passe-livre/
writePage('mobilidade/passe-livre/index.html', {
  url: '/mobilidade/passe-livre/',
  title: 'Passe Livre Interestadual do Governo Federal • Lei 8.899/94',
  description: 'Passo a passo completo para solicitar o Passe Livre Interestadual pela internet: formulários, atestado da equipe de saúde e reserva de passagens.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Mobilidade', url: '/mobilidade/' }, { name: 'Passe Livre', url: '/mobilidade/passe-livre/' }],
  badge: 'LEI FEDERAL Nº 8.899/1994',
  h1: 'Passe Livre Interestadual para PcD',
  lead: 'Programa do Governo Federal que assegura a gratuidade em viagens entre diferentes Estados do Brasil no transporte coletivo rodoviário, ferroviário e aquaviário.',
  subnavLinks: mobilidadeSubnav,
  bodyHtml: `
    <h2>Quem tem direito ao Passe Livre Federal?</h2>
    <p>Tem direito a pessoa com deficiência física, auditiva, visual, intelectual ou ostomia, bem como pessoas com transtorno do espectro autista, que comprovem renda familiar mensal per capita de <strong>até 1 salário mínimo</strong>.</p>

    <h2>Como Reservar as Passagens</h2>
    <p>As empresas de ônibus interestaduais são obrigadas a reservar <strong>dois assentos gratuitos por viagem</strong> para beneficiários do Passe Livre. A solicitação deve ser feita no guichê da empresa com pelo menos 3 horas de antecedência ao horário de partida.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: mobilidadeSubnav
});

// /mobilidade/estacionamento/
writePage('mobilidade/estacionamento/index.html', {
  url: '/mobilidade/estacionamento/',
  title: 'Cartão DeFis e Vagas Reservadas de Estacionamento • Como Emitir',
  description: 'Regras para emissão da credencial de estacionamento DeFis: validade nacional, documentos necessários, regras de uso e penalidades.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Mobilidade', url: '/mobilidade/' }, { name: 'Estacionamento & DeFis', url: '/mobilidade/estacionamento/' }],
  badge: 'CREDENCIAL NACIONAL',
  h1: 'Cartão DeFis e Credencial de Estacionamento',
  lead: 'O Cartão DeFis garante o direito de utilizar as vagas reservadas devidamente sinalizadas em qualquer município brasileiro.',
  subnavLinks: mobilidadeSubnav,
  bodyHtml: `
    <h2>Validade Nacional do Cartão</h2>
    <p>Mesmo que o cartão seja emitido pelo órgão de trânsito da sua cidade de residência, ele tem <strong>validade em todo o território nacional</strong>, conforme determinação expressa do CONTRAN.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: mobilidadeSubnav
});

// /mobilidade/acessibilidade-urbana/
writePage('mobilidade/acessibilidade-urbana/index.html', {
  url: '/mobilidade/acessibilidade-urbana/',
  title: 'Acessibilidade Urbana e Calçadas • Normas ABNT NBR 9050',
  description: 'Parâmetros técnicos para calçadas acessíveis, guias rebaixadas, semáforos sonoros para cegos e dever de fiscalização das prefeituras municipais.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Mobilidade', url: '/mobilidade/' }, { name: 'Acessibilidade Urbana', url: '/mobilidade/acessibilidade-urbana/' }],
  badge: 'NORMAS TÉCNICAS ABNT',
  h1: 'Acessibilidade Urbana & Calçadas Acessíveis',
  lead: 'A cidade acessível é aquela que permite a todos circular com segurança e autonomia, sem obstáculos, degraus ou buracos no caminho.',
  subnavLinks: mobilidadeSubnav,
  bodyHtml: `
    <h2>Exigências Obrigatórias em Vias Públicas</h2>
    <ul>
      <li>Faixa livre de circulação de pedestres contínua e desimpedida com largura mínima de 1,20m;</li>
      <li>Rebaixamento de guias com inclinação suave junto às faixas de pedestres;</li>
      <li>Piso tátil direcional e de alerta para orientação de pessoas cegas;</li>
      <li>Semáforos sonoros nos cruzamentos de grande fluxo de veículos.</li>
    </ul>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: mobilidadeSubnav
});

// /mobilidade/viagens/
writePage('mobilidade/viagens/index.html', {
  url: '/mobilidade/viagens/',
  title: 'Viagens Aéreas para PcD • Resolução ANAC 280 e Desconto de 80%',
  description: 'Tudo sobre direitos do passageiro com deficiência em aeroportos e voos: embarque prioritário, despacho gratuito de cadeira de rodas e acompanhante.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Mobilidade', url: '/mobilidade/' }, { name: 'Viagens Aéreas', url: '/mobilidade/viagens/' }],
  badge: 'RESOLUÇÃO ANAC Nº 280/2013',
  h1: 'Direitos em Viagens Aéreas (Resolução ANAC 280)',
  lead: 'A Agência Nacional de Aviação Civil (ANAC) assegura assistência gratuita e desconto de 80% na passagem do acompanhante necessário em viagens de avião.',
  subnavLinks: mobilidadeSubnav,
  bodyHtml: `
    <h2>Desconto de 80% para o Acompanhante</h2>
    <p>Quando a pessoa com deficiência não puder viajar sozinha por necessitar de ajuda para higiene, alimentação ou locomoção em caso de emergência, a companhia aérea deve fornecer o acompanhante ou cobrar no <strong>máximo 20% do valor da passagem para o acompanhante indicado</strong> (formulário MEDIF / FREMEC).</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: mobilidadeSubnav
});

// -------------------------------------------------------------
// ÁREA 8: ISENÇÕES TRIBUTÁRIAS (/isencoes/)
// -------------------------------------------------------------
const isencoesSubnav = [
  { name: 'Visão Geral', url: '/isencoes/' },
  { name: 'IPI Federal', url: '/isencoes/ipi/' },
  { name: 'ICMS Estadual', url: '/isencoes/icms/' },
  { name: 'IOF', url: '/isencoes/iof/' },
  { name: 'IPVA', url: '/isencoes/ipva/' },
  { name: 'Compra de Veículos', url: '/isencoes/compra-de-veiculos/' }
];

const isencoesTools = [
  { name: 'Calculadora de Isenções Veiculares', url: '/ferramentas/calculadora-isencoes/' },
  { name: 'Requerimento de Isenção de IPVA', url: '/ferramentas/gerador-requerimentos/' }
];

// /isencoes/ (Hub)
writePage('isencoes/index.html', {
  url: '/isencoes/',
  title: 'Isenções Tributárias para Pessoas com Deficiência • IPI, ICMS e IPVA',
  description: 'Guia completo de isenções de impostos para PcD: IPI (até R$ 200 mil), ICMS (até R$ 120 mil), IPVA anual nos Estados e isenção de IRPF em aposentadorias.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Isenções Tributárias', url: '/isencoes/' }],
  badge: 'BENEFÍCIOS FISCAIS & TRIBUTOS',
  h1: 'Isenções Tributárias para Pessoas com Deficiência',
  lead: 'A legislação brasileira concede isenções de tributos federais e estaduais para compensar os custos adicionais enfrentados por pessoas com deficiência e suas famílias.',
  subnavLinks: isencoesSubnav,
  bodyHtml: `
    <h2>Panorama das Isenções Tributárias</h2>
    <p>Tanto pessoas com deficiência que dirigem (condutores) quanto aquelas que não dirigem (não-condutores, com deficiência severa ou autismo transportadas por familiares) têm direito a importantes benefícios fiscais na compra de veículos novos e na aposentadoria.</p>

    <div class="category-grid" style="grid-template-columns:1fr 1fr; gap:1.25rem; margin:1.5rem 0;">
      <a href="/isencoes/ipi/" class="category-card">
        <h3 class="category-title">Isenção de IPI (Federal)</h3>
        <p class="category-desc">Teto elevado para R$ 200.000,00 pela Lei Federal 14.287/21 com motores até 2.0.</p>
      </a>
      <a href="/isencoes/icms/" class="category-card">
        <h3 class="category-title">Isenção de ICMS (Estadual)</h3>
        <p class="category-desc">Convênio CONFAZ 147/23: compra de veículos de até R$ 120.000,00 com cota isenta de R$ 70.000,00.</p>
      </a>
      <a href="/isencoes/ipva/" class="category-card">
        <h3 class="category-title">Isenção de IPVA nos Estados</h3>
        <p class="category-desc">Economia anual permanente do imposto sobre propriedade de veículos automotores.</p>
      </a>
      <a href="/isencoes/iof/" class="category-card">
        <h3 class="category-title">Isenção de IOF em Financiamentos</h3>
        <p class="category-desc">Dispensa do imposto sobre operações financeiras para condutores habilitados.</p>
      </a>
      <a href="/isencoes/compra-de-veiculos/" class="category-card">
        <h3 class="category-title">Guia Completo da Compra de Carro</h3>
        <p class="category-desc">Passo a passo: da CNH especial e laudo médico ao faturamento direto na concessionária.</p>
      </a>
    </div>

    <div class="info-callout success">
      <strong>Simulador Financeiro:</strong> Calcule o desconto exato do carro que você deseja em nossa <a href="/ferramentas/calculadora-isencoes/"><strong>Calculadora de Isenções Veiculares</strong></a>.
    </div>
  `,
  sidebarTitle: 'Guias de Isenções',
  sidebarLinks: isencoesSubnav,
  sidebarTools: isencoesTools
});

// /isencoes/ipi/
writePage('isencoes/ipi/index.html', {
  url: '/isencoes/ipi/',
  title: 'Isenção de IPI para Carros PcD • Teto de R$ 200 Mil (Lei 14.287/21)',
  description: 'Tudo sobre a isenção de IPI na Receita Federal pelo sistema Sisen: teto de R$ 200.000, prazo de carência de 3 anos e regras para não-condutores.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Isenções', url: '/isencoes/' }, { name: 'IPI Federal', url: '/isencoes/ipi/' }],
  badge: 'LEI FEDERAL Nº 14.287/2021',
  h1: 'Isenção de IPI na Compra de Veículos Novos',
  lead: 'A Lei nº 14.287/2021 estendeu o benefício de isenção de IPI até 31 de dezembro de 2026 e elevou o teto de preço do veículo para R$ 200.000,00.',
  subnavLinks: isencoesSubnav,
  bodyHtml: `
    <h2>Regras Principais da Isenção de IPI</h2>
    <ul>
      <li><strong>Teto de Preço:</strong> Válido para automóveis de fabricação nacional ou Mercosul com valor de até R$ 200.000,00 (incluídos os tributos);</li>
      <li><strong>Motorização:</strong> Motores de até 2.0 litros flex, gasolina, híbridos ou elétricos;</li>
      <li><strong>Beneficiários:</strong> Pessoas com deficiência física, visual, auditiva, intelectual severa ou profunda e pessoas com TEA (condutores e não-condutores);</li>
      <li><strong>Prazo para Nova Compra:</strong> Intervalo mínimo de <strong>3 anos</strong> entre uma aquisição com isenção de IPI e a próxima.</li>
    </ul>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: isencoesSubnav,
  sidebarTools: isencoesTools
});

// /isencoes/icms/
writePage('isencoes/icms/index.html', {
  url: '/isencoes/icms/',
  title: 'Isenção de ICMS para Carros PcD • Convênio CONFAZ 147/23',
  description: 'Regras do ICMS para veículos PcD: teto de R$ 120.000,00 e isenção parcial sobre a parcela de até R$ 70.000,00. Entenda como funciona a conta.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Isenções', url: '/isencoes/' }, { name: 'ICMS Estadual', url: '/isencoes/icms/' }],
  badge: 'CONVÊNIO CONFAZ Nº 147/2023',
  h1: 'Isenção de ICMS na Compra de Carros PcD',
  lead: 'O Conselho Nacional de Política Fazendária (CONFAZ) atualizou as regras do ICMS, permitindo a compra de modelos de até R$ 120.000,00 com isenção parcial.',
  subnavLinks: isencoesSubnav,
  bodyHtml: `
    <h2>Como funciona a conta do ICMS?</h2>
    <p>O teto de compra foi fixado em R$ 120.000,00, mas a gratuidade do ICMS incide apenas sobre a <strong>cota de R$ 70.000,00</strong>:</p>
    <ul>
      <li>Se o veículo custar até R$ 70.000,00: a isenção de ICMS é 100% integral;</li>
      <li>Se o veículo custar entre R$ 70.000,01 e R$ 120.000,00: o comprador tem isenção sobre R$ 70k e paga o ICMS proporcional referente à diferença entre o valor do carro e R$ 70k;</li>
      <li>Se o veículo ultrapassar R$ 120.000,00: não há direito à isenção de ICMS.</li>
    </ul>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: isencoesSubnav,
  sidebarTools: isencoesTools
});

// /isencoes/iof/
writePage('isencoes/iof/index.html', {
  url: '/isencoes/iof/',
  title: 'Isenção de IOF em Financiamentos de Veículos PcD',
  description: 'Como funciona a isenção de IOF em operações de crédito e financiamento para motoristas com deficiência física habilitados com CNH especial.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Isenções', url: '/isencoes/' }, { name: 'IOF', url: '/isencoes/iof/' }],
  badge: 'LEI FEDERAL Nº 8.989/1995',
  h1: 'Isenção de IOF em Financiamento de Veículos',
  lead: 'Motoristas PcD com habilitação especial têm direito à isenção do Imposto sobre Operações Financeiras (IOF) ao financiar um veículo novo.',
  subnavLinks: isencoesSubnav,
  bodyHtml: `
    <h2>Regras da Isenção de IOF</h2>
    <p>A isenção do IOF é restrita a pessoas com deficiência física habilitadas na direção veicular (condutores), para veículos de até 128 cavalos de potência, e pode ser concedida uma única vez a cada beneficiário.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: isencoesSubnav,
  sidebarTools: isencoesTools
});

// /isencoes/ipva/
writePage('isencoes/ipva/index.html', {
  url: '/isencoes/ipva/',
  title: 'Isenção de IPVA para Veículos PcD nos Estados • Regras e Documentos',
  description: 'Saiba como solicitar a isenção anual de IPVA na Secretaria da Fazenda do seu Estado. Regras para condutores e não-condutores (autismo e deficiências severas).',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Isenções', url: '/isencoes/' }, { name: 'IPVA Estadual', url: '/isencoes/ipva/' }],
  badge: 'LEGISLAÇÃO ESTADUAL',
  h1: 'Isenção de IPVA para Pessoas com Deficiência',
  lead: 'A isenção do IPVA garante alívio financeiro anual contínuo para proprietários de veículos adaptados ou utilizados no transporte de pessoas com deficiência.',
  subnavLinks: isencoesSubnav,
  bodyHtml: `
    <h2>Como Funciona nos Estados (SP, RJ, MG e outros)</h2>
    <p>As secretarias da fazenda estaduais concedem a isenção de IPVA para um único veículo por beneficiário, mediante comprovação de laudo do DETRAN ou perícia do IMESC (em SP). O benefício vale tanto para veículos novos quanto para usados.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: isencoesSubnav,
  sidebarTools: isencoesTools
});

// /isencoes/compra-de-veiculos/
writePage('isencoes/compra-de-veiculos/index.html', {
  url: '/isencoes/compra-de-veiculos/',
  title: 'Guia Completo da Compra de Carro PcD com Isenções Passo a Passo',
  description: 'Manual de 6 etapas: CNH Especial no DETRAN, Laudo Médico, Isenção de IPI no Sisen, Isenção de ICMS na Fazenda, Pedido na Concessionária e Isenção de IPVA.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Isenções', url: '/isencoes/' }, { name: 'Compra de Veículos', url: '/isencoes/compra-de-veiculos/' }],
  badge: 'PASSO A PASSO DETALHADO',
  h1: 'Como Comprar Carro PcD com Isenções',
  lead: 'O processo de compra com isenção tributária requer planejamento e cumprimento de etapas sequenciais. Confira o roteiro completo sem complicações.',
  subnavLinks: isencoesSubnav,
  bodyHtml: `
    <h2>As 6 Etapas do Processo de Compra</h2>
    <div class="step-guide-box">
      <div class="step-guide-item">
        <div class="step-guide-num">1</div>
        <div>
          <h4>Obtenção do Laudo Médico e CNH Especial</h4>
          <p>Para condutores: agendamento de perícia no DETRAN para alteração da CNH para categoria PcD com indicação das adaptações necessárias (letras A, B, C, D, etc.). Para não-condutores: laudo emitido por serviço público ou conveniado ao SUS.</p>
        </div>
      </div>
      <div class="step-guide-item">
        <div class="step-guide-num">2</div>
        <div>
          <h4>Pedido de Isenção do IPI na Receita Federal</h4>
          <p>Solicitação feita 100% online pelo portal <strong>Sisen (sisen.receita.fazenda.gov.br)</strong>. A autorização costuma ser emitida em até 72 horas úteis.</p>
        </div>
      </div>
      <div class="step-guide-item">
        <div class="step-guide-num">3</div>
        <div>
          <h4>Pedido de Isenção do ICMS na Secretaria da Fazenda</h4>
          <p>Com a autorização do IPI em mãos, entra-se com o processo no posto fiscal ou sistema eletrônico da Fazenda do seu Estado.</p>
        </div>
      </div>
      <div class="step-guide-item">
        <div class="step-guide-num">4</div>
        <div>
          <h4>Pedido Direto à Montadora na Concessionária</h4>
          <p>Escolha do modelo e faturamento direto pela fábrica da montadora com desconto total dos impostos autorizados.</p>
        </div>
      </div>
      <div class="step-guide-item">
        <div class="step-guide-num">5</div>
        <div>
          <h4>Emplacamento e Isenção do IPVA</h4>
          <p>Após a entrega do veículo, realiza-se o emplacamento e o requerimento da dispensa de IPVA na Secretaria da Fazenda.</p>
        </div>
      </div>
      <div class="step-guide-item">
        <div class="step-guide-num">6</div>
        <div>
          <h4>Cartão DeFis e Dispensa de Rodízio</h4>
          <p>Emissão da credencial de estacionamento e cadastro para dispensa do rodízio municipal de veículos (em municípios como São Paulo).</p>
        </div>
      </div>
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: isencoesSubnav,
  sidebarTools: isencoesTools
});

console.log('✅ Áreas 7 e 8 concluídas com sucesso!');
