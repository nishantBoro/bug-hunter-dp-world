import path from "node:path";
import { mkdir } from "node:fs/promises";
import { loadConfig } from "./config.js";
import { detectFromTelemetry } from "./detectors.js";
import { writeRunArtifacts } from "./reporting.js";
import { runScriptedJourneys } from "./scanner/journeyRunner.js";
import { scanRoutes } from "./scanner/routeScanner.js";
import { routeSlug } from "./scanner/url.js";
import { Finding } from "./types.js";

function attachScreenshots(findings: Finding[]): Finding[] {
  return findings.map((f) => {
    const viewport = f.viewport ?? "desktop";
    const screenshotPath = path.join("screenshots", viewport, `${routeSlug(f.route)}.png`);
    return {
      ...f,
      evidence: {
        ...f.evidence,
        screenshotPath
      }
    };
  });
}

export async function runBugHunter(configPath: string): Promise<{
  outputDir: string;
  findings: Finding[];
}> {
  const config = await loadConfig(configPath);
  const outputDir = path.resolve(config.outputDir);
  const screenshotRoot = path.join(outputDir, "screenshots");
  await mkdir(screenshotRoot, { recursive: true });

  const routeTelemetry = await scanRoutes(config, screenshotRoot);
  const telemetryFindings = detectFromTelemetry(routeTelemetry, config);
  const journeyFindings = await runScriptedJourneys(config);
  const allFindings = attachScreenshots(
    [...telemetryFindings, ...journeyFindings]
  );

  await writeRunArtifacts(outputDir, allFindings, routeTelemetry);
  return { outputDir, findings: allFindings };
}
