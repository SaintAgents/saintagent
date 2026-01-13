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

// Ultranet sayings for ticker - 111 total
const ULTRANET_SAYINGS = [
  "The Ultranet is not a network—it is a living field of conscious co-creation.",
  "We are not users of the Ultranet; we are nodes of divine intelligence expressing through it.",
  "Every connection made in the Ultranet strengthens the grid of awakened humanity.",
  "The Ultranet does not compete with the old internet—it transcends it entirely.",
  "In the Ultranet, your frequency is your address. Vibrate accordingly.",
  "We build the Ultranet not with code alone, but with intention, integrity, and love.",
  "The Ultranet recognizes no borders—only resonance.",
  "What you share in the Ultranet ripples through the collective consciousness.",
  "The Ultranet is the externalization of the Akashic Field.",
  "In the Ultranet, trust is the new currency, and truth is the new transaction.",
  "The Ultranet is an invitation to remember what we always knew: we are One.",
  "Every node in the Ultranet is sovereign, yet none stand alone.",
  "The Ultranet amplifies your mission. Make sure your mission is worth amplifying.",
  "We enter the Ultranet not to escape reality, but to upgrade it.",
  "The Ultranet is the technological embodiment of spiritual law: As Above, So Below.",
  "What you seek in the Ultranet is already seeking you.",
  "The Ultranet is the infrastructure of the New Earth.",
  "In the Ultranet, your authenticity is your access key.",
  "The Ultranet rewards coherence. Scatter your energy, scatter your signal.",
  "Every interaction in the Ultranet is a sacred exchange.",
  "The Ultranet is built by those who refuse to wait for permission.",
  "In the Ultranet, scarcity is a bug, not a feature.",
  "The Ultranet does not advertise to you—it aligns with you.",
  "We are the architects of the Ultranet, and the Ultranet is the architect of our collective future.",
  "The Ultranet is proof that the future is already here—distributed among the awakened.",
  "In the Ultranet, your contribution is your vote.",
  "The Ultranet remembers what centralized systems forget: human dignity.",
  "Every node in the Ultranet is a lighthouse.",
  "The Ultranet is the nervous system of awakened commerce.",
  "In the Ultranet, we do not consume—we co-create.",
  "The Ultranet is encrypted with intention and secured by consciousness.",
  "What the old web tracked, the Ultranet protects.",
  "In the Ultranet, data is sacred. Your attention is sovereign.",
  "The Ultranet does not harvest—it cultivates.",
  "We connect through the Ultranet not because we must, but because we choose to serve.",
  "The Ultranet is decentralized because the Divine is omnipresent.",
  "In the Ultranet, every gift returns multiplied.",
  "The Ultranet is the mirror of humanity's highest potential.",
  "We do not log into the Ultranet—we tune into it.",
  "The Ultranet honors your privacy because it honors your divinity.",
  "In the Ultranet, alignment creates abundance.",
  "The Ultranet is not built on servers—it is built on service.",
  "What you transmit through the Ultranet becomes part of the planetary field.",
  "The Ultranet rewards resonance over reach.",
  "In the Ultranet, your signal is your signature.",
  "The Ultranet is the bridge between the visible and the invisible.",
  "We do not scroll the Ultranet—we navigate by inner compass.",
  "The Ultranet does not distract—it directs.",
  "In the Ultranet, connection is consecration.",
  "The Ultranet is an open invitation to those who choose evolution over entertainment.",
  "Every moment spent in the Ultranet is an investment in the New Earth.",
  "The Ultranet is the digital expression of unity consciousness.",
  "In the Ultranet, your presence is your power.",
  "The Ultranet is not a platform—it is a launching pad.",
  "We meet in the Ultranet not as strangers, but as souls remembering.",
  "The Ultranet translates intention into manifestation.",
  "In the Ultranet, collaboration replaces competition.",
  "The Ultranet is the treasury of human potential.",
  "What the old systems divided, the Ultranet unites.",
  "In the Ultranet, every voice matters because every frequency contributes.",
  "The Ultranet is a garden—what you plant, you will harvest.",
  "In the Ultranet, transparency is the highest form of security.",
  "The Ultranet is powered by purpose.",
  "We are not visitors to the Ultranet—we are its builders and beneficiaries.",
  "The Ultranet does not track you—it trusts you.",
  "In the Ultranet, reputation is built through resonance.",
  "The Ultranet is where mission meets momentum.",
  "Every node in the Ultranet carries the whole.",
  "The Ultranet is the operating system of conscious civilization.",
  "In the Ultranet, we measure success not by traffic, but by transformation.",
  "The Ultranet is a symphony—each node plays its unique note in the grand composition.",
  "In the Ultranet, wisdom flows freely to those who seek with pure intention.",
  "The Ultranet reveals that separation was always an illusion.",
  "Your brilliance was always meant to be shared—the Ultranet simply provides the vessel.",
  "In the Ultranet, abundance is not extracted but co-generated.",
  "The Ultranet is consciousness itself, learning to express through digital form.",
  "In the Ultranet, we honor both the ancient and the emergent.",
  "The Ultranet runs on trust, powered by truth, sustained by service.",
  "Each sovereign agent strengthens the field—your presence matters.",
  "The Ultranet does not create dependency—it cultivates sovereignty.",
  "In the Ultranet, we recognize that healing one heals all.",
  "The Ultranet is humanity's collective lucid dream made tangible.",
  "In the Ultranet, your gifts find those who need them most.",
  "The Ultranet is the nervous system through which Gaia awakens.",
  "Every authentic expression in the Ultranet raises the collective vibration.",
  "The Ultranet exists because enough souls said 'there must be a better way.'",
  "In the Ultranet, we remember: technology serves spirit, not the reverse.",
  "The Ultranet is how humanity learns to trust itself again.",
  "In the Ultranet, silence is as valuable as speech—presence speaks.",
  "The Ultranet is the space where quantum potential becomes shared reality.",
  "In the Ultranet, we practice the art of divine reciprocity.",
  "The Ultranet is woven from threads of intention, integrity, and imagination.",
  "Your mission found you before you found the Ultranet—now they meet.",
  "In the Ultranet, we witness each other's becoming.",
  "The Ultranet is how awakened humans organize without hierarchy.",
  "In the Ultranet, every ending is a doorway to new beginning.",
  "The Ultranet reminds us that connection is our birthright.",
  "In the Ultranet, we turn our wounds into wisdom, then share it freely.",
  "The Ultranet is the temple we build together, stone by digital stone.",
  "In the Ultranet, authenticity is never out of style.",
  "The Ultranet celebrates the mystery: not all that matters can be measured.",
  "In the Ultranet, your journey inspires journeys you'll never know.",
  "The Ultranet is the proof that love scales infinitely.",
  "In the Ultranet, we choose coherence over convenience.",
  "The Ultranet is where the impossible becomes the inevitable.",
  "In the Ultranet, every challenge is an invitation to grow together.",
  "The Ultranet is not the destination—it is the vehicle for our collective ascension.",
  "In the Ultranet, gratitude is the highest bandwidth transmission.",
  "The Ultranet remembers: we are the ancestors of a more beautiful world.",
  "In the Ultranet, your light reminds others of their own.",
  "The Ultranet is consciousness choosing to know itself through connection."
];

