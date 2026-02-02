import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Video, Music, FolderOpen, Sparkles, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';

const CONTENT_TYPES = [
  { value: 'article', label: 'Article', icon: FileText, description: 'Written content with rich formatting' },
  { value: 'video', label: 'Video', icon: Video, description: 'Video content with editing tools' },
  { value: 'audio', label: 'Audio', icon: Music, description: 'Podcasts, music, or audio content' },
  { value: 'mixed', label: 'Mixed Media', icon: FolderOpen, description: 'Combine multiple content types' }
];

const CATEGORIES = [
  'tutorial', 'guide', 'story', 'news', 'review', 'creative', 'educational', 'other'
];

export default function CreateContentModal({ open, onClose, profile }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'article',
    category: 'other',
    visibility: 'private'
  });
  const [aiGenerating, setAiGenerating] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const project = await base44.entities.ContentProject.create({
        ...data,
        owner_id: profile?.user_id,
        owner_name: profile?.display_name,
        owner_avatar: profile?.avatar_url,
        status: 'draft',
        current_version: 1
      });

      // Create initial version
      await base44.entities.ContentVersion.create({
        project_id: project.id,
        version_number: 1,
        content: '',
        author_id: profile?.user_id,
        author_name: profile?.display_name,
        change_summary: 'Initial creation',
        change_type: 'create'
      });

      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['myContentProjects'] });
      onClose();
      window.location.href = createPageUrl('ContentEditor') + `?id=${project.id}`;
    }
  });

  const handleAISuggest = async () => {
    if (!formData.title) return;
    setAiGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a compelling description for a ${formData.content_type} project titled "${formData.title}". 
        Keep it under 100 words, engaging, and professional. Also suggest the best category from: ${CATEGORIES.join(', ')}.`,
        response_json_schema: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            suggested_category: { type: 'string' }
          }
        }
      });
      setFormData(prev => ({
        ...prev,
        description: result.description,
        category: CATEGORIES.includes(result.suggested_category) ? result.suggested_category : prev.category
      }));
    } catch (e) {
      console.error('AI suggestion failed:', e);
    }
    setAiGenerating(false);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Content Project</DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Content Type</Label>
              <RadioGroup 
                value={formData.content_type}
                onValueChange={(v) => setFormData(prev => ({ ...prev, content_type: v }))}
                className="grid grid-cols-2 gap-3"
              >
                {CONTENT_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <label
                      key={type.value}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.content_type === type.value 
                          ? 'border-violet-500 bg-violet-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <RadioGroupItem value={type.value} className="mt-1" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-violet-600" />
                          <span className="font-medium text-slate-900">{type.label}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Continue</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Project Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a compelling title..."
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Description</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-violet-600 gap-1 h-7"
                  onClick={handleAISuggest}
                  disabled={!formData.title || aiGenerating}
                >
                  {aiGenerating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  AI Suggest
                </Button>
              </div>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your content..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select 
                  value={formData.category}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Visibility</Label>
                <Select 
                  value={formData.visibility}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, visibility: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="collaborators">Collaborators Only</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button 
                onClick={handleSubmit}
                disabled={!formData.title.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}