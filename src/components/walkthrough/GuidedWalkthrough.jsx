import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Volume2, VolumeX, ChevronRight, ChevronLeft, Play } from 'lucide-react';
import { createPageUrl } from '@/utils';

// Walkthrough step definitions for 5D Business Entities
const BUSINESS_ENTITY_STEPS = [
  {
    id: 'navigate',
    speech: "Let's register your 5D Business Entity. I'll navigate you to the Business Entities page now.",
    description: "Navigating to the 5D Business Entities page...",
    action: 'navigate',
    target: 'BusinessEntities',
    delay: 1500,
  },
  {
    id: 'click-register',
    speech: "Great! Now click the Register Your Entity button to begin creating your business profile.",
    description: "Click the 'Register Your Entity' button",
    selector: '[data-walkthrough-register]',
    fallbackText: 'Register Your Entity',
    action: 'click',
    delay: 2000,
  },
  {
    id: 'fill-name',
    speech: "The registration form is open. Let's start with your entity name. Type your business or organization name in this field.",
    description: "Enter your Entity Name in this field",
    selector: 'input[placeholder="Your organization name"]',
    action: 'focus',
    delay: 2000,
  },
  {
    id: 'fill-tagline',
    speech: "Now add a catchy tagline or slogan for your entity.",
    description: "Add a short tagline or motto",
    selector: 'input[placeholder="Short slogan or motto"]',
    action: 'focus',
    delay: 1500,
  },
  {
    id: 'select-category',
    speech: "Choose a category that best fits your business from this dropdown.",
    description: "Select your business category",
    selector: '[data-radix-select-trigger]',
    fallbackSelector: 'button[role="combobox"]',
    action: 'highlight',
    delay: 1500,
  },
  {
    id: 'fill-description',
    speech: "Describe what your entity does. Be detailed — this helps people find and understand your business.",
    description: "Describe what your entity does",
    selector: 'textarea[placeholder="What does your entity do?"]',
    action: 'focus',
    delay: 1500,
  },
  {
    id: 'fill-mission',
    speech: "Now add your mission statement. What drives your organization?",
    description: "Enter your core mission statement",
    selector: 'textarea[placeholder="Your core mission..."]',
    action: 'focus',
    delay: 1500,
  },
  {
    id: 'complete',
    speech: "Excellent! Fill in any remaining optional fields like focus areas, website, and location. When you're ready, click Create Entity to publish your 5D Business profile!",
    description: "Complete the remaining fields and click 'Create Entity'",
    selector: 'button[type="submit"]',
    action: 'highlight',
    delay: 2000,
  }
];

// Find an element by selector with fallbacks
function findElement(step) {
  if (step.selector) {
    const el = document.querySelector(step.selector);
    if (el) return el;
  }
  if (step.fallbackSelector) {
    const el = document.querySelector(step.fallbackSelector);
    if (el) return el;
  }
  if (step.fallbackText) {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent?.includes(step.fallbackText)) return btn;
    }
  }
  return null;
}

// Text-to-speech — voices load async, so we cache them after voiceschanged fires
let cachedVoices = [];
if (typeof window !== 'undefined' && window.speechSynthesis) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

function speak(text, enabled, onEnd) {
  if (!enabled || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();

  const doSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Microsoft Zira')
    ) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    utterance.onend = onEnd;
    utterance.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utterance);
  };

  // If voices aren't loaded yet, wait for them
  if (cachedVoices.length === 0) {
    const check = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      if (cachedVoices.length > 0) {
        doSpeak();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  } else {
    doSpeak();
  }
}

