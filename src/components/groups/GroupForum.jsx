import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  MessageSquare, 
  Heart, 
  Pin,
  Search,
  Filter,
  HelpCircle,
  Megaphone,
  FileText,
  BarChart3,
  Send
} from "lucide-react";
import { format, parseISO } from "date-fns";

const POST_TYPE_CONFIG = {
  discussion: { icon: MessageSquare, color: 'bg-blue-100 text-blue-700', label: 'Discussion' },
  question: { icon: HelpCircle, color: 'bg-amber-100 text-amber-700', label: 'Question' },
  announcement: { icon: Megaphone, color: 'bg-rose-100 text-rose-700', label: 'Announcement' },
  resource: { icon: FileText, color: 'bg-emerald-100 text-emerald-700', label: 'Resource' },
  poll: { icon: BarChart3, color: 'bg-purple-100 text-purple-700', label: 'Poll' }
};

export default function GroupForum({ circle, user }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newPost, setNewPost] = useState({ title: '', content: '', post_type: 'discussion' });
  const [replyContent, setReplyContent] = useState('');
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ['groupPosts', circle.id],
    queryFn: () => base44.entities.GroupPost.filter({ circle_id: circle.id }, '-created_date', 100),
    enabled: !!circle.id
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['groupPostReplies', selectedPost?.id],
    queryFn: () => base44.entities.GroupPostReply.filter({ post_id: selectedPost.id }, 'created_date', 100),
    enabled: !!selectedPost?.id
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.GroupPost.create({
      circle_id: circle.id,
      author_id: user.email,
      author_name: user.full_name,
      ...data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupPosts', circle.id] });
      setCreateOpen(false);
      setNewPost({ title: '', content: '', post_type: 'discussion' });
    }
  });

  const createReplyMutation = useMutation({
    mutationFn: (data) => base44.entities.GroupPostReply.create({
      post_id: selectedPost.id,
      circle_id: circle.id,
      author_id: user.email,
      author_name: user.full_name,
      ...data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupPostReplies', selectedPost.id] });
      base44.entities.GroupPost.update(selectedPost.id, { 
        replies_count: (selectedPost.replies_count || 0) + 1 
      });
      setReplyContent('');
    }
  });

  const filteredPosts = posts.filter(p => {
    if (typeFilter !== 'all' && p.post_type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.title?.toLowerCase().includes(q) && !p.content?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const pinnedPosts = filteredPosts.filter(p => p.is_pinned);
  const regularPosts = filteredPosts.filter(p => !p.is_pinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="discussion">Discussions</SelectItem>
              <SelectItem value="question">Questions</SelectItem>
              <SelectItem value="announcement">Announcements</SelectItem>
              <SelectItem value="resource">Resources</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700 gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Pin className="w-4 h-4" /> Pinned
          </h3>
          {pinnedPosts.map(post => (
            <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
          ))}
        </div>
      )}

      {/* Regular Posts */}
      <div className="space-y-3">
        {regularPosts.map(post => (
          <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">No discussions yet</h3>
          <p className="text-slate-500 text-sm mb-4">Start the conversation!</p>
          <Button onClick={() => setCreateOpen(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Create First Post
          </Button>
        </div>
      )}

      {/* Create Post Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Select 
                value={newPost.post_type} 
                onValueChange={(v) => setNewPost({ ...newPost, post_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(POST_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <Textarea
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createPostMutation.mutate(newPost)}
                disabled={!newPost.content.trim() || createPostMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(o) => !o && setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn("text-xs", POST_TYPE_CONFIG[selectedPost.post_type]?.color)}>
                    {POST_TYPE_CONFIG[selectedPost.post_type]?.label}
                  </Badge>
                  {selectedPost.is_pinned && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Pin className="w-3 h-3" /> Pinned
                    </Badge>
                  )}
                </div>
                <DialogTitle>{selectedPost.title || 'Discussion'}</DialogTitle>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={selectedPost.author_avatar} />
                    <AvatarFallback>{selectedPost.author_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span>{selectedPost.author_name}</span>
                  <span>•</span>
                  <span>{format(parseISO(selectedPost.created_date), 'MMM d, yyyy')}</span>
                </div>
              </DialogHeader>

              <div className="py-4 border-b">
                <p className="text-slate-700 whitespace-pre-wrap">{selectedPost.content}</p>
              </div>

              {/* Replies */}
              <div className="space-y-4 py-4">
                <h4 className="font-medium text-slate-900">
                  {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                </h4>
                
                {replies.map(reply => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={reply.author_avatar} />
                      <AvatarFallback>{reply.author_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{reply.author_name}</span>
                        <span className="text-xs text-slate-400">
                          {format(parseISO(reply.created_date), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{reply.content}</p>
                    </div>
                  </div>
                ))}

                {/* Reply Input */}
                <div className="flex gap-3 pt-4 border-t">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{user?.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && replyContent.trim()) {
                          createReplyMutation.mutate({ content: replyContent });
                        }
                      }}
                    />
                    <Button 
                      size="icon"
                      onClick={() => createReplyMutation.mutate({ content: replyContent })}
                      disabled={!replyContent.trim() || createReplyMutation.isPending}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <Send className="w-4 h-4" />
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

function PostCard({ post, onClick }) {
  const config = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.discussion;
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", config.color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={cn("text-xs", config.color)}>{config.label}</Badge>
            {post.is_pinned && (
              <Pin className="w-3 h-3 text-amber-500" />
            )}
          </div>
          <h4 className="font-medium text-slate-900 mb-1 line-clamp-1">
            {post.title || post.content.slice(0, 60)}
          </h4>
          <p className="text-sm text-slate-500 line-clamp-2">{post.content}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Avatar className="w-4 h-4">
                <AvatarImage src={post.author_avatar} />
                <AvatarFallback className="text-[8px]">{post.author_name?.[0]}</AvatarFallback>
              </Avatar>
              {post.author_name}
            </span>
            <span>{format(parseISO(post.created_date), 'MMM d')}</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {post.replies_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {post.likes_count || 0}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}