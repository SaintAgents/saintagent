import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Star, Eye, MessageCircle, TrendingUp } from 'lucide-react';

function RatingBar({ label, value, max = 5 }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-500 to-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function BusinessTrustScore({ entityId }) {
  const { data: reviews = [] } = useQuery({
    queryKey: ['businessReviews', entityId],
    queryFn: () => base44.entities.BusinessReview.filter({ entity_id: entityId }, '-created_date', 200),
    enabled: !!entityId
  });

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border p-6 text-center">
        <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-700 mb-1">No Reviews Yet</h3>
        <p className="text-sm text-slate-500">Be the first to leave feedback for this organization.</p>
      </div>
    );
  }

  const avg = (field) => {
    const vals = reviews.filter(r => r[field]).map(r => r[field]);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const overall = avg('overall_rating');
  const transparency = avg('transparency_rating');
  const impactAvg = avg('impact_rating');
  const communication = avg('communication_rating');
  const verifiedCount = reviews.filter(r => r.is_verified).length;

  // Aggregate transparency score: weighted average
  const trustScore = Math.round(((overall * 0.3 + transparency * 0.35 + impactAvg * 0.2 + communication * 0.15) / 5) * 100);

  return (
    <div className="bg-white rounded-2xl border p-6">
      <div className="flex items-center gap-2 mb-5">
        <Shield className="w-5 h-5 text-violet-600" />
        <h3 className="font-semibold text-slate-900">Trust & Transparency Score</h3>
      </div>

      {/* Big Score */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#trustGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${trustScore * 2.64} 264`} />
            <defs>
              <linearGradient id="trustGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-900">{trustScore}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <RatingBar label="Overall Rating" value={overall} />
        <RatingBar label="Transparency" value={transparency} />
        <RatingBar label="Impact" value={impactAvg} />
        <RatingBar label="Communication" value={communication} />
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 text-sm text-slate-500">
        <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {reviews.length} reviews</span>
        <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500" /> {verifiedCount} verified</span>
      </div>
    </div>
  );
}