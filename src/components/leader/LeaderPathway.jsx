import React, { useState } from 'react';
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
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import LeaderApplicationModal from './LeaderApplicationModal';
import LeaderQuizModal from './LeaderQuizModal';

const REQUIRED_POINTS = 10000;
const REQUIRED_ACCOUNT_AGE_DAYS = 30;
const REQUIRED_BADGES = ['soulbound', 'calibrator', 'security_trained'];

export default function LeaderPathway({ profile }) {
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);

  const { data: badges = [] } = useQuery({
    queryKey: ['badges', profile?.user_id],
    queryFn: () => base44.entities.Badge.filter({ user_id: profile?.user_id, status: 'active' }),
    enabled: !!profile?.user_id
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['leaderApplication', profile?.user_id],
    queryFn: () => base44.entities.LeaderApplication.filter({ user_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['quizAttempts', profile?.user_id],
    queryFn: () => base44.entities.LeaderQuizAttempt.filter({ user_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  const latestApplication = applications[0];
  const latestQuizAttempt = quizAttempts[0];

  // Check requirements
  const currentPoints = profile?.rank_points || 0;
  const accountAge = profile?.created_date 
    ? Math.floor((Date.now() - new Date(profile.created_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const userBadgeCodes = badges.map(b => b.badge_code);
  const hasRequiredBadges = REQUIRED_BADGES.every(badge => userBadgeCodes.includes(badge));

  const pointsRequirementMet = currentPoints >= REQUIRED_POINTS;
  const ageRequirementMet = accountAge >= REQUIRED_ACCOUNT_AGE_DAYS;
  const badgesRequirementMet = hasRequiredBadges;

  const canUnlock = pointsRequirementMet && ageRequirementMet && badgesRequirementMet;
  const isLeader = profile?.leader_tier === 'verified144k';

  const getStatus = () => {
    if (isLeader) return 'active';
    if (latestApplication?.status === 'pending') return 'pending';
    if (latestApplication?.status === 'approved' && !latestQuizAttempt?.passed) return 'quiz_needed';
    if (latestQuizAttempt?.passed) return 'approved';
    return 'locked';
  };

  const status = getStatus();

  return (
    <Card className={cn(
      "relative overflow-hidden border-2 transition-all duration-300",
      status === 'locked' && "border-slate-200 bg-slate-50",
      status === 'active' && "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg",
      status === 'pending' && "border-blue-300 bg-blue-50",
      (status === 'quiz_needed' || status === 'approved') && "border-violet-300 bg-violet-50"
    )}>
      {/* Glow effect for unlocked */}
      {canUnlock && status === 'locked' && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-amber-400/20 animate-pulse" />
      )}

      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-xl",
            status === 'locked' && "bg-slate-200",
            status === 'active' && "bg-gradient-to-br from-amber-400 to-orange-500",
            status === 'pending' && "bg-blue-400",
            (status === 'quiz_needed' || status === 'approved') && "bg-violet-500"
          )}>
            {status === 'locked' ? (
              <Lock className="w-6 h-6 text-slate-400" />
            ) : (
              <Crown className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold">Leader Pathway</h3>
            <p className="text-sm text-slate-500 font-normal">
              {status === 'locked' && "Complete requirements to unlock"}
              {status === 'active' && "Active Leader"}
              {status === 'pending' && "Application under review"}
              {status === 'quiz_needed' && "Take leadership quiz"}
              {status === 'approved' && "Quiz passed - awaiting final approval"}
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Requirements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className={cn(
                "w-4 h-4",
                pointsRequirementMet ? "text-green-500" : "text-slate-400"
              )} />
              <span className="text-sm font-medium">10,000 Points</span>
            </div>
            <div className="flex items-center gap-2">
              {pointsRequirementMet ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-sm text-slate-600">{currentPoints.toLocaleString()} / 10,000</span>
              )}
            </div>
          </div>
          <Progress value={(currentPoints / REQUIRED_POINTS) * 100} className="h-2" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={cn(
                "w-4 h-4",
                badgesRequirementMet ? "text-green-500" : "text-slate-400"
              )} />
              <span className="text-sm font-medium">Required Badges</span>
            </div>
            {badgesRequirementMet ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <span className="text-sm text-slate-600">{userBadgeCodes.filter(b => REQUIRED_BADGES.includes(b)).length} / 3</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {REQUIRED_BADGES.map(badgeCode => {
              const hasBadge = userBadgeCodes.includes(badgeCode);
              return (
                <Badge 
                  key={badgeCode}
                  variant={hasBadge ? "default" : "outline"}
                  className={cn(
                    "text-xs",
                    hasBadge && "bg-green-100 text-green-700 border-green-300"
                  )}
                >
                  {badgeCode.replace('_', ' ')}
                  {hasBadge && <CheckCircle2 className="w-3 h-3 ml-1" />}
                </Badge>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={cn(
                "w-4 h-4",
                ageRequirementMet ? "text-green-500" : "text-slate-400"
              )} />
              <span className="text-sm font-medium">30 Days Active</span>
            </div>
            {ageRequirementMet ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <span className="text-sm text-slate-600">{accountAge} / 30 days</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        {status === 'locked' && (
          <Button
            onClick={() => setApplicationModalOpen(true)}
            disabled={!canUnlock}
            className={cn(
              "w-full rounded-xl gap-2",
              canUnlock 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg" 
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            )}
          >
            {canUnlock ? (
              <>
                <Sparkles className="w-4 h-4" />
                Apply to Become a Leader
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Complete Requirements to Unlock
              </>
            )}
          </Button>
        )}

        {status === 'pending' && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-900">Application Under Review</p>
            <p className="text-xs text-blue-700 mt-1">You'll be notified when approved</p>
          </div>
        )}

        {status === 'quiz_needed' && (
          <Button
            onClick={() => setQuizModalOpen(true)}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <Users className="w-4 h-4" />
            Take Leadership Quiz
          </Button>
        )}

        {status === 'approved' && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">Quiz Passed!</p>
            <p className="text-xs text-green-700 mt-1">Awaiting final approval to activate leader status</p>
          </div>
        )}

        {status === 'active' && (
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
          >
            <Crown className="w-4 h-4" />
            Access Leader Dashboard
          </Button>
        )}
      </CardContent>

      <LeaderApplicationModal
        open={applicationModalOpen}
        onClose={() => setApplicationModalOpen(false)}
        profile={profile}
      />

      <LeaderQuizModal
        open={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        profile={profile}
      />
    </Card>
  );
}