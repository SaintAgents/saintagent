import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Users, Target, ShoppingBag, Calendar, Settings, 
  Trophy, Folder, Radio, UserCircle, HelpCircle,
  Heart, Zap, LayoutDashboard, MessageSquare, Compass,
  UserPlus, BookOpen, Activity, Globe, Briefcase, PanelLeft, Orbit, Newspaper,
  LifeBuoy, MessagesSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getStoredViewMode, VIEW_MODE_CONFIG } from './DeckViewModeSelector';

// Full menu items with nav IDs for filtering - MUST MATCH Sidebar.jsx NAV_ITEMS
const menuItems = [
  { id: 'command', label: 'Command Deck', icon: LayoutDashboard, page: 'CommandDeck' },
  { id: 'betafeedback', label: 'Beta Feedback', icon: HelpCircle, page: 'BetaFeedback' },
  { id: 'forum', label: 'Forum', icon: MessageSquare, page: 'Forum' },
  { id: 'initiations', label: 'Initiations', icon: BookOpen, page: 'Initiations' },
  { id: 'quests', label: 'Quests', icon: Zap, page: 'Quests' },
  { id: 'synchronicity', label: 'Synchronicity', icon: Orbit, page: 'SynchronicityEngine' },
  { id: 'gamification', label: 'Gamification', icon: Trophy, page: 'Gamification' },
  { id: 'mentorship', label: 'Mentorship', icon: Users, page: 'Mentorship' },
  { id: 'matches', label: 'Matches', icon: Heart, page: 'Matches' },
  { id: 'meetings', label: 'Meetings', icon: Calendar, page: 'Meetings' },
  { id: 'missions', label: 'Missions', icon: Target, page: 'Missions' },
  { id: 'teams', label: 'Teams & Guilds', icon: Users, page: 'Teams' },
  { id: 'projects', label: 'Projects', icon: Folder, page: 'Projects' },
  { id: 'profiles', label: 'Profiles', icon: UserCircle, page: 'Profiles' },
  { id: 'crm', label: 'Contact Network', icon: Users, page: 'CRM' },
  { id: 'activity', label: 'Activity Feed', icon: Activity, page: 'ActivityFeed' },
  { id: 'communityfeed', label: 'Community', icon: Compass, page: 'CommunityFeed' },
  { id: 'collaborators', label: 'Collaborators', icon: UserPlus, page: 'FindCollaborators' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, page: 'Marketplace' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, page: 'Messages' },
  { id: 'events', label: 'Events', icon: Globe, page: 'Events' },
  { id: 'leader', label: 'Leader Channel', icon: Radio, page: 'LeaderChannel' },
  { id: 'circles', label: 'Circles', icon: Users, page: 'Circles' },
  { id: 'studio', label: 'Studio', icon: Briefcase, page: 'Studio' },
  { id: 'affiliate', label: 'Affiliate', icon: Globe, page: 'AffiliateCenter' },
  { id: 'news', label: 'News', icon: Newspaper, page: 'News' },
  { id: 'profile', label: 'Profile', icon: UserCircle, page: 'Profile' },
  { id: 'settings', label: 'Settings', icon: Settings, page: 'Settings' },
  { id: 'faq', label: 'Help & FAQ', icon: HelpCircle, page: 'FAQ' },
  { id: 'support', label: 'Support', icon: LifeBuoy, action: 'openSupport' },
  { id: 'globalchat', label: 'Global Chat', icon: MessagesSquare, action: 'openGlobalChat' },
];

