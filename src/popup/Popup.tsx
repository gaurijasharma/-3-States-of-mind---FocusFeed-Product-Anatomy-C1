import React, { useEffect, useState } from 'react';
import { FocusMode } from '../types';
import { Search, GraduationCap, Users, Compass, ExternalLink, Settings as SettingsIcon, XCircle } from 'lucide-react';

export const Popup: React.FC = () => {
  const [activeMode, setActiveMode] = useState<FocusMode>(null);
  const [isYouTubeTab, setIsYouTubeTab] = useState<boolean>(true);
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);

  useEffect(() => {
    // Query active tab in current window
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (!currentTab || !currentTab.id) {
          setIsYouTubeTab(false);
          return;
        }

        setCurrentTabId(currentTab.id);
        const isYt = Boolean(currentTab.url && currentTab.url.includes('youtube.com'));
        setIsYouTubeTab(isYt);

        if (isYt) {
          const storageKey = `tab_mode_${currentTab.id}`;

          // 1. Instant fallback from storage
          if (chrome.storage && chrome.storage.local) {
            chrome.storage.local.get([storageKey], (res) => {
              if (res && res[storageKey] !== undefined) {
                setActiveMode(res[storageKey]);
              }
            });
          }

          // 2. Query tab via message; if tab content script is missing, inject it!
          chrome.tabs.sendMessage(currentTab.id, { type: 'PING' }, (pong) => {
            if (chrome.runtime.lastError || !pong) {
              // Inject content script & mode-rules into active tab
              if (chrome.scripting) {
                chrome.scripting.executeScript({
                  target: { tabId: currentTab.id! },
                  files: ['content/index.js'],
                }).then(() => {
                  chrome.scripting.insertCSS({
                    target: { tabId: currentTab.id! },
                    files: ['mode-rules.css'],
                  }).catch(() => {});

                  // Now fetch mode from newly injected script
                  setTimeout(() => {
                    chrome.tabs.sendMessage(currentTab.id!, { type: 'GET_MODE' }, (res) => {
                      if (!chrome.runtime.lastError && res && res.mode !== undefined) {
                        setActiveMode(res.mode);
                      }
                    });
                  }, 100);
                }).catch(() => {});
              }
            } else {
              chrome.tabs.sendMessage(currentTab.id!, { type: 'GET_MODE' }, (response) => {
                if (!chrome.runtime.lastError && response && response.mode !== undefined) {
                  setActiveMode(response.mode);
                }
              });
            }
          });
        }
      });
    }
  }, []);

  const handleSelectMode = (mode: FocusMode) => {
    setActiveMode(mode);

    if (currentTabId && typeof chrome !== 'undefined') {
      const storageKey = `tab_mode_${currentTabId}`;

      // 1. Save to local storage for instant tab and popup state persistence
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [storageKey]: mode });
      }

      // 2. Send message directly to tab content script
      if (chrome.tabs && chrome.tabs.sendMessage) {
        chrome.tabs.sendMessage(currentTabId, { type: 'SET_MODE', mode }, () => {
          if (chrome.runtime.lastError) {
            // Tab didn't have content script, inject it and resend
            if (chrome.scripting) {
              chrome.scripting.executeScript({
                target: { tabId: currentTabId },
                files: ['content/index.js'],
              }).then(() => {
                chrome.scripting.insertCSS({
                  target: { tabId: currentTabId },
                  files: ['mode-rules.css'],
                }).catch(() => {});

                setTimeout(() => {
                  chrome.tabs.sendMessage(currentTabId, { type: 'SET_MODE', mode });
                }, 100);
              }).catch(() => {});
            }
          }
        });
      }
    }
  };

  const openSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.tabs.create({ url: chrome.runtime.getURL('src/settings/index.html') });
    }
  };

  const openYouTube = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: 'https://www.youtube.com' });
    }
  };

  const modes = [
    { id: 'find' as FocusMode, title: 'Find Something', desc: 'Search & watch one video', icon: Search },
    { id: 'focus' as FocusMode, title: 'Focus & Learn', desc: 'Tutorials & playlist autoplay', icon: GraduationCap },
    { id: 'catchup' as FocusMode, title: 'Catch Up', desc: 'Subscriptions only', icon: Users },
    { id: 'explore' as FocusMode, title: 'Explore', desc: 'Curated browsing', icon: Compass },
  ];

  return (
    <div className="w-80 p-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            FF
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none">FocusFeed</h1>
            <span className="text-[10px] text-slate-400">Intent Layer</span>
          </div>
        </div>
        <button
          onClick={openSettings}
          title="Settings"
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Main Status / Content */}
      <div className="py-3">
        {!isYouTubeTab ? (
          <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
              No YouTube tab currently focused
            </p>
            <button
              onClick={openYouTube}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition cursor-pointer"
            >
              Open YouTube <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Active Tab Mode:
              </span>
              {activeMode ? (
                <button
                  onClick={() => handleSelectMode(null)}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 transition cursor-pointer"
                >
                  <XCircle className="w-3 h-3" /> Exit
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Normal YouTube</span>
              )}
            </div>

            {/* Mode selection buttons */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {modes.map((m) => {
                const Icon = m.icon;
                const isSelected = activeMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMode(m.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-medium">{m.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">{m.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center flex justify-between">
        <span>Zero data collected</span>
        <span>v1.0.0</span>
      </div>
    </div>
  );
};
