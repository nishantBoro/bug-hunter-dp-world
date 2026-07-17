import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface CliOptions {
  app?: string;
  environment?: string;
  configPath?: string;
  username?: string;
  password?: string;
  discoverRoutes: boolean;
  headless?: boolean;
}

export interface AppRegistryEntry {
  configPath: string;
  usernameEnv?: string;
  passwordEnv?: string;
  description?: string;
}

export interface ResolvedRunTarget {
  app?: string;
  environment?: string;
  configPath: string;
  cli: CliOptions;
}

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

function readFlag(argv: string[], name: string): string | undefined {
  const idx = argv.findIndex((arg) => arg === name || arg.startsWith(`${name}=`));
  if (idx === -1) {
    return undefined;
  }

  const direct = argv[idx];
  if (direct.includes("=")) {
    return direct.split("=").slice(1).join("=");
  }

  return argv[idx + 1];
}

function hasFlag(argv: string[], name: string): boolean {
  return argv.includes(name);
}

async function loadAppRegistry(): Promise<Record<string, AppRegistryEntry>> {
  const registryPath = path.join(PROJECT_ROOT, "configs/applications.json");
  const raw = await readFile(registryPath, "utf-8");
  return JSON.parse(raw) as Record<string, AppRegistryEntry>;
}

function applyCredentials(
  registryEntry: AppRegistryEntry | undefined,
  cli: CliOptions
): void {
  const usernameEnv =
    registryEntry?.usernameEnv ?? process.env.BUG_HUNTER_USERNAME_ENV ?? "BUG_HUNTER_USERNAME";
  const passwordEnv =
    registryEntry?.passwordEnv ?? process.env.BUG_HUNTER_PASSWORD_ENV ?? "BUG_HUNTER_PASSWORD";

  if (cli.username) {
    process.env[usernameEnv] = cli.username;
  }
  if (cli.password) {
    process.env[passwordEnv] = cli.password;
  }
}

export function parseCliOptions(argv: string[] = process.argv): CliOptions {
  const discoverRoutes =
    hasFlag(argv, "--discover-routes") || hasFlag(argv, "-d");

  const headlessRaw = readFlag(argv, "--headless");
  const headless =
    headlessRaw === undefined ? undefined : headlessRaw !== "false" && headlessRaw !== "0";

  let environment =
    readFlag(argv, "--env") ??
    readFlag(argv, "--environment") ??
    readFlag(argv, "-e") ??
    process.env.BUG_HUNTER_ENV;

  let app =
    readFlag(argv, "--app") ??
    readFlag(argv, "-a") ??
    process.env.BUG_HUNTER_APP;

  const configPath = readFlag(argv, "--config");

  const positional = argv
    .slice(2)
    .filter((arg) => arg !== "hunt" && !arg.startsWith("-"));

  if (!app && positional[0] && !configPath) {
    app = positional[0];
  }

  if (!environment && positional[1] && /^(local|live|uat)$/i.test(positional[1])) {
    environment = positional[1].toLowerCase();
  }

  return {
    app,
    environment,
    configPath,
    username:
      readFlag(argv, "--username") ??
      readFlag(argv, "-u") ??
      process.env.BUG_HUNTER_USERNAME,
    password:
      readFlag(argv, "--password") ??
      readFlag(argv, "-p") ??
      process.env.BUG_HUNTER_PASSWORD,
    discoverRoutes,
    headless
  };
}

export async function resolveRunTarget(argv: string[] = process.argv): Promise<ResolvedRunTarget> {
  const cli = parseCliOptions(argv);
  const registry = await loadAppRegistry();

  if (cli.app && !registry[cli.app]) {
    const known = Object.keys(registry).sort().join(", ");
    throw new Error(
      `Unknown application "${cli.app}". Known apps: ${known}\n` +
        "Use --app <name> or add an entry to configs/applications.json."
    );
  }

  const registryEntry = cli.app ? registry[cli.app] : undefined;
  applyCredentials(registryEntry, cli);

  const configPath = cli.configPath
    ? path.resolve(cli.configPath)
    : path.resolve(PROJECT_ROOT, registryEntry!.configPath);

  return {
    app: cli.app,
    environment: cli.environment,
    configPath,
    cli
  };
}

export function printCliHelp(): void {
  console.log(`Bug Hunter — scan any registered application

Usage:
  npm run hunt -- --app <name> --env <local|live> --username <user> --password <pass>
  npm run hunt -- cds-declaration live -u <user> -p <pass>
  npm run scan -- --config configs/cds-declaration.json   (legacy)

Options:
  --app, -a              Application name (see configs/applications.json)
  --env, -e              Environment: local | live | uat (default: local or config default)
  --username, -u         Login username (also sets app-specific env var)
  --password, -p         Login password (also sets app-specific env var)
  --discover-routes, -d  After login, crawl dashboard links and add hash routes
  --headless false       Show the browser window while scanning
  --config               Path to a JSON config file (bypasses --app)

Environment variables:
  BUG_HUNTER_APP, BUG_HUNTER_ENV, BUG_HUNTER_USERNAME, BUG_HUNTER_PASSWORD
  BUG_HUNTER_USERNAME, BUG_HUNTER_PASSWORD (all apps)

Examples:
  npm run hunt -- --app cds-declaration --env local -u transitadmin -p 'secret'
  npm run hunt -- --app cds-declaration --env live -u transitadmin -p 'secret' -d
  npm run hunt -- --app shipment --env local
`);
}
