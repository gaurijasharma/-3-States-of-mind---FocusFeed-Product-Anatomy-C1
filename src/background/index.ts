/**
 * FocusFeed: Background Service Worker (MV3)
 * PRD Reference: Section 6.6 (Onboarding) & Section 7.10 (Service Worker Role)
 */

import { DEFAULT_SETTINGS } from '../types';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // Initialize default settings in chrome.storage.local
    chrome.storage.local.set({ settings: DEFAULT_SETTINGS }, () => {
      // Open onboarding page on first install
      const onboardingUrl = chrome.runtime.getURL('src/onboarding/index.html');
      chrome.tabs.create({ url: onboardingUrl });
    });
  }

  // Inject content script into any already-open YouTube tabs on install/update (PRD 7.9)
  try {
    const tabs = await chrome.tabs.query({ url: ['*://*.youtube.com/*', '*://youtube.com/*'] });
    for (const tab of tabs) {
      if (tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/index.js'],
        }).catch(() => {});

        chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['mode-rules.css'],
        }).catch(() => {});
      }
    }
  } catch {
    // Ignore permissions or inactive tab errors
  }
});

// Clean up stored tab mode when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove([`tab_mode_${tabId}`]).catch(() => {});
});

// Listener for tab communication
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ status: 'PONG' });
  }
  return true;
});
