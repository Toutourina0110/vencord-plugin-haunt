/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Lookup proxy for the Haunt plugin, for Vencord/Equicord in the browser.
 *
 * haunt.gg sends no `Access-Control-Allow-Origin`, so a page on discord.com is not
 * allowed to read its responses. This worker sits in between: it forwards the lookup
 * and answers with the CORS headers the browser wants to see.
 *
 * It is deliberately narrow — it only ever talks to the one haunt.gg lookup endpoint,
 * so it cannot be abused as an open relay.
 *
 * Deploy (about two minutes, free tier is plenty):
 *
 *   npm install -g wrangler
 *   wrangler login
 *   wrangler deploy haunt-proxy.worker.js --name haunt-proxy --compatibility-date 2025-01-01
 *
 * Then, so your API key never leaves your own infrastructure:
 *
 *   wrangler secret put HAUNT_API_KEY --name haunt-proxy
 *
 * Paste the deployed URL into the plugin's "Lookup proxy URL" setting. If you set the
 * secret you can leave the plugin's API key field empty; otherwise the plugin sends the
 * key along in the `X-API-Key` header and the worker passes it on.
 *
 * Optional: set ALLOWED_ORIGINS (comma separated) to restrict who may call the worker,
 * e.g. `https://discord.com,https://canary.discord.com`. Unset means any origin.
 */

const UPSTREAM = "https://haunt.gg/api/lookup/user";

// Only what the plugin actually sends. Anything else is dropped.
const ALLOWED_PARAMS = ["type", "value", "badges", "views", "feedback"];

export default {
    async fetch(request, env) {
        const origin = request.headers.get("Origin");
        const cors = corsHeaders(origin, env);

        if (!cors) return new Response("Origin not allowed", { status: 403 });
        if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
        if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, cors);

        const apiKey = env.HAUNT_API_KEY || request.headers.get("X-API-Key");
        if (!apiKey) return json({ error: "No API key: set the HAUNT_API_KEY secret or send X-API-Key" }, 401, cors);

        const incoming = new URL(request.url);
        const upstream = new URL(UPSTREAM);
        for (const name of ALLOWED_PARAMS) {
            const value = incoming.searchParams.get(name);
            if (value !== null) upstream.searchParams.set(name, value);
        }

        if (!upstream.searchParams.get("value")) return json({ error: "Missing value parameter" }, 400, cors);

        let res;
        try {
            res = await fetch(upstream, {
                headers: {
                    "X-API-Key": apiKey,
                    Accept: "application/json"
                }
            });
        } catch (e) {
            return json({ error: `Upstream request failed: ${e}` }, 502, cors);
        }

        const headers = new Headers(cors);
        headers.set("Content-Type", res.headers.get("Content-Type") || "application/json");

        // The plugin backs off on 429 using this, so it has to survive the hop.
        const retryAfter = res.headers.get("Retry-After");
        if (retryAfter) headers.set("Retry-After", retryAfter);

        return new Response(res.body, { status: res.status, headers });
    }
};

function corsHeaders(origin, env) {
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean);

    if (allowed.length && (!origin || !allowed.includes(origin))) return null;

    return {
        "Access-Control-Allow-Origin": allowed.length ? origin : "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "X-API-Key, Accept",
        "Access-Control-Expose-Headers": "Retry-After",
        "Access-Control-Max-Age": "86400",
        ...allowed.length ? { Vary: "Origin" } : {}
    };
}

function json(body, status, cors) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...cors, "Content-Type": "application/json" }
    });
}
