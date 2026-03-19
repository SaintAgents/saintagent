import React from 'react';
import { CheckCircle2, ArrowRight, ListTodo, FileText } from 'lucide-react';

export default function StageTransitionToast({ dealTitle, oldStageLabel, newStageLabel, tasksCreated }) {
  return (
    <div className="flex flex-col gap-2 min-w-[280px]">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        <span className="font-semibold text-sm text-slate-900">Deal Stage Updated</span>
      </div>
      <p className="text-xs text-slate-600 ml-7">{dealTitle}</p>
      <div className="flex items-center gap-2 ml-7 text-xs text-slate-500">
        <span className="px-1.5 py-0.5 rounded bg-slate-100">{oldStageLabel}</span>
        <ArrowRight className="w-3 h-3" />
        <span className="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 font-medium">{newStageLabel}</span>
      </div>
      <div className="flex items-center gap-3 ml-7 mt-1 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" /> Note created
        </span>
        <span className="flex items-center gap-1">
          <ListTodo className="w-3 h-3" /> {tasksCreated} tasks created
        </span>
      </div>
    </div>
  );
}