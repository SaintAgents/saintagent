import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
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
  RefreshCw,
  Heart,
  ChevronLeft
} from "lucide-react";

import { createPageUrl } from '@/utils';
import MatchCard from '@/components/hud/MatchCard';
import AIMatchGenerator from '@/components/ai/AIMatchGenerator';
import DatingTab from '@/components/dating/DatingTab';
import HelpHint from '@/components/hud/HelpHint';
import AIMatchAssistant from '@/components/dating/AIMatchAssistant';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';

export default function Matches() {
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [valuesQuery, setValuesQuery] = useState('');
  const [practicesQuery, setPracticesQuery] = useState('');
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [proximity, setProximity] = useState('any');
  const [sortBy, setSortBy] = useState('match');
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
    return (b.match_score || 0) - (a.match_score || 0);
  });

  const handleAction = async (action, match) => {
    if (action === 'save') {
      await base44.entities.Match.update(match.id, { status: 'saved' });
      refetch();
    } else if (action === 'decline') {
      await base44.entities.Match.update(match.id, { status: 'declined' });
      refetch();
    } else if (action === 'message') {
      // Open floating chat with the matched user
      document.dispatchEvent(new CustomEvent('openFloatingChat', {
        detail: {
          recipientId: match.target_id,
          recipientName: match.target_name,
          recipientAvatar: match.target_avatar
        }
      }));
    } else if (action === 'book') {
      // Navigate to meetings page to book a meeting
      window.location.href = createPageUrl('Meetings');
    }
  };

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

  const HERO_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/46b1af7b6_synchro.jpg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:bg-transparent dark:bg-none relative">
      {/* Hero Section */}
      <div className="relative h-64 md:h-72 overflow-hidden page-hero">
        <img 
          src={HERO_IMAGE}
          alt="Matches"
          className="hero-image w-full h-full object-cover object-center"
          data-no-filter="true"
        />
        <div className="hero-gradient absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50 dark:to-[#050505]" />
        <div className="absolute inset-0 flex items-center justify-center hero-content">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-[0_0_30px_rgba(16,185,129,0.5)] tracking-wide"
                style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(16,185,129,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
              Matches
            </h1>
            <p className="text-lg font-semibold text-emerald-300 mt-1 drop-shadow-lg">
              Synchronicity Engine
            </p>
            <p className="text-emerald-200/90 mt-1 text-base tracking-wider drop-shadow-lg">
              AI-Powered Connections Based on Values, Skills & Intentions
            </p>
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <BackButton className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg" />
        </div>
        <div className="absolute top-3 right-3">
          <ForwardButton currentPage="Matches" className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-6 relative z-[5]">
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
            <a
              href={createPageUrl('DatingMatches')}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg cursor-pointer"
              title="View Dating Matches"
            >
              <Heart className="w-5 h-5 text-white fill-white" />
            </a>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => { setSelectedMatchForAI(null); setAiAssistantOpen(true); }}
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={async () => { await base44.functions.invoke('computeMatches', {}); refetch(); }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search matches..."
            className="pl-12 h-12 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="grid gap-3 md:grid-cols-6">
            <div className="md:col-span-2">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <span>Filter by values</span>
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
              </div>
              <Input
                placeholder="e.g., meditation, yoga"
                value={practicesQuery}
                onChange={(e) => setPracticesQuery(e.target.value)}
              />
            </div>
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
              All ({tabCounts.all})
            </TabsTrigger>
            <TabsTrigger value="person" className="rounded-lg gap-2">
              <Users className="w-4 h-4" />
              People ({tabCounts.person})
            </TabsTrigger>
            <TabsTrigger value="offer" className="rounded-lg gap-2">
              <ShoppingBag className="w-4 h-4" />
              Offers ({tabCounts.offer})
            </TabsTrigger>
            <TabsTrigger value="mission" className="rounded-lg gap-2">
              <Target className="w-4 h-4" />
              Missions ({tabCounts.mission})
            </TabsTrigger>
            <TabsTrigger value="event" className="rounded-lg gap-2">
              <Calendar className="w-4 h-4" />
              Events ({tabCounts.event})
            </TabsTrigger>
            <TabsTrigger value="teacher" className="rounded-lg gap-2">
              <GraduationCap className="w-4 h-4" />
              Teachers ({tabCounts.teacher})
            </TabsTrigger>
            <TabsTrigger value="dating" className="rounded-lg gap-2">
              <Heart className="w-4 h-4" />
              Dating ({tabCounts.dating})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === 'dating' ? (
          <DatingTab profile={profile} />
        ) : (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : sortedMatches.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No matches found yet</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  The Synchronicity Engine finds people, offers, and missions aligned with your values and skills.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a href={createPageUrl('Profile')}>
                    <Button variant="outline" className="rounded-xl gap-2">
                      <Users className="w-4 h-4" />
                      Complete Profile
                    </Button>
                  </a>
                  <AIMatchGenerator profile={profile} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onAction={handleAction}
                    onAskAI={(m) => { setSelectedMatchForAI(m); setAiAssistantOpen(true); }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <AIMatchAssistant
          isOpen={aiAssistantOpen}
          onClose={() => { setAiAssistantOpen(false); setSelectedMatchForAI(null); }}
          selectedMatch={selectedMatchForAI}
        />
      </div>
    </div>
  );
}