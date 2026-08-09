/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Tooltip } from "@webpack/common";

import { ResolvedBadge } from "../badges";
import { cl } from "../utils";
import { BadgeImage } from "./BadgeImage";

interface Props {
    badges: ResolvedBadge[];
    size: number;
    max?: number;
}

export function HauntBadgeRow({ badges, size, max }: Props) {
    if (!badges.length) return null;

    const shown = max != null && max < badges.length ? badges.slice(0, max) : badges;
    const hidden = badges.length - shown.length;

    return (
        <span className={cl("badges")}>
            {shown.map(badge => (
                <Tooltip
                    key={badge.key}
                    text={
                        <span className={cl("badge-tooltip")}>
                            <span className={cl("badge-tooltip-name")} style={badge.color ? { color: badge.color } : undefined}>
                                {badge.name}
                            </span>
                            {badge.description && <span className={cl("badge-tooltip-description")}>{badge.description}</span>}
                        </span>
                    }
                >
                    {tooltipProps => (
                        <BadgeImage
                            {...tooltipProps}
                            url={badge.imageUrl!}
                            alt={badge.name}
                            size={size}
                        />
                    )}
                </Tooltip>
            ))}

            {hidden > 0 && (
                <Tooltip text={badges.slice(shown.length).map(badge => badge.name).join(", ")}>
                    {tooltipProps => (
                        <span {...tooltipProps} className={cl("badge-overflow")}>+{hidden}</span>
                    )}
                </Tooltip>
            )}
        </span>
    );
}
