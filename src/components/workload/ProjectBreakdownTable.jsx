import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle, Folder } from 'lucide-react';

export default function ProjectBreakdownTable({ members, projects, tasks }) {
  if (!projects.length || !members.length) return null;

  // Build matrix: member x project -> task count
  const matrix = {};
  members.forEach(m => { matrix[m.id] = {}; });
  tasks.forEach(t => {
    if (!t.assignee_id || t.status === 'completed') return;
    if (!matrix[t.assignee_id]) return;
    const pid = t.project_id || 'none';
    matrix[t.assignee_id][pid] = (matrix[t.assignee_id][pid] || 0) + 1;
  });

  // Only show projects that have active tasks
  const activeProjectIds = [...new Set(tasks.filter(t => t.status !== 'completed' && t.project_id).map(t => t.project_id))];
  const visibleProjects = projects.filter(p => activeProjectIds.includes(p.id)).slice(0, 10);

  if (!visibleProjects.length) return null;

  const getCellColor = (count) => {
    if (!count || count === 0) return 'bg-slate-50 text-slate-300';
    if (count <= 2) return 'bg-emerald-100 text-emerald-700';
    if (count <= 4) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <Folder className="w-4 h-4" />
          Task Distribution: Members × Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 sticky left-0 bg-white min-w-[160px]">Member</th>
              {visibleProjects.map(p => (
                <th key={p.id} className="text-center py-2 px-2 text-xs font-medium text-slate-500 max-w-[100px]">
                  <span className="block truncate" title={p.title}>{p.title}</span>
                </th>
              ))}
              <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => {
              const memberTotal = member.activeTasks;
              const isOverloaded = member.workload.level === 'overloaded' || member.workload.level === 'high';
              return (
                <tr key={member.id} className={`border-b border-slate-50 ${isOverloaded ? 'bg-red-50/30' : ''}`}>
                  <td className="py-2 px-3 sticky left-0 bg-white">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-[9px] bg-violet-100 text-violet-600">
                          {member.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-slate-700 truncate max-w-[100px]">{member.name}</span>
                      {isOverloaded && <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />}
                    </div>
                  </td>
                  {visibleProjects.map(p => {
                    const count = matrix[member.id]?.[p.id] || 0;
                    return (
                      <td key={p.id} className="py-2 px-2 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold ${getCellColor(count)}`}>
                          {count || '·'}
                        </span>
                      </td>
                    );
                  })}
                  <td className="py-2 px-3 text-center">
                    <Badge className={`text-xs ${member.workload.color}`}>
                      {memberTotal}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}