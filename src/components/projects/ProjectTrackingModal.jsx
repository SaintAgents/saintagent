import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  X, Plus, Calendar, Users, Target, CheckCircle2, Clock, 
  MessageSquare, Paperclip, Activity, ChevronRight, Edit2,
  Trash2, Play, Pause, AlertCircle, FileText, Upload, UserPlus, Search,
  Link2, Lock, GitBranch, BarChart3, Timer
} from 'lucide-react';
import { format } from 'date-fns';
import TaskDependencyManager, { isTaskBlocked, getBlockingTasks } from './TaskDependencyManager';
import TaskDependencyGraph from './TaskDependencyGraph';
import TaskTimeTracker, { TimeTrackingSummary } from './TaskTimeTracker';
import ProjectReportGenerator from './ProjectReportGenerator';
import { useTaskNotifications } from './TaskNotificationService';

const STATUS_CONFIG = {
  planned: { label: 'Planned', color: 'bg-slate-500 text-white' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500 text-white' },
  completed: { label: 'Completed', color: 'bg-green-500 text-white' },
  on_hold: { label: 'On Hold', color: 'bg-amber-500 text-white' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500 text-white' }
};

const TASK_STATUS_CONFIG = {
  todo: { label: 'To Do', color: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  review: { label: 'Review', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
  completed: { label: 'Done', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' }
};

export default function ProjectTrackingModal({ project, onClose, currentUser, profile }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showAddTask, setShowAddTask] = useState(null);
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [newMilestone, setNewMilestone] = useState({ name: '', start_date: '', end_date: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '' });
  const [newComment, setNewComment] = useState('');
  const [editingDepsTask, setEditingDepsTask] = useState(null);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const queryClient = useQueryClient();
  const { notifyTaskAssigned, notifyTaskCompleted, notifyDependencyMet } = useTaskNotifications();

  const { data: milestones = [] } = useQuery({
    queryKey: ['projectMilestones', project.id],
    queryFn: () => base44.entities.ProjectMilestone.filter({ project_id: project.id }, 'order', 100)
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['projectTasks', project.id],
    queryFn: () => base44.entities.ProjectTask.filter({ project_id: project.id }, 'order', 500)
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['projectComments', project.id],
    queryFn: () => base44.entities.ProjectComment.filter({ project_id: project.id }, '-created_date', 100)
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['projectActivities', project.id],
    queryFn: () => base44.entities.ProjectActivity.filter({ project_id: project.id }, '-created_date', 50)
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ['projectAttachments', project.id],
    queryFn: () => base44.entities.ProjectAttachment.filter({ project_id: project.id }, '-created_date', 50)
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ['projectTimeEntries', project.id],
    queryFn: () => base44.entities.TaskTimeEntry.filter({ project_id: project.id }, '-created_date', 1000)
  });

  // Fetch all profiles for team member search
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200)
  });

  // Get current team members' profiles
  const teamMemberIds = project.team_member_ids || [];
  const teamMembers = allProfiles.filter(p => teamMemberIds.includes(p.user_id));
  
  // Filter profiles for search
  const filteredProfiles = allProfiles.filter(p => {
    if (teamMemberIds.includes(p.user_id)) return false;
    if (!teamSearchQuery) return true;
    const query = teamSearchQuery.toLowerCase();
    return (p.display_name?.toLowerCase().includes(query) || 
            p.handle?.toLowerCase().includes(query) ||
            p.user_id?.toLowerCase().includes(query));
  }).slice(0, 10);

  const createMilestoneMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectMilestone.create({
      ...data,
      project_id: project.id,
      order: milestones.length
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', project.id] });
      setShowAddMilestone(false);
      setNewMilestone({ name: '', start_date: '', end_date: '' });
      logActivity('milestone_created', `Created milestone: ${newMilestone.name}`);
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectTask.create({
      ...data,
      project_id: project.id,
      milestone_id: showAddTask,
      order: tasks.filter(t => t.milestone_id === showAddTask).length
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', project.id] });
      setShowAddTask(null);
      setNewTask({ title: '', description: '', due_date: '' });
      logActivity('task_created', `Created task: ${newTask.title}`);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProjectTask.update(id, data),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', project.id] });
      if (variables.data.status) {
        logActivity('task_updated', `Task status changed to ${variables.data.status}`);
        
        // Check for dependency notifications when a task is completed
        if (variables.data.status === 'completed') {
          const completedTask = tasks.find(t => t.id === variables.id);
          if (completedTask) {
            // Notify project owner
            notifyTaskCompleted({
              task: completedTask,
              project,
              sourceUser: { email: currentUser?.email, name: profile?.display_name }
            });
            
            // Check if this completion unblocks other tasks
            const dependentTasks = tasks.filter(t => t.depends_on?.includes(variables.id));
            for (const depTask of dependentTasks) {
              notifyDependencyMet({
                task: depTask,
                allTasks: tasks.map(t => t.id === variables.id ? { ...t, status: 'completed' } : t),
                sourceUser: { email: currentUser?.email, name: profile?.display_name }
              });
            }
          }
        }
      }
      
      // Handle task assignment notification
      if (variables.data.assignee_id) {
        const updatedTask = tasks.find(t => t.id === variables.id);
        const assigneeProfile = allProfiles.find(p => p.user_id === variables.data.assignee_id);
        if (updatedTask && assigneeProfile && variables.data.assignee_id !== currentUser?.email) {
          notifyTaskAssigned({
            task: updatedTask,
            project,
            assignee: assigneeProfile,
            sourceUser: { email: currentUser?.email, name: profile?.display_name, avatar: profile?.avatar_url }
          });
        }
      }
    }
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProjectMilestone.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', project.id] });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.update(project.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fundedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['projects_all'] });
    }
  });

  const addTeamMember = async (userProfile) => {
    const newTeamIds = [...teamMemberIds, userProfile.user_id];
    await base44.entities.Project.update(project.id, { team_member_ids: newTeamIds });
    queryClient.invalidateQueries({ queryKey: ['fundedProjects'] });
    logActivity('team_member_added', `Added ${userProfile.display_name} to team`);
    setShowAddTeamMember(false);
    setTeamSearchQuery('');
  };

  const removeTeamMember = async (userId) => {
    const newTeamIds = teamMemberIds.filter(id => id !== userId);
    await base44.entities.Project.update(project.id, { team_member_ids: newTeamIds });
    queryClient.invalidateQueries({ queryKey: ['fundedProjects'] });
    logActivity('team_member_removed', `Removed a team member`);
  };

  const createCommentMutation = useMutation({
    mutationFn: (content) => base44.entities.ProjectComment.create({
      project_id: project.id,
      content,
      author_id: currentUser?.email,
      author_name: profile?.display_name || currentUser?.full_name,
      author_avatar: profile?.avatar_url
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectComments', project.id] });
      setNewComment('');
      logActivity('comment_added', 'Added a comment');
    }
  });

  const logActivity = async (type, description) => {
    await base44.entities.ProjectActivity.create({
      project_id: project.id,
      activity_type: type,
      description,
      actor_id: currentUser?.email,
      actor_name: profile?.display_name || currentUser?.full_name
    });
    queryClient.invalidateQueries({ queryKey: ['projectActivities', project.id] });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.ProjectAttachment.create({
      project_id: project.id,
      filename: file.name,
      file_url,
      file_type: file.type,
      file_size: file.size,
      uploader_id: currentUser?.email,
      uploader_name: profile?.display_name || currentUser?.full_name
    });
    queryClient.invalidateQueries({ queryKey: ['projectAttachments', project.id] });
    logActivity('attachment_added', `Uploaded: ${file.name}`);
  };

  // Calculate milestone progress
  const getMilestoneProgress = (milestoneId) => {
    const milestoneTasks = tasks.filter(t => t.milestone_id === milestoneId);
    if (milestoneTasks.length === 0) return 0;
    const completed = milestoneTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / milestoneTasks.length) * 100);
  };

  // Calculate overall progress
  const overallProgress = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
    : 0;

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(0)}M`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{project.title}</DialogTitle>
              <p className="text-sm text-slate-500 mt-1">{project.organization_name || project.company_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={STATUS_CONFIG[project.project_status]?.color || STATUS_CONFIG.planned.color}>
                {STATUS_CONFIG[project.project_status]?.label || 'Planned'}
              </Badge>
              <span className="text-lg font-bold">{formatCurrency(project.budget)}</span>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="mx-4 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] px-4 pb-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{overallProgress}%</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Progress</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{milestones.length}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Milestones</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{tasks.length}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Tasks</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{tasks.filter(t => t.status === 'completed').length}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Completed</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {project.description || 'No description provided.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 text-slate-900 dark:text-white">Project Status</h4>
                  <Select 
                    value={project.project_status || 'planned'} 
                    onValueChange={(val) => updateProjectMutation.mutate({ project_status: val })}
                  >
                    <SelectTrigger className="text-slate-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Simple Gantt View */}
              {milestones.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Timeline</h4>
                    <div className="space-y-2">
                      {milestones.map((m, idx) => {
                        const progress = getMilestoneProgress(m.id);
                        return (
                          <div key={m.id} className="flex items-center gap-3">
                            <div className="w-32 text-xs text-slate-600 truncate">{m.name}</div>
                            <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
                              <div 
                                className="h-full bg-violet-500 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">
                                {progress}%
                              </span>
                            </div>
                            <div className="w-20 text-[10px] text-slate-500">
                              {m.end_date ? format(new Date(m.end_date), 'MMM d') : '-'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Team Members ({teamMembers.length})</h4>
                <Button size="sm" onClick={() => setShowAddTeamMember(true)} className="gap-1 bg-violet-600 hover:bg-violet-700 text-white">
                  <UserPlus className="w-4 h-4" /> Add Member
                </Button>
              </div>

              {showAddTeamMember && (
                <Card className="border-violet-200 dark:border-violet-800">
                  <CardContent className="p-4 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input 
                        placeholder="Search by name or handle..." 
                        value={teamSearchQuery}
                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {filteredProfiles.map((p) => (
                        <div 
                          key={p.id}
                          className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                          onClick={() => addTeamMember(p)}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={p.avatar_url} />
                            <AvatarFallback>{p.display_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{p.display_name}</div>
                            <div className="text-xs text-slate-500">@{p.handle}</div>
                          </div>
                        </div>
                      ))}
                      {filteredProfiles.length === 0 && (
                        <div className="text-sm text-slate-500 py-2 text-center">No users found</div>
                      )}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setShowAddTeamMember(false)}>
                      Cancel
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>{member.display_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.display_name}</div>
                          <div className="text-xs text-slate-500">@{member.handle}</div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeTeamMember(member.user_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {teamMembers.length === 0 && !showAddTeamMember && (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No team members yet</p>
                </div>
              )}
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="mt-4 space-y-3">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setShowAddMilestone(true)} className="gap-1 bg-violet-600 hover:bg-violet-700 text-white">
                  <Plus className="w-4 h-4" /> Add Milestone
                </Button>
              </div>

              {showAddMilestone && (
                <Card className="border-violet-200 dark:border-violet-800">
                  <CardContent className="p-4 space-y-3">
                    <Input 
                      placeholder="Milestone name" 
                      value={newMilestone.name}
                      onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        type="date" 
                        value={newMilestone.start_date}
                        onChange={(e) => setNewMilestone({ ...newMilestone, start_date: e.target.value })}
                      />
                      <Input 
                        type="date" 
                        value={newMilestone.end_date}
                        onChange={(e) => setNewMilestone({ ...newMilestone, end_date: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => createMilestoneMutation.mutate(newMilestone)}>
                        Create
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddMilestone(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {milestones.map((milestone) => {
                const milestoneTasks = tasks.filter(t => t.milestone_id === milestone.id);
                const progress = getMilestoneProgress(milestone.id);
                
                return (
                  <Card key={milestone.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{milestone.name}</h4>
                        <Badge className={STATUS_CONFIG[milestone.status]?.color || 'bg-slate-500'}>
                          {STATUS_CONFIG[milestone.status]?.label || 'Planned'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                        <Calendar className="w-3 h-3" />
                        {milestone.start_date && format(new Date(milestone.start_date), 'MMM d')}
                        {milestone.end_date && ` - ${format(new Date(milestone.end_date), 'MMM d')}`}
                      </div>
                      
                      <Progress value={progress} className="h-1.5 mb-3" />
                      
                      <div className="text-xs text-slate-500">
                        {milestoneTasks.filter(t => t.status === 'completed').length} / {milestoneTasks.length} tasks completed
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2 text-xs border-slate-300 dark:border-slate-600"
                        onClick={() => setShowAddTask(milestone.id)}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Task
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}

              {milestones.length === 0 && !showAddMilestone && (
                <div className="text-center py-8 text-slate-500">
                  <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No milestones yet</p>
                </div>
              )}
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="mt-4 space-y-4">
              {/* Dependency Graph */}
              {tasks.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <GitBranch className="w-4 h-4 text-violet-500" />
                      <h4 className="font-medium text-sm text-slate-900 dark:text-white">Dependencies</h4>
                    </div>
                    <TaskDependencyGraph tasks={tasks} />
                  </CardContent>
                </Card>
              )}

              {showAddTask && (
                <Card className="border-violet-200 dark:border-violet-800 mb-3">
                  <CardContent className="p-4 space-y-3">
                    <Input 
                      placeholder="Task title" 
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                    <Textarea 
                      placeholder="Description (optional)" 
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="h-20"
                    />
                    <Input 
                      type="date" 
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => createTaskMutation.mutate(newTask)}>
                        Create Task
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddTask(null)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {tasks.map((task) => {
                const blocked = isTaskBlocked(task, tasks);
                const blockingTasks = getBlockingTasks(task, tasks);
                const hasDeps = task.depends_on && task.depends_on.length > 0;
                
                return (
                  <Card key={task.id} className={`hover:border-slate-300 transition-colors ${blocked ? 'border-amber-300 dark:border-amber-700' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Select 
                          value={task.status} 
                          onValueChange={(val) => {
                            if (val !== 'todo' && blocked) {
                              // Can't start a blocked task
                              return;
                            }
                            updateTaskMutation.mutate({ id: task.id, data: { status: val } });
                          }}
                          disabled={blocked && task.status === 'todo'}
                        >
                          <SelectTrigger className={`w-28 h-7 text-xs ${blocked && task.status === 'todo' ? 'opacity-50' : ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => (
                              <SelectItem key={key} value={key}>{config.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {blocked && <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                            <span className={`font-medium text-sm truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                              {task.title}
                            </span>
                          </div>
                          {blocked && blockingTasks.length > 0 && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                              Waiting on: {blockingTasks.map(t => t.title).join(', ')}
                            </div>
                          )}
                          {task.description && !blocked && (
                            <div className="text-xs text-slate-500 line-clamp-1">{task.description}</div>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-7 w-7 p-0 ${hasDeps ? 'text-violet-500' : 'text-slate-400'}`}
                          onClick={() => setEditingDepsTask(task)}
                          title="Manage dependencies"
                        >
                          <Link2 className="w-4 h-4" />
                        </Button>
                        
                        {task.due_date && (
                          <span className="text-xs text-slate-500">
                            {format(new Date(task.due_date), 'MMM d')}
                          </span>
                        )}
                        
                        {task.assignee_name && (
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={task.assignee_avatar} />
                            <AvatarFallback className="text-[8px]">{task.assignee_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {tasks.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No tasks yet. Add milestones first, then tasks.</p>
                </div>
              )}
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="mt-4 space-y-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a comment..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && newComment.trim() && createCommentMutation.mutate(newComment)}
                />
                <Button 
                  onClick={() => newComment.trim() && createCommentMutation.mutate(newComment)}
                  disabled={!newComment.trim()}
                >
                  Post
                </Button>
              </div>

              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author_avatar} />
                        <AvatarFallback>{comment.author_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.author_name}</span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                </div>
              )}
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="mt-4 space-y-3">
              <label className="block">
                <Button variant="outline" className="gap-2 cursor-pointer" asChild>
                  <span>
                    <Upload className="w-4 h-4" /> Upload File
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </span>
                </Button>
              </label>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {attachments.map((att) => (
                  <Card key={att.id} className="hover:border-slate-300 transition-colors">
                    <CardContent className="p-3">
                      <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="block">
                        <FileText className="w-8 h-8 text-slate-400 mb-2" />
                        <div className="text-sm font-medium truncate">{att.filename}</div>
                        <div className="text-xs text-slate-500">
                          {att.uploader_name} · {format(new Date(att.created_date), 'MMM d')}
                        </div>
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {attachments.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Paperclip className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No files uploaded yet</p>
                </div>
              )}
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-4">
              <div className="space-y-2">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <Activity className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium">{act.actor_name}</span>
                        {' '}{act.description}
                      </div>
                      <div className="text-xs text-slate-500">
                        {format(new Date(act.created_date), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}

                {activities.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No activity yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Dependency Manager Modal */}
        {editingDepsTask && (
          <TaskDependencyManager
            task={editingDepsTask}
            allTasks={tasks}
            onSave={(deps) => {
              updateTaskMutation.mutate({ 
                id: editingDepsTask.id, 
                data: { depends_on: deps } 
              });
              logActivity('task_updated', `Updated dependencies for: ${editingDepsTask.title}`);
            }}
            onClose={() => setEditingDepsTask(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}