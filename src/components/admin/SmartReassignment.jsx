import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users, ArrowRight, AlertTriangle, Zap, CheckCircle2, Clock,
  Shuffle, Flame, TrendingUp, Shield, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import { differenceInDays, parseISO, isValid } from 'date-fns';

const WORKLOAD_THRESHOLDS = { overloaded: 8, heavy: 5, optimal: 2 };

function computeMemberWorkload(memberId, tasks) {
  const memberTasks = tasks.filter(t => t.assignee_id === memberId && t.status !== 'completed');
  const urgent = memberTasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;
  const blocked = memberTasks.filter(t => t.status === 'blocked').length;
  const overdue = memberTasks.filter(t => {
    if (!t.due_date) return false;
    const d = parseISO(t.due_date);
    return isValid(d) && differenceInDays(new Date(), d) > 0;
  }).length;
  const totalHours = memberTasks.reduce((a, t) => a + (t.estimated_hours || 4), 0);
  const score = memberTasks.length * 10 + urgent * 8 + blocked * 5 + overdue * 12;
  const level = memberTasks.length >= WORKLOAD_THRESHOLDS.overloaded ? 'overloaded' :
    memberTasks.length >= WORKLOAD_THRESHOLDS.heavy ? 'heavy' :
    memberTasks.length >= WORKLOAD_THRESHOLDS.optimal ? 'optimal' : 'light';
  return { memberId, tasks: memberTasks, total: memberTasks.length, urgent, blocked, overdue, totalHours, score, level };
}

function generateSuggestions(members, allTasks, projects) {
  const suggestions = [];
  const overloaded = members.filter(m => m.level === 'overloaded' || m.level === 'heavy');
  const available = members.filter(m => m.level === 'light' || m.level === 'optimal');

  for (const source of overloaded) {
    // Find tasks that can be moved (not blocked, not urgent-critical, has due date buffer)
    const movable = source.tasks
      .filter(t => t.status !== 'blocked' && t.priority !== 'urgent')
      .sort((a, b) => {
        const aPri = { low: 0, medium: 1, high: 2 }[a.priority] || 1;
        const bPri = { low: 0, medium: 1, high: 2 }[b.priority] || 1;
        return aPri - bPri; // Move lower priority first
      });

    for (const task of movable.slice(0, 3)) {
      // Find best candidate from available members
      const projectTeam = projects.find(p => p.id === task.project_id)?.team_member_ids || [];
      
      const candidates = available
        .filter(a => a.memberId !== source.memberId)
        .map(a => {
          let fit = 100 - a.score; // Lower workload = better fit
          if (projectTeam.includes(a.memberId)) fit += 30; // Same project team bonus
          return { ...a, fit };
        })
        .sort((a, b) => b.fit - a.fit);

      if (candidates.length > 0) {
        const target = candidates[0];
        const reason = [];
        if (source.level === 'overloaded') reason.push(`${source.memberId.split('@')[0]} is overloaded (${source.total} active tasks)`);
        if (source.overdue > 0) reason.push(`${source.overdue} overdue tasks`);
        if (target.level === 'light') reason.push(`${target.memberId.split('@')[0]} has capacity (${target.total} tasks)`);
        if (projectTeam.includes(target.memberId)) reason.push('Already on project team');

        const impact = Math.min(
          Math.round(((source.score - target.score) / Math.max(source.score, 1)) * 100),
          95
        );

        suggestions.push({
          id: `${task.id}-${target.memberId}`,
          task,
          from: source,
          to: target,
          reason: reason.join('; '),
          impact,
          priority: source.level === 'overloaded' ? 'high' : 'medium',
        });
      }
    }
  }

  // Bottleneck suggestions - tasks blocking others
  allTasks.forEach(task => {
    if (task.status === 'blocked' || task.status === 'completed') return;
    const blocking = allTasks.filter(t =>
      t.status === 'blocked' &&
      (t.depends_on?.includes(task.id) || t.dependencies?.some(d => d.task_id === task.id))
    );
    if (blocking.length >= 2 && task.assignee_id) {
      const assignee = members.find(m => m.memberId === task.assignee_id);
      if (assignee && assignee.level !== 'light') {
        suggestions.push({
          id: `bottleneck-${task.id}`,
          task,
          from: assignee,
          to: null,
          reason: `This task blocks ${blocking.length} others. Assignee has ${assignee.total} active tasks. Consider prioritizing or splitting.`,
          impact: blocking.length * 25,
          priority: 'critical',
          isBottleneck: true,
        });
      }
    }
  });

  return suggestions.sort((a, b) => b.impact - a.impact);
}

