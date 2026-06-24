// Generated placeholder product image.
//
// Returns a square SVG "card" for a product: a soft, per-item color wash, a
// category icon, the product label, and a brand-colored "View on <Merchant>"
// pill. This stands in for a real product photo until we have PA-API / a product
// feed — it's honest (it doesn't fake a specific product shot), on-brand, and
// varied per item, so the storefront no longer shows one repeated graphic.
//
// All inputs come from query params (see lib/stores/placeholder.ts):
//   m=<merchantId> label=<text> s=<seed> icon=<iconName>

import { getMerchant, type MerchantId } from "@/lib/stores/merchants";
import type { PlaceholderIcon } from "@/lib/stores/placeholder";

// Pure function of its query string — safe to cache hard at the edge/browser.
const CACHE_CONTROL = "public, max-age=31536000, immutable";

/** Icon artwork authored in a 0..100 box; recolored and scaled by the renderer. */
const ICONS: Record<PlaceholderIcon, string> = {
  gift: '<rect x="20" y="44" width="60" height="42" rx="5"/><rect x="14" y="32" width="72" height="16" rx="5"/><rect x="43" y="32" width="14" height="54" rx="3"/>',
  heart:
    '<path d="M50 84C22 63 11 50 11 34A21 21 0 0 1 50 23 21 21 0 0 1 89 34c0 16-11 29-39 50Z"/>',
  paw: '<ellipse cx="50" cy="68" rx="22" ry="17"/><circle cx="26" cy="46" r="9"/><circle cx="42" cy="33" r="9"/><circle cx="58" cy="33" r="9"/><circle cx="74" cy="46" r="9"/>',
  bone: '<rect x="28" y="42" width="44" height="16" rx="8"/><circle cx="28" cy="40" r="11"/><circle cx="28" cy="58" r="11"/><circle cx="72" cy="40" r="11"/><circle cx="72" cy="58" r="11"/>',
  bowl: '<path d="M16 50a34 18 0 0 0 68 0Z"/><ellipse cx="50" cy="48" rx="34" ry="9" opacity="0.55"/>',
  frame:
    '<path fill-rule="evenodd" d="M18 18h64v64H18Zm12 12v40h40V30Z"/>',
  flame:
    '<path d="M50 12c14 22 28 32 28 50a28 28 0 0 1-56 0c0-12 8-20 14-28 4 6 6 10 6 16 4-4 6-10 4-20Z"/>',
  mug: '<rect x="24" y="28" width="42" height="52" rx="9"/><path d="M66 38h8a14 14 0 0 1 0 28h-8Z"/>',
  star: '<path d="M50 6 61 38 95 38 67 58 78 92 50 72 22 92 33 58 5 38 39 38Z"/>',
  gem: '<path d="M30 16h40l16 22-36 46L14 38Z"/>',
};

function isIcon(v: string | null): v is PlaceholderIcon {
  return v != null && Object.prototype.hasOwnProperty.call(ICONS, v);
}

/** Deterministic 0..359 hue from an arbitrary seed string (FNV-1a). */
function hueFromSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 360;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

function renderSvg(
  merchantId: MerchantId,
  label: string,
  seed: string,
  icon: PlaceholderIcon,
): string {
  const merchant = getMerchant(merchantId);
  const hue = hueFromSeed(seed);
  const hue2 = (hue + 24) % 360;

  const bg0 = `hsl(${hue} 72% 92%)`;
  const bg1 = `hsl(${hue2} 60% 82%)`;
  const iconColor = `hsl(${hue} 46% 40%)`;
  const labelColor = `hsl(${hue} 38% 26%)`;
  const safeLabel = escapeXml(truncate(label, 24));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" role="img" aria-label="${safeLabel} — ${escapeXml(merchant.cta)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg0}"/>
      <stop offset="1" stop-color="${bg1}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <circle cx="300" cy="248" r="142" fill="#ffffff" fill-opacity="0.5"/>
  <g transform="translate(180 128) scale(2.4)" fill="${iconColor}">${ICONS[icon]}</g>
  <text x="300" y="432" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" fill="${labelColor}">${safeLabel}</text>
  <rect x="158" y="478" width="284" height="62" rx="31" fill="${merchant.pillColor}"/>
  <text x="300" y="518" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="700" fill="${merchant.pillTextColor}">${escapeXml(merchant.cta)} ›</text>
</svg>`;
}

export function GET(request: Request): Response {
  const { searchParams } = new URL(request.url);
  const merchantId = (searchParams.get("m") as MerchantId) ?? "amazon";
  const label = searchParams.get("label") ?? "Featured find";
  const seed = searchParams.get("s") ?? label;
  const iconParam = searchParams.get("icon");
  const icon: PlaceholderIcon = isIcon(iconParam) ? iconParam : "gift";

  const svg = renderSvg(merchantId, label, seed, icon);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
