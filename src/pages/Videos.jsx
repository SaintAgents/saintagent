import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, Search, Play, Flame, Clock, TrendingUp, 
  Film, Gamepad2, Music, GraduationCap, Newspaper, Dumbbell, Cpu, Heart
} from 'lucide-react';
import BackButton from '@/components/hud/BackButton';
import VideoCard from '@/components/videos/VideoCard';
import VideoUploadModal from '@/components/videos/VideoUploadModal';
import VideoPlayerModal from '@/components/videos/VideoPlayerModal';

const CATEGORIES = [
  { value: 'all', label: 'All', icon: Play },
  { value: 'education', label: 'Education', icon: GraduationCap },
  { value: 'entertainment', label: 'Entertainment', icon: Film },
  { value: 'music', label: 'Music', icon: Music },
  { value: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { value: 'news', label: 'News', icon: Newspaper },
  { value: 'sports', label: 'Sports', icon: Dumbbell },
  { value: 'technology', label: 'Technology', icon: Cpu },
  { value: 'lifestyle', label: 'Lifestyle', icon: Heart },
];

export default function Videos() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      return profiles?.[0];
    },
    enabled: !!currentUser?.email
  });

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => base44.entities.Video.filter({ status: 'published' }, '-created_date', 100)
  });

  // Filter and sort videos
  const filteredVideos = React.useMemo(() => {
    let result = [...videos];

    // Category filter
    if (category !== 'all') {
      result = result.filter(v => v.category === category);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.title?.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.uploader_name?.toLowerCase().includes(q) ||
        v.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'trending') {
      // Simple trending: views + likes weighted
      result.sort((a, b) => ((b.views || 0) + (b.likes || 0) * 10) - ((a.views || 0) + (a.likes || 0) * 10));
    }

    return result;
  }, [videos, category, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BackButton />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" fill="white" />
                </div>
                <span className="font-bold text-xl text-slate-900">SaintTube</span>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="pl-10 h-10 bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            {/* Upload Button */}
            <Button 
              onClick={() => setUploadOpen(true)}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = category === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Sort Tabs */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {category === 'all' ? 'All Videos' : CATEGORIES.find(c => c.value === category)?.label}
            <Badge variant="secondary" className="ml-2">{filteredVideos.length}</Badge>
          </h2>
          <Tabs value={sortBy} onValueChange={setSortBy}>
            <TabsList className="h-9">
              <TabsTrigger value="recent" className="text-xs gap-1">
                <Clock className="w-3 h-3" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="popular" className="text-xs gap-1">
                <TrendingUp className="w-3 h-3" />
                Popular
              </TabsTrigger>
              <TabsTrigger value="trending" className="text-xs gap-1">
                <Flame className="w-3 h-3" />
                Trending
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Video Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-slate-200 rounded-xl mb-3" />
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-slate-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-16">
            <Film className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No videos found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery ? 'Try a different search term' : 'Be the first to upload a video!'}
            </p>
            <Button onClick={() => setUploadOpen(true)} className="bg-red-600 hover:bg-red-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
            {filteredVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        )}
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
    </div>
  );
}