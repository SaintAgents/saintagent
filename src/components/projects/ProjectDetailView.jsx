import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Plus, Calendar, DollarSign, Users, 
  CheckCircle2, Clock, Paperclip, MessageSquare,
  LayoutGrid, List, Upload, Search, Filter, Brain
} from 'lucide-react';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from './TaskDetailModal';
import AddTeamMemberModal from '@/components/deals/AddTeamMemberModal';
import AIProjectAssistant from './AIProjectAssistant';

const STATUS_COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-500' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { id: 'review', label: 'Review', color: 'bg-amber-500' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-500' }
];

export default function ProjectDetailView({ project, onBack, currentUser, profile }) {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('board'); // board or list
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Fetch tasks for this project
  const { data: tasks = [] } = useQuery({
    queryKey: ['projectTasks', project?.id],
    queryFn: () => base44.entities.ProjectTask.filter({ project_id: project.id }, 'order', 100),
    enabled: !!project?.id
  });

  // Fetch comments count per task
  const { data: comments = [] } = useQuery({
    queryKey: ['projectComments', project?.id],
    queryFn: () => base44.entities.ProjectComment.filter({ project_id: project.id }),
    enabled: !!project?.id
  });

  // Fetch attachments count per task
  const { data: attachments = [] } = useQuery({
    queryKey: ['projectAttachments', project?.id],
    queryFn: () => base44.entities.ProjectAttachment.filter({ project_id: project.id }),
    enabled: !!project?.id
  });

  // Fetch team member profiles
  const { data: teamProfiles = [] } = useQuery({
    queryKey: ['teamProfiles', project?.team_member_ids],
    queryFn: async () => {
      const memberIds = project.team_member_ids || [];
      if (memberIds.length === 0) return [];
      const profiles = await Promise.all(
        memberIds.map(id => base44.entities.UserProfile.filter({ user_id: id }))
      );
      return profiles.flat();
    },
    enabled: !!project?.team_member_ids?.length
  });

  // Update task status
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status }) => base44.entities.ProjectTask.update(taskId, { 
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
    }
  });

  // Add team member
  const addMemberMutation = useMutation({
    mutationFn: (memberId) => base44.entities.Project.update(project.id, {
      team_member_ids: [...(project.team_member_ids || []), memberId]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fundedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['userProjects'] });
      setAddMemberOpen(false);
    }
  });

  // Group tasks by status
  const tasksByStatus = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => {
      const matchesStatus = t.status === col.id;
      const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
      return matchesStatus && matchesSearch && matchesPriority;
    });
    return acc;
  }, {});

  // Get counts
  const getCommentCount = (taskId) => comments.filter(c => c.task_id === taskId).length;
  const getAttachmentCount = (taskId) => attachments.filter(a => a.task_id === taskId).length;

  // Calculate progress
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{project.title}</h2>
            <p className="text-sm text-slate-500">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={showAIAssistant ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={showAIAssistant ? "bg-violet-600 hover:bg-violet-700" : ""}
          >
            <Brain className="w-4 h-4 mr-1" />
            AI Assistant
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAddMemberOpen(true)}>
            <Users className="w-4 h-4 mr-1" />
            Add Member
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setCreateTaskOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs">Progress</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{progress}%</div>
          <Progress value={progress} className="h-1 mt-2" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Tasks</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {completedTasks}/{tasks.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Budget</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(project.budget)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Due Date</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not set'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">Team</span>
          </div>
          <div className="flex items-center -space-x-2 mt-1">
            <Avatar className="w-8 h-8 border-2 border-white">
              <AvatarImage src={project.owner_avatar} />
              <AvatarFallback className="text-xs">{project.owner_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            {teamProfiles.slice(0, 3).map((member) => (
              <Avatar key={member.user_id} className="w-8 h-8 border-2 border-white">
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback className="text-xs">{member.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {teamProfiles.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs text-slate-600">
                +{teamProfiles.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-9 px-3 rounded-md border border-slate-200 text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <Button 
            variant={viewMode === 'board' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('board')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-4 gap-4">
          {STATUS_COLUMNS.map((column) => (
            <div key={column.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 min-h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{column.label}</span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {tasksByStatus[column.id]?.length || 0}
                  </Badge>
                </div>
              </div>
              <ScrollArea className="h-[350px]">
                <div className="space-y-3 pr-2">
                  {tasksByStatus[column.id]?.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={setSelectedTask}
                      onStatusChange={(taskId, status) => updateTaskMutation.mutate({ taskId, status })}
                      commentCount={getCommentCount(task.id)}
                      attachmentCount={getAttachmentCount(task.id)}
                    />
                  ))}
                  {tasksByStatus[column.id]?.length === 0 && (
                    <p className="text-center text-slate-400 text-sm py-8">No tasks</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-slate-700 text-xs font-medium text-slate-500 uppercase">
            <div className="col-span-5">Task</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2">Due Date</div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {tasks.filter(t => {
              const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
              return matchesSearch && matchesPriority;
            }).map((task) => (
              <div 
                key={task.id} 
                className="grid grid-cols-12 gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div className="col-span-5 flex items-center gap-3">
                  <CheckCircle2 className={`w-5 h-5 ${task.status === 'completed' ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span className="font-medium text-slate-900 dark:text-white">{task.title}</span>
                  <div className="flex items-center gap-2 text-slate-400">
                    {getCommentCount(task.id) > 0 && (
                      <span className="flex items-center gap-1 text-xs">
                        <MessageSquare className="w-3 h-3" /> {getCommentCount(task.id)}
                      </span>
                    )}
                    {getAttachmentCount(task.id) > 0 && (
                      <span className="flex items-center gap-1 text-xs">
                        <Paperclip className="w-3 h-3" /> {getAttachmentCount(task.id)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-2 flex items-center">
                  {task.assignee_name ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={task.assignee_avatar} />
                        <AvatarFallback className="text-xs">{task.assignee_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-600">{task.assignee_name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Unassigned</span>
                  )}
                </div>
                <div className="col-span-2 flex items-center">
                  <Badge className={
                    task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                    task.status === 'review' ? 'bg-amber-100 text-amber-600' :
                    'bg-slate-100 text-slate-600'
                  }>
                    {task.status?.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="col-span-1 flex items-center">
                  <Badge className={
                    task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                    task.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                    task.priority === 'medium' ? 'bg-blue-100 text-blue-600' :
                    'bg-slate-100 text-slate-600'
                  }>
                    {task.priority}
                  </Badge>
                </div>
                <div className="col-span-2 flex items-center text-sm text-slate-500">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        projectId={project.id}
        currentUser={currentUser}
        profile={profile}
      />

      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        currentUser={currentUser}
        profile={profile}
      />

      <AddTeamMemberModal
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        onAdd={(member) => addMemberMutation.mutate(member.user_id)}
        existingMembers={project.team_member_ids || []}
      />
    </div>
  );
}