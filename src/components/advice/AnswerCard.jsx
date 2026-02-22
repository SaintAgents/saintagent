import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronUp, ChevronDown, CheckCircle2, Flag, Heart, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";

const TAG_STYLES = {
  practical: 'bg-blue-100 text-blue-700',
  spiritual: 'bg-purple-100 text-purple-700',
  strategic: 'bg-indigo-100 text-indigo-700',
  emotional_support: 'bg-pink-100 text-pink-700',
  legal: 'bg-red-100 text-red-700',
  technical: 'bg-cyan-100 text-cyan-700'
};

const TAG_LABELS = {
  practical: 'Practical',
  spiritual: 'Spiritual',
  strategic: 'Strategic',
  emotional_support: 'Emotional Support',
  legal: 'Legal Suggestion',
  technical: 'Technical'
};

const VERIFICATION_BADGES = {
  basic: null,
  verified: { label: 'Verified', color: 'bg-blue-100 text-blue-700' },
  expert: { label: 'Expert', color: 'bg-purple-100 text-purple-700' },
  saint_contributor: { label: 'Saint Contributor', color: 'bg-amber-100 text-amber-700' }
};

export default function AnswerCard({ 
  answer, 
  wisdomScore,
  isQuestionAuthor,
  onUpvote,
  onDownvote,
  onMarkHelpful,
  onAccept,
  onFlag,
  userVote,
  userHelpful
}) {
  const verification = VERIFICATION_BADGES[wisdomScore?.verification_level];

  return (
    <Card className={cn(
      "bg-white border-slate-200",
      answer.is_accepted && "border-green-300 bg-green-50/30"
    )}>
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Vote section */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => onUpvote?.(answer.id)}
              className={cn(
                "p-1.5 rounded transition-colors",
                userVote === 'upvote' ? "bg-amber-100 text-amber-600" : "hover:bg-slate-100 text-slate-400"
              )}
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <span className={cn(
              "text-sm font-semibold",
              (answer.upvotes - answer.downvotes) > 0 ? "text-amber-600" : 
              (answer.upvotes - answer.downvotes) < 0 ? "text-slate-400" : "text-slate-500"
            )}>
              {(answer.upvotes || 0) - (answer.downvotes || 0)}
            </span>
            <button
              onClick={() => onDownvote?.(answer.id)}
              className={cn(
                "p-1.5 rounded transition-colors",
                userVote === 'downvote' ? "bg-slate-200 text-slate-600" : "hover:bg-slate-100 text-slate-400"
              )}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {answer.is_accepted && (
              <div className="flex items-center gap-2 text-green-600 mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold">Accepted Answer</span>
              </div>
            )}

            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {answer.content}
            </p>

            {/* Tags */}
            {answer.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {answer.tags.map(tag => (
                  <Badge key={tag} className={cn("text-xs", TAG_STYLES[tag])}>
                    {TAG_LABELS[tag] || tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onMarkHelpful?.(answer.id)}
                  className={cn(
                    "flex items-center gap-1.5 text-sm transition-colors",
                    userHelpful ? "text-pink-600" : "text-slate-500 hover:text-pink-600"
                  )}
                >
                  <Heart className={cn("w-4 h-4", userHelpful && "fill-current")} />
                  <span>{answer.helpful_count || 0} Helpful</span>
                </button>
                
                {isQuestionAuthor && !answer.is_accepted && (
                  <button
                    onClick={() => onAccept?.(answer.id)}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-600 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Answer</span>
                  </button>
                )}

                <button
                  onClick={() => onFlag?.(answer.id)}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7" data-user-id={answer.author_id}>
                    <AvatarImage src={answer.author_avatar} />
                    <AvatarFallback className="text-xs">{answer.author_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{answer.author_name}</p>
                    <div className="flex items-center gap-2">
                      {wisdomScore && (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {wisdomScore.wisdom_points || 0}
                        </span>
                      )}
                      {verification && (
                        <Badge className={cn("text-[10px] px-1.5 py-0", verification.color)}>
                          {verification.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(answer.created_date), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}