function SuggestionCard({ suggestion, onApply, isApplying }) {
  const [expanded, setExpanded] = useState(false);
  const prioColor = {
    critical: 'border-red-200 bg-red-50/30',
    high: 'border-orange-200 bg-orange-50/30',
    medium: 'border-amber-200 bg-amber-50/30',
  }[suggestion.priority] || 'border-slate-200';

  return (
    <Card className={`${prioColor} overflow-hidden`}>
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3">
          {suggestion.isBottleneck ? (
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-red-600" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Shuffle className="w-4 h-4 text-blue-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm truncate">{suggestion.task.title}</span>
              <Badge className={
                suggestion.priority === 'critical' ? 'bg-red-100 text-red-700 border-red-200' :
                suggestion.priority === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                'bg-amber-100 text-amber-700 border-amber-200'
              }>
                {suggestion.priority}
              </Badge>
            </div>
            {!suggestion.isBottleneck ? (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="truncate">{suggestion.from.memberId.split('@')[0]}</span>
                <ArrowRight className="w-3 h-3 shrink-0" />
                <span className="truncate">{suggestion.to.memberId.split('@')[0]}</span>
                <Badge variant="outline" className="text-[10px] ml-auto shrink-0">
                  {suggestion.impact}% impact
                </Badge>
              </div>
            ) : (
              <p className="text-xs text-red-600">Bottleneck: blocks multiple tasks</p>
            )}
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="p-2.5 bg-white rounded-lg border border-slate-100 text-xs text-slate-600">
            <strong>Rationale:</strong> {suggestion.reason}
          </div>
          {!suggestion.isBottleneck && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-100">
                <div className="text-[10px] font-medium text-red-600 mb-1">FROM (overloaded)</div>
                <div className="text-xs font-medium truncate">{suggestion.from.memberId.split('@')[0]}</div>
                <div className="text-[10px] text-slate-500">{suggestion.from.total} tasks · {suggestion.from.urgent} urgent · {suggestion.from.overdue} overdue</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="text-[10px] font-medium text-emerald-600 mb-1">TO (available)</div>
                <div className="text-xs font-medium truncate">{suggestion.to.memberId.split('@')[0]}</div>
                <div className="text-[10px] text-slate-500">{suggestion.to.total} tasks · {suggestion.to.totalHours}h est.</div>
              </div>
            </div>
          )}
          {!suggestion.isBottleneck && (
            <Button
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={(e) => { e.stopPropagation(); onApply(suggestion); }}
              disabled={isApplying}
            >
              {isApplying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shuffle className="w-4 h-4 mr-2" />}
              Reassign Task
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

export default function SmartReassignment() {
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['allProjectTasks'],
    queryFn: () => base44.entities.ProjectTask.list('-created_date', 1000),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ['allProjects'],
    queryFn: () => base44.entities.Project.list('-updated_date', 200),
  });
  const { data: profiles = [] } = useQuery({
    queryKey: ['allUserProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 200),
  });

  // Build member workloads
  const memberIds = useMemo(() => {
    const ids = new Set();
    tasks.forEach(t => { if (t.assignee_id) ids.add(t.assignee_id); });
    return [...ids];
  }, [tasks]);

  const members = useMemo(() =>
    memberIds.map(id => computeMemberWorkload(id, tasks)),
    [memberIds, tasks]
  );

  const suggestions = useMemo(() =>
    generateSuggestions(members, tasks, projects),
    [members, tasks, projects]
  );

  const applyMutation = useMutation({
    mutationFn: async (suggestion) => {
      const targetProfile = profiles.find(p => p.user_id === suggestion.to.memberId);
      await base44.entities.ProjectTask.update(suggestion.task.id, {
        assignee_id: suggestion.to.memberId,
        assignee_name: targetProfile?.display_name || suggestion.to.memberId.split('@')[0],
        assignee_avatar: targetProfile?.avatar_url || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProjectTasks'] });
    },
  });

  const overloadedCount = members.filter(m => m.level === 'overloaded').length;
  const heavyCount = members.filter(m => m.level === 'heavy').length;
  const lightCount = members.filter(m => m.level === 'light').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 mb-1"><Flame className="w-4 h-4" /><span className="text-xs font-medium">Overloaded</span></div>
            <div className="text-2xl font-bold text-red-700">{overloadedCount}</div>
            <div className="text-[10px] text-slate-500">≥{WORKLOAD_THRESHOLDS.overloaded} active tasks</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1"><AlertTriangle className="w-4 h-4" /><span className="text-xs font-medium">Heavy Load</span></div>
            <div className="text-2xl font-bold text-orange-700">{heavyCount}</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-1"><Shield className="w-4 h-4" /><span className="text-xs font-medium">Available</span></div>
            <div className="text-2xl font-bold text-emerald-700">{lightCount}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1"><Shuffle className="w-4 h-4" /><span className="text-xs font-medium">Suggestions</span></div>
            <div className="text-2xl font-bold text-blue-700">{suggestions.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Workload Overview */}
        <div className="lg:col-span-5">
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Team Workload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {members.sort((a, b) => b.score - a.score).map(m => {
                const prof = profiles.find(p => p.user_id === m.memberId);
                const barColor = m.level === 'overloaded' ? '#ef4444' : m.level === 'heavy' ? '#f97316' : m.level === 'optimal' ? '#3b82f6' : '#10b981';
                const barPct = Math.min((m.total / WORKLOAD_THRESHOLDS.overloaded) * 100, 100);
                return (
                  <div key={m.memberId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarImage src={prof?.avatar_url} />
                      <AvatarFallback className="text-[10px]">{(prof?.display_name || m.memberId)[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium truncate">{prof?.display_name || m.memberId.split('@')[0]}</span>
                        <Badge variant="outline" className="text-[10px] capitalize" style={{ borderColor: barColor, color: barColor }}>
                          {m.level}
                        </Badge>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, backgroundColor: barColor }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold">{m.total}</div>
                      <div className="text-[10px] text-slate-400">tasks</div>
                    </div>
                  </div>
                );
              })}
              {members.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">No assigned tasks found.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Suggestions */}
        <div className="lg:col-span-7">
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Smart Reassignment Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Workloads are balanced — no reassignments needed.</p>
                </div>
              ) : (
                suggestions.slice(0, 10).map(s => (
                  <SuggestionCard
                    key={s.id}
                    suggestion={s}
                    onApply={() => applyMutation.mutate(s)}
                    isApplying={applyMutation.isPending}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}