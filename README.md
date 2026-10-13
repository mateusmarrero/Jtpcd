# Já te contaram PcD? — site institucional

Landing page (one-page) para a **Já te contaram PcD?**, consultoria de inclusão e
acessibilidade para empresas, fundada por **Moisés Souza** (Rio de Janeiro, 2022).

O foco da comunicação é o **público corporativo (B2B)**: diagnóstico de
acessibilidade, consultoria de inclusão, treinamentos, palestras, recrutamento de
profissionais PcD e programas de mentoria — com uma seção secundária para **PcD**
(vagas, cursos, direitos e canais).

## Estrutura

```
jate-contaram-pcd/
├── index.html              # Página única (one-page)
├── styles.css              # Todos os estilos (paleta azul + alto contraste)
├── script.js               # Interações (menu, scroll, formulário, acessibilidade)
├── server.js               # Servidor estático para desenvolvimento local
├── 404.html                # Página 404 (a Vercel publica automaticamente)
├── vercel.json             # Config de publicação (cache + cabeçalhos de segurança)
├── .vercelignore           # Arquivos que não sobem para produção
├── manifest.webmanifest    # PWA básico
├── robots.txt
├── sitemap.xml
├── README.md
└── assets/images/
    ├── favicon.png         # Ícone do site (gerado do emblema oficial)
    ├── selo.png            # Emblema oficial (fundo transparente)
    ├── logo.png            # Logotipo completo: emblema + "Já te contaram PcD?"
    ├── og-image.png        # Imagem de compartilhamento 1200×630 (Open Graph)
    ├── linkedin-capa.png   # Capa oficial do LinkedIn (faixa de marca)
    ├── palestras/          # Fotos reais de palestras (galeria da seção de palestras)
    │   ├── palestra-1.jpg
    │   ├── palestra-2.jpg
    │   ├── palestra-3.jpg
    │   └── palestra-4.jpg
    └── logo-original.png   # Print original enviado pela equipe (arquivo-fonte)
```

## Seções da página

1. **Hero** — proposta de valor para empresas, CTAs e credenciais (com o logotipo oficial).
2. **Faixa de confiança** — fornecedor Petrobras, atendimento nacional etc.
3. **Faixa de marca** — capa oficial do LinkedIn, logo abaixo da faixa de confiança.
4. **Quem somos** — história de Moisés Souza e credenciais.
5. **O desafio** — o custo de tratar inclusão como obrigação.
6. **Nossos 4 pilares** — conformidade legal/LBI, capacitação de lideranças, engajamento
   e eventos, acolhimento a famílias atípicas (Programa Respira). Cada card traz
   *Objetivo* e *Atuação*, e a faixa final destaca os diferenciais (consultores com
   deficiência, intérprete de Libras, presencial/online, Programa Respira).
7. **Serviços** — 6 frentes (diagnóstico, consultoria, treinamentos, palestras,
   recrutamento, mentoria).
8. **Palestras (presenciais e online)** — 4 formatos (inspiradoras, inclusão em
   movimento, acesso para todos, interação e engajamento), galeria com fotos reais
   (`assets/images/palestras/`) e CTA "Quero uma palestra" no WhatsApp.
9. **Método** — 5 etapas, do diagnóstico aos relatórios.
10. **Resultados** — números de impacto (inclui 788 mil impressões no LinkedIn em
    maio/2026, conforme print oficial da equipe).
11. **Para PcD** — vagas, cursos, direitos, canais (Instagram, Threads, YouTube,
    LinkedIn, Facebook) e um bloco "O que você encontra no Instagram" com CTA de seguir.
12. **Dúvidas** — perguntas frequentes (acordeão), incluindo o Programa Respira.
13. **Contato** — formulário que envia pelo WhatsApp + canais diretos.

> O menu superior colapsa em botão (hambúrguer) abaixo de 1100px de largura — o
> breakpoint foi ajustado porque a barra passou a ter 7 links + botão de CTA.

## Como rodar localmente

Abra `index.html` direto no navegador ou sirva a pasta:

```bash
# com Node
node server.js        # http://localhost:8080

# ou com Python
python -m http.server 8000
```

## Como personalizar

