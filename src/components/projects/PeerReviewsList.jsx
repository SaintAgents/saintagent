import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

const REC_META = {
  strongly_recommend: { label: 'Strongly Recommend', color: 'bg-emerald-100 text-emerald-700' },
  recommend: { label: 'Recommend', color: 'bg-green-100 text-green-700' },
  neutral: { label: 'Neutral', color: 'bg-slate-100 text-slate-600' },
  not_recommend: { label: 'Not Recommend', color: 'bg-red-100 text-red-700' },
};

function MiniStars({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
      ))}
    </div>
  );
}

export default function PeerReviewsList({ reviews }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const rec = REC_META[review.recommendation] || REC_META.neutral;
        return (
          <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar
                  className="w-9 h-9 cursor-pointer"
                  data-user-id={review.reviewer_id}
                >
                  <AvatarImage src={review.reviewer_avatar} />
                  <AvatarFallback className="text-xs">
                    {review.reviewer_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p
                    className="text-sm font-semibold text-slate-800 cursor-pointer hover:text-violet-600"
                    data-user-id={review.reviewer_id}
                  >
                    {review.reviewer_name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {review.created_date ? format(new Date(review.created_date), 'MMM d, yyyy') : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MiniStars value={review.overall_rating} />
                <Badge className={`text-xs ${rec.color}`}>{rec.label}</Badge>
              </div>
            </div>

            {/* Rating Grid */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              {[
                { key: 'feasibility_rating', label: 'Feasibility' },
                { key: 'impact_rating', label: 'Impact' },
                { key: 'execution_rating', label: 'Execution' },
                { key: 'team_rating', label: 'Team' },
                { key: 'innovation_rating', label: 'Innovation' },
              ].map(cat => (
                <div key={cat.key} className="text-center bg-slate-50 rounded-md p-1.5">
                  <div className="text-sm font-bold text-slate-700">{review[cat.key] || '-'}</div>
                  <div className="text-[10px] text-slate-400">{cat.label}</div>
                </div>
              ))}
            </div>

            {/* Qualitative Feedback */}
            {review.strengths && (
              <div className="mb-2">
                <p className="text-xs font-medium text-emerald-700 mb-0.5">Strengths</p>
                <p className="text-sm text-slate-600">{review.strengths}</p>
              </div>
            )}
            {review.improvements && (
              <div className="mb-2">
                <p className="text-xs font-medium text-amber-700 mb-0.5">Improvements</p>
                <p className="text-sm text-slate-600">{review.improvements}</p>
              </div>
            )}
            {review.comments && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Comments</p>
                <p className="text-sm text-slate-600">{review.comments}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}