import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  Plus,
  Users,
  Calendar,
  TrendingUp,
  Crown,
  CheckCircle,
  Wand2
} from "lucide-react";
import { toast } from "sonner";
import MissionDesignAssistant from './MissionDesignAssistant';

export default function LeaderMissionsPanel({ profile }) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newMission, setNewMission] = useState({
    title: '',
    objective: '',
    reward_ggg: 0,
    reward_rank_points: 0,
    max_participants: null
  });

  const queryClient = useQueryClient();

  const { data: leaderMissions = [] } = useQuery({
    queryKey: ['leaderMissions'],
    queryFn: () => base44.entities.Mission.filter({ 
      mission_type: 'leader',
      status: 'active'
    }, '-created_date', 50)
  });

  const createMissionMutation = useMutation({
    mutationFn: (data) => base44.entities.Mission.create({
      ...data,
      creator_id: profile.user_id,
      creator_name: profile.display_name,
      mission_type: 'leader',
      status: 'active',
      participant_ids: [],
      participant_count: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderMissions'] });
      setCreateModalOpen(false);
      setNewMission({ title: '', objective: '', reward_ggg: 0, reward_rank_points: 0, max_participants: null });
      toast.success('Leader mission created!');
    }
  });

  const handleCreate = () => {
    if (!newMission.title || !newMission.objective) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMissionMutation.mutate(newMission);
  };

  const handleApplyAISuggestions = (suggestions) => {
    setNewMission({
      title: suggestions.title,
      objective: suggestions.objective,
      reward_ggg: suggestions.reward_ggg,
      reward_rank_points: suggestions.reward_rank_points,
      max_participants: suggestions.max_participants
    });
  };

  const totalParticipants = leaderMissions.reduce((sum, m) => sum + (m.participant_count || 0), 0);
  const completedMissions = leaderMissions.filter(m => m.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <Target className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{leaderMissions.length}</p>
                <p className="text-xs text-slate-500">Active Missions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalParticipants}</p>
                <p className="text-xs text-slate-500">Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{completedMissions}</p>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-slate-900">Leader-Led Missions</h3>
          <p className="text-sm text-slate-500">High-impact missions coordinated by verified leaders</p>
        </div>
        <Button 
          onClick={() => setCreateModalOpen(true)}
          className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Mission
        </Button>
      </div>

      {/* Missions List */}
      <div className="space-y-3">
        {leaderMissions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No leader missions yet</p>
              <p className="text-sm text-slate-400 mt-1">Create the first high-impact mission</p>
            </CardContent>
          </Card>
        ) : (
          leaderMissions.map((mission) => (
            <Card key={mission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-slate-900">{mission.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Leader
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{mission.objective}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {mission.participant_count || 0} participants
                        {mission.max_participants && ` / ${mission.max_participants}`}
                      </div>
                      {mission.reward_ggg > 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {mission.reward_ggg} GGG reward
                        </div>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Mission Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Create Leader Mission
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="manual" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Wand2 className="w-4 h-4" />
                AI Designer
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai" className="flex-1 overflow-auto mt-4">
              <MissionDesignAssistant onApplySuggestions={handleApplyAISuggestions} />
            </TabsContent>
            
            <TabsContent value="manual" className="flex-1 overflow-auto">
              <div className="space-y-4">
            <div>
              <Label htmlFor="title">Mission Title *</Label>
              <Input
                id="title"
                value={newMission.title}
                onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                placeholder="e.g., Launch Global Meditation Network"
              />
            </div>
            <div>
              <Label htmlFor="objective">Objective *</Label>
              <Textarea
                id="objective"
                value={newMission.objective}
                onChange={(e) => setNewMission({ ...newMission, objective: e.target.value })}
                placeholder="Describe the mission goal..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reward_ggg">GGG Reward</Label>
                <Input
                  id="reward_ggg"
                  type="number"
                  value={newMission.reward_ggg}
                  onChange={(e) => setNewMission({ ...newMission, reward_ggg: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="reward_rank">Rank Points</Label>
                <Input
                  id="reward_rank"
                  type="number"
                  value={newMission.reward_rank_points}
                  onChange={(e) => setNewMission({ ...newMission, reward_rank_points: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="max_participants">Max Participants (optional)</Label>
              <Input
                id="max_participants"
                type="number"
                value={newMission.max_participants || ''}
                onChange={(e) => setNewMission({ ...newMission, max_participants: parseInt(e.target.value) || null })}
                placeholder="Unlimited"
              />
            </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCreateModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreate}
                    disabled={createMissionMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                  >
                    Create Mission
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}