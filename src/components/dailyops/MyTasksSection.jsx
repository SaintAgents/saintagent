import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_ICONS = {
  todo: Circle,
  in_progress: Clock,
  review: ArrowRight,
  completed: CheckCircle2,
  blocked: AlertTriangle,
};

const STATUS_COLORS = {
  todo: 'text-slate-400',
  in_progress: 'text-blue-500',
  review: 'text-amber-500',
  completed: 'text-emerald-500',
  blocked: 'text-red-500',
};

const PRIORITY_COLORS = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-amber-100 text-amber-700 border-amber-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function MyTasksSection({ userEmail }) {
  const queryClient = useQueryClient();

  const { data: myTasks = [], isLoading } = useQuery({
    queryKey: ['myProjectTasks', userEmail],
    queryFn: () => base44.entities.ProjectTask.filter({ assignee_id: userEmail }, '-updated_date', 50),
    enabled: !!userEmail,
    staleTime: 60000,
  });

  const updateTask = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ProjectTask.update(id, {
      status,
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myProjectTasks', userEmail] }),
  });

  const activeTasks = myTasks.filter(t => t.status !== 'completed');
  const overdueTasks = activeTasks.filter(t => t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)));
  const todayTasks = activeTasks.filter(t => t.due_date && isToday(parseISO(t.due_date)));
  const upcomingTasks = activeTasks.filter(t => !t.due_date || (!isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))));

  const sortedTasks = [...overdueTasks, ...todayTasks, ...upcomingTasks];

  const cycleStatus = (task) => {
    const order = ['todo', 'in_progress', 'review', 'completed'];
    const idx = order.indexOf(task.status);
    const next = order[(idx + 1) % order.length];
    updateTask.mutate({ id: task.id, status: next });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-violet-700">My Tasks</CardTitle></CardHeader>
        <CardContent><div className="animate-pulse h-20 bg-slate-100 rounded-lg" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-violet-700">
          <CheckCircle2 className="w-5 h-5" />
          My Tasks
          {activeTasks.length > 0 && (
            <Badge variant="outline" className="ml-2 text-xs">{activeTasks.length} active</Badge>
          )}
        </CardTitle>
        {overdueTasks.length > 0 && (
          <Badge className="bg-red-100 text-red-700 border border-red-200">
            {overdueTasks.length} overdue
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {sortedTasks.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-6">
            No active tasks assigned to you. Tasks from projects will appear here.
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.slice(0, 10).map((task) => {
              const Icon = STATUS_ICONS[task.status] || Circle;
              const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date));
              const isDueToday = task.due_date && isToday(parseISO(task.due_date));

              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border bg-white transition-colors",
                    isOverdue && "border-red-200 bg-red-50/50"
                  )}
                >
                  <button
                    onClick={() => cycleStatus(task)}
                    className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
                    title={`Status: ${task.status} — click to advance`}
                  >
                    <Icon className={cn("w-5 h-5", STATUS_COLORS[task.status])} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium text-slate-900",
                      task.status === 'completed' && "line-through text-slate-400"
                    )}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", PRIORITY_COLORS[task.priority])}>
                        {task.priority}
                      </Badge>
                      {task.due_date && (
                        <span className={cn(
                          "text-[10px]",
                          isOverdue ? "text-red-600 font-semibold" : isDueToday ? "text-amber-600 font-medium" : "text-slate-500"
                        )}>
                          {isOverdue ? 'Overdue: ' : isDueToday ? 'Due today' : ''}{!isDueToday && format(parseISO(task.due_date), 'MMM d')}
                        </span>
                      )}
                      {task.status === 'blocked' && (
                        <span className="text-[10px] text-red-600 font-medium">Blocked</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {sortedTasks.length > 10 && (
              <p className="text-xs text-slate-400 text-center pt-1">+{sortedTasks.length - 10} more tasks</p>
            )}
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex-1"
            onClick={() => window.location.href = '/Projects'}
          >
            View All Projects
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}