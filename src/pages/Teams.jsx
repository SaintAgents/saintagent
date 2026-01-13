import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Search, 
  Shield, 
  Target, 
  Crown,
  Sparkles,
  Filter
} from "lucide-react";
import TeamCard from '@/components/teams/TeamCard';
import CreateTeamModal from '@/components/teams/CreateTeamModal';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';
import HelpHint from '@/components/hud/HelpHint';

export default function Teams() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-created_date', 100)
  });

  const joinMutation = useMutation({
    mutationFn: async (team) => {
      const newMembers = [...(team.member_ids || []), user.email];
      return base44.entities.Team.update(team.id, {
        member_ids: newMembers,
        member_count: newMembers.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] })
  });

  const myTeams = teams.filter(t => t.member_ids?.includes(user?.email));
  const publicTeams = teams.filter(t => t.visibility === 'public' && !t.member_ids?.includes(user?.email));

  const filteredTeams = React.useMemo(() => {
    let result = tab === 'my' ? myTeams : tab === 'discover' ? publicTeams : teams;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.focus_areas?.some(f => f.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [teams, myTeams, publicTeams, tab, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent dark:bg-none dark:from-transparent dark:via-transparent dark:to-transparent">
      {/* Hero */}
      <div className="page-hero relative overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/ded1e9bcc_gemini-image-2_these_people_in_the_digital_marketplace-1.jpg"
          alt="Teams & Guilds"
          className="w-full h-full object-cover object-center hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50 dark:to-[#050505]" style={{ opacity: '0.50' }} />
        <div className="absolute inset-0 flex items-center justify-center hero-content">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] tracking-wide flex items-center justify-center gap-3"
                  style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(139,92,246,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
                <Shield className="w-10 h-10 text-amber-300 drop-shadow-lg" />
                Teams & Guilds
              </h1>
              <ForwardButton currentPage="Teams" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
            </div>
            <div className="p-4 rounded-2xl bg-black/[0.94] backdrop-blur-sm border border-white/20 mt-4">
              <p className="text-violet-200/[0.92] text-lg tracking-wider drop-shadow-lg">
                Form Teams to Tackle Missions Together & Earn Collective Rewards
              </p>
              <div className="mt-4 flex items-center justify-center">
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Team
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white rounded-xl"
              />
            </div>
            <HelpHint content="Teams allow you to group together with other members to take on missions collaboratively. Squad: Small agile team (5-10). Guild: Larger organization with shared purpose. Crew: Project-focused temporary team. Alliance: Coalition of multiple teams." />
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-4 border">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-violet-500" />
              <span className="text-sm text-slate-500">My Teams</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{myTeams.length}</p>
          </div>
          <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-4 border">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-slate-500">Total Teams</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{teams.length}</p>
          </div>
          <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-4 border">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-slate-500">Recruiting</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {teams.filter(t => t.status === 'recruiting').length}
            </p>
          </div>
          <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-4 border">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span className="text-sm text-slate-500">Total Members</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {teams.reduce((sum, t) => sum + (t.member_count || 0), 0)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="bg-white rounded-xl border">
            <TabsTrigger value="all" className="rounded-lg gap-2">
              <Filter className="w-4 h-4" />
              All Teams
              <Badge className="ml-1 h-5 px-1.5 text-xs bg-slate-100 text-slate-600">{teams.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="my" className="rounded-lg gap-2">
              <Users className="w-4 h-4" />
              My Teams
              <Badge className="ml-1 h-5 px-1.5 text-xs bg-violet-100 text-violet-700">{myTeams.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="discover" className="rounded-lg gap-2">
              <Sparkles className="w-4 h-4" />
              Discover
              <Badge className="ml-1 h-5 px-1.5 text-xs bg-emerald-100 text-emerald-700">{publicTeams.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-16">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No teams found</h3>
            <p className="text-slate-500 mb-6">
              {tab === 'my' ? 'You haven\'t joined any teams yet' : 'Create your own team to get started'}
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                isMember={team.member_ids?.includes(user?.email)}
                isLeader={team.leader_id === user?.email}
                onJoin={(t) => joinMutation.mutate(t)}
                onView={(t) => {
                  // Could open a detail modal
                }}
              />
            ))}
          </div>
        )}
      </div>

      <CreateTeamModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setCreateOpen(false)}
      />
    </div>
  );
}