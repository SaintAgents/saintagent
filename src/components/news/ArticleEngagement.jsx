import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Sparkles, MessageCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

export default function ArticleEngagement({ article, compact = false }) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(!compact);
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

  const { data: likes = [] } = useQuery({
    queryKey: ['articleLikes', article?.id],
    queryFn: () => base44.entities.ArticleLike.filter({ article_id: article.id }),
    enabled: !!article?.id
  });

  const { data: resonances = [] } = useQuery({
    queryKey: ['articleResonances', article?.id],
    queryFn: () => base44.entities.ArticleResonance.filter({ article_id: article.id }),
    enabled: !!article?.id
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['articleComments', article?.id],
    queryFn: () => base44.entities.ArticleComment.filter({ article_id: article.id }, '-created_date', 50),
    enabled: !!article?.id && showComments
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const existing = likes.find(l => l.user_id === currentUser.email);
      if (existing) {
        await base44.entities.ArticleLike.delete(existing.id);
        await base44.entities.NewsArticle.update(article.id, { 
          likes_count: Math.max(0, (article.likes_count || 0) - 1) 
        });
      } else {
        await base44.entities.ArticleLike.create({ 
          article_id: article.id, 
          user_id: currentUser.email 
        });
        await base44.entities.NewsArticle.update(article.id, { 
          likes_count: (article.likes_count || 0) + 1 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articleLikes'] });
      queryClient.invalidateQueries({ queryKey: ['newsArticles'] });
    }
  });

  const resonanceMutation = useMutation({
    mutationFn: async () => {
      const existing = resonances.find(r => r.user_id === currentUser.email);
      if (existing) {
        await base44.entities.ArticleResonance.delete(existing.id);
        await base44.entities.NewsArticle.update(article.id, { 
          resonance_count: Math.max(0, (article.resonance_count || 0) - 1) 
        });
      } else {
        await base44.entities.ArticleResonance.create({ 
          article_id: article.id, 
          user_id: currentUser.email 
        });
        await base44.entities.NewsArticle.update(article.id, { 
          resonance_count: (article.resonance_count || 0) + 1 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articleResonances'] });
      queryClient.invalidateQueries({ queryKey: ['newsArticles'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.ArticleComment.create({
        article_id: article.id,
        author_id: currentUser.email,
        author_name: profile?.display_name || currentUser.full_name,
        author_avatar: profile?.avatar_url,
        content
      });
      await base44.entities.NewsArticle.update(article.id, { 
        comments_count: (article.comments_count || 0) + 1 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articleComments'] });
      queryClient.invalidateQueries({ queryKey: ['newsArticles'] });
      setCommentText('');
    }
  });

  const handleComment = () => {
    if (commentText.trim()) {
      commentMutation.mutate(commentText.trim());
    }
  };

  const isLiked = likes.some(l => l.user_id === currentUser?.email);
  const isResonating = resonances.some(r => r.user_id === currentUser?.email);

  if (!article) return null;

  return (
    <div className="space-y-4">
      {/* Engagement Actions */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => likeMutation.mutate()}
          className={cn(
            "gap-2 transition-all",
            isLiked ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-400 hover:text-rose-600"
          )}
        >
          <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
          <span className="font-semibold">{article.likes_count || 0}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => resonanceMutation.mutate()}
          className={cn(
            "gap-2 transition-all",
            isResonating ? "text-violet-600 dark:text-violet-400" : "text-slate-600 dark:text-slate-400 hover:text-violet-600"
          )}
        >
          <Sparkles className={cn("w-5 h-5", isResonating && "fill-current")} />
          <span className="font-semibold">{article.resonance_count || 0}</span>
          <span className="text-xs">Resonance</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="gap-2 text-slate-600 dark:text-slate-400 hover:text-violet-600"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">{article.comments_count || 0}</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4">
          {/* Comment Input */}
          <div className="flex gap-2">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
                {profile?.display_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="text-sm"
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleComment()}
              />
              <Button
                onClick={handleComment}
                disabled={!commentText.trim() || commentMutation.isPending}
                size="icon"
                className="bg-violet-600 hover:bg-violet-700 h-9 w-9 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="w-7 h-7 shrink-0 cursor-pointer" data-user-id={comment.author_id}>
                    <AvatarImage src={comment.author_avatar} />
                    <AvatarFallback className="text-xs">
                      {comment.author_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-violet-600" data-user-id={comment.author_id}>
                        {comment.author_name}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {format(parseISO(comment.created_date), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}