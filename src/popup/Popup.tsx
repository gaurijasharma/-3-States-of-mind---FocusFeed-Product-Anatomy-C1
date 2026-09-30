import React, { useEffect, useState } from 'react';
import { FocusMode } from '../types';
import '../styles/popup.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModeDetail {
  intent: string;
  visibleTitle: string;
  visible: string[];
  hidden: string[];
  hasOptionalControls: boolean;
}

// ─── Mode Data ────────────────────────────────────────────────────────────────

const MODE_NAMES: Record<NonNullable<FocusMode>, string> = {
  find: 'Find Something',
  focus: 'Focus & Learn',
  catchup: 'Catch Up',
  explore: 'Explore',
};

const MODE_DETAILS: Record<NonNullable<FocusMode>, ModeDetail> = {
  find: {
    intent: "I know what I'm looking for.",
    visibleTitle: 'Shown',
    visible: ['Search', 'Search results', 'Channels', 'Playlists', 'Current video'],
    hidden: ['Homepage recommendations', 'Shorts', 'Related videos', 'Autoplay', 'End-screen recommendations'],
    hasOptionalControls: false,
  },
  focus: {
    intent: 'I want to learn something.',
    visibleTitle: 'Prioritized',
    visible: ['Search', 'Subscriptions', 'Playlists', 'Long-form videos', 'Current video', 'Chapters'],
    hidden: ['Shorts', 'Homepage recommendations', 'Autoplay', 'Related videos', 'End-screen recommendations'],
    hasOptionalControls: false,
  },
  catchup: {
    intent: 'I want to see what creators I follow have posted.',
    visibleTitle: 'Prioritized',
    visible: ['Subscriptions', 'Followed channels', 'New uploads', 'Watch Later'],
    hidden: ['Generic recommendations', 'Trending', 'Shorts', 'Unrelated discovery'],
    hasOptionalControls: false,
  },
  explore: {
    intent: 'I intentionally want to browse.',
    visibleTitle: 'Allowed',
    visible: ['Recommendations', 'Search', 'Related videos', 'Subscriptions', 'Discovery'],
    hidden: ['Shorts (Optional)', 'Autoplay (Optional)'],
    hasOptionalControls: true,
  },
};

