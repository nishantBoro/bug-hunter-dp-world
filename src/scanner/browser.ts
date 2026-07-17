import { Browser, chromium } from "playwright";

export async function launchBrowser(): Promise<Browser> {
  const errors: string[] = [];
  const browserPath = process.env.BUG_HUNTER_BROWSER_PATH;
  if (browserPath) {
    try {
      return await chromium.launch({ headless: true, executablePath: browserPath });
    } catch (error) {
      errors.push(`executablePath failed: ${String(error)}`);
    }
  }

  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    errors.push(`bundled chromium failed: ${String(error)}`);
  }

  for (const channel of ["chrome", "msedge"] as const) {
    try {
      return await chromium.launch({ headless: true, channel });
    } catch (error) {
      errors.push(`${channel} channel failed: ${String(error)}`);
    }
  }

  throw new Error(
    "Unable to launch browser. Install Playwright browsers or set BUG_HUNTER_BROWSER_PATH.\n" +
      errors.join("\n")
  );
}
