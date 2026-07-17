import { readFile } from "node:fs/promises";
import path from "node:path";
import { CliOptions } from "./cli.js";
import { BugHunterConfig, AuthConfig, NetworkProbeConfig } from "./types.js";

const DEFAULT_AUTH_CONFIG: AuthConfig = {
  enabled: false,
  usernameEnv: "BUG_HUNTER_USERNAME",
  passwordEnv: "BUG_HUNTER_PASSWORD",
  selectors: {
    username: "#username",
    password: "#password",
    submit: "#kc-login"
  },
  postLoginUrlPattern: "**/cds-ui/**",
  postLoginWaitMs: 2000,
  saveStorageStateAfterLogin: true
};

const DEFAULT_NETWORK_PROBE_CONFIG: NetworkProbeConfig = {
  enabled: false,
  scenarios: ["401", "404", "500", "timeout"],
  probes: []
};

interface EnvironmentOverride {
  baseUrl: string;
  outputDir?: string;
  storageStatePath?: string;
  postLoginUrlPattern?: string;
  postConfirmUrlPattern?: string;
}

interface RawConfigFile extends Partial<BugHunterConfig> {
  app?: string;
  environments?: Record<string, EnvironmentOverride>;
  defaultEnvironment?: string;
}

function buildConfig(parsed: RawConfigFile): BugHunterConfig {
  if (!parsed.baseUrl) {
    throw new Error("Missing required config field: baseUrl");
  }
  if (!parsed.outputDir) {
    throw new Error("Missing required config field: outputDir");
  }

  return {
    baseUrl: parsed.baseUrl,
    outputDir: parsed.outputDir,
    viewports:
      parsed.viewports ?? [{ name: "desktop", width: 1440, height: 900 }],
    routes: parsed.routes ?? ["/"],
    routeParams: parsed.routeParams ?? {},
    journeys: parsed.journeys ?? [],
    performanceThresholdPercent: parsed.performanceThresholdPercent ?? 20,
    performanceBaselinesMs: parsed.performanceBaselinesMs ?? {},
    navigationWaitUntil: parsed.navigationWaitUntil ?? "load",
    networkProbes: {
      ...DEFAULT_NETWORK_PROBE_CONFIG,
      ...parsed.networkProbes,
      scenarios:
        parsed.networkProbes?.scenarios ?? DEFAULT_NETWORK_PROBE_CONFIG.scenarios,
      probes: parsed.networkProbes?.probes ?? DEFAULT_NETWORK_PROBE_CONFIG.probes
    },
    browser: parsed.browser ?? {},
    networkIgnorePatterns: parsed.networkIgnorePatterns ?? [],
    networkIncludePatterns: parsed.networkIncludePatterns ?? [],
    networkSettleMs: parsed.networkSettleMs ?? 0,
    auth: {
      ...DEFAULT_AUTH_CONFIG,
      ...parsed.auth,
      selectors: {
        ...DEFAULT_AUTH_CONFIG.selectors,
        ...parsed.auth?.selectors
      }
    },
    discoverRoutes: parsed.discoverRoutes ?? false,
    appName: parsed.app,
    environmentName: undefined
  };
}

function applyEnvironment(
  config: BugHunterConfig,
  raw: RawConfigFile,
  environmentName: string
): BugHunterConfig {
  const environments = raw.environments;
  if (!environments || Object.keys(environments).length === 0) {
    return config;
  }

  const envConfig = environments[environmentName];
  if (!envConfig) {
    const known = Object.keys(environments).sort().join(", ");
    throw new Error(
      `Unknown environment "${environmentName}". Available: ${known}`
    );
  }

  const browser = { ...config.browser };
  if (envConfig.storageStatePath) {
    browser.storageStatePath = envConfig.storageStatePath;
  }

  const auth = { ...config.auth };
  if (envConfig.postLoginUrlPattern) {
    auth.postLoginUrlPattern = envConfig.postLoginUrlPattern;
  }
  if (envConfig.postConfirmUrlPattern && auth.locationSelection) {
    auth.locationSelection = {
      ...auth.locationSelection,
      postConfirmUrlPattern: envConfig.postConfirmUrlPattern
    };
  }

  return {
    ...config,
    baseUrl: envConfig.baseUrl,
    outputDir: envConfig.outputDir ?? `${config.outputDir}/${environmentName}`,
    browser,
    auth,
    environmentName
  };
}

export async function loadConfig(
  configPath: string,
  options?: {
    environment?: string;
    discoverRoutes?: boolean;
    headless?: boolean;
    appName?: string;
  }
): Promise<BugHunterConfig> {
  const absolutePath = path.resolve(configPath);
  const raw = JSON.parse(await readFile(absolutePath, "utf-8")) as RawConfigFile;

  let config = buildConfig(raw);

  const envToApply =
    options?.environment ??
    process.env.BUG_HUNTER_ENV ??
    raw.defaultEnvironment;

  if (raw.environments && envToApply) {
    config = applyEnvironment(config, raw, envToApply);
  }

  if (envToApply) {
    config.environmentName = envToApply;
  }

  if (options?.discoverRoutes !== undefined) {
    config.discoverRoutes = options.discoverRoutes;
  }

  if (options?.headless !== undefined) {
    config.browser = { ...config.browser, headless: options.headless };
  }

  if (options?.appName) {
    config.appName = options.appName;
  } else if (raw.app) {
    config.appName = raw.app;
  }

  return config;
}

export async function loadConfigFromCli(
  configPath: string,
  cli: CliOptions,
  appName?: string
): Promise<BugHunterConfig> {
  return loadConfig(configPath, {
    environment: cli.environment,
    discoverRoutes: cli.discoverRoutes,
    headless: cli.headless,
    appName
  });
}
