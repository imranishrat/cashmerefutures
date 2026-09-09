// ISO 3166-1 numeric id -> region info
// Shared data source used by both js/map.js (the Global Map) and
// js/supply-flow.js (the Supply Chain page's flow diagram) — kept in one
// place so the two features can never show conflicting numbers.
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
