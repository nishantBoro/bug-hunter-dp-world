import path from "node:path";
import { mkdir } from "node:fs/promises";
import { BrowserContext, Page } from "playwright";
import { BugHunterConfig } from "../types.js";
import { safeNavigationWaitUntil } from "./navigation.js";
import { resolveRoute } from "./url.js";

function resolveCredential(
  literal: string | undefined,
  envKey: string | undefined,
  label: string
): string {
  if (envKey) {
    const value = process.env[envKey];
    if (!value) {
      throw new Error(
        `Missing ${label} environment variable: ${envKey}\n` +
          `Set it before scanning, e.g. export ${envKey}='your-value'`
      );
    }
    return value;
  }
  if (literal) {
    return literal;
  }
  throw new Error(`Auth config must provide ${label} or ${label}Env`);
}

async function isLoginPage(page: Page, config: BugHunterConfig): Promise<boolean> {
  const auth = config.auth;
  if (!auth.enabled) {
    return false;
  }

  if (/login|auth|openid-connect|signin/i.test(page.url())) {
    return true;
  }

  try {
    await page.waitForSelector(auth.selectors.username, { timeout: 4_000 });
    return true;
  } catch {
    return false;
  }
}

async function waitForLoginOrApp(page: Page, config: BugHunterConfig): Promise<void> {
  const auth = config.auth;
  const timeout = config.browser.navigationTimeoutMs ?? 60_000;

  try {
    await Promise.race([
      page.waitForSelector(auth.selectors.username, { timeout }),
      auth.postLoginUrlPattern
        ? page.waitForURL(auth.postLoginUrlPattern, { timeout })
        : page.waitForLoadState("load", { timeout })
    ]);
  } catch {
    // Fall through — isLoginPage will decide next step.
  }
}

async function clickSubmit(page: Page, config: BugHunterConfig): Promise<void> {
  const candidates = [
    config.auth.selectors.submit,
    'input[type="submit"]',
    '#kc-login',
    'button:has-text("Sign In")',
    'button:has-text("Sign in")'
  ];

  for (const selector of [...new Set(candidates)]) {
    try {
      await page.click(selector, { timeout: 5_000 });
      return;
    } catch {
      // Try next selector.
    }
  }

  throw new Error(
    "Could not find login submit button. Update auth.selectors.submit in config."
  );
}

async function performLogin(page: Page, config: BugHunterConfig): Promise<void> {
  const auth = config.auth;
  const username = resolveCredential(auth.username, auth.usernameEnv, "username");
  const password = resolveCredential(auth.password, auth.passwordEnv, "password");

  console.log("Logging in...");
  await page.waitForSelector(auth.selectors.username, { timeout: 30_000 });
  await page.fill(auth.selectors.username, username);
  await page.fill(auth.selectors.password, password);
  await clickSubmit(page, config);

  const timeout = config.browser.navigationTimeoutMs ?? 60_000;
  try {
    if (auth.postLoginUrlPattern) {
      await page.waitForURL(auth.postLoginUrlPattern, { timeout });
    } else {
      await page.waitForLoadState("load");
    }
  } catch {
    const currentUrl = page.url();
    const loginError = await page
      .locator('.kc-feedback-text, .alert-error, #input-error, [class*="error"]')
      .first()
      .textContent()
      .catch(() => null);

    throw new Error(
      "Login did not reach the application after submitting credentials.\n" +
        `Current URL: ${currentUrl}\n` +
        (loginError ? `Login page message: ${loginError.trim()}\n` : "") +
        "Check that BUG_HUNTER_USERNAME and BUG_HUNTER_PASSWORD are set to your real credentials " +
        "(via -u/-p flags or export env vars)."
    );
  }

  if (auth.postLoginWaitMs) {
    await page.waitForTimeout(auth.postLoginWaitMs);
  }

  if (await isLoginPage(page, config)) {
    throw new Error(
      "Login appears to have failed — still on the login page. " +
        "Check credentials, selectors, and postLoginUrlPattern in config."
    );
  }

  console.log(`Login successful. Landed on: ${page.url()}`);
}

