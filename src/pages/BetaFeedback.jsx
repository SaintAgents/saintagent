import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, Bug, Lightbulb, HelpCircle, Plus, CheckCircle2, Clock,
  ThumbsUp, Heart, Send, Eye, ChevronDown, ChevronUp, Zap, Coins, Trophy
} from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import BackButton from '@/components/hud/BackButton';
import BetaFeedbackModal from '@/components/feedback/BetaFeedbackModal';

const BETA_HERO_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/5924f334a_gemini-25-flash-image_A_playful_futuristic_feedback_space_inside_Saint_Agents_World_where_creativity_a-2.jpg";

const TYPE_CONFIG = {
  bug: { icon: Bug, color: 'bg-red-100 text-red-700', label: 'Bug' },
  suggestion: { icon: Lightbulb, color: 'bg-amber-100 text-amber-700', label: 'Suggestion' },
  comment: { icon: MessageSquare, color: 'bg-blue-100 text-blue-700', label: 'Comment' },
  other: { icon: HelpCircle, color: 'bg-slate-100 text-slate-700', label: 'Other' }
};

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Pending Review' },
  reviewed: { color: 'bg-blue-100 text-blue-700', label: 'Reviewed' },
  in_progress: { color: 'bg-purple-100 text-purple-700', label: 'In Progress' },
  resolved: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Resolved' },
  dismissed: { color: 'bg-slate-100 text-slate-700', label: 'Dismissed' }
};

