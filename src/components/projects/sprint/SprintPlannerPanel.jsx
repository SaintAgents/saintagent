import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Zap, Users, Clock, AlertTriangle, Loader2, RefreshCw, Calendar, BarChart3, ChevronDown, ChevronUp
} from 'lucide-react';
import SprintMemberRow from './SprintMemberRow';
import SprintWeekColumn from './SprintWeekColumn';

export default function SprintPlannerPanel({ projectId, onClose }) {
  const [sprintWeeks, setSprintWeeks] = useState('2');
  const [showMembers, setShowMembers] = useState(true);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['sprintPlan', projectId, sprintWeeks],
    queryFn: async () => {
      const res = await base44.functions.invoke('generateSprintPlan', {
        project_id: projectId,
        sprint_weeks: parseInt(sprintWeeks),
      });
      return res.data?.sprint_plan;
    },
    enabled: !!projectId,
    staleTime: 60000,
  });

  const plan = data;

  return (
    <Card className="border-violet-200 bg-violet-50/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-500" />
            Sprint Planner
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={sprintWeeks} onValueChange={setSprintWeeks}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Week</SelectItem>
                <SelectItem value="2">2 Weeks</SelectItem>
                <SelectItem value="3">3 Weeks</SelectItem>
                <SelectItem value="4">4 Weeks</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-8 gap-1 text-xs"
            >
              <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs">
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-sm text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing velocity and dependencies...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-red-400">Failed to generate sprint plan</div>
        ) : !plan ? (
          <div className="text-center py-8 text-sm text-slate-400">No data available</div>
        ) : (
          <>
            {/* Summary strip */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border text-xs">
                <BarChart3 className="w-3.5 h-3.5 text-violet-500" />
                <span className="font-semibold">{plan.totalAssigned}</span>
                <span className="text-slate-400">tasks assigned</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border text-xs">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                <span className="font-semibold">{plan.totalHoursPlanned}h</span>
                <span className="text-slate-400">planned</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border text-xs">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold">{plan.members.length}</span>
                <span className="text-slate-400">members</span>
              </div>
              {plan.overflow.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-amber-700">{plan.overflow.length}</span>
                  <span className="text-amber-600">overflow</span>
                </div>
              )}
            </div>

            {/* Warnings */}
            {plan.warnings.length > 0 && (
              <div className="space-y-1">
                {plan.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {w}
                  </div>
                ))}
              </div>
            )}

            {/* Team workload */}
            <div>
              <button
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2 hover:text-slate-800"
                onClick={() => setShowMembers(!showMembers)}
              >
                <Users className="w-3.5 h-3.5" />
                Team Workload
                {showMembers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showMembers && (
                <div className="space-y-1.5">
                  {plan.members.map(m => (
                    <SprintMemberRow key={m.memberId} member={m} />
                  ))}
                </div>
              )}
            </div>

            {/* Week columns */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
                <Calendar className="w-3.5 h-3.5" />
                Sprint Schedule
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {plan.weeks.map(week => (
                  <SprintWeekColumn key={week.weekIndex} week={week} />
                ))}
              </div>
            </div>

            {/* Overflow tasks */}
            {plan.overflow.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Couldn't Fit ({plan.overflow.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {plan.overflow.map((t, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] gap-1 border-amber-200 text-amber-700">
                      {t.title} ({t.hours}h)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}