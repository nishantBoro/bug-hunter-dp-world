import { BrowserContext } from "playwright";
import { BugHunterConfig } from "../types.js";
import { resolveRoute } from "./url.js";

function normalizeDiscoveredRoute(href: string, baseUrl: string): string | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("mailto:") || trimmed.startsWith("javascript:")) {
    return null;
  }

  try {
    const base = new URL(baseUrl);
    const resolved = new URL(trimmed, base);

    if (resolved.origin !== base.origin) {
      return null;
    }

    const hash = resolved.hash;
    if (hash.startsWith("#/")) {
      const routePart = hash.slice(1);
      const query = resolved.search;
      return query ? `${routePart}${query}` : routePart;
    }

    const pathname = resolved.pathname;
    const search = resolved.search;
    if (pathname && pathname !== "/") {
      return `${pathname}${search}${hash}`;
    }

    return null;
  } catch {
    if (trimmed.startsWith("#/")) {
      return trimmed.slice(1);
    }
    if (trimmed.startsWith("/#/")) {
      return trimmed.slice(2);
    }
    return null;
  }
}

function mergeRoutes(configured: string[], discovered: string[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const route of [...configured, ...discovered]) {
    const key = route.trim();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    merged.push(key);
  }

  return merged;
}

export async function discoverRoutesFromApp(
  context: BrowserContext,
  config: BugHunterConfig
): Promise<string[]> {
  const page = await context.newPage();
  try {
    const entryRoute =
      config.auth.entryRoute ?? config.routes[0] ?? "/";
    const { url: entryUrl } = resolveRoute(
      config.baseUrl,
      entryRoute,
      config.routeParams
    );

    await page.goto(entryUrl, {
      waitUntil: "load",
      timeout: config.browser.navigationTimeoutMs ?? 60_000
    });
    if (config.browser.postLoadWaitMs) {
      await page.waitForTimeout(config.browser.postLoadWaitMs);
    }

    const rawHrefs = await page.evaluate(() => {
      const hrefs = new Set<string>();
      document.querySelectorAll("a[href]").forEach((anchor) => {
        const href = anchor.getAttribute("href");
        if (href) {
          hrefs.add(href);
        }
      });
      document.querySelectorAll("[routerlink]").forEach((node) => {
        const link = node.getAttribute("routerlink");
        if (link) {
          hrefs.add(link.startsWith("/") ? link : `/${link}`);
        }
      });
      return [...hrefs];
    });

    const discovered = rawHrefs
      .map((href) => normalizeDiscoveredRoute(href, config.baseUrl))
      .filter((route): route is string => Boolean(route));

    const merged = mergeRoutes(config.routes, discovered);
    const added = merged.length - config.routes.length;
    console.log(
      `Route discovery: ${discovered.length} link(s) found, ${added} new route(s) added ` +
        `(${merged.length} total).`
    );
    return merged;
  } finally {
    await page.close();
  }
}
