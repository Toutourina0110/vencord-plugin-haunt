/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classes } from "@utils/misc";
import { Tooltip } from "@webpack/common";
import { ReactNode } from "react";

import { cl, openProfile, profileUrl } from "../utils";

interface Props {
    username: string;
    enabled?: boolean;
    className?: string;
    children: ReactNode;
}

export function ProfileLink({ username, enabled = true, className, children }: Props) {
    if (!enabled) return <span className={className}>{children}</span>;

    return (
        <Tooltip text={`Open ${profileUrl(username)}`}>
            {tooltipProps => (
                <span
                    {...tooltipProps}
                    className={classes(className, cl("link"))}
                    role="button"
                    tabIndex={0}
                    onClick={e => {
                        e.stopPropagation();
                        openProfile(username);
                    }}
                    onKeyDown={e => {
                        if (e.key !== "Enter" && e.key !== " ") return;
                        e.stopPropagation();
                        e.preventDefault();
                        openProfile(username);
                    }}
                >
                    {children}
                </span>
            )}
        </Tooltip>
    );
}
