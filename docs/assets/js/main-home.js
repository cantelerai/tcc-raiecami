// /assets/js/main-home.js
document.addEventListener('DOMContentLoaded', async () => {
  UI.bindMobileMenu?.();
  UI.bindContactForm?.();
  try {
    const cfg  = await API.getSiteConfig();
    UI.renderSiteConfig(cfg);

    const mins = await API.getMinistries();
    UI.renderMinistries(mins);
  } catch (err) {
    console.error('Falha ao carregar Home:', err);
  }
});
