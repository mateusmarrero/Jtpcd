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
// ÁREA 9: DOCUMENTAÇÃO E LAUDOS (/documentacao/)
// ==========================================
const subnavArea9 = [
  { label: 'Visão Geral', url: '/documentacao/' },
  { label: 'Laudo Médico & CID', url: '/documentacao/laudo-medico/' },
  { label: 'CIPTEA (Autismo)', url: '/documentacao/ciptea/' },
  { label: 'Identificação PcD', url: '/documentacao/identificacao-pcd/' },
  { label: 'Checklist Documentos', url: '/documentacao/documentos-necessarios/' }
];

// 1. /documentacao/
writePage('documentacao/index.html', {
  title: 'Documentação e Laudos para PcD: Guia Completo e Direitos | Já Te Contaram PcD?',
  description: 'Saiba como emitir laudos médicos oficiais, obter a CIPTEA, a nova Carteira de Identidade Nacional com símbolo PcD e organizar documentos para perícias.',
  url: '/documentacao/',
  badge: 'Área 9 — Documentação e Laudos Oficiais',
  h1: 'Central de Documentação, Laudos e Identificação PcD',
  lead: 'Ter a documentação correta e atualizada é o passo fundamental para garantir todos os direitos, isenções, cotas e benefícios previstos na legislação brasileira.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Documentação e Laudos', url: '/documentacao/' }
  ],
  subnav: subnavArea9,
  bodyHtml: `
    <p>No Brasil, o acesso a políticas públicas afirmativas, isenções de impostos, vagas reservadas em concursos e empregos, além de benefícios como o BPC/LOAS, depende da comprovação formal da condição de pessoa com deficiência. Um laudo médico incompleto ou sem a fundamentação legal adequada é a principal causa de indeferimentos administrativos.</p>

    <h2>Pilares da Documentação PcD no Brasil</h2>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:1.25rem; margin:1.5rem 0;">
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="font-size:1.75rem; margin-bottom:0.5rem;">📋</div>
            <h3 style="font-size:1.1rem; color:#0f172a; margin-bottom:0.5rem;">Laudo Médico Biopsicossocial</h3>
            <p style="font-size:0.875rem; color:#64748b; line-height:1.5; margin-bottom:0.75rem;">Documento emitido por médico com CID-10/CID-11, descrição detalhada dos impedimentos de longo prazo e limitações funcionais.</p>
            <a href="/documentacao/laudo-medico/" class="btn btn-outline btn-sm">Ver Requisitos do Laudo</a>
        </div>
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="font-size:1.75rem; margin-bottom:0.5rem;">🧩</div>
            <h3 style="font-size:1.1rem; color:#0f172a; margin-bottom:0.5rem;">CIPTEA — Carteira do Autista</h3>
            <p style="font-size:0.875rem; color:#64748b; line-height:1.5; margin-bottom:0.75rem;">Criada pela Lei Romeo Mion (Lei 13.977/2020), garante atendimento prioritário e identificação imediata sem constrangimentos.</p>
            <a href="/documentacao/ciptea/" class="btn btn-outline btn-sm">Como Emitir a CIPTEA</a>
        </div>
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="font-size:1.75rem; margin-bottom:0.5rem;">🪪</div>
            <h3 style="font-size:1.1rem; color:#0f172a; margin-bottom:0.5rem;">Nova Carteira de Identidade (CIN)</h3>
            <p style="font-size:0.875rem; color:#64748b; line-height:1.5; margin-bottom:0.75rem;">A nova identidade nacional unificada com CPF permite incluir o símbolo internacional de acessibilidade e o código CID.</p>
            <a href="/documentacao/identificacao-pcd/" class="btn btn-outline btn-sm">Entenda a Identificação</a>
        </div>
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="font-size:1.75rem; margin-bottom:0.5rem;">📁</div>
            <h3 style="font-size:1.1rem; color:#0f172a; margin-bottom:0.5rem;">Dossiê para Perícias</h3>
            <p style="font-size:0.875rem; color:#64748b; line-height:1.5; margin-bottom:0.75rem;">Checklist completo de exames complementares, relatórios multidisciplinares (fonoaudiologia, psicologia, TO) e receitas.</p>
            <a href="/documentacao/documentos-necessarios/" class="btn btn-outline btn-sm">Checklist Completo</a>
        </div>
    </div>

    <div class="legal-box">
        <h4>Base Normativa Fundamental</h4>
        <p>A Lei Brasileira de Inclusão (Lei nº 13.146/2015, Art. 2º) estabelece que a avaliação da deficiência, quando necessária, será biopsicossocial, realizada por equipe multiprofissional e interdisciplinar e considerará os impedimentos nas funções e nas estruturas do corpo, os fatores socioambientais, psicológicos e pessoais, a limitação no desempenho de atividades e a restrição de participação social.</p>
    </div>
  `
});

