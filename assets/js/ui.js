// /assets/js/ui.js
;(() => {
  // Utilitários
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const setText = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.textContent = v; };
  const setHTML = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.innerHTML = v; };

  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  };
  const fmtTime = (t) => (t ? t.toString().slice(0,5) : '');

  const nl2lis = (txt='') =>
    txt.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)
      .map(s=>`<li><i class="fas fa-clock"></i> ${s}</li>`).join('');

  // ==========================
  // SITE CONFIG
  // ==========================
  function renderSiteConfig(cfg){
    if (!cfg) return;

    // Hero / Address
    setText('heroTitle',  cfg.hero_title);
    setText('addressText',cfg.address);

    // Sobre
    setText('aboutTitle',    cfg.about_title);
    setText('aboutSubtitle', cfg.about_subtitle);
    setText('aboutText1',    cfg.about_text1);
    setText('aboutText2',    cfg.about_text2);
    setText('aboutText3',    cfg.about_text3);

    // Seções
    setText('ministriesTitle',    cfg.ministries_title);
    setText('ministriesSubtitle', cfg.ministries_subtitle);

    setText('sermonsTitle',    cfg.sermons_title);
    setText('sermonsSubtitle', cfg.sermons_subtitle);

    setText('contactTitle',    cfg.contact_title);
    setText('contactSubtitle', cfg.contact_subtitle);

    setText('donationTitle',          cfg.donation_title);
    setText('donationSubtitle',       cfg.donation_subtitle);
    setText('donationText',           cfg.donation_text);
    setText('pixDescription',         cfg.pix_description);
    setText('presentialDonationText', cfg.presential_donation_text);
    setText('pixKey',                 cfg.pix_key);

    // Bloco de contato (com horários)
    const contactInfo = $('#contactInfo');
    if (contactInfo) {
      contactInfo.innerHTML = `
        ${cfg.address ? `<p><i class="fas fa-map-marker-alt"></i> ${cfg.address}</p>`:''}
        ${cfg.phone   ? `<p><i class="fas fa-phone"></i> ${cfg.phone}</p>`:''}
        ${cfg.email   ? `<p><i class="fas fa-envelope"></i> ${cfg.email}</p>`:''}
        <h3>Horários de Culto</h3>
        ${cfg.service_times ? `<ul>${nl2lis(cfg.service_times)}</ul>` : '<div>—</div>'}
      `;
    }
  }

  // ==========================
  // MINISTÉRIOS
  // ==========================
  function renderMinistries(items){
    const grid = document.getElementById('ministriesGrid');
    if (!grid) return;
    if (!items || !items.length) {
      grid.innerHTML = `<p class="muted">Nenhum ministério cadastrado.</p>`;
      return;
    }
    grid.innerHTML = items.map(m => `
      <div class="feature-card">
        <div class="feature-icon"><i class="${m.icon || 'fas fa-users'}"></i></div>
        <div class="feature-content">
          <h3>${m.name}</h3>
          <p>${m.description || ''}</p>
        </div>
      </div>
    `).join('');
  }

  // ==========================
  // CULTOS (services)
  // ==========================
  function renderServices(list){
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    if (!list || !list.length) {
      grid.innerHTML = `<p class="muted">Nenhum culto programado.</p>`;
      return;
    }
    grid.innerHTML = list.map(ev => {
      const day = ev.event_date ? new Date(ev.event_date).getDate() : '--';
      const month = ev.event_date ? new Date(ev.event_date).toLocaleDateString('pt-BR', { month:'short' }).toUpperCase() : '--';
      return `
        <div class="event-card">
          <div class="event-date">
            <h3>${String(day).padStart(2,'0')}</h3>
            <span>${month}</span>
          </div>
          <div class="event-content">
            <h3>${ev.title}</h3>
            ${ev.event_time ? `<p><i class="far fa-clock"></i> ${fmtTime(ev.event_time)} ${ev.end_time ? '– '+fmtTime(ev.end_time) : ''}</p>`:''}
            ${ev.location   ? `<p><i class="fas fa-map-marker-alt"></i> ${ev.location}</p>`:''}
            ${ev.description? `<p>${ev.description}</p>`:''}
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================
  // EVENTOS (com inscrição)
  // ==========================
  function renderEvents(list){
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    if (!list || !list.length) {
      grid.innerHTML = `<p class="muted">Nenhum evento disponível no momento.</p>`;
      return;
    }
    grid.innerHTML = list.map(ev => {
      const d = ev.event_date ? new Date(ev.event_date) : null;
      const day = d ? String(d.getDate()).padStart(2,'0') : '--';
      const mon = d ? d.toLocaleDateString('pt-BR', { month:'short' }).toUpperCase() : '--';
      const canRegister = ev.requires_registration !== false; // default true
      return `
        <div class="event-card">
          <div class="event-date">
            <h3>${day}</h3><span>${mon}</span>
          </div>
          <div class="event-content">
            <h3>${ev.title}</h3>
            ${ev.event_time ? `<p><i class="far fa-clock"></i> ${fmtTime(ev.event_time)} ${ev.end_time ? '– '+fmtTime(ev.end_time) : ''}</p>`:''}
            ${ev.location   ? `<p><i class="fas fa-map-marker-alt"></i> ${ev.location}</p>`:''}
            ${ev.description? `<p>${ev.description}</p>`:''}
            ${canRegister ? `<button class="btn btn-secondary btn-register" data-event-id="${ev.id}" data-event-title="${ev.title}"><i class="fas fa-user-plus"></i> Inscrever-se</button>`:''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Modal de inscrição
  function openRegistrationModal(eventId, eventTitle){
    const modal = document.getElementById('regModal');
    if (!modal) return;
    document.getElementById('reg_event_id').value = String(eventId);
    document.getElementById('reg_event_title').textContent = eventTitle || '-';
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeRegistrationModal(){
    const modal = document.getElementById('regModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Delegação de eventos + submit
  function bindRegistrationUI(){
    const grid = document.getElementById('eventsGrid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-register');
        if (!btn) return;
        const id = Number(btn.dataset.eventId);
        const title = btn.dataset.eventTitle || '';
        openRegistrationModal(id, title);
      });
    }
    const btnCancel = document.getElementById('regCancel');
    if (btnCancel) btnCancel.addEventListener('click', closeRegistrationModal);

    const form = document.getElementById('regForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const event_id   = Number(document.getElementById('reg_event_id').value);
        const name       = document.getElementById('reg_name').value.trim();
        const email      = document.getElementById('reg_email').value.trim();
        const phone      = document.getElementById('reg_phone').value.trim() || null;
        const birth_date = document.getElementById('reg_birth_date').value || null;
        const gender     = document.getElementById('reg_gender').value || null;
        const notes      = document.getElementById('reg_notes').value.trim() || null;

        if (!event_id || !name || !email || !birth_date || !gender) {
          return alert('Preencha nome, e-mail, data de nascimento e sexo.');
        }
        try {
          await API.createEventRegistration({ event_id, name, email, phone, birth_date, gender, notes });
          alert('Inscrição realizada com sucesso!');
          form.reset();
          closeRegistrationModal();
        } catch (err) {
          console.error(err);
          alert('Não foi possível salvar sua inscrição. Verifique se você já não está inscrito com este e-mail.');
        }
      });
    }
  }

  // ==========================
  // SERMÕES
  // ==========================
  function renderSermons(list){
    const el = document.getElementById('sermonList');
    if (!el) return;
    if (!list || !list.length) {
      el.innerHTML = `<p class="muted">Nenhuma pregação cadastrada.</p>`;
      return;
    }
    el.innerHTML = list.map(s => `
      <div class="sermon-card">
        <img class="sermon-img" src="${s.thumbnail_url || 'https://picsum.photos/300/300?grayscale'}" alt="${s.title}">
        <div class="sermon-content">
          <h3>${s.title}</h3>
          <p><strong>${s.pastor_name || '—'}</strong> | ${fmtDate(s.sermon_date)}</p>
          ${s.description ? `<p>${s.description}</p>` : ''}
          <div class="sermon-actions">
            ${s.video_url ? `<a class="btn" href="${s.video_url}" target="_blank"><i class="fas fa-play"></i> Assistir</a>` : ''}
            ${s.audio_url ? `<a class="btn btn-secondary" href="${s.audio_url}" target="_blank"><i class="fas fa-headphones"></i> Ouvir</a>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  // ==========================
  // FORM CONTATO
  // ==========================
  function bindContactForm(){
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const name = document.getElementById('contact_name')?.value?.trim();
      const email = document.getElementById('contact_email')?.value?.trim();
      const message = document.getElementById('contact_message')?.value?.trim();
      if (!name || !email || !message) return alert('Preencha todos os campos.');
      try {
        await API.createContact({ name, email, message });
        alert('Mensagem enviada! Obrigado pelo contato.');
        form.reset();
      } catch (err) {
        console.error(err);
        alert('Não foi possível enviar. Tente novamente.');
      }
    });
  }

  // ==========================
  // MENU MOBILE
  // ==========================
  function bindMobileMenu(){
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('header nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('active'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('active')));
  }

  // Exporta
  window.UI = Object.assign(window.UI || {}, {
    // preenchimento
    renderSiteConfig,
    renderMinistries,
    renderServices,
    renderEvents,
    renderSermons,
    // binds
    bindContactForm,
    bindMobileMenu,
    bindRegistrationUI,
    // utils
    setText, setHTML,
    openRegistrationModal,
    closeRegistrationModal,
  });
})();
