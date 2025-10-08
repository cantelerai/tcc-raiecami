// /assets/js/main-cultos.js
document.addEventListener('DOMContentLoaded', async () => {
  UI.bindMobileMenu?.();
  try {
    const cfg = await API.getSiteConfig();
    UI.setText?.('servicesTitle',   cfg.events_title   || 'Próximos Cultos');
    UI.setText?.('servicesSubtitle',cfg.events_subtitle|| 'Participe dos nossos cultos');

    const cultos = await API.getFutureServices(); // agora busca pela VIEW
    UI.renderServices(cultos);
  } catch (e) {
    console.error(e);
    const grid = document.getElementById('servicesGrid');
    if (grid) grid.innerHTML = `<p class="muted">Não foi possível carregar os cultos.</p>`;
  }
});