export default function MobileMenuSheet({ open, onOpenChange }) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState(getStoredViewMode);

  // Listen for view mode changes
  useEffect(() => {
    const handleViewModeChange = (e) => {
      if (e.detail?.viewMode) {
        setViewMode(e.detail.viewMode);
      }
    };
    const handleStorage = () => {
      setViewMode(getStoredViewMode());
    };
    document.addEventListener('viewModeChange', handleViewModeChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      document.removeEventListener('viewModeChange', handleViewModeChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Filter menu items based on view mode and custom settings
  const filteredMenuItems = menuItems.filter(item => {
    const config = VIEW_MODE_CONFIG[viewMode];
    if (!config) return true;
    
    // For custom mode, check localStorage for custom nav items
    if (viewMode === 'custom') {
      try {
        const customCards = JSON.parse(localStorage.getItem('deckCustomCards') || '[]');
        // Map card IDs to nav IDs where applicable
        const cardToNavMap = {
          'circles': 'circles',
          'missions': 'missions',
          'meetings': 'meetings',
          'inbox': 'messages',
          'syncEngine': 'synchronicity',
          'projects': 'projects',
          'market': 'marketplace',
          'collaborators': 'collaborators',
          'leader': 'leader',
          'dailyops': 'dailyops',
          'communityFeed': 'communityfeed',
          'leaderboard': 'activity',
          'news': 'news',
        };
        // Always show these core items
        const alwaysShow = ['command', 'profile', 'settings', 'faq'];
        if (alwaysShow.includes(item.id)) return true;
        // Check if this nav item's corresponding card is enabled
        return customCards.some(cardId => cardToNavMap[cardId] === item.id);
      } catch {
        return true;
      }
    }
    
    if (!config.navIds) return true; // Show all if no filter
    return config.navIds.includes(item.id);
  });

  // Toggle left sidebar (icons only)
  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl p-0 bg-white dark:bg-[#0a0a0a]">
          <SheetHeader className="p-3 border-b border-slate-200 dark:border-[#00ff88]/20">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-slate-900 dark:text-white">Menu</SheetTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLeftSidebar}
                className="gap-1.5 text-xs mr-6"
              >
                <PanelLeft className="w-4 h-4" />
                Side Nav
              </Button>
            </div>
          </SheetHeader>
          <div className="overflow-y-auto h-[calc(60vh-56px)] p-3 pb-20">
            <div className="grid grid-cols-4 gap-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                
                // Handle action items (Support, Global Chat)
                if (item.action) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onOpenChange(false);
                        if (item.action === 'openSupport') {
                          document.dispatchEvent(new CustomEvent('openRightSideTab', { detail: { tab: 'help' } }));
                        } else if (item.action === 'openGlobalChat') {
                          document.dispatchEvent(new CustomEvent('openRightSideTab', { detail: { tab: 'chat' } }));
                        }
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 p-2 rounded-lg",
                        "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700",
                        "hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:border-violet-300 dark:hover:border-[#00ff88]/30",
                        "transition-all active:scale-95"
                      )}
                    >
                      <Icon className="w-5 h-5 text-violet-600 dark:text-[#00ff88]" />
                      <span className="text-[9px] font-medium text-slate-700 dark:text-slate-300 text-center leading-tight">{item.label}</span>
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 p-2 rounded-lg",
                      "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700",
                      "hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:border-violet-300 dark:hover:border-[#00ff88]/30",
                      "transition-all active:scale-95"
                    )}
                  >
                    <Icon className="w-5 h-5 text-violet-600 dark:text-[#00ff88]" />
                    <span className="text-[9px] font-medium text-slate-700 dark:text-slate-300 text-center leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Left Sidebar - Icons Only */}
      {leftSidebarOpen && (
        <div 
          className="fixed inset-0 z-[200] md:hidden"
          onClick={() => setLeftSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div 
            className="absolute left-0 top-0 bottom-0 w-16 bg-white dark:bg-[#0a0a0a] border-r border-slate-200 dark:border-[#00ff88]/20 overflow-y-auto py-2"
            onClick={(e) => e.stopPropagation()}
          >
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setLeftSidebarOpen(false)}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 mx-auto my-1 rounded-lg",
                    "hover:bg-violet-50 dark:hover:bg-violet-900/30",
                    "transition-all active:scale-95"
                  )}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 text-violet-600 dark:text-[#00ff88]" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}