/**
 * FocusFeed: Intent Overlay Component (Shadow DOM)
 * PRD Reference: Section 6.1
 */

import { FocusMode } from '../types';

interface OverlayCallbacks {
  onSelectMode: (mode: FocusMode) => void;
  onDismiss: () => void;
}

const SEARCH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
const GRADUATION_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-.838L12.83 2.18a2 2 0 0 0-1.66 0L2.6 10.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>`;
const USERS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const COMPASS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
const ARROW_RIGHT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;

export class OverlayComponent {
  private container: HTMLElement | null = null;
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;

  render(shadowRoot: ShadowRoot, callbacks: OverlayCallbacks): HTMLElement {
    this.destroy();

    const isDark = document.documentElement.hasAttribute('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'ff-overlay-title');
    overlay.setAttribute('aria-describedby', 'ff-overlay-desc');
    overlay.className = `fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans select-none animate-fade-in ${isDark ? 'dark' : ''}`;
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;';
    
    // Stop backdrop clicks from dismissing (PRD 6.1: explicit choice required)
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    const cardData = [
      {
        id: 'find' as FocusMode,
        title: 'Find Something',
        quote: "I know what I'm looking for.",
        icon: SEARCH_SVG,
        bgClasses: 'hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30',
        badge: 'Search & Focus',
        colorClass: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
      },
      {
        id: 'focus' as FocusMode,
        title: 'Focus & Learn',
        quote: 'I want to follow something through.',
        icon: GRADUATION_SVG,
        bgClasses: 'hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30',
        badge: 'Course & Playlist Autoplay',
        colorClass: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
      },
      {
        id: 'catchup' as FocusMode,
        title: 'Catch Up',
        quote: "I want to see what's new from creators I follow.",
        icon: USERS_SVG,
        bgClasses: 'hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30',
        badge: 'Subscriptions Only',
        colorClass: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
      },
      {
        id: 'explore' as FocusMode,
        title: 'Explore',
        quote: "I'm open to finding something new.",
        icon: COMPASS_SVG,
        bgClasses: 'hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30',
        badge: 'With Custom Guardrails',
        colorClass: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
      },
    ];

    const cardsHtml = cardData
      .map(
        (c) => `
      <button
        type="button"
        data-mode="${c.id}"
        class="ff-mode-btn group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left transition-all duration-200 ${c.bgClasses} flex flex-col justify-between hover:shadow-md cursor-pointer bg-white dark:bg-slate-900"
      >
        <div>
          <div className="flex items-center justify-between mb-3" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
            <div class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 ${c.colorClass} transition">
              ${c.icon}
            </div>
            <span class="text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition group-hover:translate-x-0.5">
              ${ARROW_RIGHT_SVG}
            </span>
          </div>
          <h3 class="font-semibold text-base mb-1 text-slate-900 dark:text-slate-100">${c.title}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 italic">"${c.quote}"</p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            ${c.badge}
          </span>
        </div>
      </button>
    `
      )
      .join('');

    overlay.innerHTML = `
      <div class="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
            FocusFeed Intent Layer
          </div>
          <h2 id="ff-overlay-title" class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            What are you here for?
          </h2>
          <p id="ff-overlay-desc" class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Choose a mode to shape your session, or continue to normal YouTube.
          </p>
        </div>

        <!-- 2x2 Grid of Mode Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          ${cardsHtml}
        </div>

        <!-- Dismissal footer -->
        <div class="text-center pt-2">
          <button
            type="button"
            id="ff-skip-btn"
            class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-4 transition cursor-pointer"
          >
            Skip — Normal YouTube
          </button>
        </div>
      </div>
    `;

    // Attach click events to buttons
    const buttons = overlay.querySelectorAll<HTMLButtonElement>('.ff-mode-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.getAttribute('data-mode') as FocusMode;
        if (mode) {
          callbacks.onSelectMode(mode);
        }
      });
    });

    const skipBtn = overlay.querySelector<HTMLButtonElement>('#ff-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        callbacks.onDismiss();
      });
    }

    // Keyboard navigation & trap / Escape handler (PRD 6.1)
    this.keydownListener = (e: KeyboardEvent) => {
      // Prevent shortcut leaking to YouTube (e.g. k, f, j, l)
      e.stopPropagation();

      if (e.key === 'Escape') {
        callbacks.onDismiss();
      }
    };

    window.addEventListener('keydown', this.keydownListener, true);

    shadowRoot.appendChild(overlay);
    this.container = overlay;
    return overlay;
  }

  destroy() {
    if (this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener, true);
      this.keydownListener = null;
    }
    if (this.container && this.container.parentElement) {
      this.container.remove();
      this.container = null;
    }
  }
}
