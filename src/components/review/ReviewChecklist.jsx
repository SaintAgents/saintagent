import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Circle } from 'lucide-react';
import { CHECKLIST_ITEMS } from './reviewScoringConfig';
import { cn } from '@/lib/utils';

export default function ReviewChecklist({ checklist = {}, onChange }) {
  const completedCount = CHECKLIST_ITEMS.filter(i => checklist[i.id]).length;
  const allComplete = completedCount === CHECKLIST_ITEMS.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-900">Review Checklist</h3>
        <span className={cn(
          "text-sm font-medium px-2 py-0.5 rounded-full",
          allComplete ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
        )}>
          {completedCount}/{CHECKLIST_ITEMS.length}
        </span>
      </div>
      <div className="space-y-2">
        {CHECKLIST_ITEMS.map(item => (
          <label
            key={item.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
              checklist[item.id] ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200 hover:border-violet-300"
            )}
          >
            <Checkbox
              checked={!!checklist[item.id]}
              onCheckedChange={(checked) => onChange({ ...checklist, [item.id]: checked })}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {checklist[item.id] ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className={cn("text-sm font-medium", checklist[item.id] ? "text-emerald-800" : "text-slate-700")}>
                  {item.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 ml-6">{item.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}