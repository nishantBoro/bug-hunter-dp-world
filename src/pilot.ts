import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { runBugHunter } from "./run.js";
import { Finding } from "./types.js";

const host = "127.0.0.1";
const port = 4173;
const fixtureRoot = path.resolve("fixtures/seeded-spa");

function send(res: ServerResponse, status: number, body: string, contentType: string): void {
  res.writeHead(status, { "content-type": contentType });
  res.end(body);
}

async function serveFixture(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = req.url ?? "/";

  if (url === "/api/error") {
    send(res, 500, JSON.stringify({ error: "seeded backend failure" }), "application/json");
    return;
  }
  if (url === "/api/submit") {
    send(res, 504, JSON.stringify({ error: "seeded submit timeout" }), "application/json");
    return;
  }

  const filePath =
    url === "/" ? path.join(fixtureRoot, "index.html") : path.join(fixtureRoot, url);
  try {
    const body = await readFile(filePath, "utf-8");
    send(res, 200, body, "text/html; charset=utf-8");
  } catch {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
  }
}

async function main(): Promise<void> {
  const server = createServer((req, res) => {
    void serveFixture(req, res);
  });

  await new Promise<void>((resolve) => server.listen(port, host, resolve));
  console.log(`Seeded app running at http://${host}:${port}`);

  try {
    const configPath = new URL("../bughunter.config.json", import.meta.url);
    const result = await runBugHunter(configPath.pathname);

    const expectedCategories: Finding["category"][] = [
      "runtime",
      "network",
      "functional",
      "ui",
      "performance"
    ];
    const foundCategories = new Set(result.findings.map((f) => f.category));
    const missed = expectedCategories.filter((c) => !foundCategories.has(c));
    const falsePositiveEstimate = result.findings.filter((f) => f.severity === "low").length;
    const fpRate = result.findings.length
      ? (falsePositiveEstimate / result.findings.length) * 100
      : 0;

    console.log("Pilot run complete.");
    console.log(`Output: ${result.outputDir}`);
    console.log(`Found categories: ${Array.from(foundCategories).join(", ")}`);
    console.log(`Missed categories: ${missed.length ? missed.join(", ") : "none"}`);
    console.log(`False-positive estimate: ${fpRate.toFixed(1)}%`);
    if (fpRate > 20) {
      console.warn("Tune recommendation: tighten low-severity UI thresholds.");
    }
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

main().catch((error) => {
  console.error("Pilot failed:", error);
  process.exitCode = 1;
});
