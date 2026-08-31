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

    // Remove all primary navigation links from their existing positions.
    order.forEach(([href]) => {
      const link = existing.get(href);
      if (link) link.remove();
    });

    // Rebuild the navigation in the approved sequence.
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
