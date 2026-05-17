import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

function Stars({ value, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={cn(sz, value >= s ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
      ))}
    </div>
  );
}

export default function ListingReviewsList({ listingId }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['listingReviews', listingId],
    queryFn: () => base44.entities.ListingReview.filter({ listing_id: listingId }, '-created_date', 50),
    enabled: !!listingId
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="p-4 rounded-xl border bg-white animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
            </div>
            <div className="h-3 w-full bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-500">
        No reviews yet. Be the first to leave a review!
      </div>
    );
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const recommendPercent = Math.round((reviews.filter(r => r.would_recommend).length / reviews.length) * 100);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-700">{avgRating.toFixed(1)}</div>
          <Stars value={Math.round(avgRating)} />
        </div>
        <div className="text-sm text-slate-600">
          <div>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
          <div className="flex items-center gap-1 text-emerald-600">
            <ThumbsUp className="w-3 h-3" /> {recommendPercent}% recommend
          </div>
        </div>
      </div>

      {/* Individual reviews */}
      {reviews.map(review => (
        <div key={review.id} className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2" data-user-id={review.reviewer_id}>
              <Avatar className="w-7 h-7">
                <AvatarImage src={review.reviewer_avatar} />
                <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                  {review.reviewer_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-800">{review.reviewer_name}</span>
            </div>
            <span className="text-xs text-slate-400">{moment(review.created_date).fromNow()}</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Stars value={review.rating} />
            {review.would_recommend && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" /> Recommends
              </span>
            )}
          </div>
          {(review.communication_rating || review.quality_rating || review.value_rating) && (
            <div className="flex gap-4 text-xs text-slate-500 mb-2">
              {review.communication_rating && <span>Communication: {review.communication_rating}/5</span>}
              {review.quality_rating && <span>Quality: {review.quality_rating}/5</span>}
              {review.value_rating && <span>Value: {review.value_rating}/5</span>}
            </div>
          )}
          {review.comment && (
            <p className="text-sm text-slate-700 mt-1">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}