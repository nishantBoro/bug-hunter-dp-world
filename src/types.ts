export type Severity = "critical" | "high" | "medium" | "low";

export type Owner = "frontend" | "backend" | "shared";

export interface Evidence {
  screenshotPath?: string;
  consoleExcerpt?: string[];
  networkExcerpt?: string[];
  details?: string;
}

export interface Finding {
  id: string;
  title: string;
  category:
    | "runtime"
    | "network"
    | "functional"
    | "ui"
    | "performance";
  severity: Severity;
  owner: Owner;
  route: string;
  viewport?: string;
  componentHint?: string;
  reproSteps: string[];
  suspectedCause?: string;
  evidence: Evidence;
  createdAt: string;
}

export type NavigationWaitUntil = "load" | "domcontentloaded" | "networkidle" | "commit";

export interface BrowserConfig {
  headless?: boolean;
  channel?: "chrome" | "msedge" | "chromium";
  userDataDir?: string;
  storageStatePath?: string;
  extraHTTPHeaders?: Record<string, string>;
  chromiumArgs?: string[];
  navigationTimeoutMs?: number;
  postLoadWaitMs?: number;
}

export type NetworkFailureScenario = "401" | "404" | "500" | "timeout";

export interface NetworkProbeTrigger {
  type: "goto" | "click" | "fetch";
  route?: string;
  selector?: string;
  url?: string;
  method?: string;
}

export interface NetworkProbeDefinition {
  name: string;
  urlPattern: string;
  trigger: NetworkProbeTrigger;
  expectAppLogging?: boolean;
  logPatterns?: string[];
}

export interface NetworkProbeConfig {
  enabled: boolean;
  scenarios: NetworkFailureScenario[];
  probes: NetworkProbeDefinition[];
}

export interface NetworkProbeScenarioResult {
  probeName: string;
  scenario: NetworkFailureScenario;
  route: string;
  urlPattern: string;
  mocked: boolean;
  scannerDetected: boolean;
  scannerEvidence: string[];
  appLogged: boolean;
  consoleEvidence: string[];
  passed: boolean;
}

export interface AuthConfig {
  enabled: boolean;
  entryRoute?: string;
  username?: string;
  usernameEnv?: string;
  password?: string;
  passwordEnv?: string;
  selectors: {
    username: string;
    password: string;
    submit: string;
  };
  postLoginUrlPattern?: string;
  postLoginWaitMs?: number;
  saveStorageStateAfterLogin?: boolean;
  /** Auth navigation must not use networkidle — SPAs never go idle. Default: load */
  navigationWaitUntil?: NavigationWaitUntil;
  locationSelection?: AuthLocationSelectionConfig;
}

export interface AuthLocationSelectionConfig {
  enabled: boolean;
  /** Wait for this before interacting (default: text=Select Location) */
  waitForSelector?: string;
  selectSelector?: string;
  optionSelector?: string;
  optionText?: string;
  /** Use a value from routeParams, e.g. "location" */
  optionTextFromRouteParam?: string;
  confirmSelector?: string;
  postConfirmWaitMs?: number;
  postConfirmUrlPattern?: string;
}

export interface BugHunterConfig {
  baseUrl: string;
  outputDir: string;
  viewports: Array<{ name: string; width: number; height: number }>;
  routes: string[];
  routeParams: Record<string, string>;
  journeys: Journey[];
  performanceThresholdPercent: number;
  performanceBaselinesMs: Record<string, number>;
  navigationWaitUntil: NavigationWaitUntil;
  networkProbes: NetworkProbeConfig;
  browser: BrowserConfig;
  networkIgnorePatterns: string[];
  /** If set, only these URL patterns are included in network findings */
  networkIncludePatterns: string[];
  /** After page load, wait then record only failures in this window (skips bootstrap noise) */
  networkSettleMs: number;
  auth: AuthConfig;
  /** Crawl in-app links after login and merge with configured routes */
  discoverRoutes?: boolean;
  /** Metadata for reports (optional) */
  appName?: string;
  environmentName?: string;
}

export interface Journey {
  name: string;
  steps: JourneyStep[];
}

export type JourneyStep =
  | { action: "goto"; route: string }
  | { action: "click"; selector: string }
  | { action: "fill"; selector: string; value: string }
  | { action: "waitFor"; milliseconds: number }
  | { action: "press"; selector: string; key: string };

export interface RouteTelemetry {
  route: string;
  viewport: string;
  urlVisited: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  consoleErrors: string[];
  pageErrors: string[];
  networkFailures: string[];
  httpFailures: string[];
  redirectLoopDetected: boolean;
  blankScreenDetected: boolean;
  uiSignals: {
    hiddenPrimaryActions: string[];
    offscreenInteractive: string[];
    clippedTextNodes: number;
    overlapPairs: number;
  };
}

export interface RunArtifacts {
  findings: Finding[];
  telemetry: RouteTelemetry[];
  networkProbeResults?: NetworkProbeScenarioResult[];
}
