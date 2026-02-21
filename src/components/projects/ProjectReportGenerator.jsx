import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Download, Calendar, Users, BarChart3, Clock, Target, 
  CheckCircle2, AlertTriangle, Loader2, TrendingUp, TrendingDown,
  Activity, Zap, AlertCircle, ArrowRight, PieChart, LineChart,
  Flame, Timer, GitBranch, Shield
} from 'lucide-react';
import { format, parseISO, isWithinInterval, differenceInDays, subDays, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export default function ProjectReportGenerator({ project, onClose }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportType, setReportType] = useState('full');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [sprintLength, setSprintLength] = useState(14);

  const { data: milestones = [] } = useQuery({
    queryKey: ['projectMilestones', project.id],
    queryFn: () => base44.entities.ProjectMilestone.filter({ project_id: project.id }, 'order', 100)
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['projectTasks', project.id],
    queryFn: () => base44.entities.ProjectTask.filter({ project_id: project.id }, 'order', 500)
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ['projectTimeEntries', project.id],
    queryFn: () => base44.entities.TaskTimeEntry.filter({ project_id: project.id }, '-created_date', 1000)
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['projectActivities', project.id],
    queryFn: () => base44.entities.ProjectActivity.filter({ project_id: project.id }, '-created_date', 500)
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200)
  });

  const teamMemberIds = project.team_member_ids || [];
  const teamMembers = allProfiles.filter(p => teamMemberIds.includes(p.user_id));

  // Analytics calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const fourteenDaysAgo = subDays(now, 14);
    const sevenDaysAgo = subDays(now, 7);

    // Task completion trends
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const recentCompleted = completedTasks.filter(t => 
      t.completed_at && new Date(t.completed_at) >= thirtyDaysAgo
    );

    // Velocity calculation (tasks completed per week)
    const weeklyVelocity = recentCompleted.length / 4.3;

    // Burndown data
    const burndownData = [];
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: now });
    let remainingTasks = tasks.length;
    
    days.forEach(day => {
      const completedOnDay = completedTasks.filter(t => {
        const completedDate = t.completed_at ? new Date(t.completed_at) : null;
        return completedDate && 
          completedDate >= startOfDay(day) && 
          completedDate <= endOfDay(day);
      }).length;
      remainingTasks -= completedOnDay;
      burndownData.push({
        date: format(day, 'MMM d'),
        remaining: Math.max(0, remainingTasks + completedOnDay),
        ideal: Math.max(0, tasks.length - (tasks.length / 30) * differenceInDays(day, thirtyDaysAgo))
      });
    });

    // Task status distribution
    const statusDistribution = [
      { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#94a3b8' },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
      { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#8b5cf6' },
      { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
      { name: 'Blocked', value: tasks.filter(t => t.status === 'blocked').length, color: '#ef4444' }
    ].filter(s => s.value > 0);

    // Priority distribution
    const priorityDistribution = [
      { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length, color: '#ef4444' },
      { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#f59e0b' },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#3b82f6' },
      { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10b981' }
    ].filter(p => p.value > 0);

    // Team performance
    const teamPerformance = teamMembers.map(member => {
      const memberTasks = tasks.filter(t => t.assignee_id === member.user_id);
      const memberCompleted = memberTasks.filter(t => t.status === 'completed');
      const memberTime = timeEntries.filter(te => te.user_id === member.user_id);
      const totalMinutes = memberTime.reduce((sum, te) => sum + (te.duration_minutes || 0), 0);
      const avgTaskTime = memberCompleted.length > 0 ? totalMinutes / memberCompleted.length : 0;

      return {
        name: member.display_name,
        id: member.user_id,
        avatar: member.avatar_url,
        assigned: memberTasks.length,
        completed: memberCompleted.length,
        inProgress: memberTasks.filter(t => t.status === 'in_progress').length,
        blocked: memberTasks.filter(t => t.status === 'blocked').length,
        completionRate: memberTasks.length > 0 ? Math.round((memberCompleted.length / memberTasks.length) * 100) : 0,
        totalTime: totalMinutes,
        avgTaskTime: Math.round(avgTaskTime)
      };
    });

    // Bottleneck detection
    const bottlenecks = [];
    
    // Tasks blocked for too long
    const blockedTasks = tasks.filter(t => t.status === 'blocked');
    if (blockedTasks.length > 0) {
      bottlenecks.push({
        type: 'blocked',
        severity: blockedTasks.length >= 3 ? 'high' : 'medium',
        title: `${blockedTasks.length} blocked task${blockedTasks.length > 1 ? 's' : ''}`,
        description: 'Tasks waiting on dependencies or external factors',
        tasks: blockedTasks.slice(0, 3)
      });
    }

    // Overdue tasks
    const overdueTasks = tasks.filter(t => {
      if (t.status === 'completed' || !t.due_date) return false;
      return new Date(t.due_date) < now;
    });
    if (overdueTasks.length > 0) {
      bottlenecks.push({
        type: 'overdue',
        severity: overdueTasks.length >= 5 ? 'high' : 'medium',
        title: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
        description: 'Tasks past their due date',
        tasks: overdueTasks.slice(0, 3)
      });
    }

    // Unassigned tasks
    const unassignedTasks = tasks.filter(t => !t.assignee_id && t.status !== 'completed');
    if (unassignedTasks.length > 0) {
      bottlenecks.push({
        type: 'unassigned',
        severity: unassignedTasks.length >= 5 ? 'medium' : 'low',
        title: `${unassignedTasks.length} unassigned task${unassignedTasks.length > 1 ? 's' : ''}`,
        description: 'Tasks without an owner',
        tasks: unassignedTasks.slice(0, 3)
      });
    }

    // Team member overload
    teamPerformance.forEach(member => {
      if (member.inProgress > 5) {
        bottlenecks.push({
          type: 'overload',
          severity: member.inProgress > 8 ? 'high' : 'medium',
          title: `${member.name} has ${member.inProgress} tasks in progress`,
          description: 'Consider redistributing workload'
        });
      }
    });

    // Sprint metrics
    const sprintTasks = tasks.filter(t => {
      const created = new Date(t.created_date);
      return created >= subDays(now, sprintLength);
    });
    const sprintCompleted = sprintTasks.filter(t => t.status === 'completed');
    const sprintVelocity = sprintCompleted.length;

    // Daily activity for the last 14 days
    const dailyActivity = eachDayOfInterval({ start: fourteenDaysAgo, end: now }).map(day => {
      const dayActivities = activities.filter(a => {
        const actDate = new Date(a.created_date);
        return actDate >= startOfDay(day) && actDate <= endOfDay(day);
      });
      const dayCompleted = completedTasks.filter(t => {
        const compDate = t.completed_at ? new Date(t.completed_at) : null;
        return compDate && compDate >= startOfDay(day) && compDate <= endOfDay(day);
      });
      return {
        date: format(day, 'MMM d'),
        activities: dayActivities.length,
        completed: dayCompleted.length
      };
    });

    // Time tracking by day
    const timeByDay = eachDayOfInterval({ start: fourteenDaysAgo, end: now }).map(day => {
      const dayEntries = timeEntries.filter(te => {
        const entryDate = new Date(te.start_time);
        return entryDate >= startOfDay(day) && entryDate <= endOfDay(day);
      });
      const totalMins = dayEntries.reduce((sum, te) => sum + (te.duration_minutes || 0), 0);
      return {
        date: format(day, 'MMM d'),
        hours: Math.round(totalMins / 60 * 10) / 10
      };
    });

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      overallProgress: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
      weeklyVelocity: Math.round(weeklyVelocity * 10) / 10,
      burndownData,
      statusDistribution,
      priorityDistribution,
      teamPerformance,
      bottlenecks,
      sprintVelocity,
      sprintTasks: sprintTasks.length,
      dailyActivity,
      timeByDay,
      totalTimeMinutes: timeEntries.reduce((sum, te) => sum + (te.duration_minutes || 0), 0),
      avgTasksPerMember: teamMembers.length > 0 ? Math.round(tasks.length / teamMembers.length) : 0
    };
  }, [tasks, timeEntries, activities, teamMembers, sprintLength]);

  const generateReport = async () => {
    setIsGenerating(true);
    
    // Build comprehensive report data
    const report = {
      project: {
        title: project.title,
        description: project.description,
        budget: project.budget,
        status: project.project_status,
        generatedAt: new Date().toISOString()
      },
      analytics,
      milestones: milestones.map(m => {
        const mTasks = tasks.filter(t => t.milestone_id === m.id);
        return {
          ...m,
          taskCount: mTasks.length,
          completedCount: mTasks.filter(t => t.status === 'completed').length,
          progress: mTasks.length > 0 ? Math.round((mTasks.filter(t => t.status === 'completed').length / mTasks.length) * 100) : 0
        };
      }),
      filters: { dateRange, selectedMembers }
    };

    setGeneratedReport(report);
    setIsGenerating(false);
  };

  const exportReport = async () => {
    if (!generatedReport) return;
    if (exportFormat === 'csv') {
      exportAsCSV();
    } else {
      exportAsPDF();
    }
  };

  const exportAsCSV = () => {
    let csv = '';
    csv += 'PROJECT ANALYTICS REPORT\n';
    csv += `Project,${project.title}\n`;
    csv += `Generated,${format(new Date(), 'PPpp')}\n\n`;

    csv += 'OVERVIEW\n';
    csv += 'Metric,Value\n';
    csv += `Total Tasks,${analytics.totalTasks}\n`;
    csv += `Completed,${analytics.completedTasks}\n`;
    csv += `Progress,${analytics.overallProgress}%\n`;
    csv += `Weekly Velocity,${analytics.weeklyVelocity} tasks/week\n`;
    csv += `Sprint Velocity (${sprintLength}d),${analytics.sprintVelocity} tasks\n\n`;

    csv += 'TASK STATUS\n';
    csv += 'Status,Count\n';
    analytics.statusDistribution.forEach(s => {
      csv += `${s.name},${s.value}\n`;
    });
    csv += '\n';

    csv += 'TEAM PERFORMANCE\n';
    csv += 'Member,Assigned,Completed,Rate,Time Logged\n';
    analytics.teamPerformance.forEach(tp => {
      csv += `"${tp.name}",${tp.assigned},${tp.completed},${tp.completionRate}%,${Math.floor(tp.totalTime / 60)}h ${tp.totalTime % 60}m\n`;
    });
    csv += '\n';

    csv += 'BOTTLENECKS\n';
    csv += 'Type,Severity,Title\n';
    analytics.bottlenecks.forEach(b => {
      csv += `${b.type},${b.severity},"${b.title}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/[^a-z0-9]/gi, '_')}_analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = () => {
    const htmlContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 900px; margin: auto; }
          h1 { color: #5b21b6; border-bottom: 3px solid #5b21b6; padding-bottom: 15px; }
          h2 { color: #374151; margin-top: 40px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
          h3 { color: #6b7280; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; border: 1px solid #e5e7eb; text-align: left; }
          th { background: #f3f4f6; font-weight: 600; }
          .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
          .stat-box { padding: 20px; background: #f9fafb; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
          .stat-value { font-size: 28px; font-weight: bold; color: #5b21b6; }
          .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
          .bottleneck { padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid; }
          .bottleneck.high { background: #fef2f2; border-color: #ef4444; }
          .bottleneck.medium { background: #fffbeb; border-color: #f59e0b; }
          .bottleneck.low { background: #f0fdf4; border-color: #10b981; }
          .progress-bar { background: #e5e7eb; border-radius: 4px; height: 10px; overflow: hidden; margin: 10px 0; }
          .progress-fill { background: #8b5cf6; height: 100%; }
        </style>
      </head>
      <body>
        <h1>📊 ${project.title} - Analytics Report</h1>
        <p><strong>Generated:</strong> ${format(new Date(), 'PPpp')}</p>
        <p><strong>Status:</strong> ${project.project_status || 'In Progress'}</p>

        <h2>📈 Key Metrics</h2>
        <div class="stat-grid">
          <div class="stat-box">
            <div class="stat-value">${analytics.overallProgress}%</div>
            <div class="stat-label">Overall Progress</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${analytics.totalTasks}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${analytics.weeklyVelocity}</div>
            <div class="stat-label">Tasks/Week</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${Math.floor(analytics.totalTimeMinutes / 60)}h</div>
            <div class="stat-label">Time Logged</div>
          </div>
        </div>

        <h2>📋 Task Status Distribution</h2>
        <table>
          <tr><th>Status</th><th>Count</th><th>Percentage</th></tr>
          ${analytics.statusDistribution.map(s => `
            <tr>
              <td>${s.name}</td>
              <td>${s.value}</td>
              <td>${analytics.totalTasks > 0 ? Math.round((s.value / analytics.totalTasks) * 100) : 0}%</td>
            </tr>
          `).join('')}
        </table>

        <h2>👥 Team Performance</h2>
        <table>
          <tr><th>Member</th><th>Assigned</th><th>Completed</th><th>Rate</th><th>Time</th></tr>
          ${analytics.teamPerformance.map(tp => `
            <tr>
              <td>${tp.name}</td>
              <td>${tp.assigned}</td>
              <td>${tp.completed}</td>
              <td>${tp.completionRate}%</td>
              <td>${Math.floor(tp.totalTime / 60)}h ${tp.totalTime % 60}m</td>
            </tr>
          `).join('')}
        </table>

        <h2>🎯 Milestones</h2>
        <table>
          <tr><th>Milestone</th><th>Status</th><th>Progress</th><th>Tasks</th></tr>
          ${milestones.map(m => {
            const mTasks = tasks.filter(t => t.milestone_id === m.id);
            const progress = mTasks.length > 0 ? Math.round((mTasks.filter(t => t.status === 'completed').length / mTasks.length) * 100) : 0;
            return `
              <tr>
                <td>${m.name}</td>
                <td>${m.status}</td>
                <td>${progress}%</td>
                <td>${mTasks.length}</td>
              </tr>
            `;
          }).join('')}
        </table>

        ${analytics.bottlenecks.length > 0 ? `
          <h2>⚠️ Bottlenecks & Risks</h2>
          ${analytics.bottlenecks.map(b => `
            <div class="bottleneck ${b.severity}">
              <strong>${b.title}</strong>
              <p style="margin: 5px 0 0 0; color: #6b7280;">${b.description}</p>
            </div>
          `).join('')}
        ` : ''}

        <h2>📅 Sprint Summary (Last ${sprintLength} Days)</h2>
        <div class="stat-grid">
          <div class="stat-box">
            <div class="stat-value">${analytics.sprintVelocity}</div>
            <div class="stat-label">Tasks Completed</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${analytics.sprintTasks}</div>
            <div class="stat-label">Tasks Created</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-500" />
            Project Analytics & Reports
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="mx-4 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="dashboard" className="gap-1">
              <PieChart className="w-4 h-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="burndown" className="gap-1">
              <LineChart className="w-4 h-4" /> Burndown
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-1">
              <Users className="w-4 h-4" /> Team
            </TabsTrigger>
            <TabsTrigger value="bottlenecks" className="gap-1">
              <AlertTriangle className="w-4 h-4" /> Bottlenecks
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-1">
              <Download className="w-4 h-4" /> Export
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[65vh] px-4 pb-4">
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-4 space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-violet-600">{analytics.overallProgress}%</div>
                    <div className="text-xs text-slate-500 mt-1">Overall Progress</div>
                    <Progress value={analytics.overallProgress} className="h-1.5 mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{analytics.weeklyVelocity}</div>
                    <div className="text-xs text-slate-500 mt-1">Tasks/Week</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-emerald-500 text-xs">
                      <TrendingUp className="w-3 h-3" /> Velocity
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-600">{analytics.completedTasks}</div>
                    <div className="text-xs text-slate-500 mt-1">Completed</div>
                    <div className="text-xs text-slate-400 mt-2">of {analytics.totalTasks} tasks</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-amber-600">
                      {Math.floor(analytics.totalTimeMinutes / 60)}h
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Time Logged</div>
                    <div className="text-xs text-slate-400 mt-2">{analytics.totalTimeMinutes % 60}m</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Status Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-violet-500" /> Task Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={analytics.statusDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {analytics.statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Priority Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" /> Priority Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.priorityDistribution} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={60} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {analytics.priorityDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Activity */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" /> Daily Activity (14 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="activities" stroke="#8b5cf6" fill="#8b5cf680" name="Activities" />
                        <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#10b98180" name="Completed" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Burndown Tab */}
            <TabsContent value="burndown" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Burndown Chart (30 Days)</h3>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Sprint Length:</Label>
                  <Select value={String(sprintLength)} onValueChange={(v) => setSprintLength(Number(v))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">1 Week</SelectItem>
                      <SelectItem value="14">2 Weeks</SelectItem>
                      <SelectItem value="21">3 Weeks</SelectItem>
                      <SelectItem value="30">1 Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLine data={analytics.burndownData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="remaining" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Remaining Tasks" />
                        <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1} dot={false} name="Ideal Burndown" />
                      </RechartsLine>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sprint Metrics */}
              <div className="grid md:grid-cols-3 gap-3">
                <Card className="bg-violet-50 dark:bg-violet-900/20 border-violet-200">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-6 h-6 mx-auto text-violet-500 mb-2" />
                    <div className="text-2xl font-bold text-violet-600">{analytics.sprintVelocity}</div>
                    <div className="text-xs text-slate-500">Sprint Velocity</div>
                    <div className="text-xs text-slate-400 mt-1">Last {sprintLength} days</div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <Target className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{analytics.sprintTasks}</div>
                    <div className="text-xs text-slate-500">Tasks Created</div>
                    <div className="text-xs text-slate-400 mt-1">This sprint</div>
                  </CardContent>
                </Card>
                <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200">
                  <CardContent className="p-4 text-center">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                    <div className="text-2xl font-bold text-emerald-600">
                      {analytics.sprintTasks > 0 ? Math.round((analytics.sprintVelocity / analytics.sprintTasks) * 100) : 0}%
                    </div>
                    <div className="text-xs text-slate-500">Sprint Completion</div>
                  </CardContent>
                </Card>
              </div>

              {/* Time Tracking by Day */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Timer className="w-4 h-4 text-amber-500" /> Time Logged by Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.timeByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} unit="h" />
                        <Tooltip formatter={(value) => [`${value}h`, 'Hours']} />
                        <Bar dataKey="hours" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="mt-4 space-y-4">
              <h3 className="font-medium">Team Performance Analysis</h3>

              {/* Team Overview */}
              <div className="grid md:grid-cols-2 gap-4">
                {analytics.teamPerformance.map((member, idx) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                          {member.name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-slate-500">{member.assigned} tasks assigned</div>
                        </div>
                        <Badge className={member.completionRate >= 70 ? 'bg-emerald-100 text-emerald-700' : member.completionRate >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}>
                          {member.completionRate}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="font-bold text-emerald-600">{member.completed}</div>
                          <div className="text-slate-500">Done</div>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="font-bold text-blue-600">{member.inProgress}</div>
                          <div className="text-slate-500">Active</div>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="font-bold text-red-600">{member.blocked}</div>
                          <div className="text-slate-500">Blocked</div>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="font-bold text-amber-600">{Math.floor(member.totalTime / 60)}h</div>
                          <div className="text-slate-500">Time</div>
                        </div>
                      </div>

                      <Progress value={member.completionRate} className="h-1.5 mt-3" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Team Comparison Chart */}
              {analytics.teamPerformance.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-violet-500" /> Task Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.teamPerformance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" fill="#10b981" name="Completed" stackId="a" />
                          <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" stackId="a" />
                          <Bar dataKey="blocked" fill="#ef4444" name="Blocked" stackId="a" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Bottlenecks Tab */}
            <TabsContent value="bottlenecks" className="mt-4 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" /> Risk Assessment & Bottlenecks
              </h3>

              {analytics.bottlenecks.length === 0 ? (
                <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <h4 className="font-medium text-emerald-700">No Critical Bottlenecks Detected</h4>
                    <p className="text-sm text-emerald-600 mt-1">Project is progressing smoothly</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {analytics.bottlenecks.map((bottleneck, idx) => (
                    <Card 
                      key={idx} 
                      className={
                        bottleneck.severity === 'high' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' :
                        bottleneck.severity === 'medium' ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20' :
                        'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20'
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            bottleneck.severity === 'high' ? 'bg-red-100 text-red-600' :
                            bottleneck.severity === 'medium' ? 'bg-amber-100 text-amber-600' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            {bottleneck.type === 'blocked' && <AlertCircle className="w-5 h-5" />}
                            {bottleneck.type === 'overdue' && <Clock className="w-5 h-5" />}
                            {bottleneck.type === 'unassigned' && <Users className="w-5 h-5" />}
                            {bottleneck.type === 'overload' && <Flame className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{bottleneck.title}</h4>
                              <Badge className={
                                bottleneck.severity === 'high' ? 'bg-red-500 text-white' :
                                bottleneck.severity === 'medium' ? 'bg-amber-500 text-white' :
                                'bg-emerald-500 text-white'
                              }>
                                {bottleneck.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {bottleneck.description}
                            </p>
                            {bottleneck.tasks && bottleneck.tasks.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {bottleneck.tasks.map((task, tIdx) => (
                                  <div key={tIdx} className="text-xs flex items-center gap-2 text-slate-500">
                                    <ArrowRight className="w-3 h-3" />
                                    {task.title}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Risk Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Risk Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {analytics.bottlenecks.filter(b => b.severity === 'high').length}
                      </div>
                      <div className="text-xs text-slate-500">High Risk</div>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">
                        {analytics.bottlenecks.filter(b => b.severity === 'medium').length}
                      </div>
                      <div className="text-xs text-slate-500">Medium Risk</div>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">
                        {analytics.bottlenecks.filter(b => b.severity === 'low').length}
                      </div>
                      <div className="text-xs text-slate-500">Low Risk</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="mt-4 space-y-4">
              <h3 className="font-medium">Generate & Export Report</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Report Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Report Type</Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Analytics Report</SelectItem>
                          <SelectItem value="sprint">Sprint Report</SelectItem>
                          <SelectItem value="team">Team Performance</SelectItem>
                          <SelectItem value="progress">Progress Summary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Date Range (Optional)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                        <Input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Export Format</Label>
                      <Select value={exportFormat} onValueChange={setExportFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {teamMembers.length > 0 && (
                      <div className="space-y-2">
                        <Label>Filter by Team Member</Label>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                          {teamMembers.map((member) => (
                            <div key={member.id} className="flex items-center gap-2">
                              <Checkbox
                                id={member.id}
                                checked={selectedMembers.includes(member.user_id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMembers([...selectedMembers, member.user_id]);
                                  } else {
                                    setSelectedMembers(selectedMembers.filter(id => id !== member.user_id));
                                  }
                                }}
                              />
                              <Label htmlFor={member.id} className="text-sm cursor-pointer">
                                {member.display_name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Report Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                        <div className="text-xl font-bold text-violet-600">{analytics.overallProgress}%</div>
                        <div className="text-xs text-slate-500">Progress</div>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">{analytics.totalTasks}</div>
                        <div className="text-xs text-slate-500">Tasks</div>
                      </div>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <div className="text-xl font-bold text-emerald-600">{milestones.length}</div>
                        <div className="text-xs text-slate-500">Milestones</div>
                      </div>
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <div className="text-xl font-bold text-amber-600">
                          {Math.floor(analytics.totalTimeMinutes / 60)}h
                        </div>
                        <div className="text-xs text-slate-500">Time</div>
                      </div>
                    </div>

                    {generatedReport && (
                      <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Report Ready</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                {!generatedReport ? (
                  <Button 
                    onClick={generateReport} 
                    disabled={isGenerating}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={exportReport}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export {exportFormat.toUpperCase()}
                  </Button>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}