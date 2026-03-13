import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Save, X, User, Star } from 'lucide-react';
import TaskRecommendationPanel from './TaskRecommendationPanel';
import SkillTagInput from './SkillTagInput';
import { computeSkillMatch, getMatchScoreStyle } from './SkillMatchUtils';

export default function CreateTaskModal({ open, onClose, projectId, currentUser, profile }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    assignee_id: '',
    skill_tags: []
  });

  // Fetch team members for assignment (project owner and team members)
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId
  });

  // Fetch profiles for team members
  const { data: teamProfiles = [] } = useQuery({
    queryKey: ['teamProfiles', project?.team_member_ids],
    queryFn: async () => {
      const memberIds = [project.owner_id, ...(project.team_member_ids || [])];
      const profiles = await Promise.all(
        memberIds.map(id => base44.entities.UserProfile.filter({ user_id: id }))
      );
      return profiles.flat();
    },
    enabled: !!project
  });

  // Fetch skills for all team members
  const { data: allSkills = [] } = useQuery({
    queryKey: ['teamSkills', project?.owner_id, project?.team_member_ids],
    queryFn: async () => {
      const memberIds = [project.owner_id, ...(project.team_member_ids || [])];
      const skills = await Promise.all(
        memberIds.map(id => base44.entities.Skill.filter({ user_id: id, type: 'offer' }))
      );
      return skills.flat();
    },
    enabled: !!project
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const selectedMember = teamProfiles.find(p => p.user_id === data.assignee_id);
      return base44.entities.ProjectTask.create({
        ...data,
        project_id: projectId,
        assignee_name: selectedMember?.display_name,
        assignee_avatar: selectedMember?.avatar_url
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      onClose();
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        assignee_id: '',
        skill_tags: []
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Task Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details about this task"
              className="mt-1 min-h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <SkillTagInput
            tags={formData.skill_tags}
            onChange={(tags) => setFormData({ ...formData, skill_tags: tags })}
          />

          <div>
            <Label>Assign To</Label>
            <div className="mt-1 space-y-1.5 max-h-[200px] overflow-y-auto border rounded-md p-2">
              <button
                type="button"
                className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-slate-50 ${!formData.assignee_id ? 'bg-violet-50 ring-1 ring-violet-300' : ''}`}
                onClick={() => setFormData({ ...formData, assignee_id: '' })}
              >
                <span className="text-slate-400">Unassigned</span>
              </button>
              {teamProfiles.map((member) => {
                const memberSkills = allSkills.filter(s => s.user_id === member.user_id);
                const match = computeSkillMatch(formData.skill_tags, memberSkills);
                const matchStyle = getMatchScoreStyle(match.score);
                const isSelected = formData.assignee_id === member.user_id;

                return (
                  <button
                    type="button"
                    key={member.user_id}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-slate-50 flex items-center justify-between ${isSelected ? 'bg-violet-50 ring-1 ring-violet-300' : ''}`}
                    onClick={() => setFormData({ ...formData, assignee_id: member.user_id })}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback className="text-[8px]">{member.display_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{member.display_name}</span>
                    </div>
                    {matchStyle && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${matchStyle.color}`}>
                        <Star className="w-2.5 h-2.5" />
                        {match.score}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Recommendation Engine */}
          <TaskRecommendationPanel
            projectId={projectId}
            taskTitle={formData.title}
            taskDescription={formData.description}
            taskPriority={formData.priority}
            selectedAssignee={formData.assignee_id}
            onSelectAssignee={(id) => setFormData({ ...formData, assignee_id: id })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!formData.title || createMutation.isPending}
            >
              <Save className="w-4 h-4 mr-1" />
              {createMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}