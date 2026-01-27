import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Eye } from 'lucide-react';
import moment from 'moment';

export default function VideoCard({ video, onClick }) {
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (!views) return '0 views';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
        {video.thumbnail_url ? (
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <Play className="w-12 h-12 text-slate-400" />
          </div>
        )}
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-white text-xs font-medium">
          {formatDuration(video.duration_seconds)}
        </div>

        {/* Hover Play Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center">
            <Play className="w-7 h-7 text-white ml-1" fill="white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex gap-3">
        <Avatar className="w-9 h-9 shrink-0" data-user-id={video.uploader_id}>
          <AvatarImage src={video.uploader_avatar} />
          <AvatarFallback className="text-xs">{video.uploader_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 line-clamp-2 text-sm leading-snug group-hover:text-red-600 transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 hover:text-slate-700">
            {video.uploader_name}
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{moment(video.created_date).fromNow()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}