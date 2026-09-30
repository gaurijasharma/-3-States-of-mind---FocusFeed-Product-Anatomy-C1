/**
 * FocusFeed: Home Empty State Component (Shadow DOM)
 * PRD Reference: Section 6.2.5
 */

import { FocusMode } from '../types';

interface EmptyStateCallbacks {
  onSearch: (query: string) => void;
  onNavigate: (url: string) => void;
}

const SEARCH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
const PLAYLIST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>`;
const SUBSCRIPTIONS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;

export class EmptyStateComponent {
  private container: HTMLElement | null = null;

  render(shadowRoot: ShadowRoot, mode: FocusMode, callbacks: EmptyStateCallbacks): HTMLElement | null {
    this.destroy();

    if (mode !== 'find' && mode !== 'focus') {
      return null;
    }

    const isDark = document.documentElement.hasAttribute('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const wrapper = document.createElement('div');
    wrapper.id = 'ff-empty-state-container';
    wrapper.className = `fixed inset-0 top-14 z-[200] flex flex-col items-center justify-center p-6 font-sans select-none pointer-events-none ${isDark ? 'dark' : ''}`;
    wrapper.style.cssText = 'position:fixed;top:56px;left:0;right:0;bottom:0;z-index:2147483640;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.5rem;pointer-events:none;';

    const isFind = mode === 'find';
    const title = isFind ? 'Find Something' : 'Focus & Learn';
    const subtitle = isFind
      ? "You're in Find mode. Search for the specific video you came for with zero feed distractions."
      : "You're in Focus mode. Search tutorials or dive into your structured playlists and subscriptions.";

    let shortcutsHtml = '';
    if (!isFind) {
      shortcutsHtml = `
        <div class="flex items-center justify-center gap-3 mt-5" style="display:flex;align-items:center;justify-content:center;gap:0.75rem;margin-top:1.25rem;">
          <button
            type="button"
            id="ff-btn-playlists"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 transition cursor-pointer"
          >
            ${PLAYLIST_SVG}
            <span>Open Playlists</span>
          </button>
          <button
            type="button"
            id="ff-btn-subscriptions"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 transition cursor-pointer"
          >
            ${SUBSCRIPTIONS_SVG}
            <span>View Subscriptions</span>
          </button>
        </div>
      `;
    }

    wrapper.innerHTML = `
      <div class="pointer-events-auto w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl text-center animate-fade-in text-slate-800 dark:text-slate-100">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
          ${title} Active
        </div>
        <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
          ${isFind ? "What video are you looking for?" : "Ready to focus and learn?"}
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          ${subtitle}
        </p>

        <!-- Search input box -->
        <form id="ff-empty-search-form" class="relative max-w-md mx-auto flex items-center">
          <input
            type="text"
            id="ff-empty-search-input"
            placeholder="Type your search query..."
            class="w-full pl-10 pr-24 py-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            style="padding-left:2.5rem;padding-right:5.5rem;padding-top:0.75rem;padding-bottom:0.75rem;border-radius:1rem;"
          />
          <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style="position:absolute;left:0.875rem;top:50%;transform:translateY(-50%);">
            ${SEARCH_SVG}
          </div>
          <button
            type="submit"
            class="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            style="position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);"
          >
            Search
          </button>
        </form>

        ${shortcutsHtml}
      </div>
    `;

    const form = wrapper.querySelector<HTMLFormElement>('#ff-empty-search-form');
    const input = wrapper.querySelector<HTMLInputElement>('#ff-empty-search-input');
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (query) {
          callbacks.onSearch(query);
        }
      });
      // Auto focus search input on home
      setTimeout(() => input.focus(), 100);
    }

    if (!isFind) {
      const playlistBtn = wrapper.querySelector<HTMLButtonElement>('#ff-btn-playlists');
      if (playlistBtn) {
        playlistBtn.addEventListener('click', () => {
          callbacks.onNavigate('/feed/playlists');
        });
      }

      const subBtn = wrapper.querySelector<HTMLButtonElement>('#ff-btn-subscriptions');
      if (subBtn) {
        subBtn.addEventListener('click', () => {
          callbacks.onNavigate('/feed/subscriptions');
        });
      }
    }

    shadowRoot.appendChild(wrapper);
    this.container = wrapper;
    return wrapper;
  }

  destroy() {
    if (this.container && this.container.parentElement) {
      this.container.remove();
      this.container = null;
    }
  }
}
