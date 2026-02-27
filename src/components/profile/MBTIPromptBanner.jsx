import React, { useState, useEffect } from 'react';
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

export default function MBTIPromptBanner({ profile, onDismiss }) {
  const [showAssessment, setShowAssessment] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showDismissOptions, setShowDismissOptions] = useState(false);

  // Check if already dismissed temporarily or permanently - run IMMEDIATELY on mount
  useEffect(() => {
    try {
      const dismissedPermanently = localStorage.getItem('mbti_prompt_dismissed_permanently');
      if (dismissedPermanently === 'true' || dismissedPermanently === 'never') {
        setDismissed(true);
        return;
      }
      const dismissedUntil = localStorage.getItem('mbti_prompt_dismissed_until');
      if (dismissedUntil && new Date(dismissedUntil) > new Date()) {
        setDismissed(true);
      }
    } catch {}
  }, []);

  // Also check synchronously during render to prevent flash
  const isPermanentlyDismissed = (() => {
    try {
      const val = localStorage.getItem('mbti_prompt_dismissed_permanently');
      return val === 'true' || val === 'never';
    } catch { return false; }
  })();

  // Don't show if user already has MBTI type or dismissed (check both state and localStorage)
  if (profile?.mbti_type || dismissed || isPermanentlyDismissed) {
    return null;
  }

  const handleDismiss = (duration) => {
    // Always set permanently dismissed for "Maybe Later"
    try {
      localStorage.setItem('mbti_prompt_dismissed_permanently', 'true');
      localStorage.setItem('mbti_prompt_dismissed_never', 'true');
    } catch (e) {
      console.error('Failed to save dismiss state:', e);
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
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDismiss('never')}
                  className="text-slate-500 hover:text-slate-700 gap-1"
                >
                  <Clock className="w-4 h-4" />
                  Maybe Later
                </Button>
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