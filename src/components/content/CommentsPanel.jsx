import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Check, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function CommentsPanel({ projectId, profile }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments = [] } = useQuery({
    queryKey: ['contentComments', projectId],
    queryFn: () => base44.entities.ContentComment.filter({ project_id: projectId }, '-created_date', 100),
    enabled: !!projectId
  });

  const createCommentMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ContentComment.create({
        project_id: projectId,
        author_id: profile.user_id,
        author_name: profile.display_name,
        author_avatar: profile.avatar_url,
        content: newComment,
        comment_type: 'comment',
        status: 'open'
      });
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['contentComments', projectId] });
    }
  });

  const resolveCommentMutation = useMutation({
    mutationFn: (commentId) => base44.entities.ContentComment.update(commentId, {
      status: 'resolved',
      resolved_by: profile.user_id,
      resolved_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentComments', projectId] });
    }
  });

  const openComments = comments.filter(c => c.status === 'open');
  const resolvedComments = comments.filter(c => c.status === 'resolved');

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Comments</h3>
          <Badge variant="secondary">{openComments.length} open</Badge>
        </div>
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
          />
          <Button 
            onClick={() => createCommentMutation.mutate()}
            disabled={!newComment.trim() || createCommentMutation.isPending}
            size="sm"
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Post Comment
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No comments yet</p>
            </div>
          ) : (
            <>
              {openComments.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Open</h4>
                  <div className="space-y-3">
                    {openComments.map(comment => (
                      <div key={comment.id} className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <div className="flex items-start gap-2 mb-2">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={comment.author_avatar} />
                            <AvatarFallback className="text-xs">{comment.author_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900">{comment.author_name}</p>
                            <p className="text-xs text-slate-500">{format(parseISO(comment.created_date), 'MMM d, h:mm a')}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => resolveCommentMutation.mutate(comment.id)}
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resolvedComments.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Resolved</h4>
                  <div className="space-y-2">
                    {resolvedComments.map(comment => (
                      <div key={comment.id} className="p-3 rounded-lg bg-slate-50 opacity-75">
                        <div className="flex items-start gap-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={comment.author_avatar} />
                            <AvatarFallback className="text-xs">{comment.author_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium text-slate-900">{comment.author_name}</p>
                            <p className="text-xs text-slate-500">{format(parseISO(comment.created_date), 'MMM d')}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}