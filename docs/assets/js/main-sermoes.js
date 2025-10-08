// /assets/js/main-sermoes.js
document.addEventListener('DOMContentLoaded', async () => {
  UI.bindMobileMenu?.();
  try {
    const cfg = await API.getSiteConfig();
    UI.setText?.('sermonsTitle', cfg.sermons_title || 'Pregações');
    UI.setText?.('sermonsSubtitle', cfg.sermons_subtitle || 'Mensagens recentes');

    const sermoes = await API.getRecentSermons(20);
    UI.renderSermons(sermoes);
  } catch (e) {
    console.error(e);
    const list = document.getElementById('sermonList');
    if (list) list.innerHTML = `<p class="muted">Não foi possível carregar as pregações.</p>`;
  }
});
