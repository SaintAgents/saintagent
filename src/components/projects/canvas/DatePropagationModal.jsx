import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, Calendar, Loader2, Zap } from 'lucide-react';

export default function DatePropagationModal({ tasks, result, onApply, onCancel, isApplying }) {
  const triggerTask = tasks.find(t => t.id === result.trigger);
  const cascadeUpdates = result.updates.filter(u => u.taskId !== result.trigger);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-96 overflow-hidden">
        <div className="px-5 py-4 bg-amber-50 border-b border-amber-100">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-sm text-amber-800">Date Change Cascade</h3>
          </div>
          <p className="text-xs text-amber-600">
            Changing <strong>{triggerTask?.title}</strong> will shift {cascadeUpdates.length} dependent task{cascadeUpdates.length !== 1 ? 's' : ''}.
          </p>
        </div>

        <div className="p-4 max-h-64 overflow-y-auto space-y-2">
          {/* Trigger task */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
            <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{triggerTask?.title}</div>
              <div className="text-[10px] text-slate-500">
                {triggerTask?.start_date || '—'} → {result.updates.find(u => u.taskId === result.trigger)?.newStartDate}
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-600 text-[10px]">trigger</Badge>
          </div>

          {cascadeUpdates.length > 0 && (
            <div className="flex items-center gap-2 py-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] text-slate-400">cascades to</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          )}

          {/* Cascade updates */}
          {cascadeUpdates.map(update => {
            const task = tasks.find(t => t.id === update.taskId);
            return (
              <div key={update.taskId} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{task?.title || update.taskId}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span className="line-through">{task?.start_date || '—'}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                    <span className="text-amber-600 font-medium">{update.newStartDate}</span>
                  </div>
                </div>
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onCancel} disabled={isApplying}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            onClick={onApply}
            disabled={isApplying}
          >
            {isApplying ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Zap className="w-4 h-4 mr-1" />}
            Apply {result.updates.length} Changes
          </Button>
        </div>
      </div>
    </div>
  );
}