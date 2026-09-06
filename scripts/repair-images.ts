// Repair live placeholder product images from THIS machine's network.
//
// The deployed refresh/repair endpoints run the image lookup from Vercel,
// where the search engine may bot-wall datacenter egress. This script runs the
// exact same lookup (lib/imageSearch.ts) locally — where it demonstrably works
// — and submits the results to the authenticated repair endpoint, which
// validates and patches them into KV and revalidates the pages.
//
// Usage:
//   CRON_SECRET=... [BASE_URL=https://creatorfinds.xyz] npx tsx scripts/repair-images.ts
//
// Exits non-zero if any placeholder could not be repaired.

import { findAmazonImage } from "../lib/imageSearch";

const BASE = process.env.BASE_URL ?? "https://creatorfinds.xyz";
const SECRET = process.env.CRON_SECRET;
if (!SECRET) {
  console.error("CRON_SECRET is required (the same secret the Vercel cron uses)");
  process.exit(1);
}
const auth = { authorization: `Bearer ${SECRET}` };

interface Item {
  id: string;
  title: string;
  query: string;
  placeholder: boolean;
}
interface StoreStatus {
  storeId: string;
  ok: boolean;
  items?: Item[];
  error?: string;
  note?: string;
}

async function main(): Promise<number> {
  const res = await fetch(`${BASE}/api/repair-images`, { headers: auth });
  if (!res.ok) {
    console.error(`listing failed: ${res.status} ${await res.text()}`);
    return 1;
  }
  const { results } = (await res.json()) as { results: StoreStatus[] };

  let unrepaired = 0;
  for (const store of results) {
    const items = store.items ?? [];
    const broken = items.filter((i) => i.placeholder);
    console.log(
      `${store.storeId}: ${items.length} KV items, ${broken.length} placeholders` +
        (store.note ? ` (${store.note})` : "") +
        (store.error ? ` ERROR: ${store.error}` : ""),
    );
    if (broken.length === 0) continue;

    const images: Record<string, string> = {};
    for (const item of broken) {
      const image = await findAmazonImage(item.query);
      console.log(`  ${item.id} [${item.query}] -> ${image ?? "NOT FOUND"}`);
      if (image) images[item.id] = image;
      else unrepaired++;
      await new Promise((r) => setTimeout(r, 300));
    }
    if (Object.keys(images).length === 0) continue;

    const post = await fetch(`${BASE}/api/repair-images`, {
      method: "POST",
      headers: { ...auth, "content-type": "application/json" },
      body: JSON.stringify({ storeId: store.storeId, images }),
    });
    const summary = await post.json();
    console.log(`  patched: ${JSON.stringify(summary)}`);
    if (!post.ok) unrepaired++;
  }
  return unrepaired === 0 ? 0 : 1;
}

process.exit(await main());
