/**
 * FocusFeed: YouTube Selectors Central Module
 * PRD Reference: Section 7.5 (Selector Strategy)
 * - Uses custom element tag names and stable IDs
 * - Avoids localized aria-label selectors
 */

export const SELECTORS = {
  // Page Containers
  homeBrowse: 'ytd-browse[page-subtype="home"]',
  homeContents: 'ytd-browse[page-subtype="home"] #contents.ytd-rich-grid-renderer',
  richGrid: 'ytd-rich-grid-renderer',
  watchFlexy: 'ytd-watch-flexy',
  watchGrid: 'ytd-watch-grid',
  
  // Watch Page Sidebar & Secondary Results
  watchSecondary: '#secondary',
  watchRelated: '#secondary #related',
  watchRelatedContainer: '#related',
  watchSecondaryResults: 'ytd-watch-next-secondary-results-renderer',
  watchPlaylistPanel: '#secondary ytd-playlist-panel-renderer',
  
  // Player Controls & Overlays
  player: '#movie_player',
  videoElement: '#movie_player video',
  endScreenCard: '.ytp-ce-element',
  endScreenContent: '.ytp-endscreen-content',
  
  // Shorts Elements
  shortsReelShelf: 'ytd-reel-shelf-renderer',
  shortsRichShelf: 'ytd-rich-shelf-renderer[is-shorts]',
  shortsGuideEntry: 'ytd-guide-entry-renderer:has(a[href^="/shorts"])',
  shortsMiniGuideEntry: 'ytd-mini-guide-entry-renderer:has(a[href^="/shorts"])',
  shortsChannelTab: 'yt-tab-shape[tab-title*="Shorts"]',
  
  // Search
  searchBox: 'input#search',
  searchResults: 'ytd-search',
  
  // Navigation & Shell
  masthead: '#masthead-container',
  contentContainer: '#content',
} as const;
