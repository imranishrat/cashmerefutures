// Cashmere Futures — shared site navigation consistency.
// Every main page uses the same primary navigation sequence.
document.addEventListener('DOMContentLoaded', () => {
  const order = [
    ['index.html', 'Home'],
    ['research.html', 'Research'],
    ['supply-chain.html', 'Supply Chain'],
    ['communities.html', 'Communities'],
    ['about.html', 'About'],
    ['map.html', 'Global Map'],
    ['collaborate.html', 'Collaborate']
  ];

  document.querySelectorAll('.main-nav').forEach((nav) => {
    const existing = new Map();
    nav.querySelectorAll('a').forEach((link) => {
      const href = (link.getAttribute('href') || '').split('#')[0];
      if (href) existing.set(href, link);
    });

    // Remove primary navigation links from their old positions.
    order.forEach(([href]) => {
      const link = existing.get(href);
      if (link) link.remove();
    });

    // Rebuild the primary navigation in one consistent sequence.
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

    // Preserve the active-page indicator.
    const current = window.location.pathname.split('/').pop() || 'index.html';
    const active = nav.querySelector(`a[href="${current}"]`);
    if (active) active.setAttribute('aria-current', 'page');
  });
});
