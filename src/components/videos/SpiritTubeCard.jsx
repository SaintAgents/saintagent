import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Eye, Clock, ArrowRight, Video, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function SpiritTubeCard() {
  // Fetch recent videos
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['recentVideos'],
    queryFn: () => base44.entities.Video.list('-created_date', 4),
    staleTime: 300000
  });

  const totalViews = videos.reduce((sum, v) => sum + (v.view_count || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-violet-600">
            <Video className="w-4 h-4" />
            {videos.length} videos
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Eye className="w-4 h-4" />
            {totalViews} views
          </span>
        </div>
        <Badge className="bg-violet-100 text-violet-700">Spiritual Content</Badge>
      </div>

      {/* Video Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-8">
          <Play className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No videos yet</p>
          <p className="text-xs text-slate-400 mt-1">Be the first to share spiritual content</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {videos.slice(0, 4).map(video => (
            <div 
              key={video.id}
              className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer bg-slate-100"
              onClick={() => window.location.href = createPageUrl('SpiritTube')}
            >
              <img 
                src={video.thumbnail_url || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&q=80'}
                alt={video.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 text-violet-600 ml-0.5" />
                </div>
              </div>
              
              {/* Video info */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white text-xs font-medium line-clamp-1">{video.title}</p>
                <div className="flex items-center gap-2 mt-1 text-white/70 text-[10px]">
                  <span className="flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    {video.view_count || 0}
                  </span>
                  {video.duration_seconds && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Featured badge */}
              {video.is_featured && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    Featured
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      <Button 
        variant="ghost" 
        className="w-full text-violet-600 hover:bg-violet-50"
        onClick={() => window.location.href = createPageUrl('SpiritTube')}
      >
        Open SpiritTube
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}