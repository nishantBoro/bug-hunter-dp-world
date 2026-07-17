import path from "node:path";
import { access } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { loadConfig, loadConfigFromCli } from "./config.js";
import { ResolvedRunTarget } from "./cli.js";
import { detectFromTelemetry } from "./detectors.js";
import { detectFromNetworkProbes } from "./networkProbeDetectors.js";
import { writeRunArtifacts } from "./reporting.js";
import { ensureAuthenticated } from "./scanner/authRunner.js";
import { createBrowserSession } from "./scanner/browser.js";
import { discoverRoutesFromApp } from "./scanner/routeDiscovery.js";
import { runScriptedJourneys } from "./scanner/journeyRunner.js";
import { runNetworkProbes } from "./scanner/networkProbeRunner.js";
import { scanRoutes } from "./scanner/routeScanner.js";
import { routeSlug } from "./scanner/url.js";
import { BugHunterConfig, Finding } from "./types.js";

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

export async function runBugHunter(
  configPathOrTarget: string | ResolvedRunTarget
): Promise<{
  outputDir: string;
  findings: Finding[];
}> {
  const config =
    typeof configPathOrTarget === "string"
      ? await loadConfig(configPathOrTarget)
      : await loadConfigFromCli(
          configPathOrTarget.configPath,
          configPathOrTarget.cli,
          configPathOrTarget.app
        );

  if (config.appName || config.environmentName) {
    console.log(
      `Bug Hunter: app=${config.appName ?? "custom"} env=${config.environmentName ?? "default"} ` +
        `baseUrl=${config.baseUrl}`
    );
  }

  return runWithConfig(config);
}

async function runWithConfig(config: BugHunterConfig): Promise<{
  outputDir: string;
  findings: Finding[];
}> {
  const hasAuthLogin = config.auth.enabled;
  const storageStatePath = config.browser.storageStatePath
    ? path.resolve(config.browser.storageStatePath)
    : null;

  if (storageStatePath && !hasAuthLogin) {
    try {
      await access(storageStatePath);
    } catch {
      throw new Error(
        `Auth file not found: ${storageStatePath}\n\n` +
          "Either enable auth login in config (auth.enabled: true) with credentials,\n" +
          "or log in first:\n" +
          "  npm run setup:auth -- --app <name> --env local -u USER -p 'PASS'"
      );
    }
  }

  const outputDir = path.resolve(config.outputDir);
  const screenshotRoot = path.join(outputDir, "screenshots");
  await mkdir(screenshotRoot, { recursive: true });

  const session = await createBrowserSession(config.browser);
  try {
    await ensureAuthenticated(session.context, config);

    let scanConfig = config;
    if (config.discoverRoutes) {
      const routes = await discoverRoutesFromApp(session.context, config);
      scanConfig = { ...config, routes };
    }

    console.log(`Scanning ${scanConfig.routes.length} route(s)...`);
    const routeTelemetry = await scanRoutes(scanConfig, screenshotRoot, session);
    const telemetryFindings = detectFromTelemetry(routeTelemetry, scanConfig);
    const journeyFindings = await runScriptedJourneys(scanConfig, session);
    const networkProbeResults = await runNetworkProbes(scanConfig, session);
    const networkProbeFindings = detectFromNetworkProbes(networkProbeResults);
    const allFindings = attachScreenshots(
      [...telemetryFindings, ...journeyFindings, ...networkProbeFindings]
    );

    await writeRunArtifacts(outputDir, allFindings, routeTelemetry, networkProbeResults);
    return { outputDir, findings: allFindings };
  } finally {
    await session.close();
  }
}
