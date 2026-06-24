// Affiliate merchant registry.
//
// A "merchant" is one affiliate program the storefront links out to (Amazon,
// Chewy, ...). Centralizing it here gives every product a consistent brand
// treatment (the "View on X" call-to-action and its colors), a single source of
// truth for which outbound hosts the /api/click redirector is allowed to send
// visitors to, and one place to build each program's search link.
//
// Products carry an optional `merchant` id (see types.ts) that defaults to
// "amazon", so existing Amazon-only pools need no changes.

import { buildAmazonSearchLink } from "../amazon";

export type MerchantId = "amazon" | "chewy";

export interface Merchant {
  readonly id: MerchantId;
  /** Public display name, e.g. "Amazon". */
  readonly name: string;
  /** Call-to-action shown on the product image / card, e.g. "View on Amazon". */
  readonly cta: string;
  /** Brand color for the CTA pill. */
  readonly pillColor: string;
  /** Foreground color for text on the CTA pill. */
  readonly pillTextColor: string;
  /** Hostnames the click redirector may forward to for this merchant. */
  readonly hosts: readonly string[];
}

// Order matters: this is the order affiliates appear in the featured row.
export const MERCHANTS: readonly Merchant[] = [
  {
    id: "amazon",
    name: "Amazon",
    cta: "View on Amazon",
    pillColor: "#ff9900",
    pillTextColor: "#131921",
    hosts: ["amazon.com", "www.amazon.com"],
  },
  {
    id: "chewy",
    name: "Chewy",
    cta: "View on Chewy",
    pillColor: "#1c4cb8",
    pillTextColor: "#ffffff",
    hosts: ["chewy.com", "www.chewy.com"],
  },
];

const BY_ID: ReadonlyMap<MerchantId, Merchant> = new Map(
  MERCHANTS.map((m) => [m.id, m]),
);

/** Resolve a merchant, defaulting to Amazon for undefined/unknown ids. */
export function getMerchant(id: MerchantId | undefined): Merchant {
  return (id && BY_ID.get(id)) || MERCHANTS[0];
}

/** Every outbound host any merchant is allowed to redirect to. */
export const MERCHANT_HOSTS: ReadonlySet<string> = new Set(
  MERCHANTS.flatMap((m) => m.hosts),
);

/**
 * Build a tagged search-results link for a merchant. Without PA-API (Amazon) /
 * a product feed (Chewy) we can't link to specific items, but a search link is a
 * real, working destination — clicks still land on the right store.
 */
export function buildMerchantSearchLink(id: MerchantId, query: string): string {
  if (id === "chewy") {
    // Chewy's affiliate program runs through a network (not a simple tag param),
    // so this is an untagged but real search link for now.
    const params = new URLSearchParams({ query });
    return `https://www.chewy.com/s?${params.toString()}`;
  }
  return buildAmazonSearchLink(query);
}
