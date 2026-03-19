import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, Clock, Flag, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function PortalMilestoneApproval({ mission, missions }) {
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async ({ missionId, milestoneId }) => {
      const m = missions.find(x => x.id === missionId);
      if (!m) return;
      const updated = (m.milestones || []).map(ms =>
        ms.id === milestoneId ? { ...ms, completed: true } : ms
      );
      return base44.entities.Mission.update(missionId, { milestones: updated });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalMissions'] });
    }
  });

  // Collect all milestones from all missions with context
  const allMilestones = [];
  (missions || []).forEach(m => {
    (m.milestones || []).forEach(ms => {
      allMilestones.push({ ...ms, missionId: m.id, missionTitle: m.title });
    });
  });

  const pending = allMilestones.filter(ms => !ms.completed);
  const completed = allMilestones.filter(ms => ms.completed);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Flag className="w-4 h-4 text-violet-600" />
          Milestone Approvals
          {pending.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 text-xs ml-auto">{pending.length} pending</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] px-6 pb-4">
          {allMilestones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Flag className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No milestones yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-600 mb-2 uppercase tracking-wide">Awaiting Approval</p>
                  <div className="space-y-2">
                    {pending.map((ms, i) => (
                      <div key={`${ms.missionId}-${ms.id || i}`} className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">{ms.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Mission: {ms.missionTitle}
                              {ms.due_date && ` • Due ${ms.due_date}`}
                            </p>
                            {ms.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ms.description}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 gap-1 shrink-0"
                            onClick={() => approveMutation.mutate({ missionId: ms.missionId, milestoneId: ms.id })}
                            disabled={approveMutation.isPending}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Approve
                          </Button>
                        </div>
                        {(ms.tasks || []).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {ms.tasks.map((t, ti) => (
                              <Badge key={ti} variant="outline" className={cn("text-[10px]",
                                t.completed || t.status === 'completed' ? 'border-emerald-200 text-emerald-600' : 'border-slate-200 text-slate-500'
                              )}>
                                {t.completed || t.status === 'completed' ? <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> : <Circle className="w-2.5 h-2.5 mr-0.5" />}
                                {t.title}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {completed.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wide">Approved</p>
                  <div className="space-y-2">
                    {completed.map((ms, i) => (
                      <div key={`${ms.missionId}-${ms.id || i}`} className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/30">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700">{ms.title}</p>
                            <p className="text-xs text-slate-500">{ms.missionTitle}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}