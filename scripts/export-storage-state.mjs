#!/usr/bin/env node
/**
 * Export Playwright storage state (cookies + localStorage) from an authenticated session.
 *
 * Usage:
 *   node scripts/export-storage-state.mjs <url> <output.json> [userDataDir]
 *
 * Example:
 *   node scripts/export-storage-state.mjs \
 *     "http://localhost:4222/cds-ui/#/cds-declaration?location=CDMSGB1" \
 *     ./auth/cds-storage-state.json \
 *     /tmp/temporary-chrome-profile-dir
 *
 * Close Chrome using that profile before running this script.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const [url, outputPath, userDataDir = process.env.BUG_HUNTER_USER_DATA_DIR] = process.argv.slice(2);

if (!url || !outputPath) {
  console.error(
    "Usage: node scripts/export-storage-state.mjs <url> <output.json> [userDataDir]"
  );
  process.exit(1);
}

if (!userDataDir) {
  console.error(
    "Provide userDataDir as the third argument or set BUG_HUNTER_USER_DATA_DIR."
  );
  process.exit(1);
}

const absoluteOutput = path.resolve(outputPath);
await mkdir(path.dirname(absoluteOutput), { recursive: true });

const context = await chromium.launchPersistentContext(userDataDir, {
  headless: true,
  channel: "chrome",
  args: ["--disable-web-security", "--disable-site-isolation-trials"]
});

try {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(2_000);
  await context.storageState({ path: absoluteOutput });
  console.log(`Saved storage state to ${absoluteOutput}`);
} finally {
  await context.close();
}
