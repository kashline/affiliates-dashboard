// Guarded Upstash Redis (a.k.a. "Vercel KV") client.
//
// Vercel now provisions Upstash Redis via the Marketplace. Depending on the
// integration, the REST credentials are injected under either the legacy
// `KV_REST_API_*` names or the native `UPSTASH_REDIS_REST_*` names — we accept
// both. When neither is configured (local dev, CI, build), getRedis() returns
// null and callers fall back to the in-repo product pool, so nothing breaks.

import { Redis } from "@upstash/redis";

let cached: Redis | null | undefined;

function readCreds(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

/** Returns a Redis client, or null when no store is configured. */
export function getRedis(): Redis | null {
  if (cached !== undefined) return cached;
  const creds = readCreds();
  cached = creds ? new Redis(creds) : null;
  return cached;
}

export function isKvConfigured(): boolean {
  return readCreds() !== null;
}
