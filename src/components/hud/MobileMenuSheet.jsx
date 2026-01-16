import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Users, Target, ShoppingBag, Calendar, Settings, 
  Trophy, Folder, Radio, UserCircle, HelpCircle,
  Heart, Zap, LayoutDashboard, MessageSquare, Compass,
  UserPlus, BookOpen, Activity, Map, Globe, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl p-0 bg-white dark:bg-[#0a0a0a]">
        <SheetHeader className="p-4 border-b border-slate-200 dark:border-[#00ff88]/20">
          <SheetTitle className="text-slate-900 dark:text-white">Menu</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(70vh-60px)] p-4">
          <div className="grid grid-cols-4 gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg",
                    "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700",
                    "hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:border-violet-300 dark:hover:border-[#00ff88]/30",
                    "transition-all active:scale-95"
                  )}
                >
                  <Icon className="w-5 h-5 text-violet-600 dark:text-[#00ff88]" />
                  <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 text-center leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}