### 1. WhatsApp
Número usado em todos os botões: **5521984145167** (`(21) 98414-5167`).
Procure por `5521984145167` em `index.html` e por `CONFIG.whatsapp` em `script.js`.

### 2. E-mail
O site **não exibe e-mail** (opção escolhida na publicação). Todo contato passa pelo
WhatsApp e pelas redes sociais. Se quiser voltar a exibir, o ícone `#i-mail` continua
disponível no sprite de `index.html` — basta recriar um `<a class="contact-link">`
dentro de `.contact-links`.

### 3. Números de impacto
Os valores exibidos em `#resultados` foram estimados a partir de dados **públicos**
(Instagram e LinkedIn) e devem ser revisados pela equipe:

- `+7.000` — PcD impactadas por conteúdo, vagas e capacitações.
- `788 mil` — impressões no LinkedIn em maio/2026 (conforme print oficial da equipe;
  substiutiu o antigo "400 mil visualizações/mês no portal").
- `10 mil` — seguidores somados (Instagram ~1,4 mil + LinkedIn ~8,4 mil).
- `2022` — ano de fundação.

Os mesmos números aparecem como prova social nos canais da seção `#pcd`
(Instagram `1,4 mil`, LinkedIn `8,4 mil`).

### 4. Link de vagas e cursos
No bloco `#pcd`, o botão "Ver vagas e cursos no Instagram" aponta para o perfil
`https://www.instagram.com/jatecontarampcd` (o portal antigo está fora do ar).
Se um dia existir um portal de vagas próprio, troque o `href` desse botão.

### 5. Logo oficial
O logotipo foi extraído do print enviado pela equipe (`assets/images/logo-original.png`)
e tratado (fundo branco removido + recorte):

- `assets/images/logo.png` — logotipo completo (emblema + wordmark). Usado no **hero**
  e no JSON-LD.
- `assets/images/selo.png` — só o emblema circular. Usado no **menu** e no **favicon**.
- `assets/images/favicon.png` — ícone do site (emblema em 180×180).
- `assets/images/og-image.png` — card 1200×630 para compartilhamento (Open Graph).

> Ideal: pedir à equipe o **arquivo vetorial (SVG/AI/EPS)** do logotipo. Com ele,
> basta substituir `logo.png`, `selo.png`, `favicon.png` e `og-image.png` mantendo
> os mesmos nomes — sem mexer no HTML/CSS.

### 6. Faixa de marca
A seção `.brand-band` (logo após a faixa de confiança) exibe
`assets/images/linkedin-capa.png`, a capa oficial do LinkedIn, em fundo branco.
Troque o arquivo para atualizar essa faixa.

### 7. Fotos (opcional)
Não há banco de imagens ainda. Se quiser uma galeria de palestras/eventos, crie
`assets/images/eventos/` e adicione os arquivos (o ideal é `.webp`).

### 8. Redes sociais
Links em `#pcd`, no bloco `.topics` e no rodapé de contato. Confirme os endereços:
Instagram `@jatecontarampcd`, Threads `@jatecontarampcd`,
YouTube `@jatecontarampcd`, LinkedIn `/company/jatecontarampcd`,
Facebook `grupos/jtcpcd`.

