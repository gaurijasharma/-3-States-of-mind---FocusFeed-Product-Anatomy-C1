/**
 * FocusFeed: Content Script (MV3)
 * PRD Reference: Section 5, 6, 7
 * Runs on YouTube (desktop web)
 */

import { FocusMode, FocusFeedSettings, DEFAULT_SETTINGS } from '../types';
import { getYouTubePageType, evaluateRouteRule } from './modeMatrix';
import { OverlayComponent } from './overlayComponent';
import { BadgeComponent } from './badgeComponent';
import { EmptyStateComponent } from './emptyStateComponent';

const STORAGE_KEY_MODE = 'focusfeed_active_mode';
const STORAGE_KEY_DISMISSED = 'focusfeed_session_dismissed';

class FocusFeedContentScript {
  private activeMode: FocusMode = null;
  private settings: FocusFeedSettings = DEFAULT_SETTINGS;
  private shortsEnabled: boolean = true;
  private autoplayEnabled: boolean = true;

  private shadowHost: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;

  private overlayComp = new OverlayComponent();
  private badgeComp = new BadgeComponent();
  private emptyStateComp = new EmptyStateComponent();

  private videoListenerAttached: boolean = false;

  constructor() {
    // 1. Immediately setup message & storage listeners so they're active from tick 0
    this.setupMessageListener();
    this.setupStorageListener();

    // 2. Restore mode before DOM finishes to prevent Flash of Unfiltered Content (FOC)
    this.restoreSessionMode();
  }

  public init() {
    this.loadSettings();
    this.attachNavigationListeners();
    this.attachThemeObserver();
    this.attachAutoplayController();

    this.ensureShadowHost();
    this.evaluateCurrentPage();
    this.checkAndMountUI();
  }

