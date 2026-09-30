/**
 * FocusFeed Type Definitions
 * Source of truth: FocusFeed PRD v1.1
 */

export type FocusMode = 'find' | 'focus' | 'catchup' | 'explore' | null;

export type OverlayTrigger = 'homepage_only' | 'all_pages';

export interface FocusFeedSettings {
  schemaVersion: number;
  showOverlayOnLoad: boolean;
  overlayTrigger: OverlayTrigger;
  exploreRememberToggles: boolean;
  exploreShortsEnabled: boolean;
  exploreAutoplayEnabled: boolean;
}

export const DEFAULT_SETTINGS: FocusFeedSettings = {
  schemaVersion: 1,
  showOverlayOnLoad: false,
  overlayTrigger: 'homepage_only',
  exploreRememberToggles: false,
  exploreShortsEnabled: true,
  exploreAutoplayEnabled: true,
};

export type YouTubePageType =
  | 'home'
  | 'search'
  | 'watch'
  | 'playlist'
  | 'channel'
  | 'shorts'
  | 'subscriptions'
  | 'history'
  | 'trending'
  | 'unknown';

export interface ModeActionRule {
  action: 'show' | 'hide' | 'redirect' | 'empty_state';
  target?: string;
  elementsToHide?: string[];
}
