// NÃO coloque <script> aqui — este arquivo é JS puro!
const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG || {};
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("APP_CONFIG não encontrado. Verifique o path/ordem de config.js");
}

// `supabase` vem da CDN carregada no HTML
if (!window.supabase) {
  console.error("CDN do supabase-js não carregou. Confira a tag <script> no index.html");
}

window.sb = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
