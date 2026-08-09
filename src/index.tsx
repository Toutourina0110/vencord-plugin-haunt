/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import { addMessageDecoration, removeMessageDecoration } from "@api/MessageDecorations";
import { definePluginSettings, SettingsStore } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import definePlugin, { OptionType } from "@utils/types";
import { User } from "@vencord/discord-types";
import { showToast, Toasts } from "@webpack/common";

import { clearCache, dropPersistedCache, loadPersistedCache, refreshAll, setKeyRejectedHandler } from "./cache";
import { ChatDecoration } from "./components/ChatDecoration";
import { HauntSettings } from "./components/HauntSettings";
import { ProfileSection } from "./components/ProfileSection";

const DECORATION_ID = "Haunt";
const SETTINGS_PREFIX = "plugins.Haunt";

export const settings = definePluginSettings({
    apiKey: {
        type: OptionType.STRING,
        displayName: "API key",
        description: "Your haunt.gg API key. Needs the lookup:user permission — get one from your dashboard.",
        default: "",
        placeholder: "haunt_…",
        componentProps: { type: "password" },
        onChange: () => clearCache()
    },
    manage: {
        type: OptionType.COMPONENT,
        component: HauntSettings
    },

    showInChat: {
        type: OptionType.BOOLEAN,
        displayName: "Show in chat",
        description: "Show Haunt info next to usernames in messages",
        default: true,
        onChange: syncChatDecoration
    },
    chatShowUsername: {
        type: OptionType.BOOLEAN,
        displayName: "Chat: username",
        description: "Show the Haunt username",
        default: true
    },
    chatShowUid: {
        type: OptionType.BOOLEAN,
        displayName: "Chat: UID",
        description: "Show the numeric UID",
        default: true
    },
    chatShowBadges: {
        type: OptionType.BOOLEAN,
        displayName: "Chat: badges",
        description: "Show the badges the user has enabled",
        default: true
    },
    chatSeparator: {
        type: OptionType.STRING,
        displayName: "Chat: separator",
        description: "Sits between the Discord name and the Haunt one",
        default: " | ",
        placeholder: " | "
    },
    chatMaxBadges: {
        type: OptionType.SLIDER,
        displayName: "Chat: badge limit",
        description: "How many badges to show before collapsing the rest into +n",
        markers: [1, 2, 3, 4, 5, 6, 8, 10],
        default: 5
    },
    chatBadgeSize: {
        type: OptionType.SLIDER,
        displayName: "Chat: badge size",
        description: "Badge size in pixels",
        markers: [12, 14, 16, 18, 20, 24],
        default: 16
    },
    chatClickOpensProfile: {
        type: OptionType.BOOLEAN,
        displayName: "Chat: click opens the profile",
        description: "Open haunt.gg/<username> in your browser when clicking the decoration",
        default: true
    },

    showInProfile: {
        type: OptionType.BOOLEAN,
        displayName: "Show in profiles",
        description: "Add a Haunt section to user popouts",
        default: true
    },
    profileShowUsername: {
        type: OptionType.BOOLEAN,
        displayName: "Profile: username",
        description: "Show the Haunt username and display name",
        default: true
    },
    profileShowUid: {
        type: OptionType.BOOLEAN,
        displayName: "Profile: UID",
        description: "Show the numeric UID",
        default: true
    },
    profileShowId: {
        type: OptionType.BOOLEAN,
        displayName: "Profile: internal ID",
        description: "Show the internal account ID, click to copy",
        default: true
    },
    profileShowBadges: {
        type: OptionType.BOOLEAN,
        displayName: "Profile: badges",
        description: "Show the badges the user has enabled",
        default: true
    },
    profileShowViews: {
        type: OptionType.BOOLEAN,
        displayName: "Profile: views",
        description: "Show the profile view count",
        default: true
    },
    profileShowFeedback: {
        type: OptionType.BOOLEAN,
        displayName: "Profile: likes and dislikes",
        description: "Show the profile feedback tally",
        default: true
    },
    profileShowCreatedAt: {
        type: OptionType.BOOLEAN,
        displayName: "Profile: join date",
        description: "Show when the account was created",
        default: true
    },
    profileBadgeSize: {
        type: OptionType.SLIDER,
        displayName: "Profile: badge size",
        description: "Badge size in pixels",
        markers: [16, 20, 24, 28, 32],
        default: 20
    },

    badgesOnlyEnabled: {
        type: OptionType.BOOLEAN,
        displayName: "Only badges shown on the profile",
        description: "The API returns every badge a user holds, including the ones they hid. Switch this on to match what haunt.gg itself displays.",
        default: false
    },

    autoLookup: {
        type: OptionType.BOOLEAN,
        displayName: "Look users up automatically",
        description: "Resolve everyone you see in chat. Switch off to only fetch when you open a profile.",
        default: true
    },
    cacheTtlMinutes: {
        type: OptionType.SLIDER,
        displayName: "Cache duration (minutes)",
        description: "How long a profile is kept before it is fetched again",
        markers: [5, 15, 30, 60, 180, 720],
        default: 30
    },
    negativeCacheHours: {
        type: OptionType.SLIDER,
        displayName: "Remember misses for (hours)",
        description: "How long to remember that someone has no Haunt account, so they are not looked up again",
        markers: [1, 6, 12, 24, 72],
        default: 12
    },
    requestDelayMs: {
        type: OptionType.SLIDER,
        displayName: "Delay between lookups (ms)",
        description: "Minimum gap between two requests. The API has no batch endpoint, so a busy channel means one request per author.",
        markers: [0, 100, 250, 500, 1000, 2000],
        default: 300
    },
    persistCache: {
        type: OptionType.BOOLEAN,
        displayName: "Keep the cache across restarts",
        description: "Saves looked-up profiles so a restart does not re-fetch everything",
        default: true,
        onChange: (value: boolean) => {
            if (!value) void dropPersistedCache();
        }
    }
}, {
    chatShowUsername: { hidden() { return !this.store.showInChat; } },
    chatShowUid: { hidden() { return !this.store.showInChat; } },
    chatShowBadges: { hidden() { return !this.store.showInChat; } },
    chatSeparator: { hidden() { return !this.store.showInChat; } },
    chatMaxBadges: { hidden() { return !this.store.showInChat || !this.store.chatShowBadges; } },
    chatBadgeSize: { hidden() { return !this.store.showInChat || !this.store.chatShowBadges; } },
    chatClickOpensProfile: { hidden() { return !this.store.showInChat; } },

    profileShowUsername: { hidden() { return !this.store.showInProfile; } },
    profileShowUid: { hidden() { return !this.store.showInProfile; } },
    profileShowId: { hidden() { return !this.store.showInProfile; } },
    profileShowBadges: { hidden() { return !this.store.showInProfile; } },
    profileShowViews: { hidden() { return !this.store.showInProfile; } },
    profileShowFeedback: { hidden() { return !this.store.showInProfile; } },
    profileShowCreatedAt: { hidden() { return !this.store.showInProfile; } },
    profileBadgeSize: { hidden() { return !this.store.showInProfile || !this.store.profileShowBadges; } },

    badgesOnlyEnabled: { hidden() { return !this.store.chatShowBadges && !this.store.profileShowBadges; } }
});

