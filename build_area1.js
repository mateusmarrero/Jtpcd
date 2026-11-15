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
// ÁREA 1: DIREITOS E LEGISLAÇÃO (/direitos/)
// -------------------------------------------------------------
const direitosSubnav = [
  { name: 'Visão Geral', url: '/direitos/' },
  { name: 'LBI (Lei 13.146/15)', url: '/direitos/lei-brasileira-inclusao/' },
  { name: 'Estacionamento (DeFis)', url: '/direitos/estacionamento/' },
  { name: 'Acessibilidade', url: '/direitos/acessibilidade/' },
  { name: 'Prioridade', url: '/direitos/atendimento-prioritario/' },
  { name: 'Concursos Públicos', url: '/direitos/concursos-publicos/' },
  { name: 'Direitos do Consumidor', url: '/direitos/direitos-do-consumidor/' }
];

const direitosTools = [
  { name: 'Gerador de Petições e Requerimentos', url: '/ferramentas/gerador-requerimentos/' },
  { name: 'Calculadora da Lei de Cotas', url: '/ferramentas/calculadora-cotas/' }
];

// /direitos/ (Hub)
writePage('direitos/index.html', {
  url: '/direitos/',
  title: 'Direitos da Pessoa com Deficiência • Legislação Brasileira e Cidadania',
  description: 'Conheça todos os direitos da pessoa com deficiência garantidos pela Lei Brasileira de Inclusão (Lei 13.146/15), Constituição Federal e Convenção da ONU.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Direitos & Legislação', url: '/direitos/' }],
  badge: 'CIDADANIA & GARANTIAS LEGAIS',
  h1: 'Direitos da Pessoa com Deficiência no Brasil',
  lead: 'A legislação brasileira possui um dos arcabouços mais avançados do mundo na proteção e promoção dos direitos das pessoas com deficiência. Conheça as leis, normas e como fazer valer sua cidadania.',
  subnavLinks: direitosSubnav,
  bodyHtml: `
    <h2>O Marco Legal da Pessoa com Deficiência no Brasil</h2>
    <p>A proteção dos direitos da pessoa com deficiência no Brasil é fundamentada na <strong>Convenção Internacional sobre os Direitos das Pessoas com Deficiência da ONU</strong> (promulgada pelo Decreto nº 6.949/2009 com equivalência de Emenda Constitucional) e consolidada pela <strong>Lei Brasileira de Inclusão da Pessoa com Deficiência (Estatuto da Pessoa com Deficiência - Lei Federal nº 13.146/2015)</strong>.</p>
    
    <div class="info-callout">
      <strong>Conceito Legal de Pessoa com Deficiência (Art. 2º da LBI):</strong><br>
      Considera-se pessoa com deficiência aquela que tem impedimento de longo prazo de natureza física, mental, intelectual ou sensorial, o qual, em interação com uma ou mais barreiras, pode obstruir sua participação plena e efetiva na sociedade em igualdade de condições com as demais pessoas.
    </div>

    <h2>Áreas Fundamentais de Proteção</h2>
    <p>Explore os tópicos detalhados da legislação clicando nos links abaixo:</p>
    <div class="category-grid" style="grid-template-columns:1fr 1fr; gap:1.25rem; margin:1.5rem 0;">
      <a href="/direitos/lei-brasileira-inclusao/" class="category-card">
        <h3 class="category-title">Lei Brasileira de Inclusão (LBI)</h3>
        <p class="category-desc">Apresentação dos princípios gerais, combate à discriminação e capacidade civil plena.</p>
      </a>
      <a href="/direitos/estacionamento/" class="category-card">
        <h3 class="category-title">Vagas de Estacionamento & Cartão DeFis</h3>
        <p class="category-desc">Reserva de 2% das vagas em estacionamentos públicos e privados e como emitir a credencial.</p>
      </a>
      <a href="/direitos/acessibilidade/" class="category-card">
        <h3 class="category-title">Acessibilidade Arquitetônica e Digital</h3>
        <p class="category-desc">Normas ABNT NBR 9050, obrigatoriedade de sites públicos acessíveis e eliminação de barreiras.</p>
      </a>
      <a href="/direitos/atendimento-prioritario/" class="category-card">
        <h3 class="category-title">Atendimento Prioritário</h3>
        <p class="category-desc">Garantia de prioridade em órgãos públicos, bancos e empresas concessionárias de serviços.</p>
      </a>
      <a href="/direitos/concursos-publicos/" class="category-card">
        <h3 class="category-title">Cotas em Concursos Públicos</h3>
        <p class="category-desc">Reserva mínima de 5% e até 20% das vagas, adaptação de provas e perícia multiprofissional.</p>
      </a>
      <a href="/direitos/direitos-do-consumidor/" class="category-card">
        <h3 class="category-title">Direitos nas Relações de Consumo</h3>
        <p class="category-desc">Meia-entrada cultural, contratos em formato acessível e assentos prioritários em aeronaves.</p>
      </a>
    </div>

    <h2>Como Exigir o Cumprimento dos Direitos</h2>
    <p>Caso você presencie ou sofra discriminação ou recusa de atendimento acessível, os seguintes canais oficiais devem ser acionados:</p>
    <ul>
      <li><strong>Defensoria Pública da União (DPU) e Defensorias Estaduais:</strong> Assistência jurídica integral e gratuita para garantir direitos violados.</li>
      <li><strong>Ministério Público Federal e Estadual:</strong> Ações civis públicas para assegurar acessibilidade em escolas, prédios e serviços.</li>
      <li><strong>Disque 100 (Direitos Humanos):</strong> Canal federal gratuito para denúncias de capacitismo, abusos e violações de direitos.</li>
    </ul>
  `,
  sidebarTitle: 'Guias de Direitos',
  sidebarLinks: direitosSubnav,
  sidebarTools: direitosTools
});

