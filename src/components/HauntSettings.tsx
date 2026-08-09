/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button } from "@components/Button";
import { Flex } from "@components/Flex";
import { Span } from "@components/Span";
import { showToast, Toasts, UserStore, useState } from "@webpack/common";

import { settings } from "..";
import { hasCredentials, logger, lookupByDiscordId } from "../api";
import { clearCache } from "../cache";
import { TransportKind, transportKind } from "../transport";
import { cl } from "../utils";

function hostOf(url: string) {
    try {
        return new URL(url.trim()).host;
    } catch {
        return url.trim();
    }
}

function TransportStatus({ kind, proxyUrl }: { kind: TransportKind; proxyUrl: string; }) {
    switch (kind) {
        case "native":
            return (
                <Span size="sm">
                    Lookups run in Discord's main process, so haunt.gg is reachable directly.
                    Badge artwork only loads after a full restart of Discord, since the image
                    host is whitelisted when the app starts.
                </Span>
            );

        case "userscript":
            return (
                <Span size="sm">
                    Userscript build detected — lookups go through your userscript manager, so no
                    proxy is needed. Badge artwork that Discord's CSP blocks is loaded inline instead.
                </Span>
            );

        case "proxy":
            return (
                <Span size="sm">
                    Lookups are relayed through <code>{hostOf(proxyUrl)}</code>. If that proxy holds
                    your API key itself, you can leave the key field empty.
                </Span>
            );

        case "unavailable":
            return (
                <Span className={cl("settings-warning")} size="sm">
                    haunt.gg does not allow requests from <code>discord.com</code>, so nothing can be
                    looked up from the browser on its own. Fill in the <strong>Lookup proxy URL</strong> above —
                    the README walks through deploying the bundled Cloudflare Worker, which takes a
                    couple of minutes and keeps your API key on your own infrastructure.
                </Span>
            );
    }
}

export function HauntSettings() {
    const { apiKey, corsProxyUrl } = settings.use(["apiKey", "corsProxyUrl"]);
    const [testing, setTesting] = useState(false);

    const creds = { apiKey, proxyUrl: corsProxyUrl };
    const kind = transportKind(corsProxyUrl);

    async function testKey() {
        const discordId = UserStore.getCurrentUser()?.id;
        if (!discordId) return;

        setTesting(true);
        try {
            const result = await lookupByDiscordId(creds, discordId);

            switch (result.kind) {
                case "ok":
                    showToast(`Key works — you are ${result.profile.user.username} (#${result.profile.user.uid})`, Toasts.Type.SUCCESS);
                    break;
                case "none":
                    showToast(
                        result.reason === "private"
                            ? "Key works, but your profile has public API access switched off"
                            : "Key works, but no haunt.gg account is linked to your Discord",
                        Toasts.Type.MESSAGE
                    );
                    break;
                case "unauthorized":
                    showToast(`Key rejected: ${result.message}`, Toasts.Type.FAILURE);
                    break;
                case "ratelimited":
                    showToast("Rate limited — try again in a minute", Toasts.Type.FAILURE);
                    break;
                case "unsupported":
                    showToast(result.message, Toasts.Type.FAILURE);
                    break;
                case "error":
                    showToast(`Lookup failed: ${result.message}`, Toasts.Type.FAILURE);
                    break;
            }

            if (result.kind !== "error" && result.kind !== "unsupported") clearCache();
        } catch (e) {
            logger.error("Key test failed", e);
            showToast("Lookup failed — see the console", Toasts.Type.FAILURE);
        } finally {
            setTesting(false);
        }
    }

    return (
        <div className={cl("settings")}>
            <Span size="sm">
                Get a key with the <code>lookup:user</code> permission from your haunt.gg dashboard.
            </Span>

            <TransportStatus kind={kind} proxyUrl={corsProxyUrl} />

            <Flex style={{ gap: "0.5em" }}>
                <Button size="small" disabled={!hasCredentials(creds) || testing} onClick={testKey}>
                    {testing ? "Testing…" : "Test key"}
                </Button>
                <Button
                    size="small"
                    variant="secondary"
                    onClick={() => {
                        clearCache();
                        showToast("Cleared the Haunt cache", Toasts.Type.SUCCESS);
                    }}
                >
                    Clear cache
                </Button>
            </Flex>
        </div>
    );
}
