// Weird War storefront — the military-history channel.
//
// Theme: military history buffs and enthusiasts — archival/"declassified dossier"
// energy. Field gear, surplus, model kits, reference books, map & poster prints.
// Public-facing copy is intentionally generic ("Field & Archive") and never
// references the underlying platform, the channel, or any other tenant.
//
// Added as a tenant the same way as spreadloveeverywhere.ts: a fresh random
// `opaqueSlug` (crypto.randomBytes → 12 lowercase alnum chars), its own copy,
// theme and pool, plus one line in ./registry.ts. No route or DB changes.

import { iconForProduct, placeholderImage } from "./placeholder";
import { buildMerchantSearchLink } from "./merchants";
import type { AffiliateProduct, StoreConfig } from "./types";

/** Opaque, unguessable slug — the only public identifier for this store. */
const OPAQUE_SLUG = "w04u5of29x6u";

/** A pool entry minus the fields we derive (image + outbound link). */
type PoolItem = Omit<AffiliateProduct, "imageSrc" | "url"> & {
  /** Amazon search query the outbound link points at. */
  readonly searchQuery: string;
  /** Real product image (Amazon CDN), resolved one-time by image-searching the
   *  product name (see lib/imageSearch.ts). Omit to use the placeholder card. */
  readonly image?: string;
};

// Each item links to a tagged merchant search and shows the real Amazon CDN
// image of a matching product (generated placeholder card only if `image` is
// missing). Pool is intentionally larger than `itemsPerPeriod` so rotation shows.
const pool: readonly PoolItem[] = [
  {
    id: "field-watch",
    title: "Military Field Watch",
    imageAlt: "Canvas-strap military field watch with a matte dial",
    searchQuery: "military field watch men",
    image: "https://m.media-amazon.com/images/I/71txlyhbZcL._AC_SL600_.jpg",
    blurb: "The plain, legible dial that got issued because it worked.",
    tags: ["gear", "watch", "field", "gift"],
  },
  {
    id: "lensatic-compass",
    title: "Lensatic Sighting Compass",
    imageAlt: "Olive-drab lensatic compass open on a map",
    searchQuery: "lensatic military compass",
    image: "https://m.media-amazon.com/images/I/71KpLVRzc+L._AC_SL600_.jpg",
    blurb: "Map, thumb, azimuth. Works when nothing else has a signal.",
    tags: ["gear", "navigation", "field"],
  },
  {
    id: "surplus-ammo-can",
    title: "Steel Ammo Can",
    imageAlt: "Olive-drab steel ammunition can with a latch lid",
    searchQuery: "50 cal steel ammo can",
    image: "https://m.media-amazon.com/images/I/81zWsKUg3UL._AC_SL600_.jpg",
    blurb: "Water-tight, stackable, indestructible — the original hard case.",
    tags: ["surplus", "storage", "gear"],
  },
  {
    id: "wool-military-blanket",
    title: "Heavy Wool Military Blanket",
    imageAlt: "Folded olive wool blanket with stripe detail",
    searchQuery: "wool military blanket",
    image: "https://m.media-amazon.com/images/I/71iAKXo8XiL._AC_SL600_.jpg",
    blurb: "Scratchy, warm, and still the standard a century later.",
    tags: ["surplus", "home", "wool"],
  },
  {
    id: "tank-model-kit",
    title: "1/35 Scale Tank Model Kit",
    imageAlt: "Plastic scale model tank kit on a sprue",
    searchQuery: "1/35 scale tank model kit",
    image: "https://m.media-amazon.com/images/I/91VbBa7FENL._AC_SL600_.jpg",
    blurb: "Weekends measured in sprue clippings and decal sheets.",
    tags: ["models", "hobby", "gift"],
  },
  {
    id: "aircraft-model-kit",
    title: "1/72 Scale Warplane Model Kit",
    imageAlt: "Plastic scale model fighter aircraft kit",
    searchQuery: "1/72 scale aircraft model kit ww2",
    image: "https://m.media-amazon.com/images/I/81pxQtilflL._AC_SL600_.jpg",
    blurb: "Build the odd-looking prototype nobody believes was real.",
    tags: ["models", "aviation", "hobby"],
  },
  {
    id: "morale-patch-set",
    title: "Hook-and-Loop Morale Patch Set",
    imageAlt: "Assorted embroidered morale patches",
    searchQuery: "morale patches military velcro set",
    image: "https://m.media-amazon.com/images/I/A1v89oWlGPL._AC_SL600_.jpg",
    blurb: "Unit humor, embroidered. Swap them out whenever the mood turns.",
    tags: ["patches", "gear", "gift"],
  },
  {
    id: "trench-lighter",
    title: "Brass Windproof Lighter",
    imageAlt: "Brushed brass windproof flip-top lighter",
    searchQuery: "brass windproof lighter",
    image: "https://m.media-amazon.com/images/I/71zbI8sUwUL._AC_SL600_.jpg",
    blurb: "A design that has survived every war since it was issued.",
    tags: ["gear", "edc", "brass", "gift"],
  },
  {
    id: "mre-case",
    title: "MRE Ration Meals",
    imageAlt: "Sealed military-style MRE ration pouches",
    searchQuery: "mre military meals ready to eat case",
    image: "https://m.media-amazon.com/images/I/71fbh7KICVL._AC_SL600_.jpg",
    blurb: "Flameless heater, mystery entrée, strong opinions afterward.",
    tags: ["rations", "field", "camping"],
  },
  {
    id: "p38-can-opener",
    title: "P-38 & P-51 Can Opener Pack",
    imageAlt: "Small steel P-38 can openers on a keyring",
    searchQuery: "p38 p51 military can opener",
    image: "https://m.media-amazon.com/images/I/71FGOB5sX8L._AC_SL600_.jpg",
    blurb: "An inch of stamped steel that outperformed everything modern.",
    tags: ["surplus", "edc", "kitchen"],
  },
  {
    id: "entrenching-tool",
    title: "Folding Entrenching Tool",
    imageAlt: "Folding military e-tool shovel with carry case",
    searchQuery: "folding entrenching tool military shovel",
    image: "https://m.media-amazon.com/images/I/61GQF3GK0HL._AC_SL600_.jpg",
    blurb: "Shovel, hatchet, pry bar — the trench multitool, still issued.",
    tags: ["surplus", "gear", "camping"],
  },
  {
    id: "rite-in-the-rain-notebook",
    title: "All-Weather Field Notebook",
    imageAlt: "Tan all-weather field notebook and pen",
    searchQuery: "rite in the rain field notebook",
    image: "https://m.media-amazon.com/images/I/81spE8WON8L._AC_SL600_.jpg",
    blurb: "Takes notes in a downpour without turning to pulp.",
    tags: ["field", "notebook", "edc"],
  },
  {
    id: "ww2-history-book",
    title: "Ghost Armies & Wartime Deception",
    imageAlt: "Hardcover World War II history book",
    searchQuery: "ghost army world war 2 book",
    image: "https://m.media-amazon.com/images/I/91E5GNz7xGL._AC_SL600_.jpg",
    blurb: "Inflatable tanks, fake armies, and radio traffic to nowhere.",
    tags: ["books", "history", "wwii", "gift"],
  },
  {
    id: "vintage-war-poster-set",
    title: "Vintage Wartime Poster Prints",
    imageAlt: "Set of reproduction wartime propaganda poster prints",
    searchQuery: "vintage ww2 propaganda poster prints set",
    image: "https://m.media-amazon.com/images/I/81jJSmaQQcL._AC_SL600_.jpg",
    blurb: "Faded reds and bold type — a wall that looks like an archive.",
    tags: ["decor", "poster", "archive"],
  },
  {
    id: "military-binoculars",
    title: "Ranging Binoculars with Reticle",
    imageAlt: "Rugged military-style binoculars with a rangefinder reticle",
    searchQuery: "military binoculars rangefinder reticle",
    image: "https://m.media-amazon.com/images/I/71F5WPTPxzL._AC_SL600_.jpg",
    blurb: "Mil-dot reticle, rubber armor, and a very long look.",
    tags: ["optics", "gear", "field"],
  },
  {
    id: "wargame-board-game",
    title: "WWII Tactical Board Game",
    imageAlt: "Hex-map World War II tactical board game",
    searchQuery: "memoir 44 board game",
    image: "https://m.media-amazon.com/images/I/91IZ7sDI0dL._AC_SL600_.jpg",
    blurb: "Refight the battle at the kitchen table — and lose it differently.",
    tags: ["games", "history", "gift"],
  },
];

