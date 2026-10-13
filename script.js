/* =========================================================
   Já te contaram PcD?
   Comportamentos: navegação, scroll, revelações, formulário,
   compartilhamento, widget de acessibilidade.
   ========================================================= */

(function () {
    'use strict';

    /* Dados configuráveis do site */
    const CONFIG = {
        whatsapp: '5521984145167'
    };

    document.addEventListener('DOMContentLoaded', function () {
        initNavToggle();
        initScrollUI();
        initReveal();
        initShare();
        initContactForm();
        initAccessibility();
        initYear();
    });

    /* ---------- Menu mobile ---------- */
    function initNavToggle() {
        const toggle = document.getElementById('navToggle');
        const links = document.getElementById('navLinks');
        if (!toggle || !links) return;

        toggle.addEventListener('click', function () {
            const isOpen = links.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        links.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                links.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && links.classList.contains('open')) {
                links.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    }

    /* ---------- UI de rolagem ---------- */
    function initScrollUI() {
        const stickyCta = document.getElementById('stickyCta');
        const navbar = document.getElementById('navbar');
        const progressBar = document.getElementById('progressBar');
        const toTop = document.getElementById('toTop');
        const navLinks = document.querySelectorAll('.nav-links a[data-nav]');
        const sections = Array.from(navLinks)
            .map(function (link) { return document.getElementById(link.dataset.nav); })
            .filter(Boolean);

        let ticking = false;

        function onScroll() {
            const y = window.scrollY;
            const doc = document.documentElement;

            if (stickyCta) stickyCta.classList.toggle('visible', y > 520);
            if (navbar) {
                navbar.classList.toggle('is-scrolled', y > 10);
                navbar.style.top = (stickyCta && stickyCta.classList.contains('visible'))
                    ? stickyCta.offsetHeight + 'px'
                    : '0px';
            }
            if (progressBar) {
                const max = doc.scrollHeight - window.innerHeight;
                progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
            }
            if (toTop) toTop.classList.toggle('show', y > 620);

            let currentId = null;
            sections.forEach(function (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom > 150) currentId = section.id;
            });
            navLinks.forEach(function (link) {
                link.classList.toggle('active', link.dataset.nav === currentId);
            });

            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(onScroll);
                ticking = true;
            }
        }, { passive: true });

        if (toTop) {
            toTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        onScroll();
    }

    /* ---------- Revelar ao rolar ---------- */
    function initReveal() {
        const items = document.querySelectorAll('.reveal-io');
        if (items.length === 0) return;

        if (!('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }

        const io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        items.forEach(function (el) { io.observe(el); });
    }

    /* ---------- Compartilhar ---------- */
    function initShare() {
        const btn = document.getElementById('shareBtn');
        if (!btn) return;

        btn.addEventListener('click', function () {
            const data = {
                title: 'Já te contaram PcD? — Consultoria de inclusão e acessibilidade',
                text: 'Inclusão de PcD que vai além da cota. Conheça a consultoria Já te contaram PcD?.',
                url: location.href
            };

            if (navigator.share) {
                navigator.share(data).catch(function () { /* cancelado */ });
                return;
            }

            const temp = document.createElement('textarea');
            temp.value = location.href;
            temp.setAttribute('readonly', '');
            temp.style.position = 'absolute';
            temp.style.left = '-9999px';
            document.body.appendChild(temp);
            temp.select();
            try {
                document.execCommand('copy');
                btn.textContent = 'Link copiado!';
            } catch (err) {
                btn.textContent = 'Copie o link da página';
            }
            document.body.removeChild(temp);
            setTimeout(function () {
                btn.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-share"></use></svg> Compartilhar';
            }, 2500);
        });
    }

    /* ---------- Formulário de contato (via WhatsApp) ---------- */
    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const name = document.getElementById('cfName');
        const company = document.getElementById('cfCompany');
        const email = document.getElementById('cfEmail');
        const message = document.getElementById('cfMessage');
        const note = document.getElementById('contactNote');

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!name.value.trim() || !company.value.trim()) {
                note.textContent = 'Preencha nome e empresa para continuar.';
                note.hidden = false;
                (name.value.trim() ? company : name).focus();
                return;
            }
            if (!isValidEmail(email.value.trim())) {
                note.textContent = 'Por favor, informe um e-mail válido.';
                note.hidden = false;
                email.focus();
                return;
            }

            const lines = [
                'Olá! Quero falar sobre inclusão de PcD na minha empresa.',
                'Nome: ' + name.value.trim(),
                'Empresa: ' + company.value.trim(),
                'E-mail: ' + email.value.trim()
            ];
            if (message.value.trim()) lines.push('Necessidade: ' + message.value.trim());

            note.textContent = 'Abrindo o WhatsApp para concluir o envio...';
            note.hidden = false;
            window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
            form.reset();
        });
    }

    /* ---------- Widget de acessibilidade ---------- */
    function initAccessibility() {
        const root = document.documentElement;
        const toggle = document.getElementById('a11yToggle');
        const panel = document.getElementById('a11yPanel');
        const contrastBtn = panel ? panel.querySelector('[data-a11y="contrast"]') : null;
        if (!toggle || !panel) return;

        const STORE = {
            font: 'jtcpcd-font',
            contrast: 'jtcpcd-contrast'
        };

        function applyFont(size) {
            root.classList.remove('font-lg', 'font-sm');
            if (size === 'lg') root.classList.add('font-lg');
            if (size === 'sm') root.classList.add('font-sm');
            try { localStorage.setItem(STORE.font, size); } catch (e) { /* noop */ }
        }

        function applyContrast(on) {
            root.classList.toggle('contrast', on);
            if (contrastBtn) contrastBtn.setAttribute('aria-pressed', String(on));
            try { localStorage.setItem(STORE.contrast, on ? '1' : '0'); } catch (e) { /* noop */ }
        }

        // Estado salvo
        try {
            if (localStorage.getItem(STORE.font) === 'lg') root.classList.add('font-lg');
            if (localStorage.getItem(STORE.font) === 'sm') root.classList.add('font-sm');
            if (localStorage.getItem(STORE.contrast) === '1') applyContrast(true);
        } catch (e) { /* noop */ }

        function setOpen(open) {
            panel.hidden = !open;
            toggle.setAttribute('aria-expanded', String(open));
        }

        toggle.addEventListener('click', function () {
            setOpen(panel.hidden);
        });

        panel.addEventListener('click', function (e) {
            const btn = e.target.closest('[data-a11y]');
            if (!btn) return;
            const action = btn.dataset.a11y;

            if (action === 'font-plus') applyFont('lg');
            else if (action === 'font-minus') applyFont('sm');
            else if (action === 'font-reset') applyFont('md');
            else if (action === 'contrast') applyContrast(!root.classList.contains('contrast'));
            else if (action === 'reset') {
                applyFont('md');
                applyContrast(false);
            }
        });

        // Fecha com Esc ou clique fora
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !panel.hidden) {
                setOpen(false);
                toggle.focus();
            }
        });
        document.addEventListener('click', function (e) {
            if (!panel.hidden && !panel.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
                setOpen(false);
            }
        });
    }

    /* ---------- Ano no rodapé ---------- */
    function initYear() {
        const el = document.getElementById('year');
        if (el) el.textContent = String(new Date().getFullYear());
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    }
})();
