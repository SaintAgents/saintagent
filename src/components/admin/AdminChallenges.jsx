import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit, 
  Upload,
  Wand2,
  Loader2,
  Image as ImageIcon,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

function ChallengeCard({ template, userChallenges, users, completedCount, activeCount, expiredCount, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);

  const getUserProfile = (userId) => users.find(u => u.user_id === userId);

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">{template.title}</CardTitle>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">{template.category}</Badge>
                  <Badge variant="outline" className="text-xs">{template.challenge_type}</Badge>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-1">{template.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span>Action: <code className="bg-slate-100 px-1 rounded">{template.target_action}</code></span>
                <span>Target: {template.target_count}</span>
                <span>Reward: {template.reward_points} pts</span>
                {template.reward_ggg > 0 && <span>+{template.reward_ggg} GGG</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => onEdit(template)}
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-rose-500 hover:text-rose-600"
                onClick={() => onDelete(template.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          {userChallenges.length > 0 && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full mt-3 justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{userChallenges.length}</span>
                    <span className="text-slate-500">users assigned</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {completedCount} completed
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <Clock className="w-3.5 h-3.5" />
                      {activeCount} active
                    </span>
                    {expiredCount > 0 && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <XCircle className="w-3.5 h-3.5" />
                        {expiredCount} expired
                      </span>
                    )}
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
          )}
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 border-t">
            <div className="space-y-2 mt-3">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">User Progress</div>
              {userChallenges.map(challenge => {
                const userProfile = getUserProfile(challenge.user_id);
                const progress = Math.min(100, ((challenge.current_count || 0) / (challenge.target_count || 1)) * 100);
                
                return (
                  <div key={challenge.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                    <img 
                      src={userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.display_name || challenge.user_id)}`}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {userProfile?.display_name || challenge.user_id}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={
                            challenge.status === 'completed' || challenge.status === 'claimed' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : challenge.status === 'active'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-500'
                          }
                        >
                          {challenge.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {challenge.current_count || 0}/{challenge.target_count}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function AdminChallenges() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'social',
    challenge_type: 'daily',
    target_action: '',
    target_count: 1,
    reward_points: 10,
    reward_ggg: 0,
    reward_badge: '',
    image_url: '',
    download_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const { data: challenges = [] } = useQuery({
    queryKey: ['allChallenges'],
    queryFn: () => base44.entities.Challenge.list('-created_date', 100)
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500)
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let image_url = data.image_url;
      if (imageFile) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file: imageFile });
        image_url = uploadRes.file_url;
      }
      return base44.entities.Challenge.create({ ...data, image_url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allChallenges'] });
      setCreateOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      let image_url = data.image_url;
      if (imageFile) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file: imageFile });
        image_url = uploadRes.file_url;
      }
      return base44.entities.Challenge.update(id, { ...data, image_url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allChallenges'] });
      setEditingChallenge(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Challenge.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allChallenges'] })
  });

  const aiGenerateMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a spiritual/mystical challenge based on this request: ${aiPrompt}
        
        Return a challenge object with:
        - title (short, compelling)
        - description (2-3 sentences explaining the challenge)
        - category (choose from: profile, social, meetings, missions, marketplace, learning)
        - target_action (specific action like "meditate_daily", "download_sigil", "share_experience")
        - target_count (number of times to complete)
        - reward_points (10-100)
        - reward_ggg (0-50)
        - challenge_type (daily, weekly, milestone, or special)
        - ai_reasoning (why this challenge is meaningful)`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            target_action: { type: "string" },
            target_count: { type: "number" },
            reward_points: { type: "number" },
            reward_ggg: { type: "number" },
            challenge_type: { type: "string" },
            ai_reasoning: { type: "string" }
          }
        }
      });
      return res;
    },
    onSuccess: (aiData) => {
      setFormData({
        ...formData,
        ...aiData,
        challenge_type: 'ai_suggested'
      });
      setAiGenerateOpen(false);
      setCreateOpen(true);
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'social',
      challenge_type: 'daily',
      target_action: '',
      target_count: 1,
      reward_points: 10,
      reward_ggg: 0,
      reward_badge: '',
      image_url: '',
      download_url: ''
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleEdit = (challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      challenge_type: challenge.challenge_type,
      target_action: challenge.target_action,
      target_count: challenge.target_count,
      reward_points: challenge.reward_points,
      reward_ggg: challenge.reward_ggg,
      reward_badge: challenge.reward_badge || '',
      image_url: challenge.image_url || '',
      download_url: challenge.download_url || ''
    });
    setImagePreview(challenge.image_url || '');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (editingChallenge) {
      updateMutation.mutate({ id: editingChallenge.id, data: formData });
    } else {
      // Create for all users or specific user
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Challenge Management</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setAiGenerateOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <Wand2 className="w-4 h-4" />
            AI Create
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            New Challenge
          </Button>
        </div>
      </div>

      {/* Challenges List with User Progress */}
      <div className="space-y-4">
        {/* Group challenges by target_action for template view */}
        {(() => {
          // Group challenges by title to show as templates with user progress
          const challengesByTitle = challenges.reduce((acc, c) => {
            if (!acc[c.title]) acc[c.title] = [];
            acc[c.title].push(c);
            return acc;
          }, {});

          return Object.entries(challengesByTitle).map(([title, challengeGroup]) => {
            const template = challengeGroup[0];
            const userChallenges = challengeGroup.filter(c => c.user_id);
            const completedCount = userChallenges.filter(c => c.status === 'completed' || c.status === 'claimed').length;
            const activeCount = userChallenges.filter(c => c.status === 'active').length;
            const expiredCount = userChallenges.filter(c => c.status === 'expired').length;

            return (
              <ChallengeCard 
                key={title}
                template={template}
                userChallenges={userChallenges}
                users={users}
                completedCount={completedCount}
                activeCount={activeCount}
                expiredCount={expiredCount}
                onEdit={handleEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            );
          });
        })()}
      </div>

      {/* AI Generate Modal */}
      <Dialog open={aiGenerateOpen} onOpenChange={setAiGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-violet-500" />
              AI Challenge Generator
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe the challenge you want to create... (e.g., 'Create a 7-day meditation challenge with the 11th Seal Sigil')"
              rows={4}
            />
            <Button
              onClick={() => aiGenerateMutation.mutate()}
              disabled={!aiPrompt.trim() || aiGenerateMutation.isPending}
              className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {aiGenerateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Challenge
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Modal */}
      <Dialog open={createOpen || !!editingChallenge} onOpenChange={(open) => {
        if (!open) {
          setCreateOpen(false);
          setEditingChallenge(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Challenge title"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the challenge..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Category</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profile">Profile</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="meetings">Meetings</SelectItem>
                    <SelectItem value="missions">Missions</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Type</label>
                <Select value={formData.challenge_type} onValueChange={(v) => setFormData({ ...formData, challenge_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                    <SelectItem value="ai_suggested">AI Suggested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Target Action</label>
              <Input
                value={formData.target_action}
                onChange={(e) => setFormData({ ...formData, target_action: e.target.value })}
                placeholder="e.g., download_sigil, meditate_daily"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Target Count</label>
                <Input
                  type="number"
                  value={formData.target_count}
                  onChange={(e) => setFormData({ ...formData, target_count: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Points Reward</label>
                <Input
                  type="number"
                  value={formData.reward_points}
                  onChange={(e) => setFormData({ ...formData, reward_points: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">GGG Reward</label>
                <Input
                  type="number"
                  value={formData.reward_ggg}
                  onChange={(e) => setFormData({ ...formData, reward_ggg: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Badge Code (optional)</label>
              <Input
                value={formData.reward_badge}
                onChange={(e) => setFormData({ ...formData, reward_badge: e.target.value })}
                placeholder="e.g., eleventh_seal"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Image Upload</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors border border-slate-200">
                  <ImageIcon className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Download URL (for sigils/PDFs)</label>
              <Input
                value={formData.download_url}
                onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateOpen(false);
                  setEditingChallenge(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {editingChallenge ? 'Update' : 'Create'} Challenge
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}