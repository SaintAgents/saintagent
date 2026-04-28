import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';

export default function MentorReviewsList({ mentorId }) {
  const { data: reviews = [] } = useQuery({
    queryKey: ['mentorReviews', mentorId],
    queryFn: () => base44.entities.MentorReview.filter({ mentor_id: mentorId }, '-created_date', 50),
    enabled: !!mentorId,
  });

  if (reviews.length === 0) return <p className="text-sm text-slate-400 italic py-4">No reviews yet</p>;

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const recPct = Math.round((reviews.filter(r => r.would_recommend).length / reviews.length) * 100);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-700">{avg}</p>
          <div className="flex gap-0.5 justify-center">
            {[1,2,3,4,5].map(n => (
              <Star key={n} className={`w-3 h-3 ${n <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{reviews.length} reviews</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-emerald-600">
          <ThumbsUp className="w-4 h-4" /> {recPct}% recommend
        </div>
      </div>

      {/* Individual reviews */}
      {reviews.slice(0, 5).map(r => (
        <div key={r.id} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={r.reviewer_avatar} />
            <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">{(r.reviewer_name || '?')[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-800">{r.reviewer_name || 'Anonymous'}</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={`w-3 h-3 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>
              <span className="text-[10px] text-slate-400">{r.created_date ? format(new Date(r.created_date), 'MMM d') : ''}</span>
            </div>
            {r.comment && <p className="text-sm text-slate-600 mt-1">{r.comment}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}