const MODES: { id: NonNullable<FocusMode>; desc: string }[] = [
  { id: 'find',    desc: 'Search & watch one video' },
  { id: 'focus',   desc: 'Tutorials & playlist autoplay' },
  { id: 'catchup', desc: 'Subscriptions only' },
  { id: 'explore', desc: 'Curated browsing' },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconPlay = () => (
  <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
);

const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconExternalLink = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" width="14" height="14" stroke="currentColor">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// Mode-specific icons
const ModeIcon = ({ id }: { id: NonNullable<FocusMode> }) => {
  switch (id) {
    case 'find':
      return (
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case 'focus':
      return (
        <svg viewBox="0 0 24 24">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case 'catchup':
      return (
        <svg viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'explore':
      return (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      );
  }
};

// ─── Chrome API Helpers ───────────────────────────────────────────────────────

const hasChromeAPI = () =>
  typeof chrome !== 'undefined' && !!chrome.tabs && !!chrome.runtime;

function sendModeToTab(tabId: number, mode: FocusMode) {
  if (!hasChromeAPI()) return;
  chrome.tabs.sendMessage(tabId, { type: 'SET_MODE', mode }, () => {
    if (chrome.runtime.lastError && chrome.scripting) {
      chrome.scripting
        .executeScript({ target: { tabId }, files: ['content/index.js'] })
        .then(() => {
          chrome.scripting
            .insertCSS({ target: { tabId }, files: ['mode-rules.css'] })
            .catch(() => {});
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { type: 'SET_MODE', mode });
          }, 100);
        })
        .catch(() => {});
    }
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const Popup: React.FC = () => {
  const [isOn, setIsOn] = useState<boolean>(true);
  const [activeMode, setActiveMode] = useState<NonNullable<FocusMode>>('focus');
  const [isYouTubeTab, setIsYouTubeTab] = useState<boolean>(true);
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState<boolean>(true);
  const [shortsEnabled, setShortsEnabled] = useState<boolean>(true);
  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(true);

  // ── On mount: detect tab + restore state ──────────────────────────────────
  useEffect(() => {
    if (!hasChromeAPI()) {
      // Dev fallback — no real chrome environment
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id) {
        setIsYouTubeTab(false);
        return;
      }

      setCurrentTabId(tab.id);
      const isYt = Boolean(tab.url && tab.url.includes('youtube.com'));
      setIsYouTubeTab(isYt);

      if (!isYt) return;

      const tabKey = `tab_mode_${tab.id}`;
      const globalKey = 'ff_global_on';

      // Restore global ON/OFF + active mode from storage
      if (chrome.storage?.local) {
        chrome.storage.local.get([tabKey, globalKey, 'ff_explore_shorts', 'ff_explore_autoplay'], (res) => {
          if (res[globalKey] !== undefined) setIsOn(res[globalKey]);
          if (res[tabKey]) setActiveMode(res[tabKey] as NonNullable<FocusMode>);
          if (res['ff_explore_shorts'] !== undefined) setShortsEnabled(res['ff_explore_shorts']);
          if (res['ff_explore_autoplay'] !== undefined) setAutoplayEnabled(res['ff_explore_autoplay']);
        });
      }

      // Also try pinging content script for live mode
      chrome.tabs.sendMessage(tab.id, { type: 'GET_MODE' }, (res) => {
        if (!chrome.runtime.lastError && res?.mode != null) {
          setActiveMode(res.mode as NonNullable<FocusMode>);
        }
      });
    });

    // ── Listen for storage changes from badge (bidirectional sync) ──────────
    if (chrome.storage?.onChanged) {
      const handler = (
        changes: Record<string, chrome.storage.StorageChange>,
        area: string
      ) => {
        if (area !== 'local') return;
        if (changes['ff_explore_shorts'] !== undefined) {
          setShortsEnabled(changes['ff_explore_shorts'].newValue as boolean);
        }
        if (changes['ff_explore_autoplay'] !== undefined) {
          setAutoplayEnabled(changes['ff_explore_autoplay'].newValue as boolean);
        }
        if (changes['ff_global_on'] !== undefined) {
          setIsOn(changes['ff_global_on'].newValue as boolean);
        }
      };
      chrome.storage.onChanged.addListener(handler);
      // Cleanup when popup unmounts
      return () => chrome.storage.onChanged.removeListener(handler);
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleMaster = () => {
    const next = !isOn;
    setIsOn(next);
    if (hasChromeAPI() && chrome.storage?.local) {
      chrome.storage.local.set({ ff_global_on: next });
    }
    if (currentTabId) {
      sendModeToTab(currentTabId, next ? activeMode : null);
    }
  };

  const handleSelectMode = (mode: NonNullable<FocusMode>) => {
    setActiveMode(mode);
    setIsOn(true);

    if (hasChromeAPI() && currentTabId) {
      const tabKey = `tab_mode_${currentTabId}`;
      if (chrome.storage?.local) {
        chrome.storage.local.set({ [tabKey]: mode, ff_global_on: true });
      }
      sendModeToTab(currentTabId, mode);
    }
  };

  const toggleShorts = () => {
    const next = !shortsEnabled;
    setShortsEnabled(next);
    if (hasChromeAPI() && chrome.storage?.local) {
      chrome.storage.local.set({ ff_explore_shorts: next });
    }
  };

  const toggleAutoplay = () => {
    const next = !autoplayEnabled;
    setAutoplayEnabled(next);
    if (hasChromeAPI() && chrome.storage?.local) {
      chrome.storage.local.set({ ff_explore_autoplay: next });
    }
  };

  const openSettings = () => {
    if (hasChromeAPI()) {
      chrome.runtime.openOptionsPage();
    }
  };

  const openYouTube = () => {
    if (hasChromeAPI()) {
      chrome.tabs.create({ url: 'https://www.youtube.com' });
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const currentDetail = MODE_DETAILS[activeMode];
  const masterStatusText = isOn
    ? `ON — ${MODE_NAMES[activeMode]}`
    : 'OFF — Normal YouTube Feed';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="popup-root">

      {/* ── HEADER ── */}
      <header className="popup-header">
        <div className="brand-box">
          <div className="brand-icon">
            <IconPlay />
          </div>
          <div className="brand-titles">
            <h1>FocusFeed</h1>
            <span>Intent Layer</span>
          </div>
        </div>
        <button
          className="settings-btn"
          title="Settings"
          onClick={openSettings}
          aria-label="Open Settings"
        >
          <IconSettings />
        </button>
      </header>

      {/* ── NOT YOUTUBE STATE ── */}
      {!isYouTubeTab ? (
        <div className="not-youtube-state">
          <p>No YouTube tab is currently open.<br />Open YouTube to use FocusFeed.</p>
          <button className="open-yt-btn" onClick={openYouTube}>
            Open YouTube <IconExternalLink />
          </button>
        </div>
      ) : (
        <>
          {/* ── MASTER TOGGLE ── */}
          <div className={`master-toggle-row${isOn ? ' is-on' : ''}`}>
            <div className="master-label-group">
              <div className="master-title">
                <span className="status-badge-dot" />
                <span>Extension Mode</span>
              </div>
              <span className="master-status-text">{masterStatusText}</span>
            </div>
            <button
              className={`switch-btn${isOn ? ' is-on' : ''}`}
              onClick={toggleMaster}
              aria-label={isOn ? 'Turn FocusFeed off' : 'Turn FocusFeed on'}
              aria-pressed={isOn}
            >
              <div className="switch-knob" />
            </button>
          </div>

          {/* ── MODE GRID ── */}
          <div className="section-heading">Select Intent Mode</div>
          <div className="modes-grid">
            {MODES.map(({ id, desc }) => (
              <button
                key={id}
                className={`mode-item${isOn && activeMode === id ? ' active' : ''}`}
                onClick={() => handleSelectMode(id)}
                aria-pressed={isOn && activeMode === id}
                aria-label={`Select ${MODE_NAMES[id]} mode`}
              >
                <div className="mode-header">
                  <ModeIcon id={id} />
                  <span className="mode-title">{MODE_NAMES[id]}</span>
                </div>
                <p className="mode-desc">{desc}</p>
              </button>
            ))}
          </div>

          {/* ── MODE SUMMARY CARD ── */}
          {isOn && (
            <div className="mode-summary-card">
              <div
                className="summary-header"
                onClick={() => setSummaryExpanded((v) => !v)}
                role="button"
                aria-expanded={summaryExpanded}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSummaryExpanded((v) => !v)}
              >
                <div className="summary-title-group">
                  <span className="summary-badge">Intent</span>
                  <span className="summary-intent-text">{currentDetail.intent}</span>
                </div>
                <button
                  className={`summary-toggle-btn${summaryExpanded ? ' open' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setSummaryExpanded((v) => !v); }}
                  aria-label="Toggle details"
                >
                  <span>Details</span>
                  <IconChevronDown />
                </button>
              </div>

              <div className={`summary-body${summaryExpanded ? '' : ' collapsed'}`}>
                <div className="summary-cols">
                  {/* Visible / Prioritized */}
                  <div className="summary-col">
                    <div className="col-heading visible-heading">
                      <IconCheck />
                      <span>{currentDetail.visibleTitle}</span>
                    </div>
                    <ul className="summary-list visible-list">
                      {currentDetail.visible.map((item) => (
                        <li key={item}>
                          <span className="bullet-icon">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Hidden */}
                  <div className="summary-col">
                    <div className="col-heading hidden-heading">
                      <IconX />
                      <span>Hidden</span>
                    </div>
                    <ul className="summary-list hidden-list">
                      {currentDetail.hidden.map((item) => (
                        <li key={item}>
                          <span className="bullet-icon">✕</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Optional controls for Explore mode */}
                {currentDetail.hasOptionalControls && (
                  <div className="optional-controls-row">
                    <div className="opt-control">
                      <span className="opt-label">Shorts</span>
                      <button
                        className={`switch-btn sm${shortsEnabled ? ' is-on' : ''}`}
                        onClick={toggleShorts}
                        aria-pressed={shortsEnabled}
                        aria-label="Toggle Shorts"
                      >
                        <div className="switch-knob" />
                      </button>
                    </div>
                    <div className="opt-control">
                      <span className="opt-label">Autoplay</span>
                      <button
                        className={`switch-btn sm${autoplayEnabled ? ' is-on' : ''}`}
                        onClick={toggleAutoplay}
                        aria-pressed={autoplayEnabled}
                        aria-label="Toggle Autoplay"
                      >
                        <div className="switch-knob" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── FOOTER ── */}
      <footer className="popup-footer">
        <span className="privacy-tag">Zero data collected</span>
        <span>v1.0.0</span>
      </footer>
    </div>
  );
};
