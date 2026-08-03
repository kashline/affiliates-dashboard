// Best-effort real product imagery, found by product name.
//
// Without PA-API we can't ask Amazon for a product's image, but an image search
// for the product name reliably surfaces the actual Amazon CDN asset
// (m.media-amazon.com), which serves hotlinked images. This module wraps a
// DuckDuckGo image search (no key, no quota) and returns the first hit hosted on
// Amazon's image CDN — or null on ANY failure, in which case callers fall back
// to the generated placeholder card. It is deliberately tolerant: an unofficial
// endpoint that breaks must degrade the imagery, never the refresh.
//
// The in-repo static pools were resolved the same way, one-time, and hard-code
// their URLs; this runtime path exists for the weekly Claude-curated items.

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const FETCH_TIMEOUT_MS = 8_000;

/** Rewrite an Amazon image URL's size modifier to a storefront-friendly 600px. */
function normalizeAmazonImage(url: string): string {
  return url.replace(/\._[^./]+_\.(jpe?g|png)$/i, "._AC_SL600_.$1");
}

function isAmazonCdn(url: string): boolean {
  try {
    return /(^|\.)media-amazon\.com$/.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

async function get(url: string): Promise<Response> {
  return fetch(url, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
}

/**
 * Find a real Amazon product image for a search query, or null if anything at
 * all goes wrong (endpoint change, rate limit, no Amazon-hosted hit, timeout).
 */
export async function findAmazonImage(query: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${query} amazon`);
    // The image search needs a per-query "vqd" token scraped off the HTML page.
    const page = await (
      await get(`https://duckduckgo.com/?q=${q}&iax=images&ia=images`)
    ).text();
    const vqd = page.match(/vqd=["']?([\d-]+)/)?.[1];
    if (!vqd) return null;

    const res = await get(
      `https://duckduckgo.com/i.js?l=us-en&o=json&q=${q}&vqd=${vqd}&f=,,,&p=1`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: Array<{ image?: string }> };
    const hit = data.results?.find((r) => r.image && isAmazonCdn(r.image));
    return hit?.image ? normalizeAmazonImage(hit.image) : null;
  } catch {
    return null;
  }
}
