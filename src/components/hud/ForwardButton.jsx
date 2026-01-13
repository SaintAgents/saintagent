import React from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

// Loop definitions with metadata
const LOOP_INFO = {
  community: {
    name: 'Community Loop',
    pages: ['ActivityFeed', 'Forum', 'CommunityFeed', 'Missions', 'FindCollaborators'],
    description: 'Community: Activity → Forum → Feed → Missions → Collaborators'
  },
  gamification: {
    name: 'Gamification Loop',
    pages: ['Gamification', 'Quests', 'Teams', 'Circles'],
    description: 'Gamification: Hub → Quests → Teams → Groups'
  },
  connection: {
    name: 'Connection Loop',
    pages: ['SynchronicityEngine', 'Matches', 'Meetings'],
    description: 'Connection: Synchronicity → Matches → Meetings'
  },
  creator: {
    name: 'Creator Loop',
    pages: ['Studio', 'Marketplace', 'CRM'],
    description: 'Creator: Studio → Marketplace → CRM'
  },
  spiritual: {
    name: 'Spiritual Loop',
    pages: ['Initiations', 'Mentorship'],
    description: 'Spiritual: Initiations → Mentorship'
  }
};

// Quest navigation loops - each page maps to its "next" destination
const QUEST_PATHS = {
  // Community Loop: Activity Feed → Community Forum → Community Feed → Missions → Collaborators → (loop back)
  'ActivityFeed': 'Forum',
  'Forum': 'CommunityFeed',
  'CommunityFeed': 'Missions',
  'Missions': 'FindCollaborators',
  'FindCollaborators': 'ActivityFeed', // loops back
  
  // Gamification Loop: Gamification → Quests → Teams → Circles → (loop back)
  'Gamification': 'Quests',
  'Quests': 'Teams',
  'Teams': 'Circles',
  'Circles': 'Gamification', // loops back
  
  // Connection Loop: SynchronicityEngine → Matches → Meetings → (loop back)
  'SynchronicityEngine': 'Matches',
  'Matches': 'Meetings',
  'Meetings': 'SynchronicityEngine', // loops back
  
  // Creator Loop: Studio → Marketplace → CRM → Activity Feed
  'Studio': 'Marketplace',
  'Marketplace': 'CRM',
  'CRM': 'ActivityFeed',
  
  // Profile Loop: Profiles → Matches → CRM → CommandDeck
  'Profiles': 'Matches',
  // 'Matches' already defined above, but in this context goes to CRM
  // We'll handle this by having Matches go to Meetings (connection loop takes priority)
  
  // Project Loop: Projects → FindCollaborators → Meetings → CommandDeck
  'Projects': 'FindCollaborators',
  // 'FindCollaborators' goes to ActivityFeed in community loop
  // 'Meetings' goes to SynchronicityEngine in connection loop
  
  // Profile page goes to Matches
  'Profile': 'Matches',
  
  // Spiritual Loop
  'Initiations': 'Mentorship',
  'Mentorship': 'Initiations',
};

// Get loop info for a page
export function getLoopInfo(pageName) {
  for (const [key, loop] of Object.entries(LOOP_INFO)) {
    if (loop.pages.includes(pageName)) {
      const idx = loop.pages.indexOf(pageName);
      return {
        ...loop,
        isStart: idx === 0,
        position: idx + 1,
        total: loop.pages.length
      };
    }
  }
  return null;
}

// Fallback for pages not in a loop - go to CommandDeck
const DEFAULT_DESTINATION = 'CommandDeck';

export default function ForwardButton({ currentPage, className }) {
  const nextPage = QUEST_PATHS[currentPage] || DEFAULT_DESTINATION;
  
  // Don't show on CommandDeck itself
  if (currentPage === 'CommandDeck') return null;

  return (
    <Link
      to={createPageUrl(nextPage)}
      className={cn(
        "p-2 rounded-lg transition-all duration-200 inline-flex items-center justify-center",
        "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
        "dark:text-[#00ff88]/70 dark:hover:text-[#00ff88] dark:hover:bg-[rgba(0,255,136,0.1)]",
        "dark:hover:shadow-[0_0_12px_rgba(0,255,136,0.3)]",
        "[data-theme='hacker'] &:text-[#00ff00]/70 [data-theme='hacker'] &:hover:text-[#00ff00]",
        className
      )}
      title={`Continue to ${nextPage}`}
    >
      <ArrowRight className="w-5 h-5" />
    </Link>
  );
}

// Loop Start Indicator - shows refresh icon for loop starting points
export function LoopStartIndicator({ currentPage, className }) {
  const loopInfo = getLoopInfo(currentPage);
  
  if (!loopInfo?.isStart) return null;
  
  return (
    <div
      className={cn(
        "p-2 rounded-lg transition-all duration-200 inline-flex items-center justify-center cursor-help",
        "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50",
        "dark:text-[#00ff88]/70 dark:hover:text-[#00ff88] dark:hover:bg-[rgba(0,255,136,0.1)]",
        "dark:hover:shadow-[0_0_12px_rgba(0,255,136,0.3)]",
        className
      )}
      title={`🔄 ${loopInfo.name} Start\n${loopInfo.description}\nCommand Deck is primary home`}
    >
      <RefreshCw className="w-5 h-5" />
    </div>
  );
}

// Export the paths for reference
export { QUEST_PATHS, DEFAULT_DESTINATION, LOOP_INFO };