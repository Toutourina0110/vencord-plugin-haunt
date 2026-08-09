# Haunt

Shows the [haunt.gg](https://haunt.gg) profile behind any Discord account — right in the chat and in the user popout.

A **web plugin**: it runs on Vencord and Equicord in the browser. It is not built into the Discord desktop app.

---

## Contents

1. [What the plugin does](#what-the-plugin-does)
2. [Pick your setup](#pick-your-setup)
3. [What you need](#what-you-need)
4. [Step 1: Install the tools](#step-1-install-the-tools)
5. [Step 2: Download Vencord or Equicord](#step-2-download-vencord-or-equicord)
6. [Step 3: Add the plugin](#step-3-add-the-plugin)
7. [Step 4: Build for the browser](#step-4-build-for-the-browser)
8. [Step 5: Install what you built](#step-5-install-what-you-built)
9. [Step 6: Get an API key and enter it](#step-6-get-an-api-key-and-enter-it)
10. [The lookup proxy (extension only)](#the-lookup-proxy-extension-only)
11. [Every setting explained](#every-setting-explained)
12. [When something goes wrong](#when-something-goes-wrong)
13. [Later: updating](#later-updating)
14. [For the curious: how it works inside](#for-the-curious-how-it-works-inside)

---

## What the plugin does

**In chat** the haunt.gg name, the UID and the badges appear next to the Discord name:

```
curet | curet #0  🏅🏅🏅🏅🏅 +17
└ Discord └ Haunt
```

Hover the **name** and you see the profile address; clicking it opens `haunt.gg/curet` in a new tab. Hover a **badge** instead and you get that badge's name in its official colour, with a line underneath explaining how it is earned.

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

## Pick your setup

There are two ways to run Vencord or Equicord in a browser, and the choice decides how much work you are in for.

| | **Userscript** *(recommended)* | **Browser extension** |
|---|---|---|
| Runs in | Tampermonkey / Violentmonkey | Chrome, Firefox |
| Extra setup | **none** | a proxy you deploy yourself |
| Badge images | work immediately | work immediately |

Take the userscript unless you have a reason not to. It needs nothing beyond your API key, because a userscript manager is allowed to make requests that a normal web page is not — the [last section](#for-the-curious-how-it-works-inside) explains why that matters here.

> [!IMPORTANT]
> Either way you have to **build Vencord or Equicord yourself**. The versions in the Chrome and Firefox stores, and the prebuilt userscript from vencord.dev, do not contain this plugin and there is no way to add it to them afterwards.

---

## What you need

| What | What for | Where |
|---|---|---|
| **Node.js 22 or newer** | Builds Vencord | <https://nodejs.org> (take the "LTS" version) |
| **pnpm** | Downloads the parts Vencord is built from | installed below |
| **Git** | Downloads Vencord | <https://git-scm.com/downloads> |
| **Tampermonkey** *(userscript route)* | Runs the build | <https://www.tampermonkey.net> |
| **A haunt.gg API key** | Without one the plugin cannot look anything up | see [Step 6](#step-6-get-an-api-key-and-enter-it) |
| **A Cloudflare account** *(extension route only)* | Hosts the lookup proxy, free tier | <https://dash.cloudflare.com/sign-up> |

---

## Step 1: Install the tools

### Node.js

Download Node.js from <https://nodejs.org> and install it (just click through, leave everything at its defaults).

**Check that it worked:** open a terminal (on Windows: press the Windows key, type `powershell`, hit Enter) and run:

```powershell
node --version
```

It has to say `v22.x.x` or higher. If you get an error, either the install failed or you need to close the terminal and open it again.

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

## Step 2: Download Vencord or Equicord

Pick a folder for it to live in — `Documents`, for example.

```powershell
cd $HOME\Documents
git clone https://github.com/Vendicated/Vencord
cd Vencord
```

For Equicord, use `https://github.com/Equicord/Equicord` instead and `cd Equicord`. Everything below works identically for both.

Now download the parts it is built from (takes a minute or two):

```powershell
pnpm install --frozen-lockfile
```

---

## Step 3: Add the plugin

Vencord has a dedicated folder for private plugins: `src/userplugins`. Anything in there is picked up automatically when you build. The folder does not exist at first, so create it yourself:

```powershell
mkdir src\userplugins
```

Now copy the **contents of this repository's `src/` folder** into `src/userplugins/haunt.web`. Note the name: the `.web` suffix is not decoration, it tells Vencord this plugin is browser-only and keeps it out of desktop builds.

It should end up looking like this:

```
Vencord/
└── src/
    └── userplugins/
        └── haunt.web/
            ├── index.tsx
            ├── api.ts
            ├── cache.ts
            ├── transport.ts
            ├── imageCache.ts
            ├── badges.ts
            ├── badgeCatalog.ts
            ├── types.ts
            ├── utils.ts
            ├── styles.css
            └── components/
                ├── BadgeImage.tsx
                ├── ChatDecoration.tsx
                ├── HauntBadgeRow.tsx
                ├── HauntSettings.tsx
                ├── ProfileLink.tsx
                └── ProfileSection.tsx
```

> [!WARNING]
> Put **nothing else** in `src/userplugins` — no zip files, no notes, no images, and not this repository's `README.md` or `web/` folder either. Vencord tries to load every entry in there as a plugin and aborts the build with an error otherwise.

---

## Step 4: Build for the browser

```powershell
pnpm buildWeb
```

Note the `Web` — plain `pnpm build` produces the desktop app version, which deliberately does not include this plugin.

If it works you get a list of files and several `Done in …ms` lines. Look in `dist/` afterwards; the pieces you care about are:

| Route | Vencord | Equicord |
|---|---|---|
| Userscript | `dist/Vencord.user.js` | `dist/Equicord.user.js` |
| Chrome extension | `dist/chromium-unpacked/` | `dist/browser/chromium-unpacked/` |
| Firefox extension | `dist/firefox-unpacked/` | `dist/browser/firefox-unpacked/` |

---

## Step 5: Install what you built

### Userscript route

1. Install [Tampermonkey](https://www.tampermonkey.net) if you have not already.
2. Open the Tampermonkey **Dashboard** (its toolbar icon → Dashboard).
3. Go to the **Utilities** tab, and under **File** pick the `.user.js` file you just built, then hit **Import**.
4. Confirm the install, then reload Discord in your browser.

> [!NOTE]
> On Firefox, use Tampermonkey rather than Violentmonkey or Greasemonkey. Vencord's own userscript notes that the other two cannot replace things on the window on sites with a strict CSP, which Discord is.

### Extension route

**Chrome / Edge / Brave**

1. Open `chrome://extensions`.
2. Switch on **Developer mode** (top right).
3. Click **Load unpacked** and pick the `chromium-unpacked` folder from the table above.
4. Reload Discord.

**Firefox**

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on** and pick any file inside the `firefox-unpacked` folder.
3. Reload Discord.

> [!WARNING]
> On Firefox this is a *temporary* add-on: it disappears every time you restart the browser, and you have to load it again. Making it permanent requires signing the extension through Mozilla, which is out of scope here. If that bothers you, take the userscript route.

### Turn the plugin on

In Discord, go to **Settings → Vencord → Plugins**, find **Haunt** and switch it on.

---

## Step 6: Get an API key and enter it

1. Open your haunt.gg dashboard and create an API key with the **`lookup:user`** permission.
2. In Discord: **Settings → Vencord → Plugins → Haunt → gear icon**.
3. Paste the key into **API key**.
4. Hit **Test key**. It looks your own account up and tells you exactly what happened.

If you are on the **extension** route, lookups will not work yet — the settings panel says so and points you at the next section. On the **userscript** route you are done.

---

## The lookup proxy (extension only)

haunt.gg answers lookups happily, but it does not send an `Access-Control-Allow-Origin` header. A browser therefore refuses to hand the answer to a page on `discord.com`, even though the request itself succeeded. The extension has no way around that on its own, so lookups need a small relay that you host and that supplies the missing header.

One is included in this repository at [`web/haunt-proxy.worker.js`](web/haunt-proxy.worker.js) — a Cloudflare Worker, free tier, a couple of minutes to set up:

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

---

## Every setting explained

Found under **Settings → Vencord → Plugins → Haunt → gear icon**.

### At the top

| Setting | What it does |
|---|---|
| **API key** | Your key from haunt.gg |
| **Lookup proxy URL** | Only shown on the extension, where it is required. See [The lookup proxy](#the-lookup-proxy-extension-only) |
| **Test key** | Tries the key against your own account |
| **Clear cache** | Throws away everything remembered so far. Handy when somebody changed their profile and you do not want to wait |

### Chat

| Setting | What it does | Default |
|---|---|---|
| **Show in chat** | Master switch for everything next to usernames | on |
| **Chat: username** | The haunt.gg name | on |
| **Chat: UID** | The number behind the name | on |
| **Chat: badges** | The badge row | on |
| **Chat: separator** | What sits between the Discord name and the Haunt one | ` \| ` |
| **Chat: badge limit** | How many badges before the rest collapse into `+n` | 5 |
| **Chat: badge size** | Badge size in pixels | 16 |
| **Chat: click opens the profile** | Whether clicking the name opens a new tab | on |

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
| **Keep the cache across restarts** | Saves the data so a browser restart does not reload everything | on |

---

## When something goes wrong

### `pnpm buildWeb` aborts with "No loader is configured for `.zip` files"

There is a file in `src/userplugins` that is not a plugin folder. Move it somewhere else — only plugin folders belong there. This applies to any file extension, not just `.zip`.

### The plugin does not appear in the plugin list at all

Check that the folder is named `haunt.web` and sits directly in `src/userplugins`, and that you ran `pnpm buildWeb` rather than `pnpm build`. A `haunt.web` folder is deliberately skipped by the desktop build, so it will never show up there.

### Nothing shows up in chat or in profiles

Work through this in order:

1. Is the plugin actually enabled under **Vencord → Plugins**?
2. Is there a key in the **API key** field? What does **Test key** say?
3. Are you on the extension route without a proxy? The settings panel says so in as many words — see [The lookup proxy](#the-lookup-proxy-extension-only).
4. Does the person you are looking at even have a haunt.gg account with Discord linked? Test on yourself, or on somebody you know for sure.

### On the extension: lookups fail even though a proxy is set

The settings panel names the host it is calling. Open that URL in a tab — the worker should answer with JSON, not a Cloudflare error page. A `401` with "No API key" means neither the `HAUNT_API_KEY` secret nor the plugin's key field is filled in.

### A red "Haunt: Invalid API key" message

The key is wrong or lacks the `lookup:user` permission. The plugin deliberately stops asking after that, so it does not keep hammering a closed door. Enter a working key and it picks up again by itself.

### I changed my haunt.gg profile but still see the old data

Data is cached for 30 minutes. **Clear cache** in the plugin settings throws it away immediately.

### Firefox lost the extension again

Temporary add-ons do not survive a browser restart — that is Firefox, not the plugin. Load it again from `about:debugging`, or switch to the userscript route.

---

## Later: updating

When a new Vencord or Equicord version comes out:

```powershell
cd $HOME\Documents\Vencord
git pull
pnpm install --frozen-lockfile
pnpm buildWeb
```

Then reinstall what you built, exactly as in [Step 5](#step-5-install-what-you-built). Your `src/userplugins` folder is left alone by `git pull` — Git ignores it on purpose.

### Refreshing the badge catalog

Badge names, descriptions and colours are baked into `badgeCatalog.ts`, taken from the official haunt.gg badge list (24 badges, 43 tiers). The images come from the API live, the texts do not. If haunt.gg adds new badges, their names and descriptions are missing until somebody updates that file — the badges themselves still show up.

---

## For the curious: how it works inside

**Why can a web page not just ask haunt.gg?** Because haunt.gg sends no CORS headers. The request goes out and the answer comes back, but the browser refuses to hand it to a page on a different site — `discord.com` in this case. So the request has to be made somewhere that is not the page.

**Why does the userscript need nothing, then?** Vencord's web build injects a small shim that replaces the browser's `fetch` with one built on `GM_xmlhttpRequest`. That runs inside your userscript manager rather than inside the page, and the same-origin rule does not apply there. The plugin inherits that freedom without knowing about it.

**And the extension?** Its host permissions cover `discord.com` only, and the plugin's code runs in the page itself, so it is bound by CORS like any other script. There is no trick left — hence the small relay you host yourself.

**Why the queue?** The API answers about one person per request — there is no way to ask about twenty at once. In a busy channel that would mean a lot of simultaneous requests. So the plugin works through them one at a time with a short pause, remembers every answer (including "haunt.gg does not know them"), and backs off on its own when it is told to slow down.

**What about the badge images?** A second, unrelated rule: Discord's CSP only allows images from addresses it knows, and haunt.gg is not one of them. The browser extension sidesteps this by stripping Discord's CSP header outright. The userscript cannot do that, so the plugin notices the blocked image and re-loads it through the same CORS-free channel as an inline `data:` URL, which the CSP does allow.

**What gets stored?** Only the looked-up profile data, locally in Discord's own storage, and only for as long as the cache duration runs. The API key lives in the Vencord settings. Nothing goes to Discord, to me, or to anyone else — only to haunt.gg itself, which is what the lookup needs, plus your own proxy if you run one.
