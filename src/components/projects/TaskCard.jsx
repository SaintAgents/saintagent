import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Paperclip, 
  MessageSquare,
  Calendar,
  MoreHorizontal,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: 'bg-slate-500', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-500', icon: Clock },
  review: { label: 'Review', color: 'bg-amber-500', icon: AlertCircle },
  completed: { label: 'Completed', color: 'bg-emerald-500', icon: CheckCircle2 },
  blocked: { label: 'Blocked', color: 'bg-red-500', icon: AlertCircle }
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-600' },
  high: { label: 'High', color: 'bg-amber-100 text-amber-600' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-600' }
};

export default function TaskCard({ 
  task, 
  onStatusChange, 
  onClick,
  commentCount = 0,
  attachmentCount = 0,
  showProject = false,
  projectTitle
}) {
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const StatusIcon = status.icon;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onClick?.(task)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`${priority.color} text-[10px]`}>
            {priority.label}
          </Badge>
          {isOverdue && (
            <Badge className="bg-red-100 text-red-600 text-[10px]">
              Overdue
            </Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange?.(task.id, 'todo'); }}>
              Mark as To Do
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange?.(task.id, 'in_progress'); }}>
              Mark as In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange?.(task.id, 'review'); }}>
              Mark as Review
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange?.(task.id, 'completed'); }}>
              Mark as Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {showProject && projectTitle && (
        <p className="text-xs text-violet-600 dark:text-violet-400 mb-2">
          📁 {projectTitle}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
        {/* Status & Due Date */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${status.color}`} />
            <span className="text-slate-500">{status.label}</span>
          </div>
          {task.due_date && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
              <Calendar className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>

        {/* Counts & Assignee */}
        <div className="flex items-center gap-2">
          {commentCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <MessageSquare className="w-3 h-3" />
              {commentCount}
            </div>
          )}
          {attachmentCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Paperclip className="w-3 h-3" />
              {attachmentCount}
            </div>
          )}
          {task.assignee_avatar || task.assignee_name ? (
            <Avatar className="w-6 h-6">
              <AvatarImage src={task.assignee_avatar} />
              <AvatarFallback className="text-[10px] bg-violet-100 text-violet-600">
                {task.assignee_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="w-3 h-3 text-slate-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}