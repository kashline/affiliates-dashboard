import type { AffiliateProduct } from "@/lib/stores/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
}: {
  products: readonly AffiliateProduct[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
