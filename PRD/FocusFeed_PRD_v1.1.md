# FocusFeed — Product Requirements Document (PRD)

**Document Status:** Draft v1.1 (technical review incorporated)  
**Author:** Senior Product Manager  
**Last Updated:** September 19, 2026  
**Product Type:** Chrome Browser Extension  
**Target Platform:** YouTube.com (Desktop Web)

> Items marked **[Proposed]** need owner sign-off. Items marked **(verify)** depend on undocumented YouTube behavior or fast-moving tooling and are confirmed in the Week-1 spike (Section 11).

---

## Changelog (v1.0 → v1.1)

| Area | Change |
|---|---|
| Success metrics | Rewritten around what is measurable without telemetry; opt-in telemetry moved to a decision (3.3) |
| State model | "Session" defined as tab lifetime; per-tab vs. persistent state separated (5.3, 7.2) |
| New tabs | Tabs opened from a moded YouTube tab inherit the mode (5.2, 5.3, 7.2) |
| Modes | Autoplay corrected; Focus & Learn keeps autoplay inside playlists; Catch Up simplified; Mode × Page-type matrix added (6.2.5) |
| Overlay | Accessibility, Esc, playback-pause, and trigger rules clarified (6.1) |
| Architecture | Attribute-driven CSS, navigation events, selector strategy, route guards, shadcn/ui in Shadow DOM, reduced permissions (7) |
| Removed | Remote "selector update mechanism" (conflicts with the no-network constraint and MV3 rules) |
| New | Onboarding (6.6), Week-1 spike (11), store compliance (12) |

---

## 1. Executive Summary

YouTube is the world's largest video platform, but its design is optimized for maximum time-on-site — not for what the user actually came to do. Every visit begins in the same state: an infinite scroll of recommendations engineered to pull you away from your goal.

**FocusFeed** solves this by introducing an *intent layer* — a lightweight overlay that appears when a user lands on YouTube, asking one simple question: *"What are you here for today?"* Based on the user's answer, FocusFeed temporarily reshapes the YouTube experience by surfacing what's relevant and hiding what's not.

This is not a blocker. It is not a parental control. It is a tool that gives intentional adults temporary, contextual control over their YouTube session — and restores everything to normal when they're done.

---

## 2. Problem Statement

### 2.1 The Core Problem

YouTube is built to keep users watching — not to help users accomplish what they came for. The homepage, Shorts shelf, autoplay queue, and end-screen cards are all engineered for algorithmic discovery, which works against the user when they have a specific goal (learning a skill, catching up on subscriptions, finding a specific video).

### 2.2 Who Suffers From This

| User Type | Their Goal | YouTube's Interference |
|---|---|---|
| The Learner | Finish a tutorial playlist | Autoplay redirects to unrelated content; end-screen cards are distracting |
| The Subscriber | See new uploads from followed creators | Homepage buries subscriptions under generic recommendations |
| The Searcher | Find and watch one specific video | Related video sidebar hijacks attention after the video ends |
| The Casual Browser | Mindlessly explore | No issue — YouTube's defaults serve this user perfectly |

### 2.3 Why Existing Solutions Fail

- **Full blockers (e.g., DF YouTube):** Too blunt. They permanently strip YouTube of discovery features the user might actually want sometimes.
- **Browser focus modes:** Platform-agnostic, not YouTube-specific, require manual setup every session.
- **Willpower:** Not a scalable product solution.

---

## 3. Goals & Success Metrics

### 3.1 Product Goals

1. Reduce unintentional time spent on YouTube for users who install FocusFeed.
2. Increase user satisfaction with their YouTube sessions.
3. Establish FocusFeed as the go-to intent-layer tool for intentional YouTube users.

### 3.2 Non-Goals (MVP)

- Mobile app or Safari/Firefox support (desktop Chrome only for MVP).
- AI-powered mode suggestion or automatic intent detection.
- Video content filtering or parental controls.
- Blocking YouTube access entirely.
- Any form of user account, backend server, or data collection.
- Per-video or per-channel subscription-status filtering (see Section 6.2, Catch Up).

### 3.3 Success Metrics

**Problem in v1.0:** WAU, mode activation rate, and Day-30 retention require telemetry, which contradicts the "no data collection" constraint. Without telemetry, only the metrics the Chrome Web Store dashboard exposes are observable.

**[Proposed] MVP metrics (no telemetry, observable via Chrome Web Store dashboard and reviews):**

