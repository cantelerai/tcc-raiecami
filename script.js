// =============================================
// SUPABASE - CONFIG
// =============================================
const SUPABASE_URL = 'https://xskasveyyprxuuilkavit.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhza2FzdnNleXB2eHV1bGtldmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTEyODgsImV4cCI6MjA3Mzg2NzI4OH0.QMJOGkErNQPhW0ZnRKc6fC5f7Wxze68GnW7hf9lmMXo';

// Supabase já está no window via <script src="...@supabase/supabase-js@2">
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================================
// HELPERS
// =============================================
const $ = (s) => document.querySelector(s);
const setText = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.textContent = val; };
const html = (strings, ...vals) => strings.map((s, i) => s + (vals[i] ?? '')).join('');

function showInlineError(whereId, message) {
  const where = document.getElementById(whereId);
  if (!where) return;
  where.innerHTML = `<p class="muted" style="color:#e53e3e">${message}</p>`;
  console.error(message);
}

// Meses pt-BR para ordenar events (month = "Set", "Out", etc.)
const PT_MONTH_INDEX = { jan:0, fev:1, mar:2, abr:3, mai:4, jun:5, jul:6, ago:7, set:8, out:9, nov:10, dez:11 };
const monthToIndex = (m) => m ? PT_MONTH_INDEX[m.trim().toLowerCase().slice(0,3).normalize('NFD').replace(/\p{Diacritic}/gu,'')] ?? 99 : 99;
const parseDayNumber = (d) => { const m = String(d||'').match(/(\d{1,2})/); return m ? parseInt(m[1],10) : 99; };

// =============================================
// LOADERS
// =============================================

// 1) SITE CONFIG (site_config: key/value em camelCase)
async function loadSiteConfig() {
  const { data, error } = await sb.from('site_config').select('key,value');
  if (error) {
    console.error('site_config error:', error);
    return;
  }
  const cfg = Object.fromEntries((data || []).map(r => [r.key, r.value]));

  // Hero
  setText('heroTitle', cfg.heroTitle);
  setText('addressText', cfg.address);

  // About
  setText('aboutTitle', cfg.aboutTitle);
  setText('aboutSubtitle', cfg.aboutSubtitle);
  setText('aboutText1', cfg.aboutText1);
  setText('aboutText2', cfg.aboutText2);
  setText('aboutText3', cfg.aboutText3);

  // Ministries
  setText('ministriesTitle', cfg.ministriesTitle);
  setText('ministriesSubtitle', cfg.ministriesSubtitle);

  // Events
  setText('eventsTitle', cfg.eventsTitle);
  setText('eventsSubtitle', cfg.eventsSubtitle);

  // Sermons
  setText('sermonsTitle', cfg.sermonsTitle);
  setText('sermonsSubtitle', cfg.sermonsSubtitle);

  // Contact
  setText('contactTitle', cfg.contactTitle);
  setText('contactSubtitle', cfg.contactSubtitle);

  // Donation
  setText('donationTitle', cfg.donationTitle);
  setText('donationSubtitle', cfg.donationSubtitle);
  setText('donationText', cfg.donationText);
  setText('pixDescription', cfg.pixDescription);
  setText('presentialDonationText', cfg.presentialDonationText);
  setText('pixKey', cfg.pix); // sua seed usa 'pix'

  // Contact info extra (endereços/horários)
  const contactInfo = $('#contactInfo');
  if (contactInfo) {
    const serviceTimesHTML = (cfg.serviceTimes ?? '')
      .split(/\r?\n/).map(l => l.trim()).filter(Boolean)
      .map(line => `<li><i class="fas fa-clock"></i> ${line}</li>`).join('');

    contactInfo.innerHTML = html`
      <h3>Informações de Contato</h3>
      ${cfg.address ? `<p><i class="fas fa-map-marker-alt"></i> ${cfg.address}</p>` : ''}
      ${cfg.phone ? `<p><i class="fas fa-phone"></i> ${cfg.phone}</p>` : ''}
      ${cfg.email ? `<p><i class="fas fa-envelope"></i> ${cfg.email}</p>` : ''}

      <h3>Horários de Culto</h3>
      ${serviceTimesHTML ? `<ul>${serviceTimesHTML}</ul>` : '<div>—</div>'}
    `;
  }
}

// 2) MINISTRIES
async function loadMinistries() {
  const grid = $('#ministriesGrid');
  if (!grid) return;

  const { data, error } = await sb.from('ministries').select('*').order('id', { ascending: true });
  if (error) {
    showInlineError('ministriesGrid', 'Erro ao carregar ministérios.');
    console.error('ministries error:', error);
    return;
  }

  if (!data || data.length === 0) {
    grid.innerHTML = "<p class='muted'>Nenhum ministério cadastrado.</p>";
    return;
  }

  grid.innerHTML = data.map(m => html`
    <div class="feature-card">
      <div class="feature-icon"><i class="${m.icon || 'fas fa-people-group'}"></i></div>
      <div class="feature-content">
        <h3>${m.name}</h3>
        <p>${m.description ?? ''}</p>
      </div>
    </div>
  `).join('');
}

// 3) EVENTS (schema: day, month, title, time, location)
async function loadEvents() {
  const grid = $('#eventsGrid');
  if (!grid) return;

  const { data, error } = await sb.from('events').select('id, day, month, title, time, location, created_at');
  if (error) {
    showInlineError('eventsGrid', 'Erro ao carregar eventos.');
    console.error('events error:', error);
    return;
  }
  if (!data || data.length === 0) {
    grid.innerHTML = "<p class='muted'>Nenhum evento por enquanto.</p>";
    return;
  }

  const sorted = data.slice().sort((a,
