(function () {
  // ISO 3166-1 numeric id -> region info
  var REGIONS = {
    "496": {
      name: "Mongolia",
      category: "producer",
      categoryLabel: "Leading producer",
      summary: "Home to some of the world's largest cashmere goat herds, raised by pastoral herding communities across the Gobi and the steppe. Herding and early-stage fibre processing are a major part of the rural economy.",
      tags: ["Herding communities", "Gobi & steppe", "Raw fibre"]
    },
    "156": {
      name: "China",
      category: "producer",
      categoryLabel: "Leading producer",
      summary: "A major raw fibre producer, particularly across Inner Mongolia and Xinjiang, and the world's largest hub for cashmere spinning, weaving and manufacturing.",
      tags: ["Inner Mongolia", "Xinjiang", "Manufacturing"]
    },
    "356": {
      name: "India",
      category: "origin",
      categoryLabel: "Historic origin",
      summary: "The source of the word \"cashmere\" itself. Kashmiri artisans have hand-spun and hand-woven pashmina for centuries, while Changpa herders in Ladakh raise the goats at high altitude.",
      tags: ["Kashmir", "Ladakh", "Hand-weaving"]
    },
    "586": {
      name: "Pakistan",
      category: "origin",
      categoryLabel: "Historic origin",
      summary: "Herding communities in the northern mountain regions raise cashmere goats alongside a long-standing regional textile tradition.",
      tags: ["Northern regions", "Herding"]
    },
    "004": {
      name: "Afghanistan",
      category: "emerging",
      categoryLabel: "Emerging focus",
      summary: "Herding communities, particularly in the north of the country, raise cashmere goats. The sector faces real infrastructure and market-access challenges alongside its potential.",
      tags: ["Herding communities", "Market access"]
    },
    "364": {
      name: "Iran",
      category: "emerging",
      categoryLabel: "Emerging focus",
      summary: "A smaller but longstanding producer, with herding concentrated in arid and semi-arid regions of the country.",
      tags: ["Herding", "Arid regions"]
    },
    "417": {
      name: "Kyrgyzstan",
      category: "emerging",
      categoryLabel: "Emerging focus",
      summary: "Herding communities across Kyrgyzstan's highland pastures are increasingly connected to global cashmere supply chains.",
      tags: ["Highland pasture", "Herding"]
    },
    "762": {
      name: "Tajikistan",
      category: "emerging",
      categoryLabel: "Emerging focus",
      summary: "Alongside neighbouring Central Asian countries, herding communities here represent a growing point of interest for the sector.",
      tags: ["Central Asia", "Herding"]
    },
    "380": {
      name: "Italy",
      category: "hub",
      categoryLabel: "Processing hub",
      summary: "A centre for high-end spinning, weaving and finishing, converting raw fibre sourced from producer regions into finished cashmere textiles and garments.",
      tags: ["Spinning & weaving", "Finishing", "Design"]
    }
  };

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
    })
    .catch(function (err) {
      statusEl.textContent = "Map couldn't load — use the region list below instead.";
      console.error(err);
    });
})();
