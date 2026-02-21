import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, X, Image, Target, ListTodo, Award, Users, Info } from "lucide-react";
import { GGG_TO_USD } from '@/components/earnings/gggMatrix';
import MissionMilestoneEditor from './missions/MissionMilestoneEditor';
import MissionRewardEditor from './missions/MissionRewardEditor';
import MissionAIAssistant from './missions/MissionAIAssistant';

export default function CreateMissionModal({ open, onClose, prefillData, editMission }) {
  const [activeTab, setActiveTab] = useState('basics');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective: '',
    mission_type: 'personal',
    reward_ggg: '',
    reward_rank_points: '',
    reward_boost: '',
    reward_badge_code: '',
    reward_role: '',
    max_participants: '',
    image_url: '',
    roles_needed: [],
    milestones: [],
    requires_ggg_approval: false
  });
  const [newRole, setNewRole] = useState('');
  const [uploading, setUploading] = useState(false);
  const [localFile, setLocalFile] = useState(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: currentUser.email });
    }
  });
  const profile = profiles?.[0];

  const { data: platformSettings = [] } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.list()
  });
  const settings = platformSettings[0];
  
  const canOverrideCap = user?.role === 'admin' || (settings?.mission_cap_override_emails || []).includes(user?.email);
  const configuredCapUSD = settings?.mission_reward_cap_usd ?? 55;
  const effectiveMaxUSD = canOverrideCap ? Infinity : configuredCapUSD;
  const effectiveMaxGGG = canOverrideCap ? Infinity : (effectiveMaxUSD / GGG_TO_USD);

  // Handle prefill data or edit mode
  useEffect(() => {
    if (editMission) {
      setFormData({
        title: editMission.title || '',
        description: editMission.description || '',
        objective: editMission.objective || '',
        mission_type: editMission.mission_type || 'personal',
        reward_ggg: editMission.reward_ggg || '',
        reward_rank_points: editMission.reward_rank_points || '',
        reward_boost: editMission.reward_boost || '',
        reward_badge_code: editMission.reward_badge_code || '',
        reward_role: editMission.reward_role || '',
        max_participants: editMission.max_participants || '',
        image_url: editMission.image_url || '',
        roles_needed: editMission.roles_needed || [],
        milestones: editMission.milestones || [],
        requires_ggg_approval: editMission.requires_ggg_approval || false
      });
    } else if (prefillData) {
      setFormData(prev => ({
        ...prev,
        title: prefillData.title || prev.title,
        description: prefillData.description || prev.description,
        objective: prefillData.objective || prev.objective,
        mission_type: prefillData.mission_type || prev.mission_type,
        reward_ggg: prefillData.reward_ggg || prev.reward_ggg,
        reward_rank_points: prefillData.reward_rank_points || prev.reward_rank_points,
        roles_needed: prefillData.roles_needed || prev.roles_needed,
        milestones: prefillData.milestones || prev.milestones
      }));
    }
  }, [prefillData, editMission]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      objective: '',
      mission_type: 'personal',
      reward_ggg: '',
      reward_rank_points: '',
      reward_boost: '',
      reward_badge_code: '',
      reward_role: '',
      max_participants: '',
      image_url: '',
      roles_needed: [],
      milestones: [],
      requires_ggg_approval: false
    });
    setActiveTab('basics');
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const gggAmount = parseFloat(data.reward_ggg) || 0;
      const needsApproval = data.requires_ggg_approval || (!canOverrideCap && gggAmount > effectiveMaxGGG);
      
      const missionData = {
        ...data,
        creator_id: user.email,
        creator_name: profile?.display_name || user.full_name,
        status: needsApproval ? 'pending_approval' : 'active',
        requires_ggg_approval: needsApproval,
        ggg_approval_status: needsApproval ? 'pending' : 'approved',
        reward_ggg: gggAmount,
        reward_rank_points: parseInt(data.reward_rank_points) || 0,
        reward_boost: parseFloat(data.reward_boost) || 0,
        max_participants: parseInt(data.max_participants) || null,
        participant_count: 0,
        participant_ids: []
      };

      const mission = editMission 
        ? await base44.entities.Mission.update(editMission.id, missionData)
        : await base44.entities.Mission.create(missionData);

      // Create admin request if GGG approval is needed
      if (needsApproval && gggAmount > 0) {
        await base44.entities.AdminRequest.create({
          request_type: 'mission_ggg_approval',
          title: `GGG Approval: ${data.title}`,
          description: `Mission "${data.title}" requests ${gggAmount} GGG reward (≈$${(gggAmount * GGG_TO_USD).toFixed(2)})`,
          requester_id: user.email,
          requester_name: profile?.display_name || user.full_name,
          requester_avatar: profile?.avatar_url,
          reference_type: 'mission',
          reference_id: mission.id,
          requested_value: {
            ggg: gggAmount,
            rank_points: parseInt(data.reward_rank_points) || 0,
            badge: data.reward_badge_code,
            role: data.reward_role
          },
          priority: gggAmount > effectiveMaxGGG * 2 ? 'high' : 'normal'
        });
      }

      return mission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      onClose();
      resetForm();
    },
    onError: (err) => {
      console.error('Failed to save mission:', err);
      alert('Failed to save mission. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleAISuggestions = (suggestions) => {
    setFormData(prev => ({
      ...prev,
      ...suggestions
    }));
    // Switch to appropriate tab based on what was updated
    if (suggestions.milestones) {
      setActiveTab('milestones');
    }
  };

  const addRole = () => {
    if (newRole.trim() && !formData.roles_needed.includes(newRole.trim())) {
      setFormData({
        ...formData,
        roles_needed: [...formData.roles_needed, newRole.trim()]
      });
      setNewRole('');
    }
  };

  const removeRole = (index) => {
    setFormData({
      ...formData,
      roles_needed: formData.roles_needed.filter((_, i) => i !== index)
    });
  };

  const handleUpload = async () => {
    if (!localFile) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file: localFile });
      if (res?.file_url) {
        setFormData({ ...formData, image_url: res.file_url });
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploading(false);
  };

  const gggRequiresApproval = !canOverrideCap && (parseFloat(formData.reward_ggg) || 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-600" />
            {editMission ? 'Edit Mission' : 'Create New Mission'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 min-h-0">
          {/* Main Form */}
          <div className="flex-1 flex flex-col min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="px-6 pt-4 shrink-0">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="basics" className="gap-1">
                    <Target className="w-4 h-4" />
                    Basics
                  </TabsTrigger>
                  <TabsTrigger value="milestones" className="gap-1">
                    <ListTodo className="w-4 h-4" />
                    Milestones
                  </TabsTrigger>
                  <TabsTrigger value="rewards" className="gap-1">
                    <Award className="w-4 h-4" />
                    Rewards
                  </TabsTrigger>
                  <TabsTrigger value="team" className="gap-1">
                    <Users className="w-4 h-4" />
                    Team
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 px-6">
                <form id="mission-form" onSubmit={handleSubmit} className="py-4 space-y-6">
                  {/* Basics Tab */}
                  <TabsContent value="basics" className="mt-0 space-y-4">
                    <div>
                      <Label>Mission Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Build AI Agent for Community"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Objective *</Label>
                      <Input
                        value={formData.objective}
                        onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                        placeholder="What is the goal?"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the mission in detail..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Mission Type</Label>
                        <Select
                          value={formData.mission_type}
                          onValueChange={(value) => setFormData({ ...formData, mission_type: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                            <SelectItem value="region">Region</SelectItem>
                            <SelectItem value="platform">Platform</SelectItem>
                            <SelectItem value="leader">Leader</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Max Participants</Label>
                        <Input
                          type="number"
                          value={formData.max_participants}
                          onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                          placeholder="Unlimited"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div>
                      <Label className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Cover Image
                      </Label>
                      <div className="mt-2 space-y-3">
                        {formData.image_url && (
                          <div className="relative rounded-lg overflow-hidden border">
                            <img src={formData.image_url} alt="Cover" className="w-full h-40 object-cover" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 w-6 h-6"
                              onClick={() => setFormData({ ...formData, image_url: '' })}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setLocalFile(e.target.files?.[0] || null)}
                            className="flex-1"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            disabled={!localFile || uploading} 
                            onClick={handleUpload}
                          >
                            {uploading ? 'Uploading…' : 'Upload'}
                          </Button>
                        </div>
                        <Input 
                          placeholder="Or paste image URL..." 
                          value={formData.image_url} 
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} 
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Milestones Tab */}
                  <TabsContent value="milestones" className="mt-0">
                    <MissionMilestoneEditor
                      milestones={formData.milestones}
                      onChange={(milestones) => setFormData({ ...formData, milestones })}
                    />
                  </TabsContent>

                  {/* Rewards Tab */}
                  <TabsContent value="rewards" className="mt-0">
                    <MissionRewardEditor
                      rewards={{
                        reward_ggg: formData.reward_ggg,
                        reward_rank_points: formData.reward_rank_points,
                        reward_boost: formData.reward_boost,
                        reward_badge_code: formData.reward_badge_code,
                        reward_role: formData.reward_role
                      }}
                      onChange={(rewards) => setFormData({ ...formData, ...rewards })}
                      requiresApproval={formData.requires_ggg_approval}
                      onApprovalChange={(v) => setFormData({ ...formData, requires_ggg_approval: v })}
                      maxGGG={effectiveMaxGGG}
                      canOverrideCap={canOverrideCap}
                    />
                  </TabsContent>

                  {/* Team Tab */}
                  <TabsContent value="team" className="mt-0 space-y-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-500" />
                        Roles Needed
                      </Label>
                      <p className="text-sm text-slate-500 mt-1 mb-3">
                        Define what roles are needed for this mission
                      </p>
                      
                      <div className="flex gap-2 mb-3">
                        <Input
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          placeholder="e.g., Developer, Designer, Writer..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
                        />
                        <Button type="button" variant="outline" onClick={addRole}>
                          Add Role
                        </Button>
                      </div>

                      {formData.roles_needed.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.roles_needed.map((role, i) => (
                            <Badge key={i} variant="secondary" className="gap-1 px-3 py-1">
                              {role}
                              <button
                                type="button"
                                onClick={() => removeRole(i)}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 text-center py-4 border-2 border-dashed rounded-lg">
                          No roles defined yet
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </form>
              </ScrollArea>
            </Tabs>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-slate-50 shrink-0">
              {gggRequiresApproval && (
                <Alert className="mb-4 bg-amber-50 border-amber-200">
                  <Info className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 text-sm">
                    This mission will be submitted for admin approval before going live.
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  form="mission-form"
                  disabled={createMutation.isPending || !formData.title || !formData.objective}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editMission ? 'Save Changes' : (gggRequiresApproval ? 'Submit for Approval' : 'Create Mission')}
                </Button>
              </div>
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          <div className="w-80 border-l bg-slate-50/50 p-4 shrink-0 hidden lg:block">
            <MissionAIAssistant
              title={formData.title}
              description={formData.description}
              onApplySuggestions={handleAISuggestions}
              disabled={!formData.title.trim()}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}