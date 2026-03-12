import React from 'react';
import { Star, ThumbsUp, ThumbsDown, Minus, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const CATEGORIES = [
  { key: 'overall_rating', label: 'Overall' },
  { key: 'feasibility_rating', label: 'Feasibility' },
  { key: 'impact_rating', label: 'Impact' },
  { key: 'execution_rating', label: 'Execution' },
  { key: 'team_rating', label: 'Team' },
  { key: 'innovation_rating', label: 'Innovation' },
];

const RECOMMENDATION_LABELS = {
  strongly_recommend: { label: 'Strongly Recommend', color: 'text-emerald-600', icon: ThumbsUp },
  recommend: { label: 'Recommend', color: 'text-green-600', icon: ThumbsUp },
  neutral: { label: 'Neutral', color: 'text-slate-500', icon: Minus },
  not_recommend: { label: 'Do Not Recommend', color: 'text-red-500', icon: ThumbsDown },
};

function getAvg(reviews, key) {
  const vals = reviews.map(r => r[key]).filter(v => v > 0);
  if (vals.length === 0) return 0;
  return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
}

function getStarDistribution(reviews) {
  const dist = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    if (r.overall_rating >= 1 && r.overall_rating <= 5) {
      dist[r.overall_rating - 1]++;
    }
  });
  return dist;
}

export default function PeerReviewSummary({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
        <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-500 text-sm">No peer reviews yet</p>
        <p className="text-slate-400 text-xs mt-1">Be the first to review this project</p>
      </div>
    );
  }

  const overallAvg = getAvg(reviews, 'overall_rating');
  const starDist = getStarDistribution(reviews);
  const maxStarCount = Math.max(...starDist, 1);

  // Recommendation breakdown
  const recCounts = { strongly_recommend: 0, recommend: 0, neutral: 0, not_recommend: 0 };
  reviews.forEach(r => { if (r.recommendation) recCounts[r.recommendation]++; });

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="flex items-start gap-6 bg-white rounded-xl border border-slate-200 p-5">
        <div className="text-center shrink-0">
          <div className="text-4xl font-bold text-slate-900">{overallAvg}</div>
          <div className="flex gap-0.5 mt-1 justify-center">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-4 h-4 ${s <= Math.round(overallAvg) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Star Distribution */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-3">{star}</span>
              <Star className="w-3 h-3 text-amber-400 shrink-0" />
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${(starDist[star - 1] / maxStarCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 w-4 text-right">{starDist[star - 1]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-500" />
          Category Scores
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map(cat => {
            const avg = getAvg(reviews, cat.key);
            return (
              <div key={cat.key} className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-lg font-bold text-slate-800">{avg || '-'}</div>
                <Progress value={(avg / 5) * 100} className="h-1.5 mt-1" />
                <p className="text-xs text-slate-500 mt-1.5">{cat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Recommendations</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(RECOMMENDATION_LABELS).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
              <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-sm">
                <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                <span className="text-slate-600">{meta.label}</span>
                <span className="font-semibold text-slate-800 ml-1">{recCounts[key]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}