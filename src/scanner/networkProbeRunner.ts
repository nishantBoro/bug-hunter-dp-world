import { Page, Route } from "playwright";
import {
  BugHunterConfig,
  NetworkFailureScenario,
  NetworkProbeDefinition,
  NetworkProbeScenarioResult,
  NetworkProbeTrigger
} from "../types.js";
import { BrowserSession } from "./browser.js";
import { resolveRoute } from "./url.js";

const DEFAULT_LOG_PATTERNS: Record<NetworkFailureScenario, RegExp[]> = {
  "401": [/401/i, /unauthorized/i, /network/i, /fetch/i, /api/i],
  "404": [/404/i, /not found/i, /network/i, /fetch/i, /api/i],
  "500": [/500/i, /internal server/i, /network/i, /fetch/i, /api/i],
  timeout: [/timeout/i, /timed out/i, /network/i, /fetch/i, /abort/i]
};

function applyMock(route: Route, scenario: NetworkFailureScenario): void {
  switch (scenario) {
    case "401":
      void route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "mocked unauthorized" })
      });
      return;
    case "404":
      void route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "mocked not found" })
      });
      return;
    case "500":
      void route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "mocked server error" })
      });
      return;
    case "timeout":
      void route.abort("timedout");
      return;
    default:
      void route.continue();
  }
}

function scannerDetected(
  scenario: NetworkFailureScenario,
  httpFailures: string[],
  networkFailures: string[],
  consoleMessages: string[] = []
): { detected: boolean; evidence: string[] } {
  const statusCode = scenario === "timeout" ? null : scenario;
  const httpMatches = statusCode
    ? httpFailures.filter((line) => line.startsWith(`${statusCode} `))
    : [];
  const networkMatches =
    scenario === "timeout"
      ? networkFailures.filter((line) =>
          /timedout|time_?out|err_timed_out|failed/i.test(line)
        )
      : [];
  const consoleMatches =
    scenario === "timeout"
      ? consoleMessages.filter((line) => /ERR_TIMED_OUT|timed out|timeout/i.test(line))
      : [];

  const evidence = [...httpMatches, ...networkMatches, ...consoleMatches];
  return { detected: evidence.length > 0, evidence };
}

function appLoggedError(
  scenario: NetworkFailureScenario,
  consoleMessages: string[],
  probe: NetworkProbeDefinition
): boolean {
  const patterns =
    probe.logPatterns?.map((pattern) => new RegExp(pattern, "i")) ??
    DEFAULT_LOG_PATTERNS[scenario];
  const haystack = consoleMessages.join("\n");
  return patterns.some((pattern) => pattern.test(haystack));
}

async function runTrigger(
  page: Page,
  trigger: NetworkProbeTrigger,
  baseUrl: string,
  routeParams: Record<string, string>,
  navigationWaitUntil: BugHunterConfig["navigationWaitUntil"]
): Promise<string> {
  switch (trigger.type) {
    case "goto": {
      const route = trigger.route ?? "/";
      const { url } = resolveRoute(baseUrl, route, routeParams);
      await page.goto(url, { waitUntil: navigationWaitUntil });
      return route;
    }
    case "click": {
      if (!trigger.selector) {
        throw new Error("Network probe click trigger requires selector");
      }
      if (trigger.route) {
        const { url } = resolveRoute(baseUrl, trigger.route, routeParams);
        await page.goto(url, { waitUntil: navigationWaitUntil });
      }
      await page.click(trigger.selector);
      return trigger.route ?? page.url();
    }
    case "fetch": {
      if (!trigger.url) {
        throw new Error("Network probe fetch trigger requires url");
      }
      if (trigger.route) {
        const { url } = resolveRoute(baseUrl, trigger.route, routeParams);
        await page.goto(url, { waitUntil: navigationWaitUntil });
      }
      const absoluteUrl = new URL(trigger.url, baseUrl).toString();
      await page.evaluate(
        async ({ url, method }) => {
          try {
            await fetch(url, { method });
          } catch {
            // Trigger is best-effort; logging is evaluated separately.
          }
        },
        { url: absoluteUrl, method: trigger.method ?? "GET" }
      );
      return trigger.route ?? trigger.url;
    }
    default:
      throw new Error(`Unsupported network probe trigger: ${(trigger as { type: string }).type}`);
  }
}

async function runProbeScenario(
  config: BugHunterConfig,
  probe: NetworkProbeDefinition,
  scenario: NetworkFailureScenario,
  session: BrowserSession
): Promise<NetworkProbeScenarioResult> {
  const { context } = session;
  context.setDefaultNavigationTimeout(config.browser.navigationTimeoutMs ?? 30_000);
  const page = await context.newPage();

  const consoleMessages: string[] = [];
  const httpFailures: string[] = [];
  const networkFailures: string[] = [];
  let route = probe.trigger.route ?? "/";

  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      consoleMessages.push(msg.text());
    }
  });
  page.on("requestfailed", (req) => {
    networkFailures.push(
      `${req.method()} ${req.url()} ${req.failure()?.errorText ?? "unknown"}`
    );
  });
  page.on("response", (res) => {
    if (res.status() >= 400) {
      httpFailures.push(`${res.status()} ${res.request().method()} ${res.url()}`);
    }
  });

  await page.route(probe.urlPattern, (routeHandler) => {
    applyMock(routeHandler, scenario);
  });

  try {
    route = await runTrigger(
      page,
      probe.trigger,
      config.baseUrl,
      config.routeParams,
      config.navigationWaitUntil
    );
    await page.waitForTimeout(500);
  } finally {
    await page.close();
  }

  const scanner = scannerDetected(scenario, httpFailures, networkFailures, consoleMessages);
  const expectAppLogging = probe.expectAppLogging ?? true;
  const logged = expectAppLogging
    ? appLoggedError(scenario, consoleMessages, probe)
    : true;
  const passed = scanner.detected && logged;

  return {
    probeName: probe.name,
    scenario,
    route,
    urlPattern: probe.urlPattern,
    mocked: true,
    scannerDetected: scanner.detected,
    scannerEvidence: scanner.evidence,
    appLogged: logged,
    consoleEvidence: consoleMessages.slice(0, 10),
    passed
  };
}

export async function runNetworkProbes(
  config: BugHunterConfig,
  session: BrowserSession
): Promise<NetworkProbeScenarioResult[]> {
  if (!config.networkProbes.enabled || config.networkProbes.probes.length === 0) {
    return [];
  }

  const results: NetworkProbeScenarioResult[] = [];
  for (const probe of config.networkProbes.probes) {
    for (const scenario of config.networkProbes.scenarios) {
      results.push(await runProbeScenario(config, probe, scenario, session));
    }
  }
  return results;
}
