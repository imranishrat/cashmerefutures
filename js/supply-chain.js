(function () {
  var STAGES = [
    {
      name: "Herding & Combing",
      who: ["Herders"],
      summary: "Cashmere goats grow a soft undercoat each winter to survive extreme cold, then shed it naturally as temperatures rise in spring. Herders comb this undercoat out by hand during the few-week moulting window — a slower, gentler method than shearing, and the one most valued for fibre quality. A single goat yields only around 100–250 grams of raw fibre a year, and less than half of that once cleaned — which is a large part of why cashmere is so labour-intensive relative to sheep's wool.",
      transform: "Direct-trade and cooperative models that let herders sell closer to the finished price, rather than through several layers of middlemen, are one of the more direct ways more value could stay with the people who raise the goats.",
      related: { label: "Meet the herding communities behind this stage →", href: "communities.html" }
    },
    {
      name: "Sorting & Dehairing",
      who: ["Industry"],
      summary: "Raw fibre as combed from the goat is a mix of the fine, soft down and coarser \u201cguard hairs\u201d that protect the goat's outer coat. Dehairing mechanically separates the two — a technically demanding step, since damaging the delicate down fibres at this stage lowers quality and value for everything that follows.",
      transform: "This step is currently concentrated in a handful of industrial hubs. Smaller-scale, regionally sited dehairing infrastructure could let more processing — and more value — happen closer to where the fibre is actually raised.",
      related: null
    },
    {
      name: "Grading",
      who: ["Industry"],
      summary: "Cleaned fibre is sorted by micron (diameter), staple length, and colour. This is where a batch becomes Grade A, B, or C — the single biggest determinant of where it ends up in the market, from ultra-fine knitwear down to coarser outerwear blends.",
      transform: "Grading is often controlled entirely by buyers. Independent, transparent grading standards — verifiable by producers themselves — could shift real negotiating power back toward the start of the chain.",
      related: { label: "See the interactive micron scale on the homepage →", href: "index.html#scale-track-wrap" }
    },
    {
      name: "Spinning",
      who: ["Industry"],
      summary: "Graded fibre is spun into yarn, twisting individual fibres together into a continuous, workable thread. Finer grades typically go into thinner yarns for luxury knitwear, coarser grades into heavier yarns for outerwear. Most spinning today is industrial, but hand-spinning traditions persist in places like Kashmir, where artisans still draw yarn entirely by hand on a traditional wheel called a yinder — a method so slow that a single spinner produces only around 50 grams of thread in a month.",
      transform: "Investment in small-scale, community-run spinning infrastructure — rather than shipping all raw fibre out to large industrial mills — could keep more of this stage's value inside producing regions.",
      related: null
    },
    {
      name: "Dyeing",
      who: ["Industry", "Artisans"],
      summary: "Yarn — or sometimes raw fibre before spinning — is dyed to the desired colour. Large manufacturers use controlled industrial dyeing for consistency at scale, while some artisan traditions still use natural or hand-applied dye methods passed down through generations.",
      transform: "Lower-impact dyeing methods and better wastewater treatment are a live area of industry innovation at industrial scale, and a genuine point where environmental and craft priorities can reinforce each other rather than compete.",
      related: null
    },
    {
      name: "Weaving & Knitting",
      who: ["Artisans", "Industry"],
      summary: "Yarn becomes fabric or a finished garment. This ranges from fully industrial knitting machines producing garments at scale, to hand-weaving traditions like Kashmiri pashmina, where a shawl is set on a wooden handloom and can take 180\u2013250 hours to complete. Some techniques, like the Kani weave from the village of Kanihama, weave the pattern directly into the cloth using small hand-carved bobbins, rather than adding it afterward.",
      transform: "Direct partnerships between artisan weavers and designers or brands — cutting out several layers of intermediaries — are already reshaping who actually benefits from hand-woven craftsmanship.",
      related: { label: "Learn about artisan communities →", href: "communities.html" }
    },
    {
      name: "Finishing & QC",
      who: ["Industry"],
      summary: "Finished pieces are brushed, pressed, and inspected — checking for pilling, evenness, and overall quality before anything is approved for sale. This is also typically where care labelling and country-of-origin information is finalised.",
      transform: "Digital traceability and certification introduced at this stage could let a finished garment carry verifiable, checkable proof of its real origin and labour conditions — not just a label a shopper has to take on trust.",
      related: null
    },
    {
      name: "Retail & Brand",
      who: ["Brands"],
      summary: "The finished garment reaches the market through a retailer or brand — the point where nearly all of the labour, knowledge, and risk carried by everyone upstream becomes a price tag a consumer sees, with little visibility back into where or how it was made.",
      transform: "Growing consumer demand for transparency is starting to push brands to disclose more of the chain behind a garment — turning visibility itself into a lever that can pull change back through every stage before it.",
      related: { label: "Interested in sourcing or partnership? →", href: "collaborate.html" }
    }
  ];

  var nodesWrap = document.getElementById("chain-nodes");
  var lineFill = document.getElementById("chain-line-fill");
  var panelIdx = document.getElementById("chain-idx");
  var panelName = document.getElementById("chain-name");
  var panelSummary = document.getElementById("chain-summary");
  var panelWho = document.getElementById("chain-who");
  var panelTransform = document.getElementById("chain-transform");
  var panelRelated = document.getElementById("chain-related");
  var prevBtn = document.getElementById("chain-prev");
  var nextBtn = document.getElementById("chain-next");

  if (!nodesWrap) return;

  var current = 0;

  function render() {
    var stage = STAGES[current];

    panelIdx.textContent = "Stage " + (current + 1) + " of " + STAGES.length;
    panelName.textContent = stage.name;
    panelSummary.textContent = stage.summary;

    panelWho.innerHTML = "";
    stage.who.forEach(function (w) {
      var span = document.createElement("span");
      span.className = "tag";
      span.textContent = w;
      panelWho.appendChild(span);
    });

    panelTransform.textContent = stage.transform;

    if (stage.related) {
      panelRelated.hidden = false;
      panelRelated.textContent = stage.related.label;
      panelRelated.href = stage.related.href;
    } else {
      panelRelated.hidden = true;
    }

    var nodes = nodesWrap.querySelectorAll(".chain-node");
    nodes.forEach(function (n, i) {
      n.classList.toggle("active", i === current);
      n.setAttribute("aria-current", i === current ? "true" : "false");
    });

    var fillPct = STAGES.length > 1 ? (current / (STAGES.length - 1)) * 100 : 0;
    if (lineFill) lineFill.style.width = fillPct + "%";

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === STAGES.length - 1;

    var params = new URLSearchParams(window.location.search);
    params.set("stage", current + 1);
    history.replaceState(null, "", window.location.pathname + "?" + params.toString());
  }

  function goTo(i) {
    current = Math.max(0, Math.min(STAGES.length - 1, i));
    render();
  }

  STAGES.forEach(function (stage, i) {
    var btn = document.createElement("button");
    btn.className = "chain-node";
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.innerHTML = '<span class="dot" aria-hidden="true"></span><span class="lbl">' + stage.name + "</span>";
    btn.addEventListener("click", function () { goTo(i); });
    nodesWrap.appendChild(btn);
  });

  prevBtn.addEventListener("click", function () { goTo(current - 1); });
  nextBtn.addEventListener("click", function () { goTo(current + 1); });

  nodesWrap.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { goTo(current + 1); e.preventDefault(); }
    if (e.key === "ArrowLeft") { goTo(current - 1); e.preventDefault(); }
  });

  // Deep-linking: supply-chain.html?stage=3
  var params = new URLSearchParams(window.location.search);
  var startStage = parseInt(params.get("stage"), 10);
  if (startStage && startStage >= 1 && startStage <= STAGES.length) {
    current = startStage - 1;
  }

  render();
})();