const products: readonly AffiliateProduct[] = pool.map((item) => {
  const merchant = item.merchant ?? "amazon";
  return {
    ...item,
    url: buildMerchantSearchLink(merchant, item.searchQuery),
    imageSrc:
      item.image ??
      placeholderImage({
        merchant,
        label: item.title,
        seed: item.id,
        icon: iconForProduct(item.title, item.tags),
      }),
  };
});

export const weirdWar: StoreConfig = {
  opaqueSlug: OPAQUE_SLUG,
  storeName: "Field & Archive",
  tagline: "Surplus, scale kits, and reference for the military-history obsessed.",
  cadence: "weekly",
  itemsPerPeriod: 9,
  theme: {
    colorBackground: "#f4f1e8",
    colorForeground: "#241f18",
    colorMuted: "#6f6553",
    colorAccent: "#4a5333",
    colorAccentForeground: "#f4f1e8",
    colorCard: "#fbf9f3",
    radius: "0.25rem",
  },
  meta: {
    title: "Field & Archive — Militaria, Model Kits & History",
    description:
      "A weekly-rotating shortlist of field gear, surplus, scale model kits, archival prints and reference books for military-history enthusiasts.",
    faviconHref: `/stores/${OPAQUE_SLUG}/favicon.svg`,
    ogImageHref: `/stores/${OPAQUE_SLUG}/og.svg`,
    themeColor: "#4a5333",
  },
  disclosure:
    "As an Amazon Associate we earn from qualifying purchases. Some links on this page are affiliate links; if you buy through them we may earn a small commission at no extra cost to you.",
  products,
};
