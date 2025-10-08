// /assets/js/api.js
;(() => {
  if (!window.sb) {
    console.warn('[api.js] Supabase client (sb) não encontrado. Confira a ordem dos scripts.');
    return;
  }

  // Detecta erro "relation does not exist" (view ausente)
  function isMissingView(err) {
    if (!err) return false;
    const msg = (err.message || '').toLowerCase();
    return err.code === '42P01' || (msg.includes('relation') && msg.includes('does not exist'));
  }

  // ==========================
  // PUBLIC: Site / Conteúdo
  // ==========================
  async function getSiteConfig() {
    const { data, error } = await sb.from('site_config').select('*').limit(1).single();
    if (error) throw error;
    return data;
  }

  async function getMinistries() {
    const { data, error } = await sb
      .from('ministries')
      .select('id,name,description,icon,is_active,display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  // CULTOS: tenta view; se faltar, cai na tabela
  async function getFutureServices() {
    try {
      const { data, error } = await sb.from('future_services').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      if (!isMissingView(e)) throw e;
      const hoje = new Date().toISOString().slice(0, 10);
      const { data, error } = await sb
        .from('services')
        .select('id,title,event_date,event_time,end_time,location,description,is_active')
        .eq('is_active', true)
        .gte('event_date', hoje)
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  }

  // EVENTOS: tenta view; se faltar, cai na tabela
  async function getFutureEvents() {
    try {
      const { data, error } = await sb.from('future_events').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      if (!isMissingView(e)) throw e;
      const hoje = new Date().toISOString().slice(0, 10);
      const { data, error } = await sb
        .from('events')
        .select('id,title,event_date,event_time,end_time,location,description,is_active,requires_registration,registration_deadline,max_participants')
        .eq('is_active', true)
        .gte('event_date', hoje)
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  }

  async function getRecentSermons(limit = 10) {
    const { data, error } = await sb
      .from('sermons')
      .select('id,title,pastor_name,sermon_date,video_url,audio_url,thumbnail_url,description,is_active')
      .eq('is_active', true)
      .order('sermon_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  // Contato (insert público)
  async function createContact({ name, email, phone = null, category = 'visitante', message = null }) {
    const row = { name, email, phone, category, message, is_subscribed: true };
    const { error } = await sb.from('contacts').insert([row]);
    if (error) throw error;
    return true;
  }

  // Inscrição em evento (insert público – RLS confere prazo/ativo)
  async function createEventRegistration({ event_id, name, email, phone = null, birth_date = null, gender = null, notes = null }) {
    const payload = { event_id, name, email, phone, birth_date, gender, notes };
    const { error } = await sb.from('event_registrations').insert([payload]);
    if (error) throw error; // inclui erro de violação da unique (email por evento)
    return true;
  }

  // ==========================
  // AUTH
  // ==========================
  async function signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  }

  async function signOut() {
    const { error } = await sb.auth.signOut();
    if (error) throw error;
    return true;
  }

  async function getSession() {
    const { data, error } = await sb.auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  // ==========================
  // ADMIN (requer usuário autenticado)
  // ==========================
  async function adminListEvents() {
    const { data, error } = await sb
      .from('events')
      .select('id,title,event_date,is_active')
      .order('event_date', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function adminListRegistrations() {
    const { data, error } = await sb
      .from('event_registrations')
      .select('id,event_id,name,email,phone,birth_date,gender,notes,created_at,events(title,event_date)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function adminListDonations() {
    const { data, error } = await sb
      .from('donations')
      .select('id,donor_name,donor_email,amount,donation_type,status,donation_date,created_at')
      .order('donation_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // Exporta
  window.API = {
    // público
    getSiteConfig,
    getMinistries,
    getFutureServices,
    getFutureEvents,
    getRecentSermons,
    createContact,
    createEventRegistration,
    // auth
    signIn,
    signOut,
    getSession,
    // admin
    adminListEvents,
    adminListRegistrations,
    adminListDonations,
  };
})();
