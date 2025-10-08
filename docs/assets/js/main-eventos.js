// /assets/js/main-eventos.js
document.addEventListener('DOMContentLoaded', async () => {
  UI.bindMobileMenu?.();
  UI.bindRegistrationUI?.();

  try {
    const cfg = await API.getSiteConfig();
    UI.setText?.('eventsTitle', cfg.events_title || 'Eventos');
    UI.setText?.('eventsSubtitle', cfg.events_subtitle || 'Próximos eventos');

    const events = await API.getFutureEvents(); // agora busca pela VIEW
    UI.renderEvents(events);
  } catch (e) {
    console.error(e);
    const grid = document.getElementById('eventsGrid');
    if (grid) grid.innerHTML = `<p class="muted">Não foi possível carregar os eventos.</p>`;
  }
});
