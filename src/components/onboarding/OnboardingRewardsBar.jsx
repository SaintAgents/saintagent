import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Coins, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define rewards per step - these should match your actual reward structure
const STEP_REWARDS = [
  { step: 0, name: 'Welcome', ggg: 0 },
  { step: 1, name: 'Identity', ggg: 0.015 },
  { step: 2, name: 'Mystical', ggg: 0.012 },
  { step: 3, name: 'Region', ggg: 0.008 },
  { step: 4, name: 'Values', ggg: 0.015 },
  { step: 5, name: 'Skills', ggg: 0.015 },
  { step: 6, name: 'Desires', ggg: 0.012 },
  { step: 7, name: 'Hopes', ggg: 0.008 },
  { step: 8, name: 'Dating Intro', ggg: 0.005 },
  { step: 9, name: 'Attachment', ggg: 0.008 },
  { step: 10, name: 'Conflict Style', ggg: 0.008 },
  { step: 11, name: 'Relationship Values', ggg: 0.008 },
  { step: 12, name: 'Connection', ggg: 0.005 },
  { step: 13, name: 'Partner Preferences', ggg: 0.005 },
  { step: 14, name: 'Match Tutorial', ggg: 0.003 },
  { step: 15, name: 'Complete!', ggg: 0 }, // Final completion bonus is separate
];

export default function OnboardingRewardsBar({ currentStep, completedSteps = [] }) {
  // Fetch actual GGG rule for finish_onboard
  const { data: rules } = useQuery({
    queryKey: ['onboardingRewardRule'],
    queryFn: () => base44.entities.GGGRewardRule.filter({ action_type: 'finish_onboard', is_active: true }),
    staleTime: 60000,
  });
  
  const totalReward = rules?.[0]?.ggg_amount || 0.1122;
  
  // Calculate earned so far based on completed steps
  const earnedSoFar = STEP_REWARDS
    .filter((_, idx) => completedSteps.includes(idx))
    .reduce((sum, s) => sum + s.ggg, 0);
  
  // Remaining to earn
  const remainingToEarn = totalReward - earnedSoFar;
  
  // Current step potential earning
  const currentStepReward = STEP_REWARDS[currentStep]?.ggg || 0;
  
  return (
    <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 rounded-lg">
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-sm font-semibold text-emerald-800">Onboarding Rewards</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-lg font-bold text-emerald-700">{totalReward.toFixed(4)} GGG</span>
          <span className="text-xs text-emerald-600">total</span>
        </div>
      </div>
      
      {/* Progress indicators */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-white/70 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-0.5">Earned</p>
          <p className="text-sm font-bold text-emerald-600">+{earnedSoFar.toFixed(4)}</p>
        </div>
        <div className="bg-white/70 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-0.5">This Step</p>
          <p className={cn(
            "text-sm font-bold",
            currentStepReward > 0 ? "text-amber-600" : "text-slate-400"
          )}>
            {currentStepReward > 0 ? `+${currentStepReward.toFixed(4)}` : '-'}
          </p>
        </div>
        <div className="bg-white/70 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500 mb-0.5">Remaining</p>
          <p className="text-sm font-bold text-slate-600">{remainingToEarn.toFixed(4)}</p>
        </div>
      </div>
      
      {/* Step progress dots */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEP_REWARDS.map((reward, idx) => {
          const isCompleted = completedSteps.includes(idx);
          const isCurrent = idx === currentStep;
          const hasReward = reward.ggg > 0;
          
          return (
            <div 
              key={idx} 
              className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all",
                isCompleted ? "bg-emerald-500" : isCurrent ? "bg-amber-400 ring-2 ring-amber-200" : "bg-slate-200",
                hasReward && !isCompleted && !isCurrent && "ring-1 ring-emerald-300"
              )}
              title={`${reward.name}: ${reward.ggg > 0 ? `+${reward.ggg.toFixed(4)} GGG` : 'No reward'}`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3 h-3 text-white" />
              ) : hasReward ? (
                <span className="text-[8px] font-bold text-slate-600">$</span>
              ) : (
                <Circle className="w-2 h-2 text-slate-400" />
              )}
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-emerald-600 mt-2 text-center">
        Complete all steps to earn your full <strong>{totalReward.toFixed(4)} GGG</strong> welcome bonus!
      </p>
    </div>
  );
}