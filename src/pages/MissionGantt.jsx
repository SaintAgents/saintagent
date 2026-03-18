import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import MissionGanttChart from '@/components/missions/MissionGanttChart';

export default function MissionGantt() {
  const urlParams = new URLSearchParams(window.location.search);
  const missionId = urlParams.get('id');
  const queryClient = useQueryClient();

  const { data: mission, isLoading } = useQuery({
    queryKey: ['mission', missionId],
    queryFn: () => base44.entities.Mission.filter({ id: missionId }),
    select: (data) => data?.[0],
    enabled: !!missionId,
  });

  const updateMission = useMutation({
    mutationFn: (data) => base44.entities.Mission.update(missionId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mission', missionId] }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Mission not found</p>
        <Link to="/Missions"><Button variant="outline">Back to Missions</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 md:p-6 pb-24">
      <div className="max-w-full mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link to={`/MissionDetail?id=${missionId}`}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{mission.title}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Mission Timeline
              <Badge variant="outline" className="text-[10px]">{mission.status}</Badge>
            </p>
          </div>
        </div>

        {/* Gantt Chart */}
        <MissionGanttChart
          mission={mission}
          onUpdateMission={(data) => updateMission.mutate(data)}
          isSaving={updateMission.isPending}
        />
      </div>
    </div>
  );
}