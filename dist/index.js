import { runBugHunter } from "./run.js";
function parseConfigPath() {
    const configArgIdx = process.argv.findIndex((arg) => arg === "--config");
    if (configArgIdx === -1 || !process.argv[configArgIdx + 1]) {
        return "bughunter.config.json";
    }
    return process.argv[configArgIdx + 1];
}
async function main() {
    const configPath = parseConfigPath();
    const result = await runBugHunter(configPath);
    const severityCounts = result.findings.reduce((acc, finding) => {
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