// 2. /documentacao/laudo-medico/
writePage('documentacao/laudo-medico/index.html', {
  title: 'Como Deve Ser o Laudo Médico para PcD: Modelo e Normas Legais | Já Te Contaram PcD?',
  description: 'Guia prático para médicos e pacientes sobre os requisitos de um laudo médico pericial válido para INSS, Receita Federal, concursos e empresas.',
  url: '/documentacao/laudo-medico/',
  badge: 'Laudo Pericial & Modelo',
  h1: 'Requisitos Essenciais do Laudo Médico para PcD',
  lead: 'Descubra quais elementos não podem faltar no laudo médico para que ele seja aceito sem contestações em perícias do INSS, concursos públicos e Receita Federal.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Documentação', url: '/documentacao/' },
    { label: 'Laudo Médico', url: '/documentacao/laudo-medico/' }
  ],
  subnav: subnavArea9,
  bodyHtml: `
    <p>O laudo médico pericial é o instrumento documental primordial para a comprovação da deficiência perante qualquer órgão público ou entidade privada. Muitas solicitações de benefícios e isenções são indeferidas não porque a pessoa não tenha direito, mas porque o laudo apresentado é vago, genérico ou não atende aos parâmetros técnicos da legislação.</p>

    <h2>Elementos Obrigatórios em um Laudo Válido</h2>
    <div class="step-guide-box">
        <ol>
            <li><strong>Identificação Completa do Paciente:</strong> Nome completo, CPF, RG e data de nascimento.</li>
            <li><strong>Diagnóstico Clínico com Código CID:</strong> Indicação expressa da Classificação Internacional de Doenças (CID-10 ou CID-11) correspondente à patologia ou sequela.</li>
            <li><strong>Descrição Pormenorizada da Deficiência:</strong> Detalhamento da etiologia (causa) e de como a condição afeta a funcionalidade, autonomia ou capacidade motora/sensorial/cognitiva.</li>
            <li><strong>Caráter Permanente ou Duração:</strong> Declaração de que o impedimento é de longo prazo ou de caráter permanente/irreversível, quando aplicável.</li>
            <li><strong>Enquadramento Legal:</strong> Menção expressa ao Decreto nº 3.298/1999 (art. 3º e 4º), Decreto nº 5.296/2004 e Lei nº 13.146/2015.</li>
            <li><strong>Identificação do Profissional:</strong> Nome legível do médico, número de registro no CRM, especialidade, assinatura e carimbo com data recente.</li>
        </ol>
    </div>

    <div class="info-callout">
        <h4>Validade do Laudo: Deficiências Permanentes</h4>
        <p>Diversos estados e municípios brasileiros (como São Paulo e Rio de Janeiro) já possuem legislações específicas determinando que laudos médicos que atestem <strong>deficiências de caráter irreversível ou permanente possuem prazo de validade indeterminado</strong>. Para o INSS e concursos federais, contudo, recomenda-se que exames e laudos tenham sido atualizados nos últimos 12 a 24 meses para demonstrar o quadro atual de funcionalidade.</p>
    </div>

    <h2>Relatórios Multiprofissionais de Suporte</h2>
    <p>Além do laudo assinado pelo médico especialista, é altamente recomendável anexar relatórios elaborados por outros profissionais que acompanham o paciente, tais como:</p>
    <ul>
        <li><strong>Fisioterapeuta:</strong> Mensuração de amplitude articular, força muscular e marcha;</li>
        <li><strong>Terapeuta Ocupacional:</strong> Avaliação do desempenho nas Atividades de Vida Diária (AVDs) e uso de tecnologia assistiva;</li>
        <li><strong>Psicólogo / Neuropsicólogo:</strong> Testes cognitivos, escalas Vineland, ADOS-2 ou WISC para avaliação de deficiência intelectual ou autismo;</li>
        <li><strong>Fonoaudiólogo:</strong> Exames de audiometria tonal e vocal com imitanciometria.</li>
    </ul>
  `
});

