// Branded placeholder imagery.
//
// Until we have real product photos (PA-API / a product feed), every product
// shows a generated "View on <Merchant>" card instead of a real photo. The card
// is rendered by the /api/placeholder route; this module just builds the URL for
// it and picks a tasteful category icon, so the in-repo pool and the Claude
// curation path produce the same varied, on-brand placeholders rather than one
// repeated graphic.

import type { MerchantId } from "./merchants";

export type PlaceholderIcon =
  | "gift"
  | "heart"
  | "paw"
  | "bone"
  | "bowl"
  | "frame"
  | "flame"
  | "mug"
  | "star"
  | "gem";

/** Keyword → icon, scanned (in priority order) against a product's title + tags. */
const ICON_KEYWORDS: ReadonlyArray<readonly [PlaceholderIcon, readonly string[]]> = [
  ["bone", ["treat", "chew", "bone", "dental"]],
  ["bowl", ["bowl", "feeder", "food", "bed", "crate"]],
  ["paw", ["pet", "dog", "cat", "puppy", "kitten", "paw", "collar", "leash"]],
  ["frame", ["frame", "photo", "portrait", "print", "map", "wall", "book"]],
  ["flame", ["candle", "scent", "diffuser", "wax"]],
  ["mug", ["mug", "tea", "coffee", "cocoa", "cup"]],
  ["gem", ["bracelet", "necklace", "jewelry", "ring", "charm"]],
  ["star", ["star", "night", "sky", "celestial"]],
  ["heart", ["love", "memorial", "keepsake", "letter", "heartfelt"]],
];

/** Pick a category icon for a product from its title and tags. */
export function iconForProduct(
  title: string,
  tags: readonly string[],
): PlaceholderIcon {
  const haystack = `${title} ${tags.join(" ")}`.toLowerCase();
  for (const [icon, words] of ICON_KEYWORDS) {
    if (words.some((w) => haystack.includes(w))) return icon;
  }
  return "gift";
}

/** Build the URL of the generated placeholder card for a product. */
export function placeholderImage(opts: {
  merchant: MerchantId;
  /** Short category/title shown on the card. */
  label: string;
  /** Stable string (e.g. the product id) that seeds the card's color. */
  seed: string;
  icon: PlaceholderIcon;
}): string {
  const params = new URLSearchParams({
    m: opts.merchant,
    label: opts.label,
    s: opts.seed,
    icon: opts.icon,
  });
  return `/api/placeholder?${params.toString()}`;
}
