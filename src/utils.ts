/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@utils/css";

export const cl = classNameFactory("vc-haunt-");

export const profileUrl = (username: string) => `https://haunt.gg/${encodeURIComponent(username)}`;

export function openProfile(username: string) {
    VencordNative.native.openExternal(profileUrl(username));
}

export const formatNumber = (value: number) => value.toLocaleString();

export function formatDate(iso: string) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString();
}
