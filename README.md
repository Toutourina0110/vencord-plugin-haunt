# Haunt

Shows the [haunt.gg](https://haunt.gg) profile behind any Discord account — right in the chat and in the user popout.

---

## Contents

1. [What the plugin does](#what-the-plugin-does)
2. [What you need](#what-you-need)
3. [Step 1: Install the programs](#step-1-install-the-programs)
4. [Step 2: Download Vencord](#step-2-download-vencord)
5. [Step 3: Add the plugin](#step-3-add-the-plugin)
6. [Step 4: Build Vencord and put it into Discord](#step-4-build-vencord-and-put-it-into-discord)
7. [Step 5: Get an API key and enter it](#step-5-get-an-api-key-and-enter-it)
8. [Every setting explained](#every-setting-explained)
9. [When something goes wrong](#when-something-goes-wrong)
10. [Running it in the browser](#running-it-in-the-browser)
11. [Later: updating Vencord](#later-updating-vencord)
12. [For the curious: how it works inside](#for-the-curious-how-it-works-inside)

---

## What the plugin does

**In chat** the haunt.gg name, the UID and the badges appear next to the Discord name:

```
curet | curet #0  🏅🏅🏅🏅🏅 +17
└ Discord └ Haunt
```

Hover the **name** and you see the profile address; clicking it opens `haunt.gg/curet` in your normal browser. Hover a **badge** instead and you get that badge's name in its official colour, with a line underneath explaining how it is earned.

**In the profile** (click someone's avatar or name) you get a card of your own:

```
┌──────────────────────────────┐
│ (o) curet                  ↗ │
│ 🏅🏅🏅🏅🏅🏅🏅🏅🏅🏅🏅🏅🏅🏅🏅🏅   │
│                              │
│ UID          ID              │
│ #0           c8e9fbac2c32…   │
│                              │
│ VIEWS        FEEDBACK        │
│ 7,667        203 👍 · 11 👎  │
│                              │
│ JOINED                       │
│ 4/26/2025                    │
└──────────────────────────────┘
```

Every single field can be switched off in the settings. People without a haunt.gg account show nothing at all, so nothing gets cluttered.

---

## What you need

| What | What for | Where |
|---|---|---|
| **Node.js 22 or newer** | Builds Vencord | <https://nodejs.org> (take the "LTS" version) |
| **pnpm** | Downloads the parts Vencord is built from | installed below |
| **Git** | Downloads Vencord | <https://git-scm.com/downloads> |
| **Discord Desktop** | The easiest way to run the plugin. The browser works too, see [Running it in the browser](#running-it-in-the-browser) | <https://discord.com/download> |
| **A haunt.gg API key** | Without one the plugin cannot look anything up | see [Step 5](#step-5-get-an-api-key-and-enter-it) |

> [!NOTE]
> The steps below describe the **Discord desktop app**, which is the simplest setup. The plugin also runs on Vencord and Equicord in the browser — as a **userscript** it needs no extra work at all, as a **browser extension** it needs one small proxy you deploy yourself. Both are covered in [Running it in the browser](#running-it-in-the-browser).

---

## Step 1: Install the programs

### Node.js

Download Node.js from <https://nodejs.org> and install it (just click through, leave everything at its defaults).

**Check that it worked:** open PowerShell (press the Windows key, type `powershell`, hit Enter) and run:

```powershell
node --version
```

It has to say `v22.x.x` or higher. If you get an error, either the install failed or you need to close PowerShell and open it again.

### Git

Download Git from <https://git-scm.com/downloads> and install it. Again: leave the defaults, click through.

**Check:**

```powershell
git --version
```

### pnpm

pnpm already ships with Node.js, it just has to be enabled once:

```powershell
corepack enable
```

**Check:**

```powershell
pnpm --version
```

If `corepack enable` throws an error, this works too:

```powershell
npm install -g pnpm
```

---

## Step 2: Download Vencord

Pick a folder for Vencord to live in — `Documents`, for example. In PowerShell:

```powershell
cd $HOME\Documents
git clone https://github.com/Vendicated/Vencord
cd Vencord
```

Now download the parts it is built from (takes a minute or two):

```powershell
pnpm install --frozen-lockfile
```

> [!NOTE]
> If you already have your own Vencord fork, use its address instead of the one above.

---

## Step 3: Add the plugin

Vencord has a dedicated folder for private plugins: `src/userplugins`. Anything in there is picked up automatically when you build. The folder does not exist at first, so create it yourself:

```powershell
mkdir src\userplugins
```

The `haunt` folder goes in there. It should end up looking like this:

```
Vencord/
└── src/
    └── userplugins/
        └── haunt/
            ├── README.md          ← this file
            ├── index.tsx
            ├── api.ts
            ├── cache.ts
            ├── badges.ts
            ├── badgeCatalog.ts
            ├── native.ts
            ├── types.ts
            ├── utils.ts
            ├── styles.css
            └── components/
                ├── ChatDecoration.tsx
                ├── HauntBadgeRow.tsx
                ├── HauntSettings.tsx
                ├── ProfileLink.tsx
                └── ProfileSection.tsx
```

> [!WARNING]
> Put **nothing else** in `src/userplugins` — no zip files, no notes, no images. Vencord tries to load every file in there as a plugin and aborts the build with an error otherwise. If you received the plugin as a zip, unpack it somewhere else and move only the `haunt` folder here.

---

## Step 4: Build Vencord and put it into Discord

### Build

```powershell
pnpm build
```

If it works you get a list of files and several `Done in …ms` lines. If you get a red error, see [When something goes wrong](#when-something-goes-wrong) below.

### Put it into Discord

```powershell
pnpm inject
```

A small window asks which Discord install to patch. Pick the one you use (usually just "Discord") and confirm.

### Restart Discord completely

This is the step almost everyone forgets:

1. Close Discord
2. Look in the **system tray** at the bottom right, next to the clock, for the Discord icon (it may be hidden behind the little `^` arrow)
3. Right-click it → **Quit Discord**
4. Start Discord again

Just closing the window is not enough — Discord keeps running in the background.

> [!IMPORTANT]
> `Ctrl` + `R` inside Discord is **not** enough for this plugin either. The badge images are only unblocked after a real restart, otherwise the badges stay empty.

### Turn the plugin on

In Discord: **Settings** (the gear at the bottom left) → scroll down the left side to **Vencord** → **Plugins** → search for `Haunt` at the top → flip the switch.

---

## Step 5: Get an API key and enter it

The plugin pulls its data from haunt.gg, and that needs a key.

1. Sign in at <https://haunt.gg> and open your dashboard.
2. Create an API key there. It needs the **`lookup:user`** permission, which is granted by the haunt.gg team. If you do not have it, ask for it in the haunt.gg Discord.
3. The key looks like `haunt_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`. **Treat it like a password** — do not share it, do not leave it visible in screenshots.
4. In Discord: **Settings → Vencord → Plugins → Haunt → gear icon** (on the right of the plugin).
5. Paste the key into **API key** at the top. The field shows dots instead of characters so nobody can read along.
6. Press **Test key**.

What the answer means:

| Message | Meaning |
|---|---|
| `Key works — you are <name> (#<uid>)` | All good, you are done |
| `Key works, but no haunt.gg account is linked to your Discord` | The key is fine, but **your own** Discord is not linked to haunt.gg. Just a note — the plugin still works for everyone else |
| `Key rejected: …` | Key mistyped, or missing the `lookup:user` permission |
| `Lookup failed: …` | Usually no restart after `pnpm inject`, or no internet connection |

From here on chat and profiles fill in by themselves. The first time it takes a moment per person, after that the data is remembered.

---

## Every setting explained

Found under **Settings → Vencord → Plugins → Haunt → gear icon**.

### At the top

| Setting | What it does |
|---|---|
| **API key** | Your key from haunt.gg |
| **Lookup proxy URL** | Only shown in the browser extension, where it is required. See [Running it in the browser](#running-it-in-the-browser) |
| **Test key** | Tries the key against your own account |
| **Clear cache** | Throws away everything remembered so far. Handy when somebody changed their profile and you do not want to wait |

### Chat

| Setting | What it does | Default |
|---|---|---|
| **Show in chat** | Master switch for the display next to messages | on |
| **Chat: username** | Shows the haunt.gg name | on |
| **Chat: UID** | Shows the number, e.g. `#1337` | on |
| **Chat: badges** | Shows the badges | on |
| **Chat: separator** | What sits between the Discord and the Haunt name | ` \| ` |
| **Chat: badge limit** | How many badges are shown individually. The rest is collapsed into `+17`, with all their names on hover | 5 |
| **Chat: badge size** | Badge size in pixels | 16 |
| **Chat: click opens the profile** | Whether clicking the name opens your browser | on |

### Profile

| Setting | What it does | Default |
|---|---|---|
| **Show in profiles** | Master switch for the card in the profile | on |
| **Profile: username** | haunt.gg name and display name | on |
| **Profile: UID** | The number | on |
| **Profile: internal ID** | The internal account ID, click it to copy | on |
| **Profile: badges** | The badge row | on |
| **Profile: views** | How often the profile was viewed | on |
| **Profile: likes and dislikes** | The feedback tally | on |
| **Profile: join date** | When the account was created | on |
| **Profile: badge size** | Badge size in pixels | 20 |

### Badges

| Setting | What it does | Default |
|---|---|---|
| **Only badges shown on the profile** | haunt.gg hands out **every** badge somebody owns, including the ones they hid on their profile. By default the plugin shows all of them. Turn this on if you only want the ones that are visible on haunt.gg itself | off |

### Lookups

These control how gently the plugin treats the API. The defaults suit most people — only touch them if you know why.

| Setting | What it does | Default |
|---|---|---|
| **Look users up automatically** | Looks up everyone you see in chat. Off means it only fetches when you open a profile | on |
| **Cache duration (minutes)** | How long found data is kept before asking again | 30 |
| **Remember misses for (hours)** | How long it remembers that somebody has *no* haunt.gg account. Stops the same person being looked up over and over | 12 |
| **Delay between lookups (ms)** | Minimum pause between two requests. The API can only answer about one person per request, so a queue is worked through | 300 |
| **Keep the cache across restarts** | Saves the data so a Discord restart does not reload everything | on |

---

## When something goes wrong

### `pnpm build` aborts with "No loader is configured for `.zip` files"

There is a file in `src/userplugins` that is not a plugin folder. Move it somewhere else — only plugin folders belong there. This applies to any file extension, not just `.zip`.

### Nothing shows up in chat or in profiles

Work through this in order:

1. Is the plugin actually enabled under **Vencord → Plugins**?
2. Is there a key in the **API key** field? What does **Test key** say?
3. Does the person you are looking at even have a haunt.gg account with Discord linked? Test on yourself, or on somebody you know for sure.
4. After `pnpm inject`, did you quit Discord **completely**, including from the system tray?

### Name and UID are there, but the badges are empty or broken image icons

Discord blocks images from unknown sites by default. The plugin lifts that block for `assets.haunt.gg` and `r2.haunt.gg`, but only while Discord is **starting**. So: quit Discord completely (system tray too) and start it again. `Ctrl` + `R` does not do it.

### A red "Haunt: Invalid API key" message

The key is wrong or lacks the `lookup:user` permission. The plugin deliberately stops asking after that, so it does not keep hammering a closed door. Enter a working key and it picks up again by itself.

### In the browser: nothing shows up and the settings warn about a proxy

You are on the extension build, where haunt.gg cannot be reached directly. Follow [Running it in the browser](#running-it-in-the-browser) — or switch to the userscript build, which needs no proxy.

If you already set a proxy URL and lookups still fail, the settings panel names the host it is calling. Open that URL in a tab: the worker should answer with JSON, not a Cloudflare error page. A `401` with "No API key" means neither the `HAUNT_API_KEY` secret nor the plugin's key field is filled in.

### I changed my haunt.gg profile but still see the old data

Data is cached for 30 minutes. **Clear cache** in the plugin settings throws it away immediately.

### Vencord is gone after a Discord update

Happens. Just run it again:

```powershell
cd $HOME\Documents\Vencord
pnpm inject
```

And restart Discord completely again.

### I want to get rid of Vencord

```powershell
cd $HOME\Documents\Vencord
pnpm uninject
```

Discord is back to stock after that.

---

## Running it in the browser

The plugin works on **Vencord and Equicord in the browser**, not just in the desktop app. Which of the two browser flavours you use decides how much setup there is.

### The one obstacle

haunt.gg answers lookups happily, but it does not send an `Access-Control-Allow-Origin` header. A normal browser therefore refuses to hand the answer to a page on `discord.com`, no matter that the request itself succeeded. Everything below is about getting around that one header.

### Userscript — nothing to do

If you run Vencord or Equicord as a **userscript** (Tampermonkey, Violentmonkey), it just works. Install the plugin, enter your API key, done.

The reason: the userscript build replaces the browser's `fetch` with one built on `GM_xmlhttpRequest`. That runs inside your userscript manager rather than inside the page, and the same-origin rule does not apply there. The plugin gets the same freedom the desktop app has, for free.

Badge artwork is handled too: if Discord's CSP blocks the haunt.gg image host, the plugin fetches the image through the same channel and hands the `<img>` a `data:` URL instead. You do not have to do anything for that either.

### Browser extension — one proxy

The **extension** build (Vencord Web / Equicord Web from the Chrome or Firefox store) has no such escape hatch. Its host permissions cover `discord.com` only, and the plugin code runs in the page itself, so it is bound by CORS like any other script.

The fix is a small relay that you host and that answers with the missing header. One is included in this repo at [`web/haunt-proxy.worker.js`](web/haunt-proxy.worker.js) — a Cloudflare Worker, free tier, a couple of minutes to set up:

```bash
npm install -g wrangler
wrangler login
wrangler deploy web/haunt-proxy.worker.js --name haunt-proxy --compatibility-date 2025-01-01
```

Wrangler prints a URL like `https://haunt-proxy.yourname.workers.dev`. Paste that into the plugin's **Lookup proxy URL** setting.

Then, so your API key never leaves infrastructure you control:

```bash
wrangler secret put HAUNT_API_KEY --name haunt-proxy
```

With that secret set you can leave the plugin's **API key** field empty — the worker adds the key itself, and the key never travels through the browser at all. Without it, the plugin sends the key in the `X-API-Key` header and the worker passes it on, which is fine too as long as the worker is yours.

Optionally lock the worker down so only Discord may call it:

```bash
wrangler secret put ALLOWED_ORIGINS --name haunt-proxy
# paste: https://discord.com,https://canary.discord.com,https://ptb.discord.com
```

The worker only ever talks to the single haunt.gg lookup endpoint and only forwards the five query parameters the plugin uses, so it cannot be turned into an open relay for anything else.

> [!WARNING]
> Do not point this setting at a random public CORS proxy. Whoever runs it would see every lookup, and — unless you set the worker secret — your API key along with them. The setting also accepts the generic `https://some-proxy.example/?url={url}` shape for completeness, but most public proxies strip custom request headers, which means the `X-API-Key` header never arrives and every lookup comes back unauthorized.

### What differs from the desktop app

| | Desktop | Userscript | Extension |
|---|---|---|---|
| Lookups | Main process | `GM_xmlhttpRequest` | Your proxy |
| Setup beyond the API key | none | none | deploy the worker |
| Badge images | after a full Discord restart | immediately | immediately |
| Restart needed after install | yes | no | no |

Everything else — chat decoration, profile card, every setting, the cache — behaves identically.

---

## Later: updating Vencord

When a new Vencord version comes out:

```powershell
cd $HOME\Documents\Vencord
git pull
pnpm install --frozen-lockfile
pnpm build
```

Your `src/userplugins` folder is left alone — Git ignores it on purpose. You only need to redo `pnpm inject` if Discord starts without Vencord afterwards.

### Refreshing the badge catalog

Badge names, descriptions and colours are baked into `badgeCatalog.ts`, taken from the official haunt.gg badge list (24 badges, 43 tiers). The images come from the API live, the texts do not. If haunt.gg adds new badges, their names and descriptions are missing until somebody updates that file — the badges themselves still show up.

---

## For the curious: how it works inside

**Why is a detour needed at all?** The haunt.gg API sends no CORS headers. That means a browser refuses to hand the answer to a foreign site like `discord.com` — the request goes out and comes back, but the page is not allowed to read it. Every build therefore needs somewhere to make the request that is not the page: the desktop app uses the Electron main process, the userscript uses `GM_xmlhttpRequest` inside the userscript manager, and the extension uses a proxy you host. See [Running it in the browser](#running-it-in-the-browser).

**Why the restart for the badges?** That is a second, unrelated thing: a security rule (CSP) only lets Discord load images from known addresses. On desktop Vencord can whitelist addresses, but it does so exactly once, when the main process starts — reloading the window never reaches that part. The browser extension sidesteps it by stripping Discord's CSP header outright, and on the userscript, where neither is possible, the plugin notices the blocked image and re-loads it as an inline `data:` URL.

**Why the queue?** The API answers about one person per request — there is no way to ask about twenty at once. In a busy channel that would mean a lot of simultaneous requests. So the plugin works through them one at a time with a short pause, remembers every answer (including "haunt.gg does not know them"), and backs off on its own when it is told to slow down.

**What gets stored?** Only the looked-up profile data, locally in Discord's own storage, and only for as long as the cache duration runs. The API key lives in the Vencord settings. Nothing goes to Discord, to me, or to anyone else — only to haunt.gg itself, which is what the lookup needs.
