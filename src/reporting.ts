import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Finding, RouteTelemetry, RunArtifacts } from "./types.js";

function findingSection(finding: Finding): string {
  const lines = [
    `### ${finding.title} [${finding.severity.toUpperCase()}]`,
    `- Category: ${finding.category}`,
    `- Route: ${finding.route}`,
    `- Owner: ${finding.owner}`,
    `- Repro:`,
    ...finding.reproSteps.map((s) => `  - ${s}`)
  ];

  if (finding.suspectedCause) {
    lines.push(`- Suspected cause: ${finding.suspectedCause}`);
  }
  if (finding.evidence.screenshotPath) {
    lines.push(`- Screenshot: ${finding.evidence.screenshotPath}`);
  }
  if (finding.evidence.consoleExcerpt?.length) {
    lines.push("- Console excerpt:");
    lines.push(...finding.evidence.consoleExcerpt.map((x) => `  - ${x}`));
  }
  if (finding.evidence.networkExcerpt?.length) {
    lines.push("- Network excerpt:");
    lines.push(...finding.evidence.networkExcerpt.map((x) => `  - ${x}`));
  }
  if (finding.evidence.details) {
    lines.push(`- Details: ${finding.evidence.details}`);
  }

  return `${lines.join("\n")}\n`;
}

