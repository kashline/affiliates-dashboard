// Maps a store's theme onto the CSS custom properties consumed by the
// components. Shared by every page that renders a storefront (the per-tenant
// [storeId] route and the root catch-all store).

import type { CSSProperties } from "react";
import type { StoreConfig } from "./types";

export function themeVars(store: StoreConfig): CSSProperties {
  const { theme } = store;
  return {
    "--bg": theme.colorBackground,
    "--fg": theme.colorForeground,
    "--muted": theme.colorMuted,
    "--accent": theme.colorAccent,
    "--accent-fg": theme.colorAccentForeground,
    "--card": theme.colorCard ?? "#ffffff",
    "--radius": theme.radius ?? "1rem",
  } as CSSProperties;
}
