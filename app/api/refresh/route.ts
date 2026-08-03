// Weekly storefront refresh — triggered by Vercel Cron (see vercel.json).
//
// Vercel fires GET /api/refresh on the cron schedule, sending
// `Authorization: Bearer <CRON_SECRET>`. For each channel we ask Claude for a
// fresh, on-theme product list, persist it to KV, and revalidate that store's
// page. Per-channel failures are isolated so one bad run doesn't abort the rest;
// on failure the store keeps serving its previous (or fallback) list.

import { revalidatePath } from "next/cache";
import { curateProducts } from "@/lib/curation";
import { everydayTopPicks } from "@/lib/stores/everydaytoppicks";
import { getAllStoreIds, resolveStore } from "@/lib/stores/registry";
import { isKvConfigured, setStoreList } from "@/lib/stores/products";
import { periodKey } from "@/lib/stores/rotation";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // clamped to the plan's limit (e.g. 60s on Hobby)

interface RefreshResult {
  storeId: string;
  ok: boolean;
  count?: number;
  error?: string;
}

export async function GET(request: Request): Promise<Response> {
  // Gate on the cron secret when configured. Locally (no secret) we allow it so
  // it can be exercised by hand.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isKvConfigured()) {
    return Response.json(
      { ok: false, error: "KV is not configured (missing KV_REST_API_* env)" },
      { status: 503 },
    );
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { ok: false, error: "ANTHROPIC_API_KEY is not set" },
      { status: 503 },
    );
  }

  const now = new Date();
  const results: RefreshResult[] = [];

  for (const storeId of getAllStoreIds()) {
    const store = resolveStore(storeId);
    if (!store) continue;
    try {
      const products = await curateProducts(store, now);
      await setStoreList(store.opaqueSlug, {
        periodKey: periodKey(store.cadence, now),
        generatedAt: now.toISOString(),
        source: "claude",
        products,
      });
      revalidatePath(`/${store.opaqueSlug}`);
      // The general store is also rendered at the root route.
      if (store.opaqueSlug === everydayTopPicks.opaqueSlug) revalidatePath("/");
      results.push({ storeId, ok: true, count: products.length });
    } catch (error) {
      results.push({
        storeId,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const allOk = results.every((r) => r.ok);
  return Response.json(
    { ok: allOk, refreshedAt: now.toISOString(), results },
    { status: allOk ? 200 : 207 },
  );
}
