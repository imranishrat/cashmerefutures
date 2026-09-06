(function () {
  var svg = document.getElementById("flow-diagram");
  if (!svg || typeof REGIONS === "undefined") return;

  var SVG_NS = "http://www.w3.org/2000/svg";
  var W = 1000, H = 600;
  var HUB = { x: 860, y: 300, r: 34 };

  // Curated left-to-right order: leading producers first, then origin, then emerging
  var ORDER = ["156", "496", "356", "586", "398", "004", "364", "417", "762", "554", "792", "524"];

  var reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var idxEl = document.getElementById("flow-idx");
  var detailEl = document.getElementById("flow-detail");

  function el(tag, attrs) {
    var e = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function radiusFor(level) {
    return 8 + level * 2.6;
  }

  // ---- Layout: origins arranged in a gentle arc on the left, hub on the right ----
  var positions = {};
  var n = ORDER.length;
  ORDER.forEach(function (id, i) {
    var t = n > 1 ? i / (n - 1) : 0.5;
    var y = 50 + t * (H - 100);
    var x = 150 + 90 * Math.sin(t * Math.PI);
    positions[id] = { x: x, y: y };
  });

  var linksGroup = el("g", { "class": "flow-links" });
  var particlesGroup = el("g", { "class": "flow-particles" });
  var nodesGroup = el("g", { "class": "flow-nodes" });
  svg.appendChild(linksGroup);
  svg.appendChild(particlesGroup);
  svg.appendChild(nodesGroup);

  // ---- Links: curved paths from each origin to the hub ----
  var linkPaths = [];
  ORDER.forEach(function (id) {
    var p = positions[id];
    var midX = (p.x + HUB.x) / 2;
    var midY = (p.y + HUB.y) / 2 - 18;
    var d = "M " + p.x + " " + p.y + " Q " + midX + " " + midY + " " + HUB.x + " " + HUB.y;
    var path = el("path", { "d": d, "class": "flow-link " + REGIONS[id].category });
    linksGroup.appendChild(path);
    linkPaths.push({ id: id, path: path });
  });

  // ---- Hub node (decorative endpoint, not a real per-country entity) ----
  var hubG = el("g", { "transform": "translate(" + HUB.x + "," + HUB.y + ")", "aria-hidden": "true" });
  hubG.appendChild(el("circle", { r: HUB.r, "class": "flow-node hub" }));
  var hubLabel1 = el("text", { "class": "flow-hub-label", y: -4 });
  hubLabel1.textContent = "Finished Garment";
  var hubLabel2 = el("text", { "class": "flow-hub-label", y: 12 });
  hubLabel2.textContent = "Global Market";
  hubG.appendChild(hubLabel1);
  hubG.appendChild(hubLabel2);
  nodesGroup.appendChild(hubG);

  // ---- Origin nodes ----
  function showInfo(id) {
    var r = REGIONS[id];
    idxEl.textContent = r.name + " — " + r.categoryLabel;
    detailEl.textContent = (r.volume ? r.volume.tier + ". " + r.volume.note : "") ;
  }
  function resetInfo() {
    idxEl.textContent = "Select a source";
    detailEl.textContent = "Hover, focus, or tap any origin above to see its role in the chain — or click it to open its full profile on the Global Map.";
  }

  ORDER.forEach(function (id) {
    var p = positions[id];
    var region = REGIONS[id];
    var r = radiusFor(region.volume ? region.volume.level : 1);

    var g = el("g", {
      "class": "flow-node-group",
      "transform": "translate(" + p.x + "," + p.y + ")",
      "tabindex": "0",
      "role": "link",
      "aria-label": region.name + " — " + region.categoryLabel + ". Opens full profile on the Global Map."
    });

    g.appendChild(el("circle", { r: r, "class": "flow-node " + region.category }));

    var label = el("text", { "class": "flow-node-label", y: -(r + 8) });
    label.textContent = region.name;
    g.appendChild(label);

    function go() { window.location.href = "map.html?region=" + id; }

    g.addEventListener("mouseenter", function () { showInfo(id); });
    g.addEventListener("focus", function () { showInfo(id); });
    g.addEventListener("mouseleave", resetInfo);
    g.addEventListener("blur", resetInfo);
    g.addEventListener("click", go);
    g.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
    });

    nodesGroup.appendChild(g);
  });

  // ---- Animated particles along each link, skipped entirely for reduced motion ----
  if (!reducedMotion) {
    linkPaths.forEach(function (item) {
      var length = item.path.getTotalLength();
      if (!length) return;
      setInterval(function () {
        spawnParticle(item.path, length, REGIONS[item.id].category);
      }, 1100 + Math.random() * 700);
    });
  } else {
    // Static hint dot at each link's midpoint instead of motion
    linkPaths.forEach(function (item) {
      var length = item.path.getTotalLength();
      if (!length) return;
      var mid = item.path.getPointAtLength(length / 2);
      particlesGroup.appendChild(el("circle", {
        cx: mid.x, cy: mid.y, r: 3,
        "class": "flow-particle-static " + REGIONS[item.id].category
      }));
    });
  }

  function spawnParticle(pathEl, length, category) {
    var dot = el("circle", { r: 2.5, "class": "flow-particle " + category });
    particlesGroup.appendChild(dot);
    var start = null;
    var duration = 2600 + Math.random() * 900;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var pt = pathEl.getPointAtLength(t * length);
      dot.setAttribute("cx", pt.x);
      dot.setAttribute("cy", pt.y);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        particlesGroup.removeChild(dot);
      }
    }
    requestAnimationFrame(step);
  }
})();
