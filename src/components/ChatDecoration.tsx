/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { settings } from "..";
import { listBadges } from "../badges";
import { useHauntProfile } from "../cache";
import { cl } from "../utils";
import { HauntBadgeRow } from "./HauntBadgeRow";
import { ProfileLink } from "./ProfileLink";

export function ChatDecoration({ userId }: { userId: string; }) {
    const {
        chatShowUsername, chatShowUid, chatShowBadges, chatSeparator,
        chatMaxBadges, chatBadgeSize, chatClickOpensProfile, badgesOnlyEnabled
    } = settings.store;

    const profile = useHauntProfile(userId);
    if (!profile) return null;

    const { user } = profile;
    const badges = chatShowBadges ? listBadges(profile.badges, badgesOnlyEnabled) : [];

    const name = [
        chatShowUsername && <span key="name" className={cl("chat-username")}>{user.username}</span>,
        chatShowUid && user.uid != null && <span key="uid" className={cl("chat-uid")}>#{user.uid}</span>
    ].filter(Boolean);

    if (!name.length && !badges.length) return null;

    return (
        <span className={cl("chat")}>
            {chatSeparator && <span className={cl("chat-separator")}>{chatSeparator}</span>}

            {name.length > 0 && (
                <ProfileLink username={user.username} enabled={chatClickOpensProfile} className={cl("chat-name")}>
                    {name}
                </ProfileLink>
            )}

            {badges.length > 0 && <HauntBadgeRow badges={badges} size={chatBadgeSize} max={chatMaxBadges} />}
        </span>
    );
}
