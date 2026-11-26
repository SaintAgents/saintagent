import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import TourWindow from '@/components/tour/TourWindow';
import TourScreenPreview from '@/components/tour/TourScreenPreview';
import TourSplitPane from '@/components/tour/TourSplitPane';
import { overviewPreviewTarget } from '@/components/tour/tourPreviewTargets';
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Sparkles, LayoutDashboard, PanelLeft, Settings, Layers, Palette, GripVertical, Moon, Cpu } from 'lucide-react';

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
    description: 'The Activity Cards are shortcuts: Earn opens Marketplace, Build opens Missions, and Connect opens Circles. The collapsible dashboard cards below can be rearranged separately.',
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
    id: 'themes',
    title: 'Themes',
    description: 'Switch between Light, Dark, Hacker, or Custom themes from the left sidebar. Each theme transforms the entire interface to match your style.',
    icon: Moon,
    position: 'left',
    highlight: 'sidebar'
  },
  {
    id: 'bgeffects',
    title: 'Background Effects',
    description: 'In Dark or Hacker themes, choose animated backgrounds: Matrix Rain, Starfield, Nebula, or Circuit patterns. Adjust speed, brightness, and variance to your liking.',
    icon: Cpu,
    position: 'left',
    highlight: 'sidebar'
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
  const anchors = { topbar: '#app-topbar', sidebar: '[data-sidebar]', sidepanel: '[data-side-panel-handle]', cards: '[data-deck-tour="shortcuts"]', controls: '[data-deck-tour="controls"]', themes: '[data-deck-tour="appearance"]', bgeffects: '[data-deck-tour="appearance"]', customize: '[data-deck-tour="controls"]' };
  if (!isOpen) return null;

  return <TourWindow onClose={handleSkip} header={<>
        <DialogTitle>Command Deck Tour</DialogTitle>
        <DialogDescription>Step {currentStep + 1} of {TOUR_STEPS.length}</DialogDescription>
  </>}>
      <TourSplitPane preview={<TourScreenPreview targets={[overviewPreviewTarget(step.title, anchors[step.id] ?? '[data-deck-tour="header"]')]} />}>
        <section aria-label="Lesson instructions" className="min-w-0 space-y-3 overflow-y-auto p-5 sm:px-8" aria-live="polite">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><StepIcon size={20} aria-hidden="true" />{step.title}</h2>
          <p className="text-sm leading-relaxed">{step.description}</p>
        </section>
      </TourSplitPane>
      <footer className="flex shrink-0 flex-wrap justify-between gap-2 border-t px-4 py-3 sm:px-8">
        <Button variant="ghost" onClick={handleSkip}>Skip Tour</Button>
        <div className="flex gap-2">
          {currentStep > 0 && <Button variant="outline" onClick={handlePrev}><ChevronLeft />Back</Button>}
          <Button onClick={handleNext}>{currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}{currentStep < TOUR_STEPS.length - 1 && <ChevronRight />}</Button>
        </div>
      </footer>
  </TourWindow>;
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