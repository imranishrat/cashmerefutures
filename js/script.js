// Cashmere Futures — shared site navigation consistency.
// Add Global Map to any main navigation that does not already contain it.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.main-nav').forEach((nav) => {
    if (!nav.querySelector('a[href="map.html"]')) {
      const link = document.createElement('a');
      link.href = 'map.html';
      link.textContent = 'Global Map';
      const current = window.location.pathname.split('/').pop() || 'index.html';
      if (current === 'map.html') link.setAttribute('aria-current', 'page');
      const collaborate = nav.querySelector('a[href="collaborate.html"]');
      nav.insertBefore(link, collaborate || null);
    }
  });
});