function buildDashboardHtml(artifacts: RunArtifacts): string {
  const serialized = JSON.stringify(artifacts).replaceAll("</script>", "<\\/script>");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bug Hunter Dashboard</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: Inter, Arial, sans-serif; margin: 0; background: #111827; color: #e5e7eb; }
    .container { max-width: 1240px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { margin: 0 0 12px 0; }
    .muted { color: #93a3b8; }
    .cards { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin: 16px 0; }
    .card { background: #1f2937; border: 1px solid #334155; border-radius: 10px; padding: 12px; }
    .controls { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); margin: 20px 0; }
    select, input { width: 100%; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: #e2e8f0; padding: 8px 10px; }
    .layout { display: grid; gap: 16px; grid-template-columns: 1.2fr 1fr; }
    @media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }
    .list { display: grid; gap: 10px; }
    .item { background: #1f2937; border: 1px solid #334155; border-radius: 10px; padding: 12px; cursor: pointer; }
    .item.active { border-color: #60a5fa; box-shadow: 0 0 0 1px #60a5fa inset; }
    .badge { display: inline-block; border-radius: 999px; padding: 2px 8px; font-size: 12px; font-weight: 700; }
    .critical { background: #7f1d1d; color: #fecaca; }
    .high { background: #7c2d12; color: #fed7aa; }
    .medium { background: #78350f; color: #fde68a; }
    .low { background: #14532d; color: #bbf7d0; }
    .panel { background: #111827; border: 1px solid #334155; border-radius: 10px; padding: 14px; }
    .kv { margin: 6px 0; }
    img { max-width: 100%; border-radius: 8px; border: 1px solid #334155; }
    ul { margin: 6px 0 0 18px; padding: 0; }
    .table { overflow: auto; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border-bottom: 1px solid #334155; text-align: left; padding: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bug Hunter Dashboard</h1>
    <p class="muted">Interactive findings triage for the latest scan run.</p>
    <div class="cards" id="summaryCards"></div>

    <div class="controls">
      <div><label for="severity">Severity</label><select id="severity"></select></div>
      <div><label for="category">Category</label><select id="category"></select></div>
      <div><label for="route">Route</label><select id="route"></select></div>
      <div><label for="search">Search</label><input id="search" placeholder="Title, cause, evidence..." /></div>
    </div>

    <div class="layout">
      <div class="panel">
        <h2>Findings</h2>
        <div id="findingsList" class="list"></div>
      </div>
      <div class="panel">
        <h2>Details</h2>
        <div id="details">Select a finding to inspect evidence.</div>
      </div>
    </div>

    <div class="panel table">
      <h3>Route Telemetry</h3>
      <table>
        <thead>
          <tr><th>Route</th><th>Viewport</th><th>Duration (ms)</th><th>Console Errors</th><th>Network Fails</th></tr>
        </thead>
        <tbody id="telemetryRows"></tbody>
      </table>
    </div>
  </div>
  <script>
    const artifacts = ${serialized};
    const findings = artifacts.findings || [];
    const telemetry = artifacts.telemetry || [];

    const state = { severity: "all", category: "all", route: "all", query: "", selectedId: "" };
    const severityEl = document.getElementById("severity");
    const categoryEl = document.getElementById("category");
    const routeEl = document.getElementById("route");
    const searchEl = document.getElementById("search");
    const listEl = document.getElementById("findingsList");
    const detailsEl = document.getElementById("details");
    const summaryEl = document.getElementById("summaryCards");
    const telemetryRowsEl = document.getElementById("telemetryRows");

    function unique(values) { return [...new Set(values)].filter(Boolean).sort(); }
    function optionMarkup(value, label) { return '<option value="' + value + '">' + label + '</option>'; }

    function setupFilters() {
      severityEl.innerHTML = optionMarkup("all", "All severities") + unique(findings.map(f => f.severity)).map(v => optionMarkup(v, v)).join("");
      categoryEl.innerHTML = optionMarkup("all", "All categories") + unique(findings.map(f => f.category)).map(v => optionMarkup(v, v)).join("");
      routeEl.innerHTML = optionMarkup("all", "All routes") + unique(findings.map(f => f.route)).map(v => optionMarkup(v, v)).join("");
    }

    function summaryCards() {
      const counts = findings.reduce((acc, f) => { acc[f.severity] = (acc[f.severity] || 0) + 1; return acc; }, {});
      const categories = findings.reduce((acc, f) => { acc[f.category] = (acc[f.category] || 0) + 1; return acc; }, {});
      summaryEl.innerHTML = [
        ['Total findings', findings.length],
        ['Critical', counts.critical || 0],
        ['High', counts.high || 0],
        ['Medium', counts.medium || 0],
        ['Low', counts.low || 0],
        ['Categories hit', Object.keys(categories).length]
      ].map(([k,v]) => '<div class="card"><div class="muted">' + k + '</div><div style="font-size:24px;font-weight:700;margin-top:4px;">' + v + '</div></div>').join("");
    }

    function filtered() {
      return findings.filter((f) => {
        if (state.severity !== "all" && f.severity !== state.severity) return false;
        if (state.category !== "all" && f.category !== state.category) return false;
        if (state.route !== "all" && f.route !== state.route) return false;
        if (!state.query) return true;
        const haystack = [f.title, f.suspectedCause || "", f.route, JSON.stringify(f.evidence || {})].join(" ").toLowerCase();
        return haystack.includes(state.query);
      });
    }

    function renderList() {
      const rows = filtered();
      if (!rows.length) {
        listEl.innerHTML = '<div class="muted">No findings match current filters.</div>';
        detailsEl.innerHTML = "Select a finding to inspect evidence.";
        return;
      }
      if (!state.selectedId || !rows.some(r => r.id === state.selectedId)) {
        state.selectedId = rows[0].id;
      }
      listEl.innerHTML = rows.map((f) => {
        const active = f.id === state.selectedId ? "item active" : "item";
        return '<div class="' + active + '" data-id="' + f.id + '"><div><span class="badge ' + f.severity + '">' + f.severity.toUpperCase() + '</span> <strong>' + f.title + '</strong></div><div class="muted" style="margin-top:6px;">' + f.category + " | " + f.route + " | " + f.owner + '</div></div>';
      }).join("");

      listEl.querySelectorAll(".item").forEach((el) => {
        el.addEventListener("click", () => {
          state.selectedId = el.getAttribute("data-id");
          renderList();
          renderDetails();
        });
      });
      renderDetails();
    }

    function renderDetails() {
      const finding = filtered().find((f) => f.id === state.selectedId);
      if (!finding) {
        detailsEl.innerHTML = "Select a finding to inspect evidence.";
        return;
      }
      const repro = (finding.reproSteps || []).map((x) => "<li>" + x + "</li>").join("");
      const consoleLines = (finding.evidence?.consoleExcerpt || []).map((x) => "<li>" + x + "</li>").join("");
      const networkLines = (finding.evidence?.networkExcerpt || []).map((x) => "<li>" + x + "</li>").join("");
      const screenshot = finding.evidence?.screenshotPath ? '<div class="kv"><div class="muted">Screenshot</div><img src="' + finding.evidence.screenshotPath + '" alt="screenshot evidence"/></div>' : "";
      detailsEl.innerHTML = [
        "<div><span class='badge " + finding.severity + "'>" + finding.severity.toUpperCase() + "</span></div>",
        "<div class='kv'><strong>" + finding.title + "</strong></div>",
        "<div class='kv'>Category: " + finding.category + "</div>",
        "<div class='kv'>Route: " + finding.route + "</div>",
        "<div class='kv'>Owner: " + finding.owner + "</div>",
        "<div class='kv'>Repro steps<ul>" + repro + "</ul></div>",
        finding.suspectedCause ? "<div class='kv'>Suspected cause: " + finding.suspectedCause + "</div>" : "",
        finding.evidence?.details ? "<div class='kv'>Details: " + finding.evidence.details + "</div>" : "",
        consoleLines ? "<div class='kv'>Console excerpt<ul>" + consoleLines + "</ul></div>" : "",
        networkLines ? "<div class='kv'>Network excerpt<ul>" + networkLines + "</ul></div>" : "",
        screenshot
      ].join("");
    }

    function renderTelemetry() {
      telemetryRowsEl.innerHTML = telemetry.map((t) => {
        const networkCount = (t.networkFailures || []).length + (t.httpFailures || []).length;
        return "<tr><td>" + t.route + "</td><td>" + t.viewport + "</td><td>" + t.durationMs + "</td><td>" + (t.consoleErrors || []).length + "</td><td>" + networkCount + "</td></tr>";
      }).join("");
    }

    severityEl.addEventListener("change", () => { state.severity = severityEl.value; renderList(); });
    categoryEl.addEventListener("change", () => { state.category = categoryEl.value; renderList(); });
    routeEl.addEventListener("change", () => { state.route = routeEl.value; renderList(); });
    searchEl.addEventListener("input", () => { state.query = searchEl.value.toLowerCase().trim(); renderList(); });

    setupFilters();
    summaryCards();
    renderList();
    renderTelemetry();
  </script>
</body>
</html>`;
}

export async function writeRunArtifacts(
  outputDir: string,
  findings: Finding[],
  telemetry: RouteTelemetry[]
): Promise<void> {
  await mkdir(outputDir, { recursive: true });

  const artifacts: RunArtifacts = { findings, telemetry };
  await writeFile(
    path.join(outputDir, "run.json"),
    JSON.stringify(artifacts, null, 2),
    "utf-8"
  );

  const markdown = [
    "# Bug Hunter Report",
    "",
    `Total findings: ${findings.length}`,
    "",
    "## Findings",
    "",
    ...(findings.length
      ? findings.map((finding) => findingSection(finding))
      : ["No findings in this run.\n"]),
    "## Route timings",
    "",
    ...telemetry.map(
      (t) =>
        `- ${t.route} (${t.viewport}): ${t.durationMs}ms | console=${t.consoleErrors.length} | network=${t.networkFailures.length + t.httpFailures.length}`
    )
  ].join("\n");

  await writeFile(path.join(outputDir, "report.md"), markdown, "utf-8");
  const dashboardHtml = buildDashboardHtml(artifacts);
  await writeFile(path.join(outputDir, "dashboard.html"), dashboardHtml, "utf-8");
}
