// /assets/js/main-admin.js
document.addEventListener('DOMContentLoaded', async () => {
  // --------- elementos
  const loginSection   = document.getElementById('loginSection');
  const panelSection   = document.getElementById('panelSection');
  const emailInput     = document.getElementById('admin_email');
  const passInput      = document.getElementById('admin_password');
  const btnLogin       = document.getElementById('btnLogin');
  const btnLogout      = document.getElementById('btnLogout');
  const btnRefresh     = document.getElementById('btnRefresh');

  const tabRegs        = document.getElementById('tabRegs');
  const tabDon         = document.getElementById('tabDon');
  const tabEv          = document.getElementById('tabEv');
  const tabRegsContent = document.getElementById('tabRegsContent');
  const tabDonContent  = document.getElementById('tabDonContent');
  const tabEvContent   = document.getElementById('tabEvContent');

  const regsListEl     = document.getElementById('regsList');
  const regsStatsEl    = document.getElementById('regsStats');
  const filterEventEl  = document.getElementById('filterEvent');
  const searchRegEl    = document.getElementById('searchReg');
  const btnExportCSV   = document.getElementById('btnExportCSV');
  const donListEl      = document.getElementById('donList');

  // Eventos (gerenciar)
  const evForm         = document.getElementById('evForm');
  const evListEl       = document.getElementById('evList');

  // --------- estado
  let allEvents      = []; // para filtro de inscrições
  let allRegs        = [];
  let allDons        = [];
  let allEventsFull  = []; // lista completa para gerenciar (aba Eventos)

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

  // --------- Inscrições
  function renderRegsFilterOptions() {
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

  // --------- Doações
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

  // --------- Eventos (gerenciar)
  function renderAdminEvents() {
    if (!evListEl) return;
    if (!allEventsFull.length) {
      evListEl.innerHTML = `<p class="muted">Nenhum evento cadastrado.</p>`;
      return;
    }
    evListEl.innerHTML = allEventsFull.map(e => {
      const d  = e.event_date ? new Date(e.event_date).toLocaleDateString('pt-BR') : '';
      const t  = e.event_time ? String(e.event_time).slice(0,5) : '';
      const end= e.end_time ? String(e.end_time).slice(0,5) : '';
      const deadline = e.registration_deadline ? new Date(e.registration_deadline).toLocaleDateString('pt-BR') : '—';
      return `
        <div class="email-item" data-id="${e.id}">
          <div class="email-info">
            <div class="email-name"><strong>${e.title}</strong> — ${d} ${t ? `• ${t}${end? '–'+end : ''}` : ''}</div>
            <div class="muted">${e.location || '—'}</div>
            <div class="muted">Inscrição: ${e.requires_registration ? 'Sim' : 'Não'} • Prazo: ${deadline} • Vagas: ${e.max_participants ?? '—'}</div>
            ${e.description ? `<div class="muted">${e.description}</div>` : ''}
            <div class="muted">Ativo: ${e.is_active ? 'Sim' : 'Não'}</div>
          </div>
          <div class="email-actions">
            <button class="btn danger btn-del-event"><i class="fas fa-trash"></i> Excluir</button>
          </div>
        </div>
      `;
    }).join('');
  }

  async function loadAdminEvents() {
    try {
      allEventsFull = await API.adminListAllEvents();
      renderAdminEvents();
    } catch (err) {
      console.error('[Admin] adminListAllEvents erro:', err);
      evListEl.innerHTML = `<p class="muted">Não foi possível carregar os eventos. Verifique permissões de admin e o console.</p>`;
    }
  }

  // --------- carregamento painel
  async function loadPanel() {
    try {
      setLoading(btnRefresh, true);
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
    try { await API.signOut(); }
    catch (e) { console.error('[Admin] Logout error:', e); }
    finally { showLogin(); }
  });

  btnRefresh?.addEventListener('click', loadPanel);
  filterEventEl?.addEventListener('change', renderRegsList);
  searchRegEl?.addEventListener('input', renderRegsList);
  btnExportCSV?.addEventListener('click', exportRegsCSV);

  // --------- tabs
  function activateTab(key) {
    const isRegs = key === 'regs';
    const isDon  = key === 'don';
    const isEv   = key === 'ev';

    tabRegs?.classList.toggle('active', isRegs);
    tabDon?.classList.toggle('active', isDon);
    tabEv?.classList.toggle('active',  isEv);

    tabRegsContent?.classList.toggle('active', isRegs);
    tabDonContent?.classList.toggle('active', isDon);
    tabEvContent?.classList.toggle('active',  isEv);

    if (isEv) {
      // carrega lista de eventos ao abrir a aba
      loadAdminEvents();
    }
  }
  tabRegs?.addEventListener('click', () => activateTab('regs'));
  tabDon ?.addEventListener('click', () => activateTab('don'));
  tabEv  ?.addEventListener('click', () => activateTab('ev'));

  // --------- criar novo evento
  evForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title  = document.getElementById('ev_title')?.value?.trim();
    const date   = document.getElementById('ev_date')?.value || null;
    const time   = document.getElementById('ev_time')?.value || null;
    const end    = document.getElementById('ev_end_time')?.value || null;
    const loc    = document.getElementById('ev_location')?.value?.trim() || null;
    const desc   = document.getElementById('ev_desc')?.value?.trim() || null;
    const active = document.getElementById('ev_active')?.checked || false;
    const reqReg = document.getElementById('ev_requires_reg')?.checked || false;
    const dl     = document.getElementById('ev_deadline')?.value || null;
    const maxP   = document.getElementById('ev_max')?.value ? Number(document.getElementById('ev_max').value) : null;

    if (!title || !date) return alert('Título e data são obrigatórios.');

    try {
      const payload = {
        title: title,
        event_date: date,
        event_time: time || null,
        end_time: end || null,
        location: loc,
        description: desc,
        is_active: active,
        requires_registration: reqReg,
        registration_deadline: dl || null,
        max_participants: maxP
      };
      await API.adminCreateEvent(payload);
      alert('Evento criado!');
      evForm.reset();
      await loadAdminEvents(); // recarrega a listagem
      // também atualiza filtro de inscrições
      allEvents = await API.adminListEvents();
      renderRegsFilterOptions();
    } catch (err) {
      console.error('[Admin] Criar evento erro:', err);
      alert(err?.message || 'Falha ao criar evento.');
    }
  });

  // --------- excluir evento (delegação)
  evListEl?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-del-event');
    if (!btn) return;
    const host = btn.closest('.email-item');
    const id = host?.dataset?.id;
    if (!id) return;
    if (!confirm('Excluir este evento? Esta ação é irreversível.')) return;

    try {
      await API.adminDeleteEvent(Number(id));
      // remove da lista em memória e re-renderiza
      allEventsFull = allEventsFull.filter(ev => String(ev.id) !== String(id));
      renderAdminEvents();
      alert('Evento excluído.');
      // atualiza filtro de inscrições também
      allEvents = await API.adminListEvents();
      renderRegsFilterOptions();
    } catch (err) {
      console.error('[Admin] Excluir evento erro:', err);
      alert(err?.message || 'Falha ao excluir. Verifique se não há inscrições vinculadas (restrições) ou suas permissões.');
    }
  });
});
