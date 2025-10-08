// /assets/js/main-admin.js
document.addEventListener('DOMContentLoaded', async () => {
  // --------- elementos
  const loginSection  = document.getElementById('loginSection');
  const panelSection  = document.getElementById('panelSection');
  const emailInput    = document.getElementById('admin_email');
  const passInput     = document.getElementById('admin_password');
  const btnLogin      = document.getElementById('btnLogin');
  const btnLogout     = document.getElementById('btnLogout');
  const btnRefresh    = document.getElementById('btnRefresh');

  const tabRegs       = document.getElementById('tabRegs');
  const tabDon        = document.getElementById('tabDon');
  const tabRegsContent= document.getElementById('tabRegsContent');
  const tabDonContent = document.getElementById('tabDonContent');

  const regsListEl    = document.getElementById('regsList');
  const regsStatsEl   = document.getElementById('regsStats');
  const filterEventEl = document.getElementById('filterEvent');
  const searchRegEl   = document.getElementById('searchReg');
  const btnExportCSV  = document.getElementById('btnExportCSV');
  const donListEl     = document.getElementById('donList');

  let allEvents = [];
  let allRegs   = [];
  let allDons   = [];

  // --------- helpers UI
  function showLogin() {
    loginSection.style.display = '';
    panelSection.style.display = 'none';
  }
  function showPanel() {
    loginSection.style.display = 'none';
    panelSection.style.display = '';
  }
  function setLoading(btn, isLoading) {
    if (!btn) return;
    btn.disabled = !!isLoading;
    btn.classList.toggle('loading', !!isLoading);
  }

  function renderRegsFilterOptions() {
    // Preenche o <select> com eventos
    if (!filterEventEl) return;
    const options = ['<option value="">Todos os eventos</option>']
      .concat(allEvents.map(ev => `<option value="${ev.id}">${ev.title} (${new Date(ev.event_date).toLocaleDateString('pt-BR')})</option>`));
    filterEventEl.innerHTML = options.join('');
  }

  function renderRegsList() {
    if (!regsListEl) return;
    // filtros
    let rows = [...allRegs];
    const q = (searchRegEl?.value || '').trim().toLowerCase();
    const fEvent = filterEventEl?.value || '';

    if (fEvent) rows = rows.filter(r => String(r.event_id) === String(fEvent));
    if (q) {
      rows = rows.filter(r =>
        (r.name||'').toLowerCase().includes(q) ||
        (r.email||'').toLowerCase().includes(q) ||
        (r.phone||'').toLowerCase().includes(q)
      );
    }

    if (!rows.length) {
      regsListEl.innerHTML = `<p class="muted">Nenhuma inscrição encontrada.</p>`;
      regsStatsEl.innerHTML = '';
      return;
    }

    // stats simples
    const total = rows.length;
    const uniqueEmails = new Set(rows.map(r => (r.email||'').toLowerCase())).size;
    const byEvent = rows.reduce((acc, r) => {
      const key = r.events?.title || '—';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const topEvent = Object.entries(byEvent).sort((a,b)=>b[1]-a[1])[0];

    regsStatsEl.innerHTML = `
      <div class="stat-card"><div class="stat-number">${total}</div><div class="stat-label">Inscrições</div></div>
      <div class="stat-card"><div class="stat-number">${uniqueEmails}</div><div class="stat-label">E-mails únicos</div></div>
      <div class="stat-card"><div class="stat-number">${topEvent ? `${topEvent[0]}: ${topEvent[1]}` : '—'}</div><div class="stat-label">Evento com mais inscritos</div></div>
    `;

    // lista
    regsListEl.innerHTML = rows.map(r => `
      <div class="email-item">
        <div class="email-info">
          <div class="email-name">${r.name} <span class="email-address">&lt;${r.email}&gt;</span></div>
          <div class="muted">
            ${r.phone ? 'Tel: ' + r.phone + ' • ' : ''}
            ${r.birth_date ? 'Nascimento: ' + new Date(r.birth_date).toLocaleDateString('pt-BR') + ' • ' : ''}
            ${r.gender ? 'Sexo: ' + r.gender : ''}
          </div>
          <div class="muted">Evento: <strong>${r.events?.title || '-'}</strong> — ${r.events?.event_date ? new Date(r.events.event_date).toLocaleDateString('pt-BR') : ''}</div>
          ${r.notes ? `<div class="muted">Obs: ${r.notes}</div>` : ''}
          <div class="muted">Inscrito em: ${r.created_at ? new Date(r.created_at).toLocaleString('pt-BR') : ''}</div>
        </div>
      </div>
    `).join('');
  }

  function renderDonations() {
    if (!donListEl) return;
    if (!allDons.length) {
      donListEl.innerHTML = `<p class="muted">Nenhuma doação encontrada.</p>`;
      return;
    }
    donListEl.innerHTML = allDons.map(d => `
      <div class="email-item">
        <div class="email-info">
          <div class="email-name">${d.donor_name || '—'} <span class="email-address">&lt;${d.donor_email || '—'}&gt;</span></div>
          <div class="muted">
            Valor: R$ ${Number(d.amount||0).toFixed(2)} • Tipo: ${d.donation_type||'-'} • Status: ${d.status||'-'}
          </div>
          <div class="muted">Data: ${d.donation_date ? new Date(d.donation_date).toLocaleDateString('pt-BR') : '—'}</div>
          <div class="muted">Criado em: ${d.created_at ? new Date(d.created_at).toLocaleString('pt-BR') : '—'}</div>
        </div>
      </div>
    `).join('');
  }

  function exportRegsCSV() {
    let rows = [...allRegs];
    const q = (searchRegEl?.value || '').trim().toLowerCase();
    const fEvent = filterEventEl?.value || '';
    if (fEvent) rows = rows.filter(r => String(r.event_id) === String(fEvent));
    if (q) rows = rows.filter(r =>
      (r.name||'').toLowerCase().includes(q) ||
      (r.email||'').toLowerCase().includes(q) ||
      (r.phone||'').toLowerCase().includes(q)
    );

    const header = ['evento','data_evento','nome','email','telefone','nascimento','sexo','obs','inscrito_em'];
    const lines = [header.join(';')];

    rows.forEach(r => {
      const evento = (r.events?.title || '').replace(/;/g, ',');
      const dataEv = r.events?.event_date ? new Date(r.events.event_date).toLocaleDateString('pt-BR') : '';
      const nome   = (r.name||'').replace(/;/g, ',');
      const email  = (r.email||'').replace(/;/g, ',');
      const tel    = (r.phone||'').replace(/;/g, ',');
      const nasc   = r.birth_date ? new Date(r.birth_date).toLocaleDateString('pt-BR') : '';
      const sexo   = (r.gender||'').replace(/;/g, ',');
      const obs    = (r.notes||'').replace(/;/g, ',').replace(/\r?\n/g,' ');
      const when   = r.created_at ? new Date(r.created_at).toLocaleString('pt-BR') : '';
      lines.push([evento, dataEv, nome, email, tel, nasc, sexo, obs, when].join(';'));
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'inscricoes.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // --------- carregamento painel
  async function loadPanel() {
    try {
      setLoading(btnRefresh, true);
      // carrega eventos (para filtro), inscrições e doações
      allEvents = await API.adminListEvents();
      renderRegsFilterOptions();

      allRegs   = await API.adminListRegistrations();
      renderRegsList();

      allDons   = await API.adminListDonations();
      renderDonations();
    } catch (e) {
      console.error('[Admin] Falha ao carregar painel:', e);
      alert('Não foi possível carregar os dados administrativos. Verifique suas permissões e o console.');
    } finally {
      setLoading(btnRefresh, false);
    }
  }

  // --------- sessão inicial
  try {
    const session = await API.getSession();
    if (session) {
      showPanel();
      await loadPanel();
    } else {
      showLogin();
    }
  } catch (e) {
    console.error('[Admin] getSession error:', e);
    showLogin();
  }

  // --------- eventos UI
  btnLogin?.addEventListener('click', async () => {
    const email = emailInput?.value?.trim();
    const pass  = passInput?.value?.trim();
    if (!email || !pass) return alert('Preencha e-mail e senha.');
    try {
      setLoading(btnLogin, true);
      await API.signIn(email, pass);
      showPanel();
      await loadPanel();
    } catch (e) {
      console.error('[Admin] Login error:', e);
      alert(e?.message || 'Não foi possível autenticar. Verifique usuário/senha e se o e-mail está confirmado no Supabase.');
    } finally {
      setLoading(btnLogin, false);
    }
  });

  btnLogout?.addEventListener('click', async () => {
    try {
      await API.signOut();
    } catch (e) {
      console.error('[Admin] Logout error:', e);
    } finally {
      showLogin();
    }
  });

  btnRefresh?.addEventListener('click', loadPanel);
  filterEventEl?.addEventListener('change', renderRegsList);
  searchRegEl?.addEventListener('input', renderRegsList);
  btnExportCSV?.addEventListener('click', exportRegsCSV);

  // Tabs
  function activateTab(key) {
    const isRegs = key === 'regs';
    tabRegs.classList.toggle('active', isRegs);
    tabDon.classList.toggle('active', !isRegs);
    tabRegsContent.classList.toggle('active', isRegs);
    tabDonContent.classList.toggle('active', !isRegs);
  }
  tabRegs?.addEventListener('click', () => activateTab('regs'));
  tabDon?.addEventListener('click',  () => activateTab('don'));
});
