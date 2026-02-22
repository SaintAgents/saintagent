import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, X, Send, Reply, Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

export default function InlineComments({ projectId, profile, currentUser, editorRef }) {
  const [selectedText, setSelectedText] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch inline comments
  const { data: comments = [] } = useQuery({
    queryKey: ['inlineComments', projectId],
    queryFn: async () => {
      const allComments = await base44.entities.ContentComment.filter({ 
        project_id: projectId,
        is_inline: true
      });
      return allComments.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!projectId
  });

  // Subscribe to real-time comment updates
  useEffect(() => {
    if (!projectId) return;
    const unsubscribe = base44.entities.ContentComment.subscribe((event) => {
      if (event.data?.project_id === projectId) {
        queryClient.invalidateQueries({ queryKey: ['inlineComments', projectId] });
      }
    });
    return unsubscribe;
  }, [projectId, queryClient]);

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.ContentComment.create({
        project_id: projectId,
        author_id: currentUser.email,
        author_name: profile?.display_name || currentUser.full_name,
        author_avatar: profile?.avatar_url,
        content: data.content,
        is_inline: true,
        highlighted_text: data.highlightedText,
        text_position: data.position,
        parent_comment_id: data.parentId,
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inlineComments', projectId] });
      setCommentText('');
      setShowCommentInput(false);
      setSelectedText(null);
      setReplyingTo(null);
      setReplyText('');
    }
  });

  // Resolve comment mutation
  const resolveCommentMutation = useMutation({
    mutationFn: (commentId) => base44.entities.ContentComment.update(commentId, { status: 'resolved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inlineComments', projectId] })
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => base44.entities.ContentComment.delete(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inlineComments', projectId] })
  });

  // Listen for text selection
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString()?.trim();
      
      if (text && text.length > 0 && editorRef?.current?.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        
        setSelectedText({
          text,
          position: {
            top: rect.top - editorRect.top,
            left: rect.left - editorRect.left,
            width: rect.width
          }
        });
      } else if (!showCommentInput) {
        setSelectedText(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [editorRef, showCommentInput]);

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedText) return;
    createCommentMutation.mutate({
      content: commentText,
      highlightedText: selectedText.text,
      position: JSON.stringify(selectedText.position)
    });
  };

  const handleReply = (parentId) => {
    if (!replyText.trim()) return;
    createCommentMutation.mutate({
      content: replyText,
      parentId
    });
  };

  // Group comments by thread (parent comments with replies)
  const threadedComments = comments.reduce((acc, comment) => {
    if (!comment.parent_comment_id) {
      acc[comment.id] = { ...comment, replies: [] };
    }
    return acc;
  }, {});

  comments.forEach(comment => {
    if (comment.parent_comment_id && threadedComments[comment.parent_comment_id]) {
      threadedComments[comment.parent_comment_id].replies.push(comment);
    }
  });

  return (
    <>
      {/* Selection tooltip for adding comment */}
      <AnimatePresence>
        {selectedText && !showCommentInput && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 bg-slate-900 rounded-lg shadow-xl px-2 py-1"
            style={{
              top: selectedText.position.top - 40,
              left: selectedText.position.left + selectedText.position.width / 2,
              transform: 'translateX(-50%)'
            }}
          >
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-slate-700 h-8 gap-1"
              onClick={() => setShowCommentInput(true)}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Comment
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment input popup */}
      <AnimatePresence>
        {showCommentInput && selectedText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 bg-white rounded-lg shadow-xl border border-slate-200 p-3 w-72"
            style={{
              top: selectedText.position.top + 10,
              left: selectedText.position.left
            }}
          >
            <div className="flex items-start gap-2 mb-2">
              <div className="text-xs text-slate-500 italic line-clamp-2 flex-1">
                "{selectedText.text}"
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => {
                  setShowCommentInput(false);
                  setSelectedText(null);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="text-sm resize-none mb-2"
              rows={2}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!commentText.trim() || createCommentMutation.isPending}
                className="h-7"
              >
                <Send className="w-3 h-3 mr-1" />
                Comment
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment markers in the editor */}
      {Object.values(threadedComments).map((comment) => {
        if (comment.status === 'resolved') return null;
        let position;
        try {
          position = JSON.parse(comment.text_position);
        } catch {
          return null;
        }

        return (
          <div
            key={comment.id}
            className="absolute cursor-pointer"
            style={{ top: position.top, right: -24 }}
            onClick={() => setActiveCommentId(activeCommentId === comment.id ? null : comment.id)}
          >
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all",
              activeCommentId === comment.id 
                ? "bg-violet-600 text-white" 
                : "bg-amber-400 text-amber-900 hover:bg-amber-500"
            )}>
              <MessageSquare className="w-3 h-3" />
            </div>

            {/* Comment thread popup */}
            <AnimatePresence>
              {activeCommentId === comment.id && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute right-8 top-0 w-72 bg-white rounded-lg shadow-xl border border-slate-200 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 border-b border-slate-100">
                    <div className="text-xs text-slate-500 italic mb-2 line-clamp-2">
                      "{comment.highlighted_text}"
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {/* Main comment */}
                    <CommentItem
                      comment={comment}
                      currentUser={currentUser}
                      onResolve={() => resolveCommentMutation.mutate(comment.id)}
                      onDelete={() => deleteCommentMutation.mutate(comment.id)}
                      onReply={() => setReplyingTo(comment.id)}
                    />

                    {/* Replies */}
                    {comment.replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        currentUser={currentUser}
                        onDelete={() => deleteCommentMutation.mutate(reply.id)}
                        isReply
                      />
                    ))}
                  </div>

                  {/* Reply input */}
                  {replyingTo === comment.id && (
                    <div className="p-3 border-t border-slate-100">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Reply..."
                        className="text-sm resize-none mb-2"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-7"
                          onClick={() => handleReply(comment.id)}
                          disabled={!replyText.trim()}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}

                  {replyingTo !== comment.id && (
                    <div className="p-2 border-t border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-7 text-slate-600"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}

function CommentItem({ comment, currentUser, onResolve, onDelete, onReply, isReply = false }) {
  const isOwner = comment.author_id === currentUser?.email;

  return (
    <div className={cn("p-3", isReply && "pl-6 bg-slate-50")}>
      <div className="flex items-start gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={comment.author_avatar} />
          <AvatarFallback className="text-xs">
            {comment.author_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-900 truncate">
              {comment.author_name}
            </span>
            <span className="text-xs text-slate-400">
              {format(new Date(comment.created_date), 'MMM d')}
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">{comment.content}</p>
        </div>
      </div>

      {!isReply && (
        <div className="flex items-center gap-1 mt-2 ml-8">
          {onResolve && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={onResolve}
            >
              <Check className="w-3 h-3 mr-1" />
              Resolve
            </Button>
          )}
          {isOwner && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}