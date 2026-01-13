import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit, 
  Upload,
  Wand2,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

      {/* Challenges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map(challenge => (
          <Card key={challenge.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{challenge.title}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleEdit(challenge)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-rose-500 hover:text-rose-600"
                    onClick={() => deleteMutation.mutate(challenge.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {challenge.image_url && (
                <img 
                  src={challenge.image_url} 
                  alt={challenge.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <p className="text-sm text-slate-600">{challenge.description}</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">{challenge.category}</Badge>
                <Badge variant="outline" className="text-xs">{challenge.challenge_type}</Badge>
                {challenge.download_url && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs gap-1">
                    <Download className="w-3 h-3" />
                    Downloadable
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>Target: {challenge.target_count}</span>
                <span>Reward: {challenge.reward_points} pts</span>
                {challenge.reward_ggg > 0 && <span>+{challenge.reward_ggg} GGG</span>}
              </div>
              {challenge.user_notes && (
                <div className="text-xs text-violet-600 bg-violet-50 p-2 rounded">
                  Has user notes
                </div>
              )}
            </CardContent>
          </Card>
        ))}
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