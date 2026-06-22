// One-off determinism check. Run with:
//   node --experimental-strip-types scripts/verify-rotation.ts
import {
  isoWeekKey,
  periodKey,
  selectRotatedProducts,
} from "../lib/stores/rotation.ts";
import { spreadLoveEverywhere as store } from "../lib/stores/spreadloveeverywhere.ts";

let failures = 0;
const check = (name: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
  if (!ok) failures++;
};

// ISO week key sanity (2026-06-15 is in ISO week 25).
check("isoWeekKey(2026-06-15) === 2026-W25", isoWeekKey(new Date("2026-06-15T12:00:00Z")) === "2026-W25", isoWeekKey(new Date("2026-06-15T12:00:00Z")));

// Stable within a period (two calls, same date → identical order).
const a = selectRotatedProducts(store, new Date("2026-06-15T00:00:00Z"));
const b = selectRotatedProducts(store, new Date("2026-06-18T23:00:00Z")); // same ISO week
check("count === itemsPerPeriod", a.products.length === store.itemsPerPeriod, `${a.products.length}`);
check("period key is the week", a.period.key === "2026-W25", a.period.key);
const idsA = a.products.map((p) => p.id).join(",");
const idsB = b.products.map((p) => p.id).join(",");
check("stable within the same week", idsA === idsB);

// Changes across the period boundary (next ISO week → different selection).
const nextWeek = selectRotatedProducts(store, new Date("2026-06-22T00:00:00Z")); // 2026-W26
check("period advanced", nextWeek.period.key === "2026-W26", nextWeek.period.key);
const idsNext = nextWeek.products.map((p) => p.id).join(",");
check("selection rotated across weeks", idsNext !== idsA);

// Every selected id exists in the pool (no corruption).
const pool = new Set(store.products.map((p) => p.id));
check("all selected ids are real", a.products.every((p) => pool.has(p.id)));

console.log(`\nperiodKey monthly(2026-06-15): ${periodKey("monthly", new Date("2026-06-15T00:00:00Z"))}`);
console.log(`week 2026-W25 ids: ${idsA}`);
console.log(`week 2026-W26 ids: ${idsNext}`);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll rotation checks passed.");
