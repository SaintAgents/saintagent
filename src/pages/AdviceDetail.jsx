import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  ChevronUp, 
  MessageSquare, 
  User,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Send
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import AIInsightPanel from '@/components/advice/AIInsightPanel';
import AnswerCard from '@/components/advice/AnswerCard';
import WisdomLeaderboard from '@/components/advice/WisdomLeaderboard';

const CATEGORY_COLORS = {
  relationships: 'bg-pink-100 text-pink-700',
  business: 'bg-blue-100 text-blue-700',
  spiritual: 'bg-purple-100 text-purple-700',
  health: 'bg-green-100 text-green-700',
  family: 'bg-orange-100 text-orange-700',
  personal_growth: 'bg-teal-100 text-teal-700',
  finance: 'bg-emerald-100 text-emerald-700',
  legal: 'bg-red-100 text-red-700',
  technology: 'bg-cyan-100 text-cyan-700',
  other: 'bg-slate-100 text-slate-700'
};

const CATEGORY_LABELS = {
  relationships: 'Relationships',
  business: 'Business',
  spiritual: 'Spiritual',
  health: 'Health',
  family: 'Family',
  personal_growth: 'Personal Growth',
  finance: 'Finance',
  legal: 'Legal',
  technology: 'Technology',
  other: 'Other'
};

const ANSWER_TAGS = [
  { value: 'practical', label: 'Practical' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'emotional_support', label: 'Emotional Support' },
  { value: 'legal', label: 'Legal Suggestion' },
  { value: 'technical', label: 'Technical' }
];

