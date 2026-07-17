import { BugHunterConfig, Finding, JourneyStep, NavigationWaitUntil } from "../types.js";
import { BrowserSession } from "./browser.js";
import { safeNavigationWaitUntil } from "./navigation.js";
import { resolveRoute } from "./url.js";

async function runStep(
  step: JourneyStep,
  baseUrl: string,
  params: Record<string, string>,
  page: import("playwright").Page,
  navigationWaitUntil: NavigationWaitUntil
): Promise<void> {
  switch (step.action) {
    case "goto":
      await page.goto(resolveRoute(baseUrl, step.route, params).url, {
        waitUntil: safeNavigationWaitUntil(navigationWaitUntil)
      });
      return;
    case "click":
      await page.click(step.selector);
      return;
    case "fill":
      await page.fill(step.selector, step.value);
      return;
    case "press":
      await page.press(step.selector, step.key);
      return;
    case "waitFor":
      await page.waitForTimeout(step.milliseconds);
      return;
    default:
      throw new Error(`Unsupported step action ${(step as { action: string }).action}`);
  }
}

export async function runScriptedJourneys(
  config: BugHunterConfig,
  session: BrowserSession
): Promise<Finding[]> {
  const { context } = session;
  context.setDefaultNavigationTimeout(config.browser.navigationTimeoutMs ?? 30_000);
  const findings: Finding[] = [];

  for (const journey of config.journeys) {
      const page = await context.newPage();
      try {
        for (const step of journey.steps) {
          await runStep(step, config.baseUrl, config.routeParams, page, config.navigationWaitUntil);
        }
      } catch (error) {
        findings.push({
          id: `journey-${journey.name.replaceAll(/\W+/g, "-").toLowerCase()}`,
          title: `Journey failed: ${journey.name}`,
          category: "functional",
          severity: "critical",
          owner: "frontend",
          route: page.url() || "/",
          reproSteps: [
            `Run journey '${journey.name}' from config`,
            "Execute the listed steps in order",
            "Observe failure at current step"
          ],
          suspectedCause: error instanceof Error ? error.message : "Unknown journey execution error",
          evidence: {
            details: error instanceof Error ? error.stack : String(error)
          },
          createdAt: new Date().toISOString()
        });
      } finally {
        await page.close();
      }
    }

  return findings;
}
