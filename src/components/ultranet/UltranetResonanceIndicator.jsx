import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Zap, Radio, Sparkles, Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Calculate resonance based on profile data
function calculateResonance(profile) {
  if (!profile) return { level: 1, label: 'Dormant', color: 'slate' };
  
  let score = 0;
  
  // Activity factors
  if (profile.daily_login_streak > 7) score += 2;
  if (profile.daily_login_streak > 30) score += 2;
  if (profile.meetings_completed > 5) score += 1;
  if (profile.meetings_completed > 20) score += 2;
  if (profile.missions_completed_season > 3) score += 1;
  if (profile.rp_points > 500) score += 1;
  if (profile.rp_points > 2000) score += 2;
  if (profile.ggg_balance > 1) score += 1;
  if (profile.follower_count > 10) score += 1;
  if (profile.follower_count > 50) score += 2;
  
  // Spiritual alignment factors
  if (profile.spiritual_practices?.length > 2) score += 1;
  if (profile.practice_depth === 'established' || profile.practice_depth === 'teaching') score += 2;
  if (profile.consciousness_orientation?.length > 0) score += 1;
  
  // Cap at 10
  score = Math.min(score, 10);
  
  const levels = {
    0: { level: 1, label: 'Dormant', color: 'slate' },
    1: { level: 2, label: 'Stirring', color: 'zinc' },
    2: { level: 3, label: 'Awakening', color: 'blue' },
    3: { level: 4, label: 'Emerging', color: 'cyan' },
    4: { level: 5, label: 'Resonant', color: 'teal' },
    5: { level: 6, label: 'Harmonic', color: 'emerald' },
    6: { level: 7, label: 'Aligned', color: 'green' },
    7: { level: 8, label: 'Synchronized', color: 'violet' },
    8: { level: 9, label: 'Transcendent', color: 'purple' },
    9: { level: 10, label: 'Ultranet Unified', color: 'amber' },
    10: { level: 10, label: 'Ultranet Unified', color: 'amber' }
  };
  
  return levels[score] || levels[0];
}

// Animated pulse ring
function PulseRing({ color, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };
  
  const colorClasses = {
    slate: 'bg-slate-400',
    zinc: 'bg-zinc-400',
    blue: 'bg-blue-400',
    cyan: 'bg-cyan-400',
    teal: 'bg-teal-400',
    emerald: 'bg-emerald-400',
    green: 'bg-green-400',
    violet: 'bg-violet-400',
    purple: 'bg-purple-400',
    amber: 'bg-amber-400'
  };
  
  return (
    <div className="relative">
      <div className={cn(
        "rounded-full animate-ping absolute opacity-75",
        sizeClasses[size],
        colorClasses[color]
      )} />
      <div className={cn(
        "rounded-full relative",
        sizeClasses[size],
        colorClasses[color]
      )} />
    </div>
  );
}

// Main indicator component
export default function UltranetResonanceIndicator({ profile, size = 'md', showLabel = true, className }) {
  const [pulsePhase, setPulsePhase] = useState(0);
  const resonance = calculateResonance(profile);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);
  
  const sizeConfig = {
    sm: { icon: 12, text: 'text-[10px]', gap: 'gap-1', padding: 'px-1.5 py-0.5' },
    md: { icon: 14, text: 'text-xs', gap: 'gap-1.5', padding: 'px-2 py-1' },
    lg: { icon: 18, text: 'text-sm', gap: 'gap-2', padding: 'px-3 py-1.5' }
  };
  
  const config = sizeConfig[size];
  
  const colorStyles = {
    slate: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
    zinc: 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10',
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    teal: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    green: 'text-green-400 border-green-500/30 bg-green-500/10',
    violet: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "inline-flex items-center rounded-full border",
            config.gap,
            config.padding,
            colorStyles[resonance.color],
            className
          )}>
            <div className="relative">
              <Radio 
                className="animate-pulse" 
                style={{ 
                  width: config.icon, 
                  height: config.icon,
                  opacity: 0.5 + Math.sin(pulsePhase * Math.PI / 180) * 0.5
                }} 
              />
            </div>
            {showLabel && (
              <span className={cn("font-medium", config.text)}>
                {resonance.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-black/90 border-violet-500/30">
          <div className="text-center space-y-1 p-1">
            <div className="flex items-center gap-2 justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-violet-300 font-semibold">Ultranet Resonance</span>
            </div>
            <p className="text-xs text-slate-300">
              Level {resonance.level}/10 — {resonance.label}
            </p>
            <p className="text-[10px] text-slate-400 max-w-[200px]">
              Your connection strength to the living lattice of consciousness
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for avatars
export function UltranetResonanceDot({ profile, className }) {
  const resonance = calculateResonance(profile);
  
  const colorClasses = {
    slate: 'bg-slate-400',
    zinc: 'bg-zinc-400',
    blue: 'bg-blue-400',
    cyan: 'bg-cyan-400',
    teal: 'bg-teal-400',
    emerald: 'bg-emerald-400',
    green: 'bg-green-400',
    violet: 'bg-violet-400',
    purple: 'bg-purple-400',
    amber: 'bg-amber-400'
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("relative", className)}>
            <div className={cn(
              "w-2.5 h-2.5 rounded-full animate-pulse",
              colorClasses[resonance.color]
            )} />
            <div className={cn(
              "absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-50",
              colorClasses[resonance.color]
            )} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-black/90 border-violet-500/30">
          <div className="text-xs">
            <span className="text-violet-300">{resonance.label}</span>
            <span className="text-slate-400 ml-1">Resonance</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Export the calculation function for use elsewhere
export { calculateResonance };