import React from 'react';
import { FocusMode } from '../types';
import { X, Play, Square, Film } from 'lucide-react';

interface ModeBadgeProps {
  mode: FocusMode;
  onExit: () => void;
  shortsEnabled?: boolean;
  autoplayEnabled?: boolean;
  onToggleShorts?: () => void;
  onToggleAutoplay?: () => void;
}

const MODE_LABELS: Record<string, string> = {
  find: 'Find Something',
  focus: 'Focus & Learn',
  catchup: 'Catch Up',
  explore: 'Explore',
};

export const ModeBadge: React.FC<ModeBadgeProps> = ({
  mode,
  onExit,
  shortsEnabled = true,
  autoplayEnabled = true,
  onToggleShorts,
  onToggleAutoplay,
}) => {
  if (!mode) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[2147483640] flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 font-sans text-xs transition-all hover:shadow-2xl">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        <span className="font-semibold text-xs tracking-tight">{MODE_LABELS[mode]}</span>
      </div>

      {/* Explore Mode Toggles */}
      {mode === 'explore' && (
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          {onToggleShorts && (
            <button
              onClick={onToggleShorts}
              title={`Shorts: ${shortsEnabled ? 'ON' : 'OFF'}`}
              className={`p-1 rounded-lg border transition ${
                shortsEnabled
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
            >
              <Film className="w-3 h-3" />
            </button>
          )}
          {onToggleAutoplay && (
            <button
              onClick={onToggleAutoplay}
              title={`Autoplay: ${autoplayEnabled ? 'ON' : 'OFF'}`}
              className={`p-1 rounded-lg border transition ${
                autoplayEnabled
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
            >
              {autoplayEnabled ? <Play className="w-3 h-3" /> : <Square className="w-3 h-3" />}
            </button>
          )}
        </div>
      )}

      {/* Exit Button */}
      <button
        onClick={onExit}
        title="Exit Mode"
        className="ml-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
