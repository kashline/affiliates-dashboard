// Everyday Top Picks — the general storefront served at the root route (/).
//
// Unlike the channel stores, this one has no channel behind it: it exists so
// stray traffic landing on the bare domain sees a real store with tagged
// affiliate links instead of a 404. Theme: broadly popular, useful items across
// categories (kitchen, tech, home, fitness, travel, pets) — nothing niche.
//
// It is registered in ./registry.ts like any other store, so the weekly Claude
// refresh curates it too, and it is additionally rendered by app/page.tsx.

import { iconForProduct, placeholderImage } from "./placeholder";
import { buildMerchantSearchLink } from "./merchants";
import type { AffiliateProduct, StoreConfig } from "./types";

/** Opaque slug — used for asset paths, KV keys, and rotation seeding. The store
 *  is *also* reachable here like any tenant, but its canonical home is `/`. */
const OPAQUE_SLUG = "pWiKS5MDkXI";

/** A pool entry minus the fields we derive (image + outbound link). */
type PoolItem = Omit<AffiliateProduct, "imageSrc" | "url"> & {
  /** Amazon search query the outbound link points at. */
  readonly searchQuery: string;
  /** Real product image (Amazon CDN), resolved one-time by image-searching the
   *  product name (see lib/imageSearch.ts). Omit to use the placeholder card. */
  readonly image?: string;
};

