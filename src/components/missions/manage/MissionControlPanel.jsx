import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Users, CheckCircle, Settings, Bell, Clock, 
  X, ExternalLink, Pencil
} from "lucide-react";
import { Link } from 'react-router-dom';
import MissionManageOverview from './MissionManageOverview';
import MissionManageTeam from './MissionManageTeam';
import MissionManageControls from './MissionManageControls';
import MissionDeadlinePanel from './MissionDeadlinePanel';
import MissionNotificationsLog from './MissionNotificationsLog';
import CreateMissionModal from '@/components/CreateMissionModal';

const statusColors = {
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  draft: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
  pending_approval: 'bg-amber-100 text-amber-700',
};

export default function MissionControlPanel({ mission, currentUser, isCreator, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);

  if (!mission) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge className={statusColors[mission.status] || 'bg-slate-100 text-slate-600'}>
              {mission.status?.replace('_', ' ')}
            </Badge>
            {isCreator && <Badge className="bg-violet-100 text-violet-600 text-[10px]">Owner</Badge>}
          </div>
          <div className="flex items-center gap-1">
            {isCreator && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditOpen(true)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            )}
            <Link to={`/MissionDetail?id=${mission.id}`}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <h3 className="font-bold text-slate-900 text-lg leading-tight">{mission.title}</h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{mission.objective}</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4 pt-3 border-b border-slate-100 overflow-x-auto">
          <TabsList className="bg-transparent p-0 h-auto gap-0 rounded-none">
            {[
              { value: 'overview', label: 'Overview', icon: BarChart3 },
              { value: 'team', label: 'Team', icon: Users },
              { value: 'deadlines', label: 'Deadlines', icon: Clock },
              ...(isCreator ? [
                { value: 'controls', label: 'Controls', icon: Settings },
              ] : []),
              { value: 'notifications', label: 'Log', icon: Bell },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs gap-1 px-3 py-2"
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <TabsContent value="overview" className="mt-0">
            <MissionManageOverview mission={mission} />
          </TabsContent>
          <TabsContent value="team" className="mt-0">
            <MissionManageTeam mission={mission} currentUser={currentUser} />
          </TabsContent>
          <TabsContent value="deadlines" className="mt-0">
            <MissionDeadlinePanel mission={mission} isCreator={isCreator} />
          </TabsContent>
          {isCreator && (
            <TabsContent value="controls" className="mt-0">
              <MissionManageControls mission={mission} currentUser={currentUser} missionId={mission.id} />
            </TabsContent>
          )}
          <TabsContent value="notifications" className="mt-0">
            <MissionNotificationsLog mission={mission} currentUser={currentUser} />
          </TabsContent>
        </div>
      </Tabs>

      {editOpen && (
        <CreateMissionModal open={editOpen} onClose={() => setEditOpen(false)} editMission={mission} />
      )}
    </div>
  );
}