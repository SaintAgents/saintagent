import React from 'react';
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { COHERENCE_MULTIPLIERS, calculateQuestRewards } from './MetaVarianceConfig';
import { Zap, Sparkles, Star } from 'lucide-react';
import HelpHint from '@/components/hud/HelpHint';

export default function CoherenceSlider({ 
  value = 5, 
  onChange, 
  baseReward = 100, 
  baseGGG = 0.05,
  className 
}) {
  const config = COHERENCE_MULTIPLIERS[value];
  const rewards = calculateQuestRewards(baseReward, baseGGG, value);
  
  // Color gradient based on level
  const getColor = (level) => {
    if (level <= 3) return 'text-blue-400';
    if (level <= 5) return 'text-emerald-400';
    if (level <= 7) return 'text-amber-400';
    if (level <= 9) return 'text-violet-400';
    return 'text-rose-400';
  };

  const getBgColor = (level) => {
    if (level <= 3) return 'from-blue-500/20 to-blue-600/10';
    if (level <= 5) return 'from-emerald-500/20 to-emerald-600/10';
    if (level <= 7) return 'from-amber-500/20 to-amber-600/10';
    if (level <= 9) return 'from-violet-500/20 to-violet-600/10';
    return 'from-rose-500/20 to-rose-600/10';
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className={cn("w-5 h-5", getColor(value))} />
          <span className="font-semibold text-slate-900 dark:text-white">Meta-Variance Coherence</span>
          <HelpHint 
            content={
              <div>
                <div className="font-semibold mb-2">What is Coherence Factor?</div>
                <p className="text-sm mb-2">
                  Coherence Factor measures your alignment with the quantum field. 
                  Higher coherence = harder challenges but greater rewards.
                </p>
                <p className="text-xs text-slate-400">
                  "Meta-Variance: The science of how reality adapts to you."
                </p>
              </div>
            }
          />
        </div>
        <div className={cn("text-2xl font-bold", getColor(value))}>
          {value}
        </div>
      </div>

      <div className={cn(
        "p-4 rounded-xl bg-gradient-to-r border",
        getBgColor(value),
        value <= 3 ? "border-blue-500/30" :
        value <= 5 ? "border-emerald-500/30" :
        value <= 7 ? "border-amber-500/30" :
        value <= 9 ? "border-violet-500/30" :
        "border-rose-500/30"
      )}>
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange?.(v)}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
        
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>1 - Seeker</span>
          <span>5 - Coherent</span>
          <span>10 - Ultranet</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Level</p>
          <p className={cn("font-semibold text-sm", getColor(value))}>{config.label}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Difficulty</p>
          <p className="font-semibold text-sm text-slate-900 dark:text-white">{config.difficulty}x</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Reward</p>
          <p className="font-semibold text-sm text-amber-500">{config.rewardMultiplier}x</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 border border-violet-200 dark:border-violet-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Projected Rewards</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-violet-600 dark:text-violet-400">{rewards.rp} RP</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">{rewards.ggg} GGG</p>
          </div>
        </div>
      </div>
    </div>
  );
}