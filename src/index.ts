import { runBugHunter } from "./run.js";
import { parseCliOptions, printCliHelp, resolveRunTarget } from "./cli.js";

async function main(): Promise<void> {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printCliHelp();
    return;
  }

  const cli = parseCliOptions();
  const result =
    !cli.app && !cli.configPath
      ? await runBugHunter("bughunter.config.json")
      : await runBugHunter(await resolveRunTarget());

  const severityCounts = result.findings.reduce<Record<string, number>>((acc, finding) => {
    acc[finding.severity] = (acc[finding.severity] ?? 0) + 1;
    return acc;
  }, {});

  console.log("Bug Hunter run completed.");
  console.log(`Output: ${result.outputDir}`);
  console.log(`Findings: ${result.findings.length}`);
  console.log(`Severity breakdown: ${JSON.stringify(severityCounts)}`);
}

main().catch((error) => {
  console.error("Bug Hunter failed:", error);
  process.exitCode = 1;
});
