/**
 * FocusFeed: Mode Badge Component (Shadow DOM)
 * PRD Reference: Section 6.3
 */

import { FocusMode } from '../types';

interface BadgeCallbacks {
  onExit: () => void;
  onToggleShorts?: () => void;
  onToggleAutoplay?: () => void;
}

interface BadgeState {
  mode: FocusMode;
  shortsEnabled?: boolean;
  autoplayEnabled?: boolean;
}

const X_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
const FILM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>`;
const PLAY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>`;
const SQUARE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`;

const MODE_LABELS: Record<string, string> = {
  find: 'Find Something',
  focus: 'Focus & Learn',
  catchup: 'Catch Up',
  explore: 'Explore',
};

export class BadgeComponent {
  private container: HTMLElement | null = null;

  render(shadowRoot: ShadowRoot, state: BadgeState, callbacks: BadgeCallbacks): HTMLElement | null {
    this.destroy();

    if (!state.mode) return null;

    const isDark = document.documentElement.hasAttribute('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const badge = document.createElement('div');
    badge.className = `fixed bottom-6 right-6 z-[2147483640] flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 font-sans text-xs transition-all hover:shadow-2xl select-none animate-fade-in ${isDark ? 'dark' : ''}`;
    badge.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2147483645;display:flex;align-items:center;gap:0.5rem;';

    const shortsEnabled = state.shortsEnabled ?? true;
    const autoplayEnabled = state.autoplayEnabled ?? true;

    let exploreTogglesHtml = '';
    if (state.mode === 'explore') {
      exploreTogglesHtml = `
        <div class="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200 dark:border-slate-800" style="display:flex;align-items:center;gap:0.375rem;margin-left:0.5rem;padding-left:0.5rem;border-left:1px solid #cbd5e1;">
          <button
            type="button"
            id="ff-toggle-shorts"
            title="Shorts: ${shortsEnabled ? 'ON' : 'OFF'}"
            class="p-1 rounded-lg border transition cursor-pointer ${
              shortsEnabled
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-400'
            }"
          >
            ${FILM_SVG}
          </button>
          <button
            type="button"
            id="ff-toggle-autoplay"
            title="Autoplay: ${autoplayEnabled ? 'ON' : 'OFF'}"
            class="p-1 rounded-lg border transition cursor-pointer ${
              autoplayEnabled
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-400'
            }"
          >
            ${autoplayEnabled ? PLAY_SVG : SQUARE_SVG}
          </button>
        </div>
      `;
    }

    badge.innerHTML = `
      <div class="flex items-center gap-2" style="display:flex;align-items:center;gap:0.5rem;">
        <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse" style="width:8px;height:8px;border-radius:9999px;background-color:#2563eb;display:inline-block;"></span>
        <span class="font-semibold text-xs tracking-tight text-slate-900 dark:text-slate-100">${MODE_LABELS[state.mode] || state.mode}</span>
      </div>
      ${exploreTogglesHtml}
      <button
        type="button"
        id="ff-badge-exit"
        title="Exit Mode"
        class="ml-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition cursor-pointer"
        style="margin-left:0.5rem;"
      >
        ${X_SVG}
      </button>
    `;

    const exitBtn = badge.querySelector<HTMLButtonElement>('#ff-badge-exit');
    if (exitBtn) {
      exitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        callbacks.onExit();
      });
    }

    if (state.mode === 'explore') {
      const shortsBtn = badge.querySelector<HTMLButtonElement>('#ff-toggle-shorts');
      if (shortsBtn && callbacks.onToggleShorts) {
        shortsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          callbacks.onToggleShorts!();
        });
      }

      const autoplayBtn = badge.querySelector<HTMLButtonElement>('#ff-toggle-autoplay');
      if (autoplayBtn && callbacks.onToggleAutoplay) {
        autoplayBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          callbacks.onToggleAutoplay!();
        });
      }
    }

    shadowRoot.appendChild(badge);
    this.container = badge;
    return badge;
  }

  destroy() {
    if (this.container && this.container.parentElement) {
      this.container.remove();
      this.container = null;
    }
  }
}
