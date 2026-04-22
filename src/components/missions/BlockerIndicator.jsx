import React from 'react';
import { cn } from "@/lib/utils";
import { Lock, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function BlockerIndicator({ blockerTasks }) {
  if (!blockerTasks || blockerTasks.length === 0) return null;

  const incompleteBlockers = blockerTasks.filter(
    t => (t.status || (t.completed ? 'completed' : 'todo')) !== 'completed'
  );

  if (incompleteBlockers.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium cursor-help">
            <Lock className="w-3 h-3" />
            <span>Blocked</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-64">
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1 font-semibold text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              Waiting on {incompleteBlockers.length} task{incompleteBlockers.length > 1 ? 's' : ''}:
            </div>
            <ul className="list-disc pl-4 space-y-0.5">
              {incompleteBlockers.map(t => (
                <li key={t.id} className="text-slate-600">{t.title}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}