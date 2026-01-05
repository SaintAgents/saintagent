import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import ProfileDataSlate from '@/components/profiles/ProfileDataSlate';

const RANK_ORDER = ['guardian', 'ascended', 'oracle', 'sage', 'master', 'practitioner', 'adept', 'initiate', 'seeker'];

export default function Profiles() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rankFilter, setRankFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

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
        default:
          return 0;
      }
    });

    return result;
  }, [profiles, searchQuery, sortBy, rankFilter, regionFilter]);

  const activeFilterCount = [
    rankFilter !== 'all' ? 1 : 0,
    regionFilter !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setRankFilter('all');
    setRegionFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-violet-500" />
              Community Profiles
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Discover members by rank, expertise, and influence
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {filteredProfiles.length} members
          </Badge>
        </div>

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

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border-slate-200 dark:border-[rgba(0,255,136,0.2)]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Rank (RP)</SelectItem>
                <SelectItem value="influence">Influence</SelectItem>
                <SelectItem value="ggg">GGG Balance</SelectItem>
                <SelectItem value="recent">Recent Activity</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

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

        {/* Profiles Grid */}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProfiles.map((profile) => (
              <ProfileDataSlate key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}