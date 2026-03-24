import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Award, ThumbsUp, MessageCircle } from 'lucide-react';
import moment from 'moment';

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

export default function BusinessReviewsList({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center">
        <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No reviews yet</p>
        <p className="text-xs text-slate-400 mt-1">Community feedback will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="bg-white rounded-2xl border p-5">
          <div className="flex items-start gap-3">
            <Avatar className="w-9 h-9 shrink-0 cursor-pointer" data-user-id={review.reviewer_id}>
              <AvatarImage src={review.reviewer_avatar} />
              <AvatarFallback className="text-xs">{review.reviewer_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm text-slate-900 cursor-pointer" data-user-id={review.reviewer_id}>
                  {review.reviewer_name}
                </span>
                {review.is_verified && (
                  <Badge className="bg-emerald-100 text-emerald-700 text-[10px] gap-0.5 py-0">
                    <Award className="w-2.5 h-2.5" /> Verified
                  </Badge>
                )}
                <span className="text-xs text-slate-400">{moment(review.created_date).fromNow()}</span>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <StarDisplay rating={review.overall_rating} />
                {review.service_name && (
                  <Badge variant="outline" className="text-[10px]">{review.service_name}</Badge>
                )}
              </div>

              {review.title && <p className="font-semibold text-slate-800 text-sm mt-2">{review.title}</p>}
              {review.content && <p className="text-sm text-slate-600 mt-1">{review.content}</p>}

              {/* Sub-ratings */}
              {(review.transparency_rating || review.impact_rating || review.communication_rating) && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {review.transparency_rating > 0 && (
                    <span className="text-[11px] text-slate-500">Transparency: <strong>{review.transparency_rating}/5</strong></span>
                  )}
                  {review.impact_rating > 0 && (
                    <span className="text-[11px] text-slate-500">Impact: <strong>{review.impact_rating}/5</strong></span>
                  )}
                  {review.communication_rating > 0 && (
                    <span className="text-[11px] text-slate-500">Communication: <strong>{review.communication_rating}/5</strong></span>
                  )}
                </div>
              )}

              {review.helpful_count > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                  <ThumbsUp className="w-3 h-3" /> {review.helpful_count} found helpful
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}