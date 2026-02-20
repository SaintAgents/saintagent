import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, Download, Calendar, Users, BarChart3, Clock, Target, 
  CheckCircle2, AlertTriangle, Loader2 
} from 'lucide-react';
import { format, parseISO, isWithinInterval, differenceInDays } from 'date-fns';

export default function ProjectReportGenerator({ project, onClose }) {
  const [reportType, setReportType] = useState('progress');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

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

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200)
  });

  const teamMemberIds = project.team_member_ids || [];
  const teamMembers = allProfiles.filter(p => teamMemberIds.includes(p.user_id));

  const filterByDateRange = (items, dateField) => {
    if (!dateRange.start && !dateRange.end) return items;
    return items.filter(item => {
      const itemDate = item[dateField] ? new Date(item[dateField]) : null;
      if (!itemDate) return true;
      const start = dateRange.start ? new Date(dateRange.start) : new Date('1970-01-01');
      const end = dateRange.end ? new Date(dateRange.end) : new Date('2100-01-01');
      return isWithinInterval(itemDate, { start, end });
    });
  };

  const filterByMember = (items) => {
    if (selectedMembers.length === 0) return items;
    return items.filter(item => selectedMembers.includes(item.assignee_id || item.user_id));
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    const filteredTasks = filterByMember(filterByDateRange(tasks, 'created_date'));
    const filteredTimeEntries = filterByMember(filterByDateRange(timeEntries, 'start_time'));
    
    const report = {
      project: {
        title: project.title,
        description: project.description,
        budget: project.budget,
        status: project.project_status,
        generatedAt: new Date().toISOString()
      },
      progress: {
        overall: tasks.length > 0 
          ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) 
          : 0,
        totalTasks: filteredTasks.length,
        completedTasks: filteredTasks.filter(t => t.status === 'completed').length,
        inProgressTasks: filteredTasks.filter(t => t.status === 'in_progress').length,
        blockedTasks: filteredTasks.filter(t => t.status === 'blocked').length,
        todoTasks: filteredTasks.filter(t => t.status === 'todo').length
      },
      milestones: {
        total: milestones.length,
        completed: milestones.filter(m => m.status === 'completed').length,
        inProgress: milestones.filter(m => m.status === 'in_progress').length,
        details: milestones.map(m => {
          const mTasks = filteredTasks.filter(t => t.milestone_id === m.id);
          return {
            name: m.name,
            status: m.status,
            progress: mTasks.length > 0 
              ? Math.round((mTasks.filter(t => t.status === 'completed').length / mTasks.length) * 100)
              : 0,
            taskCount: mTasks.length,
            startDate: m.start_date,
            endDate: m.end_date
          };
        })
      },
      teamPerformance: teamMembers.map(member => {
        const memberTasks = filteredTasks.filter(t => t.assignee_id === member.user_id);
        const memberTime = filteredTimeEntries.filter(te => te.user_id === member.user_id);
        const totalMinutes = memberTime.reduce((sum, te) => sum + (te.duration_minutes || 0), 0);
        
        return {
          name: member.display_name,
          userId: member.user_id,
          tasksAssigned: memberTasks.length,
          tasksCompleted: memberTasks.filter(t => t.status === 'completed').length,
          completionRate: memberTasks.length > 0 
            ? Math.round((memberTasks.filter(t => t.status === 'completed').length / memberTasks.length) * 100)
            : 0,
          totalTimeLogged: totalMinutes,
          timeLoggedFormatted: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
        };
      }),
      timeTracking: {
        totalMinutes: filteredTimeEntries.reduce((sum, te) => sum + (te.duration_minutes || 0), 0),
        entriesCount: filteredTimeEntries.length,
        byTask: Object.entries(
          filteredTimeEntries.reduce((acc, te) => {
            const task = tasks.find(t => t.id === te.task_id);
            const key = te.task_id;
            if (!acc[key]) acc[key] = { taskTitle: task?.title || 'Unknown', minutes: 0 };
            acc[key].minutes += te.duration_minutes || 0;
            return acc;
          }, {})
        ).map(([taskId, data]) => ({ taskId, ...data }))
      },
      filters: {
        dateRange: dateRange.start || dateRange.end ? dateRange : null,
        selectedMembers: selectedMembers.length > 0 ? selectedMembers : null
      }
    };

    setGeneratedReport(report);
    setIsGenerating(false);
  };

  const exportReport = async () => {
    if (!generatedReport) return;

    if (exportFormat === 'csv') {
      exportAsCSV(generatedReport);
    } else {
      exportAsPDF(generatedReport);
    }
  };

  const exportAsCSV = (report) => {
    let csv = '';
    
    // Project Summary
    csv += 'PROJECT SUMMARY\n';
    csv += `Title,${report.project.title}\n`;
    csv += `Status,${report.project.status}\n`;
    csv += `Overall Progress,${report.progress.overall}%\n`;
    csv += `Generated,${format(new Date(report.project.generatedAt), 'PPpp')}\n\n`;

    // Task Status
    csv += 'TASK STATUS\n';
    csv += 'Status,Count\n';
    csv += `Completed,${report.progress.completedTasks}\n`;
    csv += `In Progress,${report.progress.inProgressTasks}\n`;
    csv += `Blocked,${report.progress.blockedTasks}\n`;
    csv += `To Do,${report.progress.todoTasks}\n\n`;

    // Milestones
    csv += 'MILESTONES\n';
    csv += 'Name,Status,Progress,Tasks,Start Date,End Date\n';
    report.milestones.details.forEach(m => {
      csv += `"${m.name}",${m.status},${m.progress}%,${m.taskCount},${m.startDate || ''},${m.endDate || ''}\n`;
    });
    csv += '\n';

    // Team Performance
    csv += 'TEAM PERFORMANCE\n';
    csv += 'Name,Tasks Assigned,Tasks Completed,Completion Rate,Time Logged\n';
    report.teamPerformance.forEach(tp => {
      csv += `"${tp.name}",${tp.tasksAssigned},${tp.tasksCompleted},${tp.completionRate}%,${tp.timeLoggedFormatted}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/[^a-z0-9]/gi, '_')}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = async (report) => {
    // Generate HTML content for PDF
    const htmlContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #5b21b6; border-bottom: 2px solid #5b21b6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 8px 12px; border: 1px solid #e5e7eb; text-align: left; }
          th { background: #f3f4f6; font-weight: 600; }
          .stat-box { display: inline-block; padding: 15px; background: #f9fafb; border-radius: 8px; margin: 5px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #5b21b6; }
          .stat-label { font-size: 12px; color: #6b7280; }
          .progress-bar { background: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden; }
          .progress-fill { background: #8b5cf6; height: 100%; }
        </style>
      </head>
      <body>
        <h1>${report.project.title} - Project Report</h1>
        <p>Generated: ${format(new Date(report.project.generatedAt), 'PPpp')}</p>
        
        <h2>Overview</h2>
        <div>
          <div class="stat-box">
            <div class="stat-value">${report.progress.overall}%</div>
            <div class="stat-label">Overall Progress</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${report.progress.totalTasks}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${report.milestones.total}</div>
            <div class="stat-label">Milestones</div>
          </div>
        </div>

        <h2>Task Status</h2>
        <table>
          <tr><th>Status</th><th>Count</th></tr>
          <tr><td>Completed</td><td>${report.progress.completedTasks}</td></tr>
          <tr><td>In Progress</td><td>${report.progress.inProgressTasks}</td></tr>
          <tr><td>Blocked</td><td>${report.progress.blockedTasks}</td></tr>
          <tr><td>To Do</td><td>${report.progress.todoTasks}</td></tr>
        </table>

        <h2>Milestones</h2>
        <table>
          <tr><th>Name</th><th>Status</th><th>Progress</th><th>Tasks</th></tr>
          ${report.milestones.details.map(m => `
            <tr>
              <td>${m.name}</td>
              <td>${m.status}</td>
              <td>${m.progress}%</td>
              <td>${m.taskCount}</td>
            </tr>
          `).join('')}
        </table>

        <h2>Team Performance</h2>
        <table>
          <tr><th>Member</th><th>Assigned</th><th>Completed</th><th>Rate</th><th>Time</th></tr>
          ${report.teamPerformance.map(tp => `
            <tr>
              <td>${tp.name}</td>
              <td>${tp.tasksAssigned}</td>
              <td>${tp.tasksCompleted}</td>
              <td>${tp.completionRate}%</td>
              <td>${tp.timeLoggedFormatted}</td>
            </tr>
          `).join('')}
        </table>

        <h2>Time Tracking Summary</h2>
        <p>Total time logged: <strong>${Math.floor(report.timeTracking.totalMinutes / 60)}h ${report.timeTracking.totalMinutes % 60}m</strong></p>
      </body>
      </html>
    `;

    // Create PDF using browser print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const totalTimeMinutes = timeEntries.reduce((sum, te) => sum + (te.duration_minutes || 0), 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-500" />
            Generate Project Report
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" /> Progress Report
                    </div>
                  </SelectItem>
                  <SelectItem value="team">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" /> Team Performance
                    </div>
                  </SelectItem>
                  <SelectItem value="time">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Time Tracking
                    </div>
                  </SelectItem>
                  <SelectItem value="full">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Full Report
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date Range (Optional)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  placeholder="Start date"
                />
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  placeholder="End date"
                />
              </div>
            </div>

            {/* Team Member Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Filter by Team Member (Optional)
              </Label>
              <div className="grid grid-cols-2 gap-2">
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

            {/* Export Format */}
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

            {/* Quick Stats Preview */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 text-sm">Preview Summary</h4>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <div className="text-xl font-bold text-violet-600">
                      {tasks.length > 0 
                        ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-slate-500">Progress</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{tasks.length}</div>
                    <div className="text-xs text-slate-500">Tasks</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{milestones.length}</div>
                    <div className="text-xs text-slate-500">Milestones</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      {Math.floor(totalTimeMinutes / 60)}h
                    </div>
                    <div className="text-xs text-slate-500">Time Logged</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Report Preview */}
            {generatedReport && (
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium text-sm">Report Generated</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Click "Export" to download as {exportFormat.toUpperCase()}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
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
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export {exportFormat.toUpperCase()}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}