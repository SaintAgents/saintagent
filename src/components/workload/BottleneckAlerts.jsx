import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle, ArrowRight, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function BottleneckAlerts({ members }) {
  const issues = [];

  members.forEach(m => {
    if (m.workload.level === 'overloaded') {
      issues.push({
        type: 'overloaded',
        severity: 'critical',
        member: m,
        message: `${m.name} has ${m.activeTasks} active tasks — severely over capacity`,
      });
    }
    if (m.blockedTasks > 0) {
      issues.push({
        type: 'blocked',
        severity: 'warning',
        member: m,
        message: `${m.name} has ${m.blockedTasks} blocked task${m.blockedTasks > 1 ? 's' : ''} requiring attention`,
      });
    }
    if (m.urgentTasks >= 3) {
      issues.push({
        type: 'urgent_pile',
        severity: 'warning',
        member: m,
        message: `${m.name} has ${m.urgentTasks} urgent tasks stacked up`,
      });
    }
    if (m.projects.length >= 4 && m.activeTasks > 5) {
      issues.push({
        type: 'spread_thin',
        severity: 'info',
        member: m,
        message: `${m.name} is spread across ${m.projects.length} projects with ${m.activeTasks} tasks`,
      });
    }
  });

  // Sort by severity
  const order = { critical: 0, warning: 1, info: 2 };
  issues.sort((a, b) => order[a.severity] - order[b.severity]);

  if (issues.length === 0) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-emerald-700 font-medium">No bottlenecks detected — workloads are balanced</p>
        </CardContent>
      </Card>
    );
  }

  const severityConfig = {
    critical: { bg: 'bg-red-50 border-red-200', icon: 'text-red-500', badge: 'bg-red-100 text-red-700' },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
    info: { bg: 'bg-blue-50 border-blue-200', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Bottleneck Alerts ({issues.length})
        </CardTitle>
        <Link to="/ResourceScheduler">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            Open Scheduler
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {issues.slice(0, 8).map((issue, i) => {
          const config = severityConfig[issue.severity];
          return (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${config.bg}`}>
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src={issue.member.avatar} />
                <AvatarFallback className="text-[9px]">{issue.member.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              {issue.type === 'overloaded' && <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${config.icon}`} />}
              {issue.type === 'blocked' && <Clock className={`w-4 h-4 flex-shrink-0 ${config.icon}`} />}
              {issue.type === 'urgent_pile' && <Zap className={`w-4 h-4 flex-shrink-0 ${config.icon}`} />}
              {issue.type === 'spread_thin' && <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${config.icon}`} />}
              <p className="text-xs text-slate-700 flex-1">{issue.message}</p>
              <Badge className={`text-[10px] ${config.badge}`}>
                {issue.severity}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}