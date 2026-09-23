import React, { useEffect, useState } from 'react';
import { FocusFeedSettings, DEFAULT_SETTINGS } from '../types';
import { Check, RotateCcw } from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<FocusFeedSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['settings'], (res) => {
        if (res.settings) {
          setSettings(res.settings);
        }
      });
    }
  }, []);

  const handleSave = (updated: FocusFeedSettings) => {
    setSettings(updated);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ settings: updated }, () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      });
    }
  };

  const handleReset = () => {
    handleSave(DEFAULT_SETTINGS);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-6 flex justify-center">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold">FocusFeed Settings</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize how and when FocusFeed activates
            </p>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>

        {/* Settings Form */}
        <div className="space-y-6">
          {/* Setting 1: Show overlay */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <label className="text-sm font-medium block">Show Intent Overlay on YouTube Load</label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Display the overlay prompt when you navigate to YouTube
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.showOverlayOnLoad}
              onChange={(e) => handleSave({ ...settings, showOverlayOnLoad: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Setting 2: Trigger URL */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <label className="text-sm font-medium block mb-1">Overlay Trigger URL</label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Choose which pages should display the intent overlay
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="trigger"
                  value="homepage_only"
                  checked={settings.overlayTrigger === 'homepage_only'}
                  onChange={() => handleSave({ ...settings, overlayTrigger: 'homepage_only' })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Homepage only (Default — direct video links load uninterrupted)</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="trigger"
                  value="all_pages"
                  checked={settings.overlayTrigger === 'all_pages'}
                  onChange={() => handleSave({ ...settings, overlayTrigger: 'all_pages' })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>All YouTube pages (Prompts on any entry URL)</span>
              </label>
            </div>
          </div>

          {/* Setting 3: Explore toggles persistence */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <label className="text-sm font-medium block">Remember Explore Mode Toggles</label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Persist your Shorts and Autoplay preferences across sessions in Explore mode
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.exploreRememberToggles}
              onChange={(e) => handleSave({ ...settings, exploreRememberToggles: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Reset Button */}
          <div className="pt-4 flex justify-between items-center text-xs text-slate-400">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Defaults
            </button>
            <span>Schema v{settings.schemaVersion}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
