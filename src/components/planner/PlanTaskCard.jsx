import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Sparkles, Clock } from 'lucide-react';

const SOURCE_ICONS = {
  calendar: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  email: { icon: Mail, color: 'text-amber-600', bg: 'bg-amber-50' },
  suggested: { icon: Sparkles, color: 'text-violet-600', bg: 'bg-violet-50' }
};

export default function PlanTaskCard({ task, priority }) {
  const source = SOURCE_ICONS[task.source] || SOURCE_ICONS.suggested;
  const Icon = source.icon;

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-400',
    low: 'border-l-blue-300'
  };

  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${priorityColors[priority]} rounded-r-lg p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className={`${source.bg} p-2 rounded-lg shrink-0`}>
          <Icon className={`w-4 h-4 ${source.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 text-sm">{task.task}</p>
          <p className="text-xs text-slate-500 mt-1">{task.reason}</p>
          {task.time && (
            <div className="flex items-center gap-1 mt-2">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">{task.time}</span>
            </div>
          )}
        </div>
        <Badge variant="outline" className="text-xs capitalize shrink-0">{task.source}</Badge>
      </div>
    </div>
  );
}