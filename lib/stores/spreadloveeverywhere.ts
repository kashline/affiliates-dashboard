// SpreadLoveEverywhere storefront — the MVP channel.
//
// Theme: wholesome moments and sentimentality, especially around pets and loved ones.
// Public-facing copy is intentionally generic ("Warm & Fuzzy Finds") and never
// references the underlying platform or any other channel.
//
// To add another channel later: copy this file, give it a fresh `opaqueSlug`
// (crypto.randomBytes(8).toString("base64url")), swap the copy/theme/products, and
// register it in ./registry.ts. No route or DB changes are needed.

import { iconForProduct, placeholderImage } from "./placeholder";
import { buildMerchantSearchLink } from "./merchants";
import type { AffiliateProduct, StoreConfig } from "./types";

/** Opaque, unguessable slug — the only public identifier for this store. */
const OPAQUE_SLUG = "k7m2qx9fa3hd";

/** A pool entry minus the fields we derive (image + outbound link). */
type PoolItem = Omit<AffiliateProduct, "imageSrc" | "url"> & {
  /** Amazon/Chewy search query the outbound link points at. */
  readonly searchQuery: string;
};

// Placeholder pool. Real product photos get swapped in once PA-API / a product
// feed is available; for now each item links to a tagged merchant search and uses
// a generated, brand-styled "View on <Merchant>" card (see ./placeholder.ts).
// Pool is intentionally larger than `itemsPerPeriod` so rotation is visible.
const pool: readonly PoolItem[] = [
  {
    id: "custom-pet-portrait",
    title: "Custom Pet Portrait",
    imageAlt: "Hand-illustrated portrait of a beloved pet",
    searchQuery: "custom pet portrait",
    blurb: "Turn your furry best friend into a keepsake worth framing.",
    tags: ["pets", "keepsake", "art", "gift"],
  },
  {
    id: "memory-photo-frame",
    title: "Engraved Memory Photo Frame",
    imageAlt: "Wooden photo frame engraved with a heartfelt message",
    searchQuery: "engraved photo frame",
    blurb: "Hold a cherished moment close with a frame made to last.",
    tags: ["keepsake", "loved-ones", "home", "gift"],
  },
  {
    id: "cozy-throw-blanket",
    title: "Cozy Heartfelt Throw Blanket",
    imageAlt: "Soft throw blanket draped over a couch",
    searchQuery: "personalized throw blanket",
    blurb: "Wrap someone you love in a hug they can keep.",
    tags: ["cozy", "loved-ones", "home", "gift"],
  },
  {
    id: "pet-memorial-stone",
    title: "Pet Memorial Garden Stone",
    imageAlt: "Engraved garden stone honoring a pet",
    searchQuery: "pet memorial garden stone",
    blurb: "A gentle tribute to the paw prints left on your heart.",
    tags: ["pets", "keepsake", "memorial", "garden"],
  },
  {
    id: "personalized-star-map",
    title: "Personalized Night Sky Star Map",
    imageAlt: "Framed star map of a special date",
    searchQuery: "personalized star map print",
    blurb: "Capture the exact sky from the night that changed everything.",
    tags: ["keepsake", "loved-ones", "art", "gift", "star"],
  },
  {
    id: "scented-comfort-candle",
    title: "Hand-Poured Comfort Candle",
    imageAlt: "Lit soy candle in a soft-glow jar",
    searchQuery: "hand poured soy candle",
    blurb: "Soft light and a warm scent for slow, tender evenings.",
    tags: ["cozy", "self-care", "home", "candle"],
  },
  {
    id: "matching-friendship-bracelets",
    title: "Matching Friendship Bracelets",
    imageAlt: "Pair of matching beaded bracelets",
    searchQuery: "matching friendship bracelets",
    blurb: "Carry a little piece of someone special wherever you go.",
    tags: ["loved-ones", "jewelry", "gift"],
  },
  {
    id: "open-when-letters",
    title: "‘Open When’ Letter Set",
    imageAlt: "Set of sealed letters labeled for different moments",
    searchQuery: "open when letters set",
    blurb: "Little notes of love, ready for exactly the right moment.",
    tags: ["loved-ones", "keepsake", "gift", "letter"],
  },
  {
    id: "family-recipe-board",
    title: "Engraved Family Recipe Board",
    imageAlt: "Cutting board engraved with a handwritten recipe",
    searchQuery: "engraved recipe cutting board",
    blurb: "Keep a grandparent's handwriting on the kitchen counter forever.",
    tags: ["loved-ones", "keepsake", "home", "kitchen"],
  },
  {
    id: "photo-memory-book",
    title: "Personalized Photo Memory Book",
    imageAlt: "Open photo book filled with memories",
    searchQuery: "personalized photo book",
    blurb: "Gather a year of little moments into one keepsake to revisit.",
    tags: ["keepsake", "loved-ones", "gift", "photo"],
  },
  {
    id: "warm-tea-sampler",
    title: "Cozy Evening Tea Sampler",
    imageAlt: "Assorted tea sampler in a gift tin",
    searchQuery: "tea sampler gift set",
    blurb: "A quiet ritual to share — or to savor all on your own.",
    tags: ["cozy", "self-care", "gift", "tea"],
  },
  // --- Chewy (placeholder affiliate) — pet-focused picks ---
  {
    id: "chewy-orthopedic-dog-bed",
    merchant: "chewy",
    title: "Orthopedic Memory-Foam Dog Bed",
    imageAlt: "Plush orthopedic dog bed",
    searchQuery: "orthopedic dog bed",
    blurb: "Give an old soul (or a sleepy pup) the comfiest spot in the house.",
    tags: ["pets", "dog", "bed", "comfort", "gift"],
  },
  {
    id: "chewy-salmon-dog-treats",
    merchant: "chewy",
    title: "Wild Salmon Training Treats",
    imageAlt: "Bag of salmon dog training treats",
    searchQuery: "salmon dog training treats",
    blurb: "Tiny, wholesome rewards for the goodest of good boys and girls.",
    tags: ["pets", "dog", "treat", "gift"],
  },
  {
    id: "chewy-catnip-plush-set",
    merchant: "chewy",
    title: "Catnip Plush Toy Set",
    imageAlt: "Set of catnip-filled plush cat toys",
    searchQuery: "catnip plush cat toys",
    blurb: "A little chaos and a lot of joy for your favorite feline.",
    tags: ["pets", "cat", "toy", "gift"],
  },
  {
    id: "chewy-elevated-pet-bowls",
    merchant: "chewy",
    title: "Elevated Stainless Pet Bowls",
    imageAlt: "Raised stainless steel pet feeding bowls",
    searchQuery: "elevated stainless steel pet bowls",
    blurb: "Mealtime made tidy and easy on growing (and aging) joints.",
    tags: ["pets", "dog", "bowl", "feeder"],
  },
];

