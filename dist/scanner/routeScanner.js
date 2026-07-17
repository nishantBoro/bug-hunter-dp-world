import { mkdir } from "node:fs/promises";
import path from "node:path";
import { launchBrowser } from "./browser.js";
import { resolveRoute, routeSlug } from "./url.js";
async function captureUiSignals(page) {
    return page.evaluate(() => {
        const selectors = "button,a,input,textarea,select,[role='button']";
        const interactive = Array.from(document.querySelectorAll(selectors));
        const hiddenPrimaryActions = [];
        const offscreenInteractive = [];
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
            const label = el.getAttribute("aria-label") ??
                el.textContent?.trim() ??
                el.tagName.toLowerCase();
            if (style.visibility === "hidden" || style.display === "none") {
                hiddenPrimaryActions.push(label);
            }
            if (rect.right < 0 ||
                rect.bottom < 0 ||
                rect.left > viewportWidth ||
                rect.top > viewportHeight) {
                offscreenInteractive.push(label);
            }
        }
        const textContainers = Array.from(document.querySelectorAll("*"));
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
                const intersects = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
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
async function isBlankScreen(page) {
    return page.evaluate(() => {
        const body = document.body;
        if (!body)
            return true;
        const text = body.innerText.trim();
        const hasVisibleChildren = Array.from(body.querySelectorAll("*")).some((el) => {
            const element = el;
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        });
        return text.length === 0 && !hasVisibleChildren;
    });
}
export async function scanRoutes(config, screenshotRoot) {
    const browser = await launchBrowser();
    const context = await browser.newContext();
    context.setDefaultNavigationTimeout(12_000);
    const telemetry = [];
    try {
        for (const viewport of config.viewports) {
            for (const route of config.routes) {
                // A fresh page per route guarantees telemetry isolation. Previously a
                // single page was reused across routes with listeners re-attached each
                // iteration, so errors/network failures from earlier routes leaked
                // into later ones and inflated findings.
                const page = await context.newPage();
                await page.setViewportSize(viewport);
                const consoleErrors = [];
                const pageErrors = [];
                const networkFailures = [];
                const httpFailures = [];
                const visitedUrls = [];
                const startedAt = new Date();
                page.on("console", (msg) => {
                    if (msg.type() === "error") {
                        consoleErrors.push(msg.text());
                    }
                });
                page.on("pageerror", (err) => pageErrors.push(err.message));
                page.on("requestfailed", (req) => {
                    networkFailures.push(`${req.method()} ${req.url()} ${req.failure()?.errorText ?? "unknown"}`);
                });
                page.on("response", (res) => {
                    if (res.status() >= 400) {
                        httpFailures.push(`${res.status()} ${res.request().method()} ${res.url()}`);
                    }
                });
                page.on("framenavigated", (frame) => {
                    if (frame === page.mainFrame()) {
                        visitedUrls.push(frame.url());
                    }
                });
                const { url: targetUrl, unresolved } = resolveRoute(config.baseUrl, route, config.routeParams);
                if (unresolved.length) {
                    console.warn(`Route "${route}" has unresolved param(s): ${unresolved.join(", ")}. ` +
                        "Add them under \"routeParams\" in your config to scan a real page.");
                }
                const start = Date.now();
                await page.goto(targetUrl, { waitUntil: "networkidle" });
                const durationMs = Date.now() - start;
                const blankScreenDetected = await isBlankScreen(page);
                const uiSignals = await captureUiSignals(page);
                const redirectLoopDetected = visitedUrls.length >= 4 &&
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
                    networkFailures,
                    httpFailures,
                    redirectLoopDetected,
                    blankScreenDetected,
                    uiSignals
                });
                await page.close();
            }
        }
    }
    finally {
        await context.close();
        await browser.close();
    }
    return telemetry;
}
