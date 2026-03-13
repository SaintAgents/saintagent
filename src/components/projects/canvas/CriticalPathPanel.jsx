import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, Clock } from 'lucide-react';

export default function CriticalPathPanel({ tasks, criticalTaskIds, taskSchedule, projectEnd }) {
  const criticalTasks = tasks
    .filter(t => criticalTaskIds.has(t.id))
    .sort((a, b) => {
      const sa = taskSchedule.get(a.id)?.ES || 0;
      const sb = taskSchedule.get(b.id)?.ES || 0;
      return sa - sb;
    });

  if (criticalTasks.length === 0) return null;

  return (
    <div className="absolute bottom-3 right-3 z-20 w-72 bg-white/95 backdrop-blur-sm rounded-xl border border-red-200 shadow-lg overflow-hidden">
      <div className="px-3 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <span className="text-xs font-semibold text-red-700">Critical Path</span>
        <Badge className="ml-auto bg-red-100 text-red-700 border-red-200 text-[10px]">
          {projectEnd} days
        </Badge>
      </div>
      <div className="max-h-48 overflow-y-auto p-2 space-y-1">
        {criticalTasks.map((task, i) => {
          const sched = taskSchedule.get(task.id);
          return (
            <div key={task.id} className="flex items-center gap-2 group">
              {i > 0 && <ArrowRight className="w-3 h-3 text-red-300 shrink-0" />}
              <div className="flex-1 min-w-0 px-2 py-1.5 rounded-md bg-red-50/50 group-hover:bg-red-50">
                <div className="text-[11px] font-medium text-slate-700 truncate">{task.title}</div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Day {sched?.ES}→{sched?.EF}</span>
                  <span>·</span>
                  <span>{sched?.duration}d</span>
                  {sched?.slack === 0 && (
                    <Badge className="bg-red-100 text-red-600 text-[8px] px-1 py-0 h-3.5">0 slack</Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}