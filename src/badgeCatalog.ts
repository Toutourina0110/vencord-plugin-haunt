/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export interface CatalogBadge {
    title: string;
    description: string;
    color: string;
}

export interface CatalogTier extends CatalogBadge {
    tier: number;
}

export const BADGE_CATALOG: Record<string, CatalogBadge> = {
    "owner": { title: "Owner", description: "Be a part of the haunt.gg owner team.", color: "#9e6bff" },
    "manager": { title: "Manager", description: "Be a part of the haunt.gg manager team.", color: "#ff4242" },
    "staff": { title: "Staff", description: "Be a part of the haunt.gg staff team.", color: "#6783ff" },
    "helper": { title: "Helper", description: "Be a part of the haunt.gg helper team.", color: "#d4843d" },
    "og": { title: "OG", description: "Be an early supporter of haunt.gg.", color: "#ffd700" },
    "verified": { title: "Verified", description: "Purchase or be a known content creator.", color: "#008ada" },
    "bug-hunter": { title: "Bug Hunter", description: "Report a bug to the haunt.gg team.", color: "#3d9e5c" },
    "donator": { title: "Donator", description: "Awarded for donating to haunt.gg.", color: "#13a15a" },
    "premium": { title: "Premium", description: "Purchase the premium package.", color: "#a749dd" },
    "champion": { title: "Champion", description: "Reach the top 10 on the profile views leaderboard.", color: "#ffdb58" },
    "booster": { title: "Booster", description: "Boost the haunt.gg discord server.", color: "#be510d" },
    "event": { title: "Event", description: "Earned from taking part in haunt.gg events.", color: "#4f8fe8" },
    "views": { title: "Views", description: "Earned by reaching profile-view milestones.", color: "#9b8cff" },
    "likes": { title: "Likes", description: "Earned by reaching profile-like milestones.", color: "#ff6f61" },
    "comments": { title: "Comments", description: "Earned by reaching profile-comment milestones.", color: "#4aa8ff" },
    "domain": { title: "Domain", description: "Add a public custom domain to Image Host or Profiles.", color: "#3000ff" },
    "gifter": { title: "Gifter", description: "Awarded for gifting haunt.gg products to other users.", color: "#d10000" },
    "imagehost": { title: "Image Host", description: "Purchase the Image Host storage extension.", color: "#d43570" },
    "guildtag": { title: "Guild Tag", description: "Obtain our guild tag on the haunt.gg discord server.", color: "#895129" },
    "level": { title: "Level", description: "Reach activity levels on the haunt.gg discord server.", color: "#3ba55d" },
    "halloween": { title: "Halloween", description: "Exclusive badge from the halloween sale.", color: "#ea6023" },
    "christmas": { title: "Christmas", description: "Exclusive badge from the christmas sale.", color: "#e71c1c" },
    "easter": { title: "Easter", description: "Exclusive badge from the easter sale.", color: "#ffb3c1" },
    "summer": { title: "Summer", description: "Exclusive badge from the summer sale.", color: "#fde46f" },
};

