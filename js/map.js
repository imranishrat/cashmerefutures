(function () {
  // REGIONS is defined in js/regions-data.js, loaded before this file

  // Heat scale for the volume bar, light to intense
  var HEAT_COLORS = ["#E4D6BC", "#DDBFA0", "#C98F6B", "#A85C3B", "#7A3418"];

  var statusEl = document.getElementById("map-status");
  var svg = d3.select("#world-map");
  var width = 960, height = 500;
  var projection = d3.geoNaturalEarth1().scale(165).translate([width / 2, height / 2 + 10]);
  var path = d3.geoPath().projection(projection);

  var infoContent = document.getElementById("info-content");
  var infoCategory = document.getElementById("info-category");
  var infoName = document.getElementById("info-name");
  var infoDefaultNote = document.getElementById("info-default-note");
  var infoSummary = document.getElementById("info-summary");
  var infoTags = document.getElementById("info-tags");
  var volumeLabel = document.getElementById("volume-label");
  var volumeBar = document.getElementById("volume-bar");
  var volumeNote = document.getElementById("volume-note");

  // Display order for the region list — leading producers first, matches
  // the priority used elsewhere on the site (object key order can't be
  // relied on since numeric-string keys auto-sort ascending in JS)
  var REGION_ORDER = ["156","496","356","586","004","364","417","762","554","398","792","524"];

  var regionRowsEl = document.getElementById("region-rows");
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

  var DEFAULT_REGION = "356"; // India — Kashmir's pashmina tradition, the site's richest story
  var DEFAULT_NOTE = "Starting with Kashmir, home to cashmere's most iconic hand-spun, hand-woven tradition — explore any other region below or on the map.";

  function showRegion(id, isDefault) {
    var region = REGIONS[id];
    if (!region) return;
    activeId = id;

    infoContent.hidden = false;
    infoCategory.textContent = region.categoryLabel;
    infoName.textContent = region.name;
    if (isDefault) {
      infoDefaultNote.textContent = DEFAULT_NOTE;
      infoDefaultNote.hidden = false;
    } else {
      infoDefaultNote.hidden = true;
    }
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

    var rowEls = regionRowsEl ? regionRowsEl.querySelectorAll(".region-row") : [];
    rowEls.forEach(function (r) {
      r.classList.toggle("active", r.getAttribute("data-id") === id);
    });
    if (countryPaths) {
      countryPaths.classed("active", function (d) {
        return String(d.id) === id;
      });
    }
    updateActiveLabel(id);
  }

  // Build the region list dynamically from REGIONS — single source of
  // truth shared with the map itself, no separate duplicated dataset.
  if (regionRowsEl) {
    REGION_ORDER.forEach(function (id) {
      var region = REGIONS[id];
      if (!region) return;

      var row = document.createElement("button");
      row.type = "button";
      row.className = "region-row";
      row.setAttribute("data-id", id);
      row.setAttribute("aria-label", region.name + " — " + (region.volume ? region.volume.tier : ""));

      var nameSpan = document.createElement("span");
      nameSpan.className = "row-name";
      nameSpan.textContent = region.name;

      var bar = document.createElement("span");
      bar.className = "mini-bar";
      bar.setAttribute("aria-hidden", "true");
      var level = region.volume ? region.volume.level : 0;
      var barColor = region.category === "producer" ? "var(--madder)" :
                      region.category === "origin" ? "var(--indigo)" : "var(--grass)";
      for (var i = 0; i < 5; i++) {
        var seg = document.createElement("span");
        seg.className = "seg";
        if (i < level) seg.style.background = barColor;
        bar.appendChild(seg);
      }

      row.appendChild(nameSpan);
      row.appendChild(bar);
      row.addEventListener("click", function () { showRegion(id); });
      regionRowsEl.appendChild(row);
    });
  }

  // Deep-linking: map.html?region=<id> preselects that country.
  // With no link, default to Kashmir/India — the site's richest story.
  var params = new URLSearchParams(window.location.search);
  var linkedRegion = params.get("region");
  if (linkedRegion && REGIONS[linkedRegion]) {
    showRegion(linkedRegion);
  } else {
    showRegion(DEFAULT_REGION, true);
  }

  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(function (world) {
      var countries = topojson.feature(world, world.objects.countries).features;

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

      // Label layers, added after the country paths so they paint on top
      // (SVG renders later DOM elements above earlier ones) — still inside
      // the same fixed viewBox, so this can't affect page layout.
      hoverLabelLayer = svg.append("g").attr("class", "map-labels hover-layer").attr("aria-hidden", "true");
      activeLabelLayer = svg.append("g").attr("class", "map-labels active-layer").attr("aria-hidden", "true");

      statusEl.textContent = "Map loaded — select a highlighted region.";

      // Re-apply the current selection now that the map paths exist, so the highlight shows too
      if (linkedRegion && REGIONS[linkedRegion]) {
        showRegion(linkedRegion);
      } else {
        showRegion(DEFAULT_REGION, true);
      }
    })
    .catch(function (err) {
      statusEl.textContent = "Map couldn't load — use the region list below instead.";
      console.error(err);
    });
})();
