/* ==========================================================================
   PORTAL NACIONAL JÁ TE CONTARAM PCD — SCRIPTS PRINCIPAIS
   Arquitetura de Utilidade Pública, Inclusão, Ferramentas & WCAG 2.2 AA
   ========================================================================== */

(function () {
  'use strict';

  const CONFIG = {
    whatsappNumber: '5521984145167',
    portalName: 'Já Te Contaram PcD?',
    apiBase: '/api'
  };

  // Cache de dados do portal
  const CACHE = {
    direitos: [],
    instituicoes: [],
    documentos: [],
    vagas: [],
    faqs: []
  };

  document.addEventListener('DOMContentLoaded', () => {
    initAccessibilitySuite();
    initTheme();
    initScrollEffects();
    initMobileNav();
    initPortalSearch();
    initPortalTools();
    initModals();
    loadPortalData();
    initCorporateContact();
    initCurrentYear();
    trackPageView();
  });

  /* ==========================================================================
     1. SUÍTE COMPLETA DE ACESSIBILIDADE (WCAG 2.2 AA / AAA)
     ========================================================================== */
  function initAccessibilitySuite() {
    const root = document.documentElement;
    const readingRuler = document.getElementById('readingGuideLine');
    const ttsBar = document.getElementById('ttsFloatingBar');
    const ttsText = document.getElementById('ttsStatusText');
    const ttsStopBtn = document.getElementById('ttsStopBtn');

    // Recupera preferências salvas
    const savedContrast = localStorage.getItem('jtpcd_a11y_contrast') === 'true';
    const savedDyslexia = localStorage.getItem('jtpcd_a11y_dyslexia') === 'true';
    const savedFontScale = parseFloat(localStorage.getItem('jtpcd_a11y_font_scale') || '1');

    if (savedContrast) root.classList.add('a11y-high-contrast');
    if (savedDyslexia) root.classList.add('a11y-dyslexia');
    if (savedFontScale !== 1) applyFontScale(savedFontScale);

    // 1.1 Controle de Tamanho de Fonte (A- / A / A+)
    const btnFontPlus = document.getElementById('a11yFontPlus');
    const btnFontMinus = document.getElementById('a11yFontMinus');
    const btnFontReset = document.getElementById('a11yFontReset');

    function applyFontScale(scale) {
      const clamped = Math.min(1.5, Math.max(0.85, scale));
      root.style.setProperty('--font-scale', clamped);
      localStorage.setItem('jtpcd_a11y_font_scale', clamped.toString());
      announceA11y(`Tamanho da fonte ajustado para ${Math.round(clamped * 100)}%`);
    }

    if (btnFontPlus) {
      btnFontPlus.addEventListener('click', () => {
        const current = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale') || '1');
        applyFontScale(current + 0.1);
      });
    }

    if (btnFontMinus) {
      btnFontMinus.addEventListener('click', () => {
        const current = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale') || '1');
        applyFontScale(current - 0.1);
      });
    }

    if (btnFontReset) {
      btnFontReset.addEventListener('click', () => {
        applyFontScale(1);
      });
    }

    // 1.2 Alternador de Alto Contraste Real
    const btnContrast = document.getElementById('a11yContrastBtn');
    if (btnContrast) {
      btnContrast.addEventListener('click', () => {
        const isContrast = root.classList.toggle('a11y-high-contrast');
        localStorage.setItem('jtpcd_a11y_contrast', isContrast ? 'true' : 'false');
        btnContrast.classList.toggle('active', isContrast);
        btnContrast.setAttribute('aria-pressed', isContrast ? 'true' : 'false');
        announceA11y(isContrast ? 'Modo de alto contraste ativado' : 'Modo de alto contraste desativado');
      });
    }

    // 1.3 Alternador de Fonte para Dislexia
    const btnDyslexia = document.getElementById('a11yDyslexiaBtn');
    if (btnDyslexia) {
      btnDyslexia.addEventListener('click', () => {
        const isDyslexia = root.classList.toggle('a11y-dyslexia');
        localStorage.setItem('jtpcd_a11y_dyslexia', isDyslexia ? 'true' : 'false');
        btnDyslexia.classList.toggle('active', isDyslexia);
        btnDyslexia.setAttribute('aria-pressed', isDyslexia ? 'true' : 'false');
        announceA11y(isDyslexia ? 'Modo de leitura para dislexia ativado' : 'Modo para dislexia desativado');
      });
    }

    // 1.4 Régua Visual de Leitura
    const btnRuler = document.getElementById('a11yRulerBtn');
    if (btnRuler && readingRuler) {
      let isRulerActive = false;
      const onMouseMove = (e) => {
        if (isRulerActive) readingRuler.style.top = `${e.clientY - 18}px`;
      };

      btnRuler.addEventListener('click', () => {
        isRulerActive = !isRulerActive;
        readingRuler.classList.toggle('is-active', isRulerActive);
        btnRuler.classList.toggle('active', isRulerActive);
        btnRuler.setAttribute('aria-pressed', isRulerActive ? 'true' : 'false');

        if (isRulerActive) {
          window.addEventListener('mousemove', onMouseMove, { passive: true });
          announceA11y('Régua de leitura ativada. Movimente o cursor para guiar o texto.');
        } else {
          window.removeEventListener('mousemove', onMouseMove);
          announceA11y('Régua de leitura desativada.');
        }
      });
    }

    // 1.5 Leitor por Voz Nativo (Web Speech API)
    const btnSpeech = document.getElementById('a11ySpeechBtn');
    if (btnSpeech && 'speechSynthesis' in window) {
      let isSpeaking = false;

      function stopSpeech() {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        btnSpeech.classList.remove('active');
        btnSpeech.setAttribute('aria-pressed', 'false');
        if (ttsBar) ttsBar.classList.remove('is-active');
      }

      function readText(text, label) {
        window.speechSynthesis.cancel();
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0;

        utterance.onstart = () => {
          isSpeaking = true;
          btnSpeech.classList.add('active');
          btnSpeech.setAttribute('aria-pressed', 'true');
          if (ttsBar) {
            ttsBar.classList.add('is-active');
            if (ttsText) ttsText.textContent = label || 'Lendo conteúdo da página...';
          }
        };

        utterance.onend = stopSpeech;
        utterance.onerror = stopSpeech;

        window.speechSynthesis.speak(utterance);
      }

      btnSpeech.addEventListener('click', () => {
        if (isSpeaking) {
          stopSpeech();
          announceA11y('Leitura por voz interrompida.');
        } else {
          // Lê seleção ou texto da página
          const selection = window.getSelection().toString().trim();
          if (selection) {
            readText(selection, 'Lendo trecho selecionado');
          } else {
            const mainContent = document.querySelector('main')?.innerText || document.body.innerText;
            const snippet = mainContent.substring(0, 1500); // Primeiras seções
            readText(snippet, 'Lendo Portal Já Te Contaram PcD');
          }
        }
      });

      if (ttsStopBtn) {
        ttsStopBtn.addEventListener('click', stopSpeech);
      }
    }

    // 1.6 Painel Flutuante de Acessibilidade (Toggle)
    const togglePanelBtn = document.getElementById('a11yToggleBtn');
    const a11yPanel = document.getElementById('a11yPanel');
    const a11yCloseBtn = document.getElementById('a11yPanelClose');

    if (togglePanelBtn && a11yPanel) {
      togglePanelBtn.addEventListener('click', () => {
        const isOpen = a11yPanel.classList.toggle('is-open');
        togglePanelBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      if (a11yCloseBtn) {
        a11yCloseBtn.addEventListener('click', () => {
          a11yPanel.classList.remove('is-open');
          togglePanelBtn.setAttribute('aria-expanded', 'false');
          togglePanelBtn.focus();
        });
      }
    }
  }

  // Anúncio acessível para leitores de tela
  function announceA11y(message) {
    let announcer = document.getElementById('a11yAnnouncer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'a11yAnnouncer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
      document.body.appendChild(announcer);
    }
    announcer.textContent = message;
  }

  /* ==========================================================================
     2. TEMA CLARO / ESCURO
     ========================================================================== */
  function initTheme() {
    const themeBtn = document.getElementById('themeToggleBtn');
    const root = document.documentElement;

    const setTheme = (isDark) => {
      root.classList.toggle('dark', isDark);
      localStorage.setItem('jtpcd_theme', isDark ? 'dark' : 'light');
      if (themeBtn) {
        themeBtn.setAttribute('title', isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro');
        themeBtn.setAttribute('aria-label', isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro');
      }
    };

    const savedTheme = localStorage.getItem('jtpcd_theme');
    if (savedTheme === 'dark') setTheme(true);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        setTheme(!root.classList.contains('dark'));
      });
    }
  }

  /* ==========================================================================
     3. EFEITOS DE ROLAGEM E NAVEGAÇÃO
     ========================================================================== */
  function initScrollEffects() {
    const progressBar = document.getElementById('scrollProgressBar');
    const toTopBtn = document.getElementById('toTopBtn');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (progressBar && maxScroll > 0) {
        progressBar.style.width = `${(scrollY / maxScroll) * 100}%`;
      }

      if (toTopBtn) {
        toTopBtn.classList.toggle('is-visible', scrollY > 350);
      }
    }, { passive: true });

    if (toTopBtn) {
      toTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ==========================================================================
     4. MENU MOBILE ACESSÍVEL
     ========================================================================== */
  function initMobileNav() {
    const toggleBtn = document.getElementById('mobileNavToggle');
    const navMenu = document.getElementById('navMenu');
    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-active');
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
      toggleBtn.classList.toggle('is-active', isOpen);
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.classList.remove('is-active');
      });
    });
  }

  /* ==========================================================================
     5. BUSCA INTELIGENTE DO PORTAL (TEMPO REAL & DEBOUNCE)
     ========================================================================== */
  function initPortalSearch() {
    const searchInput = document.getElementById('portalSearchInput');
    const clearBtn = document.getElementById('portalSearchClear');
    const resultsBox = document.getElementById('searchResultsDropdown');
    const searchTags = document.querySelectorAll('.portal-search-tag');

    if (!searchInput || !resultsBox) return;

    let debounceTimer = null;

    const performSearch = (term) => {
      const q = term.trim().toLowerCase();
      if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

      if (!q || q.length < 2) {
        resultsBox.classList.remove('is-open');
        resultsBox.innerHTML = '';
        return;
      }

      // Procura em DIREITOS
      const matchesDireitos = CACHE.direitos.filter(d =>
        (d.titulo && d.titulo.toLowerCase().includes(q)) ||
        (d.resumo && d.resumo.toLowerCase().includes(q)) ||
        (d.base_legal && d.base_legal.toLowerCase().includes(q)) ||
        (d.categoria && d.categoria.toLowerCase().includes(q))
      );

      // Procura em INSTITUIÇÕES
      const matchesInst = CACHE.instituicoes.filter(i =>
        (i.nome && i.nome.toLowerCase().includes(q)) ||
        (i.sigla && i.sigla.toLowerCase().includes(q)) ||
        (i.cidade && i.cidade.toLowerCase().includes(q)) ||
        (i.descricao && i.descricao.toLowerCase().includes(q))
      );

      // Procura em DOCUMENTOS
      const matchesDocs = CACHE.documentos.filter(doc =>
        (doc.titulo && doc.titulo.toLowerCase().includes(q)) ||
        (doc.descricao && doc.descricao.toLowerCase().includes(q)) ||
        (doc.categoria && doc.categoria.toLowerCase().includes(q))
      );

      const totalMatches = matchesDireitos.length + matchesInst.length + matchesDocs.length;

      if (totalMatches === 0) {
        resultsBox.innerHTML = `
          <div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
            <p>Nenhum resultado encontrado para "<strong>${escapeHtml(q)}</strong>".</p>
            <p style="font-size:0.8125rem; margin-top:4px;">Tente pesquisar por: <em>BPC</em>, <em>IPVA</em>, <em>Passe Livre</em> ou <em>Laudo</em>.</p>
          </div>
        `;
        resultsBox.classList.add('is-open');
        return;
      }

      let html = `<div style="padding: 10px 18px; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
        ${totalMatches} RESULTADO(S) ENCONTRADO(S)
      </div>`;

      // Renderiza direitos
      matchesDireitos.slice(0, 4).forEach(d => {
        html += `
          <div class="search-result-item" tabindex="0" role="button" data-action="open-direito" data-id="${d.id}">
            <div class="search-result-item-header">
              <span class="search-result-item-title">${escapeHtml(d.titulo)}</span>
              <span class="search-result-item-badge">Direito</span>
            </div>
            <p class="search-result-item-snippet">${escapeHtml(d.resumo || '')}</p>
          </div>
        `;
      });

      // Renderiza instituições
      matchesInst.slice(0, 3).forEach(i => {
        html += `
          <div class="search-result-item" tabindex="0" role="button" data-action="scroll-inst" data-id="${i.id}">
            <div class="search-result-item-header">
              <span class="search-result-item-title">${escapeHtml(i.nome)} (${escapeHtml(i.sigla || i.estado)})</span>
              <span class="search-result-item-badge" style="background:#ECFDF5; color:#065F46;">Reabilitação</span>
            </div>
            <p class="search-result-item-snippet">${escapeHtml(i.cidade)} - ${escapeHtml(i.estado)} • ${escapeHtml(i.descricao || '')}</p>
          </div>
        `;
      });

      // Renderiza documentos
      matchesDocs.slice(0, 3).forEach(doc => {
        html += `
          <div class="search-result-item" tabindex="0" role="button" data-action="open-doc" data-id="${doc.id}">
            <div class="search-result-item-header">
              <span class="search-result-item-title">${escapeHtml(doc.titulo)}</span>
              <span class="search-result-item-badge" style="background:#FFFBEB; color:#B45309;">Modelo</span>
            </div>
            <p class="search-result-item-snippet">${escapeHtml(doc.descricao || '')}</p>
          </div>
        `;
      });

      resultsBox.innerHTML = html;
      resultsBox.classList.add('is-open');

      // Eventos de clique nos resultados
      resultsBox.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const action = item.dataset.action;
          const id = item.dataset.id;
          resultsBox.classList.remove('is-open');

          if (action === 'open-direito') {
            openDireitoModal(id);
          } else if (action === 'open-doc') {
            openDocumentoModal(id);
          } else if (action === 'scroll-inst') {
            const el = document.getElementById('instituicoes');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    };

    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        performSearch(e.target.value);
      }, 250);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        resultsBox.classList.remove('is-open');
        clearBtn.style.display = 'none';
      });
    }

    // Pílulas de termos rápidos
    searchTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const term = tag.textContent.trim();
        searchInput.value = term;
        performSearch(term);
        searchInput.focus();
      });
    });

    // Fecha dropdown ao clicar fora
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !resultsBox.contains(e.target)) {
        resultsBox.classList.remove('is-open');
      }
    });
  }

  /* ==========================================================================
     6. CENTRAL DE FERRAMENTAS & CALCULADORAS INTERATIVAS
     ========================================================================== */
  function initPortalTools() {
    const tabBtns = document.querySelectorAll('.tool-tab-btn');
    const tabPanels = document.querySelectorAll('.tool-panel');

    // Troca de Tabs
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        tabPanels.forEach(p => p.classList.remove('is-active'));

        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        const targetId = btn.dataset.tab;
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('is-active');
      });
    });

    // 6.1 Simulador de BPC/LOAS
    const bpcForm = document.getElementById('bpcSimuladorForm');
    if (bpcForm) {
      bpcForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = bpcForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Calculando critérios...';

        const payload = {
          renda_total: parseFloat(document.getElementById('bpcRendaTotal')?.value || 0),
          qtd_pessoas: parseInt(document.getElementById('bpcQtdPessoas')?.value || 1),
          gastos_comprovados: parseFloat(document.getElementById('bpcGastosSaude')?.value || 0),
          idade: parseInt(document.getElementById('bpcIdade')?.value || 0),
          tem_deficiencia_longo_prazo: document.getElementById('bpcTemDeficiencia')?.checked,
          tem_cadunico: document.getElementById('bpcTemCadUnico')?.checked
        };

        try {
          const res = await fetch(`${CONFIG.apiBase}/ferramentas/simulador-bpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          renderBpcResultado(data);
        } catch (err) {
          alert('Erro ao processar cálculo do BPC. Verifique os dados inseridos.');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }

    // 6.2 Calculadora de Isenção Veicular PcD
    const isencaoForm = document.getElementById('isencaoVeicularForm');
    if (isencaoForm) {
      isencaoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = isencaoForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Calculando isenções...';

        const estado_uf = document.getElementById('isencaoEstadoUf')?.value || document.getElementById('isencaoUf')?.value || 'SP';
        const condutorEl = document.getElementById('isencaoCondutor');
        const eh_condutor = condutorEl ? (condutorEl.value === 'condutor') : (document.getElementById('isencaoEhCondutor')?.checked !== false);

        const payload = {
          valor_veiculo: parseFloat(document.getElementById('isencaoValorVeiculo')?.value || 0),
          estado_uf,
          eh_condutor
        };

        try {
          const res = await fetch(`${CONFIG.apiBase}/ferramentas/calculadora-isencao`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          renderIsencaoResultado(data);
        } catch (err) {
          alert('Erro ao calcular isenções. Tente novamente.');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }

    // 6.3 Calculadora de Cotas (Lei 8.213/91)
    const cotasForm = document.getElementById('cotasCalculadoraForm');
    if (cotasForm) {
      cotasForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = cotasForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Processando enquadramento...';

        const payload = {
          total_funcionarios: parseInt(document.getElementById('cotasTotalFuncionarios')?.value || 0)
        };

        try {
          const res = await fetch(`${CONFIG.apiBase}/ferramentas/calculadora-cotas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          renderCotasResultado(data);
        } catch (err) {
          alert('Erro ao calcular cota legal. Tente novamente.');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }

    // 6.4 Gerador de Petições e Requerimentos
    const peticaoForm = document.getElementById('peticaoGeradorForm');
    if (peticaoForm) {
      peticaoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = peticaoForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Gerando documento oficial...';

        const payload = {
          tipo: document.getElementById('peticaoTipo')?.value || 'apoio_escolar',
          nome: document.getElementById('peticaoNome')?.value || '',
          cpf: document.getElementById('peticaoCpf')?.value || '',
          rg: document.getElementById('peticaoRg')?.value || '',
          endereco: document.getElementById('peticaoEndereco')?.value || '',
          cidade: document.getElementById('peticaoCidade')?.value || '',
          uf: document.getElementById('peticaoUf')?.value || 'SP',
          cid: document.getElementById('peticaoCid')?.value || '',
          orgao_ou_empresa: document.getElementById('peticaoDestino')?.value || '',
          detalhes: document.getElementById('peticaoDetalhes')?.value || ''
        };

        try {
          const res = await fetch(`${CONFIG.apiBase}/ferramentas/gerador-peticao`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          renderPeticaoResultado(data);
        } catch (err) {
          alert('Erro ao gerar documento. Preencha ao menos Nome e CPF.');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }
  }

  // Renderizadores de Resultados das Ferramentas
  function renderBpcResultado(data) {
    const box = document.getElementById('bpcResultadoBox');
    if (!box) return;

    let badgeClass = 'warning';
    let statusTitulo = 'Sob Avaliação Especial';

    if (data.status === 'alta_probabilidade') {
      badgeClass = 'success';
      statusTitulo = 'Alta Probabilidade de Concessão';
    } else if (data.status === 'provavel_com_comprovacao') {
      badgeClass = 'warning';
      statusTitulo = 'Concessão Viável com Dedução de Gastos de Saúde';
    } else if (data.status === 'perfil_invalido') {
      statusTitulo = 'Perfil Não Enquadrado';
    }

    box.innerHTML = `
      <div class="calc-stat-hero">
        <div class="calc-stat-label">Renda Per Capita Familiar Líquida</div>
        <div class="calc-stat-value ${badgeClass}">R$ ${data.rendaPerCapita.toFixed(2)}</div>
        <p style="font-size:0.8125rem; color:var(--text-muted); margin-top:4px;">
          Critério estrito: até R$ ${data.limiteEstrito.toFixed(2)} | Limite STF: até R$ ${data.limiteFlexibilizado.toFixed(2)}
        </p>
      </div>

      <div style="background:#FFFFFF; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem;">
        <h4 style="font-size:1.05rem; font-weight:800; color:var(--text-heading); margin-bottom:8px;">
          ${statusTitulo}
        </h4>
        <p style="font-size:0.875rem; color:var(--text-main); line-height:1.5; margin-bottom:12px;">
          ${escapeHtml(data.recomendacao)}
        </p>

        <h5 style="font-size:0.8125rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px;">
          Próximos Passos Obrigatórios:
        </h5>
        <ul style="padding-left:1.25rem; font-size:0.825rem; color:var(--text-main); line-height:1.6;">
          ${data.proximosPassos.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
        </ul>
      </div>

      <a href="https://meu.inss.gov.br/" target="_blank" rel="noopener noreferrer" class="btn btn-blue btn-sm" style="align-self:center; margin-top:8px;">
        Acessar Portal Meu INSS (Oficial)
      </a>
    `;
    box.style.display = 'flex';
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderIsencaoResultado(data) {
    const box = document.getElementById('isencaoResultadoBox');
    if (!box) return;

    box.innerHTML = `
      <div class="calc-stat-hero">
        <div class="calc-stat-label">Economia Estimada no 1º Ano</div>
        <div class="calc-stat-value success">R$ ${data.economiaTotalPrimeiroAno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        <p style="font-size:0.8125rem; color:var(--text-muted); margin-top:4px;">
          Valor estimado do veículo com isenções: <strong>R$ ${data.valorFinalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
        </p>
      </div>

      <div style="background:#FFFFFF; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem;">
        <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-heading); margin-bottom:10px;">
          Detalhamento Tributário (Estado: ${data.uf})
        </h4>
        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-color); font-size:0.85rem;">
          <span>Isenção IPI (Federal - Teto R$ 200k):</span>
          <strong>${data.elegivelIpi ? `R$ ${data.economiaIpi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não elegível'}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-color); font-size:0.85rem;">
          <span>Isenção ICMS (Estadual - Cota R$ 70k):</span>
          <strong>${data.elegivelIcms ? `R$ ${data.economiaIcms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não elegível'}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:0.85rem;">
          <span>Isenção IPVA (Anual Estimado):</span>
          <strong>${data.elegivelIpva ? `R$ ${data.economiaIpvaAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /ano` : 'Não elegível'}</strong>
        </div>
      </div>
    `;
    box.style.display = 'flex';
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderCotasResultado(data) {
    const box = document.getElementById('cotasResultadoBox');
    if (!box) return;

    box.innerHTML = `
      <div class="calc-stat-hero">
        <div class="calc-stat-label">Vagas PcD Obrigatórias por Lei</div>
        <div class="calc-stat-value ${data.vagasObrigatorias > 0 ? 'warning' : 'success'}">${data.vagasObrigatorias}</div>
        <p style="font-size:0.8125rem; color:var(--text-muted); margin-top:4px;">
          ${escapeHtml(data.faixa)} • ${data.baseLegal}
        </p>
      </div>

      <div style="background:#FFFFFF; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem;">
        ${data.riscoFiscal ? `
          <div style="background:#FEF2F2; border:1px solid #FCA5A5; border-radius:var(--radius-sm); padding:10px; margin-bottom:12px;">
            <strong style="color:#991B1B; font-size:0.85rem; display:block; margin-bottom:2px;">Risco de Multa por Auditoria Fiscal do Trabalho:</strong>
            <span style="font-size:0.8rem; color:#7F1D1D;">
              Estimativa de multa de R$ ${data.riscoFiscal.multaEstimadaMinima.toLocaleString('pt-BR')} a R$ ${data.riscoFiscal.multaEstimadaMaxima.toLocaleString('pt-BR')}.
            </span>
          </div>
        ` : ''}

        <p style="font-size:0.85rem; color:var(--text-main); line-height:1.5;">
          ${escapeHtml(data.recomendacaoConsultoria)}
        </p>
      </div>

      <a href="#contato" class="btn btn-blue btn-sm" style="align-self:center; margin-top:8px;">
        Agendar Diagnóstico Corporativo com Moisés Souza
      </a>
    `;
    box.style.display = 'flex';
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderPeticaoResultado(data) {
    const box = document.getElementById('peticaoResultadoBox');
    if (!box) return;

    box.innerHTML = `
      <div style="background:#FFFFFF; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-heading); margin:0;">
            ${escapeHtml(data.titulo)}
          </h4>
          <button type="button" class="btn btn-secondary btn-sm" id="btnCopiarPeticao">
            Copiar Texto
          </button>
        </div>
        <textarea id="textoPeticaoGerada" readonly style="width:100%; height:260px; font-family:var(--font-mono); font-size:0.8rem; padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--bg-secondary); resize:vertical;">${data.documentoTexto}</textarea>
        <p style="font-size:0.775rem; color:var(--text-muted); margin-top:8px;">
          Você pode copiar o texto acima e imprimir ou colar no editor de texto de sua preferência. Anexe os laudos médicos pertinentes antes de protocolar.
        </p>
      </div>
    `;
    box.style.display = 'flex';

    const btnCopiar = document.getElementById('btnCopiarPeticao');
    if (btnCopiar) {
      btnCopiar.addEventListener('click', () => {
        const txt = document.getElementById('textoPeticaoGerada');
        if (txt) {
          navigator.clipboard.writeText(txt.value).then(() => {
            btnCopiar.textContent = 'Copiado com Sucesso!';
            btnCopiar.classList.add('btn-blue');
            setTimeout(() => {
              btnCopiar.textContent = 'Copiar Texto';
              btnCopiar.classList.remove('btn-blue');
            }, 2500);
          });
        }
      });
    }

    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ==========================================================================
     7. CARREGAMENTO DE DADOS DO BANCO (STACKCP MYSQL)
     ========================================================================== */
  async function loadPortalData() {
    try {
      const [resDireitos, resInst, resDocs, resVagas, resSiteData, resFaq] = await Promise.all([
        fetch(`${CONFIG.apiBase}/public/direitos`).then(r => r.json()).catch(() => []),
        fetch(`${CONFIG.apiBase}/public/instituicoes`).then(r => r.json()).catch(() => []),
        fetch(`${CONFIG.apiBase}/public/documentos`).then(r => r.json()).catch(() => []),
        fetch(`${CONFIG.apiBase}/public/vagas`).then(r => r.json()).catch(() => []),
        fetch(`${CONFIG.apiBase}/public/site-data`).then(r => r.json()).catch(() => ({})),
        fetch(`${CONFIG.apiBase}/public/faq-portal`).then(r => r.json()).catch(() => [])
      ]);

      CACHE.direitos = Array.isArray(resDireitos) ? resDireitos : [];
      CACHE.instituicoes = Array.isArray(resInst) ? resInst : [];
      CACHE.documentos = Array.isArray(resDocs) ? resDocs : [];
      CACHE.vagas = Array.isArray(resVagas) ? resVagas : [];
      CACHE.faqs = Array.isArray(resFaq) ? resFaq : [];

      renderDireitosGrid(CACHE.direitos);
      renderInstituicoesGrid(CACHE.instituicoes);
      renderDocumentosGrid(CACHE.documentos);
      renderVagasGrid(CACHE.vagas);
      renderFaqAccordion(CACHE.faqs);

      // Atualiza banner de topo dinâmico se ativo
      if (resSiteData?.configs?.alerta_topo_ativo === '1' && resSiteData?.configs?.alerta_topo_texto) {
        const topNoticeText = document.getElementById('topNoticeText');
        if (topNoticeText) topNoticeText.innerHTML = `<strong>AVISO IMPORTANTE:</strong> ${escapeHtml(resSiteData.configs.alerta_topo_texto)}`;
      }
    } catch (err) {
      console.error('Erro ao inicializar dados públicos:', err);
    }
  }

  function renderDireitosGrid(lista) {
    const grid = document.getElementById('direitosGrid');
    if (!grid) return;

    if (lista.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted);">Nenhum direito listado no momento.</p>';
      return;
    }

    grid.innerHTML = lista.map(d => `
      <article class="direito-card" tabindex="0">
        <span class="direito-card-badge">${escapeHtml(d.categoria || 'Garantia Legal')}</span>
        <h3 class="direito-card-title">${escapeHtml(d.titulo)}</h3>
        <p class="direito-card-resumo">${escapeHtml(d.resumo || '')}</p>
        ${d.base_legal ? `<div class="direito-card-legal"><strong>Base Legal:</strong> ${escapeHtml(d.base_legal)}</div>` : ''}
        <button type="button" class="btn btn-secondary btn-sm" onclick="window.jtpcdOpenDireito(${d.id})" style="margin-top:auto;">
          Ver Detalhes e Como Requerer
        </button>
      </article>
    `).join('');
  }

  function renderInstituicoesGrid(lista) {
    const grid = document.getElementById('instituicoesGrid');
    const ufFilterBar = document.getElementById('instUfFilterBar');
    if (!grid) return;

    // Filtros de UF
    if (ufFilterBar && ufFilterBar.children.length <= 1) {
      const ufs = Array.from(new Set(lista.map(i => i.estado).filter(Boolean))).sort();
      ufs.forEach(uf => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'inst-uf-btn';
        btn.textContent = uf;
        btn.addEventListener('click', () => {
          ufFilterBar.querySelectorAll('.inst-uf-btn').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          const filtrados = uf === 'Todos' ? CACHE.instituicoes : CACHE.instituicoes.filter(i => i.estado === uf || i.estado === 'Nacional');
          renderInstituicoesGrid(filtrados);
        });
        ufFilterBar.appendChild(btn);
      });
    }

    grid.innerHTML = lista.map(i => `
      <article class="inst-card">
        <div class="inst-card-top">
          <span style="font-size:0.75rem; font-weight:700; color:var(--color-blue-600); text-transform:uppercase;">${escapeHtml(i.tipo || 'Centro Especializado')}</span>
          ${i.atendimento_gratuito ? `<span class="inst-badge-gratuito">SUS Gratuito</span>` : ''}
        </div>
        <h3 class="inst-title">${escapeHtml(i.nome)} ${i.sigla ? `(${escapeHtml(i.sigla)})` : ''}</h3>
        <p class="inst-local">${escapeHtml(i.cidade)} - ${escapeHtml(i.estado)}</p>
        <p class="inst-desc">${escapeHtml(i.descricao || '')}</p>
        <div class="inst-actions">
          ${i.telefone ? `<a href="tel:${escapeHtml(i.telefone.replace(/\D/g,''))}" class="btn btn-secondary btn-sm">Ligar: ${escapeHtml(i.telefone)}</a>` : ''}
          ${i.site ? `<a href="${escapeHtml(i.site)}" target="_blank" rel="noopener noreferrer" class="btn btn-blue btn-sm">Site Oficial</a>` : ''}
        </div>
      </article>
    `).join('');
  }

  function renderDocumentosGrid(lista) {
    const grid = document.getElementById('documentosGrid');
    if (!grid) return;

    grid.innerHTML = lista.map(doc => `
      <article class="doc-card">
        <span class="doc-card-badge">${escapeHtml(doc.categoria || 'Requerimento')}</span>
        <h3 class="doc-card-title">${escapeHtml(doc.titulo)}</h3>
        <p class="doc-card-desc">${escapeHtml(doc.descricao || '')}</p>
        <button type="button" class="btn btn-blue btn-sm" onclick="window.jtpcdOpenDoc(${doc.id})" style="margin-top:auto;">
          Visualizar e Copiar Modelo
        </button>
      </article>
    `).join('');
  }

  function renderVagasGrid(lista) {
    const grid = document.getElementById('vagasGrid');
    if (!grid) return;

    if (lista.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted);">Novas oportunidades estão sendo homologadas pela nossa equipe.</p>';
      return;
    }

    grid.innerHTML = lista.map(v => `
      <article class="inst-card">
        <div class="inst-card-top">
          <span style="font-size:0.75rem; font-weight:700; color:var(--color-blue-600);">${escapeHtml(v.modalidade || 'Efetivo')}</span>
          <span style="font-size:0.75rem; background:var(--bg-ice-blue); color:var(--color-blue-600); padding:2px 8px; border-radius:99px; font-weight:700;">100% PcD</span>
        </div>
        <h3 class="inst-title">${escapeHtml(v.titulo)}</h3>
        <p class="inst-local">${escapeHtml(v.empresa || 'Empresa Confidencial')} • ${escapeHtml(v.localizacao || 'Brasil')}</p>
        <p class="inst-desc">${escapeHtml(v.descricao || '')}</p>
        <a href="${escapeHtml(v.link_candidatura || '#')}" target="_blank" rel="noopener noreferrer" class="btn btn-blue btn-sm" style="margin-top:auto; align-self:flex-start;">
          Candidatar-se à Vaga
        </a>
      </article>
    `).join('');
  }

  function renderFaqAccordion(lista) {
    const accordion = document.getElementById('faqAccordion');
    if (!accordion || lista.length === 0) return;

    accordion.innerHTML = lista.map((faq, idx) => `
      <div class="faq-item" style="border:1px solid var(--border-color); border-radius:var(--radius-md); margin-bottom:12px; overflow:hidden; background:var(--bg-card);">
        <button type="button" class="faq-question" style="width:100%; text-align:left; padding:16px 20px; font-weight:700; font-size:1.025rem; color:var(--text-heading); background:transparent; border:none; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" aria-expanded="false" id="faq-btn-${idx}" aria-controls="faq-ans-${idx}">
          <span>${escapeHtml(faq.pergunta)}</span>
          <span class="faq-icon" style="font-size:1.25rem; transition:transform 0.2s;">+</span>
        </button>
        <div class="faq-answer" id="faq-ans-${idx}" role="region" aria-labelledby="faq-btn-${idx}" style="display:none; padding:0 20px 18px; color:var(--text-main); font-size:0.925rem; line-height:1.6; border-top:1px solid var(--border-color);">
          <p style="margin-top:12px;">${escapeHtml(faq.resposta)}</p>
        </div>
      </div>
    `).join('');

    accordion.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const ans = document.getElementById(btn.getAttribute('aria-controls'));
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isOpen));
        const icon = btn.querySelector('.faq-icon');
        if (ans) ans.style.display = isOpen ? 'none' : 'block';
        if (icon) icon.textContent = isOpen ? '+' : '−';
      });
    });
  }

  /* ==========================================================================
     8. SISTEMA DE MODAIS ACESSÍVEIS (WCAG 2.2 AA)
     ========================================================================== */
  function initModals() {
    const backdrop = document.getElementById('portalModalBackdrop');
    const closeBtn = document.getElementById('portalModalClose');

    if (!backdrop) return;

    const closeModal = () => {
      backdrop.classList.remove('is-open');
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Registra globalmente para abertura pelos cards
    window.jtpcdOpenDireito = (id) => {
      const d = CACHE.direitos.find(x => x.id === id);
      if (!d) return;

      const titleEl = document.getElementById('portalModalTitle');
      const bodyEl = document.getElementById('portalModalBody');
      const footerEl = document.getElementById('portalModalFooter');

      if (titleEl) titleEl.textContent = d.titulo;
      if (bodyEl) {
        bodyEl.innerHTML = `
          <div style="margin-bottom:1rem;">
            <span class="direito-card-badge">${escapeHtml(d.categoria)}</span>
            ${d.base_legal ? `<div class="direito-card-legal" style="margin-top:8px;"><strong>Base Legal:</strong> ${escapeHtml(d.base_legal)}</div>` : ''}
          </div>
          <div style="font-size:0.95rem; line-height:1.6; color:var(--text-main); margin-bottom:1.5rem;">
            <h4 style="font-size:1.05rem; font-weight:800; color:var(--text-heading); margin-bottom:6px;">O que é e quem tem direito:</h4>
            <p>${escapeHtml(d.o_que_e || d.resumo || '')}</p>
            ${d.quem_tem_direito ? `<p style="margin-top:8px;">${escapeHtml(d.quem_tem_direito)}</p>` : ''}
          </div>
          ${d.documentos_necessarios ? `
            <div style="margin-bottom:1.5rem; background:var(--bg-secondary); padding:1rem; border-radius:var(--radius-md);">
              <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-heading); margin-bottom:6px;">Documentos Necessários:</h4>
              <p style="font-size:0.875rem;">${escapeHtml(d.documentos_necessarios)}</p>
            </div>
          ` : ''}
          ${d.passo_a_passo ? `
            <div style="margin-bottom:1.5rem;">
              <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-heading); margin-bottom:6px;">Passo a Passo para Solicitação:</h4>
              <p style="font-size:0.875rem; white-space:pre-line;">${escapeHtml(d.passo_a_passo)}</p>
            </div>
          ` : ''}
        `;
      }

      if (footerEl) {
        footerEl.innerHTML = `
          ${d.link_oficial ? `<a href="${escapeHtml(d.link_oficial)}" target="_blank" rel="noopener noreferrer" class="btn btn-blue btn-sm">Acessar Serviço Oficial</a>` : ''}
          <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('portalModalBackdrop').classList.remove('is-open')">Fechar</button>
        `;
      }

      backdrop.classList.add('is-open');
      backdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      announceA11y(`Abrindo detalhes de ${d.titulo}`);
    };

    window.jtpcdOpenDoc = (id) => {
      const doc = CACHE.documentos.find(x => x.id === id);
      if (!doc) return;

      const titleEl = document.getElementById('portalModalTitle');
      const bodyEl = document.getElementById('portalModalBody');
      const footerEl = document.getElementById('portalModalFooter');

      if (titleEl) titleEl.textContent = doc.titulo;
      if (bodyEl) {
        bodyEl.innerHTML = `
          <p style="font-size:0.875rem; color:var(--text-muted); margin-bottom:1rem;">
            ${escapeHtml(doc.descricao || '')}
          </p>
          <textarea id="modalDocTextarea" readonly style="width:100%; height:320px; font-family:var(--font-mono); font-size:0.825rem; padding:12px; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-secondary); resize:vertical;">${doc.conteudo_texto || 'Conteúdo do modelo não disponível.'}</textarea>
        `;
      }

      if (footerEl) {
        footerEl.innerHTML = `
          <button type="button" class="btn btn-blue btn-sm" id="btnCopiarDocModal">Copiar Texto do Requerimento</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('portalModalBackdrop').classList.remove('is-open')">Fechar</button>
        `;

        const btnCopiar = document.getElementById('btnCopiarDocModal');
        if (btnCopiar) {
          btnCopiar.addEventListener('click', () => {
            const txt = document.getElementById('modalDocTextarea');
            if (txt) {
              navigator.clipboard.writeText(txt.value).then(() => {
                btnCopiar.textContent = 'Copiado para a Área de Transferência!';
                setTimeout(() => { btnCopiar.textContent = 'Copiar Texto do Requerimento'; }, 2500);
              });
            }
          });
        }
      }

      backdrop.classList.add('is-open');
      backdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
  }

  /* ==========================================================================
     9. CONTATO CORPORATIVO & PALESTRAS MOISÉS SOUZA
     ========================================================================== */
  function initCorporateContact() {
    const form = document.getElementById('corporateLeadForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Enviando...';

      const payload = {
        nome: document.getElementById('leadNome')?.value.trim() || '',
        empresa: document.getElementById('leadEmpresa')?.value.trim() || '',
        cargo: document.getElementById('leadCargo')?.value.trim() || '',
        email: document.getElementById('leadEmail')?.value.trim() || '',
        telefone: document.getElementById('leadTelefone')?.value.trim() || '',
        servico_interesse: document.getElementById('leadServico')?.value || 'Palestras',
        mensagem: document.getElementById('leadMensagem')?.value.trim() || ''
      };

      try {
        const res = await fetch(`${CONFIG.apiBase}/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          alert('Sua mensagem foi enviada com sucesso! A equipe de Moisés Souza entrará em contato.');
          form.reset();
        } else {
          alert(data.error || 'Erro ao enviar mensagem.');
        }
      } catch (err) {
        alert('Erro de conexão ao enviar mensagem. Tente pelo WhatsApp.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  /* ==========================================================================
     10. UTILITÁRIOS & ANALYTICS
     ========================================================================== */
  function trackPageView() {
    try {
      fetch(`${CONFIG.apiBase}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagina: window.location.pathname || '/',
          origem: document.referrer || 'Direto',
          dispositivo: window.innerWidth < 768 ? 'Mobile' : 'Desktop'
        })
      }).catch(() => {});
    } catch (e) {}
  }

  function initCurrentYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

})();
