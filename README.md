# Já te contaram PcD? — Novo Website Institucional (v2.0)

Website institucional e corporativo de alto padrão desenvolvido para a consultoria **Já te contaram PcD?**, fundada por **Moisés Souza**. 

O projeto preserva **todo o conteúdo e essência do site original** (https://jtpcd.vercel.app/), elevando o design, a autoridade B2B, a segurança jurídica em relação à Lei de Cotas (Art. 93 da Lei 8.213/91) e implementando conformidade rigorosa com diretrizes internacionais de acessibilidade digital (**WCAG 2.1 níveis AA e AAA**).

---

## 🌟 Principais Inovações e Melhorias Implementadas

1. **Design System & Estética Corporativa B2B:**
   - Paleta de cores sofisticada com azul marinho profundo (`#060D1A`, `#0B192C`), acentos de confiança em ciano e botões de alta conversão em âmbar/dourado com contraste testado (WCAG AAA).
   - Tipografia premium moderna: **Sora** para títulos e **Inter** para textos e interface.
   - Glassmorphism, iluminação ambiente, microinterações e cards elevados.

2. **Simulador Interativo da Lei de Cotas (Art. 93 Lei 8.213/91):**
   - Ferramenta interativa de conversão para gestores de RH e diretores corporativos.
   - O usuário seleciona ou digita a quantidade de colaboradores (de 10 a 5.000+) e o sistema calcula instantaneamente:
     - Percentual de cota legal (2%, 3%, 4% ou 5%);
     - Quantidade exata de vagas PcD obrigatórias por lei;
     - Enquadramento jurídico e classificação de risco do MTE;
     - Botão contextual com preenchimento automático do formulário de contato.

3. **Suíte Completa de Acessibilidade Digital (WCAG 2.1 AA / AAA):**
   - **Ajuste de Escala de Fonte:** Modos A−, Padrão, A+ e A++ com redimensionamento fluido sem quebrar o layout;
   - **Modo Alto Contraste Nativo:** Tema preto e amarelo de alta definição para pessoas com baixa visão ou fotofobia;
   - **Fonte Adaptada para Dislexia:** Ajuste de espaçamento entre letras e altura de linha para leitura facilitada;
   - **Régua / Guia de Leitura Interativa:** Linha visual que acompanha o mouse na tela para focar a leitura;
   - **Leitor de Texto por Áudio (Voz):** Síntese nativa em português (Web Speech API) para ler o conteúdo da página;
   - **Pausar Animações:** Suporte completo para usuários com sensibilidade vestibular (`prefers-reduced-motion`);
   - **Integração com VLibras:** Widget oficial do governo brasileiro para tradução em Língua Brasileira de Sinais.

4. **Galeria de Palestras com Modal Lightbox Acessível:**
   - Registros fotográficos reais de eventos com Moisés Souza (incluindo palestras corporativas e na OAB-RJ);
   - Visualização ampliada em modal com proporções preservadas, foco acessível e fechamento por tecla Escape ou clique fora.

5. **Formulário Comercial de Conversão Duplo:**
   - Envio rápido estruturado com mensagem pronta para o **WhatsApp oficial ((21) 98414-5167)**;
   - Opção de solicitação formal de proposta por e-mail com protocolo automático e salvamento de leads.

6. **FAQ Interativo com Filtro de Busca em Tempo Real:**
   - Barra de pesquisa instantânea que filtra perguntas e respostas dinamicamente conforme o usuário digita.

7. **Arquitetura 100% Otimizada para SEO e Performance:**
   - Meta tags OpenGraph e Twitter Cards;
   - Dados estruturados Schema.org (`Organization`, `Service`, `FAQPage`);
   - Carregamento rápido sem dependências externas pesadas (CSS e JavaScript puros e modulares).

---

## 📁 Estrutura de Arquivos

```
JTPCD/
├── assets/
│   └── images/
│       ├── favicon.png
│       ├── logo.png
│       ├── selo.png
│       ├── linkedin-capa.png
│       └── palestras/
│           ├── palestra-1.jpg
│           ├── palestra-2.jpg
│           ├── palestra-3.jpg
│           └── palestra-4.jpg
├── index.html            # Estrutura semântica HTML5 completa
├── styles.css            # Folha de estilos master (Design System, Tokens, A11y, Responsividade)
├── script.js             # Lógica interativa (Simulador, Acessibilidade, FAQ, Modais, Validações)
├── server.js             # Servidor local Node.js para visualização instantânea
├── package.json          # Metadados e scripts de execução
└── _backup_original/     # Cópia dos arquivos originais para consulta histórica
```

---

## 🚀 Como Executar Localmente

### Opção 1: Via Node.js (Recomendado)
No terminal, dentro da pasta do projeto:
```bash
npm start
```
Ou:
```bash
node server.js
```
Abra o navegador em: [http://localhost:4123](http://localhost:4123)

### Opção 2: Abrir Diretamente no Navegador
Você também pode simplesmente dar um duplo clique no arquivo [index.html](file:///c:/Users/usuario/Downloads/ANTIGRAVITY/JTPCD/index.html) para abri-lo em qualquer navegador moderno.

---

## 🌐 Publicação / Deploy (Vercel, Netlify, GitHub Pages)
O projeto é 100% estático e compatível com qualquer plataforma:
- **Vercel:** Basta conectar o repositório ou rodar `vercel` na pasta;
- **Netlify:** Arraste a pasta ou conecte seu GitHub;
- **GitHub Pages:** Ative a publicação da branch `main` na raiz.