// Pool of broadly popular items. Each links to a tagged merchant search and
// shows the real Amazon CDN image of a matching product (placeholder card only
// if `image` is missing). Pool is larger than `itemsPerPeriod` so rotation shows.
const pool: readonly PoolItem[] = [
  {
    id: "wireless-earbuds",
    title: "Wireless Noise-Cancelling Earbuds",
    imageAlt: "Pair of wireless earbuds in a charging case",
    searchQuery: "wireless noise cancelling earbuds",
    image: "https://m.media-amazon.com/images/I/7159EmTam6L._AC_SL600_.jpg",
    blurb: "Commutes, workouts, and long flights — all a little quieter.",
    tags: ["tech", "audio", "travel"],
  },
  {
    id: "compact-air-fryer",
    title: "Compact Air Fryer",
    imageAlt: "Countertop air fryer",
    searchQuery: "compact air fryer",
    image: "https://m.media-amazon.com/images/I/71IyaqAfuKL._AC_SL600_.jpg",
    blurb: "Crispy weeknight dinners without heating up the whole kitchen.",
    tags: ["kitchen", "appliance", "food"],
  },
  {
    id: "insulated-tumbler",
    title: "40 oz Insulated Tumbler",
    imageAlt: "Insulated tumbler with straw lid",
    searchQuery: "40 oz insulated tumbler with handle",
    image: "https://m.media-amazon.com/images/I/61r8CTh0WHL._AC_SL600_.jpg",
    blurb: "Ice that's still ice at 5pm. The cup everyone ends up owning.",
    tags: ["hydration", "travel", "cup"],
  },
  {
    id: "robot-vacuum",
    title: "Robot Vacuum",
    imageAlt: "Robot vacuum cleaning a wood floor",
    searchQuery: "robot vacuum",
    image: "https://m.media-amazon.com/images/I/71xa7jk7SJL._AC_SL600_.jpg",
    blurb: "Come home to clean floors you didn't have to think about.",
    tags: ["home", "cleaning", "tech"],
  },
  {
    id: "slim-power-bank",
    title: "Slim USB-C Power Bank",
    imageAlt: "Slim portable power bank charging a phone",
    searchQuery: "slim power bank usb c",
    image: "https://m.media-amazon.com/images/I/71M9CcKqPeL._AC_SL600_.jpg",
    blurb: "A full extra charge that disappears into any bag or pocket.",
    tags: ["tech", "travel", "charger"],
  },
  {
    id: "cooling-weighted-blanket",
    title: "Cooling Weighted Blanket",
    imageAlt: "Weighted blanket folded on a bed",
    searchQuery: "cooling weighted blanket",
    image: "https://m.media-amazon.com/images/I/71DP-ND-rpL._AC_SL600_.jpg",
    blurb: "The deep-pressure calm of a hug, minus the overheating.",
    tags: ["home", "cozy", "sleep"],
  },
  {
    id: "packing-cubes",
    title: "Travel Packing Cube Set",
    imageAlt: "Set of zippered packing cubes in a suitcase",
    searchQuery: "packing cubes set",
    image: "https://m.media-amazon.com/images/I/81YCPVT1pXL._AC_SL600_.jpg",
    blurb: "Turn suitcase chaos into neat little drawers you can grab.",
    tags: ["travel", "organization", "luggage"],
  },
  {
    id: "cast-iron-skillet",
    title: "Pre-Seasoned Cast Iron Skillet",
    imageAlt: "Cast iron skillet on a stovetop",
    searchQuery: "cast iron skillet",
    image: "https://m.media-amazon.com/images/I/71NwXbY+6nL._AC_SL600_.jpg",
    blurb: "The pan that outlives every other pan — and gets better with age.",
    tags: ["kitchen", "cooking", "food"],
  },
  {
    id: "smart-plug-4-pack",
    title: "Smart Plug 4-Pack",
    imageAlt: "Smart plugs in a wall outlet",
    searchQuery: "smart plug 4 pack",
    image: "https://m.media-amazon.com/images/I/61bkwhCmFSL._AC_SL600_.jpg",
    blurb: "Lamps, fans, holiday lights — on a schedule or a voice command.",
    tags: ["tech", "home", "smart-home"],
  },
  {
    id: "resistance-band-set",
    title: "Resistance Band Set",
    imageAlt: "Set of loop resistance bands",
    searchQuery: "resistance bands set",
    image: "https://m.media-amazon.com/images/I/71p6dAKPG9L._AC_SL600_.jpg",
    blurb: "A full-body gym that fits in a drawer (or a carry-on).",
    tags: ["fitness", "workout", "home-gym"],
  },
  {
    id: "sunrise-alarm-clock",
    title: "Sunrise Alarm Clock",
    imageAlt: "Bedside sunrise alarm clock glowing warmly",
    searchQuery: "sunrise alarm clock",
    image: "https://m.media-amazon.com/images/I/71-zhRELUQL._AC_SL600_.jpg",
    blurb: "Wake up to a slow dawn instead of a blaring phone.",
    tags: ["home", "sleep", "morning"],
  },
  {
    id: "adjustable-laptop-stand",
    title: "Adjustable Laptop Stand",
    imageAlt: "Laptop raised on an adjustable aluminum stand",
    searchQuery: "adjustable laptop stand",
    image: "https://m.media-amazon.com/images/I/71b5-q05iVL._AC_SL600_.jpg",
    blurb: "Eye-level screen, cooler laptop, happier neck.",
    tags: ["office", "desk", "tech"],
  },
  {
    id: "milk-frother",
    title: "Handheld Milk Frother",
    imageAlt: "Handheld frother whisking milk in a mug",
    searchQuery: "handheld milk frother",
    image: "https://m.media-amazon.com/images/I/51UV1s9ARtL._AC_SL600_.jpg",
    blurb: "Cafe-style lattes and matcha for the price of one coffee run.",
    tags: ["kitchen", "coffee", "mug"],
  },
  {
    id: "dog-toy-bundle",
    title: "Durable Dog Toy Bundle",
    imageAlt: "Assorted durable dog chew toys",
    searchQuery: "durable dog toy bundle",
    image: "https://m.media-amazon.com/images/I/81i3YrlG4oL._AC_SL600_.jpg",
    blurb: "A rotation of new favorites for the resident heavy chewer.",
    tags: ["pets", "dog", "toy"],
  },
  {
    id: "cat-scratcher-lounge",
    title: "Cardboard Cat Scratcher Lounge",
    imageAlt: "Cat lounging on a cardboard scratcher",
    searchQuery: "cat scratcher lounge",
    image: "https://m.media-amazon.com/images/I/71fDvW2hH9L._AC_SL600_.jpg",
    blurb: "Save the couch. This is the spot now — cats agree.",
    tags: ["pets", "cat", "scratcher"],
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

export const everydayTopPicks: StoreConfig = {
  opaqueSlug: OPAQUE_SLUG,
  storeName: "Everyday Top Picks",
  tagline: "A rotating shortlist of popular, genuinely useful finds.",
  cadence: "weekly",
  itemsPerPeriod: 9,
  theme: {
    colorBackground: "#f8fafc",
    colorForeground: "#0f172a",
    colorMuted: "#64748b",
    colorAccent: "#4f46e5",
    colorAccentForeground: "#ffffff",
    colorCard: "#ffffff",
    radius: "0.75rem",
  },
  meta: {
    title: "Everyday Top Picks — Popular, Useful Finds",
    description:
      "A hand-picked, weekly-rotating shortlist of popular products people actually use — kitchen, tech, home, fitness, travel, and pets.",
    faviconHref: `/stores/${OPAQUE_SLUG}/favicon.svg`,
    ogImageHref: `/stores/${OPAQUE_SLUG}/og.svg`,
    themeColor: "#4f46e5",
  },
  disclosure:
    "As an Amazon Associate we earn from qualifying purchases. Some links on this page are affiliate links; if you buy through them we may earn a small commission at no extra cost to you.",
  products,
};
