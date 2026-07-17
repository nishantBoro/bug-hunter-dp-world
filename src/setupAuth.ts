import { parseCliOptions, printCliHelp, resolveRunTarget } from "./cli.js";
import { loadConfigFromCli } from "./config.js";
import { ensureAuthenticated } from "./scanner/authRunner.js";
import { createBrowserSession } from "./scanner/browser.js";

async function main(): Promise<void> {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`Bug Hunter — log in and save session only (no scan)

Usage:
  npm run setup:auth -- --app <name> --env <local|live> -u <user> -p <pass>
  npm run setup:auth -- cds-declaration local -u <user> -p <pass>

Reads baseUrl, entry route, and storage path from the app config — no hardcoded URLs.
`);
    printCliHelp();
    return;
  }

  const cli = parseCliOptions();
  if (!cli.app && !cli.configPath) {
    throw new Error("Missing --app <name> or --config <path>.");
  }

  const target = await resolveRunTarget();
  const config = await loadConfigFromCli(
    target.configPath,
    target.cli,
    target.app
  );

  if (!config.auth.enabled) {
    throw new Error(
      "Auth is disabled in this config. Enable auth.enabled or use a different app."
    );
  }

  console.log(
    `Setting up auth: app=${config.appName ?? "custom"} env=${config.environmentName ?? "default"} ` +
      `baseUrl=${config.baseUrl}`
  );

  const session = await createBrowserSession(config.browser);
  try {
    await ensureAuthenticated(session.context, config);
    console.log("Auth setup complete. Run hunt when ready:");
    console.log(
      `  npm run hunt -- --app ${target.app ?? "<app>"} --env ${config.environmentName ?? "local"}`
    );
  } finally {
    await session.close();
  }
}

main().catch((error) => {
  console.error("Auth setup failed:", error);
  process.exitCode = 1;
});
