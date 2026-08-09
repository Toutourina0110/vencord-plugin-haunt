/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * How a lookup reaches haunt.gg.
 *
 * haunt.gg sends no `Access-Control-Allow-Origin`, so a page on discord.com is never
 * allowed to read its answers. The request therefore has to be made somewhere that is
 * not the page:
 *
 * `userscript`  — Vencord/Equicord installed as a userscript. The web build injects
 *                 `browser/GMPolyfill.js`, which replaces the global `fetch` with one
 *                 backed by `GM_xmlhttpRequest`. That runs in the userscript manager,
 *                 outside the page, so cross-origin requests go through untouched.
 * `proxy`       — browser extension. Its host permissions cover discord.com only and
 *                 the plugin runs in the page itself, so lookups have to be relayed by
 *                 a proxy the user hosts. See `web/haunt-proxy.worker.js`.
 * `unavailable` — extension with no proxy configured. Nothing can be looked up.
 */
export type TransportKind = "userscript" | "proxy" | "unavailable";

/** Placeholder for the "generic CORS proxy" URL shape, see {@link proxiedUrl}. */
export const URL_PLACEHOLDER = "{url}";

export function transportKind(proxyUrl: string): TransportKind {
    if (IS_USERSCRIPT) return "userscript";

    return proxyUrl.trim() ? "proxy" : "unavailable";
}

/**
 * Builds the URL to actually request, given the haunt.gg URL we would have used.
 *
 * Two proxy shapes are supported:
 *
 * - **Dedicated** (`https://haunt-proxy.you.workers.dev`) — the query string is appended
 *   as-is, so the proxy receives exactly what haunt.gg would have. This is what the
 *   worker in `web/haunt-proxy.worker.js` implements, and the only shape that can
 *   hold the API key for you.
 * - **Generic** (`https://cors.example.dev/?url={url}`) — anything containing
 *   `{url}` gets the full, encoded haunt.gg URL substituted in. Works with off-the-shelf
 *   CORS proxies, but most of those drop custom request headers, which means the
 *   `X-API-Key` header never arrives and every lookup comes back unauthorized.
 */
export function proxiedUrl(targetUrl: string, proxyUrl: string): string {
    const base = proxyUrl.trim();

    if (base.includes(URL_PLACEHOLDER))
        return base.replace(URL_PLACEHOLDER, encodeURIComponent(targetUrl));

    const query = targetUrl.slice(targetUrl.indexOf("?"));
    return base.replace(/\/+$/, "") + query;
}
