import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Eye } from 'lucide-react';
import moment from 'moment';

// Helper to extract YouTube thumbnail from URL
function getYouTubeThumbnail(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return null;
}

export default function VideoCard({ video, onClick, compact = false }) {
  const [imgError, setImgError] = React.useState(false);

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

  // Use thumbnail_url, fallback to YouTube auto-thumbnail, then fallback to placeholder
  const thumbnailSrc = (!imgError && video.thumbnail_url) 
    ? video.thumbnail_url 
    : (!imgError && getYouTubeThumbnail(video.video_url))
    ? getYouTubeThumbnail(video.video_url)
    : null;

  if (compact) {
    return (
      <div onClick={onClick} className="group cursor-pointer flex gap-3 items-start">
        <div className="relative w-28 shrink-0 aspect-video rounded-lg overflow-hidden bg-slate-100">
          {thumbnailSrc ? (
            <img 
              src={thumbnailSrc} 
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
              <Play className="w-6 h-6 text-red-400" />
            </div>
          )}
          {video.duration_seconds > 0 && (
            <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 rounded text-white text-[10px] font-medium">
              {formatDuration(video.duration_seconds)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 line-clamp-2 text-sm leading-snug group-hover:text-red-600 transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{video.uploader_name}</p>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{moment(video.created_date).fromNow()}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
        {thumbnailSrc ? (
          <img 
            src={thumbnailSrc} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
            <Play className="w-12 h-12 text-red-400" />
          </div>
        )}
        
        {/* Duration Badge */}
        {video.duration_seconds > 0 && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-white text-xs font-medium">
            {formatDuration(video.duration_seconds)}
          </div>
        )}

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