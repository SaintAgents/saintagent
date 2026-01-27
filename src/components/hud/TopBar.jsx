import React, { useState, useEffect, useRef } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  BookOpen,
  Lock,
  Heart,
  Users,
  ShoppingBag,
  Target,
  CircleDot,
  X,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import NotificationBell from './NotificationBell';
import ModeHelpModal from './ModeHelpModal';
import WalkthroughModal from './WalkthroughModal';
import DatingMatchesPopup from './DatingMatchesPopup';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MastersMessagesTicker from './MastersMessagesTicker';
import QuickStartGuideModal from '../onboarding/QuickStartGuideModal';
import SaintBrowser from '../browser/SaintBrowser';

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
  sidebarCollapsed,
  isCollapsed,
  onToggleCollapse
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [helpMode, setHelpMode] = useState(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [datingSearching, setDatingSearching] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  const searchRef = useRef(null);
  
  // Listen for boost activation event
  useEffect(() => {
    const handleBoostActivated = () => {
      setIsBoostActive(true);
    };
    
    // Check if boost is already active from profile data
    if (profile?.is_boosted || (profile?.boost_expires_at && new Date(profile.boost_expires_at) > new Date())) {
      setIsBoostActive(true);
    }
    
    window.addEventListener('boostActivated', handleBoostActivated);
    return () => window.removeEventListener('boostActivated', handleBoostActivated);
  }, [profile]);

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

  // Search data
  const { data: searchProfiles = [] } = useQuery({
    queryKey: ['topbarSearchProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200),
    enabled: showResults
  });

  const { data: searchListings = [] } = useQuery({
    queryKey: ['topbarSearchListings'],
    queryFn: () => base44.entities.Listing.list('-created_date', 50),
    enabled: showResults
  });

  const { data: searchMissions = [] } = useQuery({
    queryKey: ['topbarSearchMissions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 50),
    enabled: showResults
  });

  const { data: searchCircles = [] } = useQuery({
    queryKey: ['topbarSearchCircles'],
    queryFn: () => base44.entities.Circle.list('-created_date', 50),
    enabled: showResults
  });

  // Filter results based on query
  const filterResults = (items, fields) => {
    if (!searchQuery.trim()) return [];
    const term = searchQuery.toLowerCase().trim().replace(/^@/, '');
    return items.filter(item => 
      fields.some(f => item[f] && String(item[f]).toLowerCase().includes(term))
    ).slice(0, 5);
  };

  const filteredProfiles = filterResults(searchProfiles, ['handle', 'display_name', 'bio']);
  const filteredListings = filterResults(searchListings, ['title', 'description']);
  const filteredMissions = filterResults(searchMissions, ['title', 'objective']);
  const filteredCircles = filterResults(searchCircles, ['name', 'description']);

  const totalResults = filteredProfiles.length + filteredListings.length + filteredMissions.length + filteredCircles.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (type, item) => {
    setShowResults(false);
    setSearchQuery('');
    if (type === 'profile') {
      window.location.href = createPageUrl('Profile') + `?id=${item.user_id}`;
    } else if (type === 'listing') {
      window.location.href = createPageUrl('ListingDetail') + `?id=${item.id}`;
    } else if (type === 'mission') {
      window.location.href = createPageUrl('MissionDetail') + `?id=${item.id}`;
    } else if (type === 'circle') {
      window.location.href = createPageUrl('Circles') + `?id=${item.id}`;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(true);
      // Also trigger the search modal callback if provided
      if (onSearch) {
        onSearch(searchQuery);
      }
    }
  };

  return (
    <header className={cn(
      "fixed top-0 right-0 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 flex items-center gap-2 md:gap-4 px-2 md:px-6 transition-all duration-300 overflow-x-auto scrollbar-hide",
      "left-0",
      sidebarCollapsed ? "md:left-20" : "md:left-64",
      isCollapsed ? "h-10" : "h-14"
    )} style={{ zIndex: 9999 }}>
      {/* Collapse/Expand Toggle */}
      <button
        onClick={() => onToggleCollapse?.()}
        className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-md hover:bg-slate-200/60 transition-colors shrink-0"
        style={{ zIndex: 10001, position: 'relative', pointerEvents: 'auto' }}
        title={isCollapsed ? "Expand top bar" : "Collapse top bar"}
      >
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-slate-500" style={{ pointerEvents: 'none' }} />
        ) : (
          <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-slate-500" style={{ pointerEvents: 'none' }} />
        )}
      </button>
      
      {/* Masters Messages - shows when topbar is collapsed */}
      {isCollapsed && <MastersMessagesTicker />}
      
      {/* Theme dots - shows when collapsed */}
      {isCollapsed && (
        <div className="flex items-center gap-1.5 mr-2">
          <button
            onClick={() => {
              localStorage.setItem('theme', 'light');
              document.documentElement.setAttribute('data-theme', 'light');
            }}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              "bg-gradient-to-br from-amber-300 to-orange-400",
              document.documentElement.getAttribute('data-theme') === 'light' && "ring-2 ring-offset-1 ring-amber-500"
            )}
            title="Light theme"
          />
          <button
            onClick={() => {
              localStorage.setItem('theme', 'dark');
              document.documentElement.setAttribute('data-theme', 'dark');
            }}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              "bg-gradient-to-br from-slate-600 to-slate-900",
              document.documentElement.getAttribute('data-theme') === 'dark' && "ring-2 ring-offset-1 ring-slate-500"
            )}
            title="Dark theme"
          />
          <button
            onClick={() => {
              localStorage.setItem('theme', 'hacker');
              document.documentElement.setAttribute('data-theme', 'hacker');
            }}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              "bg-gradient-to-br from-green-400 to-emerald-600",
              document.documentElement.getAttribute('data-theme') === 'hacker' && "ring-2 ring-offset-1 ring-green-500"
            )}
            title="Hacker theme"
          />
        </div>
      )}
      {/* Mode Selector - hidden when collapsed */}
      <div className={cn(
        "flex flex-wrap items-center gap-1 bg-slate-100 rounded-xl p-1 transition-all duration-300 flex",
        isCollapsed && "!hidden"
      )} data-no-top>
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

      {/* Search - hidden when collapsed */}
      <div ref={searchRef} className={cn(
        "flex-1 max-w-xl mx-auto relative transition-all duration-300 hidden md:block",
        isCollapsed && "!hidden"
      )} data-no-top>
        <form onSubmit={handleSearch}>
          <div className={cn(
            "relative transition-all duration-300",
            searchFocused && "scale-[1.02]"
          )}>
            <button
              type="button"
              onClick={() => {
                setShowResults(true);
                if (onSearch) onSearch('');
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-violet-600 transition-colors cursor-pointer z-10"
              title="Open search"
            >
              <Search className="w-4 h-4" />
            </button>
            <Input
              placeholder={searchFocused || searchQuery ? "Search people, offers, missions..." : "Enter deep search..."}
              className="w-full pl-10 pr-10 h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-xl"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) setShowResults(true);
              }}
              onFocus={() => {
                setSearchFocused(true);
                if (searchQuery.trim()) setShowResults(true);
              }}
              onBlur={() => setSearchFocused(false)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setShowResults(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Inline Results Dropdown */}
        {showResults && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 z-50 max-h-96 overflow-y-auto">
            {totalResults === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="py-2">
                {filteredProfiles.length > 0 && (
                  <div>
                    <p className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase">People</p>
                    {filteredProfiles.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleResultClick('profile', p)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={p.avatar_url} />
                          <AvatarFallback>{p.display_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{p.display_name}</p>
                          <p className="text-xs text-slate-500 truncate">@{p.handle}</p>
                        </div>
                        <Users className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}

                {filteredListings.length > 0 && (
                  <div>
                    <p className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase mt-2">Offers</p>
                    {filteredListings.map(l => (
                      <button
                        key={l.id}
                        onClick={() => handleResultClick('listing', l)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left"
                      >
                        <ShoppingBag className="w-8 h-8 p-1.5 rounded-lg bg-emerald-100 text-emerald-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{l.title}</p>
                          <p className="text-xs text-slate-500">{l.is_free ? 'Free' : `$${l.price_amount}`}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredMissions.length > 0 && (
                  <div>
                    <p className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase mt-2">Missions</p>
                    {filteredMissions.map(m => (
                      <button
                        key={m.id}
                        onClick={() => handleResultClick('mission', m)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left"
                      >
                        <Target className="w-8 h-8 p-1.5 rounded-lg bg-amber-100 text-amber-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{m.title}</p>
                          <p className="text-xs text-slate-500">{m.participant_count || 0} joined</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredCircles.length > 0 && (
                  <div>
                    <p className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase mt-2">Circles</p>
                    {filteredCircles.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleResultClick('circle', c)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left"
                      >
                        <CircleDot className="w-8 h-8 p-1.5 rounded-lg bg-blue-100 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.member_count || 0} members</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions - always visible, compact on mobile */}
      <div className={cn(
        "flex items-center transition-all duration-300 ml-auto flex-shrink-0 relative",
        isCollapsed ? "gap-0.5" : "gap-1 md:gap-2"
      )} style={{ zIndex: 10000 }}>
        {/* SaintBrowser */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setBrowserOpen(true)}
          className="rounded-xl relative group hidden md:flex w-8 h-8 md:w-9 md:h-9" 
          title="SaintBrowser"
        >
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center">
            <Globe className="w-3 h-3 md:w-3.5 md:h-3.5 text-black" />
          </div>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            SaintBrowser
          </span>
        </Button>

        {/* Language - hidden on mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl relative group hidden md:flex w-8 h-8 md:w-9 md:h-9" title="Language">
              <Globe className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
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

        {/* Dating Heart Button - opens dating popup (hidden if user opted out) */}
        {!profile?.dating_opt_out && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl relative group w-8 h-8 md:w-9 md:h-9 p-0" 
            title="Dating Matches"
            disabled={datingSearching}
            onClick={() => {
              setDatingSearching(true);
              // Show loading briefly then open popup
              setTimeout(() => {
                setDatingSearching(false);
                document.dispatchEvent(new CustomEvent('openDatingPopup'));
              }, 600);
            }}
          >
            {datingSearching ? (
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center" style={{ boxShadow: '0 0 15px rgba(236, 72, 153, 0.8)' }}>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center animate-pulse" style={{ boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)' }}>
                <Heart className="w-3 h-3 md:w-3.5 md:h-3.5 text-white fill-white" />
              </div>
            )}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
              {datingSearching ? 'Searching...' : 'Dating Matches'}
            </span>
          </Button>
        )}

        <Link to={createPageUrl('DailyOps')} className="hidden md:block">
          <Button variant="ghost" size="icon" className="rounded-xl relative group w-8 h-8 md:w-9 md:h-9" title="Calendar">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Calendar
            </span>
          </Button>
        </Link>
        {/* Messages */}
        <Link to={createPageUrl('Messages')}>
          <Button variant="ghost" size="icon" className="relative group w-8 h-8 md:w-9 md:h-9" title="Messages">
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
            {unreadMessages.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full">
                {unreadMessages.length}
              </span>
            )}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
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
        {currentUser && profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 md:h-10 px-1 md:px-2 gap-1 md:gap-2 rounded-xl">
                <div className={cn(
                  "relative",
                  isBoostActive && "animate-pulse"
                )}>
                  {/* Glowing ring when boost is active */}
                  {isBoostActive && (
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 opacity-75 blur-sm animate-spin-slow" style={{ animationDuration: '3s' }} />
                  )}
                  <Avatar className={cn(
                    "w-7 h-7 md:w-8 md:h-8 relative",
                    isBoostActive && "ring-2 ring-amber-400 ring-offset-2 ring-offset-white"
                  )} data-user-id={profile?.user_id || currentUser?.email}>
                    {profile?.avatar_url && (
                      <AvatarImage src={profile.avatar_url} alt={profile?.display_name} />
                    )}
                    <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                      {(profile?.display_name || currentUser?.full_name || 'U').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {isBoostActive && (
                  <Badge className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white text-[10px] px-1.5 animate-pulse">
                    BOOSTED
                  </Badge>
                )}
                {profile?.leader_tier === 'verified144k' && !isBoostActive && (
                  <Badge className="bg-amber-100 text-amber-700 text-xs">144K</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              sideOffset={12}
              className="w-72 z-[9999] bg-white dark:bg-[#050505] [data-theme='dark']_&:bg-[#050505] [data-theme='dark']_&:border-[#00ff88] [data-theme='dark']_&:border [data-theme='dark']_&:shadow-[0_0_20px_rgba(0,255,136,0.3)] animate-in slide-in-from-right-2 duration-200 p-0"
            >
              {/* Avatar Card Header */}
              <div className="flex flex-col items-center py-5 px-4 border-b border-slate-100 dark:border-slate-800">
                <Avatar className="w-16 h-16 mb-3 ring-2 ring-violet-100 dark:ring-violet-900">
                  {profile?.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={profile?.display_name} />
                  )}
                  <AvatarFallback className="bg-violet-100 text-violet-600 text-xl">
                    {(profile?.display_name || currentUser?.full_name || 'U').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-slate-900 dark:text-white text-base">
                  {profile?.display_name || currentUser?.full_name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {currentUser?.email}
                </p>
                {profile?.sa_number && (
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-1 font-medium">
                    SA# {profile.sa_number}
                  </p>
                )}
              </div>

              {/* Menu Items */}
              <ScrollArea className="max-h-[60vh]">
              <div className="py-2">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('CommandDeck')} className="flex items-center gap-3 px-4 py-2.5">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>My Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('Settings')} className="flex items-center gap-3 px-4 py-2.5">
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setQuickStartOpen(true)} className="flex items-center gap-3 px-4 py-2.5 text-violet-600 font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Quick Start Guide</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="my-0" />

              <div className="py-2">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('UserGuide')} className="flex items-center gap-3 px-4 py-2.5">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>User Guide</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setWalkthroughOpen(true)} className="flex items-center gap-3 px-4 py-2.5">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Walkthrough</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('FAQ')} className="flex items-center gap-3 px-4 py-2.5">
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <span>Help / FAQ</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPrivacyOpen(true)} className="flex items-center gap-3 px-4 py-2.5">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Privacy & Data</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('Terms')} className="flex items-center gap-3 px-4 py-2.5">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span>Terms & Conditions</span>
                  </Link>
                </DropdownMenuItem>
              </div>

              {currentUser?.role === 'admin' && (
                <>
                  <DropdownMenuSeparator className="my-0" />
                  <div className="py-2">
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Admin')} className="flex items-center gap-3 px-4 py-2.5 text-violet-600">
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                </>
              )}

              <DropdownMenuSeparator className="my-0" />
              <div className="py-2">
                <DropdownMenuItem onClick={() => base44.auth.logout(createPageUrl('Landing'))} className="flex items-center gap-3 px-4 py-2.5 text-rose-600">
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : currentUser && !profile ? (
          // User logged in but profile still loading - show loading avatar
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7 md:w-8 md:h-8 animate-pulse">
              <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
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
      {/* Privacy Modal */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Lock className="w-5 h-5 text-violet-600" />
              Privacy & Data Ownership
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-4">
            <div className="space-y-6 text-sm">
              <p className="text-slate-600">
                SaintAgent prioritizes your privacy and data ownership in ways traditional social platforms don't:
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-violet-600" />
                    Privacy & Data Control
                  </h3>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• Your data stays yours—SaintAgent doesn't mine, sell, or monetize your personal information</li>
                    <li>• No algorithmic manipulation or surveillance capitalism model</li>
                    <li>• You control what you share and with whom</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    Decentralized Architecture
                  </h3>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• Built on decentralized principles, reducing single-point-of-failure risks</li>
                    <li>• Not controlled by a single corporate entity harvesting user data for ad revenue</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Transparent Business Model
                  </h3>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• Revenue comes from value-added services, not from selling your attention and data to advertisers</li>
                    <li>• No hidden data collection or opaque terms of service</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Community-Owned
                  </h3>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• Designed for genuine collaboration and skill-sharing through the marketplace</li>
                    <li>• Focus on peer-to-peer value exchange rather than engagement addiction</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-rose-600" />
                    No Surveillance Advertising
                  </h3>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• Unlike other platforms' tracking across the web, SaintAgent doesn't follow you around the internet</li>
                    <li>• No psychological profiling or micro-targeted manipulation</li>
                  </ul>
                </div>
              </div>

              <p className="text-slate-700 font-medium text-center pt-4 border-t">
                SaintAgent represents a fundamentally different approach: a platform that serves its users rather than treating them as the product.
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Walkthrough Modal */}
      <WalkthroughModal open={walkthroughOpen} onClose={() => setWalkthroughOpen(false)} />
      
      {/* Quick Start Guide Modal */}
      <QuickStartGuideModal open={quickStartOpen} onOpenChange={setQuickStartOpen} />
      
      {/* SaintBrowser Modal */}
      <SaintBrowser open={browserOpen} onClose={() => setBrowserOpen(false)} />
    </header>
  );
}