// 3. /documentacao/ciptea/
writePage('documentacao/ciptea/index.html', {
  title: 'CIPTEA — Carteira do Autista (Lei Romeo Mion): Como Solicitar | Já Te Contaram PcD?',
  description: 'Saiba tudo sobre a Carteira de Identificação da Pessoa com Transtorno do Espectro Autista: gratuidade, documentação e onde requerer no seu estado.',
  url: '/documentacao/ciptea/',
  badge: 'Autismo & Lei Romeo Mion',
  h1: 'CIPTEA: Carteira de Identificação da Pessoa com Autismo',
  lead: 'Instituída pela Lei Federal nº 13.977/2020, a CIPTEA visa garantir atenção integral, pronto atendimento e prioridade no acesso aos serviços públicos e privados.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Documentação', url: '/documentacao/' },
    { label: 'CIPTEA', url: '/documentacao/ciptea/' }
  ],
  subnav: subnavArea9,
  bodyHtml: `
    <p>A <strong>Carteira de Identificação da Pessoa com Transtorno do Espectro Autista (CIPTEA)</strong> foi criada pela Lei Federal nº 13.977/2020, carinhosamente conhecida como <strong>Lei Romeo Mion</strong>. Ela responde a uma demanda histórica de famílias atípicas: o autismo não possui características físicas visíveis imediatas, o que frequentemente expunha pessoas autistas e seus responsáveis a situações de desconfiança e constrangimento ao exercerem seus direitos de atendimento prioritário.</p>

    <h2>Benefícios e Garantias da CIPTEA</h2>
    <ul>
        <li><strong>Atendimento Prioritário Imediato:</strong> Em bancos, supermercados, hospitais, farmácias, aeroportos e repartições públicas;</li>
        <li><strong>Validade Nacional:</strong> Válida em todo o território brasileiro pelo prazo de 5 anos (com renovação simplificada mantendo a numeração original);</li>
        <li><strong>Identificação Rápida em Emergências:</strong> Contém dados de contato dos responsáveis legais e tipo sanguíneo para suporte em ocorrências médicas ou crises;</li>
        <li><strong>Gratuidade Total:</strong> A emissão da CIPTEA é 100% gratuita por determinação de lei federal.</li>
    </ul>

    <h2>Documentos Exigidos para Solicitação</h2>
    <div class="legal-box">
        <ul style="margin:0; padding-left:1.25rem;">
            <li>Requerimento preenchido e assinado pelo titular ou seu representante legal;</li>
            <li>Relatório médico com indicação do diagnóstico de autismo e CID correspondente (F84 no CID-10 ou 6A02 no CID-11), com CRM legível;</li>
            <li>Certidão de nascimento ou documento de identidade oficial com foto e CPF do paciente;</li>
            <li>Documento de identidade e CPF dos pais ou responsáveis legais;</li>
            <li>Comprovante de residência atualizado;</li>
            <li>Foto 3x4 recente;</li>
            <li>Indicação do tipo sanguíneo e fator Rh (se disponível).</li>
        </ul>
    </div>

    <h2>Onde Solicitar a Carteira no seu Estado</h2>
    <p>A emissão da CIPTEA é descentralizada e gerenciada pelos governos estaduais ou secretarias municipais de direitos humanos e assistência social. Na maioria dos estados (como RJ, SP, MG, BA, RS), o processo pode ser feito <strong>100% online</strong> através dos portais de serviços digitais do governo estadual (por exemplo: Poupatempo em SP, RJ Digital no RJ).</p>
  `
});

// 4. /documentacao/identificacao-pcd/
writePage('documentacao/identificacao-pcd/index.html', {
  title: 'Identificação PcD: Nova Carteira de Identidade Nacional e Símbolos | Já Te Contaram PcD?',
  description: 'Como incluir os símbolos internacionais de deficiência, CID e tipo sanguíneo no novo RG brasileiro (CIN) e no aplicativo Gov.br.',
  url: '/documentacao/identificacao-pcd/',
  badge: 'Cidadania & Identidade',
  h1: 'Nova Carteira de Identidade Nacional (CIN) com Símbolo PcD',
  lead: 'Descubra como unificar seus documentos e incluir a comprovação de deficiência diretamente no documento de identificação mais moderno do Brasil.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Documentação', url: '/documentacao/' },
    { label: 'Identificação PcD', url: '/documentacao/identificacao-pcd/' }
  ],
  subnav: subnavArea9,
  bodyHtml: `
    <p>Com a implantação da <strong>Carteira de Identidade Nacional (CIN)</strong> em todo o Brasil (Decreto nº 10.977/2022), o documento de identificação passou a utilizar o CPF como número único de registro geral, eliminando as antigas fraudes de múltiplos números de RG por estado.</p>
    <p>Uma das maiores conquistas da comunidade PcD é que a nova identidade permite a inserção dos <strong>símbolos internacionais de acessibilidade</strong> e condições de saúde específicas diretamente no verso do documento físico e no aplicativo oficial do Gov.br.</p>

    <h2>Símbolos que Podem Constar no Documento</h2>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:1rem; margin:1.5rem 0;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1rem;">
            <strong>♿ Deficiência Física / Motora:</strong> Símbolo Internacional de Acesso (cadeirante).
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1rem;">
            <strong>👁️ Deficiência Visual:</strong> Pessoa com bengala longa ou cão-guia.
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1rem;">
            <strong>🦻 Deficiência Auditiva:</strong> Orelha cortada com barra diagonal.
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1rem;">
            <strong>🧠 Deficiência Intelectual:</strong> Cérebro estilizado ou símbolo cognitivo.
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1rem;">
            <strong>🧩 Espectro Autista:</strong> Fita quebra-cabeça multicolorida.
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1rem;">
            <strong>🌻 Deficiências Não Visíveis:</strong> Cordão de Girassol oficial (Lei 14.624/2023).
        </div>
    </div>

    <h2>Passo a Passo para Emitir a CIN com Inclusão PcD</h2>
    <div class="step-guide-box">
        <ol>
            <li><strong>Agendamento no Órgão Emissor:</strong> Acesse o site do Instituto de Identificação Civil da Polícia Civil ou Poupatempo/Detran do seu estado;</li>
            <li><strong>Apresentação do Laudo Médico Original:</strong> Leve o laudo médico constando CID e assinatura com carimbo do médico;</li>
            <li><strong>Documentos Pessoais:</strong> Certidão de nascimento ou casamento (original ou cópia autenticada) e comprovante de inscrição no CPF regularizado;</li>
            <li><strong>Dados Médicos Adicionais (Opcional):</strong> Exame com comprovação do tipo sanguíneo e fator Rh;</li>
            <li><strong>Recebimento da Versão Digital:</strong> Após a emissão, baixe o aplicativo Gov.br para ter o documento digital com QR Code no celular.</li>
        </ol>
    </div>
  `
});

