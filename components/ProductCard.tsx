import Image from "next/image";
import type { AffiliateProduct } from "@/lib/stores/types";

// Server component — no client interactivity needed.
// `unoptimized` serves the local SVG placeholders directly (bypasses the image
// optimizer's SVG restriction). When real raster affiliate images are used, drop
// `unoptimized` and add the host to `images.remotePatterns` in next.config.ts.
export default function ProductCard({ product }: { product: AffiliateProduct }) {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="sponsored nofollow noopener"
      className="group flex flex-col overflow-hidden rounded-[var(--radius)] bg-[var(--card)] shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-black/[0.03]">
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold leading-snug text-[var(--fg)]">
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
            Shop
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
      </div>
    </a>
  );
}
