import React from 'react';
import { Search, GraduationCap, Users, Compass, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const modes = [
    {
      title: 'Find Something',
      subtitle: "I know what I'm looking for.",
      desc: 'Hides homepage recommendations, up-next sidebars, and end-screen cards so you can search, watch your video, and leave without getting hijacked.',
      icon: Search,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
    },
    {
      title: 'Focus & Learn',
      subtitle: 'I want to follow something through.',
      desc: 'Keeps playlist autoplay running for continuous courses while eliminating algorithmic distractions, Shorts shelves, and unrelated videos.',
      icon: GraduationCap,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900',
    },
    {
      title: 'Catch Up',
      subtitle: "I want to see what's new from creators I follow.",
      desc: 'Routes homepage directly to your Subscriptions feed so you only see the channels you intentionally chose to subscribe to.',
      icon: Users,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900',
    },
    {
      title: 'Explore',
      subtitle: "I'm open to finding something new.",
      desc: 'Conscious, deliberate exploration with custom toggles for Shorts and Autoplay right at your fingertips.',
      icon: Compass,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 antialiased">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-xl mb-4 shadow-lg shadow-blue-500/20">
            FF
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to FocusFeed</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-base max-w-lg mx-auto">
            Your intentional layer for YouTube. Reclaim your focus with purposeful sessions and zero distractions.
          </p>
        </div>

        {/* 4 Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl border ${m.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-sm">{m.title}</h2>
                      <span className="text-xs text-slate-400 italic">"{m.subtitle}"</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                    {m.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Privacy Promise Banner */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 flex items-start gap-3 mb-8">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 dark:text-blue-200">
            <span className="font-semibold block mb-0.5">Strict Privacy Commitment: No Data Collection</span>
            FocusFeed operates entirely on your device. We do not track your watch history, search queries, or analytics. Nothing leaves your browser.
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition shadow-sm hover:shadow"
          >
            <CheckCircle2 className="w-4 h-4" /> Ready — Go to YouTube
          </a>
        </div>
      </div>
    </div>
  );
};
