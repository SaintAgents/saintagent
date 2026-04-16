import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Target, Plus, ListFilter, Settings2,
  LayoutGrid, List, Clock, Users, Coins, ChevronRight,
  PanelRightOpen
} from "lucide-react";
import { formatDistanceToNow, parseISO, isPast } from "date-fns";
import { createPageUrl } from '@/utils';

import MissionAnalyticsBar from './MissionAnalyticsBar';
import MissionCard from '@/components/hud/MissionCard';
import MissionDetailModal from '@/components/missions/MissionDetailModal';
import MissionControlPanel from '@/components/missions/manage/MissionControlPanel';

export default function MissionDashboardTab({ currentUser, profile }) {
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMission, setSelectedMission] = useState(null);
  const [controlMission, setControlMission] = useState(null);
  const userId = currentUser?.email;

  const { data: allMissions = [], isLoading } = useQuery({
    queryKey: ['myMissions', userId],
    queryFn: async () => {
      const [created, all] = await Promise.all([
        base44.entities.Mission.filter({ creator_id: userId }, '-created_date', 100),
        base44.entities.Mission.list('-created_date', 200),
      ]);
      const participated = all.filter(
        m => m.creator_id !== userId && (m.participant_ids || []).includes(userId)
      );
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
    const totalParticipants = allMissions.reduce((sum, m) => sum + (m.participant_count || (m.participant_ids?.length || 0)), 0);
    const totalTasks = allMissions.reduce((sum, m) => sum + (m.tasks?.length || 0), 0);
    const completedTasks = allMissions.reduce((sum, m) => sum + (m.tasks?.filter(t => t.completed)?.length || 0), 0);
    const pending = allMissions.filter(m => m.status === 'pending_approval').length;
    return { active, completed, created, totalGGG, totalParticipants, totalTasks, completedTasks, pending };
  }, [allMissions, userId]);

  const filtered = useMemo(() => {
    let result = allMissions;
    if (filter === 'active') result = result.filter(m => m.status === 'active');
    else if (filter === 'completed') result = result.filter(m => m.status === 'completed');
    else if (filter === 'created') result = result.filter(m => m.creator_id === userId);
    else if (filter === 'joined') result = result.filter(m => m.creator_id !== userId);
    return result.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (b.status === 'active' && a.status !== 'active') return 1;
      return new Date(b.created_date) - new Date(a.created_date);
    });
  }, [allMissions, filter, userId]);

  const filters = ['all', 'active', 'completed', 'created', 'joined'];

  const handleMissionClick = (mission) => {
    const isCreator = mission.creator_id === userId;
    if (isCreator) {
      setControlMission(mission);
    } else {
      setSelectedMission(mission);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics */}
      <MissionAnalyticsBar stats={stats} />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <ListFilter className="w-4 h-4 text-slate-400 hidden sm:block" />
          {filters.map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              className={filter === f ? 'bg-violet-600 hover:bg-violet-700' : ''}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px] bg-white/20">
                  {f === 'active' ? stats.active :
                   f === 'completed' ? stats.completed :
                   f === 'created' ? stats.created :
                   allMissions.filter(m => m.creator_id !== userId).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white rounded-lg border p-0.5">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 rounded-md" onClick={() => setViewMode('grid')}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 rounded-md" onClick={() => setViewMode('list')}>
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 gap-1" onClick={() => window.location.href = createPageUrl('Missions')}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Mission</span>
          </Button>
        </div>
      </div>

      {/* Inline Control Panel */}
      {controlMission && (
        <MissionControlPanel
          mission={controlMission}
          currentUser={currentUser}
          isCreator={controlMission.creator_id === userId}
          onClose={() => setControlMission(null)}
        />
      )}

      {/* Mission Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700 mb-1">No missions found</h3>
            <p className="text-sm text-slate-500 mb-4">
              {filter === 'all' ? "You haven't joined or created any missions yet." : `No ${filter} missions.`}
            </p>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => window.location.href = createPageUrl('Missions')}>
              Browse Missions
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(mission => (
            <div key={mission.id} className="relative">
              {mission.creator_id === userId && (
                <div className="absolute top-3 right-3 z-10 flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setControlMission(mission); }}
                    className="p-1 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                    title="Open Mission Control"
                  >
                    <PanelRightOpen className="w-3.5 h-3.5" />
                  </button>
                  <Badge className="bg-violet-600 text-white text-[10px] px-1.5 py-0 gap-1">
                    <Settings2 className="w-2.5 h-2.5" />
                    Owner
                  </Badge>
                </div>
              )}
              <MissionCard mission={mission} onAction={(action, m) => {
                if (action === 'manage') setControlMission(m);
              }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(mission => (
            <MissionListRow
              key={mission.id}
              mission={mission}
              isCreator={mission.creator_id === userId}
              isSelected={controlMission?.id === mission.id}
              onClick={() => handleMissionClick(mission)}
              onManage={() => setControlMission(mission)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal for non-creator clicks */}
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

function MissionListRow({ mission, isCreator, isSelected, onClick, onManage }) {
  const completedTasks = mission.tasks?.filter(t => t.completed)?.length || 0;
  const totalTasks = mission.tasks?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const timeLeft = mission.end_time && !isPast(parseISO(mission.end_time))
    ? formatDistanceToNow(parseISO(mission.end_time), { addSuffix: false })
    : null;

  const statusConfig = {
    active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
    completed: { label: 'Done', className: 'bg-blue-100 text-blue-700' },
    draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-600' },
    pending_approval: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  };
  const st = statusConfig[mission.status] || statusConfig.active;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer bg-white ${
        isSelected ? 'border-violet-400 shadow-md ring-1 ring-violet-200' : 'border-slate-200 hover:border-violet-300 hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className="p-2 rounded-lg bg-violet-100 shrink-0">
        <Target className="w-5 h-5 text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-slate-900 truncate">{mission.title}</p>
          <Badge className={st.className + ' text-[10px] px-1.5 py-0'}>{st.label}</Badge>
          {isCreator && <Badge className="bg-violet-100 text-violet-600 text-[10px] px-1.5 py-0">Owner</Badge>}
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
      <div className="flex items-center gap-1 shrink-0">
        {isCreator && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-violet-600" onClick={(e) => { e.stopPropagation(); onManage(); }} title="Open Control Panel">
            <PanelRightOpen className="w-4 h-4" />
          </Button>
        )}
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
}