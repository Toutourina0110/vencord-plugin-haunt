/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BADGE_CATALOG, BADGE_TIER_CATALOG } from "./badgeCatalog";
import { HauntBadge } from "./types";

export interface ResolvedBadge {
    key: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    color: string | null;
}

function prettifyId(badgeId: string) {
    return badgeId.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function resolveBadge(badge: HauntBadge): ResolvedBadge {
    const catalog = badge.badgeId ? BADGE_CATALOG[badge.badgeId] : undefined;
    const tier = badge.badgeId != null && badge.selectedTier != null
        ? BADGE_TIER_CATALOG[badge.badgeId]?.[badge.selectedTier]
        : undefined;

    const official = tier ?? catalog;
    const apiTier = badge.selectedTier != null
        ? badge.tiers.find(t => t.tier === badge.selectedTier)
        : undefined;

    const name = official?.title
        ?? badge.name?.trim()
        ?? apiTier?.title
        ?? (badge.badgeId ? prettifyId(badge.badgeId) : "Badge");

    return {
        key: badge.id,
        name: name || "Badge",
        description: official?.description ?? apiTier?.description ?? null,
        imageUrl: badge.imageUrl ?? badge.image?.url ?? null,
        color: official?.color ?? apiTier?.color ?? badge.color ?? null
    };
}

export function listBadges(badges: HauntBadge[], onlyEnabled: boolean): ResolvedBadge[] {
    return badges
        .filter(badge => !onlyEnabled || badge.enabled)
        .sort((a, b) => a.order - b.order)
        .map(resolveBadge)
        .filter(badge => badge.imageUrl != null);
}
