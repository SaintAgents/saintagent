import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Crown,
  Lock,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Trophy,
  Users,
  Zap,
  Target,
  Star,
  TrendingUp,
  MessageCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Rocket,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createPageUrl } from '@/utils';

const REQUIRED_POINTS = 10000;
const REQUIRED_ACCOUNT_AGE_DAYS = 30;
const REQUIRED_BADGES = ['soulbound', 'calibrator', 'steward', 'anchor', 'coherent'];

// Milestone definitions for the journey
const MILESTONES = [
  { points: 0, title: 'Journey Begins', description: 'Welcome to the path of leadership', icon: Star },
  { points: 1000, title: 'First Light', description: 'Building your foundation', icon: Sparkles },
  { points: 2500, title: 'Rising Momentum', description: 'Your presence is being felt', icon: TrendingUp },
  { points: 5000, title: 'Halfway Guardian', description: '50% to leadership qualification', icon: Shield },
  { points: 7500, title: 'Council Candidate', description: 'The elders are watching', icon: Users },
  { points: 10000, title: '144K Threshold', description: 'Ready for the sacred council', icon: Crown },
];

// Badge definitions for progress tracking
const BADGE_DEFS = {
  soulbound: { title: 'Soulbound', description: 'Identity & Accountability verified', icon: Shield },
  calibrator: { title: 'Calibrator', description: 'Judgment & Fairness demonstrated', icon: Target },
  steward: { title: 'Steward', description: 'Responsibility & Care proven', icon: Users },
  anchor: { title: 'Anchor', description: 'Stability & Grounding shown', icon: Lock },
  coherent: { title: 'Coherent', description: 'Alignment & Integrity achieved', icon: CheckCircle2 },
};

