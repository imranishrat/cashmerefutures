(function () {
  // ISO 3166-1 numeric id -> region info
  // volume.level: 0-5 relative scale used for the heat bar (approximate, not exact export data)
  var REGIONS = {
    "496": {
      name: "Mongolia",
      category: "producer",
      categoryLabel: "Leading producer",
      summary: "Home to some of the world's largest cashmere goat herds, raised by pastoral herding communities across the Gobi and the steppe. Herding and early-stage fibre processing are a major part of the rural economy.",
      tags: ["Herding communities", "Gobi & steppe", "Raw fibre"],
      volume: { level: 4, tier: "Very high volume", note: "The world's second-largest raw fibre producer — roughly a fifth to two-fifths of global volume by most industry estimates." }
    },
    "156": {
      name: "China",
      category: "producer",
      categoryLabel: "Leading producer",
      summary: "A major raw fibre producer, particularly across Inner Mongolia and Xinjiang, and the world's largest hub for cashmere spinning, weaving and manufacturing.",
      tags: ["Inner Mongolia", "Xinjiang", "Manufacturing"],
      volume: { level: 5, tier: "Very high volume", note: "The world's largest raw fibre producer — commonly estimated at around half or more of global volume." }
    },
    "356": {
      name: "India",
      category: "origin",
      categoryLabel: "Historic origin",
      summary: "The source of the word \"cashmere\" itself. Kashmiri artisans have hand-spun and hand-woven pashmina for centuries, while Changpa herders in Ladakh raise the goats at high altitude.",
      tags: ["Kashmir", "Ladakh", "Hand-weaving"],
      volume: { level: 2, tier: "Smaller volume", note: "A modest share of current global volume — production is real but small next to China and Mongolia." }
    },
    "586": {
      name: "Pakistan",
      category: "origin",
      categoryLabel: "Historic origin",
      summary: "Herding communities in the northern mountain regions raise cashmere goats alongside a long-standing regional textile tradition.",
      tags: ["Northern regions", "Herding"],
      volume: { level: 2, tier: "Smaller volume", note: "A modest share of current global volume." }
    },
    "004": {
      name: "Afghanistan",
      category: "emerging",
      categoryLabel: "Emerging focus",
      summary: "Herding communities, particularly in the north of the country, raise cashmere goats. The sector faces real infrastructure and market-access challenges alongside its potential.",
      tags: ["Herding communities", "Market access"],
      volume: { level: 2, tier: "Smaller volume", note: "A modest but longstanding share of global volume, historically ranked among the top producing countries." }
    },
    "364": {
      name: "Iran",
      category: "emerging",
      categoryLabel: "Emerging focus",
      summary: "A smaller but longstanding producer, with herding concentrated in arid and semi-arid regions of the country.",
      tags: ["Herding", "Arid regions"],
      volume: { level: 1, tier: "Minor volume", note: "A minor share of global volume." }
    },
    "417": {
      name: "Kyrgyzstan",
      category: "emerging",
      categoryLabel: "Emerging focus",
      summary: "Herding communities across Kyrgyzstan's highland pastures are increasingly connected to global cashmere supply chains.",
      tags: ["Highland pasture", "Herding"],
      volume: { level: 1, tier: "Minor volume", note: "A minor but growing share of global volume." }
    },
    "762": {
      name: "Tajikistan",
      category: "emerging",
      categoryLabel: "Emerging focus",
      summary: "Alongside neighbouring Central Asian countries, herding communities here represent a growing point of interest for the sector.",
      tags: ["Central Asia", "Herding"],
      volume: { level: 1, tier: "Minor volume", note: "A minor but growing share of global volume." }
    },
    "380": {
      name: "Italy",
      category: "hub",
      categoryLabel: "Processing hub",
      summary: "A centre for high-end spinning, weaving and finishing, converting raw fibre sourced from producer regions into finished cashmere textiles and garments.",
      tags: ["Spinning & weaving", "Finishing", "Design"],
      volume: { level: 0, tier: "Not a raw producer", note: "Primarily a processing and finishing hub — very little raw fibre is farmed here." }
    },
    "554": {
      name: "New Zealand",
      category: "emerging",
      categoryLabel: "Emerging focus",
      summary: "A smaller-scale but established producer, with cashmere goats farmed alongside sheep on pastoral land. New Zealand's fibre is often noted for its fine micron count and traceability.",
      tags: ["Pastoral farming", "Fine micron", "Traceability"],
      volume: { level: 1, tier: "Minor volume", note: "Produced at much smaller scale than the major Asian producers." }
    }
  };

  // Heat scale for the volume bar, light to intense
  var HEAT_COLORS = ["#E4D6BC", "#DDBFA0", "#C98F6B", "#A85C3B", "#7A3418"];

  var statusEl = document.getElementById("map-status");
  var svg = d3.select("#world-map");
  var width = 960, height = 500;
  var projection = d3.geoNaturalEarth1().scale(165).translate([width / 2, height / 2 + 10]);
  var path = d3.geoPath().projection(projection);

  var infoEmpty = document.getElementById("info-empty");
  var infoContent = document.getElementById("info-content");
  var infoCategory = document.getElementById("info-category");
  var infoName = document.getElementById("info-name");
  var infoSummary = document.getElementById("info-summary");
  var infoTags = document.getElementById("info-tags");
  var volumeLabel = document.getElementById("volume-label");
  var volumeBar = document.getElementById("volume-bar");
  var volumeNote = document.getElementById("volume-note");

  var chips = document.querySelectorAll(".region-chip");
  var countryPaths = null;

  function showRegion(id) {
    var region = REGIONS[id];
    if (!region) return;

    infoEmpty.hidden = true;
    infoContent.hidden = false;
    infoCategory.textContent = region.categoryLabel;
    infoName.textContent = region.name;
    infoSummary.textContent = region.summary;
    infoTags.innerHTML = "";
    region.tags.forEach(function (t) {
      var span = document.createElement("span");
      span.className = "tag";
      span.textContent = t;
      infoTags.appendChild(span);
    });

    var vol = region.volume || { level: 0, tier: "Unknown", note: "" };
    volumeLabel.textContent = "Relative fibre volume — " + vol.tier;
    volumeBar.innerHTML = "";
    for (var i = 0; i < 5; i++) {
      var seg = document.createElement("span");
      seg.className = "seg";
      if (i < vol.level) {
        seg.style.background = HEAT_COLORS[i];
      }
      volumeBar.appendChild(seg);
    }
    volumeNote.textContent = vol.note;

    chips.forEach(function (c) {
      c.classList.toggle("active", c.getAttribute("data-id") === id);
    });
    if (countryPaths) {
      countryPaths.classed("active", function (d) {
        return String(d.id) === id;
      });
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      showRegion(chip.getAttribute("data-id"));
    });
  });

  // Deep-linking: map.html?region=<id> preselects that country
  var params = new URLSearchParams(window.location.search);
  var linkedRegion = params.get("region");
  if (linkedRegion && REGIONS[linkedRegion]) {
    showRegion(linkedRegion);
  }

  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(function (world) {
      var countries = topojson.feature(world, world.objects.countries).features;

      countryPaths = svg.selectAll("path.country")
        .data(countries)
        .join("path")
        .attr("class", function (d) {
          var id = String(d.id);
          var region = REGIONS[id];
          return region ? "country focus " + region.category : "country";
        })
        .attr("d", path)
        .attr("tabindex", function (d) {
          return REGIONS[String(d.id)] ? 0 : -1;
        })
        .attr("role", function (d) {
          return REGIONS[String(d.id)] ? "button" : null;
        })
        .attr("aria-label", function (d) {
          var region = REGIONS[String(d.id)];
          return region ? region.name : null;
        })
        .on("click", function (event, d) {
          var id = String(d.id);
          if (REGIONS[id]) showRegion(id);
        })
        .on("keydown", function (event, d) {
          if (event.key === "Enter" || event.key === " ") {
            var id = String(d.id);
            if (REGIONS[id]) {
              event.preventDefault();
              showRegion(id);
            }
          }
        });

      statusEl.textContent = "Map loaded — select a highlighted region.";

      // Re-apply deep-linked selection now that the map paths exist, so the highlight shows too
      if (linkedRegion && REGIONS[linkedRegion]) {
        showRegion(linkedRegion);
      }
    })
    .catch(function (err) {
      statusEl.textContent = "Map couldn't load — use the region list below instead.";
      console.error(err);
    });
})();
