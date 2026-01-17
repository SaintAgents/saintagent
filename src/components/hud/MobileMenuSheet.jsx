import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Users, Target, ShoppingBag, Calendar, Settings, 
  Trophy, Folder, Radio, UserCircle, HelpCircle,
  Heart, Zap, LayoutDashboard, MessageSquare, Compass,
  UserPlus, BookOpen, Activity, Globe, Briefcase, PanelLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const menuItems = [
  { label: 'Command Deck', icon: LayoutDashboard, page: 'CommandDeck' },
  { label: 'Matches', icon: Heart, page: 'Matches' },
  { label: 'Messages', icon: MessageSquare, page: 'Messages' },
  { label: 'Meetings', icon: Calendar, page: 'Meetings' },
  { label: 'Missions', icon: Target, page: 'Missions' },
  { label: 'Projects', icon: Folder, page: 'Projects' },
  { label: 'Collaborators', icon: UserPlus, page: 'FindCollaborators' },
  { label: 'Marketplace', icon: ShoppingBag, page: 'Marketplace' },
  { label: 'Studio', icon: Briefcase, page: 'Studio' },
  { label: 'Circles', icon: Users, page: 'Circles' },
  { label: 'Events', icon: Globe, page: 'Events' },
  { label: 'Gamification', icon: Trophy, page: 'Gamification' },
  { label: 'Quests', icon: Zap, page: 'Quests' },
  { label: 'Leaderboards', icon: Activity, page: 'Leaderboards' },
  { label: 'Community', icon: Compass, page: 'CommunityFeed' },
  { label: 'Leader Channel', icon: Radio, page: 'LeaderChannel' },
  { label: 'Daily Ops', icon: BookOpen, page: 'DailyOps' },
  { label: 'Profile', icon: UserCircle, page: 'Profile' },
  { label: 'Settings', icon: Settings, page: 'Settings' },
  { label: 'Help & FAQ', icon: HelpCircle, page: 'FAQ' },
];

export default function MobileMenuSheet({ open, onOpenChange }) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);

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
              {menuItems.map((item) => {
                const Icon = item.icon;
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
            {menuItems.map((item) => {
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