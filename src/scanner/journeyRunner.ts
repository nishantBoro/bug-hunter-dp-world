import { BugHunterConfig, Finding, JourneyStep, NavigationWaitUntil } from "../types.js";
import { launchBrowser } from "./browser.js";
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
        waitUntil: navigationWaitUntil
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

export async function runScriptedJourneys(config: BugHunterConfig): Promise<Finding[]> {
  const browser = await launchBrowser();
  const context = await browser.newContext();
  const findings: Finding[] = [];

  try {
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
  } finally {
    await context.close();
    await browser.close();
  }

  return findings;
}
