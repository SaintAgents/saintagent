import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  Pin, 
  Heart, 
  Reply, 
  Send, 
  Megaphone, 
  HelpCircle, 
  CheckCircle, 
  Link2,
  MoreVertical,
  Trash2,
  ListTodo,
  Upload,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  Users,
  Clock,
  CheckSquare,
  Square,
  UserPlus,
  Loader2
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const TYPE_CONFIG = {
  discussion: { label: 'Discussion', icon: MessageSquare, color: 'bg-slate-100 text-slate-700' },
  update: { label: 'Update', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
  question: { label: 'Question', icon: HelpCircle, color: 'bg-blue-100 text-blue-700' },
  task_update: { label: 'Task Update', icon: CheckCircle, color: 'bg-violet-100 text-violet-700' },
  announcement: { label: 'Announcement', icon: Megaphone, color: 'bg-amber-100 text-amber-700' },
  resource: { label: 'Resource', icon: Link2, color: 'bg-rose-100 text-rose-700' }
};

function BoardPost({ post, onReply, onLike, onDelete, isOwn, profiles }) {
  const [showReplies, setShowReplies] = useState(false);
  const config = TYPE_CONFIG[post.content_type] || TYPE_CONFIG.discussion;
  const Icon = config.icon;
  const authorProfile = profiles?.find(p => p.user_id === post.author_id);

  return (
    <div className={cn(
      "bg-white dark:bg-[#0a0a0a] rounded-xl border p-4",
      post.is_pinned && "border-amber-300 bg-amber-50/50 dark:bg-amber-900/10"
    )}>
      {post.is_pinned && (
        <div className="flex items-center gap-1.5 text-amber-600 text-xs font-medium mb-2">
          <Pin className="w-3.5 h-3.5" />
          Pinned
        </div>
      )}

      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.author_avatar || authorProfile?.avatar_url} />
          <AvatarFallback>{post.author_name?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-900 dark:text-white">{post.author_name}</span>
            <Badge className={cn("text-xs", config.color)}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            <span className="text-xs text-slate-400">
              {format(parseISO(post.created_date), 'MMM d, h:mm a')}
            </span>
          </div>

          {post.title && (
            <h4 className="font-semibold text-slate-900 dark:text-white mt-1">{post.title}</h4>
          )}

          <p className="text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">{post.content}</p>

          {post.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {post.attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  <Link2 className="w-3 h-3" />
                  {att.name || 'Attachment'}
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => onLike?.(post)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-rose-500 transition-colors text-sm"
            >
              <Heart className={cn("w-4 h-4", post.likes_count > 0 && "fill-rose-500 text-rose-500")} />
              {post.likes_count || 0}
            </button>
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-violet-500 transition-colors text-sm"
            >
              <Reply className="w-4 h-4" />
              {post.replies_count || 0} replies
            </button>
            {isOwn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onDelete?.(post)} className="text-rose-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MissionCollaborationBoard({ missionId, mission }) {
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState({ content: '', content_type: 'discussion', title: '' });
  const [filter, setFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['myProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles?.[0];
    },
    enabled: !!user?.email
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['missionBoard', missionId],
    queryFn: () => base44.entities.MissionBoard.filter({ mission_id: missionId }, '-created_date', 100),
    enabled: !!missionId,
    refetchInterval: 10000
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MissionBoard.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missionBoard', missionId] });
      setNewPost({ content: '', content_type: 'discussion', title: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MissionBoard.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['missionBoard', missionId] })
  });

  const handlePost = () => {
    if (!newPost.content.trim()) return;
    createMutation.mutate({
      mission_id: missionId,
      author_id: user?.email,
      author_name: user?.full_name,
      author_avatar: userProfile?.avatar_url,
      content_type: newPost.content_type,
      title: newPost.title,
      content: newPost.content
    });
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(p => p.content_type === filter);

  const pinnedPosts = filteredPosts.filter(p => p.is_pinned);
  const regularPosts = filteredPosts.filter(p => !p.is_pinned);

  return (
    <div className="space-y-4">
      {/* New Post */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={userProfile?.avatar_url} />
            <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Select value={newPost.content_type} onValueChange={(v) => setNewPost({ ...newPost, content_type: v })}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <config.icon className="w-3.5 h-3.5" />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(newPost.content_type === 'announcement' || newPost.content_type === 'resource') && (
          <Input
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            placeholder="Title (optional)"
            className="mb-2"
          />
        )}

        <Textarea
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          placeholder="Share an update, ask a question, or start a discussion..."
          rows={3}
        />

        <div className="flex justify-end mt-2">
          <Button
            onClick={handlePost}
            disabled={!newPost.content.trim() || createMutation.isPending}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Send className="w-4 h-4 mr-1.5" />
            Post
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        {Object.entries(TYPE_CONFIG).map(([key, config]) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key)}
            className="gap-1.5"
          >
            <config.icon className="w-3.5 h-3.5" />
            {config.label}
          </Button>
        ))}
      </div>

      {/* Posts */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {/* Pinned posts first */}
          {pinnedPosts.map(post => (
            <BoardPost
              key={post.id}
              post={post}
              isOwn={post.author_id === user?.email}
              onDelete={(p) => deleteMutation.mutate(p.id)}
              profiles={profiles}
            />
          ))}

          {/* Regular posts */}
          {regularPosts.map(post => (
            <BoardPost
              key={post.id}
              post={post}
              isOwn={post.author_id === user?.email}
              onDelete={(p) => deleteMutation.mutate(p.id)}
              profiles={profiles}
            />
          ))}

          {filteredPosts.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No posts yet. Start the conversation!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}