// Outbound link helper shared by the product cards.
//
// Real affiliate links are routed through /api/click so the redirect is logged
// and host-validated; placeholder "#" links are left as-is (they go nowhere).

import type { AffiliateProduct } from "./stores/types";

export function clickHref(product: AffiliateProduct, storeId: string): string {
  if (product.url === "#") return "#";
  const params = new URLSearchParams({
    dest: product.url,
    title: product.title,
    store: storeId,
  });
  return `/api/click?${params.toString()}`;
}
