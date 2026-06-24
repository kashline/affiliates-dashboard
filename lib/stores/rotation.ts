// Deterministic, dependency-free product rotation.
//
// The featured set is a PURE FUNCTION of (store.opaqueSlug, current period). There is
// no database and nothing runs on a schedule: the same inputs always produce the same
// output for every visitor and every render within a period, and the output changes
// exactly when the period (ISO week / calendar month, UTC) ticks over.

import type {
  AffiliateProduct,
  PeriodId,
  RotationCadence,
  RotationResult,
  StoreConfig,
} from "./types";

/** Canonical period key for a given cadence, computed in UTC so the boundary is
 *  identical regardless of the server's region. */
export function periodKey(cadence: RotationCadence, now: Date): string {
  if (cadence === "monthly") {
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }
  return isoWeekKey(now);
}

/** ISO-8601 week key, e.g. "2026-W25". Implemented explicitly (no locale dependency). */
export function isoWeekKey(date: Date): string {
  // Work on a UTC copy with the time stripped.
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // ISO weekday: Mon=0 ... Sun=6. Shift to the Thursday of this week — the ISO year
  // is defined by which year that Thursday falls in.
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const isoYear = d.getUTCFullYear();
  // Week 1 is the week containing Jan 4th.
  const week1 = new Date(Date.UTC(isoYear, 0, 4));
  const week1DayNum = (week1.getUTCDay() + 6) % 7;
  const week =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86_400_000 - 3 + week1DayNum) / 7,
    );
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

/** xmur3 string hash → 32-bit seed. */
function xmur3(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 PRNG — deterministic, returns a float in [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic index in [0, n) from a key string. Used to pick a stable-per-period
 *  representative (e.g. one featured product per merchant) without a database. */
export function seededIndex(key: string, n: number): number {
  if (n <= 0) return 0;
  return Math.floor(mulberry32(xmur3(key))() * n);
}

/** Deterministic Fisher–Yates shuffle of a copy of `items` using `rng`. */
function seededShuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Pick this period's featured products for a store. Deterministic: keyed on the
 * store's opaque slug (so different stores never correlate) and the current period
 * (so the set rotates at the week/month boundary).
 */
export function selectRotatedProducts(
  store: StoreConfig,
  now: Date = new Date(),
): RotationResult {
  if (store.products.length === 0) {
    throw new Error(`Store "${store.opaqueSlug}" has an empty product pool`);
  }

  const key = periodKey(store.cadence, now);
  const period: PeriodId = { cadence: store.cadence, key };

  const seed = xmur3(`${store.opaqueSlug}:${key}`);
  const rng = mulberry32(seed);

  const shuffled: AffiliateProduct[] = seededShuffle(store.products, rng);
  const count = Math.min(store.itemsPerPeriod, shuffled.length);

  return { period, products: shuffled.slice(0, count) };
}
