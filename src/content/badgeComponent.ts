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

    const bg = isDark ? 'rgba(15,15,15,0.97)' : 'rgba(255,255,255,0.97)';
    const textColor = isDark ? '#FFFFFF' : '#0f172a';
    const borderColor = isDark ? '#2A2A2A' : '#e2e8f0';
    const mutedColor = isDark ? '#888888' : '#64748b';
    const dotColor = '#00E5FF';

    const badge = document.createElement('div');
    badge.style.cssText = [
      'position:fixed',
      'bottom:24px',
      'right:24px',
      'z-index:2147483645',
      'display:flex',
      'align-items:center',
      'gap:8px',
      `background:${bg}`,
      `border:1px solid ${borderColor}`,
      'border-radius:20px',
      'padding:8px 14px',
      'box-shadow:0 8px 24px rgba(0,0,0,0.5)',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      'font-size:12px',
      'user-select:none',
      'backdrop-filter:blur(12px)',
      '-webkit-backdrop-filter:blur(12px)',
    ].join(';');

    const shortsEnabled = state.shortsEnabled ?? true;
    const autoplayEnabled = state.autoplayEnabled ?? true;

    let exploreTogglesHtml = '';
    if (state.mode === 'explore') {
      exploreTogglesHtml = `
        <div style="display:flex;align-items:center;gap:6px;margin-left:6px;padding-left:8px;border-left:1px solid ${borderColor};">
          <button type="button" id="ff-toggle-shorts" title="Shorts: ${shortsEnabled ? 'ON' : 'OFF'}" style="
            padding:4px;border-radius:6px;border:1px solid ${shortsEnabled ? '#00E5FF' : borderColor};
            background:${shortsEnabled ? 'rgba(0,229,255,0.1)' : 'transparent'};
            color:${shortsEnabled ? '#00E5FF' : mutedColor};cursor:pointer;display:flex;align-items:center;
          ">${FILM_SVG}</button>
          <button type="button" id="ff-toggle-autoplay" title="Autoplay: ${autoplayEnabled ? 'ON' : 'OFF'}" style="
            padding:4px;border-radius:6px;border:1px solid ${autoplayEnabled ? '#00E5FF' : borderColor};
            background:${autoplayEnabled ? 'rgba(0,229,255,0.1)' : 'transparent'};
            color:${autoplayEnabled ? '#00E5FF' : mutedColor};cursor:pointer;display:flex;align-items:center;
          ">${autoplayEnabled ? PLAY_SVG : SQUARE_SVG}</button>
        </div>
      `;
    }

    badge.innerHTML = `
      <div style="display:flex;align-items:center;gap:7px;">
        <span style="width:8px;height:8px;border-radius:50%;background:${dotColor};box-shadow:0 0 6px ${dotColor};display:inline-block;flex-shrink:0;"></span>
        <span style="font-weight:600;font-size:12px;color:${textColor};white-space:nowrap;letter-spacing:-0.01em;">${MODE_LABELS[state.mode] || state.mode}</span>
      </div>
      ${exploreTogglesHtml}
      <button
        type="button"
        id="ff-badge-exit"
        title="Exit Mode"
        style="margin-left:4px;padding:3px;border-radius:50%;border:none;background:transparent;color:${mutedColor};cursor:pointer;display:flex;align-items:center;line-height:1;"
      >${X_SVG}</button>
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
    if (this.container && this.container.parentNode) {
      this.container.remove();
      this.container = null;
    }
  }
}
