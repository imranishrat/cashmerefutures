(function () {
  var container = document.getElementById("globe-container");
  if (!container || typeof THREE === "undefined" || typeof REGIONS === "undefined") return;

  // Real lat/long of each country's actual producing region (not just capital
  // cities) — e.g. Kashmir/Ladakh for India, Inner Mongolia for China —
  // matching what each country's profile on the Global Map already describes.
  var GEO = {
    "156": { lat: 40.8, lon: 105.0 },   // China — Inner Mongolia / Xinjiang
    "496": { lat: 46.8, lon: 103.8 },   // Mongolia — Gobi / steppe
    "356": { lat: 34.2, lon: 77.6 },    // India — Kashmir / Ladakh
    "586": { lat: 35.9, lon: 74.3 },    // Pakistan — northern mountains
    "004": { lat: 34.5, lon: 69.2 },    // Afghanistan — northern regions
    "364": { lat: 32.4, lon: 53.7 },    // Iran — arid central regions
    "417": { lat: 41.2, lon: 74.8 },    // Kyrgyzstan — highland pasture
    "762": { lat: 38.9, lon: 71.0 },    // Tajikistan — highlands
    "554": { lat: -43.5, lon: 172.6 },  // New Zealand — South Island
    "398": { lat: 48.0, lon: 66.9 },    // Kazakhstan — steppe
    "792": { lat: 39.9, lon: 35.0 },    // Turkey — central Anatolia
    "524": { lat: 28.4, lon: 84.1 }     // Nepal — high-altitude districts
  };

  var ORDER = ["156", "496", "356", "586", "398", "004", "364", "417", "762", "554", "792", "524"];

  var COLOR = {
    producer: 0x8B5A3C,
    origin: 0x3A4F66,
    emerging: 0x6B7A5E,
    fiberDeep: 0xDCD3BC,
    line: 0x4B4F55
  };

  var reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var idxEl = document.getElementById("flow-idx");
  var detailEl = document.getElementById("flow-detail");
  var fallbackList = document.getElementById("globe-fallback-list");

  function showInfo(id) {
    var r = REGIONS[id];
    idxEl.textContent = r.name + " — " + r.categoryLabel;
    detailEl.textContent = r.volume ? r.volume.tier + ". " + r.volume.note : "";
  }
  function resetInfo() {
    idxEl.textContent = "Select a source";
    detailEl.textContent = "Drag the globe to rotate it, hover or tap a point to see its role in the chain, or use the list below — click any source to open its full profile on the Global Map.";
  }
  function goTo(id) { window.location.href = "map.html?region=" + id; }

  // ---- Accessible fallback list (keyboard-operable, works with no mouse) ----
  ORDER.forEach(function (id) {
    var region = REGIONS[id];
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "globe-chip " + region.category;
    btn.textContent = region.name;
    btn.addEventListener("mouseenter", function () { showInfo(id); });
    btn.addEventListener("focus", function () { showInfo(id); });
    btn.addEventListener("mouseleave", resetInfo);
    btn.addEventListener("blur", resetInfo);
    btn.addEventListener("click", function () { goTo(id); });
    fallbackList.appendChild(btn);
  });

  // ---- Scene setup ----
  var width = container.clientWidth;
  var height = Math.max(320, Math.min(520, width * 0.62));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 3.1;

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cursor = "grab";

  var globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Solid globe body, softly shaded
  var solidGeo = new THREE.SphereGeometry(0.98, 48, 32);
  var solidMat = new THREE.MeshPhongMaterial({ color: COLOR.fiberDeep, shininess: 4 });
  globeGroup.add(new THREE.Mesh(solidGeo, solidMat));

  // Wireframe graticule — a UV sphere's own segments already trace clean
  // latitude/longitude lines, no custom grid geometry needed
  var wireGeo = new THREE.SphereGeometry(1.0, 24, 16);
  var wireMat = new THREE.MeshBasicMaterial({ color: COLOR.line, wireframe: true, transparent: true, opacity: 0.28 });
  globeGroup.add(new THREE.Mesh(wireGeo, wireMat));

  var light1 = new THREE.DirectionalLight(0xffffff, 0.9);
  light1.position.set(2, 2, 3);
  scene.add(light1);
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  // ---- Country markers ----
  function latLonToVec3(lat, lon, r) {
    var phi = (90 - lat) * (Math.PI / 180);
    var theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  var markerMeshes = [];
  ORDER.forEach(function (id) {
    var region = REGIONS[id];
    var geo = GEO[id];
    var pos = latLonToVec3(geo.lat, geo.lon, 1.0);
    var scale = 0.022 + (region.volume ? region.volume.level : 1) * 0.006;
    var geometry = new THREE.SphereGeometry(scale, 12, 12);
    var material = new THREE.MeshBasicMaterial({ color: COLOR[region.category] });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(pos);
    mesh.userData.id = id;
    mesh.userData.baseScale = 1;
    globeGroup.add(mesh);
    markerMeshes.push(mesh);
  });

  // ---- Interaction: drag-to-rotate, click-vs-drag distinction, hover raycasting ----
  var raycaster = new THREE.Raycaster();
  raycaster.params.Mesh.threshold = 0.01;
  var pointer = new THREE.Vector2();
  var dragging = false;
  var dragMoved = 0;
  var lastX = 0, lastY = 0;
  var hovered = null;
  var autoRotate = !reducedMotion;

  function setPointerFromEvent(e) {
    var rect = container.getBoundingClientRect();
    var cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    var cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    pointer.x = (cx / rect.width) * 2 - 1;
    pointer.y = -(cy / rect.height) * 2 + 1;
    return { x: cx, y: cy };
  }

  function pickMarker() {
    raycaster.setFromCamera(pointer, camera);
    var hits = raycaster.intersectObjects(markerMeshes);
    return hits.length ? hits[0].object : null;
  }

  function setHovered(mesh) {
    if (hovered === mesh) return;
    if (hovered) hovered.scale.setScalar(1);
    hovered = mesh;
    if (hovered) {
      hovered.scale.setScalar(1.6);
      showInfo(hovered.userData.id);
      renderer.domElement.style.cursor = "pointer";
    } else {
      resetInfo();
      renderer.domElement.style.cursor = dragging ? "grabbing" : "grab";
    }
  }

  function onPointerDown(e) {
    dragging = true;
    dragMoved = 0;
    var p = setPointerFromEvent(e);
    lastX = p.x; lastY = p.y;
    renderer.domElement.style.cursor = "grabbing";
  }
  function onPointerMove(e) {
    var p = setPointerFromEvent(e);
    if (dragging) {
      var dx = p.x - lastX, dy = p.y - lastY;
      dragMoved += Math.abs(dx) + Math.abs(dy);
      globeGroup.rotation.y += dx * 0.006;
      globeGroup.rotation.x += dy * 0.006;
      globeGroup.rotation.x = Math.max(-1.1, Math.min(1.1, globeGroup.rotation.x));
      lastX = p.x; lastY = p.y;
    } else {
      setHovered(pickMarker());
    }
  }
  function onPointerUp() {
    if (dragging && dragMoved < 6) {
      var mesh = pickMarker();
      if (mesh) goTo(mesh.userData.id);
    }
    dragging = false;
    renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
  }
  function onPointerLeave() {
    dragging = false;
    setHovered(null);
  }

  renderer.domElement.addEventListener("mousedown", onPointerDown);
  renderer.domElement.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);
  renderer.domElement.addEventListener("mouseleave", onPointerLeave);
  renderer.domElement.addEventListener("touchstart", onPointerDown, { passive: true });
  renderer.domElement.addEventListener("touchmove", onPointerMove, { passive: true });
  renderer.domElement.addEventListener("touchend", onPointerUp);

  // ---- Resize handling ----
  function resize() {
    var w = container.clientWidth;
    var h = Math.max(320, Math.min(520, w * 0.62));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resize).observe(container);
  } else {
    window.addEventListener("resize", resize);
  }

  // ---- Render loop ----
  function animate() {
    requestAnimationFrame(animate);
    if (autoRotate && !dragging && !hovered) {
      globeGroup.rotation.y += 0.0022;
    }
    renderer.render(scene, camera);
  }
  animate();
})();
