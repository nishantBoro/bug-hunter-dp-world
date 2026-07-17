import { fingerprint } from "./fingerprint.js";
import { Finding, NetworkProbeScenarioResult } from "./types.js";

function createProbeFinding(
  result: NetworkProbeScenarioResult,
  title: string,
  severity: Finding["severity"],
  suspectedCause: string
): Finding {
  const route = result.route || "/";
  const category = "network";
  return {
    id: `network-probe-${fingerprint([
      result.probeName,
      result.scenario,
      route,
      title
    ])}`,
    title,
    category,
    severity,
    owner: "shared",
    route,
    reproSteps: [
      `Enable network probes for "${result.probeName}"`,
      `Mock ${result.scenario} on pattern ${result.urlPattern}`,
      `Trigger request via configured probe action on ${route}`,
      "Inspect scanner telemetry and browser console output"
    ],
    suspectedCause,
    evidence: {
      networkExcerpt: result.scannerEvidence,
      consoleExcerpt: result.consoleEvidence,
      details: JSON.stringify({
        probeName: result.probeName,
        scenario: result.scenario,
        urlPattern: result.urlPattern,
        scannerDetected: result.scannerDetected,
        appLogged: result.appLogged,
        passed: result.passed
      })
    },
    createdAt: new Date().toISOString()
  };
}

export function detectFromNetworkProbes(
  results: NetworkProbeScenarioResult[]
): Finding[] {
  const findings: Finding[] = [];

  for (const result of results) {
    if (!result.scannerDetected) {
      findings.push(
        createProbeFinding(
          result,
          `Network probe: scanner missed mocked ${result.scenario} for ${result.probeName}`,
          "high",
          "Bug Hunter did not record the mocked HTTP/network failure in telemetry"
        )
      );
    }

    if (!result.appLogged) {
      findings.push(
        createProbeFinding(
          result,
          `Network probe: application did not log mocked ${result.scenario} for ${result.probeName}`,
          "medium",
          "Application error logging/observability may be missing for this failure mode"
        )
      );
    }
  }

  return findings;
}
