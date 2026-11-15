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

const beneficiosSubnav = [
  { name: 'Visão Geral', url: '/beneficios/' },
  { name: 'BPC / LOAS', url: '/beneficios/bpc-loas/' },
  { name: 'Auxílio-Inclusão', url: '/beneficios/auxilio-inclusao/' },
  { name: 'Aposentadoria INSS', url: '/beneficios/beneficios-do-inss/' },
  { name: 'CadÚnico', url: '/beneficios/cadunico/' },
  { name: 'Como Solicitar', url: '/beneficios/como-solicitar/' },
  { name: 'Documentação', url: '/beneficios/documentacao/' }
];

const beneficiosTools = [
  { name: 'Simulador de BPC/LOAS', url: '/ferramentas/simulador-bpc/' },
  { name: 'Gerador de Recursos do INSS', url: '/ferramentas/gerador-requerimentos/' }
];

// /beneficios/ (Hub)
writePage('beneficios/index.html', {
  url: '/beneficios/',
  title: 'Benefícios Sociais para Pessoas com Deficiência • BPC, INSS e Auxílios',
  description: 'Guia completo sobre benefícios sociais e previdenciários para PcD: BPC/LOAS de 1 salário mínimo, Auxílio-Inclusão, Aposentadoria Especial e regras do CadÚnico.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Benefícios Sociais', url: '/beneficios/' }],
  badge: 'SEGURIDADE SOCIAL & LOAS',
  h1: 'Benefícios Sociais & Previdenciários da PcD',
  lead: 'Entenda como funcionam os benefícios de assistência social e previdência para pessoas com deficiência e famílias de baixa renda, critérios de renda e como requerer.',
  subnavLinks: beneficiosSubnav,
  bodyHtml: `
    <h2>A Proteção Social da Pessoa com Deficiência</h2>
    <p>O sistema de seguridade social brasileiro garante renda mínima e proteção contra a vulnerabilidade para pessoas com deficiência por meio da assistência social (não contributiva) e da previdência social (contributiva).</p>

    <div class="category-grid" style="grid-template-columns:1fr 1fr; gap:1.25rem; margin:1.5rem 0;">
      <a href="/beneficios/bpc-loas/" class="category-card">
        <h3 class="category-title">BPC / LOAS (1 Salário Mínimo)</h3>
        <p class="category-desc">Critérios de elegibilidade, impedimento de longo prazo e renda familiar per capita.</p>
      </a>
      <a href="/beneficios/auxilio-inclusao/" class="category-card">
        <h3 class="category-title">Auxílio-Inclusão (50% do BPC)</h3>
        <p class="category-desc">Incentivo financeiro para quem recebe o BPC e ingressa no mercado de trabalho formal.</p>
      </a>
      <a href="/beneficios/beneficios-do-inss/" class="category-card">
        <h3 class="category-title">Aposentadoria PcD (Lei Complementar 142/13)</h3>
        <p class="category-desc">Idade e tempo de contribuição reduzidos conforme o grau de deficiência (leve, moderada ou grave).</p>
      </a>
      <a href="/beneficios/cadunico/" class="category-card">
        <h3 class="category-title">Cadastro Único (CadÚnico)</h3>
        <p class="category-desc">Inscrição obrigatória no CRAS para acesso a qualquer programa social federal.</p>
      </a>
      <a href="/beneficios/como-solicitar/" class="category-card">
        <h3 class="category-title">Passo a Passo de Solicitação</h3>
        <p class="category-desc">Tutorial detalhado para requerer benefícios pelo aplicativo Meu INSS ou telefone 135.</p>
      </a>
      <a href="/beneficios/documentacao/" class="category-card">
        <h3 class="category-title">Checklist de Documentação</h3>
        <p class="category-desc">Laudos médicos, receituários, comprovantes de gastos e certidões necessárias.</p>
      </a>
    </div>

    <div class="info-callout success">
      <strong>Ferramenta Gratuita:</strong> Utilize nosso <a href="/ferramentas/simulador-bpc/"><strong>Simulador de Elegibilidade ao BPC/LOAS</strong></a> para calcular a renda líquida per capita da sua família antes de dar entrada no pedido.
    </div>
  `,
  sidebarTitle: 'Guias de Benefícios',
  sidebarLinks: beneficiosSubnav,
  sidebarTools: beneficiosTools
});

