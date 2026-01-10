import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Sparkles, LayoutDashboard, PanelLeft, Settings, Layers, Palette, GripVertical, Minimize2, Save, RotateCcw } from 'lucide-react';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Your Command Deck',
    description: 'Your mission control center for managing connections, missions, and earnings. Let\'s take a quick tour!',
    icon: Sparkles,
    position: 'center'
  },
  {
    id: 'topbar',
    title: 'Top Bar (Command Center)',
    description: 'Your main navigation hub with quick access to tools and settings. Switch between modes, access menus, and manage notifications.',
    icon: LayoutDashboard,
    position: 'top',
    highlight: 'header'
  },
  {
    id: 'sidebar',
    title: 'Left Panel (Navigation)',
    description: 'Your navigation toolkit at your fingertips. Access all major sections: Missions, Matches, Meetings, Marketplace, and more.',
    icon: PanelLeft,
    position: 'left',
    highlight: 'sidebar'
  },
  {
    id: 'sidepanel',
    title: 'Right Panel (Quick Access)',
    description: 'Modular panels that adapt to your workflow. View matches, upcoming meetings, stored cards, and quick stats.',
    icon: Layers,
    position: 'right',
    highlight: 'sidepanel'
  },
  {
    id: 'cards',
    title: 'Activity Cards',
    description: 'Collapsible cards showing your missions, meetings, marketplace, and more. Drag to reorder, collapse to save space.',
    icon: GripVertical,
    position: 'center',
    highlight: 'cards'
  },
  {
    id: 'controls',
    title: 'Controls Deck',
    description: 'Save your layout, reset to defaults, collapse or expand all cards, and stow cards to the side panel.',
    icon: Settings,
    position: 'center',
    highlight: 'controls'
  },
  {
    id: 'customize',
    title: 'Customization Tips',
    description: 'Rearrange cards by dragging • Collapse cards to minimize • Stow cards to the side panel • Save your preferred layout anytime',
    icon: Palette,
    position: 'center'
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    description: 'Explore your Command Deck and make it your own. You can access this tour anytime from Settings.',
    icon: Sparkles,
    position: 'center'
  }
];

export default function CommandDeckTour({ onComplete, autoStart = false }) {
  const [isOpen, setIsOpen] = useState(autoStart);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (autoStart) {
      setIsOpen(true);
    }
  }, [autoStart]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('commandDeckTourComplete', 'true');
    } catch {}
    onComplete?.();
  };

  const handleSkip = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('commandDeckTourComplete', 'true');
    } catch {}
    onComplete?.();
  };

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />

        {/* Highlight overlay for specific areas */}
        {step.highlight && (
          <div className="absolute inset-0 pointer-events-none">
            {step.highlight === 'sidebar' && (
              <div className="absolute left-0 top-0 w-64 h-full border-4 border-violet-500 bg-violet-500/10 animate-pulse" />
            )}
            {step.highlight === 'sidepanel' && (
              <div className="absolute right-0 top-0 w-80 h-full border-4 border-violet-500 bg-violet-500/10 animate-pulse" />
            )}
            {step.highlight === 'header' && (
              <div className="absolute left-0 top-0 right-0 h-16 border-4 border-violet-500 bg-violet-500/10 animate-pulse" />
            )}
          </div>
        )}

        {/* Tour Card */}
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <StepIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-violet-200 text-xs uppercase tracking-wider">Step {currentStep + 1} of {TOUR_STEPS.length}</p>
                  <h3 className="font-bold text-lg">{step.title}</h3>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-slate-600 leading-relaxed">{step.description}</p>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-slate-500"
            >
              Skip Tour
            </Button>
            
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-violet-600 hover:bg-violet-700 gap-1"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Loading screen component
export function CommandDeckLoadingScreen({ onLoadComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Command Deck...');

  useEffect(() => {
    const statusMessages = [
      'Initializing Command Deck...',
      'Loading your profile...',
      'Syncing matches...',
      'Preparing dashboard...',
      'Almost ready...',
      'Stand by for tour...'
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15 + 5, 100);
        
        // Update status text based on progress
        const idx = Math.min(Math.floor(newProgress / 20), statusMessages.length - 1);
        if (idx !== currentIdx) {
          currentIdx = idx;
          setStatusText(statusMessages[idx]);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => onLoadComplete?.(), 500);
        }
        
        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [onLoadComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center"
    >
      {/* Command Deck Preview Image */}
      <div className="relative mb-8 w-full max-w-2xl px-8">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/98d67726c_gemini-25-flash-image_merge_the_shield_into_the_center-0.jpg"
            alt="Command Deck Preview"
            className="w-full h-auto opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-violet-900/80 to-transparent" />
        </div>
        
        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20"
        >
          <p className="text-white/80 text-sm">🚀 Your Mission Control</p>
        </motion.div>
      </div>

      {/* Loading content */}
      <div className="text-center px-8 max-w-md">
        <h2 className="text-3xl font-bold text-white mb-2">Command Deck</h2>
        <p className="text-violet-200 mb-8">{statusText}</p>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-400 to-purple-400"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <p className="text-white/60 text-sm">{Math.round(progress)}%</p>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-violet-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}