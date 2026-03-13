import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, ArrowRight, Shuffle } from 'lucide-react';
import { format } from 'date-fns';

const priorityColors = {
  urgent: 'border-l-red-500 bg-red-50/50',
  high: 'border-l-amber-500 bg-amber-50/30',
  medium: 'border-l-blue-500 bg-blue-50/20',
  low: 'border-l-slate-400 bg-slate-50/30',
};

const priorityBadge = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-amber-100 text-amber-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-100 text-slate-600',
};

export default function SprintWeekColumn({ week }) {
  const start = new Date(week.startDate);
  const end = new Date(week.endDate);

  return (
    <div className="border rounded-xl bg-white overflow-hidden flex-1 min-w-[280px]">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{week.label}</div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(start, 'MMM d')} – {format(end, 'MMM d')}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-violet-600">{week.totalHours}h</div>
          <div className="text-[9px] text-slate-400">{week.taskCount} tasks</div>
        </div>
      </div>

      {/* Assignments */}
      <div className="p-2 space-y-1.5 max-h-[400px] overflow-y-auto">
        {week.assignments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">No tasks scheduled</div>
        ) : (
          week.assignments.map((a, i) => (
            <div key={i} className={`border-l-[3px] rounded-r-lg p-2.5 ${priorityColors[a.taskPriority] || priorityColors.medium}`}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{a.taskTitle}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-[8px] px-1 py-0 ${priorityBadge[a.taskPriority] || priorityBadge.medium}`}>
                      {a.taskPriority}
                    </Badge>
                    <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />{a.hours}h
                    </span>
                    {a.isReassignment && (
                      <span className="text-[9px] text-violet-500 flex items-center gap-0.5">
                        <Shuffle className="w-2.5 h-2.5" />suggested
                      </span>
                    )}
                  </div>
                </div>
                <Avatar className="w-6 h-6 shrink-0">
                  <AvatarImage src={a.memberAvatar} />
                  <AvatarFallback className="text-[8px]">{a.memberName?.[0]}</AvatarFallback>
                </Avatar>
              </div>
              {a.reason && (
                <div className="text-[9px] text-slate-400 mt-1 flex items-start gap-1">
                  <ArrowRight className="w-2.5 h-2.5 mt-0.5 shrink-0" />
                  {a.reason}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}