// /beneficios/bpc-loas/
writePage('beneficios/bpc-loas/index.html', {
  url: '/beneficios/bpc-loas/',
  title: 'BPC/LOAS: O que é, Quem tem Direito e Como Funciona • Guia Completo',
  description: 'Tudo sobre o Benefício de Prestação Continuada (BPC): valor de 1 salário mínimo mensal, critério de renda de 1/4 do SM e jurisprudência do STF sobre gastos com saúde.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Benefícios', url: '/beneficios/' }, { name: 'BPC/LOAS', url: '/beneficios/bpc-loas/' }],
  badge: 'ART. 203 DA CF/88 & LEI 8.742/1993',
  h1: 'Benefício de Prestação Continuada (BPC / LOAS)',
  lead: 'Garantia de 1 salário mínimo mensal (R$ 1.412,00) pago pelo INSS à pessoa com deficiência de qualquer idade que comprove impedimento de longo prazo e vulnerabilidade socioeconômica.',
  subnavLinks: beneficiosSubnav,
  bodyHtml: `
    <h2>Quem tem direito ao BPC/LOAS?</h2>
    <p>Para ter direito ao BPC, a pessoa com deficiência deve cumprir simultaneamente dois requisitos:</p>
    <ol>
      <li><strong>Impedimento de longo prazo:</strong> Comprovar limitação física, mental, intelectual ou sensorial com duração mínima de 2 anos, confirmada por avaliação médica e avaliação social do INSS.</li>
      <li><strong>Vulnerabilidade socioeconômica:</strong> Renda familiar líquida por pessoa inferior a 1/4 do salário mínimo nacional (R$ 353,00).</li>
    </ol>

    <div class="info-callout warning">
      <strong>Flexibilização pelo STF (Recurso Extraordinário 567.985):</strong><br>
      O Supremo Tribunal Federal já declarou inconstitucional a exigência mecânica e rígida de 1/4 de salário mínimo. Caso a renda familiar per capita esteja entre 1/4 e 1/2 salário mínimo (até R$ 706,00), a família tem direito a deduzir gastos contínuos essenciais com medicamentos, fraldas geriátricas e alimentação especial não fornecidos pelo SUS.
    </div>

    <h2>O BPC paga 13º salário ou deixa pensão por morte?</h2>
    <p>Não. Por ser um benefício de <em>assistência social</em> e não de <em>previdência</em>, o BPC não dá direito a décimo terceiro salário nem deixa pensão por morte aos dependentes em caso de falecimento do beneficiário.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: beneficiosSubnav,
  sidebarTools: beneficiosTools
});

// /beneficios/auxilio-inclusao/
writePage('beneficios/auxilio-inclusao/index.html', {
  url: '/beneficios/auxilio-inclusao/',
  title: 'Auxílio-Inclusão à Pessoa com Deficiência • Lei 14.176/2021',
  description: 'Saiba como funciona o Auxílio-Inclusão: benefício mensal de 50% do BPC para quem ingressa no mercado de trabalho com carteira assinada ou como servidor público.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Benefícios', url: '/beneficios/' }, { name: 'Auxílio-Inclusão', url: '/beneficios/auxilio-inclusao/' }],
  badge: 'LEI FEDERAL Nº 14.176/2021',
  h1: 'Auxílio-Inclusão à Pessoa com Deficiência',
  lead: 'Criado pela Lei nº 14.176/2021, o Auxílio-Inclusão paga mensalmente metade do valor do BPC (50% do salário mínimo) para a pessoa com deficiência que consegue um emprego formal.',
  subnavLinks: beneficiosSubnav,
  bodyHtml: `
    <h2>Como funciona o incentivo?</h2>
    <p>Historicamente, muitas pessoas com deficiência tinham receio de trabalhar de carteira assinada para não perder o BPC. O Auxílio-Inclusão foi criado exatamente para acabar com esse obstáculo:</p>
    <ul>
      <li>Ao conseguir um emprego com remuneração de até 2 salários mínimos, o BPC é suspenso temporariamente e a pessoa passa a receber o <strong>Auxílio-Inclusão (R$ 706,00) somado ao seu salário integral da empresa</strong>;</li>
      <li>Se a pessoa perder o emprego posteriormente, o BPC original é restabelecido automaticamente sem necessidade de passar por nova perícia médica demorada.</li>
    </ul>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: beneficiosSubnav,
  sidebarTools: beneficiosTools
});

