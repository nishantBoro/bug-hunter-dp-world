import { BugHunterConfig, Finding, RouteTelemetry } from "./types.js";
import { fingerprint } from "./fingerprint.js";
import { summarizeHttpFailures } from "./scanner/networkFilter.js";

function createFinding(
  base: Omit<Finding, "id" | "createdAt" | "viewport">,
  viewport: string
): Finding {
  return {
    ...base,
    viewport,
    // Stable across runs: same category on the same route+viewport always
    // yields the same id, so findings can be diffed, suppressed, and tracked.
    id: `${base.category}-${fingerprint([base.category, base.route, viewport])}`,
    createdAt: new Date().toISOString()
  };
}

export function detectFromTelemetry(
  telemetry: RouteTelemetry[],
  config: BugHunterConfig
): Finding[] {
  const findings: Finding[] = [];

  for (const item of telemetry) {
    if (item.consoleErrors.length || item.pageErrors.length) {
      findings.push(
        createFinding(
          {
            title: "Runtime errors detected in browser console",
            category: "runtime",
            severity: "high",
            owner: "frontend",
            route: item.route,
            reproSteps: [
              `Open ${item.route} on viewport ${item.viewport}`,
              "Open browser devtools console",
              "Observe uncaught errors/rejections"
            ],
            suspectedCause: "Unhandled exception or rejected promise in route script",
            evidence: {
              consoleExcerpt: [...item.consoleErrors, ...item.pageErrors].slice(0, 10)
            }
          },
          item.viewport
        )
      );
    }

    if (item.networkFailures.length || item.httpFailures.length) {
      const statusSummary = summarizeHttpFailures(item.httpFailures);
      const hasServerError = item.httpFailures.some((x) => /\b5\d{2}\b/.test(x));
      const hasClientError = item.httpFailures.some((x) => /\b4\d{2}\b/.test(x));

      findings.push(
        createFinding(
          {
            title: "Network/API failures detected",
            category: "network",
            severity: hasServerError ? "critical" : hasClientError ? "high" : "high",
            owner: hasServerError ? "backend" : "shared",
            route: item.route,
            reproSteps: [
              `Open ${item.route}`,
              "Inspect network panel",
              "Observe failed request(s)"
            ],
            suspectedCause:
              "API returned 4xx/5xx, gateway error (502/503/504), validation error (422), auth failure (401), or request timeout",
            evidence: {
              networkExcerpt: [...item.networkFailures, ...item.httpFailures].slice(0, 20),
              details: statusSummary ? `Status breakdown: ${statusSummary}` : undefined
            }
          },
          item.viewport
        )
      );
    }

    if (item.blankScreenDetected || item.redirectLoopDetected) {
      findings.push(
        createFinding(
          {
            title: "Functional navigation break detected",
            category: "functional",
            severity: "critical",
            owner: "frontend",
            route: item.route,
            reproSteps: [
              `Navigate to ${item.route}`,
              "Observe route behavior",
              "Notice blank screen or redirect loop"
            ],
            suspectedCause: item.redirectLoopDetected
              ? "Auth/session redirect guard loop"
              : "Route render failure or state hydration issue",
            evidence: {
              details: JSON.stringify({
                blankScreenDetected: item.blankScreenDetected,
                redirectLoopDetected: item.redirectLoopDetected
              })
            }
          },
          item.viewport
        )
      );
    }

    if (
      item.uiSignals.hiddenPrimaryActions.length ||
      item.uiSignals.offscreenInteractive.length ||
      item.uiSignals.clippedTextNodes > 0 ||
      item.uiSignals.overlapPairs > 6
    ) {
      findings.push(
        createFinding(
          {
            title: "UI regression signals detected",
            category: "ui",
            severity: "medium",
            owner: "frontend",
            route: item.route,
            reproSteps: [
              `Open ${item.route} on viewport ${item.viewport}`,
              "Inspect interactive controls and text layout",
              "Observe overlaps, clipping, or inaccessible controls"
            ],
            suspectedCause: "Layout/CSS regression affecting interactive affordances",
            evidence: {
              details: JSON.stringify(item.uiSignals),
              consoleExcerpt: [
                `hiddenPrimaryActions: ${item.uiSignals.hiddenPrimaryActions.length}`,
                `offscreenInteractive: ${item.uiSignals.offscreenInteractive.length}`,
                `clippedTextNodes: ${item.uiSignals.clippedTextNodes}`,
                `overlapPairs: ${item.uiSignals.overlapPairs}`
              ]
            }
          },
          item.viewport
        )
      );
    }

    const baseline = config.performanceBaselinesMs[item.route];
    if (baseline && item.durationMs > baseline * (1 + config.performanceThresholdPercent / 100)) {
      const increasePct = ((item.durationMs - baseline) / baseline) * 100;
      findings.push(
        createFinding(
          {
            title: "Performance regression over configured baseline",
            category: "performance",
            severity: "medium",
            owner: "frontend",
            route: item.route,
            reproSteps: [
              `Visit ${item.route}`,
              "Measure route navigation duration",
              "Compare against baseline"
            ],
            suspectedCause: "Blocking JS/CSS or expensive render path",
            evidence: {
              details: `Observed ${item.durationMs}ms vs baseline ${baseline}ms (+${increasePct.toFixed(1)}%)`
            }
          },
          item.viewport
        )
      );
    }
  }

  return findings;
}
