import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  LayoutDashboard, Users, ClipboardCheck, BarChart3, Search, Filter,
  Plus, Clock, AlertTriangle, CheckCircle, Loader2, ChevronRight,
  TrendingUp, Eye, RefreshCw, UserPlus, FileText, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AssignReviewModal from '@/components/review/AssignReviewModal';
import ReviewerPerformanceCard from '@/components/review/ReviewerPerformanceCard';

const STATUS_COLORS = {
  pending: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  checklist_complete: 'bg-amber-100 text-amber-700',
  scoring_complete: 'bg-violet-100 text-violet-700',
  submitted: 'bg-emerald-100 text-emerald-700',
  returned: 'bg-rose-100 text-rose-700',
  escalated: 'bg-red-100 text-red-700',
};

export default function ReviewManagerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const { data: allAssignments = [], isLoading } = useQuery({
    queryKey: ['allReviewAssignments'],
    queryFn: () => base44.entities.ReviewAssignment.list('-created_date', 500),
    staleTime: 30000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['reviewProjects'],
    queryFn: () => base44.entities.Project.filter(
      { status: { $in: ['pending_review', 'phase1_review', 'phase2_scoring', 'phase3_risk', 'phase4_decision', 'rfi_pending'] } },
      '-created_date', 200
    ),
    staleTime: 60000,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['reviewerProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500),
    staleTime: 300000,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsersForReview'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
    staleTime: 300000,
  });

  // Stats
  const stats = useMemo(() => {
    const pending = allAssignments.filter(a => a.status === 'pending').length;
    const inProgress = allAssignments.filter(a => a.status === 'in_progress' || a.status === 'checklist_complete' || a.status === 'scoring_complete').length;
    const submitted = allAssignments.filter(a => a.status === 'submitted').length;
    const escalated = allAssignments.filter(a => a.status === 'escalated').length;
    const unassigned = projects.filter(p => !allAssignments.some(a => a.project_id === p.id && a.status !== 'returned')).length;

    // Reviewer workload
    const reviewerMap = {};
    allAssignments.filter(a => !['submitted', 'returned'].includes(a.status)).forEach(a => {
      if (!reviewerMap[a.reviewer_id]) reviewerMap[a.reviewer_id] = { active: 0, total: 0 };
      reviewerMap[a.reviewer_id].active++;
    });
    allAssignments.forEach(a => {
      if (!reviewerMap[a.reviewer_id]) reviewerMap[a.reviewer_id] = { active: 0, total: 0 };
      reviewerMap[a.reviewer_id].total++;
    });

    // Avg time
    const completedWithTime = allAssignments.filter(a => a.status === 'submitted' && a.started_at && a.completed_at);
    const avgHours = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, a) => sum + (new Date(a.completed_at) - new Date(a.started_at)) / 3600000, 0) / completedWithTime.length
      : 0;

    // Scoring consistency
    const withScores = allAssignments.filter(a => a.reviewer_weighted_score > 0 && a.ai_score_at_review > 0);
    const avgDeviation = withScores.length > 0
      ? withScores.reduce((sum, a) => sum + (a.score_deviation || 0), 0) / withScores.length
      : 0;

    return { pending, inProgress, submitted, escalated, unassigned, reviewerMap, avgHours, avgDeviation };
  }, [allAssignments, projects]);

  // Filtered assignments
  const filtered = useMemo(() => {
    let result = allAssignments;
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.reviewer_id?.toLowerCase().includes(q) ||
        a.reviewer_name?.toLowerCase().includes(q) ||
        a.project_id?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allAssignments, statusFilter, searchQuery]);

  // Unique reviewers
  const reviewers = useMemo(() => {
    const map = {};
    allAssignments.forEach(a => {
      if (!map[a.reviewer_id]) {
        map[a.reviewer_id] = {
          id: a.reviewer_id,
          name: a.reviewer_name || a.reviewer_id,
          assignments: [],
        };
      }
      map[a.reviewer_id].assignments.push(a);
    });
    return Object.values(map);
  }, [allAssignments]);

  // Resubmission detection
  const resubmissions = useMemo(() => {
    return allAssignments.filter(a => a.is_resubmission);
  }, [allAssignments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review Manager Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Assign projects, monitor progress, and audit reviewer performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['allReviewAssignments'] })}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => { setSelectedProjectId(null); setAssignModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Assign Review
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Unassigned" value={stats.unassigned} color="rose" icon={FileText} />
        <StatCard label="Pending" value={stats.pending} color="slate" icon={Clock} />
        <StatCard label="In Progress" value={stats.inProgress} color="blue" icon={ClipboardCheck} />
        <StatCard label="Submitted" value={stats.submitted} color="emerald" icon={CheckCircle} />
        <StatCard label="Escalated" value={stats.escalated} color="red" icon={AlertTriangle} />
        <StatCard label="Avg Deviation" value={`${stats.avgDeviation.toFixed(1)}pts`} color="violet" icon={BarChart3} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="overview"><LayoutDashboard className="w-4 h-4 mr-1" />All Assignments</TabsTrigger>
          <TabsTrigger value="unassigned"><FileText className="w-4 h-4 mr-1" />Unassigned ({stats.unassigned})</TabsTrigger>
          <TabsTrigger value="reviewers"><Users className="w-4 h-4 mr-1" />Reviewers ({reviewers.length})</TabsTrigger>
          <TabsTrigger value="consistency"><BarChart3 className="w-4 h-4 mr-1" />Scoring Consistency</TabsTrigger>
        </TabsList>

        {/* All Assignments */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by reviewer or project..."
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="max-h-[600px]">
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No assignments found.</div>
              ) : filtered.map(a => (
                <AssignmentRow key={a.id} assignment={a} projects={projects} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Unassigned Projects */}
        <TabsContent value="unassigned" className="mt-4 space-y-3">
          {projects.filter(p => !allAssignments.some(a => a.project_id === p.id && a.status !== 'returned')).length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>All projects have been assigned for review.</p>
            </div>
          ) : (
            projects.filter(p => !allAssignments.some(a => a.project_id === p.id && a.status !== 'returned')).map(p => {
              const prevSubmissions = allAssignments.filter(a => a.project_id === p.id);
              const isResubmission = prevSubmissions.length > 0;
              return (
                <div key={p.id} className="p-4 rounded-xl border bg-white hover:border-violet-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{p.title}</span>
                        {isResubmission && <Badge className="bg-blue-100 text-blue-700 text-[10px]">Resubmission</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                        <span>{p.sector}</span>
                        <span>•</span>
                        <span>${(p.amount_requested || p.budget || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => { setSelectedProjectId(p.id); setAssignModalOpen(true); }}>
                      <UserPlus className="w-4 h-4 mr-1" /> Assign
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* Reviewers */}
        <TabsContent value="reviewers" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewers.map(r => (
              <ReviewerPerformanceCard key={r.id} reviewer={r} profiles={profiles} />
            ))}
          </div>
        </TabsContent>

        {/* Scoring Consistency */}
        <TabsContent value="consistency" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">AI vs Human Scoring Alignment</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reviewers.map(r => {
                  const submitted = r.assignments.filter(a => a.status === 'submitted' && a.reviewer_weighted_score > 0);
                  const avgDev = submitted.length > 0
                    ? submitted.reduce((s, a) => s + (a.score_deviation || 0), 0) / submitted.length
                    : 0;
                  const highDevCount = submitted.filter(a => (a.score_deviation || 0) > 10).length;

                  return (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border bg-white">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-violet-100 text-violet-600">{r.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-slate-700 truncate block">{r.name}</span>
                        <span className="text-xs text-slate-500">{submitted.length} reviews completed</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={cn("text-sm font-bold", avgDev > 10 ? "text-amber-600" : "text-emerald-600")}>
                          ±{avgDev.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-400">avg dev</div>
                      </div>
                      {highDevCount > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 text-[10px] shrink-0">
                          {highDevCount} high dev
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Resubmission tracking */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Resubmissions ({resubmissions.length})</CardTitle></CardHeader>
            <CardContent>
              {resubmissions.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No resubmissions yet.</p>
              ) : (
                <div className="space-y-2">
                  {resubmissions.slice(0, 20).map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded border text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700 text-[10px]">#{a.resubmission_number}</Badge>
                        <span className="text-slate-700">Project {a.project_id?.slice(-6)}</span>
                      </div>
                      <Badge className={cn("text-[10px]", STATUS_COLORS[a.status])}>{a.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign modal */}
      <AssignReviewModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        projectId={selectedProjectId}
        projects={projects}
        allAssignments={allAssignments}
        users={allUsers}
        profiles={profiles}
        onAssigned={() => {
          queryClient.invalidateQueries({ queryKey: ['allReviewAssignments'] });
          setAssignModalOpen(false);
        }}
      />
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-4 h-4", `text-${color}-500`)} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className={cn("text-xl font-bold", `text-${color}-700`)}>{value}</div>
    </Card>
  );
}

function AssignmentRow({ assignment: a, projects }) {
  const project = projects.find(p => p.id === a.project_id);
  return (
    <a
      href={`/ReviewerWorkflow?id=${a.id}`}
      className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:border-violet-300 transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-slate-900 truncate">{project?.title || `Project ${a.project_id?.slice(-6)}`}</span>
          <Badge className={cn("text-[10px]", STATUS_COLORS[a.status])}>{a.status?.replace(/_/g, ' ')}</Badge>
          {a.is_resubmission && <Badge className="bg-blue-100 text-blue-700 text-[10px]">Resub #{a.resubmission_number}</Badge>}
          <Badge className={cn("text-[10px]",
            a.priority === 'urgent' ? "bg-rose-100 text-rose-700" :
            a.priority === 'high' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
          )}>{a.priority}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <span>Reviewer: {a.reviewer_name || a.reviewer_id}</span>
          {a.due_date && <span>• Due {new Date(a.due_date).toLocaleDateString()}</span>}
          {a.reviewer_weighted_score > 0 && <span>• Score: {a.reviewer_weighted_score}</span>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
    </a>
  );
}