import Image from "next/image";
import { clickHref } from "@/lib/links";
import { getMerchant } from "@/lib/stores/merchants";
import type { AffiliateProduct } from "@/lib/stores/types";

// Server component — no client interactivity needed.
// `unoptimized` is deliberate for both image kinds we serve: the generated SVG
// placeholder cards (the optimizer refuses SVG) and hotlinked Amazon CDN photos
// (already sized via the URL's _AC_SL600_ modifier; proxying them through the
// optimizer would just add a fetch hop that Amazon may refuse).

export default function ProductCard({
  product,
  storeId,
  featured = false,
}: {
  product: AffiliateProduct;
  storeId: string;
  /** Larger, horizontal layout used in the top "featured affiliates" row. */
  featured?: boolean;
}) {
  const merchant = getMerchant(product.merchant);

  return (
    <a
      href={clickHref(product, storeId)}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={`group flex overflow-hidden rounded-[var(--radius)] bg-[var(--card)] shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md ${
        featured ? "flex-col sm:flex-row" : "flex-col"
      }`}
    >
      <div
        className={`relative overflow-hidden bg-black/[0.03] ${
          featured ? "aspect-square w-full sm:w-2/5" : "aspect-square w-full"
        }`}
      >
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          unoptimized
          sizes={
            featured
              ? "(max-width: 640px) 100vw, 40vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-black/[0.04] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
          <span
            aria-hidden
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: merchant.pillColor }}
          />
          {merchant.name}
        </span>
        <h3
          className={`font-semibold leading-snug text-[var(--fg)] ${
            featured ? "text-lg" : "text-base"
          }`}
        >
          {product.title}
        </h3>
        <p className="flex-1 text-sm leading-relaxed text-[var(--muted)]">
          {product.blurb}
        </p>
        <div className="mt-2 flex items-center justify-between">
          {product.price ? (
            <span className="text-sm font-medium text-[var(--fg)]">
              {product.price}
            </span>
          ) : (
            <span className="text-sm text-[var(--muted)]">View details</span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--accent-fg)]">
            {merchant.cta}
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
      </div>
    </a>
  );
}
