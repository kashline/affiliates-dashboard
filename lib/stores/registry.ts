// Store registry: maps opaque slugs → StoreConfig.
//
// This is the single place that knows the full set of tenants. The route only ever
// serves slugs returned by getAllStoreIds() (via generateStaticParams + dynamicParams=false),
// so unknown URLs 404 and tenants cannot be enumerated.
//
// Add a channel: import its config and add it to STORES.

import type { StoreConfig } from "./types";
import { spreadLoveEverywhere } from "./spreadloveeverywhere";
import { everydayTopPicks } from "./everydaytoppicks";

const STORES: readonly StoreConfig[] = [spreadLoveEverywhere, everydayTopPicks];

const STORE_BY_SLUG: ReadonlyMap<string, StoreConfig> = new Map(
  STORES.map((store) => [store.opaqueSlug, store]),
);

/** Resolve a store by its opaque slug, or undefined if unknown. */
export function resolveStore(storeId: string): StoreConfig | undefined {
  return STORE_BY_SLUG.get(storeId);
}

/** All opaque slugs, for generateStaticParams. */
export function getAllStoreIds(): string[] {
  return STORES.map((store) => store.opaqueSlug);
}