export default function Leader144KProgress({ profile }) {
  const [aiMessage, setAiMessage] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [showEstimate, setShowEstimate] = useState(false);

  const { data: badges = [] } = useQuery({
    queryKey: ['badges', profile?.user_id],
    queryFn: () => base44.entities.Badge.filter({ user_id: profile?.user_id, status: 'active' }),
    enabled: !!profile?.user_id
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['recentTransactions', profile?.user_id],
    queryFn: () => base44.entities.GGGTransaction.filter({ user_id: profile?.user_id }, '-created_date', 30),
    enabled: !!profile?.user_id
  });

  // Calculate current progress
  const currentPoints = profile?.rank_points || profile?.rp_points || 0;
  const accountAge = profile?.created_date 
    ? Math.floor((Date.now() - new Date(profile.created_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const userBadgeCodes = badges.map(b => b.badge_code);
  const earnedLeaderBadges = REQUIRED_BADGES.filter(b => userBadgeCodes.includes(b));
  
  const pointsProgress = Math.min(100, (currentPoints / REQUIRED_POINTS) * 100);
  const ageProgress = Math.min(100, (accountAge / REQUIRED_ACCOUNT_AGE_DAYS) * 100);
  const badgeProgress = (earnedLeaderBadges.length / REQUIRED_BADGES.length) * 100;

  // Calculate average daily RP gain from recent activity
  const avgDailyRP = transactions.length > 0 
    ? Math.round(transactions.reduce((sum, t) => sum + (t.delta > 0 ? t.delta : 0), 0) / Math.max(7, accountAge))
    : 50; // Default estimate

  // Time estimates
  const pointsRemaining = Math.max(0, REQUIRED_POINTS - currentPoints);
  const daysRemaining = Math.max(0, REQUIRED_ACCOUNT_AGE_DAYS - accountAge);
  
  // If points already achieved, these will be 0 - we'll show "Complete" in UI
  const aggressiveDays = pointsRemaining > 0 ? Math.ceil(pointsRemaining / 400) : 0; // 400 RP/day aggressive
  const middleRoadDays = pointsRemaining > 0 ? Math.ceil(pointsRemaining / 150) : 0; // 150 RP/day moderate
  const currentPaceDays = pointsRemaining > 0 && avgDailyRP > 0 ? Math.ceil(pointsRemaining / avgDailyRP) : 0;

  // Find current milestone
  const currentMilestone = MILESTONES.reduce((prev, curr) => 
    currentPoints >= curr.points ? curr : prev
  , MILESTONES[0]);
  
  const nextMilestone = MILESTONES.find(m => m.points > currentPoints) || MILESTONES[MILESTONES.length - 1];

  // Check if ready for leadership
  const isReady = currentPoints >= REQUIRED_POINTS && 
                  accountAge >= REQUIRED_ACCOUNT_AGE_DAYS && 
                  earnedLeaderBadges.length === REQUIRED_BADGES.length;
  
  const isLeader = profile?.leader_tier === 'verified144k';

  // Generate AI encouragement
  const generateAiEncouragement = async () => {
    setLoadingAi(true);
    try {
      const progress = {
        points: currentPoints,
        pointsNeeded: REQUIRED_POINTS,
        accountAge,
        badgesEarned: earnedLeaderBadges,
        badgesNeeded: REQUIRED_BADGES.filter(b => !earnedLeaderBadges.includes(b)),
        currentMilestone: currentMilestone.title,
        nextMilestone: nextMilestone.title,
        daysToGoal: currentPaceDays,
        userName: profile?.display_name || 'Sacred One'
      };

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a wise, encouraging guide for someone on the path to becoming a 144K Sacred Council Leader. 
        
Their progress:
- Name: ${progress.userName}
- Current RP: ${progress.points} / ${progress.pointsNeeded}
- Account age: ${progress.accountAge} days (need 30)
- Leadership badges earned: ${progress.badgesEarned.length}/5 (${progress.badgesEarned.join(', ') || 'none yet'})
- Badges still needed: ${progress.badgesNeeded.join(', ') || 'all earned!'}
- Current milestone: ${progress.currentMilestone}
- Next milestone: ${progress.nextMilestone}
- Estimated days to goal at current pace: ${progress.daysToGoal}

Write a short (2-3 sentences), warm, mystical encouragement message. Reference their specific progress. Use language fitting for a sacred spiritual community. Be authentic, not cheesy. Focus on their next immediate step.`,
        response_json_schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            tip: { type: 'string' }
          }
        }
      });

      setAiMessage(res.message + (res.tip ? `\n\n💡 ${res.tip}` : ''));
    } catch (err) {
      setAiMessage("The path to leadership is paved with consistent service and integrity. Every action aligned with truth brings you closer to the 144K Council.");
    }
    setLoadingAi(false);
  };

  // Auto-generate message on first load
  useEffect(() => {
    if (profile?.user_id && !aiMessage && !isLeader) {
      generateAiEncouragement();
    }
  }, [profile?.user_id]);

  if (isLeader) {
    return (
      <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-900/20 dark:via-yellow-900/10 dark:to-amber-900/20">
        <CardContent className="pt-6 text-center">
          <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100">144K Sacred Council Member</h3>
          <p className="text-amber-700 dark:text-amber-300 mt-2">You have ascended to the leadership council</p>
          <Button 
            onClick={() => window.location.href = createPageUrl('LeaderChannel')}
            className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Crown className="w-4 h-4 mr-2" />
            Enter Leader Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-violet-200 dark:border-violet-800 overflow-hidden">
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Path to 144K Leadership</h3>
              <p className="text-violet-200 text-sm">Sacred Council Journey Progress</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{Math.round(pointsProgress)}%</p>
              <p className="text-violet-200 text-xs">Overall Progress</p>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <CardContent className="pt-6 space-y-6">
          {/* AI Encouragement */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-violet-900 dark:text-violet-100">Sacred Guidance</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={generateAiEncouragement}
                    disabled={loadingAi}
                    className="text-violet-600 hover:text-violet-700"
                  >
                    {loadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-violet-800 dark:text-violet-200 whitespace-pre-line">
                  {loadingAi ? "Receiving guidance..." : aiMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Milestone Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Milestone Journey
              </h4>
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {currentMilestone.title}
              </Badge>
            </div>
            <div className="relative">
              <div className="flex justify-between mb-2">
                {MILESTONES.map((milestone, idx) => {
                  const Icon = milestone.icon;
                  const reached = currentPoints >= milestone.points;
                  return (
                    <div 
                      key={idx} 
                      className={cn(
                        "flex flex-col items-center",
                        idx === 0 ? "items-start" : idx === MILESTONES.length - 1 ? "items-end" : ""
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                        reached 
                          ? "bg-amber-500 text-white shadow-lg" 
                          : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className={cn(
                        "text-[10px] mt-1 font-medium",
                        reached ? "text-amber-700 dark:text-amber-400" : "text-slate-400"
                      )}>
                        {milestone.points.toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
              <Progress value={pointsProgress} className="h-2" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Next: {nextMilestone.title} ({nextMilestone.points.toLocaleString()} RP) - {nextMilestone.description}
            </p>
          </div>

          {/* Requirements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Points */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className={cn("w-4 h-4", currentPoints >= REQUIRED_POINTS ? "text-green-500" : "text-slate-400")} />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Rank Points</span>
                </div>
                {currentPoints >= REQUIRED_POINTS && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentPoints.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">/ {REQUIRED_POINTS.toLocaleString()} required</p>
              <Progress value={pointsProgress} className="h-1.5 mt-2" />
            </div>

            {/* Account Age */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className={cn("w-4 h-4", accountAge >= REQUIRED_ACCOUNT_AGE_DAYS ? "text-green-500" : "text-slate-400")} />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Account Age</span>
                </div>
                {accountAge >= REQUIRED_ACCOUNT_AGE_DAYS && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {accountAge} days
              </p>
              <p className="text-xs text-slate-500">/ {REQUIRED_ACCOUNT_AGE_DAYS} days required</p>
              <Progress value={ageProgress} className="h-1.5 mt-2" />
            </div>

            {/* Badges */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className={cn("w-4 h-4", earnedLeaderBadges.length === REQUIRED_BADGES.length ? "text-green-500" : "text-slate-400")} />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Leadership Badges</span>
                </div>
                {earnedLeaderBadges.length === REQUIRED_BADGES.length && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {earnedLeaderBadges.length} / {REQUIRED_BADGES.length}
              </p>
              <p className="text-xs text-slate-500">badges earned</p>
              <Progress value={badgeProgress} className="h-1.5 mt-2" />
            </div>
          </div>

          {/* Leadership Badges Detail */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-500" />
              Leadership Badges Required
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {REQUIRED_BADGES.map(code => {
                const def = BADGE_DEFS[code];
                const earned = userBadgeCodes.includes(code);
                const Icon = def.icon;
                return (
                  <div 
                    key={code}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-all",
                      earned 
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    )}
                  >
                    <Icon className={cn(
                      "w-6 h-6 mx-auto mb-1",
                      earned ? "text-green-500" : "text-slate-400"
                    )} />
                    <p className={cn(
                      "text-xs font-medium",
                      earned ? "text-green-700 dark:text-green-400" : "text-slate-600 dark:text-slate-400"
                    )}>
                      {def.title}
                    </p>
                    {earned && <CheckCircle2 className="w-3 h-3 text-green-500 mx-auto mt-1" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Estimates */}
          <div 
            className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 cursor-pointer"
            onClick={() => setShowEstimate(!showEstimate)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Time Estimates</h4>
              </div>
              {showEstimate ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
            </div>
            
            {showEstimate && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Rocket className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">AGGRESSIVE</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {pointsRemaining === 0 ? '✓ Complete' : `${Math.max(daysRemaining, aggressiveDays)} days`}
                  </p>
                  <p className="text-xs text-slate-500">~400 RP/day • Intensive daily activity</p>
                </div>
                
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">MIDDLE ROAD</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {pointsRemaining === 0 ? '✓ Complete' : `${Math.max(daysRemaining, middleRoadDays)} days`}
                  </p>
                  <p className="text-xs text-slate-500">~150 RP/day • Consistent engagement</p>
                </div>
                
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-violet-500" />
                    <span className="text-xs font-semibold text-violet-700 dark:text-violet-400">YOUR PACE</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {pointsRemaining === 0 ? '✓ Complete' : `${Math.max(daysRemaining, currentPaceDays)} days`}
                  </p>
                  <p className="text-xs text-slate-500">~{avgDailyRP} RP/day • Based on your activity</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          {isReady ? (
            <Button 
              onClick={() => window.location.href = createPageUrl('LeaderChannel')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 gap-2"
            >
              <Crown className="w-5 h-5" />
              Apply for 144K Leadership
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => window.location.href = createPageUrl('Missions')}
                className="flex-1 gap-2"
              >
                <Target className="w-4 h-4" />
                Earn Points
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = createPageUrl('Leaderboards')}
                className="flex-1 gap-2"
              >
                <Users className="w-4 h-4" />
                View Leaderboard
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}