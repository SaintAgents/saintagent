import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquarePlus, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import AskQuestionModal from '@/components/advice/AskQuestionModal';
import QuestionCard from '@/components/advice/QuestionCard';
import WisdomLeaderboard from '@/components/advice/WisdomLeaderboard';

const CATEGORIES = [
  { value: 'all', label: 'All Topics' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'business', label: 'Business' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'health', label: 'Health' },
  { value: 'family', label: 'Family' },
  { value: 'personal_growth', label: 'Personal Growth' },
  { value: 'finance', label: 'Finance' },
  { value: 'legal', label: 'Legal' },
  { value: 'technology', label: 'Technology' },
  { value: 'other', label: 'Other' }
];

export default function AdvicePage() {
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const queryClient = useQueryClient();

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

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['adviceQuestions', selectedCategory, sortBy],
    queryFn: async () => {
      const sortField = sortBy === 'recent' ? '-created_date' : 
                        sortBy === 'popular' ? '-upvote_count' : '-answer_count';
      
      if (selectedCategory === 'all') {
        return base44.entities.AdviceQuestion.list(sortField, 50);
      }
      return base44.entities.AdviceQuestion.filter({ category: selectedCategory }, sortField, 50);
    }
  });

  const { data: userVotes = [] } = useQuery({
    queryKey: ['userVotes', currentUser?.email],
    queryFn: () => base44.entities.AdviceVote.filter({ 
      user_id: currentUser.email, 
      target_type: 'question' 
    }),
    enabled: !!currentUser?.email
  });

  const userUpvotes = userVotes.filter(v => v.vote_type === 'upvote');
  const userLikes = userVotes.filter(v => v.vote_type === 'like');
  const userResonances = userVotes.filter(v => v.vote_type === 'resonance');

  const upvoteMutation = useMutation({
    mutationFn: async (questionId) => {
      const existingVote = userUpvotes.find(v => v.target_id === questionId);
      
      if (existingVote) {
        await base44.entities.AdviceVote.delete(existingVote.id);
        const question = questions.find(q => q.id === questionId);
        if (question) {
          await base44.entities.AdviceQuestion.update(questionId, {
            upvote_count: Math.max(0, (question.upvote_count || 1) - 1)
          });
        }
      } else {
        await base44.entities.AdviceVote.create({
          user_id: currentUser.email,
          target_type: 'question',
          target_id: questionId,
          vote_type: 'upvote'
        });
        const question = questions.find(q => q.id === questionId);
        if (question) {
          await base44.entities.AdviceQuestion.update(questionId, {
            upvote_count: (question.upvote_count || 0) + 1
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adviceQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (questionId) => {
      const existingVote = userLikes.find(v => v.target_id === questionId);
      
      if (existingVote) {
        await base44.entities.AdviceVote.delete(existingVote.id);
        const question = questions.find(q => q.id === questionId);
        if (question) {
          await base44.entities.AdviceQuestion.update(questionId, {
            like_count: Math.max(0, (question.like_count || 1) - 1)
          });
        }
      } else {
        await base44.entities.AdviceVote.create({
          user_id: currentUser.email,
          target_type: 'question',
          target_id: questionId,
          vote_type: 'like'
        });
        const question = questions.find(q => q.id === questionId);
        if (question) {
          await base44.entities.AdviceQuestion.update(questionId, {
            like_count: (question.like_count || 0) + 1
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adviceQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
    }
  });

  const resonanceMutation = useMutation({
    mutationFn: async (questionId) => {
      const existingVote = userResonances.find(v => v.target_id === questionId);
      
      if (existingVote) {
        await base44.entities.AdviceVote.delete(existingVote.id);
        const question = questions.find(q => q.id === questionId);
        if (question) {
          await base44.entities.AdviceQuestion.update(questionId, {
            resonance_count: Math.max(0, (question.resonance_count || 1) - 1)
          });
        }
      } else {
        await base44.entities.AdviceVote.create({
          user_id: currentUser.email,
          target_type: 'question',
          target_id: questionId,
          vote_type: 'resonance'
        });
        const question = questions.find(q => q.id === questionId);
        if (question) {
          await base44.entities.AdviceQuestion.update(questionId, {
            resonance_count: (question.resonance_count || 0) + 1
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adviceQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
    }
  });

  const filteredQuestions = questions.filter(q => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return q.title?.toLowerCase().includes(query) || 
           q.description?.toLowerCase().includes(query);
  });

  const openQuestions = filteredQuestions.filter(q => q.status === 'open');
  const resolvedQuestions = filteredQuestions.filter(q => q.status === 'resolved');

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Wisdom Exchange
            </h1>
            <p className="text-xl text-indigo-200 mb-8">
              Seek guidance. Share wisdom. Rise together.
            </p>
            <Button
              size="lg"
              onClick={() => setAskModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25"
            >
              <MessageSquarePlus className="w-5 h-5 mr-2" />
              Ask for Guidance
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          {/* Left Column - Questions */}
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-200"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white">
                    <Filter className="w-4 h-4 mr-2" />
                    {CATEGORIES.find(c => c.value === selectedCategory)?.label}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {CATEGORIES.map(cat => (
                    <DropdownMenuItem 
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={cn(selectedCategory === cat.value && "bg-slate-100")}
                    >
                      {cat.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white">
                    {sortBy === 'recent' && <Clock className="w-4 h-4 mr-2" />}
                    {sortBy === 'popular' && <TrendingUp className="w-4 h-4 mr-2" />}
                    {sortBy === 'answers' && <Sparkles className="w-4 h-4 mr-2" />}
                    {sortBy === 'recent' ? 'Recent' : sortBy === 'popular' ? 'Popular' : 'Most Answers'}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('recent')}>
                    <Clock className="w-4 h-4 mr-2" /> Recent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('popular')}>
                    <TrendingUp className="w-4 h-4 mr-2" /> Popular
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('answers')}>
                    <Sparkles className="w-4 h-4 mr-2" /> Most Answers
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="open" className="w-full">
              <TabsList className="bg-white border border-slate-200">
                <TabsTrigger value="open" className="gap-2">
                  <MessageSquarePlus className="w-4 h-4" />
                  Open ({openQuestions.length})
                </TabsTrigger>
                <TabsTrigger value="resolved" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Resolved ({resolvedQuestions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="open" className="mt-4 space-y-4">
                {isLoading ? (
                  <div className="text-center py-12 text-slate-500">Loading questions...</div>
                ) : openQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquarePlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No open questions yet. Be the first to ask!</p>
                  </div>
                ) : (
                  openQuestions.map(question => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onUpvote={(id) => upvoteMutation.mutate(id)}
                      hasVoted={userUpvotes.some(v => v.target_id === question.id)}
                      onLike={(id) => likeMutation.mutate(id)}
                      hasLiked={userLikes.some(v => v.target_id === question.id)}
                      onResonance={(id) => resonanceMutation.mutate(id)}
                      hasResonated={userResonances.some(v => v.target_id === question.id)}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="resolved" className="mt-4 space-y-4">
                {resolvedQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No resolved questions yet.</p>
                  </div>
                ) : (
                  resolvedQuestions.map(question => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onUpvote={(id) => upvoteMutation.mutate(id)}
                      hasVoted={userUpvotes.some(v => v.target_id === question.id)}
                      onLike={(id) => likeMutation.mutate(id)}
                      hasLiked={userLikes.some(v => v.target_id === question.id)}
                      onResonance={(id) => resonanceMutation.mutate(id)}
                      hasResonated={userResonances.some(v => v.target_id === question.id)}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* AI Insight Promo */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">SaintAgent AI</h3>
                  <p className="text-xs text-amber-700">Structured Guidance</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Get AI-powered structured insights on your questions. Wisdom meets technology.
              </p>
              <Button 
                className="w-full bg-amber-500 hover:bg-amber-600"
                onClick={() => setAskModalOpen(true)}
              >
                Ask with AI Insight
              </Button>
            </div>

            {/* Leaderboard */}
            <WisdomLeaderboard limit={10} />

            {/* Disclaimer */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong>Disclaimer:</strong> Advice provided here does not constitute legal, medical, 
                or financial professional counsel. Always consult qualified professionals for serious matters.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        open={askModalOpen}
        onClose={() => setAskModalOpen(false)}
        currentUser={currentUser}
        profile={profile}
      />
    </div>
  );
}