// /direitos/lei-brasileira-inclusao/
writePage('direitos/lei-brasileira-inclusao/index.html', {
  url: '/direitos/lei-brasileira-inclusao/',
  title: 'Lei Brasileira de Inclusão (Lei 13.146/15) • Guia Completo da LBI',
  description: 'Tudo sobre o Estatuto da Pessoa com Deficiência (LBI - Lei 13.146/2015): princípios, direitos fundamentais, combate à discriminação e capacidade civil.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Direitos', url: '/direitos/' }, { name: 'LBI (Lei 13.146/15)', url: '/direitos/lei-brasileira-inclusao/' }],
  badge: 'LEI FEDERAL Nº 13.146/2015',
  h1: 'Lei Brasileira de Inclusão da Pessoa com Deficiência (LBI)',
  lead: 'Conhecida como o Estatuto da Pessoa com Deficiência, a Lei nº 13.146/2015 revolucionou o Direito brasileiro ao reconhecer a capacidade civil plena e definir o capacitismo como crime.',
  subnavLinks: direitosSubnav,
  bodyHtml: `
    <h2>O que é a Lei Brasileira de Inclusão (LBI)?</h2>
    <p>Sancionada em 6 de julho de 2015 e em vigor desde janeiro de 2016, a LBI consolidou o modelo social da deficiência no Brasil. A deficiência deixou de ser considerada uma "doença ou limitação médica do indivíduo" e passou a ser entendida como o resultado do encontro entre um impedimento corporal e as barreiras impostas pela sociedade.</p>

    <div class="legal-box">
      <strong>Artigo 4º da LBI:</strong><br>
      Toda pessoa com deficiência tem direito à igualdade de oportunidades com as demais pessoas e não sofrerá nenhuma espécie de discriminação.<br>
      § 1º Considera-se discriminação em razão da deficiência toda forma de distinção, restrição ou exclusão, por ação ou omissão, que tenha o propósito ou o efeito de prejudicar, impedir ou anular o reconhecimento ou o exercício dos direitos e das liberdades fundamentais.
    </div>

    <h2>Principais Conquistas Trazidas pela LBI</h2>
    <ul>
      <li><strong>Capacidade Civil Plena:</strong> A pessoa com deficiência pode casar-se, exercer direitos sexuais e reprodutivos, votar e ser votada, e gerir seus próprios bens. A curatela passou a ser medida extraordinária e restrita aos atos patrimoniais.</li>
      <li><strong>Educação Inclusiva Obrigatória:</strong> As escolas privadas e públicas são obrigadas a aceitar matrículas e fornecer profissional de apoio escolar e adaptações sem cobrar nenhum valor adicional dos pais.</li>
      <li><strong>Criminalização do Capacitismo:</strong> Praticar, induzir ou incitar discriminação contra pessoa com deficiência acarreta pena de reclusão de 1 a 3 anos e multa (podendo chegar a 5 anos se cometido em meios de comunicação social ou internet).</li>
      <li><strong>Acessibilidade nos Meios de Comunicação e Web:</strong> Sites mantidos por empresas com sede ou representação no país devem garantir acessibilidade digital para pessoas com deficiência visual e auditiva.</li>
    </ul>

    <div class="info-callout warning">
      <strong>Atenção:</strong> A recusa de matrícula escolar em razão da deficiência constitui crime punível com reclusão de 2 a 5 anos e multa, conforme o Art. 8º da Lei nº 7.853/1989 com redação dada pela LBI.
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: direitosSubnav,
  sidebarTools: direitosTools
});

// /direitos/estacionamento/
writePage('direitos/estacionamento/index.html', {
  url: '/direitos/estacionamento/',
  title: 'Vagas Reservadas e Cartão DeFis • Como Emitir a Credencial',
  description: 'Guia completo sobre a reserva de vagas para pessoas com deficiência, normas do CONTRAN, regras do Cartão DeFis e como recorrer de multas indevidas.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Direitos', url: '/direitos/' }, { name: 'Estacionamento & DeFis', url: '/direitos/estacionamento/' }],
  badge: 'RESOLUÇÕES CONTRAN & LBI ART. 47',
  h1: 'Vagas Reservadas de Estacionamento & Cartão DeFis',
  lead: 'A legislação brasileira assegura que 2% das vagas em estacionamentos públicos e privados sejam reservadas exclusivamente para veículos conduzidos por pessoas com deficiência ou que as transportem.',
  subnavLinks: direitosSubnav,
  bodyHtml: `
    <h2>Regra Geral das Vagas Especiais</h2>
    <p>O Artigo 47 da Lei Brasileira de Inclusão e as Resoluções do CONTRAN estabelecem que em todas as áreas de estacionamento aberto ao público, de uso público ou privado de uso coletivo (como shoppings, supermercados e hospitais), devem ser reservadas vagas com sinalização horizontal e vertical:</p>
    <ul>
      <li>Mínimo de <strong>2% do total de vagas</strong> garantidas para pessoas com deficiência com comprometimento de mobilidade;</li>
      <li>Localização próxima aos acessos de circulação de pedestres;</li>
      <li>Espaço adicional de circulação para cadeira de rodas ou desembarque seguro.</li>
    </ul>

    <h2>O que é o Cartão DeFis e Quem tem Direito?</h2>
    <p>O Cartão DeFis (ou Credencial de Estacionamento) é o documento oficial obrigatório expedido pelo órgão de trânsito municipal (ou DETRAN) que deve ficar visível sobre o painel do veículo.</p>
    <div class="info-callout success">
      <strong>Quem pode solicitar:</strong> Pessoas com deficiência física, motora, visual, intelectual severa, pessoas com TEA (Transtorno do Espectro Autista) ou com mobilidade reduzida temporária/permanente. Não é obrigatório que a pessoa com deficiência seja o condutor.
    </div>

    <h2>Penalidade para Uso Indevido</h2>
    <p>Estacionar em vaga reservada sem a credencial visível configura <strong>infração gravíssima</strong> (Art. 181, XX do Código de Trânsito Brasileiro), sujeita a multa de R$ 293,47, 7 pontos na CNH e remoção do veículo com guincho.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: direitosSubnav,
  sidebarTools: direitosTools
});

