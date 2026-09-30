/**
 * FocusFeed: Home Empty State Component (Shadow DOM)
 * PRD Reference: Section 6.2.5
 *
 * Simplified: Shows a minimal info message only.
 * No custom search bar (YouTube's own is always visible at top).
 * No shortcut buttons (sidebar already has Playlists & Subscriptions).
 */

import { FocusMode } from '../types';

const MODE_LABELS: Partial<Record<NonNullable<FocusMode>, { title: string; hint: string }>> = {
  find: {
    title: 'Find Something Mode',
    hint: 'Homepage recommendations are hidden. Use the search bar above to find the video you came for.',
  },
  focus: {
    title: 'Focus & Learn Mode',
    hint: 'Homepage recommendations are hidden. Use the search bar above or browse your subscriptions from the sidebar.',
  },
};

export class EmptyStateComponent {
  private container: HTMLElement | null = null;

  render(shadowRoot: ShadowRoot, mode: FocusMode): HTMLElement | null {
    this.destroy();

    if (mode !== 'find' && mode !== 'focus') {
      return null;
    }

    const isDark =
      document.documentElement.hasAttribute('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const { title, hint } = MODE_LABELS[mode as NonNullable<FocusMode>]!;

    const wrapper = document.createElement('div');
    wrapper.id = 'ff-empty-state-container';
    wrapper.style.cssText = [
      'position:fixed',
      'top:56px',
      'left:240px',   /* clear YouTube sidebar */
      'right:0',
      'bottom:0',
      'z-index:2147483640',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'pointer-events:none',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
    ].join(';');

    wrapper.innerHTML = `
      <div style="
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:10px;
        max-width:420px;
        text-align:center;
        padding:0 24px;
        pointer-events:none;
      ">
        <!-- Mode badge -->
        <div style="
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:4px 12px;
          border-radius:999px;
          background:${isDark ? 'rgba(0,229,255,0.1)' : 'rgba(0,100,200,0.08)'};
          border:1px solid ${isDark ? 'rgba(0,229,255,0.25)' : 'rgba(0,100,200,0.2)'};
          font-size:11px;
          font-weight:700;
          letter-spacing:0.04em;
          text-transform:uppercase;
          color:${isDark ? '#00E5FF' : '#0066CC'};
        ">
          <span style="
            width:7px;height:7px;border-radius:50%;
            background:${isDark ? '#00E5FF' : '#0066CC'};
            display:inline-block;
          "></span>
          ${title}
        </div>

        <!-- Hint text -->
        <p style="
          margin:0;
          font-size:13px;
          line-height:1.6;
          color:${isDark ? '#888' : '#888'};
          font-weight:400;
        ">
          ${hint}
        </p>
      </div>
    `;

    shadowRoot.appendChild(wrapper);
    this.container = wrapper;
    return wrapper;
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.remove();
      this.container = null;
    }
  }
}
