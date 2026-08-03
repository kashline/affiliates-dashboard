import type { Metadata, Viewport } from "next";

import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import FeaturedRow from "@/components/FeaturedRow";
import ProductGrid from "@/components/ProductGrid";
import StoreFrontHeader from "@/components/StoreFrontHeader";
import { everydayTopPicks } from "@/lib/stores/everydaytoppicks";
import { selectFeatured } from "@/lib/stores/featured";
import { getStoreProducts } from "@/lib/stores/products";
import { themeVars } from "@/lib/stores/theme";

// The root serves the general "Everyday Top Picks" store — a real storefront for
// stray traffic landing on the bare domain. It has no channel behind it and, like
// every store, never references the platform or any other tenant, so tenant
// isolation is unchanged: channel stores remain reachable only via opaque slugs.
const store = everydayTopPicks;

// Same ISR window as the [storeId] route: the rotation re-derives against the
// current week within ~1h of the week boundary, with zero churn mid-week.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: store.meta.title,
  description: store.meta.description,
  icons: { icon: store.meta.faviconHref },
  openGraph: {
    title: store.meta.title,
    description: store.meta.description,
    images: [{ url: store.meta.ogImageHref }],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: store.meta.themeColor,
};

export default async function RootPage() {
  const { products } = await getStoreProducts(store);

  // Lead with one product per affiliate; drop those from the grid so they don't
  // immediately repeat right below the featured strip.
  const featured = selectFeatured(store);
  const featuredIds = new Set(featured.map((p) => p.id));
  const gridProducts = products.filter((p) => !featuredIds.has(p.id));

  return (
    <div
      style={themeVars(store)}
      className="min-h-screen bg-[var(--bg)] text-[var(--fg)]"
    >
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
        <StoreFrontHeader store={store} />
        <FeaturedRow products={featured} storeId={store.opaqueSlug} />
        <AffiliateDisclosure text={store.disclosure} />
        <ProductGrid products={gridProducts} storeId={store.opaqueSlug} />
      </main>
    </div>
  );
}
