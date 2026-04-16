import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target, ArrowLeft, Pencil, Users, BarChart3, Settings, Shield, Clock, Bell
} from "lucide-react";
import { Link } from 'react-router-dom';
import Breadcrumb from '@/components/hud/Breadcrumb';
import CreateMissionModal from '@/components/CreateMissionModal';
import MissionManageOverview from '@/components/missions/manage/MissionManageOverview';
import MissionManageTeam from '@/components/missions/manage/MissionManageTeam';
import MissionManageControls from '@/components/missions/manage/MissionManageControls';
import MissionDeadlinePanel from '@/components/missions/manage/MissionDeadlinePanel';
import MissionNotificationsLog from '@/components/missions/manage/MissionNotificationsLog';

export default function MissionManage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const missionId = urlParams.get('id');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: currentUser.email });
    },
    enabled: !!user
  });
  const profile = profiles?.[0];

  const { data: mission, isLoading } = useQuery({
    queryKey: ['mission', missionId],
    queryFn: async () => {
      const missions = await base44.entities.Mission.filter({ id: missionId });
      return missions?.[0] || null;
    },
    enabled: !!missionId,
    staleTime: 30000,
  });

  const isCreator = mission?.creator_id === user?.email;
  const isAdmin = user?.role === 'admin';
  const canManage = isCreator || isAdmin;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-semibold mb-2">Mission not found</h2>
          <Link to="/Missions">
            <Button>Back to Missions</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-sm text-slate-500 mb-4">Only the mission owner or admin can manage this mission.</p>
          <Link to={`/MissionDetail?id=${missionId}`}>
            <Button>View Mission</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    draft: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-600',
    pending_approval: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <Breadcrumb items={[
            { label: 'Missions', page: 'Missions' },
            { label: mission.title, page: 'MissionDetail', params: { id: missionId } },
            { label: 'Manage' }
          ]} />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-100">
                <Target className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{mission.title}</h1>
                  <Badge className={statusColors[mission.status] || 'bg-slate-100 text-slate-600'}>
                    {mission.status?.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{mission.objective}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/MissionDetail?id=${missionId}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  View Mission
                </Button>
              </Link>
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 gap-1.5"
                onClick={() => setEditModalOpen(true)}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border rounded-xl mb-6">
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5">
              <Users className="w-4 h-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="deadlines" className="gap-1.5">
              <Clock className="w-4 h-4" />
              Deadlines
            </TabsTrigger>
            <TabsTrigger value="controls" className="gap-1.5">
              <Settings className="w-4 h-4" />
              Controls
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5">
              <Bell className="w-4 h-4" />
              Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <MissionManageOverview mission={mission} />
          </TabsContent>

          <TabsContent value="team">
            <MissionManageTeam mission={mission} currentUser={user} />
          </TabsContent>

          <TabsContent value="deadlines">
            <MissionDeadlinePanel mission={mission} isCreator={isCreator} />
          </TabsContent>

          <TabsContent value="controls">
            <MissionManageControls mission={mission} currentUser={user} missionId={missionId} />
          </TabsContent>

          <TabsContent value="notifications">
            <MissionNotificationsLog mission={mission} currentUser={user} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      <CreateMissionModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        editMission={mission}
      />
    </div>
  );
}