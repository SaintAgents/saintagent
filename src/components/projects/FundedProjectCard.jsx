import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, Users, Target, Clock, CheckCircle2, 
  AlertCircle, Pause, Play
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  planned: { label: 'Planned', color: 'bg-slate-500', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-500', icon: Play },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle2 },
  on_hold: { label: 'On Hold', color: 'bg-amber-500', icon: Pause },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: AlertCircle }
};

export default function FundedProjectCard({ project, onClick }) {
  const status = STATUS_CONFIG[project.project_status] || STATUS_CONFIG.planned;
  const StatusIcon = status.icon;
  
  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(0)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <Card 
      className="cursor-pointer hover:border-violet-500/50 dark:hover:border-cyan-500/50 transition-all group bg-white dark:bg-slate-900/50"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge className={`${status.color} text-white text-[10px]`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(project.budget)}
          </span>
        </div>
        
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-cyan-400 transition-colors">
          {project.title}
        </h3>
        
        {project.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {project.description}
          </p>
        )}
        
        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500 dark:text-slate-400">Progress</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {project.progress_percent || 0}%
            </span>
          </div>
          <Progress value={project.progress_percent || 0} className="h-1.5" />
        </div>
        
        {/* Meta */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              <AvatarImage src={project.owner_avatar} />
              <AvatarFallback className="text-[8px]">
                {project.owner_name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] text-slate-500">{project.owner_name?.split(' ')[0]}</span>
          </div>
          
          <div className="flex items-center gap-3 text-slate-400">
            {project.team_member_ids?.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span className="text-[10px]">{project.team_member_ids.length}</span>
              </div>
            )}
            {project.end_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="text-[10px]">{format(new Date(project.end_date), 'MMM d')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}