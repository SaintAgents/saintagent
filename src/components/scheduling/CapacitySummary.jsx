import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Users, CheckCircle2, Clock, Zap } from 'lucide-react';

export default function CapacitySummary({ members, tasksByMember, maxCapacity }) {
  const overloaded = members.filter(m => (tasksByMember[m.user_id]?.length || 0) > maxCapacity);
  const idle = members.filter(m => (tasksByMember[m.user_id]?.length || 0) === 0);
  const totalTasks = Object.values(tasksByMember).reduce((sum, tasks) => sum + tasks.length, 0);
  const unassigned = tasksByMember['unassigned']?.length || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Card className="border-slate-200">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{members.length}</p>
            <p className="text-[10px] text-slate-500">Team Members</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-slate-200">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{totalTasks}</p>
            <p className="text-[10px] text-slate-500">Active Tasks</p>
          </div>
        </CardContent>
      </Card>
      <Card className={`${overloaded.length > 0 ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}>
        <CardContent className="p-3 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${overloaded.length > 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
            <AlertTriangle className={`w-4 h-4 ${overloaded.length > 0 ? 'text-red-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{overloaded.length}</p>
            <p className="text-[10px] text-slate-500">Overloaded</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-slate-200">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{idle.length}</p>
            <p className="text-[10px] text-slate-500">Idle Members</p>
          </div>
        </CardContent>
      </Card>
      <Card className={`${unassigned > 0 ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200'}`}>
        <CardContent className="p-3 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${unassigned > 0 ? 'bg-amber-100' : 'bg-slate-100'}`}>
            <Clock className={`w-4 h-4 ${unassigned > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{unassigned}</p>
            <p className="text-[10px] text-slate-500">Unassigned</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}