const products: readonly AffiliateProduct[] = pool.map((item) => {
  const merchant = item.merchant ?? "amazon";
  return {
    ...item,
    url: buildMerchantSearchLink(merchant, item.searchQuery),
    imageSrc: placeholderImage({
      merchant,
      label: item.title,
      seed: item.id,
      icon: iconForProduct(item.title, item.tags),
    }),
  };
});

export const spreadLoveEverywhere: StoreConfig = {
  opaqueSlug: OPAQUE_SLUG,
  storeName: "Warm & Fuzzy Finds",
  tagline: "Little gifts for the moments and the ones that matter most.",
  cadence: "weekly",
  itemsPerPeriod: 9,
  theme: {
    colorBackground: "#fff7f9",
    colorForeground: "#3a2730",
    colorMuted: "#8a6f78",
    colorAccent: "#e8638a",
    colorAccentForeground: "#ffffff",
    colorCard: "#ffffff",
    radius: "1rem",
  },
  meta: {
    title: "Warm & Fuzzy Finds — Heartfelt Gifts",
    description:
      "A handpicked collection of cozy, sentimental gifts for pets and the people you love.",
    faviconHref: `/stores/${OPAQUE_SLUG}/favicon.svg`,
    ogImageHref: `/stores/${OPAQUE_SLUG}/og.svg`,
    themeColor: "#e8638a",
  },
  disclosure:
    "As an Amazon Associate we earn from qualifying purchases. Some links on this page are affiliate links; if you buy through them we may earn a small commission at no extra cost to you.",
  products,
};