| Metric | Target (90 days post-launch) | Source |
|---|---|---|
| Installs / weekly active installs | 5,000+ | Chrome Web Store dashboard *(verify which usage figures the dashboard currently exposes)* |
| Chrome Web Store rating | ≥ 4.5 stars | Chrome Web Store |
| Uninstall rate | < 15% within 30 days | Chrome Web Store dashboard *(verify availability)* |
| Qualitative satisfaction | Tracked via review themes and an optional feedback link in Settings | Reviews, feedback link |

**Decision needed (Open Question #5):** Mode Activation Rate and Day-30 retention can only be measured with **opt-in, anonymous, aggregate-only telemetry**. That requires a backend, a privacy policy update, an explicit consent screen, and a different store-review story. If approved, it is scoped to post-MVP (Section 8). Until then, those two metrics are removed from MVP targets.

---

## 4. User Personas

### Persona 1: Aisha — The Focused Learner
- **Age:** 26, UX Designer
- **Goal:** Use YouTube to learn skills (Figma, motion design) without falling into a rabbit hole.
- **Pain:** Opens YouTube to watch a tutorial, ends up watching vlogs for 2 hours.
- **Need:** A mode that hides distractions and keeps her on her learning path — including letting a tutorial playlist play through automatically.

### Persona 2: Rohan — The Loyal Subscriber
- **Age:** 32, Software Engineer
- **Goal:** Check in on the 15 channels he follows every few days.
- **Pain:** The YouTube homepage shows him almost nothing from his subscriptions.
- **Need:** A mode that surfaces only new uploads from creators he follows.

### Persona 3: Mei — The Deliberate Searcher
- **Age:** 22, Student
- **Goal:** Find one specific video (a lecture, a recipe, a review) and watch it without distraction.
- **Pain:** Gets pulled into related videos the moment her video ends.
- **Need:** A mode that lets her search and watch, then stops.

---

## 5. User Journey

### 5.1 Core Flow (MVP)

```
User navigates to youtube.com
        │
        ▼
FocusFeed Intent Overlay appears (per trigger setting, Section 6.5)
(centered overlay, semi-transparent backdrop)
        │
        ▼
User selects a Mode (or dismisses to Normal YouTube)
        │
        ├──► Mode Activated
        │       │
        │       ▼
        │    Mode attribute set on <html>; static mode stylesheet
        │    hides/shows elements; behavioral controllers start
        │       │
        │       ▼
        │    User browses YouTube in their chosen mode
        │       │
        │       ▼
        │    User clicks "Exit Mode" or closes tab
        │       │
        │       ▼
        │    Attribute removed; controllers stopped;
        │    YouTube fully restored to normal state
        │
        └──► Dismissed (No mode)
                │
                ▼
             Normal YouTube — no changes applied
```

### 5.2 Detailed Interaction States

| State | Trigger | System Behavior |
|---|---|---|
| **Overlay Appears** | User navigates to a URL matching the overlay trigger setting | Content script mounts the intent overlay after page load |
| **Mode Selected** | User clicks a mode card | Overlay dismisses; mode attribute is set; mode controllers start |
| **Mode Active** | Mode is running | A small, persistent FocusFeed badge/pill is visible indicating the active mode and offering a quick "Exit" option |
| **Mode Exited** | User clicks "Exit Mode" on the badge (or from the popup) | Attribute removed; controllers stopped; any changed YouTube state is restored; YouTube is fully restored |
| **Dismissed** | User clicks "Skip — Normal YouTube" | Overlay closes; no changes applied; YouTube is untouched |
| **New Tab on YouTube (opened directly)** | User opens a new YouTube tab from the address bar, a bookmark, or a link on a non-YouTube page | Tab has no mode; overlay appears per trigger setting |
| **New tab opened from a moded YouTube tab** | User middle-clicks, Ctrl/Cmd-clicks, or uses "Open in new tab" on a YouTube link while a mode is active | **[Proposed]** The new tab **inherits the opener's mode**, applied before first paint where possible. The overlay is not shown; the badge is. This prevents a focus session leaking when the user opens a video in a new tab. |
| **Tab Reload / Duplicate** | User reloads or duplicates a tab with a mode active | **[Proposed]** Reload keeps the mode (no overlay); a duplicated tab does **not** inherit the mode and shows the overlay |
| **Mid-session navigation** | User navigates between YouTube pages (SPA) | Mode is maintained; overlay is not re-shown; page-type rules re-evaluated (Section 6.2.5) |
| **Extension installed while YouTube tabs are open** | First install | Existing tabs are not modified until reload; first-run onboarding is shown (Section 6.6) |

### 5.3 Definitions (new)

To remove ambiguity in v1.0:

- **Session** = the lifetime of a single browser tab. A reload stays in the session; closing the tab ends it.
- **Active mode** is **per-tab** state. It is not shared across tabs.
- **Settings** are **global** and persistent.
- **Inheritance:** a tab opened from a YouTube tab that has an active mode inherits that mode at the moment it opens, then evolves independently. Exiting or changing the mode in one tab does not affect the other. Tabs opened directly (address bar, bookmark, non-YouTube page) and duplicated tabs do **not** inherit.
- **Popup with multiple YouTube tabs:** the popup shows and controls the mode of the **currently focused YouTube tab**. If the focused tab is not on YouTube, the popup shows "No YouTube tab active" and offers to open YouTube (mode selection then applies to the newly opened tab, via the overlay). *(This resolves the v1.0 contradiction between "stateless per-tab" and "switch modes from the popup".)*

---

## 6. Feature Specifications

### 6.1 The Intent Overlay

The Intent Overlay is the primary UI surface of FocusFeed. It appears automatically according to the trigger setting in Section 6.5 (default: YouTube homepage only).

**Content Requirements:**
- A clear headline (e.g., *"What are you here for?"*)
- A short sub-headline that frames FocusFeed's value without being preachy
- 4 Mode Cards (see Section 6.2) arranged in a 2x2 grid
- A low-prominence "Skip — Normal YouTube" dismissal option

**Behavioral Requirements:**
- Overlay must render within 1 second of YouTube's initial page load.
- Must not interfere with YouTube's own page load or navigation.
- Clicking outside the overlay (on the backdrop) does NOT dismiss it — the user must make an explicit choice.
- Overlay must not be displayed again for the duration of the session (tab lifetime) once dismissed or a mode is selected.
- **[Proposed]** If media is already playing behind the overlay (e.g., a shared video link with autoplay), the video is **paused** while the overlay is open. Playback is not auto-resumed after a mode selection; the user presses play. *(Decision needed: Open Question #7.)*
- Overlay renders inside an isolated Shadow DOM root (Section 7.7) so YouTube's CSS cannot affect it and FocusFeed's CSS cannot affect YouTube.

**Accessibility Requirements:**
- `role="dialog"`, `aria-modal="true"`, labelled title and description.
- Focus is trapped inside the overlay while open, and returned to a sensible element on close.
- Fully keyboard navigable; visible focus states; ARIA labels on all interactive elements.
- **Esc key:** **[Proposed]** Esc behaves like "Skip — Normal YouTube". Blocking Esc entirely is unusual and frustrates keyboard users; the "explicit choice" rule is preserved because Esc *is* an explicit choice to skip. *(Open Question #8.)*
- Key events inside the overlay must not leak to YouTube's global keyboard shortcuts (e.g., `k`, `f`, `/`).
- Respects `prefers-reduced-motion` (no non-essential animation) — especially relevant for a product meant to reduce distraction.
- Matches YouTube's light/dark theme, with `prefers-color-scheme` as a fallback (Section 7.7).

### 6.2 The Four Modes

> **Note:** The per-mode lists below describe **what each mode is for**. The **authoritative, testable behavior** is the Mode × Page-type matrix in Section 6.2.5. If they conflict, the matrix wins.

#### Mode 1: Find Something
> *"I know what I'm looking for."*

**Intent:** The user has a specific video or topic in mind.

| Surface | Action |
|---|---|
| Search bar | ✅ Visible |
| Search results page | ✅ Visible |
| Current video player | ✅ Visible |
| Video chapters | ✅ Visible |
| Channel pages | ✅ Visible |
| Playlists | ✅ Visible |
| Homepage recommendations | ❌ Hidden |
| Shorts shelf & feed | ❌ Hidden (and `/shorts/` URLs redirected) |
| Related/Up-next sidebar | ❌ Hidden |
| Autoplay | ❌ Disabled (see 6.2.6) |
| End-screen cards | ❌ Hidden |
| Trending / Explore | ❌ Hidden |

---

#### Mode 2: Focus & Learn
> *"I want to follow something through."*

**Intent:** The user wants to learn a topic via tutorials, lectures, or a playlist.

**Change from v1.0:** Autoplay is **ON within the current playlist** and **OFF for recommendations.** In v1.0 autoplay was fully disabled, which forced Aisha (Persona 1) to click "next" manually through a tutorial playlist — the opposite of the mode's purpose.

| Surface | Action |
|---|---|
| Search bar | ✅ Visible |
| Current video player | ✅ Visible |
| Video chapters | ✅ Visible |
| Playlists | ✅ Visible |
| Subscriptions feed | ✅ Visible |
| Homepage recommendations | ❌ Hidden |
| Shorts shelf & feed | ❌ Hidden (and `/shorts/` URLs redirected) |
| Related/Up-next sidebar | ❌ Hidden (playlist panel remains visible) |
| Autoplay | ⚙️ Playlist-only (next video in the current playlist plays; recommendations never autoplay) |
| End-screen cards | ❌ Hidden |
| Trending / Explore | ❌ Hidden |

---

#### Mode 3: Catch Up
> *"I want to see what's new from creators I follow."*

**Intent:** The user only wants to consume content from channels they have explicitly subscribed to.

**Change from v1.0:** Per-video and per-channel subscription filtering is **removed from MVP.** Whether a given video or channel is subscribed is not reliably available in the DOM, and scraping subscribe-button state breaks on localization and layout changes. **[Proposed]** Catch Up instead routes the user to the subscriptions feed and hides everything except the player and that feed.

| Surface | Action |
|---|---|
| Subscriptions feed (`/feed/subscriptions`) | ✅ Visible (this is the mode's home) |
| New uploads from subscriptions | ✅ Visible (via the subscriptions feed) |
| Watch Later playlist | ✅ Visible |
| Current video player | ✅ Visible |
| Channel pages | ✅ Visible (reached from the feed; not filtered by subscription status) |
| Homepage recommendations | ❌ Redirected to the subscriptions feed |
| Shorts shelf | ❌ Hidden (and `/shorts/` URLs redirected) |
| Trending / Explore | ❌ Hidden |
| Related/Up-next sidebar | ❌ Hidden |
| Autoplay | ❌ Disabled (see 6.2.6) |

---

#### Mode 4: Explore
> *"I'm open to finding something new."*

**Intent:** The user consciously and deliberately wants to browse. This mode respects that intent and offers optional guardrails.

| Surface | Action |
|---|---|
| Homepage recommendations | ✅ Visible |
| Search | ✅ Visible |
| Related/Up-next videos | ✅ Visible |
| Subscriptions | ✅ Visible |
| Trending | ✅ Visible |
| Shorts | ⚙️ User Toggle |
| Autoplay | ⚙️ User Toggle |

*Explore mode includes two optional toggles visible within the active mode badge — one for Shorts and one for Autoplay — so the user can refine their exploration experience.*

---

#### 6.2.5 Mode × Page-Type Matrix **[Proposed — requires PM + UX sign-off]**

**Why this exists:** v1.0 lists hidden and visible *elements* but never defines what the user sees when a mode hides the page they landed on (e.g., Find Something on the homepage would otherwise be a blank page). Every cell below must be **Show**, **Hide (element list)**, **Redirect (target)**, or **Empty state (content)**.

| Page type | Find Something | Focus & Learn | Catch Up | Explore |
|---|---|---|---|---|
| **Home** (`/`) | Empty state: search bar + short prompt ("Search for what you're looking for") | Empty state: search bar + shortcuts to Playlists and Subscriptions | Redirect → `/feed/subscriptions` | Show |
| **Search** (`/results`) | Show; hide Shorts shelves | Show; hide Shorts shelves | ⚠️ **Open:** hide search bar, or allow search (Open Question #9) | Show; Shorts per toggle |
| **Watch** (`/watch`) | Show player + chapters; hide sidebar, end-screen cards | Show player + chapters + playlist panel; hide sidebar, end-screen cards | Show player; hide sidebar, end-screen cards | Show; autoplay per toggle |
| **Playlist** (`/playlist`) | Show | Show | Show (Watch Later and others) | Show |
| **Channel** (`/@…`, `/channel/…`) | Show; hide Shorts tab | Show; hide Shorts tab | Show; hide Shorts tab | Show; Shorts tab per toggle |
| **Shorts** (`/shorts/<id>`) | Redirect → standard watch page for the same video ID | Redirect → watch page | Redirect → watch page | Per Shorts toggle |
| **Subscriptions** (`/feed/subscriptions`) | ⚠️ **Open:** show or redirect to Home empty state | Show | Show | Show |
| **History / Library** (`/feed/history`, `/feed/library`) | ⚠️ **Open** | ⚠️ **Open** | Show Watch Later; ⚠️ **Open** for others | Show |
| **Trending / Explore** | Hide (redirect to Home behavior) | Hide (redirect to Home behavior) | Hide (redirect to Home behavior) | Show |
| **Comments (on Watch)** | ⚠️ **Open** (Open Question #10) | ⚠️ **Open** | ⚠️ **Open** | Show |

*Route guards (redirects) are implemented in the content script based on URL, not CSS (Section 7.6). Shorts also appear in search results, channel tabs, the sidebar navigation, and the homepage; each occurrence needs a hide rule, and the URL guard is the safety net for direct links.*

---

#### 6.2.6 Autoplay Behavior **[Proposed — requires spike validation]**

CSS cannot disable autoplay: it is behavior, not presentation. **[Proposed]** FocusFeed intercepts the end of playback and the resulting navigation, rather than toggling YouTube's own autoplay setting. The toggle may be an account-level setting for signed-in users, which would contradict "fully restored on exit."

- **Find Something / Catch Up:** when a video ends, nothing new plays.
- **Focus & Learn:** the next item in the **current playlist** plays; if the video is not in a playlist, nothing new plays.
- **Explore:** follows the badge toggle.
- **Fallback:** if the spike shows this is not feasible, use the toggle approach with snapshot-and-restore of the prior setting (Open Question #6).

---

### 6.3 Active Mode Badge

While a mode is active, a small, non-intrusive badge must be persistently visible on the YouTube page.

**Requirements:**
- Displays the active mode name (e.g., "Focus & Learn")
- Includes a one-click "Exit Mode" action
- Must not obstruct any YouTube playback or core UI controls
- Must be draggable or anchored in a non-obstructive corner (TBD in design phase)
- Must be visible/usable in YouTube fullscreen and theater modes, or explicitly hidden there by design *(verify behavior; Open Question #11)*
- Explore mode: hosts the Shorts and Autoplay toggles.

### 6.4 Extension Popup (Toolbar Icon)

Clicking the FocusFeed icon in the Chrome toolbar should open a simple popup.

**Requirements:**
- Displays the active mode of the focused YouTube tab (or "No Mode Active" / "No YouTube tab active" per Section 5.3)
- Allows the user to switch or exit the mode of the focused YouTube tab
- Links to Settings
- Clean, minimal UI
- Runs as a normal extension page, so shadcn/ui works with no shadow-DOM adaptation

### 6.5 Settings

Accessible from the extension popup.

**MVP Settings:**

| Setting | Default | Description |
|---|---|---|
| Show overlay on YouTube load | ON | Toggles whether the intent overlay appears automatically |
| Overlay trigger (All pages / Homepage only) | Homepage only | Controls which YouTube URLs trigger the overlay |
| Explore: remember Shorts/Autoplay toggles | ⚠️ Open (Open Question #2) | Whether Explore toggles persist across sessions |

**Consistency fix:** v1.0 §6.1 said the overlay appears "on every YouTube page load", while the default trigger is "Homepage only." **Resolved:** the overlay appears when the loaded URL matches the trigger setting, default homepage only. Consequence to acknowledge: a user who arrives via a direct video link will not see the overlay unless "All pages" is selected. This is intended.

Settings are stored in `chrome.storage.local` with a **schema version** field to support future migrations.

### 6.6 First-Run Onboarding **[New]**

v1.0 did not define what happens on install. Minimum MVP:
- On install, open a short onboarding page (opened by the service worker on `runtime.onInstalled`) explaining the four modes and that no data is collected.
- Already-open YouTube tabs are not changed until reload (or, if the `scripting` permission is retained for this purpose, the content script may be injected into open tabs — see Section 7.9).

---

## 7. Technical Architecture

### 7.1 Stack

| Layer | Technology |
|---|---|
| UI (Popup, Settings & Overlay) | React + TypeScript |
| Component library | shadcn/ui (Radix + Tailwind), adapted for Shadow DOM (7.7) |
| Build Tool | Vite, with WXT or CRXJS *(evaluate; check current maintenance status)* |
| Extension Manifest | Manifest V3 |
| Background | MV3 Service Worker (install and onboarding only, 7.10) |
| Content Script | Vanilla TS, kept minimal: mode attribute, navigation listener, route guards, behavior controllers |
| Persistence | `chrome.storage.local` for settings only; per-tab mode state per 7.2 |
| CSS | Two separate outputs: `mode-rules.css` (page-level) and `ui.css` (shadow-root only) |

### 7.2 State Model

| State | Scope | Storage |
|---|---|---|
| Active mode | Per tab; survives reload, dies with the tab | Tab's own `sessionStorage` **[Proposed]** (synchronous, so no flash on reload) |
| Explore toggles | Per tab, or persisted (Open Question #2) | Same as active mode, or `chrome.storage.local` |
| Settings | Global | `chrome.storage.local`, with a schema version |

- `sessionStorage` is readable by YouTube's own scripts, so it holds only a mode name. Duplicated tabs copy it, so a per-tab token is used to tell a duplicate (does not inherit) from an inherited tab.
- **New-tab inheritance:** first try the browser's `sessionStorage` copy for tabs opened from a page *(verify; I believe `noopener` links do not get the copy)*. Fallback: on link activation in a moded tab, write a short-lived record (mode name, target URL, timestamp) to `chrome.storage.local`; the new tab consumes and deletes it if the URL matches and it is only seconds old. The record holds no personal data.
- `chrome.storage.session` keyed by tab ID is an alternative; content-script access needs `setAccessLevel` and reads are async *(verify)*.

### 7.3 CSS Architecture (replaces per-mode `<style>` injection)

**[Proposed]** One static stylesheet, switched by an attribute on `<html>`:

```css
html[data-focusfeed-mode="find"] ytd-rich-grid-renderer { display: none !important; }
```

- Mode switching and exit are a single attribute change: instant, testable, and easy to diff when YouTube changes.
- `mode-rules.css` is declared in the manifest with `run_at: "document_start"` to avoid a flash of unfiltered content.
- `mode-rules.css` contains **only** the hide rules. The Tailwind/shadcn bundle must never be injected into the page: its resets would break YouTube.

### 7.4 SPA Navigation Detection

- **Primary signal:** YouTube's custom navigation events, e.g. `yt-navigate-finish` *(verify: undocumented but widely used)*, plus `popstate` for back/forward.
- **Fallback:** a narrow, throttled `MutationObserver` for behavioral logic only. CSS hiding needs no observer.

### 7.5 Selector Strategy

- Prefer custom element tag names (e.g. `ytd-rich-grid-renderer`) and stable `id`s *(verify against the live site)*.
- Avoid `aria-label` selectors: they are **localized** and fail for users with YouTube in Hindi, Tamil, and other languages.
- YouTube runs A/B layout experiments; test more than one layout variant.
- Keep all selectors in one central module.

### 7.6 Behavioral Controllers and Route Guards

- **Route guards:** redirect `/shorts/<id>` and Home/Trending per the matrix (6.2.5). URL-based, not CSS.
- **Autoplay controller:** per 6.2.6.
- All controllers start on mode start and stop on mode exit, so exit fully restores YouTube.

### 7.7 Frontend: shadcn/ui in a Shadow DOM

The overlay and badge run inside a shadow root on a page FocusFeed does not control. shadcn/ui assumes a normal page, so these requirements apply (each confirmed in the spike):

| Issue | Requirement |
|---|---|
| Radix portals (Dialog, Popover, Tooltip, Select) render into `document.body`, outside the shadow root | Modify the copied shadcn wrappers to accept a portal `container`, provided via React context |
| Theme tokens are defined on `:root` | Define them on `:root, :host` in the overlay bundle |
| Tailwind v4 relies on `@property`, which I believe is not honored in shadow roots *(verify)* | Pin Tailwind v3.4 for the overlay bundle, or hoist those rules to the host document |
| `rem` resolves against YouTube's root font size, not the shadow root | Rem-to-px conversion or explicit sizes on the shadow host *(verify YouTube's root size)* |
| Fonts | System font stack; no network font loading |
| Radix modal locks scroll and sets `aria-hidden` on "outside" content, which is YouTube's DOM | Must clean up completely on close and not affect the player |
| Stacking | Maximum z-index on the shadow host; test against the masthead and fullscreen player |
| Keyboard | Stop key-event propagation at the shadow host so YouTube shortcuts (`k`, `f`, `/`) do not fire |
| Theme sync (6.1) | Follow YouTube's theme attribute on `<html>` *(verify name)*; `prefers-color-scheme` as fallback |
| Trusted Types | YouTube enforces it *(verify)*; no `innerHTML` anywhere, including in libraries |

Popup and Settings run as normal extension pages, where shadcn/ui needs no adaptation.

### 7.8 Bundle Size and Load Path

- The always-loaded content script stays tiny. The badge is a lightweight custom element with no React. The React overlay is lazy-loaded only when needed (this needs `web_accessible_resources`; verify support in the chosen build tool).
- Performance budget: the overlay renders within 1 second (6.1).
- If bundle size or startup time is a problem, evaluate Preact with `preact/compat` (Radix compatibility is unverified).

### 7.9 Permissions Required

| Permission | Status | Justification |
|---|---|---|
| `host_permissions: https://www.youtube.com/*` | Required | Run content scripts on YouTube. Use the specific host, not a wildcard subdomain. |
| `storage` | Required | Persist settings |
| `scripting` | **Likely removable** | Not needed if content scripts are declared statically. Keep only if injecting into tabs already open at install is required. |
| `tabs` | **Likely removable** | Host permission likely already covers URL access and messaging for YouTube tabs *(verify)*; `tabs` adds a broader install warning. |

Each retained permission needs a written justification for the store listing.

### 7.10 Service Worker Role

Limited to install and onboarding (`runtime.onInstalled`) and, if needed, popup-to-tab message routing. It holds no state (MV3 service workers are ephemeral). If no job remains, remove it.

### 7.11 Security

- Validate `sender` on all runtime messages.
- No `innerHTML`; do not expose overlay controls to the page's JavaScript.

### 7.12 Internationalization

- Use `_locales` (`chrome.i18n`) for all UI strings from day one.
- Selectors must be locale-independent (7.5); test with a non-English YouTube UI.

### 7.13 Testing Strategy

- Unit tests for the Mode × Page-type matrix and route guards.
- Playwright E2E with the extension loaded, plus a nightly canary against live YouTube that fails when selectors stop matching.
- Keyboard-only accessibility check and a performance check against the 1-second overlay requirement.

### 7.14 Key Technical Constraints

- **YouTube DOM instability:** selectors will break periodically (see Risks).
- **No Data Collection (MVP):** FocusFeed must not collect, transmit, or log any user data. Nothing leaves the device.
- **No remote code:** MV3 prohibits remotely hosted code.

---

## 8. Out of Scope (Post-MVP Roadmap)

| Feature | Priority | Notes |
|---|---|---|
| Firefox / Edge support | P1 | After Chrome MVP is stable |
| Session time-limit per mode | P1 | "Set a 30-min timer for this session" |
| Opt-in anonymous aggregate telemetry | P1 (if approved) | Required to measure activation rate and retention; needs backend, consent UX, privacy policy update (Open Question #5) |
| Mode usage analytics (local only) | P2 | Weekly summary of time per mode |
| Custom mode builder | P2 | Let users define their own element rules |
| Per-video / per-channel subscription filtering | P2 | Blocked on a reliable, locale-independent way to identify subscribed content |
| AI mode suggestion | P3 | Suggest a mode based on time of day / browsing history |
| Mobile (Android Chrome) | P3 | Significant technical lift |

---

## 9. Open Questions & Decisions Needed

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Which YouTube URLs should trigger the overlay? (Homepage only vs. all youtube.com pages) | PM + UX | **Partially resolved:** default Homepage only, user-configurable (6.5). Confirm default. |
| 2 | Should the Explore mode toggles (Shorts, Autoplay) persist across sessions or reset each time? | PM | **Open** |
| 3 | What is the exact wording for each mode card (title, description, icon)? | PM + Copy | **Open — Pending Figma Design** |
| 4 | How should the overlay behave if the user navigates between YouTube pages mid-session? | PM + Eng | **Proposed resolution:** maintain active mode, do not re-show overlay (5.2). Confirm. |
| 5 | Telemetry: accept MVP without activation/retention metrics, or add opt-in anonymous telemetry (backend, consent, privacy policy)? | PM + Eng + Legal | **Open — blocks metric targets** |
| 6 | Autoplay approach: Option B (intercept playback end) with Option A as fallback? | Eng | **Proposed — validate in spike** |
| 7 | Pause playback behind the overlay? Resume automatically? | PM + UX | **Proposed:** pause, no auto-resume |
| 8 | Esc key on the overlay: behaves as "Skip"? | PM + UX | **Proposed:** yes |
| 9 | Catch Up: is search available? | PM + UX | **Open** |
| 10 | Comments, History/Library, and Subscriptions-in-Find behavior (matrix cells marked Open) | PM + UX | **Open** |
| 11 | Badge behavior in fullscreen / theater mode | UX + Eng | **Open** |
| 12 | Build tooling: WXT vs. CRXJS vs. plain Vite | Eng | **Open — evaluate after spike** |
| 13 | Tailwind version for the overlay bundle (v3.4 vs. v4 with `@property` workaround) | Eng | **Open — decide in spike** |
| 14 | New-tab inheritance mechanism: `sessionStorage` copy vs. `chrome.storage` handoff (7.2) | Eng | **Open — validate in spike** (behavior itself is decided: new tabs from a moded tab inherit) |
| 15 | Should there be a setting to turn inheritance off ("Apply my mode to new YouTube tabs")? | PM + UX | **Open — optional** |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| YouTube updates its DOM structure, breaking selectors | High | High | Stable tag-name selectors; central selector module; nightly canary tests; fast-release process (store review time varies) |
| Chrome Web Store policy change or rejection over content injection | Low | Critical | Follow CWS policies strictly; minimal permissions; single-purpose statement; privacy policy |
| Low overlay-to-mode conversion rate (users just skip) | Medium | Medium | Not measurable without telemetry (Open Question #5); use qualitative feedback; A/B test copy in v1.1 if telemetry is approved |
| Extension conflicts with other YouTube modifiers | Medium | Low | Document known conflicts; test against popular extensions (DF YouTube, SponsorBlock) |
| shadcn/Tailwind/Radix misbehave inside Shadow DOM | High | Medium | Week-1 spike (Section 11); adapted wrappers |
| React bundle slows YouTube page load | Medium | High | Tiny always-loaded script; lazy-loaded overlay; performance budget |
| Autoplay control is unreliable | Medium | High | Spike validation; fallback plan (6.2.6); canary test |
| New-tab inheritance is unreliable or applies a stale mode | Medium | Medium | Short-lived handoff matched by target URL; per-tab token; spike check |

---

## 11. Week-1 Technical Spike (P0)

**Goal:** answer most technical risks in one experiment before committing to the architecture.

Build a minimal extension that mounts a shadcn Dialog with a Select and a Tooltip inside a shadow root on live YouTube, and confirm:

| # | Check | Pass criteria |
|---|---|---|
| 1 | Portals and theme | Dialog, Select, and Tooltip render inside the shadow root with correct styles; light/dark sync works |
| 2 | Tailwind `@property` | Shadows, gradients, and transforms render correctly (decides v3.4 vs. v4) |
| 3 | `rem` sizing and fonts | Matches design on YouTube's real root font size; no network font requests |
| 4 | Scroll lock, `aria-hidden`, stacking | Fully cleaned up on close; player unaffected; correct with masthead and fullscreen |
| 5 | Key event isolation | `k`, `f`, `/` do not trigger YouTube while the overlay is focused |
| 6 | Autoplay control | Prevents non-playlist autoplay and allows in-playlist advance |
| 7 | Navigation events | `yt-navigate-finish` (or fallback) reliably fires on SPA navigation |
| 8 | Flash of content | No visible flash on reload with a mode active |
| 9 | Bundle size and load time | Meets the performance budget; overlay renders within 1 second |
| 10 | Trusted Types | No violations in the console |
| 11 | Build tool | Supports shadow-root UI, HMR, and lazy-loaded chunks |
| 12 | New-tab inheritance | Middle-click, Ctrl/Cmd-click, and "Open in new tab" from a moded tab open with the same mode and no overlay; duplicates and non-YouTube openers start fresh |

---

## 12. Store Compliance & Privacy **[New]**

- Publish a **privacy policy** (even for zero data collection).
- Write a **single-purpose statement** for the store listing.
- Provide a written justification for every permission.
- Ensure no network requests, remote code, or `eval`.
- Plan `_locales` from day one (Section 7.12).

---

*End of Document — FocusFeed PRD v1.1*
