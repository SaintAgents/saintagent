import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Play, Upload, TrendingUp, Clock, Eye } from 'lucide-react';
import VideoCard from './VideoCard';
import VideoUploadModal from './VideoUploadModal';
import VideoPlayerModal from './VideoPlayerModal';
import { createPageUrl } from '@/utils';

export default function VideosDashboardCard({ profile, currentUser }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [tab, setTab] = useState('recent');

  // Fetch recent videos
  const { data: videos = [] } = useQuery({
    queryKey: ['videos_dashboard'],
    queryFn: () => base44.entities.Video.filter({ status: 'published' }, '-created_date', 12)
  });

  // Fetch user's videos
  const { data: myVideos = [] } = useQuery({
    queryKey: ['my_videos', currentUser?.email],
    queryFn: () => base44.entities.Video.filter({ uploader_id: currentUser.email, status: 'published' }, '-created_date', 6),
    enabled: !!currentUser?.email
  });

  const displayVideos = tab === 'recent' 
    ? videos.slice(0, 4)
    : tab === 'trending'
    ? [...videos].sort((a, b) => ((b.views || 0) + (b.likes || 0) * 10) - ((a.views || 0) + (a.likes || 0) * 10)).slice(0, 4)
    : myVideos.slice(0, 4);

  const totalViews = myVideos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalVideos = myVideos.length;

  return (
    <>
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-center">
            <Play className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-700">{totalVideos}</p>
            <p className="text-xs text-red-600">My Videos</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
            <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-700">{totalViews.toLocaleString()}</p>
            <p className="text-xs text-blue-600">Total Views</p>
          </div>
          <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-center">
            <TrendingUp className="w-5 h-5 text-violet-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-violet-700">{videos.length}</p>
            <p className="text-xs text-violet-600">Platform</p>
          </div>
        </div>

        {/* Upload Button */}
        <Button 
          onClick={() => setUploadOpen(true)}
          className="w-full bg-red-600 hover:bg-red-700 gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Video (max 20 min)
        </Button>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="recent" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="mine" className="text-xs">
              <Play className="w-3 h-3 mr-1" />
              Mine
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-4 space-y-4">
            {displayVideos.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No videos yet
              </div>
            ) : (
              displayVideos.map(video => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => setSelectedVideo(video)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="trending" className="mt-4 space-y-4">
            {displayVideos.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No trending videos
              </div>
            ) : (
              displayVideos.map(video => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => setSelectedVideo(video)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="mine" className="mt-4 space-y-4">
            {displayVideos.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                You haven't uploaded any videos yet
              </div>
            ) : (
              displayVideos.map(video => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => setSelectedVideo(video)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* View All */}
        <Button 
          variant="ghost" 
          className="w-full text-violet-600"
          onClick={() => window.location.href = createPageUrl('Videos')}
        >
          View All Videos
        </Button>
      </div>

      {/* Upload Modal */}
      <VideoUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        currentUser={currentUser}
        profile={profile}
      />

      {/* Player Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        currentUser={currentUser}
        profile={profile}
      />
    </>
  );
}