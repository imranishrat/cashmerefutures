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

  // Short, grounded restatement of each country's specific character in the
  // chain — not new claims, just a short label version of what's already
  // established in that country's full profile on the Global Map.
  var ROLE_HINT = {
    "156": "Manufacturing & spinning",
    "496": "Raw fibre herding",
    "356": "Hand-spun, hand-woven",
    "586": "Herding tradition",
    "398": "Steppe herding",
    "004": "Herding communities",
    "364": "Traditional herding",
    "417": "Highland herding",
    "762": "Herding communities",
    "554": "Pastoral, traceable",
    "792": "Textile manufacturing",
    "524": "Hand-spun heritage"
  };

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
  var annotationsGroup = el("g", { "class": "flow-annotations", "aria-hidden": "true" });
  var nodesGroup = el("g", { "class": "flow-nodes" });

  // Arrowhead marker, reused by every link to show clear directional flow into the hub
  var defs = el("defs", {});
  var marker = el("marker", {
    id: "flow-arrowhead", viewBox: "0 0 10 10", refX: "8", refY: "5",
    markerWidth: "6", markerHeight: "6", orient: "auto-start-reverse"
  });
  marker.appendChild(el("path", { d: "M 0 0 L 10 5 L 0 10 z", "class": "flow-arrowhead" }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  svg.appendChild(linksGroup);
  svg.appendChild(particlesGroup);
  svg.appendChild(annotationsGroup);
  svg.appendChild(nodesGroup);

  // ---- Links: curved paths from each origin to the hub ----
  var linkPaths = [];
  var linksById = {};
  ORDER.forEach(function (id) {
    var p = positions[id];
    var midX = (p.x + HUB.x) / 2;
    var midY = (p.y + HUB.y) / 2 - 18;
    var d = "M " + p.x + " " + p.y + " Q " + midX + " " + midY + " " + HUB.x + " " + HUB.y;
    var path = el("path", {
      "d": d,
      "class": "flow-link " + REGIONS[id].category,
      "marker-end": "url(#flow-arrowhead)"
    });
    linksGroup.appendChild(path);
    linkPaths.push({ id: id, path: path });
    linksById[id] = path;
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
  function clearAnnotations() {
    annotationsGroup.innerHTML = "";
  }

  function annotatePath(id) {
    var path = linksById[id];
    if (!path) return;
    var length = path.getTotalLength();
    if (!length) return;
    var region = REGIONS[id];
    var category = region.category;

    // Near-origin annotation: real volume tier
    var startPt = path.getPointAtLength(length * 0.16);
    var startLabel = el("text", {
      x: startPt.x, y: startPt.y - 8,
      "class": "flow-annotation " + category
    });
    startLabel.textContent = region.volume ? region.volume.tier : "";
    annotationsGroup.appendChild(startLabel);

    // Mid-path annotation: this country's specific role in the chain
    var midPt = path.getPointAtLength(length * 0.55);
    var midLabel = el("text", {
      x: midPt.x, y: midPt.y - 8,
      "class": "flow-annotation " + category
    });
    midLabel.textContent = ROLE_HINT[id] || "";
    annotationsGroup.appendChild(midLabel);
  }

  function showInfo(id) {
    var r = REGIONS[id];
    idxEl.textContent = r.name + " — " + r.categoryLabel;
    detailEl.textContent = (r.volume ? r.volume.tier + ". " + r.volume.note : "") ;

    var path = linksById[id];
    if (path) path.classList.add("active");
    clearAnnotations();
    annotatePath(id);
  }
  function resetInfo(id) {
    idxEl.textContent = "Select a source";
    detailEl.textContent = "Hover, focus, or tap any origin above to see its role in the chain — or click it to open its full profile on the Global Map.";

    var path = id ? linksById[id] : null;
    if (path) path.classList.remove("active");
    clearAnnotations();
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
    g.addEventListener("mouseleave", function () { resetInfo(id); });
    g.addEventListener("blur", function () { resetInfo(id); });
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
