import React, { useEffect, useRef } from 'react';
import { FocusMode } from '../types';
import { Search, GraduationCap, Users, Compass, ArrowRight } from 'lucide-react';

interface IntentOverlayProps {
  onSelectMode: (mode: FocusMode) => void;
  onDismiss: () => void;
}

export const IntentOverlay: React.FC<IntentOverlayProps> = ({ onSelectMode, onDismiss }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation & trap / Esc handler (PRD Section 6.1)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut leaking to YouTube
      e.stopPropagation();

      if (e.key === 'Escape') {
        onDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onDismiss]);

  const modes = [
    {
      id: 'find' as FocusMode,
      title: 'Find Something',
      quote: "I know what I'm looking for.",
      icon: Search,
      bg: 'hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30',
      badge: 'Search & Focus',
    },
    {
      id: 'focus' as FocusMode,
      title: 'Focus & Learn',
      quote: 'I want to follow something through.',
      icon: GraduationCap,
      bg: 'hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30',
      badge: 'Course & Playlist Autoplay',
    },
    {
      id: 'catchup' as FocusMode,
      title: 'Catch Up',
      quote: "I want to see what's new from creators I follow.",
      icon: Users,
      bg: 'hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30',
      badge: 'Subscriptions Only',
    },
    {
      id: 'explore' as FocusMode,
      title: 'Explore',
      quote: "I'm open to finding something new.",
      icon: Compass,
      bg: 'hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30',
      badge: 'With Custom Guardrails',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ff-overlay-title"
      aria-describedby="ff-overlay-desc"
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans select-none animate-fade-in"
      onClick={(e) => {
        // Explicit choice required: backdrop click does NOT dismiss (PRD 6.1)
        e.stopPropagation();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
            FocusFeed Intent Layer
          </div>
          <h2 id="ff-overlay-title" className="text-2xl sm:text-3xl font-bold tracking-tight">
            What are you here for?
          </h2>
          <p id="ff-overlay-desc" className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Choose a mode to shape your session, or continue to normal YouTube.
          </p>
        </div>

        {/* 2x2 Grid of Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left transition-all duration-200 ${m.bg} flex flex-col justify-between hover:shadow-md cursor-pointer`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition group-hover:translate-x-0.5" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">{m.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{m.quote}"</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    {m.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dismissal footer */}
        <div className="text-center pt-2">
          <button
            onClick={onDismiss}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-4 transition"
          >
            Skip — Normal YouTube
          </button>
        </div>
      </div>
    </div>
  );
};
