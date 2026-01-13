import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Wifi, Zap, Activity, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Calculate resonance level based on profile data
function calculateResonance(profile) {
  if (!profile) return { level: 0, label: 'Dormant', color: 'slate' };
  
  let score = 0;
  
  // Coherence from rank
  const rankScores = {
    seeker: 1, initiate: 2, adept: 3, practitioner: 4,
    master: 5, sage: 6, oracle: 7, ascended: 8, guardian: 9
  };
  score += (rankScores[profile.rp_rank_code] || 1) * 10;
  
  // Activity metrics
  if (profile.meetings_completed > 0) score += Math.min(profile.meetings_completed * 2, 20);
  if (profile.follower_count > 0) score += Math.min(profile.follower_count, 15);
  if (profile.daily_login_streak > 0) score += Math.min(profile.daily_login_streak, 10);
  
  // Spiritual practices
  if (profile.spiritual_practices?.length > 0) score += profile.spiritual_practices.length * 3;
  if (profile.practice_depth === 'teaching' || profile.practice_depth === 'mastery') score += 15;
  
  // Engagement
  if (profile.engagement_points > 0) score += Math.min(profile.engagement_points / 100, 10);
  
  // Normalize to 0-100
  const normalizedScore = Math.min(Math.round(score), 100);
  
  // Determine level
  if (normalizedScore >= 90) return { level: normalizedScore, label: 'Transcendent', color: 'amber' };
  if (normalizedScore >= 75) return { level: normalizedScore, label: 'Luminous', color: 'violet' };
  if (normalizedScore >= 60) return { level: normalizedScore, label: 'Resonant', color: 'emerald' };
  if (normalizedScore >= 40) return { level: normalizedScore, label: 'Awakening', color: 'blue' };
  if (normalizedScore >= 20) return { level: normalizedScore, label: 'Stirring', color: 'cyan' };
  return { level: normalizedScore, label: 'Dormant', color: 'slate' };
}

export default function UltranetResonanceIndicator({ profile, size = 'md', showLabel = true, className }) {
  const [pulsePhase, setPulsePhase] = useState(0);
  const resonance = calculateResonance(profile);
  
  // Animated pulse based on resonance level
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);
  
  const pulseIntensity = Math.sin(pulsePhase * Math.PI / 180) * 0.3 + 0.7;
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  const colorClasses = {
    amber: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
    violet: 'text-violet-400 bg-violet-500/20 border-violet-500/40',
    emerald: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
    blue: 'text-blue-400 bg-blue-500/20 border-blue-500/40',
    cyan: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40',
    slate: 'text-slate-400 bg-slate-500/20 border-slate-500/40'
  };
  
  const glowColors = {
    amber: 'rgba(245, 158, 11, 0.6)',
    violet: 'rgba(139, 92, 246, 0.6)',
    emerald: 'rgba(16, 185, 129, 0.6)',
    blue: 'rgba(59, 130, 246, 0.6)',
    cyan: 'rgba(6, 182, 212, 0.6)',
    slate: 'rgba(100, 116, 139, 0.3)'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            <div 
              className={cn(
                "relative rounded-full border flex items-center justify-center transition-all",
                sizeClasses[size],
                colorClasses[resonance.color]
              )}
              style={{
                boxShadow: `0 0 ${12 * pulseIntensity}px ${glowColors[resonance.color]}`,
                opacity: pulseIntensity
              }}
            >
              {/* Animated rings for high resonance */}
              {resonance.level >= 60 && (
                <>
                  <div 
                    className={cn(
                      "absolute inset-0 rounded-full border animate-ping",
                      `border-${resonance.color}-400/30`
                    )}
                    style={{ animationDuration: '2s' }}
                  />
                  {resonance.level >= 75 && (
                    <div 
                      className={cn(
                        "absolute -inset-1 rounded-full border animate-ping",
                        `border-${resonance.color}-400/20`
                      )}
                      style={{ animationDuration: '3s' }}
                    />
                  )}
                </>
              )}
              
              <Wifi className={cn(
                size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'
              )} />
            </div>
            
            {showLabel && (
              <div className="flex flex-col">
                <span className={cn(
                  "text-xs font-medium",
                  `text-${resonance.color}-400`
                )}>
                  {resonance.label}
                </span>
                <span className="text-[10px] text-slate-500">
                  Ultranet {resonance.level}%
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-black/90 border-violet-500/30">
          <div className="p-2 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="font-semibold text-white">Ultranet Resonance</span>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Your connection to the living lattice of consciousness—the web older than the stars.
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Resonance Level:</span>
              <span className={cn("font-bold", `text-${resonance.color}-400`)}>
                {resonance.level}% • {resonance.label}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Mini version for compact spaces
export function UltranetResonanceBadge({ profile, className }) {
  const resonance = calculateResonance(profile);
  
  const colorClasses = {
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    violet: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    slate: 'bg-slate-500/20 text-slate-400 border-slate-500/40'
  };
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium",
      colorClasses[resonance.color],
      className
    )}>
      <Wifi className="w-3 h-3" />
      <span>{resonance.level}%</span>
    </div>
  );
}

export { calculateResonance };