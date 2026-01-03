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
import { createPageUrl } from '@/utils';
import { createPageUrl } from '@/utils';
import LeaderApplicationModal from './LeaderApplicationModal';
import LeaderQuizModal from './LeaderQuizModal';

const REQUIRED_POINTS = 10000;
const REQUIRED_ACCOUNT_AGE_DAYS = 30;
const REQUIRED_BADGES = ['soulbound', 'calibrator', 'steward', 'anchor', 'coherent'];

// Leadership badge definitions
const BADGE_DEFS = {
  soulbound: {
    title: 'Soulbound',
    dimension: 'Identity & Accountability',
    definition: 'The user has established a persistent, accountable identity and accepts responsibility for their actions within leadership contexts.',
    earnedThrough: [
      'Identity verification (platform-level)',
      'Acceptance of leadership conduct standards',
      'Demonstrated consistency and integrity',
      'No unresolved integrity flags'
    ],
    represents: 'I stand behind my actions.'
  },
  calibrator: {
    title: 'Calibrator',
    dimension: 'Judgment & Fairness',
    definition: 'The user has demonstrated the ability to evaluate situations, people, or content with fairness, nuance, and consistency.',
    earnedThrough: [
      'Completion of calibration or review training',
      'Successful alignment assessments',
      'History of sound, balanced decisions',
      'Peer or council validation'
    ],
    represents: 'I can judge fairly and responsibly.'
  },
  steward: {
    title: 'Steward',
    dimension: 'Responsibility & Care',
    definition: 'The user has shown the ability to hold responsibility without exploiting influence, acting in service of the system and its people.',
    earnedThrough: [
      'Sustained positive contribution',
      'Demonstrated restraint and ethical conduct',
      'Completion of stewardship training',
      'Trusted handling of responsibility over time'
    ],
    represents: 'I hold responsibility with care.'
  },
  anchor: {
    title: 'Anchor',
    dimension: 'Stability & Grounding',
    definition: 'The user consistently demonstrates emotional, behavioral, and decision-making stability, especially during conflict or uncertainty.',
    earnedThrough: [
      'History of calm, constructive engagement',
      'Peer validation during challenging situations',
      'No pattern of reactive or destabilizing behavior',
      'Completion of stability or coherence assessment'
    ],
    represents: 'I stabilize rather than disrupt.'
  },
  coherent: {
    title: 'Coherent',
    dimension: 'Alignment & Integrity',
    definition: 'The user’s actions, decisions, and communication show internal consistency, follow-through, and ethical alignment over time.',
    earnedThrough: [
      'Demonstrated follow-through on commitments',
      'Ethical consistency across contexts',
      'Alignment review or integrity assessment',
      'Longitudinal trust validation'
    ],
    represents: 'I act in alignment.'
  }
};

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
            <h3 className="text-xl font-bold">Leader Pathway — Trust & Stewardship</h3>
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
              <span className="text-sm text-slate-600">{userBadgeCodes.filter(b => REQUIRED_BADGES.includes(b)).length} / {REQUIRED_BADGES.length}</span>
            )}
          </div>

          {/* Leadership on SA description */}
          <div className="mt-2">
            <p className="text-sm text-slate-700">
              Leadership on Saint Agent is not a single achievement. It is earned through consistent demonstration of trust, judgment, stability, care, and alignment.
            </p>
          </div>

          {/* Required Leadership Badges */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm font-medium text-slate-800">Required Leadership Badges</div>
            <div className="text-xs text-slate-600">
              {userBadgeCodes.filter(b => REQUIRED_BADGES.includes(b)).length} / {REQUIRED_BADGES.length}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {REQUIRED_BADGES.map((code) => {
              const def = BADGE_DEFS[code];
              const has = userBadgeCodes.includes(code);
              return (
                <div
                  key={code}
                  className={cn(
                    "p-3 rounded-xl border bg-white",
                    has ? "border-green-200 ring-1 ring-green-200" : "border-slate-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{def.title}</div>
                      <div className="text-xs text-slate-600">{def.dimension}</div>
                    </div>
                    {has ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="mt-2 text-xs text-slate-700">
                    <span className="font-semibold">Definition:</span> {def.definition}
                  </div>
                  <div className="mt-2">
                    <div className="text-[11px] font-semibold text-slate-700">Earned Through:</div>
                    <ul className="list-disc ml-5 mt-1 text-xs text-slate-700 space-y-0.5">
                      {def.earnedThrough.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2 text-xs text-slate-700">
                    <span className="font-semibold">Represents:</span> “{def.represents}”
                  </div>
                </div>
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
            onClick={() => { window.location.href = createPageUrl('LeaderChannel'); }}
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