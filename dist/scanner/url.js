/**
 * URL + slug helpers shared by the route scanner and the journey runner so
 * navigation and screenshot naming stay perfectly consistent.
 */
/**
 * Resolves a route template against the base URL, substituting `:param`
 * tokens (e.g. `/view-declaration/:id`) with values from the params map.
 *
 * Unknown tokens are left intact and reported back via `unresolved` so a
 * misconfiguration is surfaced to the user instead of silently navigating to
 * a wrong/404 page.
 */
export function resolveRoute(baseUrl, route, params = {}) {
    const unresolved = [];
    const substituted = route.replace(/:([A-Za-z0-9_]+)/g, (match, name) => {
        const value = params[name];
        if (value === undefined) {
            unresolved.push(name);
            return match;
        }
        return encodeURIComponent(value);
    });
    return { url: new URL(substituted, baseUrl).toString(), unresolved };
}
/**
 * Deterministic, filesystem-safe slug for a route. Used both when writing
 * screenshots and when attaching their paths to findings, so the two never
 * drift apart.
 */
export function routeSlug(route) {
    const slug = route.replace(/[^A-Za-z0-9._-]+/g, "_");
    return slug || "_root";
}
