import type { AffiliateProduct } from "@/lib/stores/types";
import ProductCard from "./ProductCard";

// Hero strip of one product per affiliate, shown above the main grid so the
// storefront leads with variety. Renders nothing when there's only one (or zero)
// featured item — a single large card would just look like a lone grid item.
export default function FeaturedRow({
  products,
  storeId,
}: {
  products: readonly AffiliateProduct[];
  storeId: string;
}) {
  if (products.length < 2) return null;

  return (
    <section aria-label="Featured picks" className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          This week&rsquo;s featured finds
        </h2>
        <span aria-hidden className="h-px flex-1 bg-current opacity-10" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} storeId={storeId} featured />
        ))}
      </div>
    </section>
  );
}
