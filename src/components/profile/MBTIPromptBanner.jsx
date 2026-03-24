import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Brain, Gift, X, Sparkles, Clock, ChevronDown } from "lucide-react";
import MBTIAssessment from './MBTIAssessment';

// Check dismissal synchronously to prevent any flash
function isDismissed(profile) {
  // Check profile-level permanent flag (survives everything)
  if (profile?.mbti_prompt_dismissed === true) return true;
  // Check profile-level timed dismissal (survives localStorage clears)
  if (profile?.mbti_prompt_dismissed_until) {
    const untilDate = new Date(profile.mbti_prompt_dismissed_until);
    if (untilDate.getTime() > Date.now()) return true;
  }
  // Fallback to localStorage
  try {
    const val = localStorage.getItem('mbti_prompt_dismissed_permanently');
    if (val === 'true' || val === 'never') return true;
    const dismissedUntil = localStorage.getItem('mbti_prompt_dismissed_until');
    if (dismissedUntil) {
      if (new Date(dismissedUntil).getTime() > Date.now()) return true;
      localStorage.removeItem('mbti_prompt_dismissed_until');
    }
  } catch {}
  return false;
}

export default function MBTIPromptBanner({ profile, onDismiss }) {
  // Synchronous initial check — never render if already dismissed
  const initiallyDismissed = isDismissed(profile);
  
  const [showAssessment, setShowAssessment] = useState(false);
  const [dismissed, setDismissed] = useState(initiallyDismissed);
  const [showDismissOptions, setShowDismissOptions] = useState(false);

  // Re-check when profile changes (e.g. after profile loads)
  useEffect(() => {
    if (isDismissed(profile)) setDismissed(true);
  }, [profile?.id, profile?.mbti_prompt_dismissed]);

  // Don't show if user already has MBTI type or dismissed
  if (profile?.mbti_type || dismissed) {
    return null;
  }

  const handleDismiss = async (duration) => {
    // Always set localStorage
    if (duration === 'never') {
      localStorage.setItem('mbti_prompt_dismissed_permanently', 'never');
      // Also persist to profile so it survives localStorage clears
      if (profile?.id) {
        try {
          await base44.entities.UserProfile.update(profile.id, { mbti_prompt_dismissed: true });
        } catch {}
      }
    } else {
      const dismissUntil = new Date();
      if (duration === 'hour') dismissUntil.setHours(dismissUntil.getHours() + 1);
      else if (duration === 'day') dismissUntil.setDate(dismissUntil.getDate() + 1);
      else if (duration === 'week') dismissUntil.setDate(dismissUntil.getDate() + 7);
      else if (duration === 'month') dismissUntil.setMonth(dismissUntil.getMonth() + 1);
      try { localStorage.setItem('mbti_prompt_dismissed_until', dismissUntil.toISOString()); } catch {}
      // Also persist to profile entity so it survives localStorage clears
      if (profile?.id) {
        try { base44.entities.UserProfile.update(profile.id, { mbti_prompt_dismissed_until: dismissUntil.toISOString() }); } catch {}
      }
    }
    setDismissed(true);
    setShowDismissOptions(false);
    if (onDismiss) onDismiss();
  };

  const handleComplete = (mbtiType) => {
    setShowAssessment(false);
    if (onDismiss) onDismiss();
  };

  return (
    <>
      <Card className="border-2 border-violet-200 bg-gradient-to-r from-violet-50 via-white to-purple-50 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900">Discover Your Personality Type</h3>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                  <Gift className="w-3 h-3" />
                  Earn 0.0500000 GGG (USD $7.25)
                </div>
              </div>
              
              <p className="text-sm text-slate-600 mb-3">
                Complete a quick MBTI assessment to unlock better match compatibility and earn GGG rewards. 
                Takes about 5-10 minutes.
              </p>
              
              <div className="flex items-center gap-2 text-xs text-violet-600 mb-3">
                <Sparkles className="w-3 h-3" />
                <span>Improves match accuracy by up to 40%</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => setShowAssessment(true)}
                  className="bg-violet-600 hover:bg-violet-700 gap-2"
                >
                  <Brain className="w-4 h-4" />
                  Take Assessment Now
                </Button>
                
                <DropdownMenu open={showDismissOptions} onOpenChange={setShowDismissOptions}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-slate-500 hover:text-slate-700 gap-1"
                    >
                      <Clock className="w-4 h-4" />
                      Maybe Later
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => handleDismiss('hour')}>
                      Remind me in 1 hour
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDismiss('day')}>
                      Remind me tomorrow
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDismiss('week')}>
                      Remind me in a week
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDismiss('month')}>
                      Remind me in a month
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDismiss('never')} className="text-slate-400">
                      Don't remind me again
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowDismissOptions(true)}
              className="shrink-0 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAssessment} onOpenChange={setShowAssessment}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <MBTIAssessment 
            profile={profile} 
            onComplete={handleComplete}
            onSkip={() => {
              setShowAssessment(false);
              setShowDismissOptions(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}