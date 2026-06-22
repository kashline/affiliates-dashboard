import type { StoreConfig } from "@/lib/stores/types";

// Per-store hero. All copy comes from StoreConfig — there is intentionally no
// platform branding here so the storefront looks standalone.
export default function StoreFrontHeader({ store }: { store: StoreConfig }) {
  return (
    <header className="mx-auto max-w-2xl text-center">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">
        {store.storeName}
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-[var(--muted)]">
        {store.tagline}
      </p>
    </header>
  );
}
