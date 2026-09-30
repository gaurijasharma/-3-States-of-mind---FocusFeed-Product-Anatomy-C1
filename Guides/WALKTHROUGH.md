# Walkthrough: Fixing FocusFeed Mode Activation & Popup Synchronization

## Issues Resolved

### 1. Script Crash at `document_start` (`document.body.contains` null reference)
- **Root Cause**: The content script runs with `"run_at": "document_start"`. When the constructor restored the saved mode from `sessionStorage`, it triggered `updateComponents()`, which called `ensureShadowHost()`. That method evaluated `document.body.contains(this.shadowHost)`. Because `document.body` is `null` at `document_start`, it threw an unhandled `TypeError: Cannot read properties of null (reading 'contains')`, terminating the content script immediately.
- **Fix**: Added safety guards in [src/content/index.ts](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/src/content/index.ts) so DOM manipulation is deferred until `document.body` is available, while attribute-based CSS modes are still applied instantly.

### 2. Immediate Message & Storage Listeners from Tick 0
- **Root Cause**: `setupMessageListener()` was called inside `init()` which was deferred to `DOMContentLoaded`. If a user clicked the popup before the page fully completed loading, `chrome.tabs.sendMessage` failed with `Could not establish connection. Receiving end does not exist.`
- **Fix**: Initialized `setupMessageListener()` and `setupStorageListener()` immediately in the constructor of [src/content/index.ts](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/src/content/index.ts).

### 3. Expanded YouTube URL Matches & Permissions
- **Root Cause**: Manifest previously only matched `https://www.youtube.com/*`, failing on `https://youtube.com/*` (without `www`). It also lacked `activeTab` and `scripting` permissions needed for popup messaging and programmatic injection into already-open tabs.
- **Fix**: Updated [public/manifest.json](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/public/manifest.json) to match `*://*.youtube.com/*` and `*://youtube.com/*`, and added `activeTab`, `scripting`, and `tabs` permissions.

### 4. Dual-Channel Mode Persistence (Storage + Direct Messaging)
- **Root Cause**: When the popup closed, React state was lost. If direct message querying hit any latency or tab state discrepancy, the mode appeared inactive.
- **Fix**: Updated [src/popup/Popup.tsx](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/src/popup/Popup.tsx) so `handleSelectMode` writes the active tab mode directly to `chrome.storage.local` under `tab_mode_${tabId}` in addition to sending the message. When the popup opens, it reads from storage immediately, ensuring instantaneous visual feedback.

### 5. Automatic Script Injection for Existing Tabs
- **Root Cause**: Reloading an unpacked extension disconnects existing tabs from content scripts until the user manually refreshes the page.
- **Fix**: 
  - Added programmatic injection on install/update in [src/background/index.ts](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/src/background/index.ts).
  - Added PING-and-inject in [src/popup/Popup.tsx](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/src/popup/Popup.tsx): if an active YouTube tab doesn't respond to `PING`, it automatically injects `content/index.js` and `mode-rules.css`.

### 6. Robust Element Positioning
- **Fix**: Added explicit inline styles to [src/content/overlayComponent.ts](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/src/content/overlayComponent.ts), [src/content/badgeComponent.ts](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/src/content/badgeComponent.ts), and [src/content/emptyStateComponent.ts](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/src/content/emptyStateComponent.ts) ensuring they are positioned properly on top of YouTube's layout.

---

## How to Test

1. Open `chrome://extensions/`.
2. Find the **FocusFeed** extension and click the **Reload** (circular arrow) icon.
3. Switch to your YouTube tab and refresh it (or open a new [https://www.youtube.com](https://www.youtube.com) tab).
4. Click the **FocusFeed extension icon** in your Chrome toolbar:
   - Select **Find Something** or **Focus & Learn**.
   - Notice the mode activates immediately on the YouTube tab (recommendations vanish, empty search prompt is shown, and the floating pill badge appears at bottom-right).
5. Close the extension popup and click it again to reopen:
   - The selected mode will remain highlighted as the active mode.
6. Click **Exit** (on the badge or in the popup) to restore normal YouTube.
