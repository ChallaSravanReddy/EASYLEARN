import React from 'react';
import ScrimPlayerView from './ScrimPlayerView';

/**
 * Course Player - Unified Scrimba Interactive Code Player Engine
 * Features:
 * - High precision timestamp audio synchronization
 * - Side-by-side split view with draggable resizable divider
 * - Monaco code editor with live syntax replay and student edit detection
 * - Sandboxed iframe preview with :8000 address bar and device viewports
 * - Interactive milestones, automated test runners, XP rewards
 * - Synchronized live subtitles pill and Scrimba initial video card overlay
 */
export default function TimelineCodePlayer(props) {
  return <ScrimPlayerView {...props} />;
}