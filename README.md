# Bug Hunter Agent

Bug Hunter is a local browser-driven scanner for web SPAs that flags:

- runtime failures (console/page errors)
- network/API issues (request failures and HTTP 4xx/5xx)
- functional flow breaks (blank pages, redirect loops, scripted journey failures)
- UI regressions (hidden/offscreen controls, clipped text, overlap signals)
- performance regressions (route timing over baseline thresholds)
- network error observability (mocked 401/404/500/timeout API failures)

## Quick start

Requires **Node.js 18+** (Playwright and `tsx` do not support older versions). If you use nvm, run `nvm use` in this directory.

1. Install dependencies:
   - `npm install`
2. Run seeded pilot scenario:
   - `npm run pilot`
3. **Hunt any registered app** (recommended for teams):

```bash
# Local CDS
npm run hunt -- --app cds-declaration --env local -u YOUR_USER -p 'YOUR_PASSWORD'

# Live CDS (eudev)
npm run hunt -- --app cds-declaration --env live -u YOUR_USER -p 'YOUR_PASSWORD'

# Shorter form
npm run hunt -- cds-declaration live -u YOUR_USER -p 'YOUR_PASSWORD'

# Crawl dashboard links + configured routes
npm run hunt -- --app cds-declaration --env live -u USER -p 'PASS' --discover-routes
```

Registered apps are listed in `configs/applications.json`. Each app config can define `environments.local` and `environments.live` with different `baseUrl`, output folder, and auth session file.

4. Legacy / custom config:
   - `npm run scan -- --config configs/shipment.json`
   - `npm run scan:shipment`
   - `npm run scan:cds-declaration` (preset for local CDS)


## Scan a live local app (example: CDS declaration)

1. Start your app locally (e.g. `http://localhost:4222/cds-ui/`).
2. Edit `configs/cds-declaration.json` if needed (`location`, routes, API patterns).
3. Run:

```bash
npm run scan:cds-declaration
```

4. Open results:
   - `artifacts/cds-declaration/dashboard.html` — interactive UI
   - `artifacts/cds-declaration/report.md` — triage report
   - `artifacts/cds-declaration/run.json` — raw telemetry

**Failed APIs** appear under findings with category `network`. Each entry lists the HTTP status and URL, for example `401 POST https://.../api/...` or `GET ... net::ERR_TIMED_OUT`.

For hash-based SPA routes use `/#/your-route?query=value` in `routes`, or put the full URL in `baseUrl` and set `"routes": ["/"]`.

If the app requires login, add a `journeys` block that signs in before scanning, or scan from an authenticated browser profile (future enhancement).

## Login with credentials (CDS / Keycloak)

If the scan redirects to a login page, enable `auth` in your config and pass credentials via environment variables (never commit passwords):

```bash
export BUG_HUNTER_USERNAME="your.email@company.com"
export BUG_HUNTER_PASSWORD="your-password"
npm run hunt -- --app cds-declaration --env local
```

Config (`configs/cds-declaration.json`):

```json
"auth": {
  "enabled": true,
  "usernameEnv": "BUG_HUNTER_USERNAME",
  "passwordEnv": "BUG_HUNTER_PASSWORD",
  "selectors": {
    "username": "#username",
    "password": "#password",
    "submit": "#kc-login"
  },
  "postLoginUrlPattern": "**/cds-ui/**",
  "saveStorageStateAfterLogin": true
}
```

After a successful login, the session is saved under `auth/` (per app/environment, gitignored) so later runs can skip login until the token expires.

If login selectors differ on your Keycloak theme, update `selectors` (inspect the login page in DevTools).

**One command (login + scan):**

```bash
npm run hunt -- --app cds-declaration --env local -u USER -p 'PASS'
```

**Auth only** (save session without scanning):

```bash
npm run setup:auth -- --app cds-declaration --env local -u USER -p 'PASS'
```

URLs and ports come from `configs/cds-declaration.json` → `environments` — nothing hardcoded in `package.json`.

### Location popup after login (CDS)

Some apps show a location picker after sign-in. Configure `auth.locationSelection`:

```json
"locationSelection": {
  "enabled": true,
  "waitForSelector": "text=Select Location",
  "selectSelector": "mat-select",
  "optionSelector": "mat-option",
  "optionTextFromRouteParam": "locationLabel",
  "confirmSelector": "button:has-text(\"Confirm\")"
}
```

Set `routeParams.locationLabel` to the exact dropdown text (e.g. `"GB Border Locations"`).


Bug Hunter logs in automatically via Playwright when `auth.enabled` is true. You only need a Chrome profile export for edge cases.

### Option A — Automatic login (recommended)

```bash
npm run hunt -- --app cds-declaration --env local -u USER -p 'PASS'
```

Or save session first:

```bash
npm run setup:auth -- --app cds-declaration --env live -u USER -p 'PASS'
```

Re-run when tokens expire (401s in the report).

### Option B — Export from an existing Chrome profile (advanced)

If you already browse logged-in with a special Chrome profile:

```bash
npm run export-auth -- "<url-from-app-config>" ./auth/my-session.json /path/to/chrome-profile
```

Close that Chrome profile before exporting.

```json
"browser": {
  "userDataDir": "/tmp/temporary-chrome-profile-dir"
}
```

Remove `storageStatePath` when using this option.

If you have a static API token for testing:

```json
"browser": {
  "extraHTTPHeaders": {
    "Authorization": "Bearer YOUR_TOKEN_HERE"
  }
}
```

## Sharing reports with the team

After each scan, share these files from `artifacts/cds-declaration/`:

- `report.md` — human-readable summary with failed API URLs and status codes (401, 422, 500, 502, etc.)
- `dashboard.html` — filter findings by **network** category
- `run.json` — full telemetry for automation
- `screenshots/` — page evidence at scan time

`networkIgnorePatterns` in the config filters out analytics/font CDN noise so the report focuses on your APIs.

## Output artifacts

By default, run artifacts are written under `artifacts/latest`:

- `run.json`: structured telemetry and findings
- `report.md`: triage-focused report
- `dashboard.html`: interactive findings UI with filters and evidence preview
- `screenshots/`: per-route evidence images

Each finding includes severity, category, repro steps, route, owner hint, and evidence snippets.

## Network error probes

Bug Hunter can actively mock API failures and verify:

1. the scanner captures the failure in network telemetry
2. the application logs the failure (console error/warning heuristics)

Enable probes in your config:

```json
{
  "networkProbes": {
    "enabled": true,
    "scenarios": ["401", "404", "500", "timeout"],
    "probes": [
      {
        "name": "my-api",
        "urlPattern": "**/api/orders/**",
        "expectAppLogging": true,
        "logPatterns": ["401", "404", "500", "timeout", "network", "fetch"],
        "trigger": {
          "type": "goto",
          "route": "/orders"
        }
      }
    ]
  }
}
```

Trigger types:

- `goto`: navigate to a route (use when page load triggers API calls)
- `click`: click a selector (optionally after `goto`)
- `fetch`: call an endpoint directly from the page context

Probe results are written to `run.json` (`networkProbeResults`) and shown in `dashboard.html`.
