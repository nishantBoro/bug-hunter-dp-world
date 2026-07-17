import { NavigationWaitUntil } from "../types.js";

/** networkidle hangs on SPAs with polling/websockets — map it to load. */
export function safeNavigationWaitUntil(
  waitUntil: NavigationWaitUntil
): "load" | "domcontentloaded" | "commit" {
  if (waitUntil === "networkidle") {
    return "load";
  }
  return waitUntil;
}
