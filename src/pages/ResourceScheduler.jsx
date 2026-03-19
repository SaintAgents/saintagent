import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { startOfWeek, addDays, format, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Filter } from 'lucide-react';
import { createPageUrl } from '@/utils';

import WeekNavigator from '@/components/scheduling/WeekNavigator';
import MemberRow from '@/components/scheduling/MemberRow';
import ScheduleTaskChip from '@/components/scheduling/ScheduleTaskChip';
import CapacitySummary from '@/components/scheduling/CapacitySummary';
import TaskDetailModal from '@/components/projects/TaskDetailModal';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_CAPACITY = 5;

export default function ResourceScheduler() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);

  const weekDates = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 300000,
  });

  // Fetch all projects the user owns or is a member of
  const { data: projects = [] } = useQuery({
    queryKey: ['allUserProjects', currentUser?.email],
    queryFn: async () => {
      const owned = await base44.entities.Project.filter({ owner_id: currentUser.email });
      const allProjects = await base44.entities.Project.list('-updated_date', 100);
      const memberOf = allProjects.filter(p =>
        p.team_member_ids?.includes(currentUser.email) && p.owner_id !== currentUser.email
      );
      return [...owned, ...memberOf];
    },
    enabled: !!currentUser?.email,
  });

  // Fetch all tasks across projects
  const projectIds = projects.map(p => p.id);
  const { data: allTasks = [] } = useQuery({
    queryKey: ['schedulerTasks', projectIds],
    queryFn: async () => {
      if (projectIds.length === 0) return [];
      const taskArrays = await Promise.all(
        projectIds.map(pid => base44.entities.ProjectTask.filter({ project_id: pid }, 'order', 200))
      );
      return taskArrays.flat();
    },
    enabled: projectIds.length > 0,
  });

  // Fetch team member profiles
  const allMemberIds = useMemo(() => {
    const ids = new Set();
    projects.forEach(p => {
      if (p.owner_id) ids.add(p.owner_id);
      (p.team_member_ids || []).forEach(id => ids.add(id));
    });
    return Array.from(ids);
  }, [projects]);

  const { data: memberProfiles = [] } = useQuery({
    queryKey: ['schedulerProfiles', allMemberIds],
    queryFn: async () => {
      if (allMemberIds.length === 0) return [];
      const results = await Promise.all(
        allMemberIds.map(id => base44.entities.UserProfile.filter({ user_id: id }))
      );
      return results.flat();
    },
    enabled: allMemberIds.length > 0,
  });

  // Reassign task mutation
  const reassignMutation = useMutation({
    mutationFn: async ({ taskId, newAssigneeId, newDueDate }) => {
      const profile = memberProfiles.find(p => p.user_id === newAssigneeId);
      const updateData = {};
      if (newAssigneeId === 'unassigned') {
        updateData.assignee_id = '';
        updateData.assignee_name = '';
        updateData.assignee_avatar = '';
      } else {
        updateData.assignee_id = newAssigneeId;
        updateData.assignee_name = profile?.display_name || newAssigneeId;
        updateData.assignee_avatar = profile?.avatar_url || '';
      }
      if (newDueDate) {
        updateData.due_date = format(newDueDate, 'yyyy-MM-dd');
      }
      return base44.entities.ProjectTask.update(taskId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedulerTasks'] });
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
    },
  });

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let tasks = allTasks.filter(t => t.status !== 'completed');
    if (selectedProject !== 'all') {
      tasks = tasks.filter(t => t.project_id === selectedProject);
    }
    return tasks.map(t => {
      const proj = projects.find(p => p.id === t.project_id);
      return { ...t, project_title: proj?.title || '' };
    });
  }, [allTasks, selectedProject, projects]);

  // Group tasks by member and day
  const getTaskDay = (task) => {
    if (!task.due_date) return null;
    const dueDate = parseISO(task.due_date);
    const dayIndex = weekDates.findIndex(d => isSameDay(d, dueDate));
    return dayIndex >= 0 ? dayIndex : null;
  };

  // Build member list with "Unassigned" row
  const members = useMemo(() => {
    const profiles = allMemberIds.map(id => {
      const profile = memberProfiles.find(p => p.user_id === id);
      return profile || { user_id: id, display_name: id, avatar_url: '' };
    });
    return profiles;
  }, [allMemberIds, memberProfiles]);

  // Build tasksByMember for capacity summary
  const tasksByMember = useMemo(() => {
    const map = { unassigned: [] };
    members.forEach(m => { map[m.user_id] = []; });
    filteredTasks.forEach(task => {
      const key = task.assignee_id || 'unassigned';
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [filteredTasks, members]);

  // Get tasks for a specific cell (member + day)
  const getCellTasks = (memberId, dayIndex) => {
    return filteredTasks.filter(task => {
      const assignee = task.assignee_id || 'unassigned';
      if (assignee !== memberId) return false;
      const taskDayIndex = getTaskDay(task);
      // Show tasks with no due date on Monday, or tasks matching the day
      if (taskDayIndex === null) return dayIndex === 0;
      return taskDayIndex === dayIndex;
    });
  };

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    // droppableId format: "cell-{memberId}-{dayIndex}"
    const parts = destination.droppableId.split('-');
    const dayIndex = parseInt(parts[parts.length - 1]);
    const newMemberId = parts.slice(1, parts.length - 1).join('-');
    const newDueDate = weekDates[dayIndex];

    reassignMutation.mutate({
      taskId: draggableId,
      newAssigneeId: newMemberId,
      newDueDate,
    });
  };

  const isToday = (date) => isSameDay(date, new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 md:p-6">
      <div className="max-w-full mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => window.location.href = createPageUrl('Projects')}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Projects
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Resource Scheduler</h1>
              <p className="text-sm text-slate-500">Drag tasks between team members to balance workloads</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px] h-9">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <WeekNavigator weekStart={weekStart} onWeekChange={setWeekStart} />
          </div>
        </div>

        {/* Capacity Summary */}
        <CapacitySummary
          members={members}
          tasksByMember={tasksByMember}
          maxCapacity={MAX_CAPACITY}
        />

        {/* Scheduling Grid */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Column Headers */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: '180px repeat(7, 1fr)' }}>
              <div className="p-3 bg-slate-50 border-r border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">Team Member</span>
              </div>
              {weekDates.map((date, i) => (
                <div
                  key={i}
                  className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${
                    isToday(date) ? 'bg-violet-50' : 'bg-slate-50'
                  }`}
                >
                  <p className={`text-xs font-semibold ${isToday(date) ? 'text-violet-600' : 'text-slate-500'}`}>
                    {WEEKDAYS[i]}
                  </p>
                  <p className={`text-sm font-bold ${isToday(date) ? 'text-violet-700' : 'text-slate-700'}`}>
                    {format(date, 'd')}
                  </p>
                </div>
              ))}
            </div>

            {/* Unassigned Row */}
            <div className="grid border-b border-slate-200 bg-amber-50/30" style={{ gridTemplateColumns: '180px repeat(7, 1fr)' }}>
              <div className="border-r border-slate-200 flex items-start">
                <MemberRow
                  member={{ display_name: 'Unassigned', avatar_url: '' }}
                  taskCount={tasksByMember['unassigned']?.length || 0}
                  maxCapacity={999}
                />
              </div>
              {weekDates.map((_, dayIndex) => {
                const cellId = `cell-unassigned-${dayIndex}`;
                const cellTasks = getCellTasks('unassigned', dayIndex);
                return (
                  <Droppable key={cellId} droppableId={cellId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-1.5 border-r border-slate-200 last:border-r-0 min-h-[80px] transition-colors ${
                          snapshot.isDraggingOver ? 'bg-violet-100/50' : ''
                        }`}
                      >
                        <div className="space-y-1.5">
                          {cellTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <ScheduleTaskChip
                                    task={task}
                                    isDragging={snapshot.isDragging}
                                    onClick={setSelectedTask}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>

            {/* Member Rows */}
            <ScrollArea className="max-h-[600px]">
              {members.map((member) => {
                const memberTaskCount = tasksByMember[member.user_id]?.length || 0;
                const isOverloaded = memberTaskCount > MAX_CAPACITY;
                return (
                  <div
                    key={member.user_id}
                    className={`grid border-b border-slate-100 last:border-b-0 ${
                      isOverloaded ? 'bg-red-50/30' : ''
                    }`}
                    style={{ gridTemplateColumns: '180px repeat(7, 1fr)' }}
                  >
                    <div className="border-r border-slate-200 flex items-start">
                      <MemberRow
                        member={member}
                        taskCount={memberTaskCount}
                        maxCapacity={MAX_CAPACITY}
                      />
                    </div>
                    {weekDates.map((date, dayIndex) => {
                      const cellId = `cell-${member.user_id}-${dayIndex}`;
                      const cellTasks = getCellTasks(member.user_id, dayIndex);
                      return (
                        <Droppable key={cellId} droppableId={cellId}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`p-1.5 border-r border-slate-200 last:border-r-0 min-h-[80px] transition-colors ${
                                snapshot.isDraggingOver ? 'bg-violet-100/50' : ''
                              } ${isToday(date) ? 'bg-violet-50/20' : ''}`}
                            >
                              <div className="space-y-1.5">
                                {cellTasks.map((task, index) => (
                                  <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <ScheduleTaskChip
                                          task={task}
                                          isDragging={snapshot.isDragging}
                                          onClick={setSelectedTask}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              </div>
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </div>
                );
              })}
            </ScrollArea>
          </div>
        </DragDropContext>

        {members.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg">No projects or team members found</p>
            <p className="text-sm mt-1">Create a project and add team members to start scheduling</p>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          currentUser={currentUser}
          allTasks={allTasks}
        />
      )}
    </div>
  );
}