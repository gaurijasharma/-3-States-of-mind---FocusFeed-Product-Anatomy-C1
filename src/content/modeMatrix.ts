/**
 * FocusFeed: Mode x Page-Type Matrix & Route Guard Rules
 * PRD Reference: Section 6.2.5
 */

import { FocusMode, YouTubePageType, ModeActionRule } from '../types';

export function getYouTubePageType(pathname: string = window.location.pathname): YouTubePageType {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/results')) return 'search';
  if (pathname.startsWith('/watch')) return 'watch';
  if (pathname.startsWith('/playlist')) return 'playlist';
  if (pathname.startsWith('/@') || pathname.startsWith('/channel/')) return 'channel';
  if (pathname.startsWith('/shorts/')) return 'shorts';
  if (pathname.startsWith('/feed/subscriptions')) return 'subscriptions';
  if (pathname.startsWith('/feed/history') || pathname.startsWith('/feed/library')) return 'history';
  if (pathname.startsWith('/feed/trending') || pathname.startsWith('/feed/explore')) return 'trending';
  return 'unknown';
}

/**
 * Evaluates route guard redirection or action according to Section 6.2.5
 */
export function evaluateRouteRule(mode: FocusMode, pageType: YouTubePageType, pathname: string): ModeActionRule {
  if (!mode) return { action: 'show' };

  // Shorts route guard across all focused modes: redirect /shorts/<id> to standard /watch?v=<id>
  if (pageType === 'shorts') {
    const shortsMatch = pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch && shortsMatch[1]) {
      const videoId = shortsMatch[1];
      if (mode === 'explore') {
        return { action: 'show' }; // Explore mode respects shorts toggle
      }
      return { action: 'redirect', target: `/watch?v=${videoId}` };
    }
  }

  // Trending / Explore feed is redirected or hidden across focused modes
  if (pageType === 'trending') {
    if (mode === 'find' || mode === 'focus' || mode === 'catchup') {
      return { action: 'redirect', target: '/' };
    }
  }

  // Catch Up mode: Homepage recommendations redirected to /feed/subscriptions
  if (mode === 'catchup' && pageType === 'home') {
    return { action: 'redirect', target: '/feed/subscriptions' };
  }

  // Find Something on Home: empty state with search prompt
  if (mode === 'find' && pageType === 'home') {
    return { action: 'empty_state' };
  }

  // Focus & Learn on Home: empty state with search prompt & shortcuts
  if (mode === 'focus' && pageType === 'home') {
    return { action: 'empty_state' };
  }

  return { action: 'show' };
}
