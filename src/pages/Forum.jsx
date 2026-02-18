import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, Search, Plus, Pin, ThumbsUp, Eye, Clock, 
  Filter, TrendingUp, Users, Megaphone, HelpCircle, Sparkles, 
  Share2, Award, ArrowRight, MessageCircle, Flag, CheckCircle,
  MoreVertical, Shield, XCircle, Image as ImageIcon, Video, X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';
import AIWritingAssistant from '@/components/ai/AIWritingAssistant';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useRef } from 'react';

const CATEGORIES = [
  { id: 'general', label: 'General Discussion', icon: MessageSquare, color: 'bg-slate-100 text-slate-700' },
  { id: 'announcements', label: 'Announcements', icon: Megaphone, color: 'bg-violet-100 text-violet-700' },
  { id: 'questions', label: 'Questions & Help', icon: HelpCircle, color: 'bg-blue-100 text-blue-700' },
  { id: 'showcase', label: 'Showcase', icon: Sparkles, color: 'bg-amber-100 text-amber-700' },
  { id: 'collaboration', label: 'Collaboration', icon: Users, color: 'bg-emerald-100 text-emerald-700' },
  { id: 'feedback', label: 'Feedback', icon: TrendingUp, color: 'bg-rose-100 text-rose-700' },
  { id: 'affiliate_tips', label: 'Affiliate Tips', icon: Share2, color: 'bg-purple-100 text-purple-700' },
];