// 5. /documentacao/documentos-necessarios/
writePage('documentacao/documentos-necessarios/index.html', {
  title: 'Checklist Completo de Documentos para Requerimentos PcD | Já Te Contaram PcD?',
  description: 'Tabela prática com todos os documentos exigidos para INSS, BPC, isenção veicular, passe livre e cotas universitárias.',
  url: '/documentacao/documentos-necessarios/',
  badge: 'Checklist Prático',
  h1: 'Checklist de Documentos para Direitos PcD',
  lead: 'Organize uma pasta documental completa para evitar atrasos e recursos desnecessários em seus pedidos de benefícios e isenções.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Documentação', url: '/documentacao/' },
    { label: 'Checklist de Documentos', url: '/documentacao/documentos-necessarios/' }
  ],
  subnav: subnavArea9,
  bodyHtml: `
    <p>A burocracia no Brasil pode ser desafiadora, mas estar com a pasta documental organizada antecipadamente transforma o processo em uma experiência segura e sem imprevistos. Abaixo, separamos o checklist oficial para os principais procedimentos do cidadão com deficiência.</p>

    <h2>Tabela de Documentos por Finalidade</h2>
    <div style="overflow-x:auto; margin:1.5rem 0;">
        <table style="width:100%; border-collapse:collapse; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <thead>
                <tr style="background:#001B44; color:#fff; text-align:left;">
                    <th style="padding:12px 16px;">Finalidade / Benefício</th>
                    <th style="padding:12px 16px;">Documentos Principais</th>
                    <th style="padding:12px 16px;">Órgão Responsável</th>
                </tr>
            </thead>
            <tbody style="font-size:0.9rem; color:#334155;">
                <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:12px 16px; font-weight:600;">BPC / LOAS</td>
                    <td style="padding:12px 16px;">CadÚnico atualizado, RG/CPF de todos da família, Laudo com CID, Comprovantes de gastos com fraldas e remédios.</td>
                    <td style="padding:12px 16px;">CRAS / INSS</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;">
                    <td style="padding:12px 16px; font-weight:600;">Isenção Veicular (IPI)</td>
                    <td style="padding:12px 16px;">Laudo médico em formulário da Receita Federal (Anexo XI/XII), CNH Especial (se condutor) ou indicação de até 3 condutores autorizados.</td>
                    <td style="padding:12px 16px;">Receita Federal (Sisen)</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:12px 16px; font-weight:600;">Passe Livre Interestadual</td>
                    <td style="padding:12px 16px;">Formulário médico do Ministério dos Transportes assinado por médico do SUS, foto 3x4, comprovante de renda de até 1 salário mínimo.</td>
                    <td style="padding:12px 16px;">Governo Federal (ANTT)</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;">
                    <td style="padding:12px 16px; font-weight:600;">Cartão de Estacionamento DeFis</td>
                    <td style="padding:12px 16px;">Requerimento municipal, Laudo médico atestando dificuldade severa de locomoção, CNH ou RG, comprovante de residência no município.</td>
                    <td style="padding:12px 16px;">Secretaria Municipal de Trânsito</td>
                </tr>
                <tr>
                    <td style="padding:12px 16px; font-weight:600;">Cotas em Concursos Públicos</td>
                    <td style="padding:12px 16px;">Laudo médico detalhado com CID, declaração expressa de compatibilidade funcional com as atribuições do cargo pretendido.</td>
                    <td style="padding:12px 16px;">Banca Organizadora / Perícia Oficial</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="info-callout">
        <h4>Dica do Especialista Moisés Souza</h4>
        <p>Digitalize todos os seus laudos, relatórios, exames e comprovantes em formato PDF com boa resolução e guarde em uma pasta em nuvem (como Google Drive ou OneDrive). Tenha também sempre ao menos duas vias físicas com carimbo original em mãos.</p>
    </div>
  `
});

// ==========================================
// ÁREA 10: CENTRAL DE FERRAMENTAS E SERVIÇOS (/ferramentas/)
// ==========================================
const subnavArea10 = [
  { label: 'Todas as Ferramentas', url: '/ferramentas/' },
  { label: 'Simulador BPC/LOAS', url: '/ferramentas/simulador-bpc/' },
  { label: 'Calculadora de Isenções', url: '/ferramentas/calculadora-isencoes/' },
  { label: 'Calculadora de Cotas', url: '/ferramentas/calculadora-cotas/' },
  { label: 'Gerador de Petições', url: '/ferramentas/gerador-requerimentos/' }
];

