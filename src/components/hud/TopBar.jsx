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
  Plus,
  MessageCircle,
  User,
  Settings,
  
  Sparkles,
  Crown,
  Shield
} from "lucide-react";
import NotificationBell from './NotificationBell';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const MODE_TABS = [
  { id: 'command', label: 'Command', icon: Sparkles, page: 'CommandDeck' },
  { id: 'build', label: 'Build', page: 'Missions' },
  { id: 'teach', label: 'Teach', page: 'Studio' },
  { id: 'lead', label: 'Lead', locked: true, page: 'LeaderChannel' },
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
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
        {MODE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (!tab.locked && tab.page) {
                window.location.href = createPageUrl(tab.page);
              } else if (!tab.locked) {
                onModeChange?.(tab.id);
              }
            }}
            disabled={tab.locked}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
              mode === tab.id 
                ? "bg-white text-violet-700 shadow-sm" 
                : "text-slate-600 hover:text-slate-900",
              tab.locked && "opacity-50 cursor-not-allowed"
            )}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
            {tab.locked && <Crown className="w-3 h-3 text-amber-500" />}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
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
      <div className="flex items-center gap-2">
        {/* Quick Create */}
        <Button 
          onClick={onQuickCreate}
          className="bg-violet-600 hover:bg-violet-700 rounded-xl h-10 px-4 gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create</span>
        </Button>

        {/* Messages */}
        <Link to={createPageUrl('Messages')}>
          <Button variant="ghost" size="icon" className="relative">
            <MessageCircle className="w-5 h-5 text-slate-600" />
            {notifications.filter(n => n.type === 'message').length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full">
                {notifications.filter(n => n.type === 'message').length}
              </span>
            )}
          </Button>
        </Link>

        {/* Notifications */}
        <NotificationBell 
          notifications={notifications} 
          onAction={onNotificationAction}
        />

        {/* Profile Menu / Auth */}
        {profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-2 gap-2 rounded-xl">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                    {profile?.display_name?.charAt(0) || 'U'}
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

            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              onClick={() => window.location.href = createPageUrl('Onboarding')}
              className="rounded-xl"
            >
              Explore
            </Button>
            <Button 
              onClick={() => window.location.href = createPageUrl('Onboarding')}
              className="bg-violet-600 hover:bg-violet-700 rounded-xl"
            >
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}