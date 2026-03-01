import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard, Users, Target, ShoppingBag, Calendar, 
  Settings, Trophy, Folder, Radio, UserCircle, HelpCircle,
  Heart, Zap, MessageSquare, Compass, UserPlus, BookOpen, 
  Activity, Globe, Briefcase, ChevronLeft, ChevronRight,
  Orbit, Newspaper, Sun, Moon, Terminal, Menu, Shield
} from 'lucide-react';

import TopBar from '@/components/hud/TopBar';
import MobileMenuSheet from '@/components/hud/MobileMenuSheet';
import ProfileDrawer from '@/components/ProfileDrawer';
import FloatingChatWidget from '@/components/FloatingChatWidget';
import FloatingNotesWidget from '@/components/notes/FloatingNotesWidget';
import DatingMatchesPopup from '@/components/hud/DatingMatchesPopup';
import HelpSupportAgent from '@/components/support/HelpSupportAgent';
import GlobalChatWidget from '@/components/community/GlobalChatWidget';

// Navigation items
const NAV_ITEMS = [
  { id: 'command', label: 'Command Deck', icon: LayoutDashboard, page: 'CommandDeck' },
  { id: 'forum', label: 'Forum', icon: MessageSquare, page: 'Forum' },
  { id: 'initiations', label: 'Initiations', icon: BookOpen, page: 'Initiations' },
  { id: 'quests', label: 'Quests', icon: Zap, page: 'Quests' },
  { id: 'synchronicity', label: 'Synchronicity', icon: Orbit, page: 'SynchronicityEngine' },
  { id: 'gamification', label: 'Gamification', icon: Trophy, page: 'Gamification' },
  { id: 'matches', label: 'Matches', icon: Heart, page: 'Matches' },
  { id: 'meetings', label: 'Meetings', icon: Calendar, page: 'Meetings' },
  { id: 'missions', label: 'Missions', icon: Target, page: 'Missions' },
  { id: 'projects', label: 'Projects', icon: Folder, page: 'Projects' },
  { id: 'profiles', label: 'Profiles', icon: UserCircle, page: 'Profiles' },
  { id: 'crm', label: 'CRM', icon: Users, page: 'CRM' },
  { id: 'deals', label: 'Deals', icon: Briefcase, page: 'Deals' },
  { id: 'activity', label: 'Activity', icon: Activity, page: 'ActivityFeed' },
  { id: 'community', label: 'Community', icon: Compass, page: 'CommunityFeed' },
  { id: 'collaborators', label: 'Collaborators', icon: UserPlus, page: 'FindCollaborators' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, page: 'Marketplace' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, page: 'Messages' },
  { id: 'events', label: 'Events', icon: Globe, page: 'Events' },
  { id: 'circles', label: 'Circles', icon: Users, page: 'Circles' },
  { id: 'news', label: 'News', icon: Newspaper, page: 'News' },
  { id: 'leaderboards', label: 'Leaderboards', icon: Trophy, page: 'Leaderboards' },
  { id: 'settings', label: 'Settings', icon: Settings, page: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [topbarCollapsed, setTopbarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [mode, setMode] = useState('command');

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
    staleTime: 300000
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }, '-created_date', 1).then(r => r[0]),
    enabled: !!currentUser?.email,
    staleTime: 300000
  });

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem('sidebarCollapsed');
      if (savedCollapsed) setSidebarCollapsed(savedCollapsed === 'true');
      
      const savedTheme = localStorage.getItem('theme') || 'light';
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } catch {}
  }, []);

  // Save sidebar state
  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
    } catch {}
  }, [sidebarCollapsed]);

  // Theme change handler
  const cycleTheme = () => {
    const themes = ['light', 'dark', 'hacker'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setCurrentTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const getThemeIcon = () => {
    if (currentTheme === 'light') return <Sun className="w-4 h-4" />;
    if (currentTheme === 'dark') return <Moon className="w-4 h-4" />;
    return <Terminal className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505]">
      {/* Sidebar - Desktop only */}
      <aside
        data-sidebar
        className={cn(
          "fixed left-0 top-0 h-screen bg-white dark:bg-[#050505] border-r border-slate-200 dark:border-[rgba(0,255,136,0.2)] z-[60] transition-all duration-300 hidden md:flex flex-col",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-slate-200 dark:border-[rgba(0,255,136,0.2)]">
          {!sidebarCollapsed && (
            <Link to={createPageUrl('CommandDeck')} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">SaintAgent</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[rgba(0,255,136,0.1)] transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-[#00ff88]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-[#00ff88]" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="px-2 space-y-1 pb-20">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.id}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-violet-100 dark:bg-[rgba(0,255,136,0.2)] text-violet-700 dark:text-[#00ff88]"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[rgba(0,255,136,0.1)] hover:text-slate-900 dark:hover:text-white"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
            
            {/* Theme Toggle - moved inside nav for better scroll behavior */}
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-[rgba(0,255,136,0.2)]">
              <button
                onClick={cycleTheme}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  "text-slate-600 dark:text-[#00ff88] hover:bg-slate-100 dark:hover:bg-[rgba(0,255,136,0.1)]"
                )}
                title={`Current: ${currentTheme}. Click to change.`}
              >
                {getThemeIcon()}
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium capitalize">{currentTheme} Theme</span>
                )}
              </button>
            </div>
          </nav>
        </ScrollArea>
      </aside>

      {/* TopBar */}
      <TopBar
        mode={mode}
        onModeChange={setMode}
        profile={profile}
        currentUser={currentUser}
        sidebarCollapsed={sidebarCollapsed}
        isCollapsed={topbarCollapsed}
        onToggleCollapse={() => setTopbarCollapsed(!topbarCollapsed)}
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
      />

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "md:pl-16" : "md:pl-64",
          topbarCollapsed ? "pt-10" : "pt-14"
        )}
      >
        {children}
      </main>

      {/* Mobile Menu Button - in TopBar on mobile */}

      {/* Mobile Menu Sheet */}
      <MobileMenuSheet
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />

      {/* Profile Drawer */}
      <ProfileDrawer />

      {/* Floating Chat Widget */}
      <FloatingChatWidget />

      {/* Floating Notes Widget */}
      <FloatingNotesWidget />

      {/* Dating Matches Popup */}
      <DatingMatchesPopup />

      {/* Help Support Agent */}
      <HelpSupportAgent />

      {/* Global Chat Widget */}
      <GlobalChatWidget />
    </div>
  );
}