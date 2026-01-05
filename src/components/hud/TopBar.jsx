import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search,
  MessageCircle,
  User,
  Settings,
  Calendar,
  Sparkles,
  Crown,
  Shield,
  LogOut,
  Globe,
  HelpCircle,
  BookOpen
} from "lucide-react";
import NotificationBell from './NotificationBell';
import ModeHelpModal from './ModeHelpModal';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const MODE_TABS = [
  { id: 'command', label: 'Command', icon: Sparkles, page: 'CommandDeck' },
  { id: 'build', label: 'Build', page: 'Missions' },
  { id: 'teach', label: 'Teach', page: 'Studio' },

  { id: 'earn', label: 'Earn', page: 'Marketplace' },
];

export default function TopBar({ 
  mode,
  onModeChange,
  profile,
  currentUser,
  notifications = [],
  onSearch,
  onQuickCreate,
  onNotificationAction,
  sidebarCollapsed
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [helpMode, setHelpMode] = useState(null);

  const setLanguage = (code) => {
    try {
      localStorage.setItem('language', code);
      document.documentElement.setAttribute('lang', code);
      window.location.reload();
    } catch {}
  };


  const { data: unreadMessages = [] } = useQuery({
    queryKey: ['unreadMessages', currentUser?.email],
    queryFn: () => base44.entities.Message.filter({ to_user_id: currentUser.email, is_read: false }, '-created_date', 1000),
    enabled: !!currentUser?.email,
    refetchInterval: 5000
  });

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className={cn(
      "fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 z-40 flex items-center gap-4 px-6 transition-all duration-300",
      sidebarCollapsed ? "left-20" : "left-64"
    )}>
      {/* Mode Selector */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1" data-no-top>
        {MODE_TABS.map((tab) => (
          <div key={tab.id} className="flex items-center">
            <button
              onClick={() => {
                if (tab.page) {
                  window.location.href = createPageUrl(tab.page);
                } else {
                  onModeChange?.(tab.id);
                }
              }}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                mode === tab.id 
                  ? "bg-white text-violet-700 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
              {tab.locked && <Crown className="w-3 h-3 text-amber-500" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHelpMode(tab.id);
              }}
              className="p-1 rounded-full hover:bg-slate-200 transition-colors ml-0.5"
              title={`Learn about ${tab.label}`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-violet-600" />
            </button>
          </div>
        ))}
      </div>

      {/* Mode Help Modal */}
      <ModeHelpModal
        open={!!helpMode}
        onClose={() => setHelpMode(null)}
        mode={helpMode || 'command'}
      />

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto" data-no-top>
        <div className={cn(
          "relative transition-all duration-300",
          searchFocused && "scale-[1.02]"
        )}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search people, offers, missions, events..."
            className="w-full pl-10 h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-2" data-no-top>
        {/* Language */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl relative group" title="Language">
              <Globe className="w-5 h-5 text-slate-600" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Language
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('en-US')}>English (US)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('es-ES')}>Español</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('fr-FR')}>Français</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('de-DE')}>Deutsch</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('pt-BR')}>Português</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('ja-JP')}>日本語</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link to={createPageUrl('DailyOps')}>
          <Button variant="ghost" size="icon" className="rounded-xl relative group" title="Calendar">
            <Calendar className="w-5 h-5 text-slate-600" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Calendar
            </span>
          </Button>
        </Link>
        {/* Messages */}
        <Link to={createPageUrl('Messages')}>
          <Button variant="ghost" size="icon" className="relative group" title="Messages">
            <MessageCircle className="w-5 h-5 text-slate-600" />
            {unreadMessages.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full">
                {unreadMessages.length}
              </span>
            )}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Messages
            </span>
          </Button>
        </Link>


        {/* Notifications */}
        <NotificationBell 
          notifications={notifications} 
          onAction={onNotificationAction}
        />



        {/* Profile Menu / Auth */}
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-2 gap-2 rounded-xl">
                <Avatar className="w-8 h-8" data-user-id={profile?.user_id || currentUser?.email}>
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                    {(profile?.display_name || currentUser?.full_name || 'U').charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {profile?.leader_tier === 'verified144k' && (
                  <Badge className="bg-amber-100 text-amber-700 text-xs">144K</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('Profile')} className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('Settings')} className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('UserGuide')} className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  User Guide
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('FAQ')} className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Help / FAQ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('Terms')} className="flex items-center gap-2">
                  Terms & Conditions
                </Link>
              </DropdownMenuItem>
              {currentUser?.role === 'admin' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Admin')} className="flex items-center gap-2 text-violet-600">
                      <Shield className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => base44.auth.logout(createPageUrl('Landing'))}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => base44.auth.redirectToLogin(createPageUrl('Onboarding'))}
              className="bg-violet-600 hover:bg-violet-700 rounded-xl"
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}