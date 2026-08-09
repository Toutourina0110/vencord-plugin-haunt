/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { OpenExternalIcon } from "@components/Icons";
import { Span } from "@components/Span";
import { copyWithToast } from "@utils/discord";
import { classes } from "@utils/misc";
import { findCssClassesLazy } from "@webpack";

import { settings } from "..";
import { listBadges } from "../badges";
import { useHauntProfile } from "../cache";
import { cl, formatDate, formatNumber } from "../utils";
import { HauntBadgeRow } from "./HauntBadgeRow";
import { ProfileLink } from "./ProfileLink";

const ProfileCardClasses = findCssClassesLazy("cardsList", "card", "container");

function Field({ label, value, onClick, title }: { label: string; value: string; onClick?: () => void; title?: string; }) {
    return (
        <div className={cl("field")}>
            <Span className={cl("field-label")} size="xs" weight="medium">{label}</Span>
            {onClick
                ? <button className={classes(cl("field-value"), cl("field-copy"))} onClick={onClick} title={title}>{value}</button>
                : <Span className={cl("field-value")} size="sm">{value}</Span>}
        </div>
    );
}

export function ProfileSection({ userId }: { userId: string; }) {
    const {
        showInProfile, badgesOnlyEnabled,
        profileShowUsername, profileShowUid, profileShowId, profileShowBadges,
        profileShowViews, profileShowFeedback, profileShowCreatedAt,
        profileBadgeSize
    } = settings.store;

    const profile = useHauntProfile(userId, showInProfile);
    if (!showInProfile || !profile) return null;

    const { user, feedback, views } = profile;
    const badges = profileShowBadges ? listBadges(profile.badges, badgesOnlyEnabled) : [];

    return (
        <section className={ProfileCardClasses.container}>
            <div className={classes(ProfileCardClasses.card, cl("profile"))}>
                <ProfileLink username={user.username} className={cl("profile-header")}>
                    {user.avatarUrl && <img className={cl("profile-avatar")} src={user.avatarUrl} alt="" />}
                    <span className={cl("profile-names")}>
                        {profileShowUsername && <Span size="sm" weight="semibold">{user.username}</Span>}
                        {user.name && user.name !== user.username && (
                            <Span className={cl("profile-displayname")} size="xs">{user.name}</Span>
                        )}
                    </span>
                    <OpenExternalIcon width={14} height={14} className={cl("profile-external")} />
                </ProfileLink>

                {badges.length > 0 && (
                    <div className={cl("profile-badges")}>
                        <HauntBadgeRow badges={badges} size={profileBadgeSize} />
                    </div>
                )}

                <div className={cl("fields")}>
                    {profileShowUid && user.uid != null && <Field label="UID" value={`#${user.uid}`} />}
                    {profileShowId && (
                        <Field
                            label="ID"
                            value={user.id}
                            title="Click to copy"
                            onClick={() => copyWithToast(user.id, "Copied the Haunt ID")}
                        />
                    )}
                    {profileShowViews && views != null && <Field label="Views" value={formatNumber(views)} />}
                    {profileShowFeedback && feedback && (
                        <Field label="Feedback" value={`${formatNumber(feedback.likes)} 👍 · ${formatNumber(feedback.dislikes)} 👎`} />
                    )}
                    {profileShowCreatedAt && <Field label="Joined" value={formatDate(user.createdAt)} />}
                </div>
            </div>
        </section>
    );
}
