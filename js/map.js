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
      summary: "The source of the word \"cashmere\" itself. In Kashmir, artisans hand-spin cleaned pashm into yarn on a traditional wheel called a yinder, then hand-weave it on a wooden loom — a single shawl can take 180\u2013250 hours. Changpa herders in neighbouring Ladakh raise the Changthangi goats whose fibre makes this possible, and the finished craft carries Geographical Indication (GI) protection.",
      tags: ["Kashmir", "Yinder hand-spinning", "GI-protected"],
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
    },
    "398": {
      name: "Kazakhstan",
      category: "emerging",
      categoryLabel: "Emerging focus",
      summary: "Herding communities across Kazakhstan's steppe regions raise cashmere goats alongside other livestock. The country is regularly named among the more significant secondary producers, though reliable, consistent production figures are hard to come by.",
      tags: ["Steppe herding", "Central Asia"],
      volume: { level: 2, tier: "Smaller volume", note: "Frequently named among the next tier of producers after China and Mongolia, though its precise share of global volume isn't well documented in available sources." }
    },
    "792": {
      name: "Turkey",
      category: "emerging",
      categoryLabel: "Emerging focus",
      summary: "Turkey has a long history with fine goat fibres — most famously mohair from the Angora goat — and is also cited as a smaller cashmere producer, though it's better known globally for textile processing and manufacturing than raw cashmere volume.",
      tags: ["Smaller-scale producer", "Textile manufacturing"],
      volume: { level: 1, tier: "Minor volume", note: "Named in several industry overviews as a producer, without the volume or profile of the larger Central and East Asian sources." }
    },
    "524": {
      name: "Nepal",
      category: "emerging",
      categoryLabel: "Emerging focus",
      summary: "Nepal's Himalayan Chyangra goats, raised above 3,000 metres across roughly 15 high-altitude districts, produce a genuinely fine fibre — commonly cited around 15 microns. Combing, spinning and weaving are still frequently done by hand, and \"Chyangra Pashmina\" is a government-backed trademark protecting genuine Nepali fibre from being substituted with cheaper material.",
      tags: ["Chyangra goat", "Hand-spun", "Trademark-protected"],
      volume: { level: 1, tier: "Minor volume", note: "A small producer in global volume terms — around 130,000 goats, against tens of millions in China — but notable for fibre quality and craft tradition." }
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
  var centroids = {};
  var activeLabelLayer = null;
  var hoverLabelLayer = null;
  var activeId = null;

  // Renders a "pin + flag" callout: a small dot at the country's true location,
  // a thin leader line, and the name box offset into open space. The offset
  // direction auto-flips near map edges so the box never runs off the SVG.
  // Pure SVG overlay inside the existing viewBox — never changes the SVG's own
  // size or the page layout around it, so it can't "squash" the map.
  function renderLabel(layer, cx, cy, text, cls) {
    layer.selectAll("*").remove();
    var fontSize = 13;
    var padX = 9, padY = 5;
    var approxWidth = text.length * (fontSize * 0.6) + padX * 2;
    var boxHeight = fontSize + padY * 2;

    // Default: offset up and to the right of the pin
    var dx = 34, dy = -40;
    // Flip vertically if the box would run off the top edge
    if (cy + dy - boxHeight / 2 < 10) dy = 40;
    // Flip horizontally if the box would run off the right edge
    if (cx + dx + approxWidth / 2 > width - 10) dx = -34;
    // Flip horizontally if the box would run off the left edge
    if (cx + dx - approxWidth / 2 < 10) dx = 34;

    var boxCx = cx + dx;
    var boxCy = cy + dy;
    var boxX = boxCx - approxWidth / 2;
    var boxY = boxCy - boxHeight / 2;
    var textY = boxCy + fontSize * 0.32;

    // Leader line from the pin to the box (drawn first, so the box sits on top)
    layer.append("line")
      .attr("x1", cx).attr("y1", cy)
      .attr("x2", boxCx).attr("y2", boxCy)
      .attr("class", "map-label-line " + cls);

    // Pin marking the country's actual location
    layer.append("circle")
      .attr("cx", cx).attr("cy", cy).attr("r", 3.5)
      .attr("class", "map-label-pin " + cls);

    layer.append("rect")
      .attr("x", boxX)
      .attr("y", boxY)
      .attr("width", approxWidth)
      .attr("height", boxHeight)
      .attr("rx", 2)
      .attr("class", "map-label-bg " + cls);

    layer.append("text")
      .attr("x", boxCx)
      .attr("y", textY)
      .attr("text-anchor", "middle")
      .attr("class", "map-label-text " + cls)
      .text(text);
  }

  function updateActiveLabel(id) {
    if (!activeLabelLayer) return;
    activeLabelLayer.selectAll("*").remove();
    var c = centroids[id];
    if (!c) return;
    renderLabel(activeLabelLayer, c[0], c[1], REGIONS[id].name, "active");
  }

  function showRegion(id) {
    var region = REGIONS[id];
    if (!region) return;
    activeId = id;

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
    updateActiveLabel(id);
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

      // Label layers, added once, drawn above the country paths but still
      // inside the same fixed viewBox
      hoverLabelLayer = svg.append("g").attr("class", "map-labels hover-layer").attr("aria-hidden", "true");
      activeLabelLayer = svg.append("g").attr("class", "map-labels active-layer").attr("aria-hidden", "true");

      countries.forEach(function (feature) {
        var id = String(feature.id);
        if (REGIONS[id]) centroids[id] = path.centroid(feature);
      });

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
        })
        .on("mouseenter", function (event, d) {
          var id = String(d.id);
          if (!REGIONS[id] || id === activeId) return;
          var c = centroids[id];
          if (c) renderLabel(hoverLabelLayer, c[0], c[1], REGIONS[id].name, "hover");
        })
        .on("mouseleave", function () {
          hoverLabelLayer.selectAll("*").remove();
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
