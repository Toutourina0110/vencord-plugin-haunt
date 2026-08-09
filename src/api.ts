/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Logger } from "@utils/Logger";
import { PluginNative } from "@utils/types";

import { HauntLookupResponse, HauntProfile } from "./types";

export const logger = new Logger("Haunt");

const Native = VencordNative.pluginHelpers.Haunt as PluginNative<typeof import("./native")>;

const API_URL = "https://haunt.gg/api/lookup/user";

export type LookupResult =
    | { kind: "ok"; profile: HauntProfile; }
    | { kind: "none"; reason: "missing" | "private"; }
    | { kind: "unauthorized"; message: string; }
    | { kind: "ratelimited"; retryAfterMs: number; }
    | { kind: "error"; message: string; };

interface RawResponse {
    status: number;
    retryAfter: string | null;
    data: string;
}

async function request(apiKey: string, discordId: string): Promise<RawResponse> {
    if (!IS_WEB) return Native.lookupUser(apiKey, discordId);

    const url = `${API_URL}?type=discord&value=${encodeURIComponent(discordId)}&badges=true&views=true&feedback=true`;

    try {
        const res = await fetch(url, {
            headers: {
                "X-API-Key": apiKey,
                Accept: "application/json"
            }
        });

        return { status: res.status, retryAfter: res.headers.get("retry-after"), data: await res.text() };
    } catch (e) {
        return { status: -1, retryAfter: null, data: String(e) };
    }
}

function parse(data: string): HauntLookupResponse | null {
    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

function retryAfterMs(header: string | null) {
    const seconds = Number(header);
    return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 60_000;
}

export async function lookupByDiscordId(apiKey: string, discordId: string): Promise<LookupResult> {
    const { status, retryAfter, data } = await request(apiKey, discordId);
    const body = parse(data);

    switch (status) {
        case 200: {
            if (!body?.user) return { kind: "error", message: "Response contained no user" };

            return {
                kind: "ok",
                profile: {
                    user: body.user,
                    badges: body.badges ?? [],
                    views: body.views ?? null,
                    feedback: body.feedback ?? null
                }
            };
        }

        case 404:
            return { kind: "none", reason: body?.error?.includes("private") ? "private" : "missing" };

        case 401:
        case 403:
            return { kind: "unauthorized", message: body?.error ?? "API key was rejected" };

        case 429:
            return { kind: "ratelimited", retryAfterMs: retryAfterMs(retryAfter) };

        default:
            return { kind: "error", message: body?.error ?? `Request failed with status ${status}` };
    }
}
