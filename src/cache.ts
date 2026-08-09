/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as DataStore from "@api/DataStore";
import { debounce } from "@shared/debounce";
import { sleep } from "@utils/misc";
import { Queue } from "@utils/Queue";
import { useEffect, useState } from "@webpack/common";

import { settings } from ".";
import { logger, lookupByDiscordId } from "./api";
import { HauntProfile } from "./types";

const STORE_KEY = "haunt-profile-cache";

interface CacheEntry {
    profile: HauntProfile | null;
    expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const inFlight = new Set<string>();
const listeners = new Map<string, Set<() => void>>();

const queue = new Queue();
let lastRequestAt = 0;
let pausedUntil = 0;
let keyRejected = false;

const ERROR_BACKOFF = 60_000;

let keyRejectedHandler: ((message: string) => void) | undefined;
export function setKeyRejectedHandler(handler: (message: string) => void) {
    keyRejectedHandler = handler;
}

let loading: Promise<void> | undefined;

export function loadPersistedCache() {
    return loading ??= readPersistedCache();
}

async function readPersistedCache() {
    if (!settings.store.persistCache) return;

    try {
        const stored = await DataStore.get<Record<string, CacheEntry>>(STORE_KEY);
        if (!stored) return;

        const now = Date.now();
        for (const [discordId, entry] of Object.entries(stored)) {
            if (entry.expiresAt > now && !cache.has(discordId)) cache.set(discordId, entry);
        }

        notifyAll();
    } catch (e) {
        logger.error("Failed to read the stored cache", e);
    }
}

const persist = debounce(async () => {
    if (!settings.store.persistCache) return;

    const now = Date.now();
    const alive = Object.fromEntries(
        [...cache].filter(([, entry]) => entry.expiresAt > now)
    );

    try {
        await DataStore.set(STORE_KEY, alive);
    } catch (e) {
        logger.error("Failed to write the cache", e);
    }
}, 2000);

export async function dropPersistedCache() {
    try {
        await DataStore.del(STORE_KEY);
    } catch (e) {
        logger.error("Failed to delete the stored cache", e);
    }
}

function notify(discordId: string) {
    listeners.get(discordId)?.forEach(listener => listener());
}

function notifyAll() {
    listeners.forEach(set => set.forEach(listener => listener()));
}

export const refreshAll = notifyAll;

function subscribe(discordId: string, listener: () => void) {
    let set = listeners.get(discordId);
    if (!set) listeners.set(discordId, set = new Set());
    set.add(listener);

    return () => {
        set!.delete(listener);
        if (!set!.size) listeners.delete(discordId);
    };
}

function store(discordId: string, profile: HauntProfile | null, ttl: number) {
    cache.set(discordId, { profile, expiresAt: Date.now() + ttl });
    persist();
    notify(discordId);
}

const isFresh = (discordId: string) => (cache.get(discordId)?.expiresAt ?? 0) > Date.now();

async function runLookup(discordId: string) {
    await loadPersistedCache();
    if (isFresh(discordId)) {
        notify(discordId);
        return;
    }

    const apiKey = settings.store.apiKey.trim();
    if (!apiKey || keyRejected) return;

    const wait = Math.max(pausedUntil - Date.now(), lastRequestAt + settings.store.requestDelayMs - Date.now());
    if (wait > 0) await sleep(wait);

    lastRequestAt = Date.now();
    const result = await lookupByDiscordId(apiKey, discordId);

    switch (result.kind) {
        case "ok":
            store(discordId, result.profile, settings.store.cacheTtlMinutes * 60_000);
            break;

        case "none":
            store(discordId, null, settings.store.negativeCacheHours * 60 * 60_000);
            break;

        case "unauthorized":
            keyRejected = true;
            logger.error(`Lookup rejected: ${result.message}`);
            keyRejectedHandler?.(result.message);
            break;

        case "ratelimited":
            pausedUntil = Date.now() + result.retryAfterMs;
            logger.warn(`Rate limited, pausing lookups for ${Math.round(result.retryAfterMs / 1000)}s`);
            break;

        case "error":
            logger.warn(`Lookup for ${discordId} failed: ${result.message}`);
            store(discordId, null, ERROR_BACKOFF);
            break;
    }
}

function scheduleLookup(discordId: string) {
    if (inFlight.has(discordId) || keyRejected) return;
    if (!settings.store.apiKey.trim()) return;

    inFlight.add(discordId);
    queue.push(() => runLookup(discordId).finally(() => inFlight.delete(discordId)));
}

function getHauntProfile(discordId: string, force = false): HauntProfile | null {
    const hit = cache.get(discordId);
    if (hit && hit.expiresAt > Date.now()) return hit.profile;

    if (force || settings.store.autoLookup) scheduleLookup(discordId);

    return hit?.profile ?? null;
}

export function useHauntProfile(discordId: string | undefined, force = false): HauntProfile | null {
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        if (!discordId) return;
        return subscribe(discordId, () => forceUpdate(n => n + 1));
    }, [discordId]);

    return discordId ? getHauntProfile(discordId, force) : null;
}

export function clearCache() {
    cache.clear();
    keyRejected = false;
    pausedUntil = 0;
    void DataStore.del(STORE_KEY).catch(e => logger.error("Failed to clear the stored cache", e));
    notifyAll();
}
