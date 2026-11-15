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
          body: JSON.stringify({ usuario: email, email, senha })
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
        'pageAnalytics': 'Estatísticas de Tráfego & Analytics',
        'pageLeads': 'Gestão de Leads & Oportunidades',
        'pagePalestras': 'Palestras & Eventos',
        'pageVagas': 'Vagas PcD Cadastradas',
        'pageDepoimentos': 'Depoimentos & Casos de Sucesso',
        'pageBlog': 'Artigos & Notícias PcD',
        'pageBroadcast': 'Alerta de Topo (Broadcast Bar)',
        'pageMediakit': 'Mídia Kit & Propostas Comerciais',
        'pageUsers': 'Usuários & Membros da Equipe',
        'pageAudit': 'Auditoria & Logs do Sistema',
        'pageConfig': 'Configurações Gerais & Backup',
        'pageSecurity': 'Segurança & Senha'
      };
      document.getElementById('topbarPageTitle').textContent = pageNames[targetPage] || 'Painel Administrativo';

      // Carrega dados da aba selecionada
      if (targetPage === 'pageOverview') loadDashboardData();
      if (targetPage === 'pageAnalytics') loadAnalytics();
      if (targetPage === 'pageLeads') loadLeads();
      if (targetPage === 'pagePalestras') loadPalestras();
      if (targetPage === 'pageVagas') loadVagas();
      if (targetPage === 'pageDepoimentos') loadDepoimentos();
      if (targetPage === 'pageBlog') loadArtigos();
      if (targetPage === 'pageBroadcast') loadBroadcastConfig();
      if (targetPage === 'pageUsers') loadUsers();
      if (targetPage === 'pageAudit') loadAuditLogs();
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
      if (document.getElementById('metricVisitas')) document.getElementById('metricVisitas').textContent = stats.totalVisitas || 0;
      if (document.getElementById('metricDepoimentos')) document.getElementById('metricDepoimentos').textContent = stats.totalDepoimentos || 0;
      if (document.getElementById('metricArtigos')) document.getElementById('metricArtigos').textContent = stats.totalArtigos || 0;
      if (document.getElementById('metricUsuarios')) document.getElementById('metricUsuarios').textContent = stats.totalUsuarios || 0;

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
      if (document.getElementById('cfgLinkedin')) document.getElementById('cfgLinkedin').value = configs.social_linkedin || '';
      if (document.getElementById('cfgInstagram')) document.getElementById('cfgInstagram').value = configs.social_instagram || '';
      if (document.getElementById('cfgYoutube')) document.getElementById('cfgYoutube').value = configs.social_youtube || '';
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
      site_titulo: document.getElementById('cfgTitulo').value.trim(),
      social_linkedin: document.getElementById('cfgLinkedin')?.value.trim() || '',
      social_instagram: document.getElementById('cfgInstagram')?.value.trim() || '',
      social_youtube: document.getElementById('cfgYoutube')?.value.trim() || ''
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

  // ---------- 7. GESTÃO DE USUÁRIOS E PERMISSÕES ----------
  let allUsersCache = [];

  function getRoleBadge(role) {
    const r = (role || 'moderador').toLowerCase();
    switch (r) {
      case 'admin':
        return `<span class="role-badge role-admin">Administrador</span>`;
      case 'moderador':
        return `<span class="role-badge role-moderador">Moderador</span>`;
      case 'consultor':
        return `<span class="role-badge role-consultor">Consultor PcD</span>`;
      case 'editor':
        return `<span class="role-badge role-editor">Editor</span>`;
      default:
        return `<span class="role-badge role-moderador">${escapeHtml(role)}</span>`;
    }
  }

  async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;">Carregando membros da equipe...</td></tr>`;

    try {
      const users = await apiRequest('/api/admin/users');
      allUsersCache = users || [];

      if (!users || users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">Nenhum usuário cadastrado.</td></tr>`;
        return;
      }

      tbody.innerHTML = users.map(u => {
        const isSelf = currentUser && currentUser.id === u.id;
        const isSuperAdmin = u.id === 1;

        return `
          <tr>
            <td>
              <div style="font-weight:700; color:var(--admin-text-heading);">${escapeHtml(u.nome)}</div>
              <div style="font-size:0.8rem; color:var(--admin-text-muted); font-family:'JetBrains Mono', monospace;">@${escapeHtml(u.username)}</div>
            </td>
            <td><a href="mailto:${escapeHtml(u.email)}" style="color:var(--admin-blue-600); text-decoration:none;">${escapeHtml(u.email)}</a></td>
            <td>${getRoleBadge(u.role)}</td>
            <td>${escapeHtml(u.cargo || '—')}</td>
            <td>
              <span class="status-pill status-${u.ativo ? 'fechado' : 'arquivado'}">
                ${u.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </td>
            <td style="font-size:0.85rem; color:var(--admin-text-muted);">${formatDate(u.ultimo_login)}</td>
            <td style="text-align:right; white-space:nowrap;">
              <button class="btn btn-outline btn-sm" onclick="window.openEditUser(${u.id})" style="margin-right:0.35rem;">
                Editar
              </button>
              ${!isSuperAdmin && !isSelf ? `
                <button class="btn btn-danger btn-sm" onclick="window.deleteUser(${u.id}, '${escapeHtml(u.nome).replace(/'/g, "\\'")}')">
                  Excluir
                </button>
              ` : `
                <span style="font-size:0.75rem; color:var(--admin-text-muted); font-style:italic;">${isSuperAdmin ? 'Principal' : 'Você'}</span>
              `}
            </td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--admin-danger);">Erro ao carregar lista de usuários.</td></tr>`;
    }
  }

  // Abrir modal de edição com dados populados
  window.openEditUser = function(id) {
    const user = allUsersCache.find(u => u.id === id);
    if (!user) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserName').value = user.nome || '';
    document.getElementById('editUserUsername').value = user.username || '';
    document.getElementById('editUserEmail').value = user.email || '';
    document.getElementById('editUserRole').value = user.role || 'moderador';
    document.getElementById('editUserCargo').value = user.cargo || '';
    document.getElementById('editUserStatus').value = user.ativo ? '1' : '0';
    document.getElementById('editUserNewPassword').value = '';

    document.getElementById('editUserModal')?.classList.add('is-open');
  };

  // Excluir usuário
  window.deleteUser = async function(id, nome) {
    if (!confirm(`Tem certeza que deseja remover o usuário "${nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' });
      showToast('Usuário removido com sucesso!');
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Submit Criar Novo Usuário
  document.getElementById('newUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('newUserName').value.trim();
    const username = document.getElementById('newUserUsername').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const role = document.getElementById('newUserRole').value;
    const cargo = document.getElementById('newUserCargo').value.trim();
    const senha = document.getElementById('newUserPassword').value;

    if (!nome || !username || !email || !senha) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    try {
      await apiRequest('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ nome, username, email, role, cargo, senha })
      });
      showToast('Usuário cadastrado com sucesso!');
      document.getElementById('newUserModal')?.classList.remove('is-open');
      e.target.reset();
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Submit Editar Usuário
  document.getElementById('editUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editUserId').value;
    const nome = document.getElementById('editUserName').value.trim();
    const username = document.getElementById('editUserUsername').value.trim();
    const email = document.getElementById('editUserEmail').value.trim();
    const role = document.getElementById('editUserRole').value;
    const cargo = document.getElementById('editUserCargo').value.trim();
    const ativo = document.getElementById('editUserStatus').value === '1';
    const novaSenha = document.getElementById('editUserNewPassword').value;

    const payload = { nome, username, email, role, cargo, ativo };
    if (novaSenha && novaSenha.length >= 6) {
      payload.novaSenha = novaSenha;
    }

    try {
      await apiRequest(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Usuário atualizado com sucesso!');
      document.getElementById('editUserModal')?.classList.remove('is-open');
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ---------- 8. ANALYTICS & TRÁFEGO ----------
  window.loadAnalytics = async function() {
    try {
      const data = await apiRequest('/api/admin/analytics');
      const stats = await apiRequest('/api/admin/stats');

      document.getElementById('analyticsHoje').textContent = data.visitasHoje || 0;
      document.getElementById('analyticsMes').textContent = data.visitasMes || 0;
      document.getElementById('analyticsTotal').textContent = data.totalVisitas || 0;

      const taxa = data.totalVisitas > 0 ? ((stats.totalLeads / data.totalVisitas) * 100).toFixed(1) : 0;
      document.getElementById('analyticsTaxaConversao').textContent = `${taxa}%`;

      // Render Canais de Origem
      const origemContainer = document.getElementById('analyticsOrigemList');
      if (origemContainer && data.porOrigem) {
        const total = data.totalVisitas || 1;
        origemContainer.innerHTML = data.porOrigem.map(item => {
          const pct = Math.round((item.total / total) * 100);
          return `
            <div class="progress-item">
              <div class="progress-header">
                <span>${escapeHtml(item.origem || 'Direto')}</span>
                <span>${item.total} acessos (${pct}%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width:${pct}%;"></div>
              </div>
            </div>
          `;
        }).join('') || '<p style="color:var(--admin-text-muted);">Sem dados de origem.</p>';
      }

      // Render Dispositivos
      const dispContainer = document.getElementById('analyticsDispositivoList');
      if (dispContainer && data.porDispositivo) {
        const total = data.totalVisitas || 1;
        dispContainer.innerHTML = data.porDispositivo.map(item => {
          const pct = Math.round((item.total / total) * 100);
          return `
            <div class="progress-item">
              <div class="progress-header">
                <span>${escapeHtml(item.dispositivo || 'Desktop')}</span>
                <span>${item.total} (${pct}%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill progress-fill-alt" style="width:${pct}%;"></div>
              </div>
            </div>
          `;
        }).join('') || '<p style="color:var(--admin-text-muted);">Sem dados de dispositivos.</p>';
      }

      // Render Páginas
      const pagContainer = document.getElementById('analyticsPaginasList');
      if (pagContainer && data.porPagina) {
        const total = data.totalVisitas || 1;
        pagContainer.innerHTML = data.porPagina.map(item => {
          const pct = Math.round((item.total / total) * 100);
          return `
            <div class="progress-item">
              <div class="progress-header">
                <span><code>${escapeHtml(item.pagina || '/')}</code></span>
                <span>${item.total} views (${pct}%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill progress-fill-purple" style="width:${pct}%;"></div>
              </div>
            </div>
          `;
        }).join('') || '<p style="color:var(--admin-text-muted);">Sem dados de páginas.</p>';
      }

      // Render Estados
      const ufContainer = document.getElementById('analyticsEstadosList');
      if (ufContainer && data.porEstado) {
        const total = data.totalVisitas || 1;
        ufContainer.innerHTML = data.porEstado.map(item => {
          const pct = Math.round((item.total / total) * 100);
          return `
            <div class="progress-item">
              <div class="progress-header">
                <span>Estado: <strong>${escapeHtml(item.estado || 'SP')}</strong></span>
                <span>${item.total} visitantes</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill progress-fill-amber" style="width:${pct}%;"></div>
              </div>
            </div>
          `;
        }).join('') || '<p style="color:var(--admin-text-muted);">Sem dados de estados.</p>';
      }

    } catch (err) {
      console.error('Erro ao carregar analytics:', err);
    }
  };

  // ---------- 9. DEPOIMENTOS & CASOS DE SUCESSO ----------
  let allDepoimentosCache = [];

  window.loadDepoimentos = async function() {
    const container = document.getElementById('depoimentosGrid');
    if (!container) return;
    container.innerHTML = `<p style="text-align:center; padding:2rem; grid-column:1/-1;">Carregando depoimentos...</p>`;

    try {
      const deps = await apiRequest('/api/admin/depoimentos');
      allDepoimentosCache = deps || [];

      if (!deps || deps.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--admin-text-muted); grid-column:1/-1;">Nenhum depoimento cadastrado.</p>`;
        return;
      }

      container.innerHTML = deps.map(d => {
        const stars = '⭐'.repeat(Math.max(1, Math.min(5, d.estrelas || 5)));
        return `
          <div style="background:#FFF; border:1px solid var(--admin-border); border-radius:var(--admin-radius-lg); padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; box-shadow:var(--admin-shadow-sm);">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                <div style="font-size:0.95rem;">${stars}</div>
                <div style="display:flex; gap:0.35rem;">
                  <span class="status-pill status-${d.ativo ? 'fechado' : 'arquivado'}">${d.ativo ? 'Ativo' : 'Oculto'}</span>
                  ${d.destaque ? '<span class="status-pill status-em_contato">Destaque</span>' : ''}
                </div>
              </div>
              <p style="font-size:0.875rem; color:var(--admin-text-main); line-height:1.5; margin-bottom:1rem; font-style:italic;">
                "${escapeHtml(d.texto)}"
              </p>
            </div>
            <div style="border-top:1px solid #EDF2F7; padding-top:0.85rem; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="font-size:0.9rem; color:var(--admin-text-heading); display:block;">${escapeHtml(d.nome)}</strong>
                <small style="color:var(--admin-text-muted); font-size:0.75rem;">${escapeHtml(d.cargo_empresa)}</small>
              </div>
              <div style="display:flex; gap:0.35rem;">
                <button class="btn btn-outline btn-sm" onclick="window.openEditDepoimento(${d.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="window.deleteDepoimento(${d.id})">Excluir</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      container.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--admin-danger); grid-column:1/-1;">Erro ao carregar depoimentos.</p>`;
    }
  };

  window.openEditDepoimento = function(id) {
    const dep = allDepoimentosCache.find(d => d.id === id);
    if (!dep) return;

    document.getElementById('editDepId').value = dep.id;
    document.getElementById('editDepNome').value = dep.nome || '';
    document.getElementById('editDepCargo').value = dep.cargo_empresa || '';
    document.getElementById('editDepEstrelas').value = String(dep.estrelas || 5);
    document.getElementById('editDepFoto').value = dep.foto_url || '';
    document.getElementById('editDepTexto').value = dep.texto || '';
    document.getElementById('editDepAtivo').value = dep.ativo ? '1' : '0';
    document.getElementById('editDepDestaque').checked = Boolean(dep.destaque);

    document.getElementById('editDepoimentoModal')?.classList.add('is-open');
  };

  window.deleteDepoimento = async function(id) {
    if (!confirm('Tem certeza que deseja excluir este depoimento?')) return;
    try {
      await apiRequest(`/api/admin/depoimentos/${id}`, { method: 'DELETE' });
      showToast('Depoimento removido com sucesso!');
      loadDepoimentos();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  document.getElementById('newDepoimentoForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('newDepNome').value.trim();
    const cargo_empresa = document.getElementById('newDepCargo').value.trim();
    const estrelas = parseInt(document.getElementById('newDepEstrelas').value || '5', 10);
    const foto_url = document.getElementById('newDepFoto').value.trim();
    const texto = document.getElementById('newDepTexto').value.trim();
    const destaque = document.getElementById('newDepDestaque').checked;

    try {
      await apiRequest('/api/admin/depoimentos', {
        method: 'POST',
        body: JSON.stringify({ nome, cargo_empresa, estrelas, foto_url, texto, destaque })
      });
      showToast('Depoimento cadastrado com sucesso!');
      document.getElementById('newDepoimentoModal')?.classList.remove('is-open');
      e.target.reset();
      loadDepoimentos();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('editDepoimentoForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editDepId').value;
    const nome = document.getElementById('editDepNome').value.trim();
    const cargo_empresa = document.getElementById('editDepCargo').value.trim();
    const estrelas = parseInt(document.getElementById('editDepEstrelas').value || '5', 10);
    const foto_url = document.getElementById('editDepFoto').value.trim();
    const texto = document.getElementById('editDepTexto').value.trim();
    const ativo = document.getElementById('editDepAtivo').value === '1';
    const destaque = document.getElementById('editDepDestaque').checked;

    try {
      await apiRequest(`/api/admin/depoimentos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nome, cargo_empresa, estrelas, foto_url, texto, ativo, destaque })
      });
      showToast('Depoimento atualizado com sucesso!');
      document.getElementById('editDepoimentoModal')?.classList.remove('is-open');
      loadDepoimentos();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ---------- 10. ARTIGOS & BLOG PCD ----------
  let allArtigosCache = [];

  window.loadArtigos = async function() {
    const tbody = document.getElementById('artigosTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;">Carregando artigos...</td></tr>`;

    try {
      const arts = await apiRequest('/api/admin/artigos');
      allArtigosCache = arts || [];

      if (!arts || arts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">Nenhum artigo cadastrado.</td></tr>`;
        return;
      }

      tbody.innerHTML = arts.map(a => `
        <tr>
          <td>
            <strong style="color:var(--admin-text-heading); display:block;">${escapeHtml(a.titulo)}</strong>
            <small style="color:var(--admin-text-muted); font-size:0.75rem;">/${escapeHtml(a.slug || '')}</small>
          </td>
          <td><span class="role-badge role-moderador">${escapeHtml(a.categoria || 'Geral')}</span></td>
          <td>${escapeHtml(a.autor || 'Moisés Souza')}</td>
          <td><strong>${a.visualizacoes || 0}</strong> views</td>
          <td><span class="status-pill status-${a.status === 'publicado' ? 'fechado' : 'arquivado'}">${a.status === 'publicado' ? 'Publicado' : 'Rascunho'}</span></td>
          <td style="font-size:0.8rem; color:var(--admin-text-muted);">${formatDate(a.criado_em)}</td>
          <td style="text-align:right; white-space:nowrap;">
            <button class="btn btn-outline btn-sm" onclick="window.openEditArtigo(${a.id})" style="margin-right:0.35rem;">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="window.deleteArtigo(${a.id})">Excluir</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--admin-danger);">Erro ao carregar artigos.</td></tr>`;
    }
  };

  window.openEditArtigo = function(id) {
    const art = allArtigosCache.find(a => a.id === id);
    if (!art) return;

    document.getElementById('editArtId').value = art.id;
    document.getElementById('editArtTitulo').value = art.titulo || '';
    document.getElementById('editArtCategoria').value = art.categoria || 'Legislação & Cotas';
    document.getElementById('editArtStatus').value = art.status || 'publicado';
    document.getElementById('editArtResumo').value = art.resumo || '';
    document.getElementById('editArtImg').value = art.imagem_url || '';
    document.getElementById('editArtConteudo').value = art.conteudo || '';

    document.getElementById('editArtigoModal')?.classList.add('is-open');
  };

  window.deleteArtigo = async function(id) {
    if (!confirm('Tem certeza que deseja excluir esta publicação?')) return;
    try {
      await apiRequest(`/api/admin/artigos/${id}`, { method: 'DELETE' });
      showToast('Artigo excluído com sucesso!');
      loadArtigos();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  document.getElementById('newArtigoForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('newArtTitulo').value.trim();
    const categoria = document.getElementById('newArtCategoria').value;
    const status = document.getElementById('newArtStatus').value;
    const resumo = document.getElementById('newArtResumo').value.trim();
    const imagem_url = document.getElementById('newArtImg').value.trim();
    const conteudo = document.getElementById('newArtConteudo').value.trim();

    try {
      await apiRequest('/api/admin/artigos', {
        method: 'POST',
        body: JSON.stringify({ titulo, categoria, status, resumo, imagem_url, conteudo })
      });
      showToast('Artigo publicado com sucesso!');
      document.getElementById('newArtigoModal')?.classList.remove('is-open');
      e.target.reset();
      loadArtigos();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('editArtigoForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editArtId').value;
    const titulo = document.getElementById('editArtTitulo').value.trim();
    const categoria = document.getElementById('editArtCategoria').value;
    const status = document.getElementById('editArtStatus').value;
    const resumo = document.getElementById('editArtResumo').value.trim();
    const imagem_url = document.getElementById('editArtImg').value.trim();
    const conteudo = document.getElementById('editArtConteudo').value.trim();

    try {
      await apiRequest(`/api/admin/artigos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ titulo, categoria, status, resumo, imagem_url, conteudo })
      });
      showToast('Artigo atualizado!');
      document.getElementById('editArtigoModal')?.classList.remove('is-open');
      loadArtigos();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ---------- 11. ALERTA TOPO (BROADCAST) ----------
  window.loadBroadcastConfig = async function() {
    try {
      const cfg = await apiRequest('/api/admin/config');
      const ativo = cfg.alerta_ativo === '1';
      const texto = cfg.alerta_texto || '🚀 Inscrições Abertas para o Programa de Capacitação e Liderança PcD 2026!';
      const botao = cfg.alerta_botao || 'Solicitar Proposta';
      const link = cfg.alerta_link || '#contato';
      const cor = cfg.alerta_cor || 'azul';

      document.getElementById('cfgAlertaAtivo').checked = ativo;
      document.getElementById('cfgAlertaTexto').value = texto;
      document.getElementById('cfgAlertaBotao').value = botao;
      document.getElementById('cfgAlertaLink').value = link;
      document.getElementById('cfgAlertaCor').value = cor;

      updateBroadcastPreview();
    } catch (err) {
      console.error('Erro ao carregar broadcast config:', err);
    }
  };

  function updateBroadcastPreview() {
    const texto = document.getElementById('cfgAlertaTexto')?.value || 'Texto do alerta de exemplo...';
    const botao = document.getElementById('cfgAlertaBotao')?.value || 'Saiba Mais';
    const cor = document.getElementById('cfgAlertaCor')?.value || 'azul';
    const bar = document.getElementById('broadcastPreviewBar');
    const txtSpan = document.getElementById('broadcastPreviewText');
    const btnSpan = document.getElementById('broadcastPreviewBtn');

    if (txtSpan) txtSpan.textContent = texto;
    if (btnSpan) btnSpan.textContent = `${botao} →`;
    if (bar) {
      bar.className = `broadcast-preview-bar broadcast-${cor}`;
    }
  }

  ['cfgAlertaTexto', 'cfgAlertaBotao', 'cfgAlertaCor'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateBroadcastPreview);
  });

  document.getElementById('broadcastConfigForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      alerta_ativo: document.getElementById('cfgAlertaAtivo').checked ? '1' : '0',
      alerta_texto: document.getElementById('cfgAlertaTexto').value.trim(),
      alerta_botao: document.getElementById('cfgAlertaBotao').value.trim(),
      alerta_link: document.getElementById('cfgAlertaLink').value.trim(),
      alerta_cor: document.getElementById('cfgAlertaCor').value
    };

    try {
      await apiRequest('/api/admin/config', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Barra de alerta atualizada no site!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ---------- 12. CLIPBOARD & EXPORTAÇÃO ----------
  window.copyTextToClipboard = function(btn, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.innerText || el.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = btn.textContent;
      btn.textContent = '✓ Copiado!';
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-outline');
      showToast('Modelo de mensagem copiado para a área de transferência!');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
      }, 2500);
    }).catch(() => {
      showToast('Erro ao copiar texto.', 'error');
    });
  };

  window.exportData = function(type) {
    if (!currentToken) return;
    showToast(`Iniciando download de ${type}...`, 'info');
    fetch(`/api/admin/export/${type}`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    })
    .then(async res => {
      if (!res.ok) throw new Error('Falha ao exportar dados');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'backup' ? 'backup_jtpcd.json' : `${type}_jtpcd.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Download concluído com sucesso!');
    })
    .catch(err => {
      showToast(err.message, 'error');
    });
  };

  // ---------- 13. AUDITORIA & LOGS ----------
  let allAuditLogsCache = [];

  window.loadAuditLogs = async function() {
    const tbody = document.getElementById('auditLogsTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">Carregando logs de auditoria...</td></tr>`;

    try {
      const logs = await apiRequest('/api/admin/audit-logs');
      allAuditLogsCache = logs || [];
      renderAuditLogsTable(allAuditLogsCache);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--admin-danger);">Erro ao carregar logs.</td></tr>`;
    }
  };

  function renderAuditLogsTable(logs) {
    const tbody = document.getElementById('auditLogsTableBody');
    if (!tbody) return;

    if (!logs || logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">Nenhum log registrado ainda.</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td style="font-size:0.8rem; color:var(--admin-text-muted); font-family:'JetBrains Mono',monospace;">${formatDate(l.criado_em)}</td>
        <td><strong>@${escapeHtml(l.usuario)}</strong></td>
        <td><span class="role-badge role-admin">${escapeHtml(l.modulo || 'Sistema')}</span></td>
        <td><strong>${escapeHtml(l.acao)}</strong></td>
        <td style="font-size:0.85rem; color:var(--admin-text-main);">${escapeHtml(l.detalhes || '—')}</td>
        <td style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:var(--admin-text-muted);">${escapeHtml(l.ip || '127.0.0.1')}</td>
      </tr>
    `).join('');
  }

  document.getElementById('auditSearchInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) {
      renderAuditLogsTable(allAuditLogsCache);
      return;
    }
    const filtered = allAuditLogsCache.filter(l =>
      (l.usuario && l.usuario.toLowerCase().includes(term)) ||
      (l.acao && l.acao.toLowerCase().includes(term)) ||
      (l.modulo && l.modulo.toLowerCase().includes(term)) ||
      (l.detalhes && l.detalhes.toLowerCase().includes(term))
    );
    renderAuditLogsTable(filtered);
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

  // ---------- TOGGLE VISIBILIDADE DE SENHA ----------
  document.querySelectorAll('[data-toggle-password]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const inputId = btn.getAttribute('data-toggle-password');
      const input = document.getElementById(inputId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      const eyeShow = btn.querySelector('.eye-show');
      const eyeHide = btn.querySelector('.eye-hide');

      if (eyeShow && eyeHide) {
        eyeShow.style.display = isPassword ? 'none' : 'block';
        eyeHide.style.display = isPassword ? 'block' : 'none';
      }

      btn.setAttribute('title', isPassword ? 'Ocultar senha' : 'Visualizar senha');
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
