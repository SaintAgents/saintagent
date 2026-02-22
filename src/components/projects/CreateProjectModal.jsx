import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, Users, Folder, Save, X } from 'lucide-react';

export default function CreateProjectModal({ open, onClose, currentUser, profile }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    stage: 'idea',
    project_status: 'planned',
    start_date: '',
    end_date: '',
    team_member_ids: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create({
      ...data,
      owner_id: currentUser?.email,
      owner_name: profile?.display_name || currentUser?.full_name,
      owner_avatar: profile?.avatar_url,
      status: 'funded',
      progress_percent: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fundedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['userProjects'] });
      onClose();
      setFormData({
        title: '',
        description: '',
        budget: '',
        stage: 'idea',
        project_status: 'planned',
        start_date: '',
        end_date: '',
        team_member_ids: []
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      budget: parseFloat(formData.budget) || 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-emerald-600" />
            Create New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Project Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter project name"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project goals and scope"
              className="mt-1 min-h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Budget</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="0"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label>Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(v) => setFormData({ ...formData, stage: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="prototype">Prototype</SelectItem>
                  <SelectItem value="pilot">Pilot</SelectItem>
                  <SelectItem value="scaling">Scaling</SelectItem>
                  <SelectItem value="mature_ops">Mature Ops</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!formData.title || createMutation.isPending}
            >
              <Save className="w-4 h-4 mr-1" />
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}