// 1. /ferramentas/
writePage('ferramentas/index.html', {
  title: 'Central de Ferramentas Gratuitas para PcD e Empresas | Já Te Contaram PcD?',
  description: 'Simule o direito ao BPC, calcule isenções de impostos veiculares, calcule a cota de empregados com deficiência e gere modelos de petições em segundos.',
  url: '/ferramentas/',
  badge: 'Área 10 — Central de Ferramentas Exclusivas',
  h1: 'Ferramentas Interativas e Calculadoras Oficiais PcD',
  lead: 'Ferramentas 100% gratuitas desenvolvidas com a consultoria técnica de Moisés Souza para auxiliar cidadãos, famílias e departamentos de Recursos Humanos.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Central de Ferramentas', url: '/ferramentas/' }
  ],
  subnav: subnavArea10,
  bodyHtml: `
    <p>A plataforma <strong>Já Te Contaram PcD?</strong> disponibiliza ferramentas inteligentes para simplificar cálculos complexos de direitos e enquadramentos legais. Nossos algoritmos são atualizados com a legislação em vigor no Brasil (salário mínimo de R$ 1.518,00, Convênios CONFAZ e Leis de Cotas).</p>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem; margin:2rem 0;">
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
                <div style="font-size:2rem; margin-bottom:0.75rem;">💰</div>
                <h3 style="font-size:1.25rem; color:#0f172a; margin-bottom:0.5rem;">Simulador do BPC/LOAS</h3>
                <p style="font-size:0.9rem; color:#64748b; line-height:1.5; margin-bottom:1rem;">Descubra se sua família cumpre o critério de renda per capita de 1/4 do salário mínimo (R$ 379,50), com dedução legal de despesas com remédios e fraldas.</p>
            </div>
            <a href="/ferramentas/simulador-bpc/" class="btn btn-primary" style="width:100%; justify-content:center;">Abrir Simulador BPC</a>
        </div>

        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
                <div style="font-size:2rem; margin-bottom:0.75rem;">🚗</div>
                <h3 style="font-size:1.25rem; color:#0f172a; margin-bottom:0.5rem;">Calculadora de Isenções Veiculares</h3>
                <p style="font-size:0.9rem; color:#64748b; line-height:1.5; margin-bottom:1rem;">Calcule na hora a economia estimada de IPI, ICMS e IPVA na compra do carro 0km PcD, de acordo com o preço de tabela e o seu estado.</p>
            </div>
            <a href="/ferramentas/calculadora-isencoes/" class="btn btn-primary" style="width:100%; justify-content:center;">Abrir Calculadora de Carro</a>
        </div>

        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
                <div style="font-size:2rem; margin-bottom:0.75rem;">💼</div>
                <h3 style="font-size:1.25rem; color:#0f172a; margin-bottom:0.5rem;">Calculadora da Lei de Cotas (Art. 93)</h3>
                <p style="font-size:0.9rem; color:#64748b; line-height:1.5; margin-bottom:1rem;">Indispensável para empresas e RHs: insira o número total de colaboradores e obtenha a quantidade exata de postos reservados por lei.</p>
            </div>
            <a href="/ferramentas/calculadora-cotas/" class="btn btn-primary" style="width:100%; justify-content:center;">Calcular Cota Empresarial</a>
        </div>

        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
                <div style="font-size:2rem; margin-bottom:0.75rem;">📝</div>
                <h3 style="font-size:1.25rem; color:#0f172a; margin-bottom:0.5rem;">Gerador Oficial de Requerimentos</h3>
                <p style="font-size:0.9rem; color:#64748b; line-height:1.5; margin-bottom:1rem;">Gere petições administrativas formais e fundamentadas na LBI para apoio escolar (AEE), acessibilidade predial e prioridade de atendimento.</p>
            </div>
            <a href="/ferramentas/gerador-requerimentos/" class="btn btn-primary" style="width:100%; justify-content:center;">Gerar Requerimento Grátis</a>
        </div>
    </div>
  `
});

// 2. /ferramentas/simulador-bpc/
writePage('ferramentas/simulador-bpc/index.html', {
  title: 'Simulador do BPC/LOAS 2026: Calcule Renda Per Capita e Elegibilidade | Já Te Contaram PcD?',
  description: 'Simule online se sua família tem direito ao BPC de R$ 1.518,00 mensais com desconto de despesas com saúde.',
  url: '/ferramentas/simulador-bpc/',
  badge: 'Ferramenta 1 — Benefício Social',
  h1: 'Simulador do Benefício de Prestação Continuada (BPC)',
  lead: 'Descubra a renda per capita familiar líquida com base nas regras do INSS e confira sua pontuação de elegibilidade para o BPC.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Ferramentas', url: '/ferramentas/' },
    { label: 'Simulador BPC', url: '/ferramentas/simulador-bpc/' }
  ],
  subnav: subnavArea10,
  bodyHtml: `
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:2rem; box-shadow:0 10px 25px -5px rgba(0,0,0,0.08); margin-bottom:2rem;">
        <h2 style="font-size:1.4rem; color:#001B44; margin-top:0; margin-bottom:1rem;">Insira os Dados da Composição Familiar</h2>
        
        <form id="bpcSimuladorForm" style="display:grid; grid-template-columns:1fr; gap:1.25rem;">
            <div>
                <label for="bpcRendaTotal" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">
                    Renda Familiar Bruta Mensal Total (R$):
                </label>
                <input type="number" step="0.01" id="bpcRendaTotal" name="bpcRendaTotal" required placeholder="Ex: 1400.00" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;" aria-describedby="rendaHelp">
                <small id="rendaHelp" style="color:#64748b; font-size:0.8rem; display:block; margin-top:0.25rem;">Some salários, aposentadorias ou pensões dos membros que residem sob o mesmo teto.</small>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">
                <div>
                    <label for="bpcQtdPessoas" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">
                        Número de Pessoas no Domicílio:
                    </label>
                    <input type="number" min="1" id="bpcQtdPessoas" name="bpcQtdPessoas" required placeholder="Ex: 4" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;">
                </div>
                <div>
                    <label for="bpcDespesasMedicas" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">
                        Despesas com Medicamentos/Fraldas (R$):
                    </label>
                    <input type="number" step="0.01" id="bpcDespesasMedicas" name="bpcDespesasMedicas" placeholder="Ex: 350.00" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;">
                </div>
            </div>

            <button type="submit" class="btn btn-primary" style="padding:0.9rem 1.5rem; font-size:1.05rem; font-weight:700; width:100%; justify-content:center; margin-top:0.5rem;">
                Calcular Elegibilidade ao BPC
            </button>
        </form>

        <div id="bpcResultadoBox" style="display:none; margin-top:1.5rem; padding:1.5rem; border-radius:12px;" role="region" aria-live="polite">
            <!-- Preenchido via app.js -->
        </div>
    </div>

    <h2>Entenda como é feito o Cálculo</h2>
    <p>O critério legal objetivo estabelecido no Artigo 20 da Lei Orgânica da Assistência Social (LOAS) é ter uma <strong>renda mensal familiar per capita inferior a 1/4 (25%) do salário mínimo vigente</strong> (atualmente R$ 379,50).</p>
    <div class="legal-box">
        <h4>Deduções de Despesas com Saúde (Decreto 6.214/2007)</h4>
        <p>Você pode descontar da renda bruta os gastos contínuos com medicamentos, alimentação especial, fraldas descartáveis e tratamentos médicos essenciais que não sejam fornecidos gratuitamente pelo SUS no seu município.</p>
    </div>
  `
});