// /direitos/acessibilidade/
writePage('direitos/acessibilidade/index.html', {
  url: '/direitos/acessibilidade/',
  title: 'Acessibilidade Arquitetônica, Digital e Urbana • Normas ABNT NBR 9050',
  description: 'Conheça as exigências legais de acessibilidade arquitetônica, transporte público, comunicação e plataformas digitais previstas na LBI e no Decreto 5.296/04.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Direitos', url: '/direitos/' }, { name: 'Acessibilidade Legal', url: '/direitos/acessibilidade/' }],
  badge: 'LEI 13.146/15 & DECRETO 5.296/04',
  h1: 'Direito à Acessibilidade Integral',
  lead: 'Acessibilidade é uma condição essencial para a vida independente. Ela engloba a eliminação de barreiras arquitetônicas, urbanísticas, de transporte, nas comunicações e atitudinais.',
  subnavLinks: direitosSubnav,
  bodyHtml: `
    <h2>As Dimensões da Acessibilidade</h2>
    <p>O Artigo 3º da Lei Brasileira de Inclusão classifica as barreiras em categorias que devem ser eliminadas pelo poder público e pela iniciativa privada:</p>
    <ul>
      <li><strong>Barreiras Urbanísticas e Arquitetônicas:</strong> Rampas com inclinação correta (ABNT NBR 9050), elevadores com aviso sonoro e braille, portas alargadas e calçadas sem desníveis.</li>
      <li><strong>Barreiras nos Transportes:</strong> Ônibus com elevadores funcionando, piso baixo, avisos sonoros de parada e estações acessíveis.</li>
      <li><strong>Barreiras nas Comunicações e Web:</strong> Legendas, audiodescrição, intérpretes de Libras e conformidade com WCAG (Web Content Accessibility Guidelines).</li>
      <li><strong>Barreiras Atitudinais:</strong> Preconceitos, estigmas e atitudes discriminatórias contra pessoas com deficiência.</li>
    </ul>

    <div class="legal-box">
      <strong>Artigo 63 da LBI:</strong> É obrigatória a acessibilidade nos sítios da internet mantidos por empresas com sede ou representação comercial no País ou por órgãos de governo, para garantir o uso pelas pessoas com deficiência, garantindo-lhes pleno acesso às informações disponíveis.
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: direitosSubnav,
  sidebarTools: direitosTools
});

// /direitos/atendimento-prioritario/
writePage('direitos/atendimento-prioritario/index.html', {
  url: '/direitos/atendimento-prioritario/',
  title: 'Atendimento Prioritário para PcD • Lei 10.048/00 e Lei 14.626/23',
  description: 'Regras completas do atendimento prioritário: bancos, hospitais, repartições públicas, direito do acompanhante e prioridade no processo judicial.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Direitos', url: '/direitos/' }, { name: 'Atendimento Prioritário', url: '/direitos/atendimento-prioritario/' }],
  badge: 'LEI FEDERAL Nº 10.048/2000',
  h1: 'Direito ao Atendimento Prioritário',
  lead: 'Pessoas com deficiência, autistas, idosos, gestantes e lactantes têm direito legal a atendimento diferenciado e imediato em todas as repartições públicas e empresas concessionárias de serviços.',
  subnavLinks: direitosSubnav,
  bodyHtml: `
    <h2>Abrangência do Atendimento Prioritário</h2>
    <p>A Lei Federal nº 10.048/2000, atualizada pela Lei 14.626/2023, garante atendimento prioritário em:</p>
    <ul>
      <li>Agências bancárias e caixas eletrônicos;</li>
      <li>Repartições públicas municipais, estaduais e federais;</li>
      <li>Hospitais, unidades básicas de saúde e clínicas privadas;</li>
      <li>Comércio em geral, supermercados, aeroportos e rodoviárias;</li>
      <li>Processos judiciais e administrativos em que a pessoa com deficiência figure como parte ou interveniente (Art. 9º da LBI).</li>
    </ul>

    <div class="info-callout success">
      <strong>Direito do Acompanhante:</strong> O acompanhante da pessoa com deficiência também tem direito ao atendimento prioritário conjunto, garantindo que o suporte necessário não seja interrompido.
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: direitosSubnav,
  sidebarTools: direitosTools
});

