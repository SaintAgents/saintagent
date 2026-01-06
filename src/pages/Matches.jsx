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
import BackButton from '@/components/hud/BackButton';
import AIMatchAssistant from '@/components/dating/AIMatchAssistant';

export default function Matches() {
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [valuesQuery, setValuesQuery] = useState('');
  const [practicesQuery, setPracticesQuery] = useState('');
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [proximity, setProximity] = useState('any'); // 'any' | 'nearby' | 'far'
  const [sortBy, setSortBy] = useState('match'); // 'match' | 'proximity' | 'lastActive'
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [selectedMatchForAI, setSelectedMatchForAI] = useState(null);

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

  // Check if user has opted into dating
  const { data: myDatingProfile } = useQuery({
    queryKey: ['myDatingProfile', profile?.user_id],
    queryFn: () => base44.entities.DatingProfile.filter({ user_id: profile.user_id }),
    enabled: !!profile?.user_id
  });
  const isDatingOptedIn = myDatingProfile?.[0]?.opt_in === true;

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
    } else if (action === 'analyze') {
      setSelectedMatchForAI(match);
      setAiAssistantOpen(true);
    }
  };

  // Get dating profiles count
  const { data: datingProfiles = [] } = useQuery({
    queryKey: ['datingProfilesCount'],
    queryFn: () => base44.entities.DatingProfile.filter({ opt_in: true }, '-updated_date', 100)
  });
  const datingCount = datingProfiles.filter(p => p.user_id !== profile?.user_id).length;

  const tabCounts = {
    all: matches.length,
    person: matches.filter((m) => m.target_type === 'person').length,
    offer: matches.filter((m) => m.target_type === 'offer').length,
    mission: matches.filter((m) => m.target_type === 'mission').length,
    event: matches.filter((m) => m.target_type === 'event').length,
    teacher: matches.filter((m) => m.target_type === 'teacher').length,
    dating: datingCount
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-[#050505] dark:via-[#050505] dark:to-[#050505] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BackButton />
              <Sparkles className="w-6 h-6 text-emerald-500 dark:text-[#00ff88]" />
              Synchronicity Engine
              {isDatingOptedIn && (
                <span 
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg animate-pulse cursor-pointer"
                  style={{ boxShadow: '0 0 12px rgba(236, 72, 153, 0.6)' }}
                  title="Dating profile is live!"
                  onClick={() => setTab('dating')}
                >
                  <Heart className="w-4 h-4 text-white fill-white" />
                </span>
              )}
              <HelpHint content="The Synchronicity Engine uses your profile data—skills, intentions, values, spiritual practices, and mystical identifiers—to find highest-resonance collaborators. Match Scoring combines Intent Alignment, Skill Complementarity, Proximity, Timing Readiness, Trust Score, and Spiritual Alignment into a 0-100 score. Match Types include People, Offers, Missions, Events, and Teachers—each category surfaces different opportunities. AI-generated Conversation Starters help break the ice based on shared values. Complete your 'Skills' and 'Mystical Identity' for the best results." />
            </h1>
            <p className="text-slate-500 dark:text-emerald-400/70 mt-1">AI-powered matches based on values, skills, and intentions</p>
          </div>
          <div className="flex items-center gap-3">
            <AIMatchGenerator profile={profile} />
            <Button
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] dark:bg-[#050505]/80 dark:text-[#00ff88] dark:border-[#00ff88]/50 dark:hover:border-[#00ff88] dark:hover:shadow-[0_0_15px_rgba(0,255,136,0.4)] px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 h-9 gap-2"
              onClick={async () => { await base44.functions.invoke('computeMatches', {}); refetch(); }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-emerald-500/70" />
          <Input
            placeholder="Search matches..."
            className="pl-12 h-12 rounded-xl bg-white dark:bg-[#050505] dark:border-[#00ff88]/30 dark:text-white dark:placeholder:text-emerald-600/50 dark:focus:border-[#00ff88] dark:focus:shadow-[0_0_12px_rgba(0,255,136,0.3)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#050505] rounded-xl border dark:border-[#00ff88]/30 p-4 mb-6">
          <div className="grid gap-3 md:grid-cols-6">
            <div className="md:col-span-2">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <span>Filter by values</span>
                <HelpHint content="Invite specific energies into your field by filtering for shared intentions and practices. Type keywords like 'integrity' or 'compassion' to find members who list these in their Core Values." />
              </div>
              <Input
                placeholder="e.g., compassion, integrity"
                value={valuesQuery}
                onChange={(e) => setValuesQuery(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <span>Filter by practices</span>
                <HelpHint content="Search for specific tags, skills, or daily practices within the community. Type keywords like 'meditation' or 'yoga' to find members who explicitly list these." />
              </div>
              <Input
                placeholder="e.g., meditation, yoga"
                value={practicesQuery}
                onChange={(e) => setPracticesQuery(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="flex items-center gap-1">
                  Match score
                  <HelpHint content="Set your threshold for synchronicity. Higher scores indicate deeper potential for alignment. Adjust this to filter connections based on their resonance with your profile—a higher percentage requires closer alignment in values and interests." />
                </span>
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
          <TabsList className="w-full grid grid-cols-7 h-12 bg-white dark:bg-[#050505] rounded-xl border dark:border-[#00ff88]/30">
            <TabsTrigger value="all" className="rounded-lg gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-[#00ff88]/15 dark:data-[state=active]:text-[#00ff88]">
              All <span className="text-xs opacity-60 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">({tabCounts.all})</span>
            </TabsTrigger>
            <TabsTrigger value="person" className="rounded-lg gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-[#00ff88]/15 dark:data-[state=active]:text-[#00ff88]">
              <Users className="w-4 h-4" />
              People <span className="text-xs opacity-60 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">({tabCounts.person})</span>
            </TabsTrigger>
            <TabsTrigger value="offer" className="rounded-lg gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-[#00ff88]/15 dark:data-[state=active]:text-[#00ff88]">
              <ShoppingBag className="w-4 h-4" />
              Offers <span className="text-xs opacity-60 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">({tabCounts.offer})</span>
            </TabsTrigger>
            <TabsTrigger value="mission" className="rounded-lg gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-[#00ff88]/15 dark:data-[state=active]:text-[#00ff88]">
              <Target className="w-4 h-4" />
              Missions <span className="text-xs opacity-60 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">({tabCounts.mission})</span>
            </TabsTrigger>
            <TabsTrigger value="event" className="rounded-lg gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-[#00ff88]/15 dark:data-[state=active]:text-[#00ff88]">
              <Calendar className="w-4 h-4" />
              Events <span className="text-xs opacity-60 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">({tabCounts.event})</span>
            </TabsTrigger>
            <TabsTrigger value="teacher" className="rounded-lg gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-[#00ff88]/15 dark:data-[state=active]:text-[#00ff88]">
              <GraduationCap className="w-4 h-4" />
              Teachers <span className="text-xs opacity-60 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">({tabCounts.teacher})</span>
            </TabsTrigger>
            <TabsTrigger value="dating" className="rounded-lg gap-2 data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-pink-900/30 dark:data-[state=active]:text-pink-400">
              <Heart className="w-4 h-4" />
              Dating <span className="text-xs opacity-60 bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-400 px-1.5 py-0.5 rounded-full">({tabCounts.dating})</span>
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

          {/* Floating AI Assistant Button */}
          <button
            onClick={() => { setSelectedMatchForAI(null); setAiAssistantOpen(true); }}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-rose-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center z-40"
            title="AI Match Assistant"
          >
            <Sparkles className="w-6 h-6" />
          </button>

          {/* AI Match Assistant Modal */}
          <AIMatchAssistant
            isOpen={aiAssistantOpen}
            onClose={() => { setAiAssistantOpen(false); setSelectedMatchForAI(null); }}
            selectedMatch={selectedMatchForAI}
          />
          </div>
          </div>);

}