// /beneficios/beneficios-do-inss/
writePage('beneficios/beneficios-do-inss/index.html', {
  url: '/beneficios/beneficios-do-inss/',
  title: 'Aposentadoria da Pessoa com Deficiência no INSS • Lei Complementar 142/13',
  description: 'Regras da aposentadoria especial PcD: redução de até 10 anos no tempo de contribuição ou redução na idade mínima conforme o grau leve, moderado ou grave.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Benefícios', url: '/beneficios/' }, { name: 'Aposentadoria PcD', url: '/beneficios/beneficios-do-inss/' }],
  badge: 'LEI COMPLEMENTAR Nº 142/2013',
  h1: 'Aposentadoria da Pessoa com Deficiência no INSS',
  lead: 'Trabalhadores com deficiência que contribuem para o INSS têm direito a regras diferenciadas e mais vantajosas de aposentadoria por tempo de contribuição ou por idade.',
  subnavLinks: beneficiosSubnav,
  bodyHtml: `
    <h2>Aposentadoria por Tempo de Contribuição</h2>
    <p>A Lei Complementar nº 142/2013 estabelece a seguinte redução de tempo conforme o grau de deficiência apurado em perícia biopsicossocial do INSS:</p>
    <ul>
      <li><strong>Deficiência Grave:</strong> 25 anos de contribuição (homens) e 20 anos (mulheres);</li>
      <li><strong>Deficiência Moderada:</strong> 29 anos de contribuição (homens) e 24 anos (mulheres);</li>
      <li><strong>Deficiência Leve:</strong> 33 anos de contribuição (homens) e 28 anos (mulheres).</li>
    </ul>

    <h2>Aposentadoria por Idade da PcD</h2>
    <p>Na modalidade por idade, exige-se apenas <strong>60 anos de idade para homens</strong> e <strong>55 anos de idade para mulheres</strong>, com mínimo de 15 anos comprovados de trabalho na condição de pessoa com deficiência.</p>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: beneficiosSubnav,
  sidebarTools: beneficiosTools
});

// /beneficios/cadunico/
writePage('beneficios/cadunico/index.html', {
  url: '/beneficios/cadunico/',
  title: 'Cadastro Único (CadÚnico) para PcD • Como Inscrever e Atualizar no CRAS',
  description: 'Passo a passo da inscrição no CadÚnico: documentos da família, agendamento no CRAS, comprovante de inscrição e importância para concessão do BPC.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Benefícios', url: '/beneficios/' }, { name: 'CadÚnico', url: '/beneficios/cadunico/' }],
  badge: 'DECRETO FEDERAL Nº 11.016/2022',
  h1: 'Cadastro Único (CadÚnico) para PcD',
  lead: 'A inscrição ativa e atualizada no CadÚnico é requisito obrigatório prévio para requerer o BPC/LOAS, tarifa social de energia elétrica e diversos outros programas sociais.',
  subnavLinks: beneficiosSubnav,
  bodyHtml: `
    <h2>Onde e como fazer a inscrição?</h2>
    <p>O cadastro deve ser realizado presencialmente no <strong>Centro de Referência de Assistência Social (CRAS)</strong> mais próximo da residência da família. O responsável familiar (preferencialmente mulher com 16 anos ou mais) deve apresentar:</p>
    <ul>
      <li>CPF de todos os membros que moram na residência;</li>
      <li>Certidões de nascimento ou casamento;</li>
      <li>Comprovante de residência atualizado (conta de luz);</li>
      <li>Comprovantes de renda de quem trabalha ou declaração de trabalho informal;</li>
      <li>Laudos médicos e comprovantes de gastos com farmácia da pessoa com deficiência.</li>
    </ul>

    <div class="info-callout warning">
      <strong>Prazo de Validade:</strong> O CadÚnico deve ser atualizado obrigatoriamente a cada <strong>2 anos</strong> ou sempre que houver mudança de endereço, nascimento, morte ou alteração de renda na família. A desatualização provoca o bloqueio automático de benefícios no INSS.
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: beneficiosSubnav,
  sidebarTools: beneficiosTools
});