// /direitos/concursos-publicos/
writePage('direitos/concursos-publicos/index.html', {
  url: '/direitos/concursos-publicos/',
  title: 'Cotas em Concursos Públicos para PcD • Reserva de 5% a 20%',
  description: 'Tudo sobre reserva de vagas em concursos públicos para PcD: percentual mínimo de 5%, adaptação razoável de provas, tempo adicional e avaliação pericial.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Direitos', url: '/direitos/' }, { name: 'Concursos Públicos', url: '/direitos/concursos-publicos/' }],
  badge: 'DECRETO 3.298/99 & LEI 8.112/90',
  h1: 'Cotas e Acessibilidade em Concursos Públicos',
  lead: 'A Constituição Federal e a legislação federal reservam até 20% das vagas em concursos públicos para candidatos com deficiência, além de assegurar recursos acessíveis para realização das provas.',
  subnavLinks: direitosSubnav,
  bodyHtml: `
    <h2>Regras de Reserva de Vagas</h2>
    <p>O Decreto Federal nº 3.298/1999 e a Lei nº 8.112/1990 estabelecem:</p>
    <ul>
      <li>Reserva de no <strong>mínimo 5% e máximo 20%</strong> das vagas oferecidas no edital de concurso público da administração pública direta e indireta;</li>
      <li>Sempre que a aplicação do percentual resultar em fração igual ou superior a 0,5, arredonda-se para o número inteiro subsequente.</li>
    </ul>

    <h2>Adaptações de Prova Asseguradas por Lei</h2>
    <p>O candidato com deficiência tem direito a solicitar tempestivamente no ato da inscrição:</p>
    <ul>
      <li><strong>Tempo adicional:</strong> Extensão de até 1 hora no tempo de duração da prova;</li>
      <li><strong>Materiais acessíveis:</strong> Provas em fonte ampliada (tamanhos 18, 24 ou 28), provas em Braille ou leitor de tela computadorizado;</li>
      <li><strong>Profissionais de apoio:</strong> Auxílio de transcritor, fiscal ledor ou intérprete de Libras;</li>
      <li><strong>Espaço físico adaptado:</strong> Salas no térreo, mesas acessíveis para cadeira de rodas e banheiros adaptados próximos.</li>
    </ul>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: direitosSubnav,
  sidebarTools: direitosTools
});

// /direitos/direitos-do-consumidor/
writePage('direitos/direitos-do-consumidor/index.html', {
  url: '/direitos/direitos-do-consumidor/',
  title: 'Direitos do Consumidor PcD • Meia-Entrada, Contratos Acessíveis e Voos',
  description: 'Garantias da pessoa com deficiência nas relações de consumo: meia-entrada cultural e esportiva, contrato em formato acessível, assentos prioritários e voos.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Direitos', url: '/direitos/' }, { name: 'Consumidor PcD', url: '/direitos/direitos-do-consumidor/' }],
  badge: 'LEI 12.933/13 & RESOLUÇÃO ANAC 280',
  h1: 'Direitos da Pessoa com Deficiência nas Relações de Consumo',
  lead: 'O consumidor com deficiência possui proteção especial contra práticas abusivas, cobranças de sobretaxas indevidas e direito à meia-entrada em todo o território nacional.',
  subnavLinks: direitosSubnav,
  bodyHtml: `
    <h2>Meia-Entrada em Espetáculos e Eventos (Lei 12.933/13)</h2>
    <p>A pessoa com deficiência tem direito a <strong>50% de desconto</strong> no valor de ingressos para salas de cinema, teatros, espetáculos musicais, circenses e eventos esportivos em todo o Brasil. Caso necessite de acompanhante, este também tem direito ao benefício da meia-entrada.</p>

    <h2>Transporte Aéreo e Acompanhante (Resolução ANAC 280)</h2>
    <p>Em viagens aéreas, quando a pessoa com deficiência necessitar de assistência contínua durante o voo, a companhia aérea deve fornecer acompanhante próprio ou cobrar no <strong>máximo 20% do valor da passagem (desconto de 80%)</strong> para o acompanhante indicado pelo passageiro.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: direitosSubnav,
  sidebarTools: direitosTools
});

console.log('✅ Área 1 concluída com sucesso!');
