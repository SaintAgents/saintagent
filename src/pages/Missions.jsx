import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Target,
  Plus,
  Sparkles,
  Users,
  MapPin,
  Crown,
  Filter,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Coins,
  TrendingUp,
  Zap,
  Clock,
  X
} from "lucide-react";

import MissionCard from '@/components/hud/MissionCard';
import CreateMissionModal from '@/components/CreateMissionModal';
import EarningsMatrixModal from '@/components/earnings/EarningsMatrixModal';
import AIMissionGenerator from '@/components/missions/AIMissionGenerator';
import HelpHint from '@/components/hud/HelpHint';
import BackButton from '@/components/hud/BackButton';

export default function Missions() {
  const [tab, setTab] = useState('active');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);
  const [prefillMission, setPrefillMission] = useState(null);
  
  // Advanced filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rewardFilter, setRewardFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 100),
    staleTime: 2 * 60 * 1000,
  });

  // Separate active vs past missions
  const now = new Date();
  const activeMissions = missions.filter((m) => {
    if (m.status === 'completed' || m.status === 'cancelled') return false;
    // Only filter by end_time if status is explicitly set, otherwise show all active
    if (m.end_time && new Date(m.end_time) < now && m.status !== 'active') return false;
    return true;
  });
  const pastMissions = missions.filter((m) => {
    if (m.status === 'completed' || m.status === 'cancelled') return true;
    if (m.end_time && new Date(m.end_time) < now && m.status !== 'active') return true;
    return false;
  });

  // Count missions by type (from active missions only)
  const platformCount = activeMissions.filter((m) => m.mission_type === 'platform').length;
  const circleCount = activeMissions.filter((m) => m.mission_type === 'circle').length;
  const regionCount = activeMissions.filter((m) => m.mission_type === 'region').length;
  const leaderCount = activeMissions.filter((m) => m.mission_type === 'leader').length;

  // Apply all filters and sorting
  const filteredMissions = useMemo(() => {
    // Start with tab-based filtering
    let result = tab === 'active' ? activeMissions :
      tab === 'past' ? pastMissions :
      tab === 'all' ? missions :
      activeMissions.filter((m) => m.mission_type === tab);

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((m) =>
        m.title?.toLowerCase().includes(query) ||
        m.objective?.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query)
      );
    }

    // Status filter (for active tab mainly)
    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter);
    }

    // Reward filter
    if (rewardFilter !== 'all') {
      result = result.filter((m) => {
        if (rewardFilter === 'ggg') return (m.reward_ggg || 0) > 0;
        if (rewardFilter === 'rp') return (m.reward_rank_points || 0) > 0;
        if (rewardFilter === 'boost') return (m.reward_boost || 0) > 0;
        if (rewardFilter === 'high_reward') return (m.reward_ggg || 0) >= 50;
        return true;
      });
    }

    // Sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'end_date':
          if (!a.end_time && !b.end_time) return 0;
          if (!a.end_time) return 1;
          if (!b.end_time) return -1;
          return new Date(a.end_time) - new Date(b.end_time);
        case 'participants':
          return (b.participant_count || 0) - (a.participant_count || 0);
        case 'rewards':
          return (b.reward_ggg || 0) - (a.reward_ggg || 0);
        case 'newest':
          return new Date(b.created_date) - new Date(a.created_date);
        case 'relevance':
        default:
          // Relevance: prioritize active, with rewards, ending soon
          const aScore = (a.status === 'active' ? 100 : 0) + 
            (a.reward_ggg || 0) + 
            (a.end_time ? 50 / Math.max(1, (new Date(a.end_time) - now) / (1000 * 60 * 60 * 24)) : 0);
          const bScore = (b.status === 'active' ? 100 : 0) + 
            (b.reward_ggg || 0) + 
            (b.end_time ? 50 / Math.max(1, (new Date(b.end_time) - now) / (1000 * 60 * 60 * 24)) : 0);
          return bScore - aScore;
      }
    });

    return result;
  }, [missions, activeMissions, pastMissions, tab, searchQuery, statusFilter, rewardFilter, sortBy, now]);

  const activeFilterCount = [
    searchQuery.trim() ? 1 : 0,
    statusFilter !== 'all' ? 1 : 0,
    rewardFilter !== 'all' ? 1 : 0,
    sortBy !== 'relevance' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setRewardFilter('all');
    setSortBy('relevance');
  };

  const handleAction = (action, mission) => {
    console.log('Mission action:', action, mission);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/51f6a87ab_universal_upscale_0_d674b71e-39fb-41e7-8b32-cfaec92f89e7_0.jpg"
          alt="Missions Hero"
          data-no-filter="true"
          className="w-full h-full object-cover object-center hero-image"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent dark:from-[#050505] [data-theme='hacker']_&:from-black" />
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BackButton />
              <Target className="w-6 h-6 text-amber-500" />
              Missions & Quests
              <HelpHint content="Missions: Structured units of work driving real-world impact. Browse & Join: Find missions by Lane (Food Security, Regenerative Ag, etc.) or Region. Execute Tasks: Complete assigned tasks and submit Evidence (files, links, photos). Verification & Payout: Once the Leader verifies your evidence, GGG is released from mission escrow to your wallet. Mission Types: Platform (system), Circle, Region, Leader. Rewards: GGG, Rank Points, Boost multipliers. Leaders design missions with milestone-based bounties (capped at $55)." />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 ml-9">Join collaborative missions to earn GGG, rank points, and boosts (mission rewards capped at $55).</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setAiGeneratorOpen(true)}
              className="rounded-xl gap-2 border-violet-200 text-violet-700 hover:bg-violet-50"
            >
              <Sparkles className="w-4 h-4" />
              AI Ideas
            </Button>
            <Button
              onClick={() => {
                setPrefillMission(null);
                setCreateModalOpen(true);
              }}
              className="rounded-xl bg-violet-600 hover:bg-violet-700 gap-2">

              <Plus className="w-4 h-4" />
              Create Mission
            </Button>
            <Button
              variant="outline" className="bg-slate-50 text-stone-950 px-4 py-2 text-sm font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9"

              onClick={() => setMatrixOpen(true)}>

              Earnings Matrix
            </Button>
          </div>
        </div>

        {/* Search and Quick Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search missions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white rounded-xl border-slate-200"
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
          
          <Button
            variant="outline"
            className={cn(
              "rounded-xl gap-2",
              filtersOpen && "bg-violet-50 border-violet-200"
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

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 rounded-xl bg-white">
              <ArrowUpDown className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="end_date">Ending Soon</SelectItem>
              <SelectItem value="participants">Most Participants</SelectItem>
              <SelectItem value="rewards">Highest Rewards</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters Panel */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleContent>
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">Status:</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36 h-9 rounded-lg">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">Rewards:</span>
                  <Select value={rewardFilter} onValueChange={setRewardFilter}>
                    <SelectTrigger className="w-40 h-9 rounded-lg">
                      <SelectValue placeholder="All rewards" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rewards</SelectItem>
                      <SelectItem value="ggg">
                        <div className="flex items-center gap-2">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          Has GGG
                        </div>
                      </SelectItem>
                      <SelectItem value="rp">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                          Has Rank Points
                        </div>
                      </SelectItem>
                      <SelectItem value="boost">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-blue-500" />
                          Has Boost
                        </div>
                      </SelectItem>
                      <SelectItem value="high_reward">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          High Reward (50+ GGG)
                        </div>
                      </SelectItem>
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
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Mission Type Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-7 h-11 bg-white rounded-xl border">
            <TabsTrigger value="active" className="rounded-lg gap-2">
              <Target className="w-4 h-4" />
              Active
              {activeMissions.length > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs bg-emerald-100 text-emerald-700">{activeMissions.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg gap-2">
              Past
              {pastMissions.length > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs bg-slate-100 text-slate-600">{pastMissions.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="platform" className="rounded-lg gap-2">
              <Sparkles className="w-4 h-4" />
              Platform
              {platformCount > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs bg-violet-100 text-violet-700">{platformCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="circle" className="rounded-lg gap-2">
              <Users className="w-4 h-4" />
              Circle
              {circleCount > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs bg-blue-100 text-blue-700">{circleCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="region" className="rounded-lg gap-2">
              <MapPin className="w-4 h-4" />
              Region
              {regionCount > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs bg-emerald-100 text-emerald-700">{regionCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="leader" className="rounded-lg gap-2">
              <Crown className="w-4 h-4" />
              Leader
              {leaderCount > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs bg-amber-100 text-amber-700">{leaderCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-lg gap-2">
              <Filter className="w-4 h-4" />
              All
              {missions.length > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs bg-slate-100 text-slate-600">{missions.length}</Badge>}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Results count */}
        {(searchQuery || activeFilterCount > 0) && (
          <p className="text-sm text-slate-500 mb-4">
            Showing {filteredMissions.length} mission{filteredMissions.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        )}

        {/* Missions Grid */}
        {isLoading ?
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) =>
          <div key={i} className="h-80 bg-white rounded-xl animate-pulse" />
          )}
          </div> :
        filteredMissions.length === 0 ?
        <div className="text-center py-16">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No missions available</h3>
            <p className="text-slate-500 mb-6">Create your own mission or check back later</p>
            <Button
            onClick={() => setCreateModalOpen(true)}
            className="rounded-xl bg-violet-600 hover:bg-violet-700">

              Create Mission
            </Button>
          </div> :

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map((mission) =>
          <MissionCard
            key={mission.id}
            mission={mission}
            onAction={handleAction} />

          )}
          </div>
        }
      </div>

      <CreateMissionModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setPrefillMission(null);
        }}
        prefillData={prefillMission}
      />

      <AIMissionGenerator
        open={aiGeneratorOpen}
        onClose={() => setAiGeneratorOpen(false)}
        onUseMission={(mission) => {
          setPrefillMission(mission);
          setCreateModalOpen(true);
        }}
      />

      <EarningsMatrixModal open={matrixOpen} onOpenChange={setMatrixOpen} />
    </div>
  );

}