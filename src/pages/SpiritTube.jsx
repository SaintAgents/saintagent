import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, Upload, Search, Filter, Clock, Eye, Heart, 
  MessageCircle, Share2, TrendingUp, Sparkles, User,
  Video, Plus, Grid, List
} from 'lucide-react';
import BackButton from '@/components/hud/BackButton';
import { createPageUrl } from '@/utils';
import VideoCard from '@/components/videos/VideoCard';
import VideoUploadModal from '@/components/videos/VideoUploadModal';
import VideoPlayerModal from '@/components/videos/VideoPlayerModal';

export default function SpiritTube() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch user profile
  const { data: profiles } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = profiles?.[0];

  // Fetch all videos
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => base44.entities.Video.list('-created_date', 100)
  });

  // Filter videos based on search and tab
  const filteredVideos = videos.filter(video => {
    const matchesSearch = !searchQuery || 
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.creator_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'trending') return matchesSearch && video.view_count > 50;
    if (activeTab === 'spiritual') return matchesSearch && video.category === 'spiritual';
    if (activeTab === 'educational') return matchesSearch && video.category === 'educational';
    if (activeTab === 'community') return matchesSearch && video.category === 'community';
    if (activeTab === 'my-videos') return matchesSearch && video.creator_id === currentUser?.email;
    return matchesSearch;
  });

  // Stats
  const totalViews = videos.reduce((sum, v) => sum + (v.view_count || 0), 0);
  const totalVideos = videos.length;
  const myVideos = videos.filter(v => v.creator_id === currentUser?.email).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 pb-20">
      {/* Hero Section */}
      <div className="page-hero relative w-full overflow-hidden bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1600&q=80"
          alt="SpiritTube"
          data-no-filter="true"
          className="w-full h-full object-cover object-center hero-image opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl">
                <Play className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">SpiritTube</h1>
            <p className="text-lg text-white/80">Spiritual Video Community</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <Button 
            className="bg-violet-600 hover:bg-violet-700 gap-2"
            onClick={() => setUploadModalOpen(true)}
          >
            <Upload className="w-4 h-4" />
            Upload Video
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-violet-200">
            <CardContent className="p-4 text-center">
              <Video className="w-6 h-6 text-violet-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{totalVideos}</p>
              <p className="text-xs text-slate-500">Total Videos</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardContent className="p-4 text-center">
              <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Total Views</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{videos.filter(v => v.view_count > 50).length}</p>
              <p className="text-xs text-slate-500">Trending</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardContent className="p-4 text-center">
              <User className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{myVideos}</p>
              <p className="text-xs text-slate-500">My Videos</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="all" className="gap-2">
              <Video className="w-4 h-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="spiritual" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Spiritual
            </TabsTrigger>
            <TabsTrigger value="educational" className="gap-2">
              <Play className="w-4 h-4" />
              Educational
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-2">
              <User className="w-4 h-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="my-videos" className="gap-2">
              <Upload className="w-4 h-4" />
              My Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-20">
                <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Videos Found</h3>
                <p className="text-slate-500 mb-4">
                  {activeTab === 'my-videos' 
                    ? "You haven't uploaded any videos yet."
                    : "No videos match your search criteria."}
                </p>
                {activeTab === 'my-videos' && (
                  <Button 
                    className="bg-violet-600 hover:bg-violet-700 gap-2"
                    onClick={() => setUploadModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Upload Your First Video
                  </Button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredVideos.map(video => (
                  <VideoCard 
                    key={video.id} 
                    video={video} 
                    variant={viewMode}
                    onClick={() => setSelectedVideo(video)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Featured Section */}
        {activeTab === 'all' && filteredVideos.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              Featured Content
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVideos.slice(0, 2).map(video => (
                <Card 
                  key={video.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative aspect-video">
                    <img 
                      src={video.thumbnail_url || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80'}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-bold text-lg mb-1">{video.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-white/80">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {video.like_count || 0}
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-violet-600 text-white">Featured</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <VideoUploadModal 
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        profile={profile}
      />

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          open={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}