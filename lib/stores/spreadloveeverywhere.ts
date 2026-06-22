// SpreadLoveEverywhere storefront — the MVP channel.
//
// Theme: wholesome moments and sentimentality, especially around pets and loved ones.
// Public-facing copy is intentionally generic ("Warm & Fuzzy Finds") and never
// references the underlying platform or any other channel.
//
// To add another channel later: copy this file, give it a fresh `opaqueSlug`
// (crypto.randomBytes(8).toString("base64url")), swap the copy/theme/products, and
// register it in ./registry.ts. No route or DB changes are needed.

import type { AffiliateProduct, StoreConfig } from "./types";

/** Opaque, unguessable slug — the only public identifier for this store. */
const OPAQUE_SLUG = "k7m2qx9fa3hd";

const img = (file: string) => `/stores/${OPAQUE_SLUG}/products/${file}`;

// Placeholder pool. Real affiliate links/images get swapped in later; for now every
// `url` is "#" and images are local SVG placeholders. Pool is intentionally larger
// than `itemsPerPeriod` so rotation is visible week to week.
const products: readonly AffiliateProduct[] = [
  {
    id: "custom-pet-portrait",
    title: "Custom Pet Portrait",
    imageSrc: img("placeholder-1.svg"),
    imageAlt: "Hand-illustrated portrait of a beloved pet",
    url: "#",
    blurb: "Turn your furry best friend into a keepsake worth framing.",
    tags: ["pets", "keepsake", "art", "gift"],
  },
  {
    id: "memory-photo-frame",
    title: "Engraved Memory Photo Frame",
    imageSrc: img("placeholder-2.svg"),
    imageAlt: "Wooden photo frame engraved with a heartfelt message",
    url: "#",
    blurb: "Hold a cherished moment close with a frame made to last.",
    tags: ["keepsake", "loved-ones", "home", "gift"],
  },
  {
    id: "cozy-throw-blanket",
    title: "Cozy Heartfelt Throw Blanket",
    imageSrc: img("placeholder-3.svg"),
    imageAlt: "Soft throw blanket draped over a couch",
    url: "#",
    blurb: "Wrap someone you love in a hug they can keep.",
    tags: ["cozy", "loved-ones", "home", "gift"],
  },
  {
    id: "pet-memorial-stone",
    title: "Pet Memorial Garden Stone",
    imageSrc: img("placeholder-4.svg"),
    imageAlt: "Engraved garden stone honoring a pet",
    url: "#",
    blurb: "A gentle tribute to the paw prints left on your heart.",
    tags: ["pets", "keepsake", "memorial", "garden"],
  },
  {
    id: "personalized-star-map",
    title: "Personalized Night Sky Star Map",
    imageSrc: img("placeholder-5.svg"),
    imageAlt: "Framed star map of a special date",
    url: "#",
    blurb: "Capture the exact sky from the night that changed everything.",
    tags: ["keepsake", "loved-ones", "art", "gift"],
  },
  {
    id: "scented-comfort-candle",
    title: "Hand-Poured Comfort Candle",
    imageSrc: img("placeholder-6.svg"),
    imageAlt: "Lit soy candle in a soft-glow jar",
    url: "#",
    blurb: "Soft light and a warm scent for slow, tender evenings.",
    tags: ["cozy", "self-care", "home"],
  },
  {
    id: "matching-friendship-bracelets",
    title: "Matching Friendship Bracelets",
    imageSrc: img("placeholder-7.svg"),
    imageAlt: "Pair of matching beaded bracelets",
    url: "#",
    blurb: "Carry a little piece of someone special wherever you go.",
    tags: ["loved-ones", "jewelry", "gift"],
  },
  {
    id: "pet-treat-gift-box",
    title: "Wholesome Pet Treat Gift Box",
    imageSrc: img("placeholder-8.svg"),
    imageAlt: "Gift box filled with natural pet treats",
    url: "#",
    blurb: "Spoil the goodest boy or girl with treats made with love.",
    tags: ["pets", "treats", "gift"],
  },
  {
    id: "open-when-letters",
    title: "‘Open When’ Letter Set",
    imageSrc: img("placeholder-9.svg"),
    imageAlt: "Set of sealed letters labeled for different moments",
    url: "#",
    blurb: "Little notes of love, ready for exactly the right moment.",
    tags: ["loved-ones", "keepsake", "gift"],
  },
  {
    id: "family-recipe-board",
    title: "Engraved Family Recipe Board",
    imageSrc: img("placeholder-10.svg"),
    imageAlt: "Cutting board engraved with a handwritten recipe",
    url: "#",
    blurb: "Keep a grandparent's handwriting on the kitchen counter forever.",
    tags: ["loved-ones", "keepsake", "home", "kitchen"],
  },
  {
    id: "soft-plush-companion",
    title: "Weighted Plush Companion",
    imageSrc: img("placeholder-11.svg"),
    imageAlt: "Soft weighted plush animal",
    url: "#",
    blurb: "A gentle, huggable comfort for big feelings and quiet nights.",
    tags: ["cozy", "comfort", "self-care", "gift"],
  },
  {
    id: "photo-memory-book",
    title: "Personalized Photo Memory Book",
    imageSrc: img("placeholder-12.svg"),
    imageAlt: "Open photo book filled with memories",
    url: "#",
    blurb: "Gather a year of little moments into one keepsake to revisit.",
    tags: ["keepsake", "loved-ones", "gift"],
  },
  {
    id: "pet-paw-print-kit",
    title: "Pet Paw Print Keepsake Kit",
    imageSrc: img("placeholder-13.svg"),
    imageAlt: "Clay kit for capturing a pet's paw print",
    url: "#",
    blurb: "Press a tiny paw into clay and keep it close for years.",
    tags: ["pets", "keepsake", "craft"],
  },
  {
    id: "warm-tea-sampler",
    title: "Cozy Evening Tea Sampler",
    imageSrc: img("placeholder-14.svg"),
    imageAlt: "Assorted tea sampler in a gift tin",
    url: "#",
    blurb: "A quiet ritual to share — or to savor all on your own.",
    tags: ["cozy", "self-care", "gift"],
  },
];

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
    "Some links on this page are affiliate links. If you buy through them, we may earn a small commission at no extra cost to you.",
  products,
};