// 3. /ferramentas/calculadora-isencoes/
writePage('ferramentas/calculadora-isencoes/index.html', {
  title: 'Calculadora de Isenções Veiculares PcD: Calcule IPI, ICMS e IPVA | Já Te Contaram PcD?',
  description: 'Simule o desconto tributário total na compra de automóveis 0km por pessoas com deficiência ou condutores indicados.',
  url: '/ferramentas/calculadora-isencoes/',
  badge: 'Ferramenta 2 — Veículos & Isenções',
  h1: 'Calculadora de Isenções Tributárias Veiculares PcD',
  lead: 'Descubra quanto você pode economizar na compra do seu carro zero quilômetro com as isenções legais de IPI, ICMS e IPVA.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Ferramentas', url: '/ferramentas/' },
    { label: 'Calculadora de Isenções', url: '/ferramentas/calculadora-isencoes/' }
  ],
  subnav: subnavArea10,
  bodyHtml: `
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:2rem; box-shadow:0 10px 25px -5px rgba(0,0,0,0.08); margin-bottom:2rem;">
        <h2 style="font-size:1.4rem; color:#001B44; margin-top:0; margin-bottom:1rem;">Dados do Veículo Pretendido</h2>
        
        <form id="isencaoVeicularForm" style="display:grid; grid-template-columns:1fr; gap:1.25rem;">
            <div>
                <label for="isencaoValorVeiculo" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">
                    Preço de Tabela do Veículo 0km (R$):
                </label>
                <input type="number" step="100" id="isencaoValorVeiculo" name="isencaoValorVeiculo" required placeholder="Ex: 115000" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;" aria-describedby="precoHelp">
                <small id="precoHelp" style="color:#64748b; font-size:0.8rem; display:block; margin-top:0.25rem;">Preço público sugerido da montadora (sem os descontos PcD).</small>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">
                <div>
                    <label for="isencaoEstadoUf" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">
                        Estado de Emplacamento (UF):
                    </label>
                    <select id="isencaoEstadoUf" name="isencaoEstadoUf" required style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem; background:#fff;">
                        <option value="SP">São Paulo (SP)</option>
                        <option value="RJ" selected>Rio de Janeiro (RJ)</option>
                        <option value="MG">Minas Gerais (MG)</option>
                        <option value="ES">Espírito Santo (ES)</option>
                        <option value="PR">Paraná (PR)</option>
                        <option value="SC">Santa Catarina (SC)</option>
                        <option value="RS">Rio Grande do Sul (RS)</option>
                        <option value="DF">Distrito Federal (DF)</option>
                        <option value="BA">Bahia (BA)</option>
                        <option value="PE">Pernambuco (PE)</option>
                        <option value="CE">Ceará (CE)</option>
                        <option value="GO">Goiás (GO)</option>
                    </select>
                </div>

                <div>
                    <label for="isencaoCondutor" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">
                        Perfil do Beneficiário:
                    </label>
                    <select id="isencaoCondutor" name="isencaoCondutor" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem; background:#fff;">
                        <option value="condutor">PcD Condutora (CNH Especial)</option>
                        <option value="nao_condutor">PcD Não-Condutora (Representante Legal)</option>
                    </select>
                </div>
            </div>

            <button type="submit" class="btn btn-primary" style="padding:0.9rem 1.5rem; font-size:1.05rem; font-weight:700; width:100%; justify-content:center; margin-top:0.5rem;">
                Calcular Economia com Isenções
            </button>
        </form>

        <div id="isencaoResultadoBox" style="display:none; margin-top:1.5rem; padding:1.5rem; border-radius:12px;" role="region" aria-live="polite">
            <!-- Preenchido via app.js -->
        </div>
    </div>

    <h2>Teto Legal Atual de Isenções no Brasil</h2>
    <ul>
        <li><strong>IPI:</strong> Isenção total para veículos novos de valor até <strong>R$ 200.000,00</strong> (Lei Federal nº 14.287/2021);</li>
        <li><strong>ICMS:</strong> Teto de até <strong>R$ 120.000,00</strong>, com isenção total sobre a cota de R$ 70.000,00 e recolhimento proporcional sobre a diferença (Convênio CONFAZ 147/23);</li>
        <li><strong>IPVA:</strong> Isenção anual concedida pelos estados (geralmente condicionada a tetos estaduais como R$ 70.000 ou R$ 120.000).</li>
    </ul>
  `
});

