import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, Edit2, Trash2, Send, FileText, Calendar, 
  Twitter, Linkedin, MessageCircle, Mail, Radio, Eye, Sparkles, Loader2, Upload, X, Image
} from 'lucide-react';
import { format } from 'date-fns';
import AIWritingAssistant from '@/components/ai/AIWritingAssistant';

const CATEGORIES = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'update', label: 'Update' },
  { value: 'event', label: 'Event' },
  { value: 'community', label: 'Community' },
  { value: 'financial', label: 'Financial' }
];

const DISTRIBUTION_CHANNELS = [
  { value: 'twitter', label: 'Twitter/X', icon: Twitter },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'telegram', label: 'Telegram', icon: MessageCircle },
  { value: 'discord', label: 'Discord', icon: MessageCircle },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'newswire', label: 'Newswire', icon: Radio }
];

const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700'
};

export default function PressReleaseManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'announcement',
    image_url: '',
    status: 'draft',
    tags: [],
    distribution_channels: []
  });
  const [tagInput, setTagInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: pressReleases = [], isLoading } = useQuery({
    queryKey: ['pressReleases'],
    queryFn: () => base44.entities.PressRelease.list('-created_date', 50)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PressRelease.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pressReleases'] });
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PressRelease.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pressReleases'] });
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PressRelease.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pressReleases'] });
    }
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRelease(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      category: 'announcement',
      image_url: '',
      status: 'draft',
      tags: [],
      distribution_channels: []
    });
    setTagInput('');
  };

  const openCreateModal = () => {
    setEditingRelease(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      category: 'announcement',
      image_url: '',
      status: 'draft',
      tags: [],
      distribution_channels: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (release) => {
    setEditingRelease(release);
    setFormData({
      title: release.title || '',
      summary: release.summary || '',
      content: release.content || '',
      category: release.category || 'announcement',
      image_url: release.image_url || '',
      status: release.status || 'draft',
      tags: release.tags || [],
      distribution_channels: release.distribution_channels || []
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (publishNow = false) => {
    const data = {
      ...formData,
      author_id: currentUser?.email,
      author_name: currentUser?.full_name,
      status: publishNow ? 'published' : formData.status,
      publish_date: publishNow ? new Date().toISOString() : formData.publish_date
    };

    if (editingRelease) {
      updateMutation.mutate({ id: editingRelease.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const toggleChannel = (channel) => {
    setFormData(prev => ({
      ...prev,
      distribution_channels: prev.distribution_channels.includes(channel)
        ? prev.distribution_channels.filter(c => c !== channel)
        : [...prev.distribution_channels, channel]
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setImageUploading(false);
    }
  };

  const generateWithAI = async () => {
    if (!formData.title?.trim()) return;
    setAiGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional PR writer. Write a compelling press release for the following headline:

"${formData.title}"

Category: ${formData.category}

Write a professional press release with:
1. A strong opening paragraph (the "lead") that summarizes the key news
2. 2-3 body paragraphs with supporting details, quotes, and context
3. A brief "About" section at the end

Use a professional, authoritative tone. Make it newsworthy and quotable.
Return ONLY the press release content, no additional commentary.`,
      });
      setFormData(prev => ({ ...prev, content: result }));
      
      // Also generate a summary if empty
      if (!formData.summary?.trim()) {
        const summaryResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Summarize this press release in 1-2 sentences for a preview:\n\n${result}\n\nReturn ONLY the summary.`,
        });
        setFormData(prev => ({ ...prev, summary: summaryResult }));
      }
    } catch (err) {
      console.error('AI generation failed:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Press Releases</h2>
          <p className="text-slate-600 mt-1">
            Create and manage press releases. Published releases trigger Zapier automations.
          </p>
        </div>
        <Button onClick={openCreateModal} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          New Press Release
        </Button>
      </div>

      {/* Zapier Info Banner */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Radio className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">Zapier Integration</h3>
              <p className="text-sm text-orange-700 mt-1">
                When you publish a press release, it creates a new entity that can trigger Zapier automations. 
                Connect to Twitter, LinkedIn, Telegram, or PR distribution services.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Press Releases List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
        </div>
      ) : pressReleases.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No Press Releases Yet</h3>
          <p className="text-slate-500 mt-2">Create your first press release to get started.</p>
          <Button onClick={openCreateModal} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Create Press Release
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pressReleases.map((release) => (
            <Card key={release.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={STATUS_COLORS[release.status]}>
                        {release.status}
                      </Badge>
                      <Badge variant="outline">{release.category}</Badge>
                      {release.distribution_channels?.length > 0 && (
                        <span className="text-xs text-slate-500">
                          → {release.distribution_channels.length} channels
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate">{release.title}</h3>
                    {release.summary && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{release.summary}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(release.created_date), 'MMM d, yyyy')}
                      </span>
                      {release.author_name && (
                        <span>by {release.author_name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(release)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteMutation.mutate(release.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRelease ? 'Edit Press Release' : 'Create Press Release'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter headline..."
              />
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Summary</Label>
                <AIWritingAssistant
                  text={formData.summary}
                  onApply={(text) => setFormData(prev => ({ ...prev, summary: text }))}
                  disabled={!formData.summary?.trim()}
                />
              </div>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief summary (1-2 sentences)..."
                rows={2}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Content *</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateWithAI}
                    disabled={!formData.title?.trim() || aiGenerating}
                    className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 gap-1.5"
                  >
                    {aiGenerating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span className="text-xs">Generate with AI</span>
                  </Button>
                  <AIWritingAssistant
                    text={formData.content}
                    onApply={(text) => setFormData(prev => ({ ...prev, content: text }))}
                    disabled={!formData.content?.trim()}
                  />
                </div>
              </div>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Full press release content (markdown supported)..."
                rows={8}
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Scheduled Date - only show when status is scheduled */}
            {formData.status === 'scheduled' && (
              <div className="space-y-2">
                <Label>Scheduled Publish Date</Label>
                <Input
                  type="datetime-local"
                  value={formData.publish_date ? formData.publish_date.slice(0, 16) : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, publish_date: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                />
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Featured Image</Label>
              {formData.image_url ? (
                <div className="relative rounded-lg overflow-hidden border">
                  <img 
                    src={formData.image_url} 
                    alt="Featured" 
                    className="w-full h-40 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading}
                  />
                  {imageUploading ? (
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  ) : (
                    <>
                      <Image className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500">Click to upload image</span>
                    </>
                  )}
                </label>
              )}
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="Or paste image URL..."
                className="mt-2"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Distribution Channels */}
            <div className="space-y-2">
              <Label>Distribution Channels (for Zapier)</Label>
              <div className="grid grid-cols-3 gap-2">
                {DISTRIBUTION_CHANNELS.map(channel => {
                  const Icon = channel.icon;
                  const isSelected = formData.distribution_channels.includes(channel.value);
                  return (
                    <div
                      key={channel.value}
                      onClick={() => toggleChannel(channel.value)}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? 'bg-violet-50 border-violet-300' : 'hover:bg-slate-50'
                      }`}
                    >
                      <Checkbox checked={isSelected} />
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{channel.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button 
              variant="outline" 
              onClick={() => handleSubmit(false)}
              disabled={!formData.title || !formData.content}
            >
              <Eye className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            <Button 
              onClick={() => handleSubmit(true)}
              disabled={!formData.title || !formData.content}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Publish Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}