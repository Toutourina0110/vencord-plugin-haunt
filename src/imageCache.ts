/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { logger } from "./api";

/**
 * Badge artwork lives on assets.haunt.gg / r2.haunt.gg, which Discord's CSP does not
 * know about. The browser extension strips Discord's CSP header outright, so a plain
 * `<img src>` works there. The userscript cannot do that, so its images may be blocked.
 *
 * For that case we fetch the image ourselves — on the userscript the global `fetch` is
 * GM_fetch, which ignores CORS — and hand the `<img>` a `data:` URL instead. `data:` is
 * in Discord's `img-src` list, so it always renders.
 */

const inlined = new Map<string, string | null>();
const pending = new Map<string, Promise<string | null>>();

/** Whether inlining can help at all on this build. */
export const canInlineImages = () => IS_USERSCRIPT;

export function inlineImage(url: string): Promise<string | null> {
    if (!canInlineImages()) return Promise.resolve(null);

    const done = inlined.get(url);
    if (done !== undefined) return Promise.resolve(done);

    let request = pending.get(url);
    if (!request) {
        request = toDataUrl(url).then(dataUrl => {
            inlined.set(url, dataUrl);
            pending.delete(url);
            return dataUrl;
        });
        pending.set(url, request);
    }

    return request;
}

async function toDataUrl(url: string): Promise<string | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            logger.warn(`Could not inline ${url}: status ${res.status}`);
            return null;
        }

        return await readAsDataUrl(await res.blob());
    } catch (e) {
        logger.warn(`Could not inline ${url}`, e);
        return null;
    }
}

function readAsDataUrl(blob: Blob) {
    return new Promise<string | null>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
    });
}