// 4. /ferramentas/calculadora-cotas/
writePage('ferramentas/calculadora-cotas/index.html', {
  title: 'Calculadora da Lei de Cotas PcD (Lei 8.213/91): Calcule a Reserva Legal | Já Te Contaram PcD?',
  description: 'Descubra a cota legal obrigatória de contratação de profissionais com deficiência para a sua empresa com base no quadro de funcionários.',
  url: '/ferramentas/calculadora-cotas/',
  badge: 'Ferramenta 3 — Corporativo & RH',
  h1: 'Calculadora da Lei de Cotas Empresariais (Art. 93)',
  lead: 'Ferramenta oficial para departamentos de Recursos Humanos, DHO e compliance calcularem o enquadramento na Lei nº 8.213/1991.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Ferramentas', url: '/ferramentas/' },
    { label: 'Calculadora de Cotas', url: '/ferramentas/calculadora-cotas/' }
  ],
  subnav: subnavArea10,
  bodyHtml: `
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:2rem; box-shadow:0 10px 25px -5px rgba(0,0,0,0.08); margin-bottom:2rem;">
        <h2 style="font-size:1.4rem; color:#001B44; margin-top:0; margin-bottom:1rem;">Dimensionamento do Quadro de Colaboradores</h2>
        
        <form id="cotasCalculadoraForm" style="display:grid; grid-template-columns:1fr; gap:1.25rem;">
            <div>
                <label for="cotasTotalFuncionarios" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">
                    Total de Empregados em Todas as Unidades/Filiais:
                </label>
                <input type="number" min="1" id="cotasTotalFuncionarios" name="cotasTotalFuncionarios" required placeholder="Ex: 450" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;" aria-describedby="cotasHelp">
                <small id="cotasHelp" style="color:#64748b; font-size:0.8rem; display:block; margin-top:0.25rem;">Considere a totalidade dos empregados com contrato CLT ativo em todo o país.</small>
            </div>

            <button type="submit" class="btn btn-primary" style="padding:0.9rem 1.5rem; font-size:1.05rem; font-weight:700; width:100%; justify-content:center; margin-top:0.5rem;">
                Calcular Obrigatoriedade de Contratação
            </button>
        </form>

        <div id="cotasResultadoBox" style="display:none; margin-top:1.5rem; padding:1.5rem; border-radius:12px;" role="region" aria-live="polite">
            <!-- Preenchido via app.js -->
        </div>
    </div>

    <h2>Tabela Legal da Lei 8.213/1991 (Art. 93)</h2>
    <div style="overflow-x:auto; margin:1.5rem 0;">
        <table style="width:100%; border-collapse:collapse; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <thead>
                <tr style="background:#001B44; color:#fff; text-align:left;">
                    <th style="padding:12px 16px;">Número Total de Empregados</th>
                    <th style="padding:12px 16px;">Percentual Obrigatório</th>
                    <th style="padding:12px 16px;">Exemplo Prático</th>
                </tr>
            </thead>
            <tbody style="font-size:0.9rem; color:#334155;">
                <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:12px 16px;">Até 99 empregados</td>
                    <td style="padding:12px 16px; font-weight:600; color:#64748b;">Dispensa Legal (0%)</td>
                    <td style="padding:12px 16px;">Não obrigatório por lei</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;">
                    <td style="padding:12px 16px;">De 100 a 200 empregados</td>
                    <td style="padding:12px 16px; font-weight:700; color:#0284c7;">2% do quadro</td>
                    <td style="padding:12px 16px;">Para 150 empregados = 3 vagas PcD</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:12px 16px;">De 201 a 500 empregados</td>
                    <td style="padding:12px 16px; font-weight:700; color:#0284c7;">3% do quadro</td>
                    <td style="padding:12px 16px;">Para 300 empregados = 9 vagas PcD</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;">
                    <td style="padding:12px 16px;">De 501 a 1.000 empregados</td>
                    <td style="padding:12px 16px; font-weight:700; color:#0284c7;">4% do quadro</td>
                    <td style="padding:12px 16px;">Para 700 empregados = 28 vagas PcD</td>
                </tr>
                <tr>
                    <td style="padding:12px 16px;">Mais de 1.000 empregados</td>
                    <td style="padding:12px 16px; font-weight:700; color:#0284c7;">5% do quadro</td>
                    <td style="padding:12px 16px;">Para 1.500 empregados = 75 vagas PcD</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="legal-box">
        <h4>Multas por Descumprimento da Cota PcD</h4>
        <p>A fiscalização do Ministério do Trabalho e Emprego aplica penalidades severas calculadas por dia e por vaga não preenchida, variando de R$ 3.100,00 a mais de R$ 310.000,00 por empresa autuada, além de abertura de Ação Civil Pública pelo Ministério Público do Trabalho (MPT).</p>
    </div>
  `
});

