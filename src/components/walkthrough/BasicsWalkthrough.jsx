import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronLeft, CheckCircle2, User, LogOut, HelpCircle, MousePointerClick
} from "lucide-react";

const STEPS = [
  {
    id: 'intro',
    title: 'Platform Basics 🎓',
    description: 'Let\'s quickly show you a few essentials — how to access your profile, find help, and log out.',
    icon: HelpCircle,
    type: 'info'
  },
  {
    id: 'avatar_menu',
    title: 'Your Avatar Menu',
    description: 'Click your avatar photo in the top-right corner to open the main menu. This is your gateway to key actions.',
    icon: MousePointerClick,
    type: 'highlight',
    highlightSelector: '[data-radix-dropdown-menu-trigger]',
    fallbackSelector: 'header button:last-of-type',
    action: 'Click your avatar now to see the menu open.',
    autoOpen: true
  },
  {
    id: 'profile_link',
    title: 'My Dashboard / Profile',
    description: 'From the avatar menu, the first item is "My Dashboard/Profile". This takes you to your full profile page where you can edit your bio, skills, and mystical data.',
    icon: User,
    type: 'info',
    tip: 'A complete profile dramatically improves your match quality!'
  },
  {
    id: 'logout',
    title: 'Signing Out',
    description: 'To log out, open the avatar menu and scroll to the bottom — you\'ll see the "Sign Out" button in red. There\'s also a small logout icon at the top-right of the menu card.',
    icon: LogOut,
    type: 'info',
    tip: 'Your session stays active until you explicitly sign out.'
  },
  {
    id: 'done',
    title: 'You\'re All Set! ✅',
    description: 'Those are the basics! Next, the Help panel will open on the right side — it has suggestions and guides to help you explore further.',
    icon: CheckCircle2,
    type: 'info'
  }
];

export default function BasicsWalkthrough({ open, onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  // Auto-open the avatar dropdown on step 1
  useEffect(() => {
    if (step === 1 && current.autoOpen) {
      // Find and click the avatar dropdown trigger in the topbar
      const trigger = document.querySelector('header [data-radix-dropdown-menu-trigger]') ||
                      document.querySelector('header button:last-of-type');
      if (trigger) {
        // Highlight it
        trigger.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.6), 0 0 20px rgba(139, 92, 246, 0.3)';
        trigger.style.borderRadius = '12px';
        trigger.style.transition = 'box-shadow 0.3s';
      }
      return () => {
        if (trigger) {
          trigger.style.boxShadow = '';
        }
      };
    }
  }, [step, current]);

  const handleNext = () => {
    // Remove highlight from previous step
    const highlighted = document.querySelector('[style*="box-shadow: 0 0 0 3px"]');
    if (highlighted) highlighted.style.boxShadow = '';
    
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pt-4 px-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-6 bg-violet-600" : i < step ? "w-2 bg-violet-300" : "w-2 bg-slate-200"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">{current.title}</h2>
                <p className="text-slate-600 text-sm">{current.description}</p>
              </div>
            </div>

            {current.action && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
                <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 shrink-0" />
                  {current.action}
                </p>
              </div>
            )}

            {current.tip && (
              <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 mb-4">
                <p className="text-sm text-violet-700">💡 {current.tip}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="px-6 pb-6 flex items-center justify-between border-t pt-4">
          <Button variant="ghost" onClick={handlePrev} disabled={step === 0} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="gap-1 bg-violet-600 hover:bg-violet-700">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={onClose} className="gap-1 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4" /> Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}