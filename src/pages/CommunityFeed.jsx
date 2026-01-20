import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import EmojiPicker from '@/components/messages/EmojiPicker';
import { Heart, MessageCircle, Share2, Send, Video, Mic, Image as ImageIcon, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import MiniProfile from '@/components/profile/MiniProfile';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';

export default function CommunityFeed() {
  const [newPostText, setNewPostText] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoError, setVideoError] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [filterTab, setFilterTab] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images, index) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setLightboxIndex(0);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };
  
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = profiles?.[0];

  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50)
  });

  const { data: allLikes = [] } = useQuery({
    queryKey: ['postLikes'],
    queryFn: () => base44.entities.PostLike.list()
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ['postComments'],
    queryFn: () => base44.entities.PostComment.list('-created_date')
  });

  const { data: follows = [] } = useQuery({
    queryKey: ['follows', profile?.user_id],
    queryFn: () => base44.entities.Follow.filter({ follower_id: profile.user_id }),
    enabled: !!profile?.user_id
  });
  const followingIds = follows.map(f => f.following_id);

  const filteredPosts = posts.filter(p => {
    if (filterTab === 'all') return true;
    if (filterTab === 'me') return p.author_id === profile?.user_id;
    if (filterTab === 'following') return followingIds.includes(p.author_id);
    return true;
  });

  const createPostMutation = useMutation({
    mutationFn: async (payload) => {
      await base44.entities.Post.create({
        author_id: profile.user_id,
        author_name: profile.display_name,
        author_avatar: profile.avatar_url,
        content: payload.content || '',
        video_url: payload.video_url,
        video_duration_seconds: payload.video_duration_seconds,
        audio_url: payload.audio_url,
        image_urls: payload.image_urls || []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPostText('');
      if (videoPreview) { try { URL.revokeObjectURL(videoPreview); } catch {} }
      setVideoFile(null);
      setVideoPreview(null);
      setVideoDuration(0);
      setVideoError('');
      if (audioPreview) { try { URL.revokeObjectURL(audioPreview); } catch {} }
      setAudioFile(null);
      setAudioPreview(null);
      imagePreviews.forEach(url => { try { URL.revokeObjectURL(url); } catch {} });
      setImageFiles([]);
      setImagePreviews([]);
    }
  });

  const likeMutation = useMutation({
    mutationFn: async ({ postId, userId }) => {
      const existing = allLikes.find((l) => l.post_id === postId && l.user_id === userId);
      if (existing) {
        await base44.entities.PostLike.delete(existing.id);
        const post = posts.find((p) => p.id === postId);
        if (post) {
          await base44.entities.Post.update(postId, { likes_count: Math.max(0, (post.likes_count || 0) - 1) });
        }
      } else {
        await base44.entities.PostLike.create({ post_id: postId, user_id: userId });
        const post = posts.find((p) => p.id === postId);
        if (post) {
          await base44.entities.Post.update(postId, { likes_count: (post.likes_count || 0) + 1 });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postLikes'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }) => {
      await base44.entities.PostComment.create({
        post_id: postId,
        author_id: profile.user_id,
        author_name: profile.display_name,
        author_avatar: profile.avatar_url,
        content
      });
      const post = posts.find((p) => p.id === postId);
      if (post) {
        await base44.entities.Post.update(postId, { comments_count: (post.comments_count || 0) + 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postComments'] });
    }
  });

  const handleCreatePost = async () => {
    if (!newPostText.trim() && !videoFile && !audioFile && imageFiles.length === 0) return;
    let video_url, audio_url;
    const image_urls = [];
    
    if (videoFile) {
      const up = await base44.integrations.Core.UploadFile({ file: videoFile });
      video_url = up.file_url;
    }
    if (audioFile) {
      const up = await base44.integrations.Core.UploadFile({ file: audioFile });
      audio_url = up.file_url;
    }
    for (const img of imageFiles) {
      const up = await base44.integrations.Core.UploadFile({ file: img });
      image_urls.push(up.file_url);
    }
    
    createPostMutation.mutate({
      content: newPostText.trim(),
      video_url,
      video_duration_seconds: videoFile ? Math.round(videoDuration || 0) : undefined,
      audio_url,
      image_urls
    });
  };

  const onVideoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) { setVideoFile(null); setVideoPreview(null); setVideoDuration(0); setVideoError(''); return; }
    const url = URL.createObjectURL(f);
    setVideoFile(f);
    setVideoPreview(url);
    setVideoError('');
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.src = url;
    v.onloadedmetadata = () => {
      const dur = Number(v.duration || 0);
      setVideoDuration(dur);
      if (dur > 120) {
        setVideoError('Video must be 2 minutes max');
        setVideoFile(null);
        setVideoPreview(null);
        try { URL.revokeObjectURL(url); } catch {}
      }
    };
  };

  const onAudioChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) { setAudioFile(null); setAudioPreview(null); return; }
    const url = URL.createObjectURL(f);
    setAudioFile(f);
    setAudioPreview(url);
  };

  const onImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const urls = files.map(f => URL.createObjectURL(f));
    setImageFiles(prev => [...prev, ...files].slice(0, 4));
    setImagePreviews(prev => [...prev, ...urls].slice(0, 4));
  };

  const handleLike = (postId) => {
    likeMutation.mutate({ postId, userId: profile?.user_id });
  };

  const handleComment = (postId) => {
    const text = commentText[postId];
    if (text?.trim()) {
      commentMutation.mutate({ postId, content: text.trim() });
      setCommentText({ ...commentText, [postId]: '' });
    }
  };

  const isLikedByUser = (postId) => {
    return allLikes.some((l) => l.post_id === postId && l.user_id === profile?.user_id);
  };

  const computePostComments = (postId) => {
    return allComments.filter((c) => c.post_id === postId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent">
      {/* Hero Section */}
      <div className="page-hero relative overflow-hidden -mt-6">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/ae589aa03_universal_upscale_0_56f51cb9-0490-420c-a398-fabdc48611df_0.jpg"
          alt="Community Feed"
          className="w-full h-full object-cover hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
        <HeroGalleryTrigger startIndex={17} className="absolute bottom-4 left-4 text-white/80 !p-1 [&_svg]:w-3 [&_svg]:h-3 z-10" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <BackButton className="text-white hover:bg-white/20" />
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Community Feed
            </h1>
            <p className="text-lg text-white/80">Saint agents social media timeline</p>
          </div>
          <ForwardButton currentPage="CommunityFeed" className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {/* Filter Tabs */}
        <Tabs value={filterTab} onValueChange={setFilterTab} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="me">My Posts</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Create Post Card */}
        <Card className="mb-6 bg-white/[0.04] backdrop-blur-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10 cursor-pointer" data-user-id={profile?.user_id}>
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-violet-100 text-violet-600">
                  {profile?.display_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Share your thoughts with the community..."
                className="flex-1 resize-none"
                rows={4}
              />
            </div>
            
            {/* Media uploads */}
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors text-sm">
                <ImageIcon className="w-4 h-4" />
                Photos
                <input type="file" accept="image/*" multiple onChange={onImageChange} className="hidden" />
              </label>
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors text-sm">
                <Video className="w-4 h-4" />
                Video
                <input type="file" accept="video/*" onChange={onVideoChange} className="hidden" />
              </label>
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors text-sm">
                <Mic className="w-4 h-4" />
                Audio
                <input type="file" accept="audio/mp3,audio/mpeg,audio/*" onChange={onAudioChange} className="hidden" />
              </label>
              {videoError && <span className="text-sm text-rose-600">{videoError}</span>}
            </div>

            {/* Preview uploaded media */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {imagePreviews.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full h-32 object-cover rounded-lg" />
                ))}
              </div>
            )}
            {videoPreview && !videoError && <video src={videoPreview} controls className="w-full rounded-lg" />}
            {audioPreview && <audio src={audioPreview} controls className="w-full" />}

            <div className="flex items-center justify-between">
              <EmojiPicker onSelect={(e) => setNewPostText((prev) => (prev || '') + e)} />
              <Button
                onClick={handleCreatePost}
                disabled={(!newPostText.trim() && !videoFile && !audioFile && imageFiles.length === 0) || createPostMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2"
              >
                <Send className="w-4 h-4" />
                Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No posts yet</h3>
              <p className="text-slate-500">Be the first to share something with the community!</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const postComments = computePostComments(post.id);
              const isLiked = isLikedByUser(post.id);
              const showComments = expandedComments[post.id];

              return (
                <Card key={post.id} className="bg-white/[0.04] backdrop-blur-sm">
                  <CardContent className="pt-6 space-y-4">
                    {/* Post Header */}
                    <div className="flex items-center justify-between gap-3">
                      <MiniProfile userId={post.author_id} name={post.author_name} avatar={post.author_avatar} size={40} />
                      <p className="text-xs text-slate-500">
                        {post.created_date ? format(typeof post.created_date === 'string' ? parseISO(post.created_date) : new Date(post.created_date), 'MMM d, h:mm a') : ''}
                      </p>
                    </div>

                    {/* Post Content */}
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    {/* Media */}
                    {post.image_urls && post.image_urls.length > 0 && (
                      <div className={cn("grid gap-2", post.image_urls.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
                        {post.image_urls.map((url, i) => (
                          <img key={i} src={url} alt="" className="w-full rounded-lg object-cover" />
                        ))}
                      </div>
                    )}
                    {post.video_url && <video src={post.video_url} controls className="w-full rounded-lg" />}
                    {post.audio_url && <audio src={post.audio_url} controls className="w-full" />}

                    {/* Post Actions */}
                    <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={cn(
                          "flex items-center gap-2 text-sm transition-colors",
                          isLiked ? "text-rose-600" : "text-slate-500 hover:text-rose-600"
                        )}
                      >
                        <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                        <span className="font-medium">{post.likes_count || 0}</span>
                      </button>
                      <button
                        onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !showComments })}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">{post.comments_count || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Comments Section */}
                    {showComments && (
                      <div className="space-y-3 pt-2">
                        {postComments.map((comment) => (
                          <div key={comment.id} className="flex items-start gap-2">
                            <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-violet-300 transition-all" data-user-id={comment.author_id}>
                              <AvatarImage src={comment.author_avatar} />
                              <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                                {comment.author_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 p-3 rounded-lg bg-slate-50">
                              <p className="text-xs font-medium text-slate-900">{comment.author_name}</p>
                              <p className="text-sm text-slate-700 mt-1">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Comment Input */}
                        <div className="flex items-start gap-2">
                          <Avatar className="w-8 h-8 cursor-pointer" data-user-id={profile?.user_id}>
                            <AvatarImage src={profile?.avatar_url} />
                            <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
                              {profile?.display_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex items-end gap-2">
                            <Textarea
                              value={commentText[post.id] || ''}
                              onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                              placeholder="Write a comment..."
                              className="text-sm resize-none"
                              rows={2}
                            />
                            <EmojiPicker onSelect={(e) => setCommentText({ ...commentText, [post.id]: (commentText[post.id] || '') + e })} />
                            <Button
                              size="sm"
                              onClick={() => handleComment(post.id)}
                              disabled={!commentText[post.id]?.trim()}
                              className="bg-violet-600 hover:bg-violet-700"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}