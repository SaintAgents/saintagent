import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function useSellerStats(sellerId) {
  const { data: reviews = [] } = useQuery({
    queryKey: ['sellerReviews', sellerId],
    queryFn: () => base44.entities.ListingReview.filter({ seller_id: sellerId }, '-created_date', 100),
    enabled: !!sellerId,
    staleTime: 300000,
  });

  const { data: sellerProfiles = [] } = useQuery({
    queryKey: ['sellerProfile', sellerId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: sellerId }, '-updated_date', 1),
    enabled: !!sellerId,
    staleTime: 600000,
  });

  const profile = sellerProfiles?.[0];
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;
  const trustScore = profile?.trust_score || 0;

  // Verified seller: trust >= 60 AND at least 3 reviews with avg >= 4.0
  const isVerified = trustScore >= 60 && totalReviews >= 3 && avgRating >= 4.0;

  return { avgRating, totalReviews, trustScore, isVerified, profile };
}

export function VerifiedSellerBadge({ isVerified, size = 'sm' }) {
  if (!isVerified) return null;
  return (
    <Badge className={cn(
      "bg-emerald-100 text-emerald-700 border-emerald-300 gap-1",
      size === 'sm' ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"
    )}>
      <ShieldCheck className={size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5"} />
      Verified
    </Badge>
  );
}

export function SellerStatsBar({ sellerId, compact = false }) {
  const { avgRating, totalReviews, isVerified } = useSellerStats(sellerId);

  if (totalReviews === 0 && !isVerified) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {totalReviews > 0 && (
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{avgRating.toFixed(1)}</span>
          {!compact && <span className="text-xs text-slate-500">({totalReviews})</span>}
        </div>
      )}
      {totalReviews > 0 && !compact && (
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          {totalReviews} completed
        </div>
      )}
      <VerifiedSellerBadge isVerified={isVerified} size={compact ? 'sm' : 'md'} />
    </div>
  );
}