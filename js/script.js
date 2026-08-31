// Cashmere Futures — shared site navigation.
// Keep the primary navigation identical across every page.
document.addEventListener('DOMContentLoaded', () => {
  const order = [
    ['index.html', 'Home'],
    ['about.html', 'About'],
    ['supply-chain.html', 'Supply Chain'],
    ['communities.html', 'Communities'],
    ['map.html', 'Map'],
    ['collaborate.html', 'Collaborate']
  ];

  document.querySelectorAll('.main-nav').forEach((nav) => {
    const existing = new Map();
    nav.querySelectorAll('a').forEach((link) => {
      const href = (link.getAttribute('href') || '').split('#')[0];
      if (href) existing.set(href, link);
    });

    // Remove every existing primary-navigation item, including Research,
    // before rebuilding the approved six-item navigation.
    nav.querySelectorAll('a').forEach((link) => link.remove());

    order.forEach(([href, label]) => {
      let link = existing.get(href);
      if (!link) {
        link = document.createElement('a');
        link.href = href;
      }
      link.textContent = label;
      link.removeAttribute('aria-current');
      nav.appendChild(link);
    });

    // Mark the current page as active.
    const current = window.location.pathname.split('/').pop() || 'index.html';
    const active = nav.querySelector(`a[href="${current}"]`);
    if (active) active.setAttribute('aria-current', 'page');
  });
});
