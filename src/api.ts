/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Logger } from "@utils/Logger";

import { proxiedUrl, TransportKind, transportKind } from "./transport";
import { HauntLookupResponse, HauntProfile } from "./types";

export const logger = new Logger("Haunt");

const API_URL = "https://haunt.gg/api/lookup/user";

/** No transport is available at all — extension with no proxy configured. */
const STATUS_NO_TRANSPORT = -2;
/** The request threw — usually a CORS refusal, or a proxy that is not answering. */
const STATUS_NETWORK_ERROR = -1;

export interface Credentials {
    apiKey: string;
    proxyUrl: string;
}

export type LookupResult =
    | { kind: "ok"; profile: HauntProfile; }
    | { kind: "none"; reason: "missing" | "private"; }
    | { kind: "unauthorized"; message: string; }
    | { kind: "ratelimited"; retryAfterMs: number; }
    | { kind: "unsupported"; message: string; }
    | { kind: "error"; message: string; };

interface RawResponse {
    status: number;
    retryAfter: string | null;
    data: string;
}

export const lookupUrl = (discordId: string) =>
    `${API_URL}?type=discord&value=${encodeURIComponent(discordId)}&badges=true&views=true&feedback=true`;

/**
 * A dedicated proxy can hold the API key itself, so an empty key is not necessarily
 * a reason to skip the lookup.
 */
export function hasCredentials({ apiKey, proxyUrl }: Credentials) {
    return !!apiKey.trim() || transportKind(proxyUrl) === "proxy";
}

async function request(creds: Credentials, discordId: string, kind: TransportKind): Promise<RawResponse> {
    if (kind === "unavailable") return { status: STATUS_NO_TRANSPORT, retryAfter: null, data: "" };

    const target = lookupUrl(discordId);
    return webRequest(kind === "proxy" ? proxiedUrl(target, creds.proxyUrl) : target, creds.apiKey.trim());
}

async function webRequest(url: string, apiKey: string): Promise<RawResponse> {
    // On the userscript build this `fetch` is GM_fetch, injected by Vencord's web
    // build — same signature, but it is not subject to CORS.
    try {
        const res = await fetch(url, {
            headers: {
                Accept: "application/json",
                ...apiKey ? { "X-API-Key": apiKey } : {}
            }
        });

        return { status: res.status, retryAfter: res.headers.get("retry-after"), data: await res.text() };
    } catch (e) {
        return { status: STATUS_NETWORK_ERROR, retryAfter: null, data: String(e) };
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

function networkErrorMessage(kind: TransportKind, detail: string) {
    if (kind === "proxy")
        return `Could not reach the lookup proxy — check the URL in the settings (${detail})`;

    return detail;
}

export async function lookupByDiscordId(creds: Credentials, discordId: string): Promise<LookupResult> {
    const kind = transportKind(creds.proxyUrl);
    const { status, retryAfter, data } = await request(creds, discordId, kind);
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

        case STATUS_NO_TRANSPORT:
            return {
                kind: "unsupported",
                message: "haunt.gg cannot be reached from the extension directly. Set a lookup proxy in the plugin settings."
            };

        case STATUS_NETWORK_ERROR:
            return { kind: "error", message: networkErrorMessage(kind, data) };

        default:
            return { kind: "error", message: body?.error ?? `Request failed with status ${status}` };
    }
}
