import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Megaphone, TrendingUp, Flag, Users, Rocket, 
  AlertCircle, Heart, MessageCircle, Folder
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const UPDATE_TYPE_CONFIG = {
  progress: { label: 'Progress', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
  milestone: { label: 'Milestone', icon: Flag, color: 'bg-emerald-100 text-emerald-700' },
  announcement: { label: 'Announcement', icon: Megaphone, color: 'bg-violet-100 text-violet-700' },
  blocker_resolved: { label: 'Blocker Resolved', icon: AlertCircle, color: 'bg-amber-100 text-amber-700' },
  team_change: { label: 'Team Update', icon: Users, color: 'bg-pink-100 text-pink-700' },
  launch: { label: 'Launch', icon: Rocket, color: 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' },
};

export default function ProjectUpdatesFeed({ limit = 5, showProjectLink = true }) {
  const { data: updates = [], isLoading } = useQuery({
    queryKey: ['projectUpdates', 'feed', limit],
    queryFn: () => base44.entities.ProjectUpdate.filter({ shared_to_feed: true }, '-created_date', limit)
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-6">
        <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No project updates yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {updates.map((update) => {
        const typeConfig = UPDATE_TYPE_CONFIG[update.update_type] || UPDATE_TYPE_CONFIG.progress;
        const TypeIcon = typeConfig.icon;

        return (
          <div 
            key={update.id}
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-violet-200 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <Avatar className="w-9 h-9" data-user-id={update.author_id}>
                <AvatarImage src={update.author_avatar} />
                <AvatarFallback>{update.author_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-900">{update.author_name}</span>
                  <Badge className={cn("text-[10px] h-5", typeConfig.color)}>
                    <TypeIcon className="w-3 h-3 mr-1" />
                    {typeConfig.label}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {format(parseISO(update.created_date), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>

            {/* Project Link */}
            {showProjectLink && update.project_title && (
              <Link 
                to={createPageUrl(`Projects?id=${update.project_id}`)}
                className="flex items-center gap-1.5 mt-2 text-xs text-violet-600 hover:text-violet-700"
              >
                <Folder className="w-3.5 h-3.5" />
                {update.project_title}
              </Link>
            )}

            {/* Content */}
            <div className="mt-2">
              <h4 className="text-sm font-semibold text-slate-900">{update.title}</h4>
              {update.content && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{update.content}</p>
              )}
            </div>

            {/* Progress Bar */}
            {update.progress_percentage != null && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-medium text-violet-600">{update.progress_percentage}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${update.progress_percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Milestone */}
            {update.milestone_name && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700">
                <Flag className="w-3.5 h-3.5" />
                {update.milestone_name}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mt-3 pt-2 border-t">
              <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors">
                <Heart className="w-3.5 h-3.5" />
                <span>{update.likes_count || 0}</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition-colors">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{update.comments_count || 0}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}