// 5. /ferramentas/gerador-requerimentos/
writePage('ferramentas/gerador-requerimentos/index.html', {
  title: 'Gerador Gratuito de Requerimentos e Petições PcD | Já Te Contaram PcD?',
  description: 'Gere documentos formais com fundamentação na Lei Brasileira de Inclusão para solicitar professor de apoio, rampas de acesso e prioridade.',
  url: '/ferramentas/gerador-requerimentos/',
  badge: 'Ferramenta 4 — Cidadania & Documentos',
  h1: 'Gerador Oficial de Requerimentos e Petições PcD',
  lead: 'Crie um documento pronto para protocolar na escola, condomínio, empresa ou repartição pública, baseado na Lei nº 13.146/2015.',
  breadcrumbs: [
    { label: 'Início', url: '/' },
    { label: 'Ferramentas', url: '/ferramentas/' },
    { label: 'Gerador de Requerimentos', url: '/ferramentas/gerador-requerimentos/' }
  ],
  subnav: subnavArea10,
  bodyHtml: `
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:2rem; box-shadow:0 10px 25px -5px rgba(0,0,0,0.08); margin-bottom:2rem;">
        <h2 style="font-size:1.4rem; color:#001B44; margin-top:0; margin-bottom:1rem;">Preencha os Dados do Requerimento</h2>
        
        <form id="peticaoGeradorForm" style="display:grid; grid-template-columns:1fr; gap:1.25rem;">
            <div>
                <label for="peticaoTipo" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">
                    Tipo de Demanda / Direito Reclamado:
                </label>
                <select id="peticaoTipo" name="peticaoTipo" required style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem; background:#fff;">
                    <option value="apoio_escolar" selected>Solicitação de Profissional de Apoio Escolar / Mediador (AEE)</option>
                    <option value="acessibilidade_predial">Adequação de Acessibilidade Predial / Rampa / Elevador</option>
                    <option value="atendimento_prioritario">Cumprimento de Atendimento Prioritário em Repartição/Banco</option>
                    <option value="vaga_estacionamento">Reserva e Fiscalização de Vaga de Estacionamento PcD</option>
                </select>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">
                <div>
                    <label for="peticaoNome" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">
                        Nome Completo do Solicitante / Responsável:
                    </label>
                    <input type="text" id="peticaoNome" name="peticaoNome" required placeholder="Ex: Maria da Silva Santos" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;">
                </div>
                <div>
                    <label for="peticaoCpf" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">
                        CPF do Solicitante:
                    </label>
                    <input type="text" id="peticaoCpf" name="peticaoCpf" required placeholder="000.000.000-00" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;">
                </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">
                <div>
                    <label for="peticaoCidade" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">
                        Cidade / UF:
                    </label>
                    <input type="text" id="peticaoCidade" name="peticaoCidade" required placeholder="Ex: Rio de Janeiro - RJ" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;">
                </div>
                <div>
                    <label for="peticaoDestinatario" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">
                        Órgão, Escola ou Empresa Destinatária:
                    </label>
                    <input type="text" id="peticaoDestinatario" name="peticaoDestinatario" required placeholder="Ex: Colégio Estadual Dom Pedro II" style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;">
                </div>
            </div>

            <div>
                <label for="peticaoDetalhes" style="display:block; font-weight:600; font-size:0.9rem; margin-bottom:0.35rem; color:#1e293b;">
                    Detalhes do Caso (Opcional):
                </label>
                <textarea id="peticaoDetalhes" name="peticaoDetalhes" rows="3" placeholder="Ex: O aluno possui diagnóstico de autismo (CID 11: 6A02) e necessita de acompanhamento para mediação pedagógica..." style="width:100%; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem;"></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="padding:0.9rem 1.5rem; font-size:1.05rem; font-weight:700; width:100%; justify-content:center; margin-top:0.5rem;">
                Gerar Petição Formal Pronta para Imprimir
            </button>
        </form>

        <div id="peticaoResultadoBox" style="display:none; margin-top:1.5rem; padding:1.5rem; border-radius:12px;" role="region" aria-live="polite">
            <!-- Preenchido via app.js -->
        </div>
    </div>

    <h2>Como Utilizar o Requerimento</h2>
    <div class="step-guide-box">
        <ol>
            <li><strong>Imprima em 2 vias:</strong> Uma via para entregar ao destinatário e a outra para receber o carimbo de protocolo;</li>
            <li><strong>Anexe Cópia do Laudo Médico:</strong> Não entregue o laudo original, apenas uma cópia nítida;</li>
            <li><strong>Exija o Protocolo:</strong> O responsável que receber o documento deve assinar, carimbar ou anotar data e hora na sua via (comprovante de entrega);</li>
            <li><strong>Prazo de Resposta:</strong> Em órgãos públicos, o prazo padrão de resposta em processos administrativos é de até 30 dias (Lei nº 9.784/1999).</li>
        </ol>
    </div>
  `
});

console.log('✅ Áreas 9 e 10 concluídas com sucesso!');