function resolveLocationOptionText(config: BugHunterConfig): string {
  const location = config.auth.locationSelection;
  if (!location) {
    return "";
  }

  if (location.optionTextFromRouteParam) {
    const fromRoute = config.routeParams[location.optionTextFromRouteParam];
    if (fromRoute) {
      return fromRoute;
    }
  }

  return location.optionText ?? "";
}

async function isLocationModalVisible(page: Page, config: BugHunterConfig): Promise<boolean> {
  const location = config.auth.locationSelection;
  if (!location?.enabled) {
    return false;
  }

  const waitFor = location.waitForSelector ?? "text=Select Location";
  try {
    await page.waitForSelector(waitFor, { timeout: 3_000 });
    return true;
  } catch {
    return false;
  }
}

async function performLocationSelection(page: Page, config: BugHunterConfig): Promise<void> {
  const location = config.auth.locationSelection;
  if (!location?.enabled) {
    return;
  }

  if (!(await isLocationModalVisible(page, config))) {
    console.log("No location popup detected, continuing.");
    return;
  }

  const optionText = resolveLocationOptionText(config);
  if (!optionText) {
    throw new Error(
      "locationSelection is enabled but no optionText or optionTextFromRouteParam was resolved."
    );
  }

  console.log(`Selecting location: ${optionText}`);
  const selectSelector = location.selectSelector ?? "mat-select";
  const optionSelector = location.optionSelector ?? "mat-option";
  const confirmSelector = location.confirmSelector ?? 'button:has-text("Confirm")';

  await page.locator(selectSelector).first().click();
  await page.locator(optionSelector).filter({ hasText: optionText }).first().click();
  await page.locator(confirmSelector).first().click();

  if (location.postConfirmUrlPattern) {
    await page.waitForURL(location.postConfirmUrlPattern, {
      timeout: config.browser.navigationTimeoutMs ?? 60_000
    });
  }

  if (location.postConfirmWaitMs) {
    await page.waitForTimeout(location.postConfirmWaitMs);
  } else {
    await page.waitForTimeout(3_000);
  }

  console.log(`Location confirmed. Current URL: ${page.url()}`);
}

async function finalizeAuthSession(
  context: BrowserContext,
  config: BugHunterConfig
): Promise<void> {
  if (config.auth.saveStorageStateAfterLogin && config.browser.storageStatePath) {
    const authPath = path.resolve(config.browser.storageStatePath);
    await mkdir(path.dirname(authPath), { recursive: true });
    await context.storageState({ path: authPath });
    console.log(`Saved authenticated session to ${authPath}`);
  }
}

export async function ensureAuthenticated(
  context: BrowserContext,
  config: BugHunterConfig
): Promise<void> {
  if (!config.auth.enabled) {
    return;
  }

  const page = await context.newPage();
  try {
    const entryRoute = config.auth.entryRoute ?? config.routes[0] ?? "/";
    const { url: entryUrl } = resolveRoute(
      config.baseUrl,
      entryRoute,
      config.routeParams
    );

    const authWaitUntil = safeNavigationWaitUntil(
      config.auth.navigationWaitUntil ?? "load"
    );

    console.log(`Opening entry URL (waitUntil=${authWaitUntil})...`);
    await page.goto(entryUrl, {
      waitUntil: authWaitUntil,
      timeout: config.browser.navigationTimeoutMs ?? 60_000
    });

    await waitForLoginOrApp(page, config);

    if (await isLoginPage(page, config)) {
      await performLogin(page, config);
    } else {
      console.log("Session already authenticated, skipping login.");
    }

    await performLocationSelection(page, config);
    await finalizeAuthSession(context, config);
  } finally {
    await page.close();
  }
}
