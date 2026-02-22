import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

export default function ContentSettingsModal({ open, onClose, project }) {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    visibility: project?.visibility || 'private',
    category: project?.category || 'other',
    allowComments: project?.settings?.allow_comments ?? true,
    allowSuggestions: project?.settings?.allow_suggestions ?? true,
    requireApproval: project?.settings?.require_approval ?? false
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ContentProject.update(project.id, {
        visibility: settings.visibility,
        category: settings.category,
        settings: {
          allow_comments: settings.allowComments,
          allow_suggestions: settings.allowSuggestions,
          require_approval: settings.requireApproval
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentProject'] });
      toast.success('Settings updated');
      onClose();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Visibility</Label>
            <Select value={settings.visibility} onValueChange={(v) => setSettings(prev => ({ ...prev, visibility: v }))}>
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

          <div>
            <Label>Category</Label>
            <Select value={settings.category} onValueChange={(v) => setSettings(prev => ({ ...prev, category: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutorial">Tutorial</SelectItem>
                <SelectItem value="guide">Guide</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Allow Comments</Label>
              <Switch
                checked={settings.allowComments}
                onCheckedChange={(v) => setSettings(prev => ({ ...prev, allowComments: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Allow Suggestions</Label>
              <Switch
                checked={settings.allowSuggestions}
                onCheckedChange={(v) => setSettings(prev => ({ ...prev, allowSuggestions: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Require Approval for Changes</Label>
              <Switch
                checked={settings.requireApproval}
                onCheckedChange={(v) => setSettings(prev => ({ ...prev, requireApproval: v }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="border-slate-300 text-slate-700">
              Cancel
            </Button>
            <Button 
              onClick={() => updateMutation.mutate()} 
              disabled={updateMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}