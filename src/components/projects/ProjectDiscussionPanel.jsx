import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, Plus, Pin, CheckCircle, Clock, 
  Lightbulb, AlertTriangle, Megaphone, Flag, Send,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const TYPE_CONFIG = {
  general: { label: 'General', icon: MessageSquare, color: 'bg-slate-100 text-slate-700' },
  decision: { label: 'Decision', icon: Flag, color: 'bg-violet-100 text-violet-700' },
  blocker: { label: 'Blocker', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
  idea: { label: 'Idea', icon: Lightbulb, color: 'bg-amber-100 text-amber-700' },
  update: { label: 'Update', icon: Megaphone, color: 'bg-blue-100 text-blue-700' },
  milestone: { label: 'Milestone', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
};

function DiscussionThread({ discussion, projectId, currentUser, profile }) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const queryClient = useQueryClient();

  const { data: replies = [] } = useQuery({
    queryKey: ['discussionReplies', discussion.id],
    queryFn: () => base44.entities.ProjectDiscussionReply.filter({ discussion_id: discussion.id }, 'created_date'),
    enabled: expanded
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ProjectDiscussionReply.create({
        discussion_id: discussion.id,
        project_id: projectId,
        author_id: currentUser.email,
        author_name: profile?.display_name || currentUser.full_name,
        author_avatar: profile?.avatar_url,
        content: replyText
      });
      await base44.entities.ProjectDiscussion.update(discussion.id, {
        reply_count: (discussion.reply_count || 0) + 1,
        last_reply_at: new Date().toISOString(),
        last_reply_by: profile?.display_name || currentUser.full_name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussionReplies', discussion.id] });
      queryClient.invalidateQueries({ queryKey: ['projectDiscussions', projectId] });
      setReplyText('');
    }
  });

  const resolveMutation = useMutation({
    mutationFn: () => base44.entities.ProjectDiscussion.update(discussion.id, { is_resolved: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projectDiscussions', projectId] })
  });

  const typeConfig = TYPE_CONFIG[discussion.discussion_type] || TYPE_CONFIG.general;
  const TypeIcon = typeConfig.icon;

  return (
    <div className={cn(
      "rounded-lg border transition-colors",
      discussion.is_resolved ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200 hover:border-violet-200"
    )}>
      {/* Header */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left"
      >
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8 shrink-0" data-user-id={discussion.author_id}>
            <AvatarImage src={discussion.author_avatar} />
            <AvatarFallback>{discussion.author_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("text-[10px] h-5", typeConfig.color)}>
                <TypeIcon className="w-3 h-3 mr-1" />
                {typeConfig.label}
              </Badge>
              {discussion.is_pinned && (
                <Pin className="w-3 h-3 text-amber-500" />
              )}
              {discussion.is_resolved && (
                <Badge className="text-[10px] h-5 bg-emerald-100 text-emerald-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
            <h4 className={cn(
              "text-sm font-medium mt-1",
              discussion.is_resolved ? "text-slate-500" : "text-slate-900"
            )}>
              {discussion.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>{discussion.author_name}</span>
              <span>•</span>
              <span>{format(parseISO(discussion.created_date), 'MMM d')}</span>
              {discussion.reply_count > 0 && (
                <>
                  <span>•</span>
                  <span>{discussion.reply_count} replies</span>
                </>
              )}
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-3 pb-3 border-t">
          {/* Original Content */}
          {discussion.content && (
            <p className="text-sm text-slate-700 py-3 whitespace-pre-wrap">{discussion.content}</p>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div className="space-y-3 py-3 border-t">
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-2 pl-4 border-l-2 border-slate-200">
                  <Avatar className="w-6 h-6 shrink-0" data-user-id={reply.author_id}>
                    <AvatarImage src={reply.author_avatar} />
                    <AvatarFallback className="text-[10px]">{reply.author_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-900">{reply.author_name}</span>
                      <span className="text-[10px] text-slate-400">{format(parseISO(reply.created_date), 'MMM d, h:mm a')}</span>
                    </div>
                    <p className="text-sm text-slate-700 mt-0.5">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply Input */}
          {!discussion.is_resolved && (
            <div className="flex gap-2 pt-3 border-t">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="text-sm min-h-[60px]"
                rows={2}
              />
              <div className="flex flex-col gap-1">
                <Button 
                  size="sm" 
                  className="h-8 px-3 bg-violet-600 hover:bg-violet-700"
                  onClick={() => replyMutation.mutate()}
                  disabled={!replyText.trim() || replyMutation.isPending}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
                {(discussion.discussion_type === 'blocker' || discussion.discussion_type === 'decision') && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-8 px-2 text-xs"
                    onClick={() => resolveMutation.mutate()}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectDiscussionPanel({ projectId }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('general');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    },
    enabled: !!currentUser
  });
  const profile = profiles?.[0];

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ['projectDiscussions', projectId],
    queryFn: () => base44.entities.ProjectDiscussion.filter({ project_id: projectId }, '-created_date'),
    enabled: !!projectId
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ProjectDiscussion.create({
        project_id: projectId,
        title: newTitle,
        content: newContent,
        author_id: currentUser.email,
        author_name: profile?.display_name || currentUser.full_name,
        author_avatar: profile?.avatar_url,
        discussion_type: newType
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDiscussions', projectId] });
      setCreateOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewType('general');
    }
  });

  const pinnedDiscussions = discussions.filter(d => d.is_pinned && !d.is_resolved);
  const activeDiscussions = discussions.filter(d => !d.is_pinned && !d.is_resolved);
  const resolvedDiscussions = discussions.filter(d => d.is_resolved);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-slate-900">Discussions</h3>
          <Badge variant="secondary" className="text-xs">{discussions.length}</Badge>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a Discussion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger>
                  <SelectValue placeholder="Discussion type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                placeholder="Discussion title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea 
                placeholder="Add details (optional)..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
              />
              <Button 
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={() => createMutation.mutate()}
                disabled={!newTitle.trim() || createMutation.isPending}
              >
                Create Discussion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Discussions List */}
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-lg" />)}
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No discussions yet</p>
          <p className="text-xs text-slate-400 mt-1">Start a conversation with your team</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pinned */}
          {pinnedDiscussions.map((d) => (
            <DiscussionThread key={d.id} discussion={d} projectId={projectId} currentUser={currentUser} profile={profile} />
          ))}
          
          {/* Active */}
          {activeDiscussions.map((d) => (
            <DiscussionThread key={d.id} discussion={d} projectId={projectId} currentUser={currentUser} profile={profile} />
          ))}

          {/* Resolved (collapsed) */}
          {resolvedDiscussions.length > 0 && (
            <details className="mt-4">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                {resolvedDiscussions.length} resolved discussions
              </summary>
              <div className="space-y-2 mt-2">
                {resolvedDiscussions.map((d) => (
                  <DiscussionThread key={d.id} discussion={d} projectId={projectId} currentUser={currentUser} profile={profile} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}