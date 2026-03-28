import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Users, Megaphone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProjectCardFooter({ project }) {
  const teamIds = project.team_member_ids || [];
  const teamCount = teamIds.length + (project.owner_id ? 1 : 0);

  const { data: discussions = [] } = useQuery({
    queryKey: ['projectDiscCount', project.id],
    queryFn: () => base44.entities.ProjectDiscussion.filter({ project_id: project.id }, '-created_date', 100),
    enabled: !!project.id,
    staleTime: 600000,
  });

  const { data: updates = [] } = useQuery({
    queryKey: ['projectUpdCount', project.id],
    queryFn: () => base44.entities.ProjectUpdate.filter({ project_id: project.id }, '-created_date', 100),
    enabled: !!project.id,
    staleTime: 600000,
  });

  const activeDiscussions = discussions.filter(d => !d.is_resolved).length;
  const blockers = discussions.filter(d => d.discussion_type === 'blocker' && !d.is_resolved).length;

  return (
    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
      <div className="flex items-center gap-3 text-xs text-slate-500">
        {discussions.length > 0 && (
          <span className="flex items-center gap-1" title={`${activeDiscussions} active discussions`}>
            <MessageSquare className="w-3 h-3" />
            {discussions.length}
            {blockers > 0 && (
              <span className="text-red-500 font-semibold">({blockers} blocker{blockers > 1 ? 's' : ''})</span>
            )}
          </span>
        )}
        {updates.length > 0 && (
          <span className="flex items-center gap-1" title={`${updates.length} updates`}>
            <Megaphone className="w-3 h-3" />
            {updates.length}
          </span>
        )}
        {teamCount > 0 && (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {teamCount}
          </span>
        )}
      </div>
      {/* Team avatar stack */}
      {teamCount > 0 && (
        <div className="flex items-center -space-x-1.5">
          {project.owner_avatar && (
            <Avatar className="w-5 h-5 border border-white">
              <AvatarImage src={project.owner_avatar} />
              <AvatarFallback className="text-[8px] bg-violet-200">{project.owner_name?.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          {teamIds.slice(0, 3).map((_, i) => (
            <Avatar key={i} className="w-5 h-5 border border-white">
              <AvatarFallback className="text-[8px] bg-slate-200">{String.fromCharCode(65 + i)}</AvatarFallback>
            </Avatar>
          ))}
          {teamIds.length > 3 && (
            <div className="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[8px] text-slate-600">
              +{teamIds.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}