// /beneficios/como-solicitar/
writePage('beneficios/como-solicitar/index.html', {
  url: '/beneficios/como-solicitar/',
  title: 'Como Solicitar o BPC no Meu INSS • Guia Passo a Passo sem Intermediários',
  description: 'Aprenda a solicitar o BPC/LOAS sozinho pela internet através do portal ou aplicativo Meu INSS ou pelo telefone 135. Evite taxas e despachantes desnecessários.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Benefícios', url: '/beneficios/' }, { name: 'Como Solicitar', url: '/beneficios/como-solicitar/' }],
  badge: 'PORTAL MEU INSS (OFICIAL)',
  h1: 'Como Solicitar Benefícios pelo Meu INSS',
  lead: 'Não é obrigatório contratar intermediários para dar entrada no BPC. O processo pode ser feito gratuitamente pela internet pelo próprio requerente ou por familiares.',
  subnavLinks: beneficiosSubnav,
  bodyHtml: `
    <h2>Passo a Passo Digital</h2>
    <div class="step-guide-box">
      <div class="step-guide-item">
        <div class="step-guide-num">1</div>
        <div>
          <h4>Acesse a Conta Gov.br</h4>
          <p>Entre no aplicativo ou site <strong>meu.inss.gov.br</strong> utilizando o CPF e senha da conta gov.br do titular do benefício.</p>
        </div>
      </div>
      <div class="step-guide-item">
        <div class="step-guide-num">2</div>
        <div>
          <h4>Novo Pedido</h4>
          <p>Clique em <em>"Novo Pedido"</em> e digite na busca a palavra <strong>"BPC"</strong> ou <strong>"Benefício de Prestação Continuada"</strong>.</p>
        </div>
      </div>
      <div class="step-guide-item">
        <div class="step-guide-num">3</div>
        <div>
          <h4>Anexe os Laudos em PDF</h4>
          <p>Envie fotos nítidas ou arquivos em PDF do laudo médico com CID, exames, receituários e comprovante de inscrição no CadÚnico.</p>
        </div>
      </div>
      <div class="step-guide-item">
        <div class="step-guide-num">4</div>
        <div>
          <h4>Acompanhe as Perícias</h4>
          <p>O INSS agendará duas datas: a <strong>Avaliação Social</strong> com assistente social e a <strong>Perícia Médica</strong>. Compareça pontualmente em ambas com todos os documentos originais.</p>
        </div>
      </div>
    </div>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: beneficiosSubnav,
  sidebarTools: beneficiosTools
});

// /beneficios/documentacao/
writePage('beneficios/documentacao/index.html', {
  url: '/beneficios/documentacao/',
  title: 'Documentos Necessários para BPC e Benefícios do INSS • Checklist Completo',
  description: 'Lista completa de documentos obrigatórios para não ter o benefício negado: identificação pessoal, laudo multiprofissional com CID, NIS e comprovantes.',
  breadcrumbs: [{ name: 'Início', url: '/' }, { name: 'Benefícios', url: '/beneficios/' }, { name: 'Documentação', url: '/beneficios/documentacao/' }],
  badge: 'CHECKLIST OFICIAL',
  h1: 'Documentos Exigidos para Pedidos no INSS',
  lead: 'A falta de documentos ou laudos mal redigidos são as causas de 80% dos indeferimentos indevidos. Confira o checklist antes de agendar a perícia.',
  subnavLinks: beneficiosSubnav,
  bodyHtml: `
    <h2>Documentos Pessoais do Grupo Familiar</h2>
    <ul>
      <li>RG e CPF do requerente e de todos que residem no mesmo domicílio;</li>
      <li>Certidão de Nascimento (para menores de idade) ou Casamento/União Estável;</li>
      <li>Comprovante de residência atualizado (últimos 60 dias);</li>
      <li>Folha Resumo do CadÚnico com Número de Identificação Social (NIS).</li>
    </ul>

    <h2>Documentos Médicos Indispensáveis</h2>
    <ul>
      <li><strong>Laudo Médico Completo:</strong> Deve conter CID-10 ou CID-11, descrição pormenorizada do impedimento funcional, data, carimbo e CRM legível do médico;</li>
      <li><strong>Exames complementares:</strong> Tomografias, ressonâncias, audiometrias, testes genéticos ou neurológicos;</li>
      <li><strong>Receituários e notas fiscais de farmácia:</strong> Comprovação de gastos com remédios não fornecidos pela rede pública municipal/estadual.</li>
    </ul>
  `,
  sidebarTitle: 'Tópicos Relacionados',
  sidebarLinks: beneficiosSubnav,
  sidebarTools: beneficiosTools
});

console.log('✅ Área 2 concluída com sucesso!');
