import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2 } from 'lucide-react';

export default function EditProjectModal({ open, onClose, project }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        budget: project.budget || 0,
        stage: project.stage || 'idea',
        project_status: project.project_status || 'planned',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        progress_percent: project.progress_percent || 0,
        organization_name: project.organization_name || '',
        website_url: project.website_url || '',
        geography: project.geography || '',
        strategic_intent: project.strategic_intent || '',
      });
    }
  }, [project?.id]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.update(project.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProjects'] });
      queryClient.invalidateQueries({ queryKey: ['fundedProjects'] });
      onClose();
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      ...formData,
      budget: Number(formData.budget) || 0,
      progress_percent: Number(formData.progress_percent) || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 min-h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Stage</Label>
              <Select value={formData.stage} onValueChange={(v) => setFormData({ ...formData, stage: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="prototype">Prototype</SelectItem>
                  <SelectItem value="pilot">Pilot</SelectItem>
                  <SelectItem value="scaling">Scaling</SelectItem>
                  <SelectItem value="mature_ops">Mature Ops</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Project Status</Label>
              <Select value={formData.project_status} onValueChange={(v) => setFormData({ ...formData, project_status: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Budget ($)</Label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Progress (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.progress_percent}
                onChange={(e) => setFormData({ ...formData, progress_percent: e.target.value })}
                className="mt-1"
              />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Organization</Label>
              <Input
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Geography</Label>
              <Input
                value={formData.geography}
                onChange={(e) => setFormData({ ...formData, geography: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Website URL</Label>
            <Input
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="mt-1"
              placeholder="https://..."
            />
          </div>

          <div>
            <Label>Strategic Intent</Label>
            <Textarea
              value={formData.strategic_intent}
              onChange={(e) => setFormData({ ...formData, strategic_intent: e.target.value })}
              className="mt-1 min-h-16"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !formData.title}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}