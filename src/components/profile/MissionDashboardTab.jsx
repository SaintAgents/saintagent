import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target, Clock, Users, Coins, TrendingUp, Zap, Sparkles,
  CheckCircle, Play, Pause, Plus, ChevronRight, BarChart3, ListFilter
} from "lucide-react";
import { format, formatDistanceToNow, parseISO, isPast } from "date-fns";
import { createPageUrl } from '@/utils';
import MissionDetailModal from '@/components/missions/MissionDetailModal';

function MissionStatCard({ label, value, icon: Icon, color }) {
  const colors = {
    violet: 'bg-violet-100 text-violet-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
  };
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color] || colors.violet}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MissionRow({ mission, onClick }) {
  const completedTasks = mission.tasks?.filter(t => t.completed)?.length || 0;
  const totalTasks = mission.tasks?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const timeLeft = mission.end_time && !isPast(parseISO(mission.end_time))
    ? formatDistanceToNow(parseISO(mission.end_time), { addSuffix: false })
    : null;

  const statusConfig = {
    active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
    completed: { label: 'Completed', className: 'bg-blue-100 text-blue-700' },
    draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-600' },
    pending_approval: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  };
  const st = statusConfig[mission.status] || statusConfig.active;

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer bg-white"
      onClick={onClick}
    >
      <div className="p-2 rounded-lg bg-violet-100 shrink-0">
        <Target className="w-5 h-5 text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-slate-900 truncate">{mission.title}</p>
          <Badge className={st.className + ' text-[10px] px-1.5 py-0'}>{st.label}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {timeLeft && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeLeft} left</span>}
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{mission.participant_count || 0}</span>
          {mission.reward_ggg > 0 && <span className="flex items-center gap-1 text-amber-600"><Coins className="w-3 h-3" />{mission.reward_ggg} GGG</span>}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-[10px] text-slate-400 whitespace-nowrap">{completedTasks}/{totalTasks}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
    </div>
  );
}

export default function MissionDashboardTab({ currentUser, profile }) {
  const [selectedMission, setSelectedMission] = useState(null);
  const [filter, setFilter] = useState('all');
  const userId = currentUser?.email;

  // Fetch missions where user is creator or participant
  const { data: allMissions = [], isLoading } = useQuery({
    queryKey: ['myMissions', userId],
    queryFn: async () => {
      const [created, all] = await Promise.all([
        base44.entities.Mission.filter({ creator_id: userId }, '-created_date', 100),
        base44.entities.Mission.list('-created_date', 200),
      ]);
      // Get missions where user is a participant but not creator
      const participated = all.filter(
        m => m.creator_id !== userId && (m.participant_ids || []).includes(userId)
      );
      // Merge and deduplicate
      const map = new Map();
      [...created, ...participated].forEach(m => map.set(m.id, m));
      return Array.from(map.values());
    },
    enabled: !!userId,
    staleTime: 60000,
  });

  const stats = useMemo(() => {
    const active = allMissions.filter(m => m.status === 'active').length;
    const completed = allMissions.filter(m => m.status === 'completed').length;
    const created = allMissions.filter(m => m.creator_id === userId).length;
    const totalGGG = allMissions
      .filter(m => m.status === 'completed' && (m.creator_id === userId || (m.participant_ids || []).includes(userId)))
      .reduce((sum, m) => sum + (m.reward_ggg || 0), 0);
    return { active, completed, created, totalGGG };
  }, [allMissions, userId]);

  const filtered = useMemo(() => {
    if (filter === 'all') return allMissions;
    if (filter === 'active') return allMissions.filter(m => m.status === 'active');
    if (filter === 'completed') return allMissions.filter(m => m.status === 'completed');
    if (filter === 'created') return allMissions.filter(m => m.creator_id === userId);
    if (filter === 'joined') return allMissions.filter(m => m.creator_id !== userId);
    return allMissions;
  }, [allMissions, filter, userId]);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MissionStatCard label="Active Missions" value={stats.active} icon={Play} color="emerald" />
        <MissionStatCard label="Completed" value={stats.completed} icon={CheckCircle} color="blue" />
        <MissionStatCard label="Created by You" value={stats.created} icon={Target} color="violet" />
        <MissionStatCard label="GGG Earned" value={stats.totalGGG.toFixed(0)} icon={Coins} color="amber" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <ListFilter className="w-4 h-4 text-slate-400" />
          {['all', 'active', 'completed', 'created', 'joined'].map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              className={filter === f ? 'bg-violet-600 hover:bg-violet-700' : ''}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 gap-1"
          onClick={() => window.location.href = createPageUrl('Missions')}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Mission</span>
        </Button>
      </div>

      {/* Mission List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700 mb-1">No missions found</h3>
            <p className="text-sm text-slate-500 mb-4">
              {filter === 'all' ? "You haven't joined or created any missions yet." : `No ${filter} missions.`}
            </p>
            <Button
              className="bg-violet-600 hover:bg-violet-700"
              onClick={() => window.location.href = createPageUrl('Missions')}
            >
              Browse Missions
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(mission => (
            <MissionRow
              key={mission.id}
              mission={mission}
              onClick={() => setSelectedMission(mission)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedMission && (
        <MissionDetailModal
          mission={selectedMission}
          open={!!selectedMission}
          onClose={() => setSelectedMission(null)}
        />
      )}
    </div>
  );
}