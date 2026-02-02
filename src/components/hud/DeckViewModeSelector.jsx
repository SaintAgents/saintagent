import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings } from 'lucide-react';
import { createPageUrl } from '@/utils';

// Define which cards are shown in each mode
export const VIEW_MODE_CONFIG = {
  simple: {
    label: 'Simple',
    description: 'Top 5 essential features',
    cards: ['quickActions', 'inbox', 'meetings', 'syncEngine', 'missions', 'circles', 'news', 'testimonials', 'communityFeed'],
    // Nav items that correspond to simple mode (used by Sidebar and MobileMenu) - excludes insights
    navIds: ['command', 'synchronicity', 'messages', 'meetings', 'missions', 'circles', 'communityfeed', 'marketplace', 'news', 'gggcrypto', 'g3dex', 'settings']
  },
  advanced: {
    label: 'Advanced',
    description: 'All features',
    cards: [
      'quickActions', 'quickStart', 'challenges', 'inbox', 'collaborators',
      'communityFeed', 'circles', 'leaderboard', 'affirmations', 'leaderPathway',
      'aiDiscover', 'syncEngine', 'meetings', 'missions', 'projects',
      'market', 'influence', 'leader', 'dailyops', 'news', 'insights', 'videos', 'testimonials', 'heroGallery'
    ],
    navIds: null // null means show all nav items (includes authority144, topgggmission, videos)
  },
  custom: {
    label: 'Custom',
    description: 'Choose your features',
    cards: ['insights', 'videos', 'testimonials', 'communityFeed'], // Default includes insights, videos, testimonials, and communityFeed
    navIds: null // null means show all nav items
  }
};

// Helper to get current view mode from localStorage
export const getStoredViewMode = () => {
  try {
    return localStorage.getItem('deckViewMode') || 'advanced';
  } catch { return 'advanced'; }
};

// Helper to check if nav item should be visible based on view mode
export const isNavItemVisible = (navId, viewMode) => {
  const config = VIEW_MODE_CONFIG[viewMode];
  if (!config || !config.navIds) return true; // Show all if no filter
  return config.navIds.includes(navId);
};

// Get default custom cards (half of all)
export const getDefaultCustomCards = () => {
  const allCards = VIEW_MODE_CONFIG.advanced.cards;
  return allCards.slice(0, Math.ceil(allCards.length / 2));
};

export default function DeckViewModeSelector({ viewMode, onViewModeChange, className = '' }) {
  // Check if custom cards have been configured
  const hasCustomConfig = () => {
    try {
      return !!localStorage.getItem('deckCustomCards');
    } catch { return false; }
  };

  const handleCustomClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If user has already configured custom cards, just switch to custom mode
    if (hasCustomConfig()) {
      onViewModeChange('custom');
    } else {
      // First time - navigate to settings to configure
      window.location.href = createPageUrl('Settings') + '?tab=deck';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium mr-1">View:</span>
      
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="radio"
          name="deckViewMode"
          value="simple"
          checked={viewMode === 'simple'}
          onChange={(e) => {
            e.stopPropagation();
            onViewModeChange('simple');
          }}
          className="w-3.5 h-3.5 text-violet-600 focus:ring-violet-500"
        />
        <span className="text-xs text-slate-700 dark:text-slate-300">Simple</span>
      </label>
      
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="radio"
          name="deckViewMode"
          value="advanced"
          checked={viewMode === 'advanced'}
          onChange={(e) => {
            e.stopPropagation();
            onViewModeChange('advanced');
          }}
          className="w-3.5 h-3.5 text-violet-600 focus:ring-violet-500"
        />
        <span className="text-xs text-slate-700 dark:text-slate-300">Advanced</span>
      </label>
      
      <label className="flex items-center gap-1.5 cursor-pointer" onClick={handleCustomClick}>
        <input
          type="radio"
          name="deckViewMode"
          value="custom"
          checked={viewMode === 'custom'}
          onChange={(e) => e.stopPropagation()}
          onClick={handleCustomClick}
          className="w-3.5 h-3.5 text-violet-600 focus:ring-violet-500"
        />
        <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
          Custom
          {!hasCustomConfig() && <Settings className="w-3 h-3 text-slate-400" />}
        </span>
      </label>
    </div>
  );
}