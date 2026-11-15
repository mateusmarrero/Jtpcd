# Já Te Contaram PcD? — Portal Nacional de Direitos, Utilidade Pública e Inclusão (v3.0)

O **JÁ TE CONTARAM PCD?** é a plataforma digital brasileira de referência nacional em informação, orientação jurídica simplificada, ferramentas gratuitas e utilidade pública para pessoas com deficiência (PcD), seus familiares e cuidadores em todo o Brasil.

Fundado pelo consultor de inclusão, palestrante e pai atípico **Moisés Souza** (fornecedor homologado Petrobras), o portal combina um ecossistema de utilidade pública com soluções corporativas e treinamentos empresariais.

---

## 🌟 Pilares do Portal Nacional

### 1. 13 Eixos Estratégicos de Cidadania
1. **Direitos da Pessoa com Deficiência:** Lei Brasileira de Inclusão (LBI - Lei 13.146/15) e Convenção da ONU.
2. **Benefícios Sociais:** BPC/LOAS (1 salário mínimo), Auxílio-Inclusão e CadÚnico.
3. **Saúde e Qualidade de Vida:** Centros Especializados em Reabilitação (CER IV) e medicamentos de alto custo pelo SUS.
4. **Educação Inclusiva:** Profissional de Apoio Escolar / AEE sem taxa extra e adaptações pedagógicas.
5. **Emprego e Carreira:** Mural de vagas afirmativas e cumprimento da Lei de Cotas (Lei 8.213/91).
6. **Tecnologia Assistiva:** Próteses, cadeiras de rodas motorizadas e saque do FGTS para aquisição.
7. **Mobilidade e Acessibilidade:** Passe Livre Interestadual e Cartão de Estacionamento DeFis.
8. **Isenções Tributárias:** IPI (teto R$ 200 mil), ICMS (teto R$ 120 mil), IPVA e isenção de IRPF.
9. **Documentação e Laudos:** Laudo biopsicossocial multiprofissional, CIPTEA para autistas e validade de laudos.
10. **Serviços Públicos:** CRAS, CREAS, Defensoria Pública da União (DPU) e canais do Disque 100.
11. **Família e Cuidadores:** Rede de apoio a mães atípicas, redução de jornada para servidores com dependente PcD.
12. **Notícias e Jurisprudência:** Decisões consolidadas do STF, STJ e atualizações legislativas.
13. **Guias e Tutoriais:** Manuais passo a passo para requisições no Meu INSS e recursos administrativos.

### 2. Ferramentas & Calculadoras Inteligentes Gratuitas
- **Simulador do BPC/LOAS:** Avalia renda familiar bruta per capita (critério estrito de 1/4 do SM e jurisprudência de 1/2 do SM com dedução de remédios e fraldas não fornecidos pelo SUS).
- **Calculadora de Isenções Veiculares:** Calcula economia detalhada de IPI, ICMS e IPVA na compra de veículos novos conforme o estado.
- **Calculadora da Lei de Cotas (Art. 93 Lei 8.213/91):** Determina vagas compulsórias (2% a 5%) e riscos fiscais de autuação.
- **Gerador de Petições e Requerimentos:** Gera minutas formais prontas para impressão e cópia (Apoio Escolar, Adaptação no Trabalho e Recursos ao INSS).

### 3. Diretório Nacional de Centros de Reabilitação & Apoio
- Catálogo geolocalizado com filtros por Estado (UF): Rede Lucy Montoro, AACD, Instituto Benjamin Constant (IBC), INES, Federação das APAEs, CER IV, etc.

### 4. Suíte de Acessibilidade Digital WCAG 2.2 Níveis AA / AAA
- **Navegação por Teclado e Foco Visível:** Atalhos de salto (`[Alt + 1]` a `[Alt + 4]`) e indicadores de foco em conformidade total.
- **Modo Alto Contraste Real:** Fundo escuro com realces em amarelo vivo e branco para baixa visão e fotofobia.
- **Tipografia Adaptada para Dislexia:** Espaçamento e peso de linhas otimizados para fluidez na leitura.
- **Régua Visual de Leitura:** Guia horizontal que acompanha o cursor na tela para auxiliar pessoas com TDAH e dislexia.
- **Leitor por Voz Nativo (Web Speech API):** Síntese vocal nativa em português sem dependências externas.
- **Ajuste Escalonável de Fonte:** Controles de A-, A (Padrão) e A+ com persistência em `localStorage`.

### 5. Painel Administrativo Completo & Seguro
- 13 módulos operacionais: Dashboard, Gestão de Leads, Vagas PcD, Blog/Notícias, Palestras, FAQ, Depoimentos, Barra de Alerta, Media Kit, Gestão de Usuários (RBAC com Admin e Moderador), Auditoria de Logs, Exportação CSV e Backup em JSON.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5 Semântico, CSS3 Moderno (Custom Properties, Grid, Flexbox), Vanilla JavaScript (sem frameworks pesados).
- **Backend / API:** Node.js (compatível com Vercel Serverless Functions).
- **Banco de Dados:** StackCP MySQL Remoto (`mysql2` com connection pooling e prepared statements).
- **Segurança:** OWASP Top 10, sanitização de entradas, headers de segurança (`nosniff`, `SAMEORIGIN`, CSP, HSTS).

---

## 🚀 Execução Local

```bash
# Instalar dependências
npm install

# Iniciar servidor local
node server.js
```
Acesse:
- **Portal Principal:** `http://localhost:4123/`
- **Painel Administrativo:** `http://localhost:4123/admin` (Credenciais: `admin` / `admin123`)

---

## 🌐 Deploy em Produção

O projeto é implantado continuamente na Vercel conectado ao banco StackCP MySQL:
- **URL Oficial:** https://jtpcd.vercel.app/
- **Painel Administrativo em Produção:** https://jtpcd.vercel.app/admin