export default function AdviceDetailPage() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const questionId = urlParams.get('id');

  const [answerContent, setAnswerContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      return profiles[0];
    },
    enabled: !!currentUser?.email
  });

  const { data: question, isLoading } = useQuery({
    queryKey: ['adviceQuestion', questionId],
    queryFn: () => base44.entities.AdviceQuestion.filter({ id: questionId }).then(r => r[0]),
    enabled: !!questionId
  });

  const { data: answers = [] } = useQuery({
    queryKey: ['adviceAnswers', questionId],
    queryFn: () => base44.entities.AdviceAnswer.filter({ question_id: questionId }, '-created_date', 100),
    enabled: !!questionId
  });

  const { data: userVotes = [] } = useQuery({
    queryKey: ['userAnswerVotes', currentUser?.email, questionId],
    queryFn: () => base44.entities.AdviceVote.filter({ 
      user_id: currentUser.email, 
      target_type: 'answer' 
    }),
    enabled: !!currentUser?.email
  });

  const { data: wisdomScores = [] } = useQuery({
    queryKey: ['answerWisdomScores', answers.map(a => a.author_id)],
    queryFn: async () => {
      if (answers.length === 0) return [];
      const authorIds = [...new Set(answers.map(a => a.author_id))];
      const results = await Promise.all(
        authorIds.map(id => base44.entities.WisdomScore.filter({ user_id: id }))
      );
      return results.flat();
    },
    enabled: answers.length > 0
  });

  const getWisdomScore = (userId) => wisdomScores.find(s => s.user_id === userId);
  const getUserVote = (answerId) => userVotes.find(v => v.target_id === answerId)?.vote_type;
  const getUserHelpful = (answerId) => userVotes.some(v => v.target_id === answerId && v.vote_type === 'helpful');

  const isQuestionAuthor = currentUser?.email === question?.author_id;
  const showWarning = question?.category === 'health' || question?.category === 'legal';

  // Submit answer
  const submitAnswerMutation = useMutation({
    mutationFn: async () => {
      const answer = await base44.entities.AdviceAnswer.create({
        question_id: questionId,
        author_id: currentUser.email,
        author_name: profile?.display_name || currentUser.full_name,
        author_avatar: profile?.avatar_url,
        content: answerContent,
        tags: selectedTags
      });

      // Update question answer count
      await base44.entities.AdviceQuestion.update(questionId, {
        answer_count: (question?.answer_count || 0) + 1
      });

      // Update wisdom score
      const scores = await base44.entities.WisdomScore.filter({ user_id: currentUser.email });
      if (scores.length > 0) {
        await base44.entities.WisdomScore.update(scores[0].id, {
          answers_given: (scores[0].answers_given || 0) + 1,
          wisdom_points: (scores[0].wisdom_points || 0) + 5
        });
      } else {
        await base44.entities.WisdomScore.create({
          user_id: currentUser.email,
          answers_given: 1,
          wisdom_points: 5
        });
      }

      return answer;
    },
    onSuccess: () => {
      setAnswerContent('');
      setSelectedTags([]);
      queryClient.invalidateQueries({ queryKey: ['adviceAnswers', questionId] });
      queryClient.invalidateQueries({ queryKey: ['adviceQuestion', questionId] });
      queryClient.invalidateQueries({ queryKey: ['wisdomScores'] });
    }
  });

  // Vote mutations
  const voteMutation = useMutation({
    mutationFn: async ({ answerId, voteType }) => {
      const existingVote = userVotes.find(v => v.target_id === answerId && v.vote_type === voteType);
      const answer = answers.find(a => a.id === answerId);

      if (existingVote) {
        await base44.entities.AdviceVote.delete(existingVote.id);
        if (answer) {
          const field = voteType === 'upvote' ? 'upvotes' : voteType === 'downvote' ? 'downvotes' : 'helpful_count';
          await base44.entities.AdviceAnswer.update(answerId, {
            [field]: Math.max(0, (answer[field] || 1) - 1)
          });
        }
      } else {
        // Remove opposite vote if exists
        const oppositeType = voteType === 'upvote' ? 'downvote' : voteType === 'downvote' ? 'upvote' : null;
        if (oppositeType) {
          const oppositeVote = userVotes.find(v => v.target_id === answerId && v.vote_type === oppositeType);
          if (oppositeVote) {
            await base44.entities.AdviceVote.delete(oppositeVote.id);
            const field = oppositeType === 'upvote' ? 'upvotes' : 'downvotes';
            await base44.entities.AdviceAnswer.update(answerId, {
              [field]: Math.max(0, (answer[field] || 1) - 1)
            });
          }
        }

        await base44.entities.AdviceVote.create({
          user_id: currentUser.email,
          target_type: 'answer',
          target_id: answerId,
          vote_type: voteType
        });

        if (answer) {
          const field = voteType === 'upvote' ? 'upvotes' : voteType === 'downvote' ? 'downvotes' : 'helpful_count';
          await base44.entities.AdviceAnswer.update(answerId, {
            [field]: (answer[field] || 0) + 1
          });

          // Update author wisdom score for upvotes/helpful
          if (voteType === 'upvote' || voteType === 'helpful') {
            const authorScores = await base44.entities.WisdomScore.filter({ user_id: answer.author_id });
            if (authorScores.length > 0) {
              const points = voteType === 'helpful' ? 10 : 2;
              await base44.entities.WisdomScore.update(authorScores[0].id, {
                wisdom_points: (authorScores[0].wisdom_points || 0) + points,
                ...(voteType === 'helpful' ? { helpful_count: (authorScores[0].helpful_count || 0) + 1 } : {})
              });
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adviceAnswers', questionId] });
      queryClient.invalidateQueries({ queryKey: ['userAnswerVotes'] });
      queryClient.invalidateQueries({ queryKey: ['wisdomScores'] });
    }
  });

  // Accept answer
  const acceptMutation = useMutation({
    mutationFn: async (answerId) => {
      // Unaccept previous
      const previousAccepted = answers.find(a => a.is_accepted);
      if (previousAccepted) {
        await base44.entities.AdviceAnswer.update(previousAccepted.id, { is_accepted: false });
      }

      await base44.entities.AdviceAnswer.update(answerId, { is_accepted: true });
      await base44.entities.AdviceQuestion.update(questionId, {
        status: 'resolved',
        accepted_answer_id: answerId
      });

      // Award wisdom points
      const answer = answers.find(a => a.id === answerId);
      if (answer) {
        const authorScores = await base44.entities.WisdomScore.filter({ user_id: answer.author_id });
        if (authorScores.length > 0) {
          await base44.entities.WisdomScore.update(authorScores[0].id, {
            wisdom_points: (authorScores[0].wisdom_points || 0) + 25,
            accepted_answers: (authorScores[0].accepted_answers || 0) + 1
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adviceAnswers', questionId] });
      queryClient.invalidateQueries({ queryKey: ['adviceQuestion', questionId] });
      queryClient.invalidateQueries({ queryKey: ['wisdomScores'] });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Question not found</p>
          <Link to={createPageUrl('Advice')}>
            <Button variant="outline">Back to Advice</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.is_accepted && !b.is_accepted) return -1;
    if (!a.is_accepted && b.is_accepted) return 1;
    return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
  });

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to={createPageUrl('Advice')} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Questions
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Warning Banner */}
            {showWarning && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  {question.category === 'health' 
                    ? 'Health advice provided here does not constitute medical professional counsel.'
                    : 'Legal advice provided here does not constitute professional legal counsel.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Question Card */}
            <Card className="bg-white border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className={cn("text-sm", CATEGORY_COLORS[question.category])}>
                      {CATEGORY_LABELS[question.category]}
                    </Badge>
                    {question.status === 'resolved' && (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-slate-500">
                    {formatDistanceToNow(new Date(question.created_date), { addSuffix: true })}
                  </span>
                </div>

                <h1 className="text-2xl font-serif font-bold text-slate-900 mb-4">
                  {question.title}
                </h1>

                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mb-6">
                  {question.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    {question.is_anonymous ? (
                      <div className="flex items-center gap-2 text-slate-500">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-sm">Anonymous</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2" data-user-id={question.author_id}>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={question.author_avatar} />
                          <AvatarFallback>{question.author_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-slate-700">{question.author_name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <ChevronUp className="w-4 h-4" />
                      {question.upvote_count || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {question.answer_count || 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insight Panel */}
            {question.request_ai_insight && (
              <AIInsightPanel 
                question={question} 
                canRegenerate={isQuestionAuthor}
              />
            )}

            {/* Answers Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
              </h2>

              {sortedAnswers.map(answer => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  wisdomScore={getWisdomScore(answer.author_id)}
                  isQuestionAuthor={isQuestionAuthor}
                  onUpvote={(id) => voteMutation.mutate({ answerId: id, voteType: 'upvote' })}
                  onDownvote={(id) => voteMutation.mutate({ answerId: id, voteType: 'downvote' })}
                  onMarkHelpful={(id) => voteMutation.mutate({ answerId: id, voteType: 'helpful' })}
                  onAccept={(id) => acceptMutation.mutate(id)}
                  onFlag={(id) => console.log('Flag answer:', id)}
                  userVote={getUserVote(answer.id)}
                  userHelpful={getUserHelpful(answer.id)}
                />
              ))}

              {answers.length === 0 && (
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No answers yet. Be the first to share your wisdom!</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Submit Answer */}
            {question.allow_public_replies && (
              <Card className="bg-white border-slate-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Share Your Wisdom</h3>
                  
                  <Textarea
                    placeholder="Share your advice, experience, or insights..."
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    className="min-h-[150px] mb-4"
                  />

                  <div className="mb-4">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      Tag your answer (optional)
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {ANSWER_TAGS.map(tag => (
                        <label 
                          key={tag.value}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors",
                            selectedTags.includes(tag.value) 
                              ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          <Checkbox
                            checked={selectedTags.includes(tag.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTags([...selectedTags, tag.value]);
                              } else {
                                setSelectedTags(selectedTags.filter(t => t !== tag.value));
                              }
                            }}
                            className="hidden"
                          />
                          <span className="text-sm">{tag.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => submitAnswerMutation.mutate()}
                      disabled={!answerContent.trim() || submitAnswerMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submitAnswerMutation.isPending ? 'Posting...' : 'Post Answer'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <WisdomLeaderboard limit={5} />

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong>Disclaimer:</strong> Advice provided here does not constitute legal, medical, 
                or financial professional counsel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}