O bloco `.topics` (dentro de `#pcd`) usa os **destaques do Instagram** como
inspiração para os temas exibidos (Vagas, Cursos, Direitos, Atletas, Papo de
inclusão, #PraTodosLerem). Edite os `<li>` de `.topic-chips` para mudar os temas.
> Não há embed do feed do Instagram (a API exige token); o bloco é um convite
> para seguir o perfil e um resumo do que a comunidade encontra por lá.

## Publicação (Vercel)

> **Publicado em:** <https://jtpcd.vercel.app>
> (projeto `jtpcd`, escopo `mateus-s-projects-82d97a54`).
> Para atualizar o site depois de qualquer edição, rode `npx vercel --prod` dentro desta pasta.

O site é 100% estático (HTML/CSS/JS, sem build). O `vercel.json` já define cache das
imagens e cabeçalhos de segurança.

> **Importante:** o `vercel.json` tem `"framework": null`. Sem essa linha a Vercel
> detecta o `server.js` (servidor de desenvolvimento) como um app Node e o build
> falha com *"No entrypoint found"*. Não remova essa linha.

### Opção A — arrastar a pasta (mais simples)
1. Crie uma conta em <https://vercel.com> (pode entrar com Google/GitHub).
2. Acesse <https://vercel.com/new> e **arraste a pasta `jate-contaram-pcd` inteira**.
3. Confirme o deploy. A Vercel gera uma URL tipo `https://jtpcd.vercel.app`.
4. Abra a URL, teste no celular e depois configure o domínio próprio (abaixo).

### Opção B — por linha de comando
```bash
cd "C:\SItes OC\jate-contaram-pcd"
npx vercel          # primeiro deploy (preview)
npx vercel --prod   # publicar em produção
```

### Domínio próprio (opcional — `jatecontarampcd.com.br`)
O site está publicado em `https://jtpcd.vercel.app` e todas as referências
(canonical, Open Graph, `robots.txt`, `sitemap.xml`, JSON-LD) já apontam para essa
URL, então o **preview de compartilhamento** (WhatsApp/LinkedIn) já funciona.

Se depois quiser um domínio próprio (`jatecontarampcd.com.br`):
1. No painel do projeto: **Settings → Domains → Add**.
2. Adicione `jatecontarampcd.com.br` e `www.jatecontarampcd.com.br`.
3. A Vercel mostra os registros DNS para criar **no seu registrador** (ex.: Registro.br):
   - domínio principal → registro **A** (a Vercel informa o IP atual — use o que ela mostrar).
   - `www` → registro **CNAME** `cname.vercel-dns.com`.
4. Marque o domínio **principal (apex)** como *Primary* para o `www` redirecionar para ele.
5. Aguarde a propagação (minutos a algumas horas) e confirme em **Domains**.

> Depois de migrar para o domínio próprio, refaça a troca de URL em `index.html`,
> `robots.txt`, `sitemap.xml` e JSON-LD (buscar por `jtpcd.vercel.app`).

### Checklist antes de divulgar
- [ ] Número do WhatsApp correto em todos os botões.
- [ ] Domínio ativo com HTTPS e `www` redirecionando.
- [ ] Colar o link no WhatsApp e conferir a imagem de compartilhamento.
- [ ] Rodar o Lighthouse (F12 → Lighthouse) em performance/acessibilidade/SEO.
- [ ] Revisar textos, números de impacto e FAQ (inclusive os 4 pilares e as palestras).
- [ ] (Opcional) enviar o `sitemap.xml` no Google Search Console.

## Acessibilidade

Como o tema do projeto é inclusão, o site foi construído com cuidado extra:

- **Skip link**, foco visível e navegação por teclado.
- **Widget de acessibilidade** (canto inferior esquerdo): aumentar/diminuir texto,
  **alto contraste** e restaurar padrão. As preferências ficam salvas no navegador.
- Contraste de texto dentro do alvo **WCAG AA** no tema padrão.
- `prefers-reduced-motion` respeitado (animações desligadas).
- Imagens/ícones decorativos com `aria-hidden`; logotipo com texto alternativo.
- Acordeão de FAQ usando `<details>/<summary>` nativo.

## SEO

- `title`, `description`, canonical e Open Graph/Twitter (`assets/images/og-image.png`).
- Dados estruturados JSON-LD: `Organization`, `Service` (com dois catálogos de ofertas:
  serviços e pilares de atuação) e `FAQPage`.
- `manifest.webmanifest`, `robots.txt` e `sitemap.xml`.

> A URL base usada no canonical/Open Graph/JSON-LD é `https://jtpcd.vercel.app/`.

## Observações

- Textos de história, números e perguntas do FAQ foram baseados em informações
  **públicas** (LinkedIn, Instagram e site da marca) e devem ser revisados pela
  equipe antes de publicar.
- As fotos da galeria de palestras (`palestras/palestra-1..4.jpg`) mostram pessoas
  em eventos. Confirme a **autorização de uso de imagem** (LGPD) antes de divulgar,
  e troque/reordene os arquivos sem mudar o HTML, se precisar.
- O rodapé traz o crédito "Desenvolvido por Mateus Marrero" (mantido a pedido).
- O e-mail de exemplo foi **removido** do site; o contato é feito por WhatsApp e redes.
