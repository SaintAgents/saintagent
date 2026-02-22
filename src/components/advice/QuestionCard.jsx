import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronUp, MessageSquare, Sparkles, CheckCircle2, User, Heart, Waves } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";

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

export default function QuestionCard({ question, onUpvote, hasVoted, onLike, hasLiked, onResonance, hasResonated }) {
  return (
    <Link to={createPageUrl('AdviceDetail') + `?id=${question.id}`}>
      <Card className="bg-white border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
        <CardContent className="p-5">
          <div className="flex gap-4">
            {/* Upvote section */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onUpvote?.(question.id);
                }}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  hasVoted ? "bg-amber-100 text-amber-600" : "hover:bg-slate-100 text-slate-400"
                )}
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <span className={cn(
                "text-sm font-semibold",
                hasVoted ? "text-amber-600" : "text-slate-600"
              )}>
                {question.upvote_count || 0}
              </span>
            </div>

            {/* Like section */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLike?.(question.id);
                }}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  hasLiked ? "bg-pink-100 text-pink-600" : "hover:bg-slate-100 text-slate-400"
                )}
              >
                <Heart className={cn("w-5 h-5", hasLiked && "fill-current")} />
              </button>
              <span className={cn(
                "text-sm font-semibold",
                hasLiked ? "text-pink-600" : "text-slate-600"
              )}>
                {question.like_count || 0}
              </span>
            </div>

            {/* Resonance section */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onResonance?.(question.id);
                }}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  hasResonated ? "bg-purple-100 text-purple-600" : "hover:bg-slate-100 text-slate-400"
                )}
              >
                <Waves className="w-5 h-5" />
              </button>
              <span className={cn(
                "text-sm font-semibold",
                hasResonated ? "text-purple-600" : "text-slate-600"
              )}>
                {question.resonance_count || 0}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                  {question.title}
                </h3>
                {question.status === 'resolved' && (
                  <Badge className="bg-green-100 text-green-700 shrink-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Resolved
                  </Badge>
                )}
              </div>

              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                {question.description}
              </p>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <Badge className={cn("text-xs", CATEGORY_COLORS[question.category])}>
                    {CATEGORY_LABELS[question.category]}
                  </Badge>
                  {question.ai_response && (
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Insight
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>{question.answer_count || 0}</span>
                  </div>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(question.created_date), { addSuffix: true })}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                {question.is_anonymous ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-sm">Anonymous</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6" data-user-id={question.author_id}>
                      <AvatarImage src={question.author_avatar} />
                      <AvatarFallback className="text-xs">{question.author_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-600">{question.author_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}