export default function BetaFeedback() {
  const queryClient = useQueryClient();
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [newComment, setNewComment] = useState('');

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

  // Fetch ALL feedback (public feed)
  const { data: allFeedback = [], isLoading } = useQuery({
    queryKey: ['allBetaFeedback'],
    queryFn: () => base44.entities.BetaFeedback.list('-created_date', 100)
  });

  // Fetch platform settings for bonus period
  const { data: platformSettings } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: async () => {
      const settings = await base44.entities.PlatformSetting.list();
      return settings?.[0] || {};
    }
  });

  const bonusActive = platformSettings?.beta_bonus_active;
  const bonusMultiplier = platformSettings?.beta_bonus_multiplier || 2;
  const bonusEndTime = platformSettings?.beta_bonus_end_time;
  const lastPeriodEarnings = platformSettings?.beta_last_period_earnings || 0;
  const lastPeriodCount = platformSettings?.beta_last_period_feedback_count || 0;

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (feedback) => {
      const likedBy = feedback.liked_by || [];
      const hasLiked = likedBy.includes(currentUser.email);
      const newLikedBy = hasLiked 
        ? likedBy.filter(id => id !== currentUser.email)
        : [...likedBy, currentUser.email];
      await base44.entities.BetaFeedback.update(feedback.id, {
        liked_by: newLikedBy,
        likes_count: newLikedBy.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allBetaFeedback'] })
  });

  // Love mutation
  const loveMutation = useMutation({
    mutationFn: async (feedback) => {
      const lovedBy = feedback.loved_by || [];
      const hasLoved = lovedBy.includes(currentUser.email);
      const newLovedBy = hasLoved 
        ? lovedBy.filter(id => id !== currentUser.email)
        : [...lovedBy, currentUser.email];
      await base44.entities.BetaFeedback.update(feedback.id, {
        loved_by: newLovedBy,
        loves_count: newLovedBy.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allBetaFeedback'] })
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ feedback, content }) => {
      const comments = feedback.comments || [];
      const newComment = {
        id: Date.now().toString(),
        user_id: currentUser.email,
        user_name: profile?.display_name || currentUser.full_name,
        user_avatar: profile?.avatar_url,
        content,
        created_at: new Date().toISOString()
      };
      await base44.entities.BetaFeedback.update(feedback.id, {
        comments: [...comments, newComment]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBetaFeedback'] });
      setNewComment('');
    }
  });

  // Track view
  const trackView = async (feedback) => {
    await base44.entities.BetaFeedback.update(feedback.id, {
      view_count: (feedback.view_count || 0) + 1
    });
  };

  const handleAddComment = (feedback) => {
    if (!newComment.trim()) return;
    commentMutation.mutate({ feedback, content: newComment.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent dark:bg-none relative">
      {/* Hero Section */}
      <div className="page-hero relative h-48 md:h-56 overflow-hidden">
        <img
          src={BETA_HERO_IMAGE}
          alt="Beta Feedback"
          className="hero-image w-full h-full object-cover"
          style={{ filter: 'none', WebkitFilter: 'none', opacity: 1, display: 'block', visibility: 'visible' }}
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 hero-content">
          <div className="flex items-center gap-3 mb-2">
            <BackButton className="text-white/80 hover:text-white" />
            <MessageSquare className="w-7 h-7 text-violet-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              Beta Feedback
            </h1>
          </div>
          <p className="text-white/80">Help us improve by sharing your feedback</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-6">

        {/* Bonus Period Banner */}
        {bonusActive && (
          <Card className="mb-4 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-full animate-pulse">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-amber-800">🎉 BONUS TEST PERIOD ACTIVE!</h3>
                    <Badge className="bg-amber-500 text-white">{bonusMultiplier}x Rewards</Badge>
                  </div>
                  <p className="text-sm text-amber-700">
                    Earn {(0.03 * bonusMultiplier).toFixed(2)} GGG per feedback (normally 0.03)
                    {bonusEndTime && ` • Ends ${formatDistanceToNow(new Date(bonusEndTime), { addSuffix: true })}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earnings Info Card */}
        <Card className="mb-4 border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8 text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">Beta Testing Earns GGG!</h3>
                  <p className="text-sm text-slate-600">
                    Submit feedback: <span className="font-bold text-emerald-600">+{bonusActive ? (0.03 * bonusMultiplier).toFixed(2) : '0.03'} GGG</span>
                    {' • '}Bug fixed bonus: <span className="font-bold text-emerald-600">+{bonusActive ? (0.03 * bonusMultiplier).toFixed(2) : '0.03'} GGG</span>
                  </p>
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    💡 Watch for bonus test periods with {bonusMultiplier}x rewards!
                  </p>
                </div>
              </div>
              {lastPeriodEarnings > 0 && (
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1 text-amber-600">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs font-medium">Last Period</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">{lastPeriodEarnings.toFixed(2)} GGG</p>
                  <p className="text-xs text-slate-500">{lastPeriodCount} submissions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit CTA */}
        <Card className="mb-6 border-violet-200 bg-violet-50/50">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-10 h-10 text-violet-600 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Found a bug? Have a suggestion?</h2>
            <p className="text-slate-600 mb-4">Your feedback helps us build a better platform for everyone.</p>
            <Button 
              className="bg-violet-600 hover:bg-violet-700 gap-2"
              onClick={() => setSubmitModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Submit Feedback
              {bonusActive && <Badge className="ml-1 bg-amber-500 text-white text-xs">{bonusMultiplier}x</Badge>}
            </Button>
          </CardContent>
        </Card>

        {/* Community Feedback Feed */}
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Community Feedback</h3>
        
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : allFeedback.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No feedback submitted yet. Be the first!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {allFeedback.map((feedback) => {
              const typeConfig = TYPE_CONFIG[feedback.feedback_type] || TYPE_CONFIG.other;
              const statusConfig = STATUS_CONFIG[feedback.status] || STATUS_CONFIG.pending;
              const TypeIcon = typeConfig.icon;
              const isExpanded = expandedFeedback === feedback.id;
              const hasLiked = (feedback.liked_by || []).includes(currentUser?.email);
              const hasLoved = (feedback.loved_by || []).includes(currentUser?.email);
              const comments = feedback.comments || [];

              return (
                <Card key={feedback.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge className={typeConfig.color} variant="secondary">{typeConfig.label}</Badge>
                          <Badge className={statusConfig.color} variant="secondary">{statusConfig.label}</Badge>
                          <span className="text-xs text-slate-400">
                            by {feedback.reporter_name || 'Anonymous'}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm">{feedback.description}</p>
                        
                        {/* Stats Row */}
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <button
                            onClick={() => likeMutation.mutate(feedback)}
                            className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                            <span>{feedback.likes_count || 0}</span>
                          </button>
                          <button
                            onClick={() => loveMutation.mutate(feedback)}
                            className={`flex items-center gap-1.5 transition-colors ${hasLoved ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'}`}
                          >
                            <Heart className={`w-4 h-4 ${hasLoved ? 'fill-current' : ''}`} />
                            <span>{feedback.loves_count || 0}</span>
                          </button>
                          <button
                            onClick={() => {
                              if (!isExpanded) trackView(feedback);
                              setExpandedFeedback(isExpanded ? null : feedback.id);
                            }}
                            className="flex items-center gap-1.5 text-slate-500 hover:text-violet-600 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{comments.length}</span>
                          </button>
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Eye className="w-4 h-4" />
                            <span>{feedback.view_count || 0}</span>
                          </span>
                          <span className="text-xs text-slate-400 ml-auto">
                            {format(new Date(feedback.created_date), 'MMM d, yyyy')}
                          </span>
                          <button
                            onClick={() => setExpandedFeedback(isExpanded ? null : feedback.id)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Expanded Comments Section */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            {/* Comments List */}
                            {comments.length > 0 && (
                              <ScrollArea className="max-h-48 mb-4">
                                <div className="space-y-3">
                                  {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-2">
                                      <Avatar className="w-7 h-7">
                                        <AvatarImage src={comment.user_avatar} />
                                        <AvatarFallback className="text-xs bg-slate-100">
                                          {comment.user_name?.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="bg-slate-50 rounded-lg px-3 py-2">
                                          <p className="text-xs font-medium text-slate-700">{comment.user_name}</p>
                                          <p className="text-sm text-slate-600">{comment.content}</p>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">
                                          {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            )}

                            {/* Add Comment Input */}
                            <div className="flex gap-2">
                              <Input
                                placeholder="Leave a comment..."
                                value={expandedFeedback === feedback.id ? newComment : ''}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(feedback)}
                                className="flex-1 h-9"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAddComment(feedback)}
                                disabled={!newComment.trim() || commentMutation.isPending}
                                className="bg-violet-600 hover:bg-violet-700 h-9"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Submit Feedback Modal */}
        <BetaFeedbackModal 
          open={submitModalOpen} 
          onClose={() => {
            setSubmitModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['myBetaFeedback'] });
          }} 
        />
      </div>
    </div>
  );
}