// Build outbound Amazon links.
//
// Without PA-API access we can't link to specific ASINs, but an Associate can
// link to a *search results page* with their tag — clicks and purchases are
// still attributed. So each item links to a tagged search for its query.
// When AMAZON_ASSOCIATE_TAG is unset, the link still works (just unattributed).

const AMAZON_HOST = "https://www.amazon.com/s";

export function buildAmazonSearchLink(query: string): string {
  const params = new URLSearchParams({ k: query });
  const tag = process.env.AMAZON_ASSOCIATE_TAG;
  if (tag) params.set("tag", tag);
  return `${AMAZON_HOST}?${params.toString()}`;
}