export default function Forum() {
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general', tags: '', image_urls: [], video_url: null });
  const [replyContent, setReplyContent] = useState('');
  const [replyMedia, setReplyMedia] = useState({ image_url: null, video_url: null });
  const [uploadingPostImage, setUploadingPostImage] = useState(false);
  const [uploadingPostVideo, setUploadingPostVideo] = useState(false);
  const [uploadingReplyImage, setUploadingReplyImage] = useState(false);
  const [uploadingReplyVideo, setUploadingReplyVideo] = useState(false);
  const postImageRef = useRef(null);
  const postVideoRef = useRef(null);
  const replyImageRef = useRef(null);
  const replyVideoRef = useRef(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null); // { type: 'post'|'reply', id, authorId }
  const [reportReason, setReportReason] = useState('other');
  const [reportDetails, setReportDetails] = useState('');

  const queryClient = useQueryClient();

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

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date', 100)
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['forumReplies', selectedPost?.id],
    queryFn: () => base44.entities.ForumReply.filter({ post_id: selectedPost.id }, 'created_date', 100),
    enabled: !!selectedPost?.id
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      setCreateModalOpen(false);
      setNewPost({ title: '', content: '', category: 'general', tags: '', image_urls: [], video_url: null });
    }
  });

  const createReplyMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumReply.create(data),
    onSuccess: async () => {
      if (selectedPost) {
        await base44.entities.ForumPost.update(selectedPost.id, {
          replies_count: (selectedPost.replies_count || 0) + 1
        });
      }
      queryClient.invalidateQueries({ queryKey: ['forumReplies'] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      setReplyContent('');
      setReplyMedia({ image_url: null, video_url: null });
    }
  });

  // Media upload handlers
  const handlePostImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPostImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewPost(prev => ({ ...prev, image_urls: [...prev.image_urls, file_url] }));
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingPostImage(false);
      if (postImageRef.current) postImageRef.current.value = '';
    }
  };

  const handlePostVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    
    video.onloadedmetadata = async () => {
      URL.revokeObjectURL(video.src);
      if (video.duration > 15 * 60) {
        toast.error('Video must be 15 minutes or less');
        if (postVideoRef.current) postVideoRef.current.value = '';
        return;
      }
      
      setUploadingPostVideo(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setNewPost(prev => ({ ...prev, video_url: file_url }));
      } catch (error) {
        toast.error('Failed to upload video');
      } finally {
        setUploadingPostVideo(false);
        if (postVideoRef.current) postVideoRef.current.value = '';
      }
    };
  };

  const handleReplyImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReplyImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setReplyMedia(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingReplyImage(false);
      if (replyImageRef.current) replyImageRef.current.value = '';
    }
  };

  const handleReplyVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    
    video.onloadedmetadata = async () => {
      URL.revokeObjectURL(video.src);
      if (video.duration > 15 * 60) {
        toast.error('Video must be 15 minutes or less');
        if (replyVideoRef.current) replyVideoRef.current.value = '';
        return;
      }
      
      setUploadingReplyVideo(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setReplyMedia(prev => ({ ...prev, video_url: file_url }));
      } catch (error) {
        toast.error('Failed to upload video');
      } finally {
        setUploadingReplyVideo(false);
        if (replyVideoRef.current) replyVideoRef.current.value = '';
      }
    };
  };

  const likePostMutation = useMutation({
    mutationFn: async (post) => {
      return base44.entities.ForumPost.update(post.id, {
        likes_count: (post.likes_count || 0) + 1
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forumPosts'] })
  });

  // Admin: Pin/Unpin post
  const pinPostMutation = useMutation({
    mutationFn: async ({ postId, isPinned }) => {
      return base44.entities.ForumPost.update(postId, { is_pinned: isPinned });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forumPosts'] })
  });

  // Mark reply as solution (post author or admin)
  const markSolutionMutation = useMutation({
    mutationFn: async ({ replyId, isSolution }) => {
      return base44.entities.ForumReply.update(replyId, { is_solution: isSolution });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forumReplies'] })
  });

  // Report post or reply
  const createReportMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumReport.create(data),
    onSuccess: () => {
      setReportModalOpen(false);
      setReportTarget(null);
      setReportReason('other');
      setReportDetails('');
    }
  });

  const isAdmin = currentUser?.role === 'admin';

  const handleReport = () => {
    if (!reportTarget) return;
    createReportMutation.mutate({
      reporter_id: profile?.user_id,
      reporter_name: profile?.display_name,
      target_type: reportTarget.type,
      target_id: reportTarget.id,
      target_author_id: reportTarget.authorId,
      reason: reportReason,
      details: reportDetails
    });
  };

  const openReportModal = (type, id, authorId) => {
    setReportTarget({ type, id, authorId });
    setReportModalOpen(true);
  };

  const filteredPosts = posts.filter(post => {
    const categoryMatch = tab === 'all' || post.category === tab;
    const searchMatch = !searchQuery || 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  }).sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    if (sortBy === 'recent') return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === 'popular') return (b.likes_count || 0) - (a.likes_count || 0);
    if (sortBy === 'active') return (b.replies_count || 0) - (a.replies_count || 0);
    return 0;
  });

  const handleCreatePost = () => {
    createPostMutation.mutate({
      author_id: profile?.user_id,
      author_name: profile?.display_name,
      author_avatar: profile?.avatar_url,
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
      image_urls: newPost.image_urls,
      video_url: newPost.video_url
    });
  };

  const handleReply = () => {
    if (!replyContent.trim() && !replyMedia.image_url && !replyMedia.video_url) return;
    createReplyMutation.mutate({
      post_id: selectedPost.id,
      author_id: profile?.user_id,
      author_name: profile?.display_name,
      author_avatar: profile?.avatar_url,
      content: replyContent,
      image_url: replyMedia.image_url,
      video_url: replyMedia.video_url
    });
  };

  const getCategoryMeta = (categoryId) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent dark:bg-none dark:from-transparent dark:via-transparent dark:to-transparent relative">
      {/* Hero Section */}
      <div className="relative h-64 md:h-72 page-hero overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/6f911f9fc_universal_upscale_0_78f63644-c1c1-437a-984c-78bd21bad71e_0.jpg"
          alt="Community Forum"
          className="absolute inset-0 w-full h-full object-cover hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <HeroGalleryTrigger startIndex={15} className="absolute bottom-4 left-4 text-white/80 !p-1 [&_svg]:w-3 [&_svg]:h-3 z-10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 hero-content" style={{ paddingTop: '15px' }}>
          <div className="flex items-center gap-3 mb-2">
            <BackButton className="text-white" />
            <MessageSquare className="w-8 h-8 text-violet-300" />
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Community Forum
            </h1>
            <ForwardButton currentPage="Forum" className="text-white" />
          </div>
          <p className="text-violet-200 text-lg mb-4">Connect, share, and grow together</p>
          <Button 
            className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2 shadow-lg"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Liked</SelectItem>
              <SelectItem value="active">Most Active</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="w-full flex-wrap h-auto gap-2 p-2 bg-white dark:bg-[#0a0a0a] rounded-xl border">
            <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="rounded-lg gap-1">
                <cat.icon className="w-3 h-3" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-[#0a0a0a]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-violet-600">{posts.length}</div>
              <div className="text-xs text-slate-500">Total Posts</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#0a0a0a]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {posts.filter(p => Date.now() - new Date(p.created_date) < 24*60*60*1000).length}
              </div>
              <div className="text-xs text-slate-500">New Today</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#0a0a0a]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {posts.reduce((sum, p) => sum + (p.replies_count || 0), 0)}
              </div>
              <div className="text-xs text-slate-500">Total Replies</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#0a0a0a]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {new Set(posts.map(p => p.author_id)).size}
              </div>
              <div className="text-xs text-slate-500">Contributors</div>
            </CardContent>
          </Card>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-white dark:bg-[#0a0a0a] rounded-xl animate-pulse" />
            ))
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No discussions yet</h3>
              <p className="text-slate-500 mb-6">Start the conversation!</p>
              <Button onClick={() => setCreateModalOpen(true)} className="rounded-xl bg-violet-600 hover:bg-violet-700">
                Create First Post
              </Button>
            </div>
          ) : (
            filteredPosts.map(post => {
              const catMeta = getCategoryMeta(post.category);
              return (
                <Card 
                  key={post.id} 
                  className="bg-white dark:bg-[#0a0a0a] hover:shadow-lg transition-all cursor-pointer border dark:border-[#00ff88]/20"
                  onClick={() => setSelectedPost(post)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10 cursor-pointer" data-user-id={post.author_id}>
                        <AvatarImage src={post.author_avatar} />
                        <AvatarFallback>{post.author_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {post.is_pinned && (
                            <Pin className="w-4 h-4 text-amber-500" />
                          )}
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                            {post.title}
                          </h3>
                          <Badge className={catMeta.color}>{catMeta.label}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="font-medium text-slate-700 dark:text-slate-300" data-user-id={post.author_id}>
                            {post.author_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {post.likes_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {post.replies_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.views_count || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem 
                                onClick={() => pinPostMutation.mutate({ postId: post.id, isPinned: !post.is_pinned })}
                              >
                                <Pin className="w-4 h-4 mr-2" />
                                {post.is_pinned ? 'Unpin Post' : 'Pin Post'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openReportModal('post', post.id, post.author_id)}
                                className="text-red-600"
                              >
                                <Flag className="w-4 h-4 mr-2" />
                                Review Reports
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {!isAdmin && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              openReportModal('post', post.id, post.author_id);
                            }}
                          >
                            <Flag className="w-4 h-4" />
                          </Button>
                        )}
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="What's on your mind?"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={newPost.category} onValueChange={(v) => setNewPost({ ...newPost, category: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Content</label>
                <AIWritingAssistant 
                  text={newPost.content} 
                  onApply={(enhanced) => setNewPost({ ...newPost, content: enhanced })} 
                  disabled={!newPost.content?.trim()}
                />
              </div>
              <Textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="Share your thoughts, questions, or ideas..."
                className="mt-1 min-h-[150px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                placeholder="e.g., tips, help, showcase"
                className="mt-1"
              />
            </div>
            
            {/* Media Upload Section */}
            <div>
              <label className="text-sm font-medium">Media</label>
              <div className="flex items-center gap-2 mt-1">
                <input ref={postImageRef} type="file" accept="image/*" onChange={handlePostImageUpload} className="hidden" />
                <input ref={postVideoRef} type="file" accept="video/*" onChange={handlePostVideoUpload} className="hidden" />
                <Button type="button" variant="outline" size="sm" onClick={() => postImageRef.current?.click()} disabled={uploadingPostImage}>
                  <ImageIcon className={`w-4 h-4 mr-2 ${uploadingPostImage ? 'animate-pulse' : ''}`} />
                  Image
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => postVideoRef.current?.click()} disabled={uploadingPostVideo || newPost.video_url}>
                  <Video className={`w-4 h-4 mr-2 ${uploadingPostVideo ? 'animate-pulse' : ''}`} />
                  Video (max 15 min)
                </Button>
              </div>
              
              {/* Preview uploaded media */}
              {(newPost.image_urls.length > 0 || newPost.video_url) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newPost.image_urls.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} alt="Upload" className="h-16 w-auto rounded-lg object-cover border" />
                      <button
                        type="button"
                        onClick={() => setNewPost(prev => ({ ...prev, image_urls: prev.image_urls.filter((_, i) => i !== idx) }))}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {newPost.video_url && (
                    <div className="relative">
                      <video src={newPost.video_url} className="h-16 w-auto rounded-lg border" muted />
                      <button
                        type="button"
                        onClick={() => setNewPost(prev => ({ ...prev, video_url: null }))}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreatePost} 
              disabled={!newPost.title || !newPost.content || createPostMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              Report {reportTarget?.type === 'post' ? 'Post' : 'Reply'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="misinformation">Misinformation</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                  <SelectItem value="off_topic">Off Topic</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Additional Details (optional)</label>
              <Textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Provide any additional context..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleReport}
              disabled={createReportMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10" data-user-id={selectedPost.author_id}>
                    <AvatarImage src={selectedPost.author_avatar} />
                    <AvatarFallback>{selectedPost.author_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selectedPost.title}</DialogTitle>
                    <p className="text-sm text-slate-500">
                      by {selectedPost.author_name} • {formatDistanceToNow(new Date(selectedPost.created_date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </DialogHeader>
              <div className="py-4">
                <Badge className={getCategoryMeta(selectedPost.category).color}>
                  {getCategoryMeta(selectedPost.category).label}
                </Badge>
                <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
                  {selectedPost.content}
                </div>
                
                {/* Post Images */}
                {selectedPost.image_urls?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedPost.image_urls.map((url, idx) => (
                      <img key={idx} src={url} alt="Post image" className="rounded-lg max-h-64 w-auto object-cover" />
                    ))}
                  </div>
                )}
                
                {/* Post Video */}
                {selectedPost.video_url && (
                  <div className="mt-4">
                    <video src={selectedPost.video_url} controls className="rounded-lg max-h-64 w-auto" />
                  </div>
                )}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      likePostMutation.mutate(selectedPost);
                    }}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {selectedPost.likes_count || 0}
                  </Button>
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {selectedPost.replies_count || 0} replies
                  </span>
                </div>
              </div>

              {/* Replies */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Replies</h4>
                <div className="space-y-4 mb-4">
                  {replies.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No replies yet. Be the first!</p>
                  ) : (
                    replies.map(reply => (
                      <div key={reply.id} className={`flex gap-3 p-3 rounded-lg ${reply.is_solution ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700' : 'bg-slate-50 dark:bg-slate-800'}`}>
                        <Avatar className="w-8 h-8" data-user-id={reply.author_id}>
                          <AvatarImage src={reply.author_avatar} />
                          <AvatarFallback>{reply.author_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm">{reply.author_name}</span>
                            <span className="text-xs text-slate-500">
                              {formatDistanceToNow(new Date(reply.created_date), { addSuffix: true })}
                            </span>
                            {reply.is_solution && (
                              <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Solution
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{reply.content}</p>
                          {reply.image_url && (
                            <img src={reply.image_url} alt="Reply image" className="rounded-lg max-h-48 w-auto mt-2" />
                          )}
                          {reply.video_url && (
                            <video src={reply.video_url} controls className="rounded-lg max-h-48 w-auto mt-2" />
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {/* Mark as solution - only post author or admin can do this */}
                            {(selectedPost?.author_id === profile?.user_id || isAdmin) && selectedPost?.category === 'questions' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`text-xs gap-1 ${reply.is_solution ? 'text-emerald-600' : 'text-slate-500'}`}
                                onClick={() => markSolutionMutation.mutate({ replyId: reply.id, isSolution: !reply.is_solution })}
                              >
                                <CheckCircle className="w-3 h-3" />
                                {reply.is_solution ? 'Unmark Solution' : 'Mark as Solution'}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs gap-1 text-slate-400 hover:text-red-500"
                              onClick={() => openReportModal('reply', reply.id, reply.author_id)}
                            >
                              <Flag className="w-3 h-3" />
                              Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[80px]"
                  />
                  
                  {/* Reply media upload */}
                  <div className="flex items-center gap-2">
                    <input ref={replyImageRef} type="file" accept="image/*" onChange={handleReplyImageUpload} className="hidden" />
                    <input ref={replyVideoRef} type="file" accept="video/*" onChange={handleReplyVideoUpload} className="hidden" />
                    <Button type="button" variant="ghost" size="sm" onClick={() => replyImageRef.current?.click()} disabled={uploadingReplyImage}>
                      <ImageIcon className={`w-4 h-4 ${uploadingReplyImage ? 'animate-pulse' : ''}`} />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => replyVideoRef.current?.click()} disabled={uploadingReplyVideo || replyMedia.video_url}>
                      <Video className={`w-4 h-4 ${uploadingReplyVideo ? 'animate-pulse' : ''}`} />
                    </Button>
                  </div>
                  
                  {/* Reply media preview */}
                  {(replyMedia.image_url || replyMedia.video_url) && (
                    <div className="flex gap-2">
                      {replyMedia.image_url && (
                        <div className="relative">
                          <img src={replyMedia.image_url} alt="Reply upload" className="h-16 w-auto rounded-lg border" />
                          <button
                            type="button"
                            onClick={() => setReplyMedia(prev => ({ ...prev, image_url: null }))}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {replyMedia.video_url && (
                        <div className="relative">
                          <video src={replyMedia.video_url} className="h-16 w-auto rounded-lg border" muted />
                          <button
                            type="button"
                            onClick={() => setReplyMedia(prev => ({ ...prev, video_url: null }))}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <AIWritingAssistant 
                      text={replyContent} 
                      onApply={(enhanced) => setReplyContent(enhanced)} 
                      disabled={!replyContent.trim()}
                    />
                    <Button 
                      onClick={handleReply}
                      disabled={(!replyContent.trim() && !replyMedia.image_url && !replyMedia.video_url) || createReplyMutation.isPending}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}