import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Share2, MessageCircle, Send, X, Eye, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { cn } from '@/lib/utils';

export default function VideoPlayerModal({ video, open, onClose, currentUser, profile }) {
  const [comment, setComment] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const queryClient = useQueryClient();

  // Increment view count on open
  useEffect(() => {
    if (open && video?.id) {
      base44.entities.Video.update(video.id, { views: (video.views || 0) + 1 });
    }
  }, [open, video?.id]);

  // Check if user has liked
  const { data: userLike } = useQuery({
    queryKey: ['videoLike', video?.id, currentUser?.email],
    queryFn: () => base44.entities.VideoLike.filter({ video_id: video.id, user_id: currentUser.email }),
    enabled: open && !!video?.id && !!currentUser?.email
  });

  useEffect(() => {
    setHasLiked(userLike?.length > 0);
  }, [userLike]);

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ['videoComments', video?.id],
    queryFn: () => base44.entities.VideoComment.filter({ video_id: video.id }, '-created_date', 100),
    enabled: open && !!video?.id
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (hasLiked) {
        // Unlike
        const existing = await base44.entities.VideoLike.filter({ video_id: video.id, user_id: currentUser.email });
        if (existing?.[0]) {
          await base44.entities.VideoLike.delete(existing[0].id);
        }
        await base44.entities.Video.update(video.id, { likes: Math.max(0, (video.likes || 0) - 1) });
      } else {
        // Like
        await base44.entities.VideoLike.create({ video_id: video.id, user_id: currentUser.email });
        await base44.entities.Video.update(video.id, { likes: (video.likes || 0) + 1 });
      }
    },
    onSuccess: () => {
      setHasLiked(!hasLiked);
      queryClient.invalidateQueries({ queryKey: ['videoLike', video?.id] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.VideoComment.create({
        video_id: video.id,
        user_id: currentUser.email,
        user_name: profile?.display_name || currentUser.full_name,
        user_avatar: profile?.avatar_url,
        content: comment
      });
    },
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['videoComments', video?.id] });
    }
  });

  const handleComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    commentMutation.mutate();
  };

  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  // Helper to detect and convert video URLs
  const getVideoEmbed = (url) => {
    if (!url) return { type: 'none', url: null };
    
    // YouTube detection
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return { type: 'youtube', id: youtubeMatch[1] };
    }
    
    // Vimeo detection
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch) {
      return { type: 'vimeo', id: vimeoMatch[1] };
    }
    
    // Direct video file
    return { type: 'direct', url };
  };

  if (!video) return null;

  const videoEmbed = getVideoEmbed(video.video_url);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden max-h-[90vh]">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Video Section */}
          <div className="flex-1 bg-black flex flex-col">
            {videoEmbed.type === 'youtube' ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoEmbed.id}?autoplay=1`}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : videoEmbed.type === 'vimeo' ? (
              <iframe
                src={`https://player.vimeo.com/video/${videoEmbed.id}?autoplay=1`}
                className="w-full aspect-video"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={video.video_url}
                className="w-full aspect-video object-contain"
                controls
                autoPlay
              />
            )}
            
            {/* Video Info */}
            <div className="p-4 bg-white">
              <h2 className="text-lg font-semibold text-slate-900">{video.title}</h2>
              
              <div className="flex items-center justify-between mt-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10" data-user-id={video.uploader_id}>
                    <AvatarImage src={video.uploader_avatar} />
                    <AvatarFallback>{video.uploader_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-slate-900">{video.uploader_name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatViews(video.views + 1)} views
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {moment(video.created_date).fromNow()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => likeMutation.mutate()}
                    className={cn(hasLiked && "bg-red-50 border-red-200 text-red-600")}
                  >
                    <ThumbsUp className={cn("w-4 h-4 mr-1", hasLiked && "fill-current")} />
                    {(video.likes || 0) + (hasLiked && !userLike?.length ? 1 : 0)}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Description */}
              {video.description && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{video.description}</p>
                </div>
              )}

              {/* Tags */}
              {video.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {video.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="w-full lg:w-80 border-l border-slate-200 flex flex-col bg-white">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Comments ({comments.length})
              </h3>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleComment} className="p-3 border-b border-slate-100">
              <div className="flex gap-2">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-xs">{currentUser?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="text-sm h-8"
                  />
                  <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={!comment.trim()}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No comments yet. Be the first!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-2">
                      <Avatar className="w-7 h-7 shrink-0" data-user-id={c.user_id}>
                        <AvatarImage src={c.user_avatar} />
                        <AvatarFallback className="text-[10px]">{c.user_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-900">{c.user_name}</span>
                          <span className="text-[10px] text-slate-400">{moment(c.created_date).fromNow()}</span>
                        </div>
                        <p className="text-sm text-slate-700 mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}