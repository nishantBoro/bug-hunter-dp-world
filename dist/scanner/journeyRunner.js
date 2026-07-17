import { launchBrowser } from "./browser.js";
import { resolveRoute } from "./url.js";
async function runStep(step, baseUrl, params, page) {
    switch (step.action) {
        case "goto":
            await page.goto(resolveRoute(baseUrl, step.route, params).url, {
                waitUntil: "networkidle"
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
            throw new Error(`Unsupported step action ${step.action}`);
    }
}
export async function runScriptedJourneys(config) {
    const browser = await launchBrowser();
    const context = await browser.newContext();
    const findings = [];
    try {
        for (const journey of config.journeys) {
            const page = await context.newPage();
            try {
                for (const step of journey.steps) {
                    await runStep(step, config.baseUrl, config.routeParams, page);
                }
            }
            catch (error) {
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
            }
            finally {
                await page.close();
            }
        }
    }
    finally {
        await context.close();
        await browser.close();
    }
    return findings;
}
