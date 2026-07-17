import { createHash } from "node:crypto";

/**
 * Builds a deterministic short hash from the given parts so the same logical
 * finding keeps the same id across runs. This is what lets callers diff "new"
 * vs "known" findings, suppress them, and track them over time.
 *
 * Only pass STABLE discriminators (category, route, viewport, selector kind).
 * Never pass volatile data such as timestamps, counters, or dynamic ids.
 */
export function fingerprint(parts: Array<string | undefined | null>): string {
  const normalized = parts
    .filter((part): part is string => Boolean(part && part.length))
    .map((part) => part.trim().toLowerCase())
    .join("|");
  return createHash("sha1").update(normalized).digest("hex").slice(0, 12);
}
