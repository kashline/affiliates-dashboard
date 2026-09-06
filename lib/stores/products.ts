// The storefront's product source.
//
// Read path (getStoreProducts): used by the page at render time. Prefers the
// weekly Claude-generated list in KV; falls back to a deterministic shuffle of
// the in-repo curated pool when KV is empty/unconfigured or a refresh hasn't
// run yet — so the store is never empty.
//
// Write path (setStoreList): used by the /api/refresh cron job.

import { getRedis, isKvConfigured } from "../kv";
import { selectRotatedProducts } from "./rotation";
import type { AffiliateProduct, RotatedList, StoreConfig } from "./types";

export { isKvConfigured };

function kvKey(opaqueSlug: string): string {
  return `store:${opaqueSlug}:list`;
}

export interface StoreProducts {
  readonly products: readonly AffiliateProduct[];
  readonly source: "kv" | "fallback";
  readonly generatedAt?: string;
}

export async function getStoreProducts(
  store: StoreConfig,
): Promise<StoreProducts> {
  const redis = getRedis();
  if (redis) {
    try {
      const record = await redis.get<RotatedList>(kvKey(store.opaqueSlug));
      if (record && record.products.length > 0) {
        return {
          products: record.products,
          source: "kv",
          generatedAt: record.generatedAt,
        };
      }
    } catch {
      // KV unreachable — fall through to the in-repo pool rather than error.
    }
  }
  const { products } = selectRotatedProducts(store);
  return { products, source: "fallback" };
}

/** The raw KV list for a store — no pool fallback. Null when KV is unset,
 *  unreachable, or holds nothing for this store (the pool serves then). */
export async function getStoreList(
  opaqueSlug: string,
): Promise<RotatedList | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return (await redis.get<RotatedList>(kvKey(opaqueSlug))) ?? null;
  } catch {
    return null;
  }
}

export async function setStoreList(
  opaqueSlug: string,
  record: RotatedList,
): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("KV is not configured");
  await redis.set(kvKey(opaqueSlug), record);
}
