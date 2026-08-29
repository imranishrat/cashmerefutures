(function () {
  // Kept in sync with js/map.js — id, category, and volume level must match.
  var REGIONS = [
    { id: "156", name: "China", category: "producer", tier: "Very high volume", level: 5 },
    { id: "496", name: "Mongolia", category: "producer", tier: "Very high volume", level: 4 },
    { id: "356", name: "India", category: "origin", tier: "Smaller volume", level: 2 },
    { id: "586", name: "Pakistan", category: "origin", tier: "Smaller volume", level: 2 },
    { id: "004", name: "Afghanistan", category: "emerging", tier: "Smaller volume", level: 2 },
    { id: "364", name: "Iran", category: "emerging", tier: "Minor volume", level: 1 },
    { id: "417", name: "Kyrgyzstan", category: "emerging", tier: "Minor volume", level: 1 },
    { id: "762", name: "Tajikistan", category: "emerging", tier: "Minor volume", level: 1 },
    { id: "554", name: "New Zealand", category: "emerging", tier: "Minor volume", level: 1 },
    { id: "380", name: "Italy", category: "hub", tier: "Processing hub", level: 0 }
  ];

  var listEl = document.getElementById("mini-region-list");
  if (listEl) {
    REGIONS.forEach(function (r) {
      var row = document.createElement("a");
      row.className = "region-row";
      row.href = "map.html?region=" + r.id;
      row.setAttribute("aria-label", r.name + " — " + r.tier);

      var nameSpan = document.createElement("span");
      nameSpan.className = "row-name";
      nameSpan.textContent = r.name;

      var bar = document.createElement("span");
      bar.className = "mini-bar";
      bar.setAttribute("aria-hidden", "true");
      for (var i = 0; i < 5; i++) {
        var seg = document.createElement("span");
        seg.className = "seg";
        if (i < r.level) {
          seg.style.background = "var(--" +
            (r.category === "producer" ? "madder" :
             r.category === "origin" ? "indigo" :
             r.category === "hub" ? "ink-soft" : "grass") + ")";
        }
        bar.appendChild(seg);
      }

      row.appendChild(nameSpan);
      row.appendChild(bar);
      listEl.appendChild(row);
    });
  }

  var svg = d3.select("#mini-world-map");
  if (!svg.empty() && window.d3 && window.topojson) {
    var width = 960, height = 500;
    var projection = d3.geoNaturalEarth1().scale(165).translate([width / 2, height / 2 + 10]);
    var path = d3.geoPath().projection(projection);
    var idToCategory = {};
    REGIONS.forEach(function (r) { idToCategory[r.id] = r.category; });

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(function (world) {
        var countries = topojson.feature(world, world.objects.countries).features;
        svg.selectAll("path.mini-country")
          .data(countries)
          .join("path")
          .attr("class", function (d) {
            var cat = idToCategory[String(d.id)];
            return cat ? "mini-country " + cat : "mini-country";
          })
          .attr("d", path);
      })
      .catch(function (err) { console.error("Mini map failed to load", err); });
  }
})();
