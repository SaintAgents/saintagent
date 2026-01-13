// Merit-Based AI Matching Utility
// Computes "Likelihood of Performance" score based on user's history of tales

import { getRandomSaying } from '@/components/hud/HeroImageData';

// Rank thresholds for accessing features
export const RANK_HIERARCHY = {
  seeker: 0,
  initiate: 1,
  adept: 2,
  practitioner: 3,
  master: 4,
  sage: 5,
  oracle: 6,
  ascended: 7,
  guardian: 8
};

// Check if user rank meets minimum threshold
export function meetsRankRequirement(userRank, requiredRank) {
  const userLevel = RANK_HIERARCHY[userRank?.toLowerCase()] || 0;
  const requiredLevel = RANK_HIERARCHY[requiredRank?.toLowerCase()] || 0;
  return userLevel >= requiredLevel;
}

// Compute Likelihood of Performance (LoP) score
export function computeLikelihoodOfPerformance({
  missionsCompleted = 0,
  questsCompleted = 0,
  meetingsCompleted = 0,
  bookingsCompleted = 0,
  testimonialsReceived = 0,
  testimonialsAvgRating = 0,
  noShowCount = 0,
  cancelledCount = 0,
  rpPoints = 0,
  gggEarned = 0,
  accountAgeDays = 1,
  dailyLoginStreak = 0
}) {
  // Base completion score (40% weight)
  const completionScore = Math.min(100, (
    (missionsCompleted * 10) +
    (questsCompleted * 5) +
    (meetingsCompleted * 8) +
    (bookingsCompleted * 12)
  ));
  
  // Reliability score (25% weight) - penalize no-shows and cancellations
  const totalCommitments = missionsCompleted + meetingsCompleted + bookingsCompleted + noShowCount + cancelledCount;
  const reliabilityRate = totalCommitments > 0 
    ? ((totalCommitments - noShowCount - cancelledCount) / totalCommitments) * 100 
    : 50; // neutral if no history
  
  // Reputation score (20% weight)
  const reputationScore = Math.min(100, (
    (testimonialsReceived * 15) +
    (testimonialsAvgRating * 10) +
    (rpPoints / 100)
  ));
  
  // Consistency score (15% weight)
  const consistencyScore = Math.min(100, (
    (dailyLoginStreak * 2) +
    (accountAgeDays > 30 ? 20 : accountAgeDays * 0.66) +
    (gggEarned / 50)
  ));
  
  // Weighted final score
  const lopScore = Math.round(
    (completionScore * 0.40) +
    (reliabilityRate * 0.25) +
    (reputationScore * 0.20) +
    (consistencyScore * 0.15)
  );
  
  return {
    score: Math.min(100, Math.max(0, lopScore)),
    breakdown: {
      completion: Math.round(completionScore),
      reliability: Math.round(reliabilityRate),
      reputation: Math.round(reputationScore),
      consistency: Math.round(consistencyScore)
    },
    tier: getLopTier(lopScore),
    insight: generateLopInsight(lopScore, { missionsCompleted, questsCompleted, reliabilityRate })
  };
}

// Get performance tier based on LoP score
export function getLopTier(score) {
  if (score >= 90) return { name: 'Legendary', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' };
  if (score >= 75) return { name: 'Elite', color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200' };
  if (score >= 60) return { name: 'Proven', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (score >= 40) return { name: 'Emerging', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
  if (score >= 20) return { name: 'Novice', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' };
  return { name: 'New', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' };
}

// Generate insight message based on LoP data
export function generateLopInsight(score, data) {
  if (score >= 80) {
    return "Your history of tales demonstrates exceptional reliability. You're a trusted pillar of the Grid.";
  }
  if (score >= 60) {
    return "Your track record shows consistent follow-through. Continue building your legend.";
  }
  if (score >= 40) {
    if (data.missionsCompleted < 3) {
      return "Complete more missions to strengthen your performance history.";
    }
    if (data.reliabilityRate < 80) {
      return "Focus on completing commitments you make to boost your reliability score.";
    }
    return "You're building momentum. Each completed quest adds to your story.";
  }
  if (score >= 20) {
    return "Your journey has just begun. Embrace missions and show the Grid what you're capable of.";
  }
  return "Start your first mission to begin writing your history of tales.";
}

// Get motivational nudge based on context
export function getPerformanceNudge(profile, context = 'general') {
  const saying = getRandomSaying();
  
  const nudges = {
    general: saying,
    mission_join: "Your performance history follows you. Make this mission count.",
    match_view: "High performers attract high performers. Your track record matters.",
    profile_view: "Your Likelihood of Performance score reflects your journey.",
    studio: "Masters analyze their metrics. Deeper insights await those who persist.",
    opt_out_hint: "At Sage rank, you'll unlock control over your visibility and data sovereignty."
  };
  
  return nudges[context] || saying;
}

// Check if user can access advanced analytics (Master+)
export function canAccessAdvancedAnalytics(rankCode) {
  return meetsRankRequirement(rankCode, 'master');
}

// Check if user can access opt-out controls (Sage+)
export function canAccessOptOutControls(rankCode) {
  return meetsRankRequirement(rankCode, 'sage');
}

// Compute match bonus based on LoP scores
export function computeMatchBonus(userLop, targetLop) {
  // Higher LoP users get priority matching with other high performers
  const combined = (userLop + targetLop) / 2;
  if (combined >= 80) return { bonus: 15, reason: 'Elite synergy - both high performers' };
  if (combined >= 60) return { bonus: 10, reason: 'Strong alignment in reliability' };
  if (combined >= 40) return { bonus: 5, reason: 'Growing performers' };
  return { bonus: 0, reason: null };
}