import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  FileText, Video, Music, FolderOpen, Clock, Users, 
  Eye, Edit3, Trash2, MoreVertical, ExternalLink 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { createPageUrl } from '@/utils';

const CONTENT_TYPE_CONFIG = {
  article: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
  video: { icon: Video, color: 'text-purple-600', bg: 'bg-purple-100' },
  audio: { icon: Music, color: 'text-amber-600', bg: 'bg-amber-100' },
  mixed: { icon: FolderOpen, color: 'text-emerald-600', bg: 'bg-emerald-100' }
};

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  review: { label: 'Review', color: 'bg-amber-100 text-amber-700' },
  published: { label: 'Published', color: 'bg-emerald-100 text-emerald-700' },
  archived: { label: 'Archived', color: 'bg-slate-100 text-slate-500' }
};

export default function ContentProjectCard({ project, viewMode, onDelete, isOwner }) {
  const typeConfig = CONTENT_TYPE_CONFIG[project.content_type] || CONTENT_TYPE_CONFIG.article;
  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft;
  const TypeIcon = typeConfig.icon;

  const handleOpen = () => {
    window.location.href = createPageUrl('ContentEditor') + `?id=${project.id}`;
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${typeConfig.bg}`}>
              <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 truncate">{project.title}</h3>
                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              </div>
              <p className="text-sm text-slate-500 truncate">{project.description || 'No description'}</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(parseISO(project.updated_date), 'MMM d')}
              </div>
              {project.collaborator_ids?.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {project.collaborator_ids.length}
                </div>
              )}
              <div className="flex items-center gap-1">
                v{project.current_version}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleOpen}>
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleOpen}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {project.status === 'published' && (
                    <DropdownMenuItem>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Published
                    </DropdownMenuItem>
                  )}
                  {isOwner && (
                    <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all cursor-pointer" onClick={handleOpen}>
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className={`h-32 ${typeConfig.bg} flex items-center justify-center relative`}>
          {project.thumbnail_url ? (
            <img 
              src={project.thumbnail_url} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <TypeIcon className={`w-12 h-12 ${typeConfig.color} opacity-50`} />
          )}
          <Badge className={`absolute top-3 right-3 ${statusConfig.color}`}>
            {statusConfig.label}
          </Badge>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1 group-hover:text-violet-600 transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">
            {project.description || 'No description'}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={project.owner_avatar} />
                <AvatarFallback className="text-xs">{project.owner_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              {project.collaborator_ids?.length > 0 && (
                <span className="text-xs text-slate-500">
                  +{project.collaborator_ids.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(parseISO(project.updated_date), 'MMM d')}
              </span>
              <span>v{project.current_version}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}