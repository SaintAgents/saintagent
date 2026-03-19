import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { format, isPast } from 'date-fns';

const PRIORITY_COLORS = {
  urgent: 'border-l-red-500 bg-red-50',
  high: 'border-l-amber-500 bg-amber-50',
  medium: 'border-l-blue-500 bg-blue-50',
  low: 'border-l-slate-400 bg-slate-50',
};

const STATUS_DOT = {
  todo: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  review: 'bg-amber-500',
  completed: 'bg-emerald-500',
  blocked: 'bg-red-500',
};

export default function ScheduleTaskChip({ task, isDragging, onClick }) {
  const priorityStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'completed';

  return (
    <div
      onClick={() => onClick?.(task)}
      className={`rounded-lg border border-l-4 p-2 cursor-pointer transition-all text-left w-full ${priorityStyle} ${
        isDragging ? 'shadow-lg ring-2 ring-violet-400 opacity-90' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-tight flex-1">
          {task.title}
        </p>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${STATUS_DOT[task.status] || STATUS_DOT.todo}`} />
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        {task.estimated_hours && (
          <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
            <Clock className="w-2.5 h-2.5" />
            {task.estimated_hours}h
          </span>
        )}
        {task.project_title && (
          <span className="text-[10px] text-violet-600 truncate max-w-[80px]">
            {task.project_title}
          </span>
        )}
        {isOverdue && (
          <AlertTriangle className="w-2.5 h-2.5 text-red-500 ml-auto flex-shrink-0" />
        )}
      </div>
    </div>
  );
}