function syncChatDecoration() {
    if (settings.store.showInChat) {
        addMessageDecoration(DECORATION_ID, ({ message }) =>
            message?.author == null
                ? null
                : <ChatDecoration userId={message.author.id} />);
    } else {
        removeMessageDecoration(DECORATION_ID);
    }
}

const profilePopoutComponent = ErrorBoundary.wrap(
    ({ user }: { user: User; }) => user?.id ? <ProfileSection userId={user.id} /> : null,
    { noop: true }
);

export default definePlugin({
    name: "Haunt",
    description: "Shows the haunt.gg profile behind a Discord account — username, UID, badges and stats in chat and in user popouts",
    authors: [{ name: "curet-dev", id: 0n }],
    dependencies: ["MessageDecorationsAPI"],
    settings,

    patches: [
        {
            find: '"UserProfilePopout");',
            replacement: {
                match: /userId:\i\.id,guild:\i\}\)(?=])/,
                replace: "$&,$self.profilePopoutComponent(arguments[0])"
            }
        },
        {
            find: ".SIDEBAR,disableToolbar:",
            replacement: {
                match: /user:(\i),widgets:.{0,100}?\}\),/,
                replace: "$&$self.profilePopoutComponent({user:$1}),"
            }
        }
    ],

    profilePopoutComponent,

    start() {
        setKeyRejectedHandler(message =>
            showToast(`Haunt: ${message} — check your API key in the plugin settings`, Toasts.Type.FAILURE));

        SettingsStore.addPrefixChangeListener(SETTINGS_PREFIX, refreshAll);

        void loadPersistedCache();
        syncChatDecoration();
    },

    stop() {
        SettingsStore.removePrefixChangeListener(SETTINGS_PREFIX, refreshAll);
        removeMessageDecoration(DECORATION_ID);
    }
});
