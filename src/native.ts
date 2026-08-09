/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CspPolicies, ImageSrc } from "@main/csp";
import { IpcMainInvokeEvent } from "electron";

const API_URL = "https://haunt.gg/api/lookup/user";

CspPolicies["assets.haunt.gg"] = ImageSrc;
CspPolicies["r2.haunt.gg"] = ImageSrc;

export async function lookupUser(_: IpcMainInvokeEvent, apiKey: string, discordId: string) {
    const url = `${API_URL}?type=discord&value=${encodeURIComponent(discordId)}&badges=true&views=true&feedback=true`;

    try {
        const res = await fetch(url, {
            headers: {
                "X-API-Key": apiKey,
                Accept: "application/json"
            }
        });

        return {
            status: res.status,
            retryAfter: res.headers.get("retry-after"),
            data: await res.text()
        };
    } catch (e) {
        return { status: -1, retryAfter: null, data: String(e) };
    }
}
