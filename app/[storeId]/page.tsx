import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import FeaturedRow from "@/components/FeaturedRow";
import ProductGrid from "@/components/ProductGrid";
import StoreFrontHeader from "@/components/StoreFrontHeader";
import { getAllStoreIds, resolveStore } from "@/lib/stores/registry";
import { selectFeatured } from "@/lib/stores/featured";
import { getStoreProducts } from "@/lib/stores/products";
import { themeVars } from "@/lib/stores/theme";

// Only registered opaque slugs are ever served. Combined with dynamicParams=false,
// every other URL returns the standard 404 — tenants cannot be enumerated.
export const dynamicParams = false;

// ISR window << the rotation period (1 week). After it lapses, the next request
// serves stale and triggers a background re-render that re-runs the pure rotation
// function against the *current* week — so the featured set updates within ~1h of
// the week boundary, with zero churn mid-week. No cron, no DB.
export const revalidate = 3600;

export function generateStaticParams() {
  return getAllStoreIds().map((storeId) => ({ storeId }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[storeId]">): Promise<Metadata> {
  const { storeId } = await params;
  const store = resolveStore(storeId);
  if (!store) return {};

  return {
    title: store.meta.title,
    description: store.meta.description,
    icons: { icon: store.meta.faviconHref },
    openGraph: {
      title: store.meta.title,
      description: store.meta.description,
      images: [{ url: store.meta.ogImageHref }],
    },
    // Private links per product decision — keep storefronts out of search indexes.
    robots: { index: false, follow: false },
  };
}

export async function generateViewport({
  params,
}: PageProps<"/[storeId]">): Promise<Viewport> {
  const { storeId } = await params;
  const store = resolveStore(storeId);
  return store?.meta.themeColor ? { themeColor: store.meta.themeColor } : {};
}

export default async function StorePage({ params }: PageProps<"/[storeId]">) {
  const { storeId } = await params;
  const store = resolveStore(storeId);
  if (!store) notFound(); // defense-in-depth even with dynamicParams=false

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
        <FeaturedRow products={featured} storeId={storeId} />
        <AffiliateDisclosure text={store.disclosure} />
        <ProductGrid products={gridProducts} storeId={storeId} />
      </main>
    </div>
  );
}
