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
    fiber: 0xEAE3D3,
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
  var camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.z = 3.3;

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cursor = "grab";

  var globeGroup = new THREE.Group();
  // A slight, deliberate starting tilt and longitude — reads as considered
  // "product photography" framing rather than a flat straight-on demo
  globeGroup.rotation.x = -0.18;
  globeGroup.rotation.y = -0.4;
  scene.add(globeGroup);

  // Solid globe body — starts as a flat fallback color, upgraded to a real
  // continent texture once world-atlas data loads below
  var solidGeo = new THREE.SphereGeometry(0.98, 64, 48);
  var solidMat = new THREE.MeshStandardMaterial({ color: COLOR.fiberDeep, roughness: 0.75, metalness: 0.05 });
  globeGroup.add(new THREE.Mesh(solidGeo, solidMat));

  // ---- Real continent texture, generated from the same world-atlas data
  // used by the Global Map, drawn in the site's own palette (not a
  // photorealistic satellite texture, which would clash with the rest of
  // the site's flat, muted look) ----
  if (typeof d3 !== "undefined" && typeof topojson !== "undefined") {
    var texW = 2048, texH = 1024;
    var canvas = document.createElement("canvas");
    canvas.width = texW; canvas.height = texH;
    var ctx = canvas.getContext("2d");

    // Ocean fill — a cooler, slightly desaturated tone so land reads clearly
    // against it, still built from the site's own palette
    ctx.fillStyle = "#C7CDC4";
    ctx.fillRect(0, 0, texW, texH);

    // Plain linear equirectangular mapping: x=0..texW maps lon -180..180,
    // y=0..texH maps lat 90..-90 — matching the same convention used by
    // latLonToVec3() below, so the texture and the markers agree on geography.
    var projection = d3.geoEquirectangular()
      .scale(texW / (2 * Math.PI))
      .translate([texW / 2, texH / 2]);
    var path = d3.geoPath(projection, ctx);

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(function (world) {
        var countries = topojson.feature(world, world.objects.countries).features;
        ctx.fillStyle = "#E9DDC1";
        ctx.strokeStyle = "#4B4F55";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.55;
        countries.forEach(function (feature) {
          ctx.beginPath();
          path(feature);
          ctx.fill();
          ctx.stroke();
        });
        ctx.globalAlpha = 1;

        var texture = new THREE.CanvasTexture(canvas);
        solidMat.map = texture;
        solidMat.color.set(0xffffff);
        solidMat.needsUpdate = true;
      })
      .catch(function (err) {
        console.error("Globe texture failed to load, using flat fallback color", err);
      });
  }

  // ---- Atmosphere glow — soft rim light around the globe's silhouette,
  // the single most recognizable signature of a polished 3D globe. Standard
  // Fresnel technique: a slightly larger sphere, back-face only, additively
  // blended, brightest where the surface normal points away from the camera. ----
  var atmosphereGeo = new THREE.SphereGeometry(1.14, 48, 32);
  var atmosphereMat = new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color(0x3A4F66) } },
    vertexShader: [
      "varying vec3 vNormal;",
      "void main() {",
      "  vNormal = normalize( normalMatrix * normal );",
      "  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
      "}"
    ].join("\n"),
    fragmentShader: [
      "uniform vec3 glowColor;",
      "varying vec3 vNormal;",
      "void main() {",
      "  float intensity = pow( 0.62 - dot( vNormal, vec3(0.0, 0.0, 1.0) ), 3.0 );",
      "  gl_FragColor = vec4( glowColor, 1.0 ) * clamp(intensity, 0.0, 1.0);",
      "}"
    ].join("\n"),
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  });
  scene.add(new THREE.Mesh(atmosphereGeo, atmosphereMat));

  var light1 = new THREE.DirectionalLight(0xffffff, 1.15);
  light1.position.set(2.2, 1.6, 2.4);
  scene.add(light1);
  var light2 = new THREE.DirectionalLight(0x3A4F66, 0.28);
  light2.position.set(-2.2, -1.2, -1.5);
  scene.add(light2);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

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

  // Shared radial-gradient halo texture — reused for every marker, tinted
  // per category via SpriteMaterial color. Matches the "ring + dot" motif
  // already used in the site's favicon and micron-scale handle.
  var haloCanvas = document.createElement("canvas");
  haloCanvas.width = 128; haloCanvas.height = 128;
  var haloCtx = haloCanvas.getContext("2d");
  var haloGrad = haloCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
  haloGrad.addColorStop(0, "rgba(255,255,255,0.85)");
  haloGrad.addColorStop(0.35, "rgba(255,255,255,0.35)");
  haloGrad.addColorStop(1, "rgba(255,255,255,0)");
  haloCtx.fillStyle = haloGrad;
  haloCtx.fillRect(0, 0, 128, 128);
  var haloTexture = new THREE.CanvasTexture(haloCanvas);

  var markerMeshes = [];
  ORDER.forEach(function (id) {
    var region = REGIONS[id];
    var geo = GEO[id];
    var pos = latLonToVec3(geo.lat, geo.lon, 1.0);
    var scale = 0.022 + (region.volume ? region.volume.level : 1) * 0.006;

    // Soft glow halo, sits just behind the solid dot
    var haloMat = new THREE.SpriteMaterial({
      map: haloTexture, color: COLOR[region.category],
      transparent: true, depthWrite: false, opacity: 0.8
    });
    var halo = new THREE.Sprite(haloMat);
    halo.scale.set(scale * 5.5, scale * 5.5, 1);
    halo.position.copy(pos);
    globeGroup.add(halo);

    var geometry = new THREE.SphereGeometry(scale, 16, 16);
    var material = new THREE.MeshStandardMaterial({
      color: COLOR[region.category], roughness: 0.4, metalness: 0.1,
      emissive: COLOR[region.category], emissiveIntensity: 0.25
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(pos);
    mesh.userData.id = id;
    mesh.userData.baseScale = 1;
    globeGroup.add(mesh);
    markerMeshes.push(mesh);
  });

  // ---- Country name labels — offset from their markers with a leader line,
  // same convention as the flat Global Map, so labels for closely clustered
  // countries (Kashmir, Afghanistan, Pakistan, Tajikistan, Kyrgyzstan) fan
  // apart instead of overlapping. Always visible, billboarded so they stay
  // readable as the globe rotates, hidden behind the globe by normal depth
  // testing when a country is on the far side. Uses the site's own mono
  // typeface once the web font has actually finished loading. ----

  // Hand-tuned fan-out angle per country (degrees, clockwise from "up" in
  // the local tangent plane) — spreads the tightly clustered Central/South
  // Asian countries in different directions so their labels don't collide.
  var LABEL_ANGLE = {
    "156": 350, "496": 10, "356": 300, "586": 330, "398": 30,
    "004": 270, "364": 250, "417": 60, "762": 90, "554": 0,
    "792": 0, "524": 130
  };

  function tangentDir(normal, angleDeg) {
    var up = new THREE.Vector3(0, 1, 0);
    var east = new THREE.Vector3().crossVectors(up, normal);
    if (east.lengthSq() < 0.0001) east.set(1, 0, 0); else east.normalize();
    var north = new THREE.Vector3().crossVectors(normal, east).normalize();
    var rad = angleDeg * Math.PI / 180;
    return north.multiplyScalar(Math.cos(rad)).add(east.multiplyScalar(Math.sin(rad)));
  }

  function labelCategoryColor(category) {
    return category === "producer" ? "#8B5A3C" :
           category === "origin" ? "#3A4F66" : "#6B7A5E";
  }

  function makeLabelSprite(text, category) {
    var canvas = document.createElement("canvas");
    var cw = 320, ch = 84;
    canvas.width = cw; canvas.height = ch;
    var ctx = canvas.getContext("2d");

    ctx.font = "600 34px 'IBM Plex Mono', monospace";
    var textWidth = ctx.measureText(text).width;
    var padX = 22;
    var pillW = Math.min(cw - 8, textWidth + padX * 2);
    var pillH = 52;
    var pillX = (cw - pillW) / 2;
    var pillY = (ch - pillH) / 2;
    var r = 8;

    ctx.fillStyle = "rgba(234,227,211,0.92)";
    ctx.strokeStyle = labelCategoryColor(category);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pillX + r, pillY);
    ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillH, r);
    ctx.arcTo(pillX + pillW, pillY + pillH, pillX, pillY + pillH, r);
    ctx.arcTo(pillX, pillY + pillH, pillX, pillY, r);
    ctx.arcTo(pillX, pillY, pillX + pillW, pillY, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#21252A";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cw / 2, ch / 2 + 2);

    var texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    var spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true });
    var sprite = new THREE.Sprite(spriteMat);
    var aspect = cw / ch;
    var height = 0.11;
    sprite.scale.set(height * aspect, height, 1);
    return sprite;
  }

  function addLabels() {
    ORDER.forEach(function (id) {
      var region = REGIONS[id];
      var geo = GEO[id];
      var normal = latLonToVec3(geo.lat, geo.lon, 1.0);
      var markerPos = normal.clone();
      var dir = tangentDir(normal, LABEL_ANGLE[id] || 0);
      var labelPos = markerPos.clone().add(dir.multiplyScalar(0.19)).add(normal.clone().multiplyScalar(0.03));

      // Leader line from marker to label, same convention as the flat map
      var lineGeo = new THREE.BufferGeometry().setFromPoints([markerPos, labelPos]);
      var lineMat = new THREE.LineBasicMaterial({ color: COLOR.line, transparent: true, opacity: 0.5 });
      globeGroup.add(new THREE.Line(lineGeo, lineMat));

      var sprite = makeLabelSprite(region.name, region.category);
      sprite.position.copy(labelPos);
      globeGroup.add(sprite);
    });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(addLabels);
  } else {
    addLabels();
  }

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
