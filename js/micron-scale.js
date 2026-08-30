(function () {
  var trackWrap = document.getElementById("scale-track-wrap");
  var handle = document.getElementById("scale-handle");
  if (!trackWrap || !handle) return;

  var valueEl = document.getElementById("scale-value");
  var gradeEl = document.getElementById("scale-grade");
  var useEl = document.getElementById("scale-use");
  var hairEl = document.getElementById("scale-hair");

  var MIN = 14, MAX = 20;       // scale domain, matches the tick labels
  var HUMAN_HAIR = 90;          // microns, approximate — for comparison only

  var reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function gradeFor(v) {
    if (v < 16.5) return { grade: "Grade A", use: "luxury knitwear", color: "var(--indigo)" };
    if (v < 19) return { grade: "Grade B", use: "soft, everyday wear", color: "var(--grass)" };
    return { grade: "Grade C", use: "outerwear & blankets", color: "var(--madder)" };
  }

  function setValue(v) {
    v = Math.max(MIN, Math.min(MAX, v));
    v = Math.round(v * 10) / 10;

    var fraction = (v - MIN) / (MAX - MIN);
    handle.style.left = (fraction * 100) + "%";
    handle.setAttribute("aria-valuenow", v);

    var g = gradeFor(v);
    var display = v >= 20 ? "20μ+" : v.toFixed(1) + "μ";
    valueEl.textContent = display;
    gradeEl.textContent = g.grade;
    useEl.textContent = g.use;

    var ratio = (HUMAN_HAIR / v).toFixed(1);
    hairEl.textContent = "~" + ratio + "× finer than a human hair (\u2248" + HUMAN_HAIR + "\u03bc)";

    handle.style.background = g.color;
    handle.style.boxShadow = "0 0 0 1px " + g.color;
  }

  function valueFromClientX(clientX) {
    var rect = trackWrap.getBoundingClientRect();
    var fraction = (clientX - rect.left) / rect.width;
    fraction = Math.max(0, Math.min(1, fraction));
    return MIN + fraction * (MAX - MIN);
  }

  var dragging = false;

  function onPointerDown(e) {
    dragging = true;
    handle.setPointerCapture && handle.setPointerCapture(e.pointerId);
    setValue(valueFromClientX(e.clientX));
    e.preventDefault();
  }
  function onPointerMove(e) {
    if (!dragging) return;
    setValue(valueFromClientX(e.clientX));
  }
  function onPointerUp() { dragging = false; }

  handle.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  // Clicking anywhere on the track jumps the handle there
  trackWrap.addEventListener("pointerdown", function (e) {
    if (e.target === handle) return;
    setValue(valueFromClientX(e.clientX));
  });

  handle.addEventListener("keydown", function (e) {
    var current = parseFloat(handle.getAttribute("aria-valuenow")) || MIN;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      setValue(current - 0.5); e.preventDefault();
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      setValue(current + 0.5); e.preventDefault();
    } else if (e.key === "Home") {
      setValue(MIN); e.preventDefault();
    } else if (e.key === "End") {
      setValue(MAX); e.preventDefault();
    }
  });

  // Initial position + a one-time settle animation (skipped for reduced motion)
  var DEFAULT_VALUE = 15.5;
  if (reducedMotion) {
    setValue(DEFAULT_VALUE);
  } else {
    setValue(MIN);
    var start = null;
    var duration = 550;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      setValue(MIN + eased * (DEFAULT_VALUE - MIN));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
})();
