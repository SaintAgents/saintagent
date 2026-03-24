import React from 'react';
import { Shield, Star, Eye, MessageCircle, TrendingUp, Award } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

function RatingBar({ label, value, max = 5 }) {
  const pct = (value / max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-700">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StarDisplay({ rating, size = 'sm' }) {
  const s = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${s} ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

function getTrustLevel(score) {
  if (score >= 4.5) return { label: 'Exceptional', color: 'bg-emerald-100 text-emerald-700', icon: '🏆' };
  if (score >= 4.0) return { label: 'Excellent', color: 'bg-green-100 text-green-700', icon: '⭐' };
  if (score >= 3.5) return { label: 'Good', color: 'bg-blue-100 text-blue-700', icon: '👍' };
  if (score >= 3.0) return { label: 'Average', color: 'bg-amber-100 text-amber-700', icon: '📊' };
  return { label: 'Building', color: 'bg-slate-100 text-slate-600', icon: '🌱' };
}

export default function TrustScoreCard({ reviews = [], entity }) {
  if (!reviews.length) {
    return (
      <div className="bg-white rounded-2xl border p-6 text-center">
        <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-700 mb-1">Trust & Reputation</h3>
        <p className="text-sm text-slate-400">No reviews yet. Be the first to leave feedback!</p>
      </div>
    );
  }

  const avgOverall = reviews.reduce((s, r) => s + (r.overall_rating || 0), 0) / reviews.length;
  const avgTransparency = reviews.reduce((s, r) => s + (r.transparency_rating || 0), 0) / reviews.filter(r => r.transparency_rating).length || 0;
  const avgImpact = reviews.reduce((s, r) => s + (r.impact_rating || 0), 0) / reviews.filter(r => r.impact_rating).length || 0;
  const avgComm = reviews.reduce((s, r) => s + (r.communication_rating || 0), 0) / reviews.filter(r => r.communication_rating).length || 0;
  const verifiedCount = reviews.filter(r => r.is_verified).length;
  const transparencyScore = ((avgOverall + avgTransparency + avgImpact + avgComm) / 4).toFixed(1);
  const trustLevel = getTrustLevel(parseFloat(transparencyScore));

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      {/* Header with aggregate score */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-violet-200 mb-1">Transparency Score</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-bold">{transparencyScore}</span>
              <span className="text-lg text-violet-200 mb-1.5">/5.0</span>
            </div>
            <div className="mt-2">
              <Badge className={`${trustLevel.color} gap-1`}>
                {trustLevel.icon} {trustLevel.label}
              </Badge>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-violet-300" />
              <span className="text-sm">{reviews.length} reviews</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-violet-300" />
              <span className="text-sm">{verifiedCount} verified</span>
            </div>
            <StarDisplay rating={avgOverall} size="lg" />
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="p-6 space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Rating Breakdown</h4>
        <RatingBar label="Overall Quality" value={avgOverall || 0} />
        {avgTransparency > 0 && <RatingBar label="Transparency" value={avgTransparency} />}
        {avgImpact > 0 && <RatingBar label="Impact" value={avgImpact} />}
        {avgComm > 0 && <RatingBar label="Communication" value={avgComm} />}

        {/* Star distribution */}
        <div className="pt-3 border-t border-slate-100 mt-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Rating Distribution</p>
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => Math.round(r.overall_rating) === star).length;
            const pct = (count / reviews.length) * 100;
            return (
              <div key={star} className="flex items-center gap-2 text-xs mb-1">
                <span className="w-3 text-slate-500">{star}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right text-slate-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}