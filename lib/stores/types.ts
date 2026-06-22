// Shared types for the multi-tenant affiliate storefront.
//
// Each "store" is one channel's public-facing storefront. The app is multi-tenant
// but every store is fully isolated: the only public identifier is `opaqueSlug`,
// and all branding/theme/copy is driven from a per-store StoreConfig so two stores
// never look or feel like the same app.

export type RotationCadence = "weekly" | "monthly";

/** A single affiliate product in a store's curated pool. */
export interface AffiliateProduct {
  /** Stable unique id within the pool. Used as the React key and to keep the
   *  seeded rotation deterministic across renders. Never reuse an id. */
  readonly id: string;
  readonly title: string;
  /** Local path under /public (e.g. "/stores/<slug>/products/x.svg") for MVP
   *  placeholders, or an absolute URL once `images.remotePatterns` is configured. */
  readonly imageSrc: string;
  readonly imageAlt: string;
  /** Outbound/affiliate link. Placeholder "#" for the MVP. */
  readonly url: string;
  /** Short, theme-matching marketing copy. */
  readonly blurb: string;
  readonly tags: readonly string[];
  /** Optional display string (e.g. "$24.99"). Omitted for MVP placeholders. */
  readonly price?: string;
}

/** Per-store theme, surfaced as CSS custom properties on the store's root element. */
export interface StoreTheme {
  readonly colorBackground: string;
  readonly colorForeground: string;
  /** Muted foreground for secondary text. */
  readonly colorMuted: string;
  readonly colorAccent: string;
  readonly colorAccentForeground: string;
  /** Surface/card background. */
  readonly colorCard?: string;
  readonly radius?: string;
}

/** Public-facing metadata. MUST NOT reference the platform or other tenants. */
export interface StoreMeta {
  readonly title: string;
  readonly description: string;
  readonly faviconHref: string;
  readonly ogImageHref: string;
  /** Used by the per-store `generateViewport` (browser theme color). */
  readonly themeColor?: string;
}

export interface StoreConfig {
  /** Random, unguessable token — THE only public identifier. Never derived from
   *  the channel name. Generate once with crypto.randomBytes(8).toString("base64url"). */
  readonly opaqueSlug: string;
  /** Public store name (theme-appropriate, generic). Not the platform/channel name. */
  readonly storeName: string;
  readonly tagline: string;
  readonly cadence: RotationCadence;
  /** How many products to feature per rotation period. */
  readonly itemsPerPeriod: number;
  readonly theme: StoreTheme;
  readonly meta: StoreMeta;
  /** FTC affiliate disclosure text. */
  readonly disclosure: string;
  /** Full curated pool to rotate from. Should be larger than `itemsPerPeriod`. */
  readonly products: readonly AffiliateProduct[];
}

/** Identifies the current rotation period, e.g. { cadence: "weekly", key: "2026-W25" }. */
export interface PeriodId {
  readonly cadence: RotationCadence;
  readonly key: string;
}

export interface RotationResult {
  readonly period: PeriodId;
  readonly products: readonly AffiliateProduct[];
}
