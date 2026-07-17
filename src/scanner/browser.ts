import { access } from "node:fs/promises";
import { Browser, BrowserContext, chromium } from "playwright";
import { BrowserConfig } from "../types.js";

export interface BrowserSession {
  context: BrowserContext;
  close: () => Promise<void>;
}

const DEFAULT_CHROMIUM_ARGS = [
  "--disable-web-security",
  "--disable-site-isolation-trials"
];

async function launchChromium(
  headless: boolean,
  channel?: BrowserConfig["channel"],
  args: string[] = DEFAULT_CHROMIUM_ARGS
): Promise<Browser> {
  const errors: string[] = [];
  const browserPath = process.env.BUG_HUNTER_BROWSER_PATH;

  const launchOptions = { headless, args };

  if (browserPath) {
    try {
      return await chromium.launch({ ...launchOptions, executablePath: browserPath });
    } catch (error) {
      errors.push(`executablePath failed: ${String(error)}`);
    }
  }

  if (channel) {
    try {
      return await chromium.launch({ ...launchOptions, channel });
    } catch (error) {
      errors.push(`${channel} channel failed: ${String(error)}`);
    }
  }

  try {
    return await chromium.launch(launchOptions);
  } catch (error) {
    errors.push(`bundled chromium failed: ${String(error)}`);
  }

  for (const fallbackChannel of ["chrome", "msedge"] as const) {
    if (fallbackChannel === channel) {
      continue;
    }
    try {
      return await chromium.launch({ ...launchOptions, channel: fallbackChannel });
    } catch (error) {
      errors.push(`${fallbackChannel} channel failed: ${String(error)}`);
    }
  }

  throw new Error(
    "Unable to launch browser. Install Playwright browsers or set BUG_HUNTER_BROWSER_PATH.\n" +
      errors.join("\n")
  );
}

function resolveBrowserConfig(config?: BrowserConfig): Required<
  Pick<BrowserConfig, "headless" | "chromiumArgs" | "navigationTimeoutMs" | "postLoadWaitMs">
> &
  BrowserConfig {
  const userDataDir =
    config?.userDataDir ?? process.env.BUG_HUNTER_USER_DATA_DIR ?? undefined;
  const storageStatePath =
    config?.storageStatePath ?? process.env.BUG_HUNTER_STORAGE_STATE ?? undefined;

  return {
    headless: config?.headless ?? true,
    channel: config?.channel ?? "chrome",
    userDataDir,
    storageStatePath,
    extraHTTPHeaders: config?.extraHTTPHeaders,
    chromiumArgs: [...DEFAULT_CHROMIUM_ARGS, ...(config?.chromiumArgs ?? [])],
    navigationTimeoutMs: config?.navigationTimeoutMs ?? 30_000,
    postLoadWaitMs: config?.postLoadWaitMs ?? 2_000
  };
}

/** @deprecated Use createBrowserSession instead */
export async function launchBrowser(): Promise<Browser> {
  return launchChromium(true, "chrome");
}

export async function createBrowserSession(config?: BrowserConfig): Promise<BrowserSession> {
  const resolved = resolveBrowserConfig(config);

  // Prefer storageState over userDataDir — avoids Chrome profile lock when Chrome is open.
  if (resolved.storageStatePath && resolved.userDataDir) {
    console.warn(
      "Both storageStatePath and userDataDir are set; using storageStatePath. " +
        "Remove userDataDir from config to silence this warning."
    );
  }

  if (resolved.userDataDir && !resolved.storageStatePath) {
    try {
      const context = await chromium.launchPersistentContext(resolved.userDataDir, {
        headless: resolved.headless,
        channel: resolved.channel,
        args: resolved.chromiumArgs,
        extraHTTPHeaders: resolved.extraHTTPHeaders,
        viewport: null
      });

      return {
        context,
        close: async () => {
          await context.close();
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("ProcessSingleton") || message.includes("profile is already in use")) {
        throw new Error(
          "Chrome profile is already in use (close Chrome or use exported auth instead).\n\n" +
            "Quick fix:\n" +
            "  1. Quit Chrome using /tmp/temporary-chrome-profile-dir\n" +
            "  2. Run: npm run setup:auth -- --app <name> -u USER -p 'PASS'\n" +
            "  3. Re-open Chrome for daily work\n" +
            "  4. Run: npm run hunt -- --app <name>\n\n" +
            "Or close Chrome and run the scan again with userDataDir in config."
        );
      }
      throw error;
    }
  }

  const browser = await launchChromium(
    resolved.headless,
    resolved.channel,
    resolved.chromiumArgs
  );

  let storageState: string | undefined;
  if (resolved.storageStatePath) {
    try {
      await access(resolved.storageStatePath);
      storageState = resolved.storageStatePath;
    } catch {
      console.log(
        `No saved session at ${resolved.storageStatePath} — starting fresh` +
          (config?.storageStatePath ? " (will log in if auth is enabled)." : ".")
      );
    }
  }

  const context = await browser.newContext({
    storageState,
    extraHTTPHeaders: resolved.extraHTTPHeaders
  });

  return {
    context,
    close: async () => {
      await context.close();
      await browser.close();
    }
  };
}
