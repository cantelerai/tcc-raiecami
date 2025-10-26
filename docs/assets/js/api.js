// /assets/js/api.js
;(() => {
  if (!window.sb) {
    console.warn('[api.js] Supabase client (sb) não encontrado. Confira a ordem dos scripts.');
    return;
  }

  // ---------------------------
  // Helpers
  // ---------------------------
  function isMissingView(err) {
    if (!err) return false;
    const msg = (err.message || '').toLowerCase();
    return err.code === '42P01' || (msg.includes('relation') && msg.includes('does not exist'));
  }
  function isUniqueViolation(err) {
    return err && (err.code === '23505' || /duplicate key|unique constraint/i.test(err.message || ''));
  }
  async function assertAuth() {
    const { data, error } = await sb.auth.getSession();
    if (error) throw error;
    if (!data?.session) throw new Error('Não autenticado. Faça login para continuar.');
    return data.session;
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

  // CULTOS
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

  // EVENTOS
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

  // SERMÕES
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

  // CONTATO
  async function createContact({ name, email, phone = null, category = 'visitante', message = null }) {
    const row = { name, email, phone, category, message, is_subscribed: true };
    const { error } = await sb.from('contacts').insert([row]);
    if (error) throw error;
    return true;
  }

  // INSCRIÇÃO EM EVENTO
  async function createEventRegistration({ event_id, name, email, phone = null, birth_date = null, gender = null, notes = null }) {
    const payload = {
      event_id: Number(event_id),
      name,
      email,
      phone: phone || null,
      birth_date: birth_date || null,
      gender: gender || null,
      notes: (notes || '').trim() || null
    };
    const { error } = await sb.from('event_registrations').insert([payload]);
    if (error) {
      if (isUniqueViolation(error)) {
        throw new Error('Este e-mail já está inscrito neste evento.');
      }
      throw error;
    }
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
  // ADMIN (usuário autenticado + admins.email)
  // ==========================
  // Para o filtro da aba "Inscrições"
  async function adminListEvents() {
    await assertAuth();
    const { data, error } = await sb
      .from('events')
      .select('id,title,event_date,is_active')
      .order('event_date', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function adminListRegistrations() {
    await assertAuth();
    const { data, error } = await sb
      .from('event_registrations')
      .select('id,event_id,name,email,phone,birth_date,gender,notes,created_at,events(title,event_date)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function adminListDonations() {
    await assertAuth();
    const { data, error } = await sb
      .from('donations')
      .select('id,donor_name,donor_email,amount,donation_type,status,donation_date,created_at')
      .order('donation_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // === ADMIN: eventos (gerenciar) ===
  async function adminListAllEvents() {
    await assertAuth();
    const { data, error } = await sb
      .from('events')
      .select('id,title,event_date,event_time,end_time,location,description,is_active,requires_registration,registration_deadline,max_participants')
      .order('event_date', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function adminCreateEvent(payload) {
    await assertAuth();
    const clean = {
      title: (payload.title || '').trim(),
      event_date: payload.event_date,
      event_time: payload.event_time || null,
      end_time: payload.end_time || null,
      location: (payload.location || '').trim() || null,
      description: (payload.description || '').trim() || null,
      is_active: !!payload.is_active,
      requires_registration: !!payload.requires_registration,
      registration_deadline: payload.registration_deadline || null,
      max_participants: payload.max_participants != null && payload.max_participants !== ''
        ? Number(payload.max_participants)
        : null
    };
    if (!clean.title || !clean.event_date) throw new Error('Título e data são obrigatórios.');
    const { error } = await sb.from('events').insert([clean]);
    if (error) throw error;
    return true;
  }

  async function adminDeleteEvent(eventId) {
    await assertAuth();
    const { error } = await sb.from('events').delete().eq('id', Number(eventId));
    if (error) throw error;
    return true;
  }

  // Exporta tudo
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
    adminListAllEvents,
    adminCreateEvent,
    adminDeleteEvent,
  };
})();
