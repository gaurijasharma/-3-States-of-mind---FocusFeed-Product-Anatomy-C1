import { describe, it, expect } from 'vitest';
import { getYouTubePageType, evaluateRouteRule } from './modeMatrix';

describe('FocusFeed: Mode x Page-Type Matrix (PRD Section 6.2.5)', () => {
  describe('Page Type Detection', () => {
    it('identifies homepage correctly', () => {
      expect(getYouTubePageType('/')).toBe('home');
      expect(getYouTubePageType('')).toBe('home');
    });

    it('identifies search results page', () => {
      expect(getYouTubePageType('/results?search_query=test')).toBe('search');
    });

    it('identifies watch page', () => {
      expect(getYouTubePageType('/watch?v=dQw4w9WgXcQ')).toBe('watch');
    });

    it('identifies playlist page', () => {
      expect(getYouTubePageType('/playlist?list=PL12345')).toBe('playlist');
    });

    it('identifies shorts url', () => {
      expect(getYouTubePageType('/shorts/abc123xyz')).toBe('shorts');
    });

    it('identifies subscriptions feed', () => {
      expect(getYouTubePageType('/feed/subscriptions')).toBe('subscriptions');
    });
  });

  describe('Route Guard & Action Rules', () => {
    it('redirects Shorts URLs to standard watch page in Find Something mode', () => {
      const rule = evaluateRouteRule('find', 'shorts', '/shorts/video123');
      expect(rule.action).toBe('redirect');
      expect(rule.target).toBe('/watch?v=video123');
    });

    it('redirects Shorts URLs to standard watch page in Focus & Learn mode', () => {
      const rule = evaluateRouteRule('focus', 'shorts', '/shorts/tut999');
      expect(rule.action).toBe('redirect');
      expect(rule.target).toBe('/watch?v=tut999');
    });

    it('redirects Homepage to Subscriptions in Catch Up mode', () => {
      const rule = evaluateRouteRule('catchup', 'home', '/');
      expect(rule.action).toBe('redirect');
      expect(rule.target).toBe('/feed/subscriptions');
    });

    it('returns empty_state on Home for Find Something and Focus & Learn', () => {
      expect(evaluateRouteRule('find', 'home', '/').action).toBe('empty_state');
      expect(evaluateRouteRule('focus', 'home', '/').action).toBe('empty_state');
    });

    it('allows navigation when mode is null (normal YouTube)', () => {
      expect(evaluateRouteRule(null, 'home', '/').action).toBe('show');
      expect(evaluateRouteRule(null, 'shorts', '/shorts/video123').action).toBe('show');
    });

    it('redirects trending page to home in focused modes', () => {
      expect(evaluateRouteRule('find', 'trending', '/feed/trending').action).toBe('redirect');
      expect(evaluateRouteRule('find', 'trending', '/feed/trending').target).toBe('/');
      expect(evaluateRouteRule('focus', 'trending', '/feed/trending').action).toBe('redirect');
      expect(evaluateRouteRule('catchup', 'trending', '/feed/trending').action).toBe('redirect');
      expect(evaluateRouteRule('explore', 'trending', '/feed/trending').action).toBe('show');
    });

    it('allows shorts navigation in explore mode', () => {
      expect(evaluateRouteRule('explore', 'shorts', '/shorts/vid123').action).toBe('show');
    });
  });
});
