import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  Sparkles,
  Users,
  ShoppingBag,
  Target,
  Calendar,
  GraduationCap,
  SlidersHorizontal,
  RefreshCw,
  Heart } from
  "lucide-react";

import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MatchCard from '@/components/hud/MatchCard';
import CollapsibleCard from '@/components/hud/CollapsibleCard';
import AIMatchGenerator from '@/components/ai/AIMatchGenerator';
import DatingTab from '@/components/dating/DatingTab';
import HelpHint from '@/components/hud/HelpHint';

export default function Matches() {
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [valuesQuery, setValuesQuery] = useState('');
  const [practicesQuery, setPracticesQuery] = useState('');
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [proximity, setProximity] = useState('any'); // 'any' | 'nearby' | 'far'
  const [sortBy, setSortBy] = useState('match'); // 'match' | 'proximity' | 'lastActive'

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

  const { data: matches = [], isLoading, refetch } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.filter({ status: 'active' }, '-match_score', 50)
  });

  const filteredMatches = matches.filter((m) => {
    const matchesTab = tab === 'all' || m.target_type === tab;
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = !q ||
      (m.target_name || '').toLowerCase().includes(q) ||
      (m.target_subtitle || '').toLowerCase().includes(q);

    const vq = (valuesQuery || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const pq = (practicesQuery || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const starters = (m.conversation_starters || []).map(s => (s || '').toLowerCase());
    const valuesOk = vq.length === 0 || vq.some(tok => starters.some(s => s.includes(tok)));
    const practicesOk = pq.length === 0 || pq.some(tok => starters.some(s => s.includes(tok)));

    const scoreOk = (m.match_score || 0) >= (scoreRange[0] ?? 0) && (m.match_score || 0) <= (scoreRange[1] ?? 100);
    const proximityOk = proximity === 'any' ? true : (
      proximity === 'nearby' ? (m.proximity_score || 0) >= 50 : (m.proximity_score || 0) < 50
    );

    return matchesTab && matchesSearch && valuesOk && practicesOk && scoreOk && proximityOk;
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === 'proximity') {
      const d = (b.proximity_score || 0) - (a.proximity_score || 0);
      if (d !== 0) return d;
      return (b.match_score || 0) - (a.match_score || 0);
    }
    if (sortBy === 'lastActive') {
      const d = (b.timing_readiness || 0) - (a.timing_readiness || 0);
      if (d !== 0) return d;
      return (b.match_score || 0) - (a.match_score || 0);
    }
    // default: match score
    return (b.match_score || 0) - (a.match_score || 0);
  });

  const handleAction = async (action, match) => {
    if (action === 'save') {
      await base44.entities.Match.update(match.id, { status: 'saved' });
      refetch();
    } else if (action === 'decline') {
      await base44.entities.Match.update(match.id, { status: 'declined' });
      refetch();
    }
  };

  const tabCounts = {
    all: matches.length,
    person: matches.filter((m) => m.target_type === 'person').length,
    offer: matches.filter((m) => m.target_type === 'offer').length,
    mission: matches.filter((m) => m.target_type === 'mission').length,
    event: matches.filter((m) => m.target_type === 'event').length,
    teacher: matches.filter((m) => m.target_type === 'teacher').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-violet-500" />
              Synchronicity Engine
              <HelpHint content="The Synchronicity Engine uses AI to find meaningful connections based on your profile, skills, intentions, and spiritual alignment. Matches are scored on intent alignment, skill complementarity, proximity, timing, and trust. Filter by values, practices, or score range to refine results." />
            </h1>
            <p className="text-slate-500 mt-1">AI-powered matches based on values, skills, and intentions</p>
          </div>
          <div className="flex items-center gap-3">
            <AIMatchGenerator profile={profile} />
            <Button
              variant="outline"
              className="bg-purple-100 text-stone-950 px-4 py-2 text-sm font-medium rounded-xl inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9 gap-2"
              onClick={async () => { await base44.functions.invoke('computeMatches', {}); refetch(); }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search matches..."
            className="pl-12 h-12 rounded-xl bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} />

        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="grid gap-3 md:grid-cols-6">
            <Input
              placeholder="Filter by values (e.g., compassion, integrity)"
              value={valuesQuery}
              onChange={(e) => setValuesQuery(e.target.value)}
              className="md:col-span-2"
            />
            <Input
              placeholder="Filter by practices (e.g., meditation, yoga)"
              value={practicesQuery}
              onChange={(e) => setPracticesQuery(e.target.value)}
              className="md:col-span-2"
            />
            <div className="md:col-span-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Match score</span>
                <span>{scoreRange[0]}–{scoreRange[1]}%</span>
              </div>
              <Slider value={scoreRange} min={0} max={100} step={1} onValueChange={setScoreRange} />
            </div>
            <Select value={proximity} onValueChange={setProximity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Proximity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Proximity</SelectItem>
                <SelectItem value="nearby">Same Region</SelectItem>
                <SelectItem value="far">Other Regions</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Sort: Match Score</SelectItem>
                <SelectItem value="proximity">Sort: Proximity</SelectItem>
                <SelectItem value="lastActive">Sort: Last Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-7 h-12 bg-white rounded-xl border">
            <TabsTrigger value="all" className="rounded-lg gap-2">
              All <span className="text-xs opacity-60">({tabCounts.all})</span>
            </TabsTrigger>
            <TabsTrigger value="person" className="rounded-lg gap-2">
              <Users className="w-4 h-4" />
              People <span className="text-xs opacity-60">({tabCounts.person})</span>
            </TabsTrigger>
            <TabsTrigger value="offer" className="rounded-lg gap-2">
              <ShoppingBag className="w-4 h-4" />
              Offers <span className="text-xs opacity-60">({tabCounts.offer})</span>
            </TabsTrigger>
            <TabsTrigger value="mission" className="rounded-lg gap-2">
              <Target className="w-4 h-4" />
              Missions <span className="text-xs opacity-60">({tabCounts.mission})</span>
            </TabsTrigger>
            <TabsTrigger value="event" className="rounded-lg gap-2">
              <Calendar className="w-4 h-4" />
              Events <span className="text-xs opacity-60">({tabCounts.event})</span>
            </TabsTrigger>
            <TabsTrigger value="teacher" className="rounded-lg gap-2">
              <GraduationCap className="w-4 h-4" />
              Teachers <span className="text-xs opacity-60">({tabCounts.teacher})</span>
            </TabsTrigger>
            <TabsTrigger value="dating" className="rounded-lg gap-2">
              <Heart className="w-4 h-4" />
              Dating
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === 'dating' ? (
          <DatingTab profile={profile} />
        ) : (
          <> 
         {/* Matches Grid */}
        {isLoading ?
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) =>
          <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
          )}
          </div> :
        sortedMatches.length === 0 ?
        <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No matches found yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              The Synchronicity Engine finds people, offers, and missions aligned with your values and skills. 
              Complete your profile or generate AI matches to discover connections.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to={createPageUrl('Profile')}>
                <Button variant="outline" className="rounded-xl gap-2">
                  <Users className="w-4 h-4" />
                  Complete Profile
                </Button>
              </Link>
              <AIMatchGenerator profile={profile} />
            </div>
          </div> :

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedMatches.map((match) =>
          <MatchCard
            key={match.id}
            match={match}
            onAction={handleAction} />

          )}
          </div>
          }
          </>
          )}
          </div>
          </div>);

}