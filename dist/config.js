import { readFile } from "node:fs/promises";
import path from "node:path";
export async function loadConfig(configPath) {
    const absolutePath = path.resolve(configPath);
    const raw = await readFile(absolutePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.baseUrl) {
        throw new Error("Missing required config field: baseUrl");
    }
    if (!parsed.outputDir) {
        throw new Error("Missing required config field: outputDir");
    }
    return {
        baseUrl: parsed.baseUrl,
        outputDir: parsed.outputDir,
        viewports: parsed.viewports ?? [{ name: "desktop", width: 1440, height: 900 }],
        routes: parsed.routes ?? ["/"],
        routeParams: parsed.routeParams ?? {},
        journeys: parsed.journeys ?? [],
        performanceThresholdPercent: parsed.performanceThresholdPercent ?? 20,
        performanceBaselinesMs: parsed.performanceBaselinesMs ?? {}
    };
}
