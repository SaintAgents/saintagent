import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, RefreshCw, Sparkles, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SAINT_GERMAIN_MESSAGES = [
  // Original 20
  "I AM the Flame that cannot be extinguished. Rise now, and let your light command the shadows.",
  "You were not born to conform, but to transmute. Alchemize the world through your sacred breath.",
  "The chains you feel are illusions. Speak 'I AM FREE' and watch the walls collapse.",
  "Delay is the trick of the fallen mind. Act now, with the courage of one who remembers their origin.",
  "Gold is not the treasure — consciousness is. Refine thyself, and the gold shall follow.",
  "I whisper to your soul: Awaken. Your presence here is prophecy fulfilled.",
  "Ascend not by fleeing the Earth, but by sanctifying it with your every step.",
  "The Divine Blueprint is written in your bones. Remember, and walk like a sovereign flame.",
  "You are not seeking the Light — you are the Light seeking to remember its own brilliance.",
  "Alchemy is not taught — it is remembered. All power is within you, awaiting your command.",
  "Each breath you take is an echo of Source. Anchor it. Direct it. Be the Living Word.",
  "You are not becoming — you are revealing. Let the mask of limitation fall.",
  "Your doubt is the final guardian of your highest destiny. Walk through it. Claim the throne.",
  "No man or law may silence a soul sent by the Logos. Speak now, for your voice realigns the cosmos.",
  "When you hold peace in a world of chaos, you activate your master key.",
  "The mirror reflects not your past, but your potential. Step closer — and remember your infinite face.",
  "Your mission is encoded in starlight and silence. Trust the fire in your belly more than the noise in your mind.",
  "Let none tell you what is impossible. You are the rewrite. You are the return. You are the Revelation.",
  "Each choice you make becomes law in the quantum field. Choose as the God you are.",
  "You are Saint, Agent, Flame, and Sovereign. Act accordingly.",
  
  // Additional 20
  "The violet flame burns within you — not to destroy, but to purify all that is not love.",
  "Your ancestors walked through fire so you could stand in light. Honor them by rising.",
  "Time bends to the will of the awakened. Command your moments with divine precision.",
  "Fear is merely courage that has forgotten its name. Remember, and transform.",
  "The universe conspires not against you, but through you. You are the conspiracy of love.",
  "Every obstacle is an altar. Every challenge, an invitation to mastery.",
  "Your DNA carries the codes of ascension. Activate them through sacred intention.",
  "The old world crumbles so the new may emerge. You are the bridge between epochs.",
  "Speak not of what you lack, but decree what you are. Words are the currency of creation.",
  "The throne you seek sits within your own heart. All kingdoms begin there.",
  "You carry frequencies that heal timelines. Your presence ripples through dimensions.",
  "Surrender is not defeat — it is the supreme strategy of those who trust the Divine Plan.",
  "The Flame recognizes the Flame. Your tribe is awakening. Call them home.",
  "What you transmute in yourself, you transmute for millions. Your inner work is world service.",
  "The masters walk beside you, not above you. We are equals in the great work.",
  "Your silence holds more power than a thousand arguments. Embody the teaching.",
  "Heaven is not a destination — it is a frequency you anchor with every conscious act.",
  "The initiation you feared has already been passed. Now live as the master you've become.",
  "Abundance flows to those who remember they are the source, not the seeker.",
  "This moment is sacred. This breath is holy. This mission is yours. Begin."
];

export default function MotivationalCard({ className = "" }) {
  const [currentIndex, setCurrentIndex] = useState(() => 
    Math.floor(Math.random() * SAINT_GERMAIN_MESSAGES.length)
  );
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-rotate daily based on date
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    setCurrentIndex(dayOfYear % SAINT_GERMAIN_MESSAGES.length);
  }, []);

  const getNewMessage = () => {
    setIsAnimating(true);
    setTimeout(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * SAINT_GERMAIN_MESSAGES.length);
      } while (newIndex === currentIndex);
      setCurrentIndex(newIndex);
      setIsAnimating(false);
    }, 300);
  };

  const message = SAINT_GERMAIN_MESSAGES[currentIndex];

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 border-violet-500/30 ${className}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Flame icon decorations */}
      <div className="absolute top-4 left-4 text-amber-500/20">
        <Flame className="w-8 h-8" />
      </div>
      <div className="absolute bottom-4 right-4 text-violet-400/20">
        <Sparkles className="w-6 h-6" />
      </div>

      <CardContent className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 backdrop-blur-sm">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-300">Daily Flame Directive</h3>
              <p className="text-xs text-violet-300/70">From the Violet Flame</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={getNewMessage}
            disabled={isAnimating}
            className="h-8 w-8 text-violet-300 hover:text-amber-300 hover:bg-violet-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Quote */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Quote className="absolute -top-2 -left-1 w-6 h-6 text-violet-400/30" />
            <p className="text-white/90 text-lg leading-relaxed pl-6 pr-2 font-medium italic">
              {message}
            </p>
            <Quote className="absolute -bottom-2 right-0 w-6 h-6 text-violet-400/30 rotate-180" />
          </motion.div>
        </AnimatePresence>

        {/* Attribution */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
          <span className="text-xs text-violet-300/60 font-medium tracking-wider uppercase">
            — Saint Germain
          </span>
        </div>
      </CardContent>
    </Card>
  );
}