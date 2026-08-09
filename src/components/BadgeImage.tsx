/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect, useRef, useState } from "@webpack/common";
import { HTMLProps } from "react";

import { canInlineImages, inlineImage } from "../imageCache";
import { cl } from "../utils";

interface Props extends HTMLProps<HTMLImageElement> {
    url: string;
    alt: string;
    size: number;
}

/**
 * A badge `<img>` that heals itself when Discord's CSP blocks the haunt.gg asset
 * host — see `imageCache.ts`. Costs nothing when the image loads normally, which
 * is the case on the browser extension.
 */
export function BadgeImage({ url, alt, size, ...rest }: Props) {
    const [src, setSrc] = useState(url);
    const retried = useRef(false);

    useEffect(() => {
        retried.current = false;
        setSrc(url);
    }, [url]);

    function onError() {
        if (retried.current || !canInlineImages()) return;
        retried.current = true;

        void inlineImage(url).then(dataUrl => {
            if (dataUrl) setSrc(dataUrl);
        });
    }

    return (
        <img
            {...rest}
            className={cl("badge")}
            src={src}
            alt={alt}
            style={{ width: size, height: size }}
            onError={onError}
        />
    );
}
