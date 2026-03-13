import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, TrendingUp, Clock, AlertTriangle, BarChart3,
  UserPlus, Gauge, Calendar
} from 'lucide-react';
import { startOfWeek, addWeeks } from 'date-fns';

import { getQuarterWeeks, computeMemberCapacity, computeOrgCapacity, HOURS_PER_WEEK_CONST } from './capacity/CapacityUtils';
import CapacityHeatmap from './capacity/CapacityHeatmap';
import OrgCapacityChart from './capacity/OrgCapacityChart';
import HiringNeedsPanel from './capacity/HiringNeedsPanel';

export default function ResourceCapacityPlanner() {
  const [quarterOffset, setQuarterOffset] = useState(0); // 0=this quarter, 1=next

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

  // Determine quarter start
  const quarterStart = useMemo(() => {
    const now = new Date();
    return addWeeks(startOfWeek(now, { weekStartsOn: 1 }), quarterOffset * 13);
  }, [quarterOffset]);

  const weeks = useMemo(() => getQuarterWeeks(quarterStart), [quarterStart]);

  // Get all unique assignees
  const memberIds = useMemo(() => {
    const ids = new Set();
    tasks.forEach(t => { if (t.assignee_id) ids.add(t.assignee_id); });
    return [...ids];
  }, [tasks]);

  // Compute per-member capacity
  const memberCapacities = useMemo(() =>
    memberIds.map(id => computeMemberCapacity(id, tasks, weeks)),
    [memberIds, tasks, weeks]
  );

  // Compute org-wide capacity
  const orgCapacity = useMemo(() =>
    computeOrgCapacity(memberCapacities, weeks),
    [memberCapacities, weeks]
  );

  // Per-project breakdown
  const projectBreakdown = useMemo(() => {
    const activeProjects = projects.filter(p =>
      ['in_progress', 'funded', 'approved'].includes(p.project_status || p.status)
    );
    return activeProjects.map(proj => {
      const projTasks = tasks.filter(t => t.project_id === proj.id && t.status !== 'completed');
      const totalHours = projTasks.reduce((sum, t) => sum + (t.estimated_hours || 8), 0);
      const assignees = new Set(projTasks.filter(t => t.assignee_id).map(t => t.assignee_id));
      return { ...proj, taskCount: projTasks.length, totalHours, assigneeCount: assignees.size };
    }).sort((a, b) => b.totalHours - a.totalHours);
  }, [projects, tasks]);

  const totalDemandHours = Math.round(orgCapacity.totalDemand);
  const totalSupplyHours = Math.round(orgCapacity.totalSupply);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1"><Users className="w-3.5 h-3.5" /><span className="text-[10px]">Team Size</span></div>
            <div className="text-2xl font-bold">{memberIds.length}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1"><Clock className="w-3.5 h-3.5" /><span className="text-[10px]">Supply (13wk)</span></div>
            <div className="text-2xl font-bold">{totalSupplyHours}h</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1"><BarChart3 className="w-3.5 h-3.5" /><span className="text-[10px]">Demand</span></div>
            <div className="text-2xl font-bold">{totalDemandHours}h</div>
          </CardContent>
        </Card>
        <Card className={`border-slate-200 ${orgCapacity.avgUtilization > 100 ? 'bg-red-50/30 border-red-200' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1"><Gauge className="w-3.5 h-3.5" /><span className="text-[10px]">Utilization</span></div>
            <div className={`text-2xl font-bold ${orgCapacity.avgUtilization > 100 ? 'text-red-600' : orgCapacity.avgUtilization > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {orgCapacity.avgUtilization}%
            </div>
          </CardContent>
        </Card>
        <Card className={`border-slate-200 ${orgCapacity.shortageWeeks > 0 ? 'bg-amber-50/30 border-amber-200' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1"><AlertTriangle className="w-3.5 h-3.5" /><span className="text-[10px]">Shortage Wks</span></div>
            <div className={`text-2xl font-bold ${orgCapacity.shortageWeeks > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {orgCapacity.shortageWeeks}/13
            </div>
          </CardContent>
        </Card>
        <Card className={`border-slate-200 ${orgCapacity.additionalHeadcount > 0 ? 'bg-red-50/30 border-red-200' : 'bg-emerald-50/30 border-emerald-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1"><UserPlus className="w-3.5 h-3.5" /><span className="text-[10px]">Hire Need</span></div>
            <div className={`text-2xl font-bold ${orgCapacity.additionalHeadcount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {orgCapacity.additionalHeadcount > 0 ? `+${orgCapacity.additionalHeadcount}` : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quarter Selector */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-slate-400" />
        <select
          value={quarterOffset}
          onChange={e => setQuarterOffset(Number(e.target.value))}
          className="h-8 px-3 rounded-md border border-slate-200 text-sm bg-white"
        >
          <option value={0}>This Quarter (13 weeks)</option>
          <option value={1}>Next Quarter</option>
          <option value={2}>Q+2</option>
        </select>
        <Badge variant="outline" className="text-[10px]">{HOURS_PER_WEEK_CONST}h/week per person</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="overview" className="gap-1.5 text-xs"><BarChart3 className="w-3.5 h-3.5" />Overview</TabsTrigger>
          <TabsTrigger value="heatmap" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" />Heatmap</TabsTrigger>
          <TabsTrigger value="hiring" className="gap-1.5 text-xs"><UserPlus className="w-3.5 h-3.5" />Hiring Needs</TabsTrigger>
          <TabsTrigger value="projects" className="gap-1.5 text-xs"><TrendingUp className="w-3.5 h-3.5" />By Project</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                Weekly Demand vs Supply
              </CardTitle>
              <p className="text-xs text-slate-400">Purple bars = team demand · Green line = available capacity</p>
            </CardHeader>
            <CardContent>
              <OrgCapacityChart weeks={weeks} orgData={orgCapacity} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Individual Capacity Heatmap
              </CardTitle>
              <div className="flex items-center gap-3 mt-1">
                {[
                  { label: '>130%', bg: '#fecaca' },
                  { label: '100-130%', bg: '#fed7aa' },
                  { label: '70-100%', bg: '#bbf7d0' },
                  { label: '30-70%', bg: '#dbeafe' },
                  { label: '<30%', bg: '#f1f5f9' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: l.bg }} />
                    <span className="text-[10px] text-slate-400">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {memberCapacities.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No assigned team members found.</p>
              ) : (
                <CapacityHeatmap
                  members={memberCapacities.sort((a, b) => b.utilization - a.utilization)}
                  weeks={weeks}
                  profiles={profiles}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hiring">
          <HiringNeedsPanel orgData={orgCapacity} members={memberCapacities} weeks={weeks} />
        </TabsContent>

        <TabsContent value="projects">
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                Demand by Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projectBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No active projects.</p>
              ) : (
                <div className="space-y-2">
                  {projectBreakdown.map(proj => {
                    const pct = totalDemandHours > 0 ? Math.round((proj.totalHours / totalDemandHours) * 100) : 0;
                    return (
                      <div key={proj.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium truncate">{proj.title}</span>
                            <Badge variant="outline" className="text-[10px]">{proj.assigneeCount} people</Badge>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                        <div className="text-right shrink-0 w-24">
                          <div className="text-xs font-bold">{Math.round(proj.totalHours)}h</div>
                          <div className="text-[10px] text-slate-400">{proj.taskCount} tasks · {pct}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}