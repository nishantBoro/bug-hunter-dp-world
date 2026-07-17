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
}