  /**
   * Extension messaging listener to communicate with Popup (PRD 6.4)
   * Active immediately from constructor
   */
  private setupMessageListener() {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.onMessage) {
      return;
    }

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!message || !message.type) return;

      switch (message.type) {
        case 'GET_MODE':
          sendResponse({
            mode: this.activeMode,
            shortsEnabled: this.shortsEnabled,
            autoplayEnabled: this.autoplayEnabled,
          });
          break;

        case 'SET_MODE':
          this.setMode(message.mode);
          sendResponse({ success: true, mode: this.activeMode });
          break;

        case 'CLEAR_MODE':
          this.setMode(null);
          sendResponse({ success: true, mode: null });
          break;

        case 'TOGGLE_SHORTS':
          this.shortsEnabled = !this.shortsEnabled;
          this.updateComponents();
          sendResponse({ shortsEnabled: this.shortsEnabled });
          break;

        case 'TOGGLE_AUTOPLAY':
          this.autoplayEnabled = !this.autoplayEnabled;
          this.updateComponents();
          sendResponse({ autoplayEnabled: this.autoplayEnabled });
          break;

        case 'PING':
          sendResponse({ status: 'PONG' });
          break;

        default:
          break;
      }
      return false; // Synchronous response
    });
  }

  /**
   * Listen for mode changes in chrome.storage.local from popup or background
   */
  private setupStorageListener() {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.onChanged) {
      return;
    }

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        let needsUpdate = false;

        for (const key of Object.keys(changes)) {
          // Mode change from popup
          if (key.startsWith('tab_mode_')) {
            const newMode = changes[key].newValue as FocusMode;
            if (newMode !== this.activeMode) {
              this.setMode(newMode, true);
            }
          }

          // Shorts toggle changed (from popup OR badge)
          if (key === 'ff_explore_shorts') {
            const newVal = changes[key].newValue as boolean;
            if (newVal !== this.shortsEnabled) {
              this.shortsEnabled = newVal;
              needsUpdate = true;
            }
          }

          // Autoplay toggle changed (from popup OR badge)
          if (key === 'ff_explore_autoplay') {
            const newVal = changes[key].newValue as boolean;
            if (newVal !== this.autoplayEnabled) {
              this.autoplayEnabled = newVal;
              needsUpdate = true;
            }
          }
        }

        if (needsUpdate) {
          this.updateComponents();
        }
      }
    });
  }

  /**
   * Load user settings from chrome.storage.local (PRD 6.5)
   */
  private loadSettings() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['settings'], (res) => {
          if (res && res.settings) {
            this.settings = { ...DEFAULT_SETTINGS, ...res.settings };
            this.shortsEnabled = this.settings.exploreShortsEnabled;
            this.autoplayEnabled = this.settings.exploreAutoplayEnabled;
            this.checkAndMountUI();
          }
        });
      }
    } catch {
      // Storage unavailable, fallback to default settings
    }
  }

  /**
   * Restore active mode from sessionStorage (per-tab state, survives reload)
   */
  private restoreSessionMode() {
    try {
      const savedMode = sessionStorage.getItem(STORAGE_KEY_MODE) as FocusMode;
      if (savedMode && ['find', 'focus', 'catchup', 'explore'].includes(savedMode)) {
        this.setMode(savedMode, false);
      }
    } catch {
      // Ignore sessionStorage access errors
    }
  }

  /**
   * Sets or clears the active mode attribute on <html>
   */
  public setMode(mode: FocusMode, persist: boolean = true) {
    this.activeMode = mode;
    const root = document.documentElement;

    if (mode) {
      root.setAttribute('data-focusfeed-mode', mode);
      if (persist) {
        try {
          sessionStorage.setItem(STORAGE_KEY_MODE, mode);
        } catch {}
      }
    } else {
      root.removeAttribute('data-focusfeed-mode');
      if (persist) {
        try {
          sessionStorage.removeItem(STORAGE_KEY_MODE);
        } catch {}
      }
    }

    // Dismiss overlay once mode is set
    this.overlayComp.destroy();

    // Re-evaluate page guard and render UI components
    this.evaluateCurrentPage();
    this.updateComponents();
  }

  /**
   * Dismiss the overlay for the current session (tab lifetime)
   */
  public dismissOverlay() {
    try {
      sessionStorage.setItem(STORAGE_KEY_DISMISSED, 'true');
    } catch {
      // Ignore
    }
    this.overlayComp.destroy();
  }

  /**
   * Ensure Shadow DOM host is present and has ui.css injected (PRD 7.7)
   * Safely guards against document.body being null at document_start
   */
  private ensureShadowHost(): ShadowRoot | null {
    if (!document.body) {
      return null;
    }

    if (this.shadowRoot && this.shadowHost && document.body.contains(this.shadowHost)) {
      return this.shadowRoot;
    }

    let host = document.getElementById('focusfeed-overlay-host') as HTMLElement;
    if (!host) {
      host = document.createElement('div');
      host.id = 'focusfeed-overlay-host';
      host.style.position = 'relative';
      host.style.zIndex = '2147483647';
      document.body.appendChild(host);
    }

    this.shadowHost = host;
    if (!host.shadowRoot) {
      this.shadowRoot = host.attachShadow({ mode: 'open' });
    } else {
      this.shadowRoot = host.shadowRoot;
    }

    // Inject ui.css into shadow root if not already present
    if (!this.shadowRoot.querySelector('link[rel="stylesheet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('ui.css');
      this.shadowRoot.appendChild(link);
    }

    return this.shadowRoot;
  }

  /**
   * Update active UI components based on mode and page type
   */
  private updateComponents() {
    const shadow = this.ensureShadowHost();
    if (!shadow) {
      // Body not ready yet, will be called on DOMContentLoaded
      return;
    }

    const pageType = getYouTubePageType(window.location.pathname);

    // Synchronize explore shorts toggle attribute
    if (this.activeMode === 'explore' && !this.shortsEnabled) {
      document.documentElement.setAttribute('data-focusfeed-shorts', 'off');
    } else {
      document.documentElement.removeAttribute('data-focusfeed-shorts');
    }

    // 1. Mode Badge
    if (this.activeMode) {
      this.badgeComp.render(
        shadow,
        {
          mode: this.activeMode,
          shortsEnabled: this.shortsEnabled,
          autoplayEnabled: this.autoplayEnabled,
        },
        {
          onExit: () => this.setMode(null),
          onToggleShorts: () => {
            const next = !this.shortsEnabled;
            this.shortsEnabled = next;
            // Save to storage → popup will react via storage.onChanged
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
              chrome.storage.local.set({ ff_explore_shorts: next });
            }
            this.updateComponents();
          },
          onToggleAutoplay: () => {
            const next = !this.autoplayEnabled;
            this.autoplayEnabled = next;
            // Save to storage → popup will react via storage.onChanged
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
              chrome.storage.local.set({ ff_explore_autoplay: next });
            }
            this.updateComponents();
          },
        }
      );
    } else {
      this.badgeComp.destroy();
    }

    // 2. Empty State on Home
    if (pageType === 'home' && (this.activeMode === 'find' || this.activeMode === 'focus')) {
      this.emptyStateComp.render(shadow, this.activeMode);
    } else {
      this.emptyStateComp.destroy();
    }
  }

  /**
   * Check trigger setting and mount Intent Overlay if appropriate
   */
  private checkAndMountUI() {
    const isDismissed = sessionStorage.getItem(STORAGE_KEY_DISMISSED) === 'true';

    // If already in a mode or dismissed or overlay setting disabled, skip overlay
    if (this.activeMode || isDismissed || !this.settings.showOverlayOnLoad) {
      this.updateComponents();
      return;
    }

    const pageType = getYouTubePageType(window.location.pathname);
    const trigger = this.settings.overlayTrigger;

    const shouldShow = trigger === 'all_pages' || pageType === 'home';
    if (shouldShow) {
      const shadow = this.ensureShadowHost();
      if (shadow) {
        this.overlayComp.render(shadow, {
          onSelectMode: (mode) => this.setMode(mode),
          onDismiss: () => this.dismissOverlay(),
        });
      }
    }

    this.updateComponents();
  }

  /**
   * Listen for YouTube's SPA navigation events (PRD 7.4)
   */
  private attachNavigationListeners() {
    window.addEventListener('yt-navigate-finish', () => {
      this.evaluateCurrentPage();
      this.updateComponents();
    });

    window.addEventListener('popstate', () => {
      this.evaluateCurrentPage();
      this.updateComponents();
    });

    // Fallback URL poller for SPAs
    let lastUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        this.evaluateCurrentPage();
        this.updateComponents();
      }
    }, 500);
  }

  /**
   * Synchronize dark mode class with YouTube's theme attribute
   */
  private attachThemeObserver() {
    const observer = new MutationObserver(() => {
      // Re-render UI to update theme colors
      if (this.activeMode) {
        this.updateComponents();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dark', 'data-theme'],
    });
  }

  /**
   * Apply route guards per Mode x Page-type matrix (PRD 6.2.5 & 7.6)
   */
  private evaluateCurrentPage() {
    const pageType = getYouTubePageType(window.location.pathname);
    const rule = evaluateRouteRule(this.activeMode, pageType, window.location.pathname);

    if (rule.action === 'redirect' && rule.target) {
      if (window.location.pathname !== rule.target) {
        window.location.replace(rule.target);
      }
    }
  }

  /**
   * Intercept video playback completion per PRD Section 6.2.6 (Autoplay behavior)
   */
  private attachAutoplayController() {
    if (this.videoListenerAttached) return;
    this.videoListenerAttached = true;

    const handleVideoEnd = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      if (!video) return;

      if (!this.activeMode) return;

      // Mode 1: Find Something — Autoplay disabled
      // Mode 3: Catch Up — Autoplay disabled
      if (this.activeMode === 'find' || this.activeMode === 'catchup') {
        video.pause();
        return;
      }

      // Mode 2: Focus & Learn — Autoplay kept inside playlist only
      if (this.activeMode === 'focus') {
        const hasPlaylist = window.location.search.includes('list=');
        if (!hasPlaylist) {
          video.pause();
        }
        return;
      }

      // Mode 4: Explore — Follows toggle
      if (this.activeMode === 'explore' && !this.autoplayEnabled) {
        video.pause();
      }
    };

    document.addEventListener('ended', handleVideoEnd, true);
  }
}

// Instantiate and initialize
const instance = new FocusFeedContentScript();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => instance.init());
} else {
  instance.init();
}
