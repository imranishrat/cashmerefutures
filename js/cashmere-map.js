document.addEventListener('DOMContentLoaded', () => {
  const map = document.querySelector('[data-cashmere-map]');
  const panel = document.querySelector('[data-map-panel]');
  if (!map || !panel) return;

  const countries = {
    china: {
      name: 'China',
      region: 'East Asia',
      description: 'A leading source of raw cashmere and a major centre for processing and manufacturing.',
      profile: 'Country profile coming soon.'
    },
    mongolia: {
      name: 'Mongolia',
      region: 'Central & East Asia',
      description: 'A major cashmere-producing country where the sector is closely connected to pastoral livelihoods.',
      profile: 'Country profile coming soon.'
    },
    iran: {
      name: 'Iran',
      region: 'West Asia',
      description: 'A long-established cashmere-producing country with pastoral production and regional processing activity.',
      profile: 'Country profile coming soon.'
    },
    afghanistan: {
      name: 'Afghanistan',
      region: 'South & Central Asia',
      description: 'An important source of raw cashmere associated with pastoral communities and regional trading networks.',
      profile: 'Country profile coming soon.'
    },
    india: {
      name: 'India',
      region: 'South Asia',
      description: 'A smaller producer of raw fibre with distinctive pashmina and cashmere traditions, particularly in Himalayan regions.',
      profile: 'Country profile coming soon.'
    },
    kyrgyzstan: {
      name: 'Kyrgyzstan',
      region: 'Central Asia',
      description: 'A smaller Central Asian producer with a developing role in the regional cashmere value chain.',
      profile: 'Country profile coming soon.'
    },
    kazakhstan: {
      name: 'Kazakhstan',
      region: 'Central Asia',
      description: 'A smaller producer within the wider Central Asian cashmere-producing region.',
      profile: 'Country profile coming soon.'
    },
    pakistan: {
      name: 'Pakistan',
      region: 'South Asia',
      description: 'A smaller cashmere-producing country with links to Himalayan and regional fibre value chains.',
      profile: 'Country profile coming soon.'
    },
    nepal: {
      name: 'Nepal',
      region: 'South Asia',
      description: 'A smaller producer and an important location for traditional textile and pashmina-related value addition.',
      profile: 'Country profile coming soon.'
    }
  };

  const title = panel.querySelector('[data-map-title]');
  const region = panel.querySelector('[data-map-region]');
  const description = panel.querySelector('[data-map-description]');
  const profile = panel.querySelector('[data-map-profile]');

  function showCountry(key) {
    const country = countries[key];
    if (!country) return;

    map.querySelectorAll('[data-country]').forEach((el) => el.classList.remove('is-selected'));
    const selected = map.querySelector(`[data-country="${key}"]`);
    if (selected) selected.classList.add('is-selected');

    title.textContent = country.name;
    region.textContent = country.region;
    description.textContent = country.description;
    profile.textContent = country.profile;
    panel.hidden = false;
  }

  map.querySelectorAll('[data-country]').forEach((country) => {
    country.setAttribute('tabindex', '0');
    country.setAttribute('role', 'button');
    country.addEventListener('click', () => showCountry(country.dataset.country));
    country.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showCountry(country.dataset.country);
      }
    });
  });
});