export default function GuidedWalkthrough({ walkthroughId = 'business_entity', onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [started, setStarted] = useState(false);
  const [highlightRect, setHighlightRect] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cancelRef = useRef(0);
  const ttsRef = useRef(true);

  const steps = BUSINESS_ENTITY_STEPS;
  const step = steps[currentStep];

  useEffect(() => { ttsRef.current = ttsEnabled; }, [ttsEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRef.current++;
      window.speechSynthesis?.cancel();
      removeHighlight();
    };
  }, []);

  // Ensure voices are warmed up
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const removeHighlight = useCallback(() => {
    document.querySelectorAll('[data-walkthrough-highlight]').forEach(el => {
      el.removeAttribute('data-walkthrough-highlight');
      el.style.removeProperty('box-shadow');
      el.style.removeProperty('outline');
      el.style.removeProperty('z-index');
      el.style.removeProperty('position');
    });
    setHighlightRect(null);
  }, []);

  const highlightElement = useCallback((el) => {
    if (!el) return;
    removeHighlight();
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.setAttribute('data-walkthrough-highlight', 'true');
    el.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.6), 0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)';
    el.style.outline = '2px solid rgba(139, 92, 246, 0.8)';
    el.style.zIndex = '99999';
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }
    const rect = el.getBoundingClientRect();
    setHighlightRect(rect);
  }, [removeHighlight]);

  // Execute step when currentStep changes
  useEffect(() => {
    if (!started) return;

    // Cancel any previous async step execution
    cancelRef.current++;
    const myToken = cancelRef.current;
    const cancelled = () => myToken !== cancelRef.current;

    const run = async () => {
      const s = steps[currentStep];
      if (!s) return;

      removeHighlight();
      setIsSpeaking(true);
      speak(s.speech, ttsRef.current, () => setIsSpeaking(false));

      if (s.action === 'navigate') {
        await new Promise(r => setTimeout(r, s.delay || 1500));
        if (cancelled()) return;
        const currentPath = window.location.pathname;
        if (!currentPath.includes(s.target)) {
          window.location.href = createPageUrl(s.target);
        } else {
          setCurrentStep(prev => prev + 1);
        }
        return;
      }

      // Wait for element to appear
      let el = null;
      let attempts = 0;
      while (!el && attempts < 30) {
        if (cancelled()) return;
        el = findElement(s);
        if (!el) {
          await new Promise(r => setTimeout(r, 300));
          attempts++;
        }
      }

      if (cancelled()) return;
      if (!el) {
        console.warn(`Walkthrough: element not found for step "${s.id}"`);
        return;
      }

      highlightElement(el);

      if (s.action === 'click') {
        await new Promise(r => setTimeout(r, 1200));
        if (cancelled()) return;
        el.click();
        await new Promise(r => setTimeout(r, 800));
        if (cancelled()) return;
        setCurrentStep(prev => prev + 1);
      } else if (s.action === 'focus') {
        await new Promise(r => setTimeout(r, 600));
        if (cancelled()) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 300));
        if (cancelled()) return;
        el.focus();
      }
    };

    run();
  }, [currentStep, started]);

  // Re-highlight on scroll/resize
  useEffect(() => {
    if (!highlightRect) return;
    const updatePosition = () => {
      const el = document.querySelector('[data-walkthrough-highlight]');
      if (el) {
        const rect = el.getBoundingClientRect();
        setHighlightRect(rect);
      }
    };
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [highlightRect]);

  // Store walkthrough state in sessionStorage so it persists across navigation
  useEffect(() => {
    if (started) {
      sessionStorage.setItem('activeWalkthrough', JSON.stringify({ 
        id: walkthroughId, 
        step: currentStep,
        tts: ttsEnabled 
      }));
    }
    return () => {
      if (!started) sessionStorage.removeItem('activeWalkthrough');
    };
  }, [started, currentStep, walkthroughId, ttsEnabled]);

  // Resume walkthrough after navigation
  useEffect(() => {
    const saved = sessionStorage.getItem('activeWalkthrough');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.id === walkthroughId && data.step > 0) {
        setCurrentStep(data.step);
        setTtsEnabled(data.tts);
        setStarted(true);
        // Auto advance from navigate step
        if (steps[data.step]?.action === 'navigate') {
          setTimeout(() => setCurrentStep(data.step + 1), 1000);
        }
      }
    }
  }, [walkthroughId]);

  const handleNext = () => {
    cancelRef.current++; // cancel any running async step
    window.speechSynthesis?.cancel();
    removeHighlight();
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    cancelRef.current++;
    window.speechSynthesis?.cancel();
    removeHighlight();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    cancelRef.current++;
    window.speechSynthesis?.cancel();
    removeHighlight();
    sessionStorage.removeItem('activeWalkthrough');
    onClose?.();
  };

  const handleStart = () => {
    setStarted(true);
  };

  if (!started) {
    return (
      <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-violet-600 ml-1" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">5D Business Entity Walkthrough</h2>
          <p className="text-slate-600 mb-6">
            I'll guide you step-by-step through registering your business entity. 
            I'll highlight each field, navigate for you, and explain what to do along the way.
          </p>
          <div className="flex items-center justify-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`gap-2 ${ttsEnabled ? 'border-violet-400 text-violet-700 bg-violet-50' : 'text-slate-500'}`}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {ttsEnabled ? 'Voice ON' : 'Voice OFF'}
            </Button>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
            <Button className="flex-1 bg-violet-600 hover:bg-violet-700 gap-2" onClick={handleStart}>
              <Play className="w-4 h-4" /> Start Walkthrough
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Pulsing glow CSS animation */}
      <style>{`
        @keyframes walkthrough-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.6), 0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2); }
          50% { box-shadow: 0 0 0 8px rgba(139, 92, 246, 0.4), 0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3); }
        }
        [data-walkthrough-highlight] {
          animation: walkthrough-pulse 1.5s ease-in-out infinite !important;
          border-radius: 8px;
        }
      `}</style>

      {/* Bottom instruction bar */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[99999] w-full max-w-lg px-4">
        <div className="bg-white border-2 border-violet-300 rounded-2xl shadow-2xl p-4">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 font-medium shrink-0">
              {currentStep + 1}/{steps.length}
            </span>
          </div>

          {/* Instruction */}
          <p className="text-sm text-slate-800 font-medium mb-3">
            {step?.description}
          </p>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 shrink-0"
              onClick={() => {
                setTtsEnabled(!ttsEnabled);
                if (ttsEnabled) window.speechSynthesis?.cancel();
              }}
              title={ttsEnabled ? 'Mute voice' : 'Enable voice'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4 text-violet-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </Button>

            <div className="flex-1" />

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-3 h-3" /> Back
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1 bg-violet-600 hover:bg-violet-700"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-3 h-3" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-slate-400 hover:text-slate-600"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}