export const BADGE_TIER_CATALOG: Record<string, Record<number, CatalogTier>> = {
    "christmas": {
        1: { tier: 1, title: "Christmas 2025", description: "Claimed during the haunt.gg Christmas 2025 sale.", color: "#e71c1c" },
    },
    "donator": {
        1: { tier: 1, title: "Donator", description: "Donate at least 10€ to haunt.gg.", color: "#13a15a" },
        2: { tier: 2, title: "Fortune", description: "Donate at least 50€ to haunt.gg.", color: "#aa3b3b" },
        3: { tier: 3, title: "Solar", description: "Donate at least 100€ to haunt.gg.", color: "#4cadd0" },
        4: { tier: 4, title: "Void", description: "Donate at least 250€ to haunt.gg.", color: "#ff5dd6" },
        5: { tier: 5, title: "Apollo", description: "Donate at least 500€ to haunt.gg.", color: "#8799ae" },
        6: { tier: 6, title: "Rich", description: "Donate at least 1.000€ to haunt.gg.", color: "#76518e" },
    },
    "easter": {
        1: { tier: 1, title: "Easter 2026", description: "Claimed during the haunt.gg Easter 2026 sale.", color: "#ffb3c1" },
    },
    "summer": {
        1: { tier: 1, title: "Summer 2026", description: "Claimed during the haunt.gg Summer 2026 sale.", color: "#fde46f" },
    },
    "gifter": {
        1: { tier: 1, title: "Gifter", description: "Gift a haunt.gg product to another user.", color: "#d10000" },
        2: { tier: 2, title: "Patron", description: "Gift 3 or more haunt.gg products to other users.", color: "#d10000" },
        3: { tier: 3, title: "Luminary", description: "Gift 5 or more haunt.gg products to other users.", color: "#d10000" },
        4: { tier: 4, title: "Hero", description: "Gift 10 or more haunt.gg products to other users.", color: "#d10000" },
        5: { tier: 5, title: "Legend", description: "Gift 25 or more haunt.gg products to other users.", color: "#d10000" },
    },
    "halloween": {
        1: { tier: 1, title: "Halloween 2025", description: "Claimed during the haunt.gg Halloween 2025 sale.", color: "#ea6023" },
    },
    "likes": {
        1: { tier: 1, title: "Liked", description: "Receive your first profile like.", color: "#ff6f61" },
        2: { tier: 2, title: "Charming", description: "Receive 10 or more profile likes.", color: "#ff6f61" },
        3: { tier: 3, title: "Beloved", description: "Receive 25 or more profile likes.", color: "#ff6f61" },
        4: { tier: 4, title: "Heartthrob", description: "Receive 50 or more profile likes.", color: "#ff6f61" },
        5: { tier: 5, title: "Iconic", description: "Receive 100 or more profile likes.", color: "#ff6f61" },
        6: { tier: 6, title: "Mythic", description: "Receive 250 or more profile likes.", color: "#ff6f61" },
    },
    "comments": {
        1: { tier: 1, title: "Recognized", description: "Receive your first profile comment.", color: "#4aa8ff" },
        2: { tier: 2, title: "Connected", description: "Receive 10 or more profile comments.", color: "#4aa8ff" },
        3: { tier: 3, title: "Trending", description: "Receive 25 or more profile comments.", color: "#4aa8ff" },
        4: { tier: 4, title: "Influential", description: "Receive 50 or more profile comments.", color: "#4aa8ff" },
        5: { tier: 5, title: "Icon", description: "Receive 100 or more profile comments.", color: "#4aa8ff" },
        6: { tier: 6, title: "Hall of Fame", description: "Receive 250 or more profile comments.", color: "#4aa8ff" },
    },
    "views": {
        1: { tier: 1, title: "Noticed", description: "Achieve 100 or more total views.", color: "#9b8cff" },
        2: { tier: 2, title: "Rising", description: "Achieve 500 or more total views.", color: "#9b8cff" },
        3: { tier: 3, title: "Viral", description: "Achieve 1.000 or more total views.", color: "#9b8cff" },
        4: { tier: 4, title: "All Eyes on Me", description: "Achieve 2.500 or more total views.", color: "#9b8cff" },
        5: { tier: 5, title: "Main Character", description: "Achieve 5.000 or more total views.", color: "#9b8cff" },
        6: { tier: 6, title: "Famous", description: "Achieve 10.000 or more total views.", color: "#9b8cff" },
    },
    "level": {
        1: { tier: 1, title: "Rookie", description: "Reach level 5 on the haunt.gg discord server.", color: "#6e7681" },
        2: { tier: 2, title: "Insider", description: "Reach level 10 on the haunt.gg discord server.", color: "#3ba55d" },
        3: { tier: 3, title: "Veteran", description: "Reach level 20 on the haunt.gg discord server.", color: "#3e8fd0" },
        4: { tier: 4, title: "Elite", description: "Reach level 30 on the haunt.gg discord server.", color: "#8b4fc0" },
        5: { tier: 5, title: "Master", description: "Reach level 40 on the haunt.gg discord server.", color: "#e0533e" },
        6: { tier: 6, title: "Legend", description: "Reach level 50 on the haunt.gg discord server.", color: "#e0a92e" },
    },
    "event": {
        1: { tier: 1, title: "Participant", description: "Participate in a haunt.gg event.", color: "#4f8fe8" },
        2: { tier: 2, title: "Third Place", description: "Get third place in a haunt.gg event.", color: "#c27030" },
        3: { tier: 3, title: "Second Place", description: "Get second place in a haunt.gg event.", color: "#838383" },
        4: { tier: 4, title: "Winner", description: "Win a haunt.gg event.", color: "#f1bf0f" },
    },
};
