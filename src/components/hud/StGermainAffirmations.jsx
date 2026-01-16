import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

// St. Germain Affirmations for the Affirmations Card
const ST_GERMAIN_AFFIRMATIONS = [
  {
    text: "I AM the presence of God's perfecting love.",
    category: "Love & Light"
  },
  {
    text: "I AM the violet flame in action in me now.",
    category: "Violet Flame"
  },
  {
    text: "I AM the resurrection and the life of every cell of my body.",
    category: "Healing"
  },
  {
    text: "The light of God never fails, and the light of God never fails me.",
    category: "Faith"
  },
  {
    text: "I AM a being of violet fire, I AM the purity God desires.",
    category: "Violet Flame"
  },
  {
    text: "I call forth the violet flame to transmute all negative energy in my world.",
    category: "Transmutation"
  },
  {
    text: "I AM the victory of light over darkness in every situation.",
    category: "Victory"
  },
  {
    text: "I AM surrounded by the protective violet flame.",
    category: "Protection"
  },
  {
    text: "My words are cups of light that bless all who hear them.",
    category: "Speech"
  },
  {
    text: "I AM the open door which no man can shut.",
    category: "Abundance"
  },
  {
    text: "The flame of freedom is blazing within my heart.",
    category: "Freedom"
  },
  {
    text: "I AM the ascended master consciousness in action.",
    category: "Mastery"
  },
  {
    text: "Every thought I think is a thought of victory.",
    category: "Victory"
  },
  {
    text: "I AM the fulfillment of my divine plan.",
    category: "Purpose"
  },
  {
    text: "I release all that is less than God's perfection.",
    category: "Release"
  },
  {
    text: "I AM the master presence of the ascended state.",
    category: "Mastery"
  },
  {
    text: "I AM clothed in the light of the living God.",
    category: "Light"
  },
  {
    text: "I AM the love of the sacred fire blazing through me.",
    category: "Love & Light"
  },
  {
    text: "I AM the fullness of the Godhead bodily.",
    category: "Oneness"
  },
  {
    text: "The violet flame goes before me to prepare my way.",
    category: "Violet Flame"
  },
  {
    text: "I AM the embodiment of Saint Germain's freedom flame.",
    category: "Freedom"
  },
  {
    text: "I AM transmuting all karma through the violet fire.",
    category: "Transmutation"
  },
  {
    text: "I stand in the flame of cosmic transmutation.",
    category: "Transmutation"
  },
  {
    text: "I AM the victory of light in this hour.",
    category: "Victory"
  },
  {
    text: "I AM a pillar of violet fire radiating God's love.",
    category: "Violet Flame"
  },
  {
    text: "I call upon the law of forgiveness for myself and all mankind.",
    category: "Forgiveness"
  },
  {
    text: "I AM one with the cosmic violet flame.",
    category: "Violet Flame"
  },
  {
    text: "The light within me is greater than any darkness without.",
    category: "Light"
  },
  {
    text: "I AM the resurrection and the life of my eternal youth.",
    category: "Healing"
  },
  {
    text: "I AM freedom's holy light in action.",
    category: "Freedom"
  },
  {
    text: "I AM the immaculate concept of my divine self.",
    category: "Self"
  },
  {
    text: "I AM the power of transmutation in my life.",
    category: "Transmutation"
  },
  {
    text: "Through the violet flame, I AM made whole.",
    category: "Healing"
  },
  {
    text: "I AM the presence of victory in all things.",
    category: "Victory"
  }
];

export default function StGermainAffirmations() {
  const [currentIndex, setCurrentIndex] = useState(() => 
    Math.floor(Math.random() * ST_GERMAIN_AFFIRMATIONS.length)
  );
  const [isAnimating, setIsAnimating] = useState(false);
  
  const getNextAffirmation = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(Math.floor(Math.random() * ST_GERMAIN_AFFIRMATIONS.length));
      setIsAnimating(false);
    }, 300);
  };
  
  // Auto-rotate every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      getNextAffirmation();
    }, 120000);
    return () => clearInterval(interval);
  }, []);
  
  const current = ST_GERMAIN_AFFIRMATIONS[currentIndex];
  
  return (
    <div className="space-y-4">
      {/* Main Affirmation Card */}
      <div className={`p-6 rounded-xl bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-900/40 dark:via-purple-900/30 dark:to-indigo-900/40 border border-violet-200 dark:border-violet-700 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-violet-900 dark:text-violet-200">St. Germain</p>
            <p className="text-xs text-violet-600 dark:text-violet-400">Master of the Violet Flame</p>
          </div>
        </div>
        
        {/* Affirmation */}
        <p className="text-lg md:text-xl font-medium text-violet-900 dark:text-violet-100 italic leading-relaxed">
          "{current.text}"
        </p>
        
        {/* Category Badge */}
        <div className="mt-4 flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-800/50 text-violet-700 dark:text-violet-300 text-xs font-medium">
            {current.category}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={getNextAffirmation}
            className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-xs">Next</span>
          </Button>
        </div>
      </div>
      
      {/* Book Link */}
      <a 
        href="https://a.co/d/h8ozO6I" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
      >
        <p className="text-xs text-amber-700 dark:text-amber-300 text-center font-medium">
          📖 Based on <span className="underline">7th Seal Hidden Wisdom Unveiled</span>
        </p>
      </a>
    </div>
  );
}

export { ST_GERMAIN_AFFIRMATIONS };