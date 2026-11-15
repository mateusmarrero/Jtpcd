/* ==========================================================================
   PAINEL ADMINISTRATIVO — JÁ TE CONTARAM PCD?
   Lógica e Comunicação com a API MySQL na StackCP
   ========================================================================== */

(function () {
  'use strict';

  let currentToken = localStorage.getItem('jtpcd_admin_token') || '';
  let currentUser = null;
  let allLeads = [];

  // Elementos DOM
  const loginSection = document.getElementById('loginSection');
  const appSection = document.getElementById('appSection');
  const loginForm = document.getElementById('loginForm');
  const loginAlert = document.getElementById('loginAlert');
  const logoutBtn = document.getElementById('logoutBtn');
  const navButtons = document.querySelectorAll('.sidebar-nav .nav-link-btn');
  const pageViews = document.querySelectorAll('.page-view');

  // ---------- TOAST HELPER ----------
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ---------- API REQUEST HELPER ----------
  async function apiRequest(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}),
      ...(options.headers || {})
    };

    try {
      const res = await fetch(endpoint, { credentials: 'omit', ...options, headers });
      if (res.status === 401) {
        logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro na requisição');
      }
      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  // ---------- AUTENTICAÇÃO ----------
  async function checkAuth() {
    if (!currentToken) {
      showLogin();
      return;
    }

    try {
      const data = await apiRequest('/api/admin/check');
      if (data.authenticated) {
        currentUser = data.user;
        showDashboard();
      } else {
        showLogin();
      }
    } catch (err) {
      showLogin();
    }
  }

  function showLogin() {
    loginSection.style.display = 'flex';
    appSection.style.display = 'none';
  }

  function showDashboard() {
    loginSection.style.display = 'none';
    appSection.style.display = 'flex';

    if (currentUser) {
      document.getElementById('adminUserName').textContent = currentUser.nome || 'Administrador';
      document.getElementById('adminUserRole').textContent = currentUser.cargo || 'Super Admin';
      const initial = (currentUser.nome || 'A').charAt(0).toUpperCase();
      document.getElementById('adminUserAvatar').textContent = initial;
    }

    loadDashboardData();
  }

  function logout() {
    if (currentToken) {
      apiRequest('/api/admin/logout', { method: 'POST' }).catch(() => {});
    }
    localStorage.removeItem('jtpcd_admin_token');
    currentToken = '';
    currentUser = null;
    showLogin();
    showToast('Você saiu com sucesso.', 'info');
  }

  // Login Form Submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginAlert.style.display = 'none';
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Entrando...';

      const email = document.getElementById('loginEmail').value.trim();
      const senha = document.getElementById('loginSenha').value;

      try {
        const data = await apiRequest('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify({ email, senha })
        });

        currentToken = data.token;
        currentUser = data.user;
        localStorage.setItem('jtpcd_admin_token', currentToken);
        showDashboard();
        showToast(`Bem-vindo, ${currentUser.nome}!`);
      } catch (err) {
        loginAlert.textContent = err.message || 'Erro ao realizar login.';
        loginAlert.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Acessar Painel';
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // ---------- NAVEGAÇÃO DE ABAS ----------
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPage = btn.getAttribute('data-page');
      if (!targetPage) return;

      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      pageViews.forEach(view => {
        view.style.display = view.id === targetPage ? 'block' : 'none';
      });

      // Atualiza título da topbar
      const pageNames = {
        'pageOverview': 'Visão Geral & Dashboard',
        'pageLeads': 'Gestão de Leads & Oportunidades',
        'pagePalestras': 'Palestras & Eventos',
        'pageVagas': 'Vagas PcD Cadastradas',
        'pageConfig': 'Configurações do Site',
        'pageSecurity': 'Segurança & Senha'
      };
      document.getElementById('topbarPageTitle').textContent = pageNames[targetPage] || 'Painel Administrativo';

      // Carrega dados da aba selecionada
      if (targetPage === 'pageOverview') loadDashboardData();
      if (targetPage === 'pageLeads') loadLeads();
      if (targetPage === 'pagePalestras') loadPalestras();
      if (targetPage === 'pageVagas') loadVagas();
      if (targetPage === 'pageConfig') loadConfig();
    });
  });

  // ---------- 1. CARREGAR DASHBOARD ----------
  async function loadDashboardData() {
    try {
      const stats = await apiRequest('/api/admin/stats');
      document.getElementById('metricTotalLeads').textContent = stats.totalLeads || 0;
      document.getElementById('metricLeadsNovos').textContent = stats.leadsNovos || 0;
      document.getElementById('metricPalestras').textContent = stats.totalPalestras || 0;
      document.getElementById('metricVagas').textContent = stats.totalVagas || 0;

      // Badge no menu
      const navBadge = document.getElementById('navLeadsBadge');
      if (navBadge) {
        navBadge.textContent = stats.leadsNovos || 0;
        navBadge.style.display = stats.leadsNovos > 0 ? 'inline-block' : 'none';
      }

      // Carregar últimos leads na tabela do overview
      const leads = await apiRequest('/api/admin/leads?status=todos');
      renderRecentLeads(leads.slice(0, 5));
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    }
  }

  function renderRecentLeads(leads) {
    const tbody = document.getElementById('recentLeadsTbody');
    if (!tbody) return;

    if (leads.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">Nenhum lead recebido ainda.</td></tr>`;
      return;
    }

    tbody.innerHTML = leads.map(l => `
      <tr>
        <td><strong>${escapeHtml(l.nome)}</strong></td>
        <td>${escapeHtml(l.empresa || '—')}</td>
        <td><a href="https://wa.me/${cleanPhone(l.telefone)}" target="_blank" class="btn btn-whatsapp btn-sm" style="padding:2px 8px; font-size:0.75rem;">${escapeHtml(l.telefone)}</a></td>
        <td><span class="status-pill status-${l.status}">${formatStatus(l.status)}</span></td>
        <td>${formatDate(l.criado_em)}</td>
      </tr>
    `).join('');
  }

  // ---------- 2. MÓDULO DE LEADS ----------
  async function loadLeads() {
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;">Carregando contatos...</td></tr>`;

    try {
      const statusFilter = document.getElementById('leadsFilterStatus').value;
      allLeads = await apiRequest(`/api/admin/leads?status=${statusFilter}`);
      renderLeadsTable(allLeads);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--admin-danger);">Erro ao carregar contatos.</td></tr>`;
    }
  }

  function renderLeadsTable(leads) {
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;

    const search = (document.getElementById('leadsSearchInput')?.value || '').toLowerCase();
    const filtered = leads.filter(l => {
      return (l.nome || '').toLowerCase().includes(search) ||
             (l.empresa || '').toLowerCase().includes(search) ||
             (l.telefone || '').toLowerCase().includes(search) ||
             (l.email || '').toLowerCase().includes(search);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">Nenhum contato encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(l => `
      <tr>
        <td>${formatDate(l.criado_em)}</td>
        <td>
          <strong>${escapeHtml(l.nome)}</strong>
          ${l.email ? `<br><small style="color:var(--admin-text-muted);">${escapeHtml(l.email)}</small>` : ''}
        </td>
        <td>
          ${escapeHtml(l.empresa || '—')}
          ${l.cargo ? `<br><small style="color:var(--admin-text-muted);">${escapeHtml(l.cargo)}</small>` : ''}
        </td>
        <td>
          <a href="https://wa.me/${cleanPhone(l.telefone)}?text=${encodeURIComponent(`Olá ${l.nome}, aqui é da Já te contaram PcD?. Recebemos seu contato através do site!`)}" target="_blank" class="btn btn-whatsapp btn-sm">
            <svg style="width:14px; height:14px;" viewBox="0 0 24 24"><path fill="currentColor" d="M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.48-8.41"/></svg>
            ${escapeHtml(l.telefone)}
          </a>
        </td>
        <td><span style="font-size:0.85rem; color:var(--admin-blue-600); font-weight:600;">${escapeHtml(l.servico_interesse || 'Geral')}</span></td>
        <td>
          <select class="form-control" style="padding:3px 8px; font-size:0.8rem; font-weight:600;" onchange="window.updateLeadStatus(${l.id}, this.value)">
            <option value="novo" ${l.status === 'novo' ? 'selected' : ''}>Novo</option>
            <option value="em_contato" ${l.status === 'em_contato' ? 'selected' : ''}>Em Contato</option>
            <option value="proposta_enviada" ${l.status === 'proposta_enviada' ? 'selected' : ''}>Proposta Enviada</option>
            <option value="fechado" ${l.status === 'fechado' ? 'selected' : ''}>Fechado</option>
            <option value="arquivado" ${l.status === 'arquivado' ? 'selected' : ''}>Arquivado</option>
          </select>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="window.openLeadDetails(${l.id})">Ver</button>
          <button class="btn btn-danger btn-sm" onclick="window.deleteLead(${l.id})" style="margin-left:4px;">✕</button>
        </td>
      </tr>
    `).join('');
  }

  // Listeners de filtro e busca de leads
  document.getElementById('leadsFilterStatus')?.addEventListener('change', loadLeads);
  document.getElementById('leadsSearchInput')?.addEventListener('input', () => renderLeadsTable(allLeads));

  window.updateLeadStatus = async function (id, status) {
    try {
      await apiRequest(`/api/admin/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      showToast('Status atualizado com sucesso!');
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  window.openLeadDetails = function (id) {
    const lead = allLeads.find(l => l.id === id);
    if (!lead) return;

    document.getElementById('modalLeadNome').textContent = lead.nome;
    document.getElementById('modalLeadData').textContent = formatDate(lead.criado_em);
    document.getElementById('modalLeadEmpresa').textContent = `${lead.empresa || 'Não informada'} ${lead.cargo ? `(${lead.cargo})` : ''}`;
    document.getElementById('modalLeadTelefone').textContent = lead.telefone;
    document.getElementById('modalLeadEmail').textContent = lead.email || 'Não informado';
    document.getElementById('modalLeadServico').textContent = lead.servico_interesse || 'Geral';
    document.getElementById('modalLeadMensagem').textContent = lead.mensagem || 'Nenhuma mensagem adicional informada.';
    document.getElementById('modalLeadNotas').value = lead.notas_internas || '';

    const waBtn = document.getElementById('modalLeadWhatsAppBtn');
    waBtn.href = `https://wa.me/${cleanPhone(lead.telefone)}?text=${encodeURIComponent(`Olá ${lead.nome}, aqui é da Já te contaram PcD?. Recebemos seu contato no site sobre ${lead.servico_interesse || 'consultoria'}!`)}`;

    const saveNotesBtn = document.getElementById('modalSaveNotesBtn');
    saveNotesBtn.onclick = async () => {
      const notas = document.getElementById('modalLeadNotas').value;
      try {
        await apiRequest(`/api/admin/leads/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ notas_internas: notas })
        });
        showToast('Anotações salvas com sucesso!');
        lead.notas_internas = notas;
      } catch (err) {
        showToast(err.message, 'error');
      }
    };

    document.getElementById('leadDetailsModal').classList.add('is-open');
  };

  window.deleteLead = async function (id) {
    if (!confirm('Deseja realmente excluir este lead?')) return;
    try {
      await apiRequest(`/api/admin/leads/${id}`, { method: 'DELETE' });
      showToast('Lead excluído.');
      loadLeads();
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ---------- 3. MÓDULO DE PALESTRAS ----------
  async function loadPalestras() {
    const container = document.getElementById('palestrasListContainer');
    if (!container) return;
    container.innerHTML = `<p style="text-align:center; padding:2rem;">Carregando palestras...</p>`;

    try {
      const palestras = await apiRequest('/api/admin/palestras');
      if (palestras.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--admin-text-muted);">Nenhuma palestra cadastrada.</p>`;
        return;
      }

      container.innerHTML = palestras.map(p => `
        <div style="background:#FFF; border:1px solid var(--admin-border); border-radius:var(--admin-radius-lg); overflow:hidden; display:flex; flex-direction:column; box-shadow:var(--admin-shadow-sm);">
          <img src="${p.imagem_url}" alt="${escapeHtml(p.titulo)}" style="width:100%; height:160px; object-fit:cover;">
          <div style="padding:1.25rem; flex:1; display:flex; flex-direction:column;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <span class="status-pill status-em_contato" style="font-size:0.7rem;">${escapeHtml(p.categoria || 'Palestra')}</span>
              ${p.destaque ? `<span class="status-pill status-fechado" style="font-size:0.7rem;">Destaque</span>` : ''}
            </div>
            <h4 style="font-size:1.05rem; margin-bottom:0.5rem; color:var(--admin-text-heading);">${escapeHtml(p.titulo)}</h4>
            <p style="font-size:0.85rem; color:var(--admin-text-muted); margin-bottom:1rem; flex:1;">Cliente: ${escapeHtml(p.cliente_empresa || 'Corporativo')}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #EDF2F7; padding-top:0.75rem;">
              <span style="font-family:'JetBrains Mono'; font-size:0.75rem; color:var(--admin-text-muted);">Ordem: #${p.ordem}</span>
              <button class="btn btn-danger btn-sm" onclick="window.deletePalestra(${p.id})">Excluir</button>
            </div>
          </div>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--admin-danger);">Erro ao carregar palestras.</p>`;
    }
  }

  window.deletePalestra = async function (id) {
    if (!confirm('Deseja excluir esta palestra?')) return;
    try {
      await apiRequest(`/api/admin/palestras/${id}`, { method: 'DELETE' });
      showToast('Palestra removida com sucesso!');
      loadPalestras();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Cadastrar nova palestra
  document.getElementById('newPalestraForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('newPalestraTitulo').value.trim();
    const categoria = document.getElementById('newPalestraCategoria').value.trim();
    const cliente_empresa = document.getElementById('newPalestraCliente').value.trim();
    const imagem_url = document.getElementById('newPalestraImg').value.trim();
    const destaque = document.getElementById('newPalestraDestaque').checked;
    const ordem = parseInt(document.getElementById('newPalestraOrdem').value || '0', 10);

    try {
      await apiRequest('/api/admin/palestras', {
        method: 'POST',
        body: JSON.stringify({ titulo, categoria, cliente_empresa, imagem_url, destaque, ordem })
      });
      showToast('Palestra cadastrada com sucesso!');
      document.getElementById('newPalestraModal').classList.remove('is-open');
      e.target.reset();
      loadPalestras();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ---------- 4. MÓDULO DE VAGAS PCD ----------
  async function loadVagas() {
    const tbody = document.getElementById('vagasTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">Carregando vagas...</td></tr>`;

    try {
      const vagas = await apiRequest('/api/admin/vagas');
      if (vagas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">Nenhuma vaga cadastrada.</td></tr>`;
        return;
      }

      tbody.innerHTML = vagas.map(v => `
        <tr>
          <td><strong>${escapeHtml(v.titulo)}</strong></td>
          <td>${escapeHtml(v.empresa)}</td>
          <td>${escapeHtml(v.localizacao)} (${v.modalidade})</td>
          <td><span class="status-pill status-${v.ativo ? 'fechado' : 'arquivado'}">${v.ativo ? 'Ativa' : 'Pausada'}</span></td>
          <td>${formatDate(v.criado_em)}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="window.deleteVaga(${v.id})">Excluir</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--admin-danger);">Erro ao carregar vagas.</td></tr>`;
    }
  }

  window.deleteVaga = async function (id) {
    if (!confirm('Excluir esta oportunidade?')) return;
    try {
      await apiRequest(`/api/admin/vagas/${id}`, { method: 'DELETE' });
      showToast('Vaga removida com sucesso!');
      loadVagas();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  document.getElementById('newVagaForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('newVagaTitulo').value.trim();
    const empresa = document.getElementById('newVagaEmpresa').value.trim();
    const localizacao = document.getElementById('newVagaLocal').value.trim();
    const modalidade = document.getElementById('newVagaModalidade').value;
    const link_candidatura = document.getElementById('newVagaLink').value.trim();
    const descricao = document.getElementById('newVagaDescricao').value.trim();

    try {
      await apiRequest('/api/admin/vagas', {
        method: 'POST',
        body: JSON.stringify({ titulo, empresa, localizacao, modalidade, link_candidatura, descricao })
      });
      showToast('Vaga cadastrada com sucesso!');
      document.getElementById('newVagaModal').classList.remove('is-open');
      e.target.reset();
      loadVagas();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ---------- 5. CONFIGURAÇÕES GERAIS ----------
  async function loadConfig() {
    try {
      const configs = await apiRequest('/api/admin/config');
      document.getElementById('cfgWhatsapp').value = configs.whatsapp_comercial || '';
      document.getElementById('cfgEmail').value = configs.email_contato || '';
      document.getElementById('cfgAvisoTopo').value = configs.aviso_topo || '';
      document.getElementById('cfgTitulo').value = configs.site_titulo || '';
    } catch (err) {
      showToast('Erro ao carregar configurações', 'error');
    }
  }

  document.getElementById('siteConfigForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const configs = {
      whatsapp_comercial: document.getElementById('cfgWhatsapp').value.trim(),
      email_contato: document.getElementById('cfgEmail').value.trim(),
      aviso_topo: document.getElementById('cfgAvisoTopo').value.trim(),
      site_titulo: document.getElementById('cfgTitulo').value.trim()
    };

    try {
      await apiRequest('/api/admin/config', {
        method: 'POST',
        body: JSON.stringify(configs)
      });
      showToast('Configurações salvas no MySQL com sucesso!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ---------- 6. TROCAR SENHA ----------
  document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const senhaAtual = document.getElementById('pwdAtual').value;
    const novaSenha = document.getElementById('pwdNova').value;
    const confNova = document.getElementById('pwdConf').value;

    if (novaSenha !== confNova) {
      showToast('A nova senha e a confirmação não coincidem.', 'error');
      return;
    }

    try {
      await apiRequest('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ senhaAtual, novaSenha })
      });
      showToast('Senha alterada com sucesso!');
      e.target.reset();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ---------- MODAIS CLOSE LISTENERS ----------
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('is-open'));
    });
  });

  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-modal-open');
      document.getElementById(target)?.classList.add('is-open');
    });
  });

  // ---------- UTILS ----------
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  function cleanPhone(phone) {
    if (!phone) return '';
    let num = phone.replace(/\D/g, '');
    if (!num.startsWith('55') && num.length <= 11) num = '55' + num;
    return num;
  }

  function formatDate(isoStr) {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  }

  function formatStatus(status) {
    const map = {
      'novo': 'Novo',
      'em_contato': 'Em Contato',
      'proposta_enviada': 'Proposta',
      'fechado': 'Fechado',
      'arquivado': 'Arquivado'
    };
    return map[status] || status;
  }

  // Início
  checkAuth();
})();
