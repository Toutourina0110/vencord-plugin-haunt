/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export interface HauntAsset {
    url: string;
    mime: string;
    width: number | null;
    height: number | null;
    duration: number | null;
}

export interface HauntBadgeTier {
    tier: number;
    threshold: number;
    title: string;
    description: string;
    color: string | null;
    unlocked: boolean;
    selected: boolean;
    imageUrl: string | null;
}

export interface HauntBadge {
    id: string;
    type: "STANDARD" | "CUSTOM";
    badgeId: string | null;
    enabled: boolean;
    selectedTier: number | null;
    unlockedTiers: number[];
    color: string | null;
    recolor: boolean;
    name: string | null;
    order: number;
    image: HauntAsset | null;
    imageUrl: string | null;
    tiers: HauntBadgeTier[];
}

export interface HauntUser {
    id: string;
    uid: number;
    username: string;
    name: string | null;
    avatarUrl: string | null;
    discordId: string | null;
    lastfmUsername?: string | null;
    premium: boolean;
    verified: boolean;
    imagehost: boolean;
    inactive: boolean;
    createdAt: string;
}

export interface HauntFeedback {
    likes: number;
    dislikes: number;
}

export interface HauntProfile {
    user: HauntUser;
    badges: HauntBadge[];
    views: number | null;
    feedback: HauntFeedback | null;
}

export interface HauntLookupResponse {
    error: string | null;
    user?: HauntUser;
    badges?: HauntBadge[];
    views?: number;
    feedback?: HauntFeedback;
}
