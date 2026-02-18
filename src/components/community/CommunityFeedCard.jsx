import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import EmojiPicker from '@/components/messages/EmojiPicker';
import { Heart, MessageCircle, Send, Sparkles, Image as ImageIcon, X, Video } from 'lucide-react';
import SocialShareButtons from '@/components/affiliate/SocialShareButtons';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function CommunityFeedCard({ maxHeight = '400px' }) {
  const [newPostText, setNewPostText] = useState('');
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingVideo, setPendingVideo] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 1800000,
    gcTime: 3600000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  const { data: profiles } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email,
    staleTime: 1800000,
    gcTime: 3600000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });
  const profile = profiles?.[0];

  // DISABLED to prevent rate limits in preview sandbox
  const posts = [];
  const allLikes = [];
  const allComments = [];

  const createPostMutation = useMutation({
    mutationFn: async (payload) => {
      await base44.entities.Post.create({
        author_id: profile.user_id,
        author_name: profile.display_name,
        author_avatar: profile.avatar_url,
        content: payload.content || '',
        image_urls: payload.image_urls || [],
        video_url: payload.video_url || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPostText('');
      setPendingImage(null);
      setPendingVideo(null);
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPendingImage(file_url);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePendingImage = () => {
    setPendingImage(null);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check video duration (max 15 minutes)
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    
    video.onloadedmetadata = async () => {
      URL.revokeObjectURL(video.src);
      if (video.duration > 15 * 60) {
        toast.error('Video must be 15 minutes or less');
        if (videoInputRef.current) videoInputRef.current.value = '';
        return;
      }
      
      setUploadingVideo(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setPendingVideo(file_url);
      } catch (error) {
        toast.error('Failed to upload video');
      } finally {
        setUploadingVideo(false);
        if (videoInputRef.current) videoInputRef.current.value = '';
      }
    };
  };

  const removePendingVideo = () => {
    setPendingVideo(null);
  };

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
    if (!newPostText.trim() && !pendingImage && !pendingVideo) return;
    createPostMutation.mutate({ 
      content: newPostText.trim(),
      image_urls: pendingImage ? [pendingImage] : [],
      video_url: pendingVideo || null
    });
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [posts]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            Community Feed
          </h3>
          <a href={createPageUrl('CommunityFeed')}>
            <Button variant="ghost" size="sm" className="text-xs h-7">
              View All
            </Button>
          </a>
        </div>

        {/* Quick Post */}
        <div className="mb-4 flex gap-2">
          <Avatar className="w-8 h-8 shrink-0 cursor-pointer" data-user-id={profile?.user_id}>
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
              {profile?.display_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Input
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="Share with the community..."
              className="text-sm"
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleCreatePost()}
            />
            
            {/* Pending Image Preview */}
            {pendingImage && (
              <div className="relative inline-block">
                <img 
                  src={pendingImage} 
                  alt="Pending upload" 
                  className="h-20 w-auto rounded-lg object-cover border border-slate-200"
                />
                <button
                  onClick={removePendingImage}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {/* Pending Video Preview */}
            {pendingVideo && (
              <div className="relative inline-block">
                <video 
                  src={pendingVideo} 
                  className="h-20 w-auto rounded-lg object-cover border border-slate-200"
                  muted
                />
                <button
                  onClick={removePendingVideo}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                  title="Remove video"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                title="Add image"
              >
                <ImageIcon className={cn("w-4 h-4", uploadingImage && "animate-pulse")} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingVideo}
                title="Add video (max 15 min)"
              >
                <Video className={cn("w-4 h-4", uploadingVideo && "animate-pulse")} />
              </Button>
              <EmojiPicker onSelect={(e) => setNewPostText((prev) => (prev || '') + e)} />
              <Button
                onClick={handleCreatePost}
                disabled={(!newPostText.trim() && !pendingImage && !pendingVideo) || createPostMutation.isPending}
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 h-7 text-xs"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Feed */}
        <ScrollArea style={{ height: maxHeight }} ref={scrollRef}>
          <div className="space-y-3 pr-2">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No posts yet</p>
              </div>
            ) : (
              posts.slice(0, 10).map((post) => {
                const postComments = computePostComments(post.id);
                const isLiked = isLikedByUser(post.id);
                const showComments = expandedComments[post.id];

                return (
                  <div key={post.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                    {/* Post Header */}
                    <div className="flex items-start gap-2">
                      <Avatar className="w-7 h-7 cursor-pointer" data-user-id={post.author_id}>
                        <AvatarImage src={post.author_avatar} />
                        <AvatarFallback className="text-xs">{post.author_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 dark:text-white cursor-pointer hover:text-violet-600" data-user-id={post.author_id}>
                          {post.author_name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {format(parseISO(post.created_date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{post.content}</p>
                    
                    {/* Post Images */}
                    {post.image_urls?.length > 0 && (
                      <div className="mt-2">
                        {post.image_urls.map((url, idx) => (
                          <img 
                            key={idx}
                            src={url} 
                            alt="Post image" 
                            className="rounded-lg max-h-48 w-auto object-cover"
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Post Video */}
                    {post.video_url && (
                      <div className="mt-2">
                        <video 
                          src={post.video_url} 
                          controls
                          className="rounded-lg max-h-48 w-auto"
                        />
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={cn(
                            "flex items-center gap-1 text-xs transition-colors",
                            isLiked ? "text-rose-600" : "text-slate-500 hover:text-rose-600"
                          )}
                        >
                          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                          <span className="font-medium">{post.likes_count || 0}</span>
                        </button>
                        <button
                          onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !showComments })}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-600 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">{post.comments_count || 0}</span>
                        </button>
                      </div>
                      <SocialShareButtons 
                        url={window.location.origin + '/CommunityFeed?post=' + post.id}
                        text={post.content?.slice(0, 100) + (post.content?.length > 100 ? '...' : '') + ' - via SaintAgent'}
                        size="sm"
                        platforms={['twitter', 'telegram']}
                      />
                    </div>

                    {/* Comments Section */}
                    {showComments && (
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        {postComments.slice(0, 2).map((comment) => (
                          <div key={comment.id} className="flex items-start gap-2">
                            <Avatar className="w-6 h-6 cursor-pointer" data-user-id={comment.author_id}>
                              <AvatarImage src={comment.author_avatar} />
                              <AvatarFallback className="text-xs">{comment.author_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-700">
                              <p className="text-[10px] font-medium text-slate-900 dark:text-white">{comment.author_name}</p>
                              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Comment Input */}
                        <div className="flex items-center gap-2">
                          <Input
                            value={commentText[post.id] || ''}
                            onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                            placeholder="Comment..."
                            className="text-xs h-8"
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleComment(post.id)}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleComment(post.id)}
                            disabled={!commentText[post.id]?.trim()}
                            className="h-8 w-8 p-0 bg-violet-600 hover:bg-violet-700"
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}