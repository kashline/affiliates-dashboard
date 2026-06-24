// Weekly product curation via Claude.
//
// Given a store's theme and the current month/season, Claude proposes a fresh
// set of giftable, on-theme product ideas plus an Amazon search query for each.
// We turn those into AffiliateProduct records (tagged Amazon search links +
// placeholder imagery). This is the "trending, hands-off" engine: until PA-API
// is available it's Claude's seasonal/thematic judgment rather than live
// best-seller data, and links land on tagged search pages rather than ASINs.

import Anthropic from "@anthropic-ai/sdk";
import { buildAmazonSearchLink } from "./amazon";
import { iconForProduct, placeholderImage } from "./stores/placeholder";
import type { AffiliateProduct, StoreConfig } from "./stores/types";

// Per the Anthropic API reference: default to Opus 4.8 with adaptive thinking.
const MODEL = "claude-opus-4-8";

interface CuratedItem {
  title: string;
  blurb: string;
  tags: string[];
  searchQuery: string;
  category?: string;
}

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          blurb: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          searchQuery: { type: "string" },
          category: { type: "string" },
        },
        required: ["title", "blurb", "tags", "searchQuery"],
      },
    },
  },
  required: ["items"],
} as const;

function buildSystemPrompt(): string {
  return [
    "You are a buyer for a small, tasteful gift shop. Each week you refresh the",
    "storefront with on-theme products that are popular and giftable right now,",
    "available on Amazon. You lean into the current season and upcoming",
    "occasions (holidays, graduations, weddings, etc.) when they fit the theme.",
    "You favor a diverse mix of categories and price points, avoid anything",
    "tacky or off-brand, and never invent specific brands or models you're not",
    "confident exist. For each item you write a short, warm, sentimental blurb",
    "and a concise Amazon search query (2-5 words) that would surface good",
    "matches for that idea.",
  ].join(" ");
}

function buildUserPrompt(store: StoreConfig, monthLabel: string): string {
  return [
    `Storefront theme: ${store.storeName} — ${store.tagline}`,
    `Audience/topic: ${store.meta.description}`,
    `Current month: ${monthLabel} (lean into what's seasonally relevant now).`,
    `Produce exactly ${store.itemsPerPeriod} distinct product ideas that fit the`,
    `theme. Vary the categories so the storefront feels fresh. Return them via`,
    `the required schema.`,
  ].join(" ");
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "item"
  );
}

function toProduct(
  store: StoreConfig,
  item: CuratedItem,
  index: number,
): AffiliateProduct {
  const id = `${slugify(item.title)}-${index}`;
  const tags = item.category ? [...item.tags, item.category] : item.tags;
  return {
    id,
    // Claude curation currently produces Amazon search ideas only.
    merchant: "amazon",
    title: item.title,
    imageSrc: placeholderImage({
      merchant: "amazon",
      label: item.title,
      seed: id,
      icon: iconForProduct(item.title, tags),
    }),
    imageAlt: item.title,
    url: buildAmazonSearchLink(item.searchQuery),
    blurb: item.blurb,
    tags: item.tags,
  };
}

export async function curateProducts(
  store: StoreConfig,
  now: Date = new Date(),
): Promise<AffiliateProduct[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });
  const monthLabel = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: {
      format: { type: "json_schema", schema: OUTPUT_SCHEMA },
    },
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(store, monthLabel) }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Curation request was refused by the safety system");
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Curation response contained no text block");
  }

  const parsed = JSON.parse(textBlock.text) as { items: CuratedItem[] };
  if (!parsed.items?.length) {
    throw new Error("Curation returned no items");
  }

  return parsed.items
    .slice(0, store.itemsPerPeriod)
    .map((item, i) => toProduct(store, item, i));
}
