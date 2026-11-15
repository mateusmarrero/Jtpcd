/* ==========================================================================
   JÁ TE CONTARAM PCD? — CONSULTORIA DE INCLUSÃO E ACESSIBILIDADE
   Master Scripts v2.5 — Identidade Visual Tática & Acessibilidade
   ========================================================================== */

(function () {
  'use strict';

  const CONFIG = {
    whatsappNumber: '5521984145167',
    companyName: 'Já te contaram PcD?'
  };

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initScrollEffects();
    initMobileNav();
    initServicesTabs();
    initGalleryModal();
    initFaqSearch();
    initContactForm();
    initAccessibilitySuite();
    initShareButton();
    initCurrentYear();
  });

  /* ---------- 1. Controle de Tema Claro / Escuro ---------- */
  function initTheme() {
    const themeBtn = document.getElementById('themeToggleBtn');
    const root = document.documentElement;

    const setTheme = (isDark) => {
      root.classList.toggle('dark', isDark);
      localStorage.setItem('jtpcd_theme', isDark ? 'dark' : 'light');
      if (themeBtn) {
        themeBtn.setAttribute('title', isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro');
        themeBtn.setAttribute('aria-label', isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro');
        const icon = themeBtn.querySelector('i, svg');
        if (icon) {
          icon.innerHTML = isDark
            ? '<path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>'
            : '<path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>';
        }
      }
    };

    // Padrão oficial: Fundo Branco com Letras Azuis
    localStorage.removeItem('jtpcd_theme');
    setTheme(false);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        setTheme(!root.classList.contains('dark'));
      });
    }
  }

  /* ---------- 2. Efeitos de Scroll & Header ---------- */
  function initScrollEffects() {
    const progressBar = document.getElementById('scrollProgressBar');
    const toTopBtn = document.getElementById('toTopBtn');
    const navLinks = document.querySelectorAll('.nav-item a[href^="#"]');

    let ticking = false;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Barra de progresso
      if (progressBar && docHeight > 0) {
        progressBar.style.width = `${(scrollY / docHeight) * 100}%`;
      }

      // Botão voltar ao topo
      if (toTopBtn) {
        toTopBtn.classList.toggle('is-visible', scrollY > 400);
      }

      // Seção ativa
      const sections = document.querySelectorAll('section[id]');
      let activeId = '';
      sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 140 && rect.bottom >= 140) {
          activeId = sec.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        const href = link.getAttribute('href').replace('#', '');
        link.classList.toggle('active', href === activeId);
      });

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });

    if (toTopBtn) {
      toTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ---------- 3. Menu Mobile ---------- */
  function initMobileNav() {
    const toggleBtn = document.getElementById('mobileNavToggle');
    const navMenu = document.getElementById('navMenu');
    if (!toggleBtn || !navMenu) return;

    const setMenu = (open) => {
      const isOpen = typeof open === 'boolean' ? open : !navMenu.classList.contains('is-active');
      navMenu.classList.toggle('is-active', isOpen);
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
    };

    toggleBtn.addEventListener('click', () => setMenu());
    navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-active')) {
        setMenu(false);
        toggleBtn.focus();
      }
    });
  }

  /* ---------- 4. Abas de Soluções (B2B vs Comunidade) ---------- */
  function initServicesTabs() {
    const tabBtns = document.querySelectorAll('.services-tab-controls .tab-btn');
    const b2bGrid = document.getElementById('servicesB2BGrid');
    const communityGrid = document.getElementById('servicesCommunityGrid');

    if (!tabBtns.length || !b2bGrid || !communityGrid) return;

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const target = btn.dataset.tab;
        if (target === 'b2b') {
          b2bGrid.style.display = 'grid';
          communityGrid.style.display = 'none';
        } else {
          b2bGrid.style.display = 'none';
          communityGrid.style.display = 'grid';
        }
      });
    });
  }

  /* ---------- 5. Galeria Lightbox ---------- */
  function initGalleryModal() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const modal = document.getElementById('galleryModal');
    const modalImg = document.getElementById('galleryModalImg');
    const modalCaption = document.getElementById('galleryModalCaption');
    const closeBtn = document.getElementById('galleryModalClose');

    if (!modal || !modalImg || !galleryItems.length) return;

    const openModal = (src, caption) => {
      modalImg.src = src;
      modalImg.alt = caption;
      if (modalCaption) modalCaption.textContent = caption;
      modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    };

    const closeModal = () => {
      modal.classList.remove('is-active');
      modalImg.src = '';
      document.body.style.overflow = '';
    };

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const caption = item.dataset.caption || (img ? img.alt : 'Foto de evento corporativo');
        if (img) openModal(img.src, caption);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-active')) closeModal();
    });
  }

  /* ---------- 6. FAQ Interativo com Busca ---------- */
  function initFaqSearch() {
    const searchInput = document.getElementById('faqSearchInput');
    const faqItems = document.querySelectorAll('.faq-item');
    if (!searchInput || !faqItems.length) return;

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      faqItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (q === '' || text.includes(q)) {
          item.style.display = 'block';
          if (q !== '') item.setAttribute('open', '');
        } else {
          item.style.display = 'none';
          item.removeAttribute('open');
        }
      });
    });
  }

  /* ---------- 7. Formulário de Contato Comercial ---------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const nameInput = document.getElementById('cfName');
    const companyInput = document.getElementById('cfCompany');
    const emailInput = document.getElementById('cfEmail');
    const phoneInput = document.getElementById('cfPhone');
    const sizeSelect = document.getElementById('cfCompanySize');
    const messageInput = document.getElementById('cfMessage');
    const alertBox = document.getElementById('formAlertBox');

    const btnWhatsApp = document.getElementById('btnSubmitWhatsApp');
    const btnProposal = document.getElementById('btnSubmitProposal');

    const validate = () => {
      if (!nameInput.value.trim()) {
        showAlert('Por favor, informe seu nome.', 'error');
        nameInput.focus();
        return false;
      }
      if (!companyInput.value.trim()) {
        showAlert('Por favor, informe a empresa.', 'error');
        companyInput.focus();
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailInput.value.trim())) {
        showAlert('Por favor, informe um e-mail corporativo válido.', 'error');
        emailInput.focus();
        return false;
      }
      return true;
    };

    const showAlert = (msg, type) => {
      if (!alertBox) return;
      alertBox.textContent = msg;
      alertBox.className = `form-status-alert is-${type}`;
      alertBox.style.display = 'block';
      setTimeout(() => { if (type !== 'success') alertBox.style.display = 'none'; }, 6000);
    };

    const saveLeadToDb = () => {
      const leadData = {
        nome: nameInput.value.trim(),
        empresa: companyInput.value.trim(),
        email: emailInput.value.trim(),
        telefone: phoneInput.value.trim() || 'WhatsApp Direto',
        servico_interesse: (sizeSelect && sizeSelect.value) ? sizeSelect.value : 'Consultoria Inclusiva',
        mensagem: messageInput.value.trim()
      };

      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      }).catch(err => console.error('Erro ao registrar lead no MySQL:', err));
    };

    if (btnWhatsApp) {
      btnWhatsApp.addEventListener('click', (e) => {
        e.preventDefault();
        if (!validate()) return;

        saveLeadToDb();

        const lines = [
          'Olá! Gostaria de falar sobre a consultoria de inclusão da Já te contaram PcD?.',
          `*Nome:* ${nameInput.value.trim()}`,
          `*Empresa:* ${companyInput.value.trim()}`,
          `*E-mail:* ${emailInput.value.trim()}`,
          phoneInput.value.trim() ? `*Telefone:* ${phoneInput.value.trim()}` : '',
          sizeSelect && sizeSelect.value ? `*Porte:* ${sizeSelect.value}` : '',
          messageInput.value.trim() ? `*Mensagem:* ${messageInput.value.trim()}` : ''
        ].filter(Boolean);

        const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
        showAlert('Mensagem registrada e abrindo o WhatsApp oficial...', 'success');
        window.open(url, '_blank', 'noopener');
      });
    }

    if (btnProposal) {
      btnProposal.addEventListener('click', (e) => {
        e.preventDefault();
        if (!validate()) return;

        saveLeadToDb();

        showAlert(`Obrigado, ${nameInput.value.trim()}! Sua solicitação foi registrada no sistema. Nossa equipe entrará em contato em breve.`, 'success');
        form.reset();
      });
    }
  }

  /* ---------- 8. Acessibilidade (WCAG AAA) ---------- */
  function initAccessibilitySuite() {
    const toggleBtn = document.getElementById('a11yToggleBtn');
    const panel = document.getElementById('a11yPanel');
    const closeBtn = document.getElementById('a11yPanelClose');
    const readingGuide = document.getElementById('readingGuideLine');
    const root = document.documentElement;

    if (!toggleBtn || !panel) return;

    const setPanel = (open) => {
      panel.classList.toggle('is-open', open);
      toggleBtn.setAttribute('aria-expanded', String(open));
    };

    toggleBtn.addEventListener('click', () => setPanel(!panel.classList.contains('is-open')));
    if (closeBtn) closeBtn.addEventListener('click', () => setPanel(false));

    // Fonte
    const fontBtns = panel.querySelectorAll('[data-a11y-font]');
    fontBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        fontBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        root.classList.remove('font-scale-sm', 'font-scale-lg', 'font-scale-xl');
        const s = btn.dataset.a11yFont;
        if (s !== 'normal') root.classList.add(`font-scale-${s}`);
      });
    });

    // Alto Contraste
    const contrastBtn = document.getElementById('a11yContrastBtn');
    if (contrastBtn) {
      contrastBtn.addEventListener('click', () => {
        const isContrast = root.classList.toggle('high-contrast');
        contrastBtn.classList.toggle('active', isContrast);
      });
    }

    // Guia de leitura
    const guideBtn = document.getElementById('a11yGuideBtn');
    if (guideBtn && readingGuide) {
      let active = false;
      const onMove = (e) => {
        if (active) readingGuide.style.top = `${e.clientY - 16}px`;
      };
      guideBtn.addEventListener('click', () => {
        active = !active;
        readingGuide.classList.toggle('is-active', active);
        guideBtn.classList.toggle('active', active);
        if (active) window.addEventListener('mousemove', onMove);
        else window.removeEventListener('mousemove', onMove);
      });
    }

    // Leitor por voz
    const speechBtn = document.getElementById('a11ySpeechBtn');
    if (speechBtn && 'speechSynthesis' in window) {
      let speaking = false;
      speechBtn.addEventListener('click', () => {
        if (speaking) {
          window.speechSynthesis.cancel();
          speaking = false;
          speechBtn.classList.remove('active');
        } else {
          const sel = window.getSelection().toString();
          const txt = sel || document.querySelector('.hero-content h1')?.textContent + '. ' + document.querySelector('.hero-lede')?.textContent;
          if (!txt) return;
          const utter = new SpeechSynthesisUtterance(txt);
          utter.lang = 'pt-BR';
          utter.onend = () => {
            speaking = false;
            speechBtn.classList.remove('active');
          };
          window.speechSynthesis.speak(utter);
          speaking = true;
          speechBtn.classList.add('active');
        }
      });
    }

    // Redefinir
    const resetBtn = document.getElementById('a11yResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        root.classList.remove('high-contrast', 'font-scale-sm', 'font-scale-lg', 'font-scale-xl');
        if (readingGuide) readingGuide.classList.remove('is-active');
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        panel.querySelectorAll('.a11y-btn').forEach(b => b.classList.remove('active'));
      });
    }
  }

  /* ---------- 9. Compartilhar ---------- */
  function initShareButton() {
    const btns = document.querySelectorAll('.btn-share-page');
    btns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const data = {
          title: 'Já te contaram PcD? — Consultoria de Inclusão e Acessibilidade',
          text: 'Conheça a Já te contaram PcD?: consultoria de inclusão para empresas.',
          url: window.location.href
        };
        if (navigator.share) {
          try { await navigator.share(data); } catch (e) {}
        } else {
          navigator.clipboard.writeText(window.location.href).then(() => {
            const old = btn.textContent;
            btn.textContent = 'Link Copiado!';
            setTimeout(() => { btn.textContent = old; }, 2000);
          });
        }
      });
    });
  }

  /* ---------- 10. Ano ---------- */
  function initCurrentYear() {
    const el = document.getElementById('currentYear');
    if (el) el.textContent = new Date().getFullYear();
  }

})();
