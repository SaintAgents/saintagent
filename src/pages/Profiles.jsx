import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Users,
  Sparkles,
  X,
  Filter,
  Grid3X3,
  Network,
  Heart,
  Zap,
  HelpCircle
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import ProfileDataSlate from '@/components/profiles/ProfileDataSlate';
import NetworkMapView from '@/components/profiles/NetworkMapView';
import MiniDatingCard from '@/components/profiles/MiniDatingCard';
import BackButton from '@/components/hud/BackButton';

const RANK_ORDER = ['guardian', 'ascended', 'oracle', 'sage', 'master', 'practitioner', 'adept', 'initiate', 'seeker'];
const QUICK_RANKS = ['seeker', 'adept', 'master', 'sage', 'guardian'];

export default function Profiles() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rankFilter, setRankFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'network' | 'dating'
  const [rpRange, setRpRange] = useState([0, 10000]);
  const [skillFilter, setSkillFilter] = useState('');
  // Advanced mystical/spiritual filters
  const [astroFilter, setAstroFilter] = useState('all');
  const [humanDesignFilter, setHumanDesignFilter] = useState('all');
  const [enneagramFilter, setEnneagramFilter] = useState('all');
  const [mbtiFilter, setMbtiFilter] = useState('all');
  const [practiceFilter, setPracticeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-rank_points', 200),
    staleTime: 2 * 60 * 1000,
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => base44.entities.Region.list(),
    staleTime: 5 * 60 * 1000,
  });

  // Current user for synergy calculation
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: currentProfile } = useQuery({
    queryKey: ['currentUserProfile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      return profiles[0];
    },
    enabled: !!currentUser?.email
  });

  // Fetch dating profiles for dating view
  const { data: datingProfiles = [] } = useQuery({
    queryKey: ['datingProfiles'],
    queryFn: () => base44.entities.DatingProfile.filter({ opt_in: true, visible: true }),
    enabled: viewMode === 'dating'
  });

  // Fetch recent missions for expanded cards
  const { data: missions = [] } = useQuery({
    queryKey: ['recentMissions'],
    queryFn: () => base44.entities.Mission.filter({ status: 'active' }, '-created_date', 50),
    staleTime: 5 * 60 * 1000
  });

  // Map missions to participants
  const missionsByUser = useMemo(() => {
    const map = {};
    missions.forEach(m => {
      (m.participant_ids || []).forEach(uid => {
        if (!map[uid]) map[uid] = [];
        map[uid].push(m);
      });
    });
    return map;
  }, [missions]);

  // Calculate synergy score between current user and another profile
  const calculateSynergy = (profile) => {
    if (!currentProfile) return 0;
    let score = 0;
    
    // Shared skills
    const mySkills = currentProfile.skills || [];
    const theirSkills = profile.skills || [];
    const sharedSkills = mySkills.filter(s => theirSkills.includes(s)).length;
    score += sharedSkills * 10;
    
    // Same region
    if (currentProfile.region && currentProfile.region === profile.region) score += 15;
    
    // Complementary intentions
    const myIntentions = currentProfile.intentions || [];
    const theirIntentions = profile.intentions || [];
    const sharedIntentions = myIntentions.filter(i => theirIntentions.includes(i)).length;
    score += sharedIntentions * 8;
    
    // Values alignment
    const myValues = currentProfile.values_tags || [];
    const theirValues = profile.values_tags || [];
    const sharedValues = myValues.filter(v => theirValues.includes(v)).length;
    score += sharedValues * 5;
    
    return Math.min(score, 100);
  };

  // Filter and sort profiles
  const filteredProfiles = useMemo(() => {
    let result = [...profiles];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.display_name?.toLowerCase().includes(query) ||
        p.handle?.toLowerCase().includes(query) ||
        p.bio?.toLowerCase().includes(query) ||
        p.skills?.some(s => s.toLowerCase().includes(query)) ||
        p.rp_rank_code?.toLowerCase().includes(query)
      );
    }

    // Rank filter
    if (rankFilter !== 'all') {
      result = result.filter((p) => p.rp_rank_code === rankFilter);
    }

    // Region filter
    if (regionFilter !== 'all') {
      result = result.filter((p) => p.region === regionFilter);
    }

    // RP range filter
    result = result.filter((p) => {
      const rp = p.rp_points || 0;
      return rp >= rpRange[0] && rp <= rpRange[1];
    });

    // Skill filter
    if (skillFilter.trim()) {
      const skill = skillFilter.toLowerCase();
      result = result.filter((p) => 
        (p.skills || []).some(s => s.toLowerCase().includes(skill))
      );
    }

    // Astrological sign filter
    if (astroFilter !== 'all') {
      result = result.filter((p) => p.astrological_sign?.toLowerCase() === astroFilter.toLowerCase());
    }

    // Human Design filter
    if (humanDesignFilter !== 'all') {
      result = result.filter((p) => p.human_design_type === humanDesignFilter);
    }

    // Enneagram filter
    if (enneagramFilter !== 'all') {
      result = result.filter((p) => p.enneagram_type === enneagramFilter);
    }

    // MBTI filter
    if (mbtiFilter !== 'all') {
      result = result.filter((p) => p.mbti_type?.toUpperCase() === mbtiFilter.toUpperCase());
    }

    // Spiritual practice filter
    if (practiceFilter !== 'all') {
      result = result.filter((p) => 
        (p.spiritual_practices || []).includes(practiceFilter)
      );
    }

    // Location keyword filter
    if (locationFilter.trim()) {
      const loc = locationFilter.toLowerCase();
      result = result.filter((p) => 
        p.location?.toLowerCase().includes(loc)
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          const aRankIdx = RANK_ORDER.indexOf(a.rp_rank_code || 'seeker');
          const bRankIdx = RANK_ORDER.indexOf(b.rp_rank_code || 'seeker');
          if (aRankIdx !== bRankIdx) return aRankIdx - bRankIdx;
          return (b.rank_points || 0) - (a.rank_points || 0);
        case 'influence':
          return (b.influence_score || 0) - (a.influence_score || 0);
        case 'recent':
          return new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date);
        case 'ggg':
          return (b.ggg_balance || 0) - (a.ggg_balance || 0);
        case 'name':
          return (a.display_name || '').localeCompare(b.display_name || '');
        case 'synergy':
          return calculateSynergy(b) - calculateSynergy(a);
        default:
          return 0;
      }
    });

    return result;
  }, [profiles, searchQuery, sortBy, rankFilter, regionFilter, rpRange, skillFilter, astroFilter, humanDesignFilter, enneagramFilter, mbtiFilter, practiceFilter, locationFilter, currentProfile]);

  const activeFilterCount = [
    rankFilter !== 'all' ? 1 : 0,
    regionFilter !== 'all' ? 1 : 0,
    rpRange[0] > 0 || rpRange[1] < 10000 ? 1 : 0,
    skillFilter.trim() ? 1 : 0,
    astroFilter !== 'all' ? 1 : 0,
    humanDesignFilter !== 'all' ? 1 : 0,
    enneagramFilter !== 'all' ? 1 : 0,
    mbtiFilter !== 'all' ? 1 : 0,
    practiceFilter !== 'all' ? 1 : 0,
    locationFilter.trim() ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setRankFilter('all');
    setRegionFilter('all');
    setSearchQuery('');
    setRpRange([0, 10000]);
    setSkillFilter('');
    setAstroFilter('all');
    setHumanDesignFilter('all');
    setEnneagramFilter('all');
    setMbtiFilter('all');
    setPracticeFilter('all');
    setLocationFilter('');
  };

  const handleTagClick = (tag) => {
    setSkillFilter(tag);
    setFiltersOpen(true);
  };

  const handleNodeClick = (profile) => {
    document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId: profile.user_id } }));
  };

  const handleDatingLike = (profile) => {
    console.log('Like:', profile.user_id);
  };

  const handleDatingPass = (profile) => {
    console.log('Pass:', profile.user_id);
  };

  const handleDatingMessage = (profile) => {
    document.dispatchEvent(new CustomEvent('openFloatingChat', {
      detail: {
        recipientId: profile.user_id,
        recipientName: profile.display_name,
        recipientAvatar: profile.avatar_url
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505]">
      {/* Hero Section */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/ac34fe2b1_AroomfilledwithpeoplevisualelementssuggestglobalreachethicalcoordinationandstrategicalignmentSoftlyglowinggridscircularinterfaceslayeredtransparencyandstructuredgeometrycreate4.jpg"
          alt="Community Profiles"
          className="w-full h-full object-cover hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="text-white hover:bg-white/20" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg flex items-center gap-3">
                <Users className="w-8 h-8 text-violet-300" />
                Community Profiles
              </h1>
              <p className="text-violet-100 mt-1 text-sm md:text-base">
                Discover members by rank, expertise, and influence
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1 bg-white/10 border-white/30 text-white">
            {filteredProfiles.length} members
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* Search & Sort Bar - Sticky */}
        <div className="sticky top-16 z-30 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-[rgba(0,255,136,0.2)] p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, rank, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50 dark:bg-[#0a0a0a] border-slate-200 dark:border-[rgba(0,255,136,0.2)] rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Rank Toggles */}
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[rgba(0,255,136,0.2)]">
              {QUICK_RANKS.map((rank) => (
                <button
                  key={rank}
                  onClick={() => setRankFilter(rankFilter === rank ? 'all' : rank)}
                  className={cn(
                    "px-2 py-1 text-[10px] font-medium rounded capitalize transition-colors",
                    rankFilter === rank 
                      ? "bg-violet-600 text-white" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  {rank}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border-slate-200 dark:border-[rgba(0,255,136,0.2)]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Rank (RP)</SelectItem>
                <SelectItem value="synergy">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Synergy
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3 h-3 text-slate-400 ml-1" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[200px]">
                          <p className="text-xs">Ranks profiles by compatibility with you based on shared skills, region, intentions, and values.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                </SelectItem>
                <SelectItem value="influence">Influence</SelectItem>
                <SelectItem value="ggg">GGG Balance</SelectItem>
                <SelectItem value="recent">Recent Activity</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-[rgba(0,255,136,0.2)] overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === 'grid' ? "bg-violet-600 text-white" : "bg-slate-50 dark:bg-[#0a0a0a] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('network')}
                className={cn(
                  "p-2 transition-colors border-x border-slate-200 dark:border-[rgba(0,255,136,0.2)]",
                  viewMode === 'network' ? "bg-violet-600 text-white" : "bg-slate-50 dark:bg-[#0a0a0a] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Network className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('dating')}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === 'dating' ? "bg-rose-500 text-white" : "bg-slate-50 dark:bg-[#0a0a0a] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              className={cn(
                "rounded-xl gap-2",
                filtersOpen && "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-500"
              )}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="h-5 px-1.5 text-xs bg-violet-600 text-white">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className={cn("w-4 h-4 transition-transform", filtersOpen && "rotate-180")} />
            </Button>
          </div>

          {/* Advanced Filters */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleContent>
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Rank:</span>
                  <Select value={rankFilter} onValueChange={setRankFilter}>
                    <SelectTrigger className="w-36 h-9 rounded-lg">
                      <SelectValue placeholder="All ranks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ranks</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="ascended">Ascended</SelectItem>
                      <SelectItem value="oracle">Oracle</SelectItem>
                      <SelectItem value="sage">Sage</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                      <SelectItem value="practitioner">Practitioner</SelectItem>
                      <SelectItem value="adept">Adept</SelectItem>
                      <SelectItem value="initiate">Initiate</SelectItem>
                      <SelectItem value="seeker">Seeker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Region:</span>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-40 h-9 rounded-lg">
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map((r) => (
                        <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* RP Range Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">RP:</span>
                  <div className="w-40">
                    <Slider
                      value={rpRange}
                      onValueChange={setRpRange}
                      min={0}
                      max={10000}
                      step={100}
                      className="w-full"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[80px]">
                    {rpRange[0]}-{rpRange[1]}
                  </span>
                </div>

                {/* Skill Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Skill:</span>
                  <Input
                    placeholder="e.g. React"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="w-32 h-9 text-sm"
                  />
                </div>

                {/* Location Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Location:</span>
                  <Input
                    placeholder="e.g. Austin"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-32 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Mystical/Spiritual Filters Row */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Mystical Filters
                </span>

                {/* Astrological Sign */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sign:</span>
                  <Select value={astroFilter} onValueChange={setAstroFilter}>
                    <SelectTrigger className="w-32 h-9 rounded-lg">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Signs</SelectItem>
                      <SelectItem value="aries">Aries</SelectItem>
                      <SelectItem value="taurus">Taurus</SelectItem>
                      <SelectItem value="gemini">Gemini</SelectItem>
                      <SelectItem value="cancer">Cancer</SelectItem>
                      <SelectItem value="leo">Leo</SelectItem>
                      <SelectItem value="virgo">Virgo</SelectItem>
                      <SelectItem value="libra">Libra</SelectItem>
                      <SelectItem value="scorpio">Scorpio</SelectItem>
                      <SelectItem value="sagittarius">Sagittarius</SelectItem>
                      <SelectItem value="capricorn">Capricorn</SelectItem>
                      <SelectItem value="aquarius">Aquarius</SelectItem>
                      <SelectItem value="pisces">Pisces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Human Design */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">HD:</span>
                  <Select value={humanDesignFilter} onValueChange={setHumanDesignFilter}>
                    <SelectTrigger className="w-40 h-9 rounded-lg">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="generator">Generator</SelectItem>
                      <SelectItem value="manifesting_generator">Manifesting Generator</SelectItem>
                      <SelectItem value="projector">Projector</SelectItem>
                      <SelectItem value="manifestor">Manifestor</SelectItem>
                      <SelectItem value="reflector">Reflector</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Enneagram */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Enneagram:</span>
                  <Select value={enneagramFilter} onValueChange={setEnneagramFilter}>
                    <SelectTrigger className="w-24 h-9 rounded-lg">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="1">Type 1</SelectItem>
                      <SelectItem value="2">Type 2</SelectItem>
                      <SelectItem value="3">Type 3</SelectItem>
                      <SelectItem value="4">Type 4</SelectItem>
                      <SelectItem value="5">Type 5</SelectItem>
                      <SelectItem value="6">Type 6</SelectItem>
                      <SelectItem value="7">Type 7</SelectItem>
                      <SelectItem value="8">Type 8</SelectItem>
                      <SelectItem value="9">Type 9</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* MBTI */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">MBTI:</span>
                  <Select value={mbtiFilter} onValueChange={setMbtiFilter}>
                    <SelectTrigger className="w-28 h-9 rounded-lg">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="INTJ">INTJ</SelectItem>
                      <SelectItem value="INTP">INTP</SelectItem>
                      <SelectItem value="ENTJ">ENTJ</SelectItem>
                      <SelectItem value="ENTP">ENTP</SelectItem>
                      <SelectItem value="INFJ">INFJ</SelectItem>
                      <SelectItem value="INFP">INFP</SelectItem>
                      <SelectItem value="ENFJ">ENFJ</SelectItem>
                      <SelectItem value="ENFP">ENFP</SelectItem>
                      <SelectItem value="ISTJ">ISTJ</SelectItem>
                      <SelectItem value="ISFJ">ISFJ</SelectItem>
                      <SelectItem value="ESTJ">ESTJ</SelectItem>
                      <SelectItem value="ESFJ">ESFJ</SelectItem>
                      <SelectItem value="ISTP">ISTP</SelectItem>
                      <SelectItem value="ISFP">ISFP</SelectItem>
                      <SelectItem value="ESTP">ESTP</SelectItem>
                      <SelectItem value="ESFP">ESFP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Spiritual Practice */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Practice:</span>
                  <Select value={practiceFilter} onValueChange={setPracticeFilter}>
                    <SelectTrigger className="w-36 h-9 rounded-lg">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Practices</SelectItem>
                      <SelectItem value="meditation">Meditation</SelectItem>
                      <SelectItem value="yoga">Yoga</SelectItem>
                      <SelectItem value="breathwork">Breathwork</SelectItem>
                      <SelectItem value="prayer">Prayer</SelectItem>
                      <SelectItem value="contemplative_silence">Contemplative Silence</SelectItem>
                      <SelectItem value="energy_work">Energy Work</SelectItem>
                      <SelectItem value="martial_arts_internal">Martial Arts (Internal)</SelectItem>
                      <SelectItem value="shamanic_practice">Shamanic Practice</SelectItem>
                      <SelectItem value="sound_mantra">Sound/Mantra</SelectItem>
                      <SelectItem value="ritual_ceremony">Ritual/Ceremony</SelectItem>
                      <SelectItem value="study_philosophy">Study/Philosophy</SelectItem>
                      <SelectItem value="plant_medicine">Plant Medicine</SelectItem>
                      <SelectItem value="fasting">Fasting</SelectItem>
                      <SelectItem value="dream_work">Dream Work</SelectItem>
                      <SelectItem value="channeling">Channeling</SelectItem>
                      <SelectItem value="qigong">Qigong</SelectItem>
                      <SelectItem value="tai_chi">Tai Chi</SelectItem>
                      <SelectItem value="reiki">Reiki</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-500 hover:text-slate-700 gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear filters
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Results count */}
        {(searchQuery || activeFilterCount > 0) && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Showing {filteredProfiles.length} profile{filteredProfiles.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        )}

        {/* Content based on view mode */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-48 bg-white dark:bg-[#0a0a0a] rounded-xl animate-pulse border border-slate-200 dark:border-slate-700" />
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Filter className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Nodes Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              No profiles match your current search or filters. Try adjusting your criteria.
            </p>
            <Button variant="outline" onClick={clearFilters} className="rounded-xl">
              Clear All Filters
            </Button>
          </div>
        ) : viewMode === 'network' ? (
          <NetworkMapView 
            profiles={filteredProfiles} 
            currentUserId={currentUser?.email}
            onNodeClick={handleNodeClick}
          />
        ) : viewMode === 'dating' ? (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border border-rose-200 dark:border-rose-800/50">
              <Heart className="w-5 h-5 text-rose-500" />
              <p className="text-sm text-rose-700 dark:text-rose-300">
                Showing members who have opted into dating. Connect with intention.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProfiles
                .filter(p => datingProfiles.some(dp => dp.user_id === p.user_id))
                .map((profile) => {
                  const dp = datingProfiles.find(d => d.user_id === profile.user_id);
                  return (
                    <MiniDatingCard
                      key={profile.id}
                      profile={profile}
                      datingProfile={dp}
                      onLike={handleDatingLike}
                      onPass={handleDatingPass}
                      onMessage={handleDatingMessage}
                      onViewProfile={handleNodeClick}
                    />
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProfiles.map((profile) => (
              <ProfileDataSlate 
                key={profile.id} 
                profile={profile} 
                recentMissions={missionsByUser[profile.user_id]}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}