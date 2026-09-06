// Repair pass for product imagery.
//
// The weekly refresh resolves real Amazon CDN photos via an unofficial image
// search that degrades to the generated placeholder card on any failure — and
// from Vercel it can fail wholesale (the 2026-09 weirdwar list went live with
// nine placeholders: datacenter egress is easily bot-walled, and the refresh
// fires every lookup in one concurrent burst). This endpoint fixes a degraded
// list after the fact, without re-running curation:
//
//   GET  /api/repair-images
//        Per-store imagery status: each KV item's id, search query, and
//        whether it is currently a placeholder.
//   GET  /api/repair-images?resolve=1[&store=<slug>]
//        Re-resolve placeholders server-side, sequentially with spacing —
//        a second weekly cron hits this an hour after the refresh (see
//        vercel.json), which repairs the list whenever the refresh-time
//        failure was burst rate-limiting rather than an IP block.
//   POST /api/repair-images  {storeId, images: {<productId>: <url>}}
//        Patch in images resolved elsewhere — scripts/repair-images.ts runs
//        the same lookup from a network the search engine doesn't block and
//        submits the results here.
//
// Every verb is gated by CRON_SECRET, exactly like /api/refresh. Submitted
// URLs must be https on Amazon's image CDN; anything else is rejected per
// item. Only stores in the registry are addressable; only ids present in the
// store's KV list are patched.

import { revalidatePath } from "next/cache";
import {
  findAmazonImage,
  isAmazonCdn,
  normalizeAmazonImage,
} from "@/lib/imageSearch";
import { everydayTopPicks } from "@/lib/stores/everydaytoppicks";
import { getAllStoreIds, resolveStore } from "@/lib/stores/registry";
import {
  getStoreList,
  isKvConfigured,
  setStoreList,
} from "@/lib/stores/products";
import type { AffiliateProduct } from "@/lib/stores/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // clamped to the plan's limit (e.g. 60s on Hobby)

/** Stay under the shortest plan's function limit; report what's left instead. */
const TIME_BUDGET_MS = 45_000;
/** Pause between sequential lookups so the repair itself can't trip a rate limit. */
const LOOKUP_SPACING_MS = 500;

function isPlaceholder(p: AffiliateProduct): boolean {
  return p.imageSrc.startsWith("/api/");
}

/** The Amazon search query a product links to — the same string the original
 *  image lookup used, recovered from the outbound search link. */
function queryOf(p: AffiliateProduct): string {
  try {
    return new URL(p.url).searchParams.get("k") ?? p.title;
  } catch {
    return p.title;
  }
}

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return !secret || request.headers.get("authorization") === `Bearer ${secret}`;
}

function guard(request: Request): Response | null {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
  if (!isKvConfigured()) {
    return Response.json(
      { ok: false, error: "KV is not configured (missing KV_REST_API_* env)" },
      { status: 503 },
    );
  }
  return null;
}

async function revalidateStore(opaqueSlug: string): Promise<void> {
  revalidatePath(`/${opaqueSlug}`);
  // The general store is also rendered at the root route.
  if (opaqueSlug === everydayTopPicks.opaqueSlug) revalidatePath("/");
}

export async function GET(request: Request): Promise<Response> {
  const refused = guard(request);
  if (refused) return refused;

  const url = new URL(request.url);
  const resolve = url.searchParams.get("resolve") === "1";
  const only = url.searchParams.get("store");
  const slugs = only ? [only] : getAllStoreIds();

  const started = Date.now();
  const results: object[] = [];

  for (const slug of slugs) {
    if (!resolveStore(slug)) {
      results.push({ storeId: slug, ok: false, error: "unknown store" });
      continue;
    }
    const list = await getStoreList(slug);
    if (!list) {
      results.push({
        storeId: slug,
        ok: true,
        count: 0,
        note: "no KV list (the in-repo pool serves this store)",
      });
      continue;
    }

    if (!resolve) {
      results.push({
        storeId: slug,
        ok: true,
        generatedAt: list.generatedAt,
        items: list.products.map((p) => ({
          id: p.id,
          title: p.title,
          query: queryOf(p),
          placeholder: isPlaceholder(p),
        })),
      });
      continue;
    }

    const products = [...list.products];
    let repaired = 0;
    let outOfTime = false;
    for (let i = 0; i < products.length; i++) {
      if (!isPlaceholder(products[i])) continue;
      if (Date.now() - started > TIME_BUDGET_MS) {
        outOfTime = true;
        break;
      }
      const image = await findAmazonImage(queryOf(products[i]));
      if (image) {
        products[i] = { ...products[i], imageSrc: image };
        repaired++;
      }
      await new Promise((r) => setTimeout(r, LOOKUP_SPACING_MS));
    }

    if (repaired > 0) {
      await setStoreList(slug, { ...list, products });
      await revalidateStore(slug);
    }
    results.push({
      storeId: slug,
      ok: true,
      repaired,
      remaining: products.filter(isPlaceholder).length,
      ...(outOfTime ? { note: "stopped at the time budget" } : {}),
    });
  }

  return Response.json({ ok: true, resolve, results });
}

export async function POST(request: Request): Promise<Response> {
  const refused = guard(request);
  if (refused) return refused;

  let body: { storeId?: string; images?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }
  const slug = body.storeId;
  if (!slug || !resolveStore(slug)) {
    return Response.json({ ok: false, error: "unknown store" }, { status: 400 });
  }
  const images = body.images;
  if (!images || typeof images !== "object" || Object.keys(images).length === 0) {
    return Response.json(
      { ok: false, error: "images map is required" },
      { status: 400 },
    );
  }

  const list = await getStoreList(slug);
  if (!list) {
    return Response.json(
      { ok: false, error: "store has no KV list to repair" },
      { status: 409 },
    );
  }

  const rejected: Record<string, string> = {};
  let applied = 0;
  const products = list.products.map((p) => {
    const submitted = images[p.id];
    if (!submitted) return p;
    let normalized: string | null = null;
    try {
      const u = new URL(submitted);
      if (u.protocol === "https:" && isAmazonCdn(submitted)) {
        normalized = normalizeAmazonImage(submitted);
      }
    } catch {
      // fall through to rejection
    }
    if (!normalized) {
      rejected[p.id] = "not an https Amazon-CDN image URL";
      return p;
    }
    applied++;
    return { ...p, imageSrc: normalized };
  });
  const known = new Set(list.products.map((p) => p.id));
  const unknown = Object.keys(images).filter((id) => !known.has(id));

  if (applied > 0) {
    await setStoreList(slug, { ...list, products });
    await revalidateStore(slug);
  }

  return Response.json({
    ok: true,
    storeId: slug,
    applied,
    rejected,
    unknown,
    remainingPlaceholders: products.filter(isPlaceholder).length,
  });
}
