/**
 * Minimal glob matcher for network ignore patterns (`**` and `*`).
 */
export function matchesUrlPattern(url: string, pattern: string): boolean {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "___GLOB_STAR_STAR___")
    .replace(/\*/g, "[^/]*")
    .replace(/___GLOB_STAR_STAR___/g, ".*");
  return new RegExp(`^${escaped}$`, "i").test(url);
}

export function shouldIgnoreNetworkEntry(
  entry: string,
  ignorePatterns: string[] = []
): boolean {
  if (!ignorePatterns.length) {
    return false;
  }

  const url = extractNetworkUrl(entry);
  return ignorePatterns.some((pattern) => matchesUrlPattern(url, pattern));
}

export function shouldRecordNetworkEntry(
  entry: string,
  ignorePatterns: string[] = [],
  includePatterns: string[] = []
): boolean {
  const url = extractNetworkUrl(entry);
  if (ignorePatterns.some((pattern) => matchesUrlPattern(url, pattern))) {
    return false;
  }
  if (!includePatterns.length) {
    return true;
  }
  return includePatterns.some((pattern) => matchesUrlPattern(url, pattern));
}

function extractNetworkUrl(entry: string): string {
  return entry.replace(/^\d{3}\s+[A-Z]+\s+/i, "").split(" ")[0] ?? entry;
}

export function dedupeNetworkEntries(entries: string[]): string[] {
  return [...new Set(entries)];
}

export function parseHttpFailure(entry: string): {
  status: number;
  method: string;
  url: string;
} | null {
  const match = entry.match(/^(\d{3})\s+([A-Z]+)\s+(.+)$/i);
  if (!match) {
    return null;
  }
  return {
    status: Number(match[1]),
    method: match[2],
    url: match[3]
  };
}

export function summarizeHttpFailures(httpFailures: string[]): string {
  const counts = new Map<number, number>();
  for (const entry of httpFailures) {
    const parsed = parseHttpFailure(entry);
    if (parsed) {
      counts.set(parsed.status, (counts.get(parsed.status) ?? 0) + 1);
    }
  }
  if (!counts.size) {
    return "";
  }
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([status, count]) => `${status} (${count})`)
    .join(", ");
}
