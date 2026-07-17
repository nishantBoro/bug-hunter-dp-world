import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Page, ViewportSize } from "playwright";
import { BugHunterConfig, RouteTelemetry } from "../types.js";
import { BrowserSession } from "./browser.js";
import { dedupeNetworkEntries, shouldRecordNetworkEntry } from "./networkFilter.js";
import { safeNavigationWaitUntil } from "./navigation.js";
import { resolveRoute, routeSlug } from "./url.js";

async function captureUiSignals(page: Page): Promise<RouteTelemetry["uiSignals"]> {
  return page.evaluate(() => {
    const selectors = "button,a,input,textarea,select,[role='button']";
    const interactive = Array.from(
      document.querySelectorAll<HTMLElement>(selectors)
    );
    const hiddenPrimaryActions: string[] = [];
    const offscreenInteractive: string[] = [];
    let clippedTextNodes = 0;
    let overlapPairs = 0;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const boxes = interactive
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return { el, rect, style };
      })
      .filter(({ rect }) => rect.width > 0 && rect.height > 0);

    for (const { el, rect, style } of boxes) {
      const label =
        el.getAttribute("aria-label") ??
        el.textContent?.trim() ??
        el.tagName.toLowerCase();

      if (style.visibility === "hidden" || style.display === "none") {
        hiddenPrimaryActions.push(label);
      }

      if (
        rect.right < 0 ||
        rect.bottom < 0 ||
        rect.left > viewportWidth ||
        rect.top > viewportHeight
      ) {
        offscreenInteractive.push(label);
      }
    }

    const textContainers = Array.from(document.querySelectorAll<HTMLElement>("*"));
    for (const node of textContainers) {
      if (node.childElementCount > 0) {
        continue;
      }
      if (node.scrollWidth > node.clientWidth + 3) {
        clippedTextNodes += 1;
      }
    }

    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const first = boxes[i];
        const second = boxes[j];
        // A control nested inside another control (e.g. an icon-button inside
        // a link, or a [role=button] wrapping an <a>) is expected to overlap
        // its ancestor. Counting those produced large amounts of noise, so we
        // only count overlaps between independent controls.
        if (first.el.contains(second.el) || second.el.contains(first.el)) {
          continue;
        }
        const a = first.rect;
        const b = second.rect;
        const intersects =
          a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        if (intersects) {
          overlapPairs += 1;
        }
      }
    }

    return {
      hiddenPrimaryActions,
      offscreenInteractive,
      clippedTextNodes,
      overlapPairs
    };
  });
}

async function isBlankScreen(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const body = document.body;
    if (!body) return true;
    const text = body.innerText.trim();
    const hasVisibleChildren = Array.from(body.querySelectorAll("*")).some((el) => {
      const element = el as HTMLElement;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    return text.length === 0 && !hasVisibleChildren;
  });
}

export async function scanRoutes(
  config: BugHunterConfig,
  screenshotRoot: string,
  session: BrowserSession
): Promise<RouteTelemetry[]> {
  const { context } = session;
  context.setDefaultNavigationTimeout(config.browser.navigationTimeoutMs ?? 30_000);
  const telemetry: RouteTelemetry[] = [];
  const totalRoutes = config.routes.length * config.viewports.length;
  let completed = 0;

  for (const viewport of config.viewports) {
      for (const route of config.routes) {
        completed += 1;
        console.log(`[${completed}/${totalRoutes}] Scanning ${route} (${viewport.name})...`);
        // A fresh page per route guarantees telemetry isolation. Previously a
        // single page was reused across routes with listeners re-attached each
        // iteration, so errors/network failures from earlier routes leaked
        // into later ones and inflated findings.
        const page = await context.newPage();
        await page.setViewportSize(viewport as ViewportSize);

        const consoleErrors: string[] = [];
        const pageErrors: string[] = [];
        const networkFailures: string[] = [];
        const httpFailures: string[] = [];
        const visitedUrls: string[] = [];
        const startedAt = new Date();

        page.on("console", (msg) => {
          if (msg.type() === "error") {
            consoleErrors.push(msg.text());
          }
        });
        page.on("pageerror", (err) => pageErrors.push(err.message));
        page.on("requestfailed", (req) => {
          const entry = `${req.method()} ${req.url()} ${req.failure()?.errorText ?? "unknown"}`;
          if (
            shouldRecordNetworkEntry(
              entry,
              config.networkIgnorePatterns,
              config.networkIncludePatterns
            )
          ) {
            networkFailures.push(entry);
          }
        });
        page.on("response", (res) => {
          if (res.status() >= 400) {
            const entry = `${res.status()} ${res.request().method()} ${res.url()}`;
            if (
              shouldRecordNetworkEntry(
                entry,
                config.networkIgnorePatterns,
                config.networkIncludePatterns
              )
            ) {
              httpFailures.push(entry);
            }
          }
        });
        page.on("framenavigated", (frame) => {
          if (frame === page.mainFrame()) {
            visitedUrls.push(frame.url());
          }
        });

        const { url: targetUrl, unresolved } = resolveRoute(
          config.baseUrl,
          route,
          config.routeParams
        );
        if (unresolved.length) {
          console.warn(
            `Route "${route}" has unresolved param(s): ${unresolved.join(", ")}. ` +
              "Add them under \"routeParams\" in your config to scan a real page."
          );
        }

        const start = Date.now();
        await page.goto(targetUrl, {
          waitUntil: safeNavigationWaitUntil(config.navigationWaitUntil),
          timeout: config.browser.navigationTimeoutMs ?? 60_000
        });
        if (config.browser.postLoadWaitMs) {
          await page.waitForTimeout(config.browser.postLoadWaitMs);
        }

        // Ignore transient auth/bootstrap failures during initial load.
        if (config.networkSettleMs > 0) {
          httpFailures.length = 0;
          networkFailures.length = 0;
          await page.waitForTimeout(config.networkSettleMs);
        }

        const durationMs = Date.now() - start;

        const blankScreenDetected = await isBlankScreen(page);
        const uiSignals = await captureUiSignals(page);
        const redirectLoopDetected =
          visitedUrls.length >= 4 &&
          visitedUrls.slice(-4).every((url) => url === visitedUrls[visitedUrls.length - 1]);

        const routeDir = path.join(screenshotRoot, viewport.name);
        await mkdir(routeDir, { recursive: true });
        await page.screenshot({
          path: path.join(routeDir, `${routeSlug(route)}.png`),
          fullPage: true
        });

        telemetry.push({
          route,
          viewport: viewport.name,
          urlVisited: page.url(),
          startedAt: startedAt.toISOString(),
          endedAt: new Date().toISOString(),
          durationMs,
          consoleErrors,
          pageErrors,
          networkFailures: dedupeNetworkEntries(networkFailures),
          httpFailures: dedupeNetworkEntries(httpFailures),
          redirectLoopDetected,
          blankScreenDetected,
          uiSignals
        });

        await page.close();
        console.log(
          `  done in ${(durationMs / 1000).toFixed(1)}s — ` +
            `http:${httpFailures.length} network:${networkFailures.length} console:${consoleErrors.length}`
        );
      }
    }

  return telemetry;
}
