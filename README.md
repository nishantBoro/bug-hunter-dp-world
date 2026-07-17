# Bug Hunter Agent

Bug Hunter is a local browser-driven scanner for web SPAs that flags:

- runtime failures (console/page errors)
- network/API issues (request failures and HTTP 4xx/5xx)
- functional flow breaks (blank pages, redirect loops, scripted journey failures)
- UI regressions (hidden/offscreen controls, clipped text, overlap signals)
- performance regressions (route timing over baseline thresholds)

## Quick start

Requires **Node.js 18+** (Playwright and `tsx` do not support older versions). If you use nvm, run `nvm use` in this directory.

1. Install dependencies:
   - `npm install`
2. Run seeded pilot scenario:
   - `npm run pilot`
3. Run scanner against your own app:
   - Add or edit a config under `configs/` (see `configs/shipment.json`)
   - `npm run scan -- --config configs/shipment.json`
   - Or use the preset: `npm run scan:shipment`

## Output artifacts

By default, run artifacts are written under `artifacts/latest`:

- `run.json`: structured telemetry and findings
- `report.md`: triage-focused report
- `dashboard.html`: interactive findings UI with filters and evidence preview
- `screenshots/`: per-route evidence images

Each finding includes severity, category, repro steps, route, owner hint, and evidence snippets.
