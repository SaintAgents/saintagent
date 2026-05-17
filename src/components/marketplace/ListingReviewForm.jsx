import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

function StarRating({ value, onChange, label }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-600 w-28 shrink-0">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s)}
            className="p-0.5"
          >
            <Star className={cn(
              "w-5 h-5 transition-colors",
              (hover || value) >= s
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            )} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ListingReviewForm({ listing, currentUser, profile, onSuccess }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [quality, setQuality] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState(true);

  const submitMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ListingReview.create({
        listing_id: listing.id,
        listing_title: listing.title,
        seller_id: listing.owner_id,
        reviewer_id: currentUser.email,
        reviewer_name: profile?.display_name || currentUser.full_name,
        reviewer_avatar: profile?.avatar_url || '',
        rating,
        communication_rating: communication || undefined,
        quality_rating: quality || undefined,
        value_rating: valueRating || undefined,
        comment: comment.trim() || undefined,
        would_recommend: recommend
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listingReviews', listing.id] });
      queryClient.invalidateQueries({ queryKey: ['sellerReviews'] });
      onSuccess?.();
    }
  });

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
      <h4 className="font-semibold text-slate-900">Leave a Review</h4>
      <StarRating label="Overall" value={rating} onChange={setRating} />
      <StarRating label="Communication" value={communication} onChange={setCommunication} />
      <StarRating label="Quality" value={quality} onChange={setQuality} />
      <StarRating label="Value" value={valueRating} onChange={setValueRating} />
      <Textarea
        placeholder="Share your experience..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="min-h-[80px]"
      />
      <label className="flex items-center gap-2 cursor-pointer">
        <button
          type="button"
          onClick={() => setRecommend(!recommend)}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center border transition-colors",
            recommend ? "bg-emerald-100 border-emerald-300 text-emerald-600" : "bg-slate-100 border-slate-300 text-slate-400"
          )}
        >
          <ThumbsUp className="w-4 h-4" />
        </button>
        <span className="text-sm text-slate-700">I would recommend this seller</span>
      </label>
      <Button
        onClick={() => submitMutation.mutate()}
        disabled={!rating || submitMutation.isPending}
        className="bg-violet-600 hover:bg-violet-700"
      >
        {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
      </Button>
    </div>
  );
}