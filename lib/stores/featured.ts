// Featured affiliates row.
//
// Picks one product per affiliate merchant for the hero strip at the top of the
// storefront, so the first thing a visitor sees is a spread of *different*
// affiliates rather than a wall of identical ones. Like the main rotation it's a
// pure function of (store, period): the same week always yields the same picks,
// and they rotate when the period ticks over.

import { MERCHANTS } from "./merchants";
import { periodKey, seededIndex } from "./rotation";
import type { AffiliateProduct, StoreConfig } from "./types";

/**
 * One product per merchant (in MERCHANTS order), chosen deterministically for the
 * current period. Pulls from the store's full pool so every affiliate that has any
 * products is represented, regardless of what the main rotation happened to select.
 */
export function selectFeatured(
  store: StoreConfig,
  now: Date = new Date(),
): AffiliateProduct[] {
  const key = periodKey(store.cadence, now);

  const byMerchant = new Map<string, AffiliateProduct[]>();
  for (const product of store.products) {
    const id = product.merchant ?? "amazon";
    const list = byMerchant.get(id);
    if (list) list.push(product);
    else byMerchant.set(id, [product]);
  }

  const featured: AffiliateProduct[] = [];
  for (const merchant of MERCHANTS) {
    const list = byMerchant.get(merchant.id);
    if (!list || list.length === 0) continue;
    const idx = seededIndex(`${store.opaqueSlug}:featured:${key}:${merchant.id}`, list.length);
    featured.push(list[idx]);
  }
  return featured;
}
