import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Crown, 
  TrendingUp, 
  Search, 
  X, 
  Calendar,
  Clock,
  Flame,
  Medal,
  Star,
  Users,
  Target,
  Sparkles
} from 'lucide-react';
import ForwardButton, { LoopStartIndicator } from '@/components/hud/ForwardButton';
import BackButton from '@/components/hud/BackButton';
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';
import { getRPRank } from '@/components/reputation/rpUtils';
import { RANK_BADGE_IMAGES } from '@/components/reputation/rankBadges';

const TIME_FILTERS = [
  { id: 'all', label: 'All Time', icon: Trophy },
  { id: 'monthly', label: 'This Month', icon: Calendar },
  { id: 'weekly', label: 'This Week', icon: Clock },
];

export default function Leaderboards() {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('rp');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfiles = [] } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const myProfile = myProfiles[0];

  // Fetch all profiles for leaderboard
  const { data: allProfiles = [], isLoading } = useQuery({
    queryKey: ['allLeaderboardProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-rank_points', 100),
  });

  // Filter by time
  const filteredByTime = useMemo(() => {
    if (!allProfiles.length) return [];
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let filtered = [...allProfiles];
    
    if (timeFilter === 'weekly') {
      filtered = filtered.filter(p => p.updated_date && new Date(p.updated_date) >= weekAgo);
    } else if (timeFilter === 'monthly') {
      filtered = filtered.filter(p => p.updated_date && new Date(p.updated_date) >= monthAgo);
    }
    
    return filtered.sort((a, b) => (Number(b?.rank_points) || 0) - (Number(a?.rank_points) || 0));
  }, [allProfiles, timeFilter]);

  // Search filter
  const searchedProfiles = useMemo(() => {
    if (!searchQuery.trim()) return filteredByTime;
    const q = searchQuery.toLowerCase();
    return filteredByTime.filter(p => 
      p.display_name?.toLowerCase().includes(q) || 
      p.handle?.toLowerCase().includes(q)
    );
  }, [filteredByTime, searchQuery]);

  // Find current user's position
  const currentUserPosition = useMemo(() => {
    if (!currentUser?.email) return null;
    const idx = filteredByTime.findIndex(p => p.user_id === currentUser.email);
    return idx >= 0 ? idx + 1 : null;
  }, [filteredByTime, currentUser?.email]);

  const HERO_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/004244915_ideogram-v30_Heres_a_clean_high-concept_image_prompt_for_a_gamification_hub_that_fits_sain-4.jpg";

  const renderLeaderRow = (profile, index) => {
    const isCurrentUser = profile.user_id === currentUser?.email;
    const position = index + 1;
    const rpInfo = getRPRank(profile.rank_points || 0);
    
    return (
      <div
        key={profile.id}
        className={cn(
          "flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer hover:shadow-md",
          isCurrentUser 
            ? "bg-violet-100 ring-2 ring-violet-300" 
            : "bg-white hover:bg-slate-50",
          position <= 3 && "border-2",
          position === 1 && "border-amber-400",
          position === 2 && "border-slate-300",
          position === 3 && "border-orange-400"
        )}
        onClick={() => {
          document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId: profile.user_id } }));
        }}
      >
        {/* Position */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
          position === 1 && "bg-amber-400 text-white",
          position === 2 && "bg-slate-300 text-slate-700",
          position === 3 && "bg-orange-400 text-white",
          position > 3 && "bg-slate-100 text-slate-600"
        )}>
          {position <= 3 ? (
            <Trophy className={cn("w-5 h-5", position === 1 && "text-white")} />
          ) : (
            position
          )}
        </div>

        {/* Avatar */}
        <Avatar className="w-12 h-12">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="text-lg">{profile.display_name?.charAt(0)}</AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              "font-semibold truncate",
              isCurrentUser ? "text-violet-700" : "text-slate-900"
            )}>
              {profile.display_name}
            </p>
            {isCurrentUser && (
              <Badge className="bg-violet-500 text-white text-xs">YOU</Badge>
            )}
            {profile.leader_tier === 'verified144k' && (
              <Crown className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <p className="text-sm text-slate-500">@{profile.handle || 'user'}</p>
        </div>

        {/* Rank Badge */}
        <div className="flex items-center gap-2">
          <img
            src={RANK_BADGE_IMAGES[rpInfo.code]}
            alt={rpInfo.title}
            className="w-8 h-8 object-contain"
            data-no-filter="true"
          />
          <span className="text-xs font-medium text-slate-600 capitalize">{rpInfo.title}</span>
        </div>

        {/* Points */}
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            <span className="font-bold text-violet-700">{(profile.rank_points || 0).toLocaleString()}</span>
          </div>
          <span className="text-xs text-slate-500">RP</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent">
      {/* Hero Section */}
      <div className="page-hero relative overflow-hidden">
        <img 
          src={HERO_IMAGE}
          alt="Leaderboards"
          className="w-full h-full object-cover object-center hero-image"
          data-no-filter="true"
        />
        <div className="hero-gradient absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50 dark:to-[#050505]" style={{ opacity: '0.50' }} />
        <HeroGalleryTrigger startIndex={7} className="absolute bottom-4 left-4 text-white/80 !p-1 [&_svg]:w-3 [&_svg]:h-3 z-10" />
        <div className="absolute inset-0 flex items-center justify-center hero-content">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <Trophy className="w-8 h-8 text-amber-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] tracking-wide"
                  style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(251,191,36,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
                Leaderboards
              </h1>
              <ForwardButton currentPage="Leaderboards" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
            </div>
            <div className="p-4 rounded-2xl bg-black/[0.04] backdrop-blur-sm border border-white/20 mt-4">
              <p className="text-amber-100/[0.92] text-base tracking-wider drop-shadow-lg">
                Top Contributors · Rankings · Achievements
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Current User Position Banner */}
        {myProfile && currentUserPosition && (
          <Card className="mb-6 bg-gradient-to-r from-violet-100 to-purple-100 border-violet-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 ring-2 ring-violet-400">
                    <AvatarImage src={myProfile.avatar_url} />
                    <AvatarFallback>{myProfile.display_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-violet-900">{myProfile.display_name}</p>
                    <p className="text-sm text-violet-600">Your Current Ranking</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-violet-500 text-white flex items-center justify-center text-2xl font-bold">
                    #{currentUserPosition}
                  </div>
                  <p className="text-xs text-violet-600 mt-1">of {filteredByTime.length}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <img
                      src={RANK_BADGE_IMAGES[getRPRank(myProfile.rank_points || 0).code]}
                      alt="Rank"
                      className="w-10 h-10 object-contain"
                      data-no-filter="true"
                    />
                  </div>
                  <p className="text-2xl font-bold text-violet-700">{(myProfile.rank_points || 0).toLocaleString()}</p>
                  <p className="text-sm text-violet-600">Rank Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Time Filter */}
          <div className="flex gap-1 p-1 bg-white rounded-lg border border-slate-200">
            {TIME_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={cn(
                  "flex items-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all",
                  timeFilter === filter.id 
                    ? "bg-violet-600 text-white shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="rp" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Rank Points
            </TabsTrigger>
            <TabsTrigger value="ggg" className="gap-2">
              <Sparkles className="w-4 h-4" />
              GGG Balance
            </TabsTrigger>
            <TabsTrigger value="engagement" className="gap-2">
              <Flame className="w-4 h-4" />
              Engagement
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Leaderboard Content */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                {timeFilter === 'all' ? 'All-Time' : timeFilter === 'monthly' ? 'Monthly' : 'Weekly'} Rankings
              </span>
              <Badge variant="outline" className="text-slate-500">
                {searchedProfiles.length} users
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
              </div>
            ) : searchedProfiles.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchedProfiles.slice(0, 50).map((profile, index) => renderLeaderRow(profile, index))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-100">
                  <Medal className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-600">Top Player</p>
                  <p className="font-bold text-amber-900">{filteredByTime[0]?.display_name || '-'}</p>
                  <p className="text-xs text-amber-600">{(filteredByTime[0]?.rank_points || 0).toLocaleString()} RP</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-100">
                  <Users className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-violet-600">Total Participants</p>
                  <p className="font-bold text-violet-900">{filteredByTime.length}</p>
                  <p className="text-xs text-violet-600">Active members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-100">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600">Average RP</p>
                  <p className="font-bold text-emerald-900">
                    {filteredByTime.length > 0 
                      ? Math.round(filteredByTime.reduce((sum, p) => sum + (p.rank_points || 0), 0) / filteredByTime.length).toLocaleString()
                      : 0}
                  </p>
                  <p className="text-xs text-emerald-600">Per member</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}