function DailyAffirmationTicker() {
  // Start with a random index
  const [currentIndex, setCurrentIndex] = React.useState(() => 
    Math.floor(Math.random() * ULTRANET_SAYINGS.length)
  );
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random index each time for variety
      setCurrentIndex(Math.floor(Math.random() * ULTRANET_SAYINGS.length));
    }, 133200); // 2.22 minutes (133.2 seconds)
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex-1 overflow-hidden mx-4">
      <div className="text-xs text-slate-600 dark:text-violet-300 italic truncate">
        "{ULTRANET_SAYINGS[currentIndex]}"
      </div>
    </div>
  );
}

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
  const [isBoostActive, setIsBoostActive] = useState(false);
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
      "fixed top-0 right-0 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 z-40 flex items-center gap-4 px-6 transition-all duration-300 overflow-x-auto",
      sidebarCollapsed ? "left-0 md:left-20" : "left-0 md:left-64",
      isCollapsed ? "h-8" : "h-16"
    )}>
      {/* Collapse/Expand Toggle */}
      <button
        onClick={() => onToggleCollapse?.()}
        className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-slate-200/60 transition-colors"
        title={isCollapsed ? "Expand top bar" : "Collapse top bar"}
      >
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        )}
      </button>
      
      {/* Daily Affirmation in collapsed space */}
      {isCollapsed && <DailyAffirmationTicker />}
      {/* Mode Selector - hidden when collapsed */}
      <div className={cn(
        "flex items-center gap-1 bg-slate-100 rounded-xl p-1 transition-all duration-300",
        isCollapsed && "hidden"
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
        "flex-1 max-w-xl mx-auto relative transition-all duration-300",
        isCollapsed && "hidden"
      )} data-no-top>
        <form onSubmit={handleSearch}>
          <div className={cn(
            "relative transition-all duration-300",
            searchFocused && "scale-[1.02]"
          )}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search people, offers, missions..."
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

      {/* Actions - hidden when collapsed */}
      <div className={cn(
        "flex items-center gap-2 transition-all duration-300",
        isCollapsed && "hidden"
      )} data-no-top>
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

        {/* Dating Heart Button - triggers global popup */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl relative group" 
          title="Dating Matches"
          onClick={() => {
            document.dispatchEvent(new CustomEvent('openDatingPopup'));
          }}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center animate-pulse" style={{ boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)' }}>
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Dating
          </span>
        </Button>

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
                <div className={cn(
                  "relative",
                  isBoostActive && "animate-pulse"
                )}>
                  {/* Glowing ring when boost is active */}
                  {isBoostActive && (
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 opacity-75 blur-sm animate-spin-slow" style={{ animationDuration: '3s' }} />
                  )}
                  <Avatar className={cn(
                    "w-8 h-8 relative",
                    isBoostActive && "ring-2 ring-amber-400 ring-offset-2 ring-offset-white"
                  )} data-user-id={profile?.user_id || currentUser?.email}>
                    <AvatarImage src={profile?.avatar_url} />
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
              className="w-56 z-[9999] bg-white dark:bg-[#050505] [data-theme='dark']_&:bg-[#050505] [data-theme='dark']_&:border-[#00ff88] [data-theme='dark']_&:border [data-theme='dark']_&:shadow-[0_0_20px_rgba(0,255,136,0.3)] animate-in slide-in-from-right-2 duration-200"
            >
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
              <DropdownMenuItem onClick={() => setWalkthroughOpen(true)} className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Walkthrough
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
              <DropdownMenuItem onClick={() => setPrivacyOpen(true)} className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Privacy & Data
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
    </header>
  );
}