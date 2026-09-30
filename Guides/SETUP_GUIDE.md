# FocusFeed — Setup, Run & Testing Guide

This guide covers everything required to set up the development environment, build the extension, load it into Chrome, and thoroughly test all features on YouTube.

---

## 1. Prerequisites

Before getting started, ensure you have the following installed:
- **Node.js**: v18.0.0 or higher ([nodejs.org](https://nodejs.org))
- **npm**: v9.0.0 or higher
- **Google Chrome** (or any Chromium-based browser like Brave, Arc, Edge)

Check your versions in PowerShell / Command Prompt:
```bash
node -v
npm -v
```

---

## 2. Project Installation & Setup

1. **Clone or open the project folder**:
   ```bash
   cd "d:\Google-UX\Product anatomy\-3-States-of-mind---FocusFeed-Product-Anatomy-C1"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   FocusFeed adheres strictly to Chrome MV3 standards with zero remote data collection or telemetry. The project includes [.env.example](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/.env.example) and [.env](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/.env) files for build target definitions. No external API keys are required.

---

## 3. Building the Extension

To build the extension bundle for Chrome:

```bash
npm run build
```

This compiles TypeScript (`tsc`) and bundles React components, CSS, and manifest into the [`dist/`](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/dist) folder.

### Continuous Watch Mode (Recommended for Development)
To automatically re-bundle files whenever you make edits to code in `src/`:
```bash
npx vite build --watch
```

---

## 4. Loading the Extension into Chrome

Follow these steps to load the unpacked extension:

1. Open **Google Chrome**.
2. Navigate to:
   ```text
   chrome://extensions
   ```
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. Click the **Load unpacked** button in the top-left toolbar.
5. In the file picker, select the **`dist`** folder inside this project:
   ```text
   d:\Google-UX\Product anatomy\-3-States-of-mind---FocusFeed-Product-Anatomy-C1\dist
   ```
6. **FocusFeed** will appear in your extension list.
7. Click the **Puzzle Piece (Extensions)** icon in your Chrome toolbar and **Pin** FocusFeed for quick access.

---

## 5. How to Test the Extension on YouTube

FocusFeed introduces an *intent layer* on desktop YouTube ([PRD](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/PRD/FocusFeed_PRD_v1.1.md)) with 3+1 states of mind:

### A. Intent Overlay (First Visit / New Session)
1. Open a new tab and go to [https://www.youtube.com](https://www.youtube.com).
2. The **Intent Overlay** modal appears on top of YouTube asking: *"What are you here for today?"*
3. You can select one of the 4 modes:
   - 🔍 **Find Something Specific (`find`)**: Disables home recommendations, opens a clean search prompt, and sets `data-focusfeed-mode="find"`.
   - 🎯 **Focus & Learn (`focus`)**: Shields sidebar recommendations, disables autoplay off-playlist, hides comment feeds and Shorts.
   - 📺 **Catch Up on Subscriptions (`catchup`)**: Redirects you to `/feed/subscriptions` and blocks distracting algorithmic homepage content.
   - 🌐 **Just Browsing (`explore`)**: Dismisses the intent layer and restores native YouTube.
4. Pressing `Escape` or clicking outside dismisses the overlay for the current session.

### B. Persistent Mode Badge & Quick Mode Switching
1. Once a mode (e.g. **Focus & Learn**) is active:
   - Look at the bottom-right corner of the YouTube page: a floating **pill badge** indicates your active mode.
   - Click the badge to toggle modes or exit back to standard YouTube.
2. Open Chrome DevTools (`F12`) on YouTube to inspect:
   ```html
   <html data-focusfeed-mode="focus">
   ```
   Notice that [public/mode-rules.css](file:///d:/Google-UX/Product%20anatomy/-3-States-of-mind---FocusFeed-Product-Anatomy-C1/public/mode-rules.css) applies the appropriate styling rules without blocking DOM nodes.

### C. Extension Popup
1. Click the **FocusFeed icon** in your Chrome toolbar.
2. The popup opens with an active mode indicator and the 4 mode cards.
3. Clicking any mode applies it instantly to the active YouTube tab and syncs across the session.
4. Clicking **Exit Active Mode** returns YouTube to standard behavior.

### D. Settings & Onboarding Pages
1. Right-click the FocusFeed icon and select **Options** (or click the Settings gear icon in the popup):
   - Opens `src/settings/index.html` to configure trigger rules and defaults.
2. Directly visit the onboarding walkthrough:
   - Paste `chrome-extension://<EXTENSION_ID>/src/onboarding/index.html` into your Chrome address bar (replace `<EXTENSION_ID>` with your extension's ID from `chrome://extensions`).

---

## 6. Automated Testing & Verification

Run the automated Vitest test suite and TypeScript validation before committing:

```bash
# Run all unit tests (mode matrix, route guards, state rules)
npm run test

# Run vitest in interactive watch mode
npx vitest

# Validate TypeScript typings
npm run typecheck
```

---

## 7. Development Iteration Workflow

When you modify code in `src/`:

1. Keep `npx vite build --watch` running in your terminal.
2. After saving changes, open `chrome://extensions/`.
3. Click the **Reload (circular arrow)** button on the FocusFeed card.
4. Refresh your YouTube tab (`Ctrl + R` or `F5`) to load the newly built scripts and styles.
