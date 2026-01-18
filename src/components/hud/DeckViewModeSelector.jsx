import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings } from 'lucide-react';
import { createPageUrl } from '@/utils';

// Define which cards are shown in each mode
export const VIEW_MODE_CONFIG = {
  simple: {
    label: 'Simple',
    description: 'Top 5 essential features',
    cards: ['quickActions', 'inbox', 'meetings', 'syncEngine', 'missions']
  },
  advanced: {
    label: 'Advanced',
    description: 'All features',
    cards: [
      'quickActions', 'quickStart', 'challenges', 'inbox', 'collaborators',
      'communityFeed', 'circles', 'leaderboard', 'affirmations', 'leaderPathway',
      'aiDiscover', 'syncEngine', 'meetings', 'missions', 'projects',
      'market', 'influence', 'leader', 'dailyops'
    ]
  },
  custom: {
    label: 'Custom',
    description: 'Choose your features',
    cards: [] // Determined by user settings
  }
};

// Get default custom cards (half of all)
export const getDefaultCustomCards = () => {
  const allCards = VIEW_MODE_CONFIG.advanced.cards;
  return allCards.slice(0, Math.ceil(allCards.length / 2));
};

export default function DeckViewModeSelector({ viewMode, onViewModeChange, className = '' }) {
  const handleCustomClick = () => {
    // Navigate to settings page with hash to indicate deck settings
    window.location.href = createPageUrl('Settings') + '?tab=deck';
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
          onChange={() => onViewModeChange('simple')}
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
          onChange={() => onViewModeChange('advanced')}
          className="w-3.5 h-3.5 text-violet-600 focus:ring-violet-500"
        />
        <span className="text-xs text-slate-700 dark:text-slate-300">Advanced</span>
      </label>
      
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="radio"
          name="deckViewMode"
          value="custom"
          checked={viewMode === 'custom'}
          onChange={handleCustomClick}
          className="w-3.5 h-3.5 text-violet-600 focus:ring-violet-500"
        />
        <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
          Custom
          <Settings className="w-3 h-3 text-slate-400" />
        </span>
      </label>
    </div>
  );
}