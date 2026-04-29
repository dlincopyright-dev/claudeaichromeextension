# Claude Usage Monitor — Chrome Extension

A lightweight Chrome extension that puts your Claude.ai usage limits right in your browser toolbar. See your session usage, weekly limits, and routine runs at a glance — no digging through settings required.

---

## What it shows

- **Current session usage** — how much of your active session you've burned through, plus time until reset
- **Weekly all-models limit** — your overall weekly usage across every Claude model
- **Claude Design limit** — weekly usage specific to the Design feature
- **Daily routine runs** — how many of your 25 included routine runs you've used today
- **Live badge** — when your session hits 80%+, the toolbar icon shows a percentage badge so you always know before you hit the wall

---

## Installation

The extension isn't on the Chrome Web Store, so you load it manually in developer mode. It takes about two minutes.

**Step 1 — Download**

Download `claude-usage-extension.zip` and unzip it somewhere permanent (your Desktop or a dedicated folder works well — don't delete it after installing).

**Step 2 — Open Chrome extensions**

Go to `chrome://extensions` in your address bar.

**Step 3 — Enable developer mode**

Toggle **Developer mode** on using the switch in the top-right corner of the extensions page.

**Step 4 — Load the extension**

Click **Load unpacked**, then select the unzipped `claude-usage-extension` folder.

**Step 5 — Done**

The Claude Usage Monitor icon (a dark square with an orange **C**) will appear in your Chrome toolbar. Click it anytime to see your usage.

> **Tip:** If you don't see the icon, click the puzzle piece (🧩) icon in Chrome's toolbar and pin Claude Usage Monitor to keep it visible.

---

## How it works

When you click the toolbar icon, the extension:

1. Opens `claude.ai/settings/usage` in a hidden background tab
2. Waits ~2.5 seconds for Claude's JavaScript to fully render the page
3. Reads the rendered DOM using Chrome's scripting API
4. Closes the background tab automatically
5. Displays your real usage data in the popup

Your existing Chrome login session is used — no passwords, no tokens, no credentials are ever stored or transmitted. If you're logged into Claude in Chrome, the extension works.

Results are cached for 5 minutes, so subsequent clicks are instant. The extension also auto-refreshes in the background every 10 minutes to keep the badge current.

---

## Requirements

- Google Chrome (any recent version)
- An active Claude.ai account (Free, Pro, or Team)
- You must be logged into Claude in the same Chrome profile

---

## Permissions explained

| Permission | Why it's needed |
|---|---|
| `https://claude.ai/*` | To open the usage settings page in a background tab and read its content |
| `storage` | To cache your usage data locally for 5 minutes so the popup is fast |
| `scripting` | To read the rendered DOM of the Claude settings page after JavaScript loads |
| `tabs` | To open and close the background tab that fetches your data |
| `alarms` | To schedule automatic background refreshes every 10 minutes |

No data leaves your machine. Nothing is sent to any server other than claude.ai itself (which you're already logged into).

---

## Usage tips

**First click is slower** — the extension needs to open and read the Claude settings page, which takes 3–4 seconds. After that, cached data loads instantly for 5 minutes.

**Click ↻ Refresh** to force a fresh fetch at any time — useful right after a long conversation when you want to see your updated session usage.

**The badge** on the toolbar icon appears automatically when your current session hits 80% or above. It disappears once your session resets.

**Session resets** happen on a rolling window (you'll see the countdown in the popup). Weekly limits reset every Sunday at 1:00 PM.

---

## Troubleshooting

**Shows "Free" plan or no data**
The usage page is JavaScript-rendered and needs time to load. Try clicking ↻ Refresh. If it still fails, make sure you're logged into Claude in the same Chrome profile.

**Popup says "Couldn't load usage"**
Navigate to `claude.ai/settings/usage` manually in Chrome to confirm you're logged in. Then click the extension icon and try refreshing.

**Icon not appearing in toolbar**
Click the 🧩 puzzle piece icon → find Claude Usage Monitor → click the pin icon.

**Extension stopped working after a Chrome update**
Go to `chrome://extensions`, find Claude Usage Monitor, and click the refresh (↻) icon to reload it.

---

## Files

```
claude-usage-extension/
├── manifest.json       Extension configuration and permissions
├── background.js       Service worker — fetches and caches usage data, manages badge
├── popup.html          Toolbar popup UI
├── popup.js            Popup logic — reads cache, triggers fetches, renders data
└── icons/
    ├── icon16.png      Toolbar icon (small)
    ├── icon48.png      Extensions page icon (medium)
    └── icon128.png     Chrome Web Store icon (large)
```

---

## Built with

- Chrome Extensions Manifest V3
- Chrome Scripting API (`scripting.executeScript`)
- Chrome Storage API (`chrome.storage.local`)
- Chrome Alarms API for background refresh
- Vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies

---

*Built with Claude Sonnet 4.6 via claude.ai*
