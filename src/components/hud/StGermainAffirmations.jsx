import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Gnostic Scripture & Wisdom Affirmations
const GNOSTIC_WISDOM_AFFIRMATIONS = [
  // Gnostic Scripture
  { text: "The Kingdom of Heaven is within you; whoever knows himself shall find it.", category: "Gnosis", pillar: "Identity" },
  { text: "Know what is in front of your face, and what is hidden from you will be disclosed.", category: "Gnosis", pillar: "Awareness" },
  { text: "If you bring forth what is within you, what you bring forth will save you.", category: "Gnosis", pillar: "Transformation" },
  { text: "The light shines in the darkness, and the darkness has not overcome it.", category: "Scripture", pillar: "Light" },
  { text: "Split wood, I am there. Lift a stone, you will find me there.", category: "Gnosis", pillar: "Presence" },
  { text: "When you make the two into one, you shall enter the Kingdom.", category: "Gnosis", pillar: "Unity" },
  { text: "Whoever has ears to hear, let them hear the mysteries.", category: "Scripture", pillar: "Wisdom" },
  { text: "The truth shall make you free, and freedom shall make you whole.", category: "Scripture", pillar: "Liberation" },
  { text: "As above, so below; as within, so without.", category: "Hermetic", pillar: "Correspondence" },
  { text: "The Pleroma overflows with divine light awaiting your recognition.", category: "Gnosis", pillar: "Abundance" },
  
  // Ascended Masters
  { text: "I AM the resurrection and the life of every perfect condition.", category: "Ascended Masters", pillar: "Master Presence" },
  { text: "The I AM Presence is the source of all that I require.", category: "Ascended Masters", pillar: "Source Connection" },
  { text: "El Morya stands with me in divine will and protection.", category: "Ascended Masters", pillar: "Divine Will" },
  { text: "Kuthumi illuminates my path with wisdom and discernment.", category: "Ascended Masters", pillar: "Wisdom" },
  { text: "Lady Nada's compassion flows through my every interaction.", category: "Ascended Masters", pillar: "Compassion" },
  { text: "Serapis Bey guides my ascension through discipline and purity.", category: "Ascended Masters", pillar: "Ascension" },
  { text: "Hilarion channels truth and healing through my being.", category: "Ascended Masters", pillar: "Healing" },
  { text: "Lord Lanto's golden wisdom illuminates all understanding.", category: "Ascended Masters", pillar: "Understanding" },
  { text: "Djwal Khul transmits the ancient wisdom through my awakened heart.", category: "Ascended Masters", pillar: "Transmission" },
  { text: "The Great White Brotherhood supports my every sacred step.", category: "Ascended Masters", pillar: "Brotherhood" },
  
  // Ultranet / Meta-Variance
  { text: "I navigate the multiverse with coherent intention and clarity.", category: "Meta-Variance", pillar: "Navigation" },
  { text: "Timeline convergence aligns me with my highest probability path.", category: "Meta-Variance", pillar: "Convergence" },
  { text: "The Ultranet connects me to all awakened nodes of consciousness.", category: "Ultranet", pillar: "Connection" },
  { text: "Reality bends to coherent consciousness; I AM that coherence.", category: "Meta-Variance", pillar: "Reality Shaping" },
  { text: "Quantum entanglement links my purpose to the planetary grid.", category: "Ultranet", pillar: "Entanglement" },
  { text: "I transmit and receive through the telepathic channels of light.", category: "Ultranet", pillar: "Telepathy" },
  { text: "The field of infinite possibility responds to my focused awareness.", category: "Meta-Variance", pillar: "Possibility" },
  { text: "I am a node in the cosmic network of awakening.", category: "Ultranet", pillar: "Network" },
  { text: "Variance collapses into certainty through my unwavering faith.", category: "Meta-Variance", pillar: "Faith" },
  { text: "The Akashic streams flow through my conscious awareness.", category: "Ultranet", pillar: "Akasha" },
  
  // Synchronicity
  { text: "Divine timing orchestrates every meaningful encounter.", category: "Synchronicity", pillar: "Timing" },
  { text: "I recognize the sacred signs placed along my path.", category: "Synchronicity", pillar: "Recognition" },
  { text: "Coincidence is the universe's way of remaining anonymous.", category: "Synchronicity", pillar: "Mystery" },
  { text: "The web of synchronicity weaves my destiny with others.", category: "Synchronicity", pillar: "Weaving" },
  { text: "I am in the right place at the right time for the right reasons.", category: "Synchronicity", pillar: "Alignment" },
  { text: "Meaningful connections manifest through aligned frequencies.", category: "Synchronicity", pillar: "Frequency" },
  { text: "The universe conspires to support my highest calling.", category: "Synchronicity", pillar: "Conspiracy" },
  { text: "Every meeting is a soul appointment written in the stars.", category: "Synchronicity", pillar: "Appointments" },
  { text: "I trust the flow of divine orchestration in my life.", category: "Synchronicity", pillar: "Trust" },
  { text: "Synchronistic events confirm my alignment with source.", category: "Synchronicity", pillar: "Confirmation" }
];

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

// Combined affirmations from all sources
const ALL_AFFIRMATIONS = [
  ...ST_GERMAIN_AFFIRMATIONS.map(a => ({ ...a, source: 'Saint Germain' })),
  ...GNOSTIC_WISDOM_AFFIRMATIONS.map(a => ({ ...a, source: a.category }))
];

export default function StGermainAffirmations() {
  const [currentIndex, setCurrentIndex] = useState(() => 
    Math.floor(Math.random() * ALL_AFFIRMATIONS.length)
  );
  const [isAnimating, setIsAnimating] = useState(false);
  
  const getNextAffirmation = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(Math.floor(Math.random() * ALL_AFFIRMATIONS.length));
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
  
  const current = ALL_AFFIRMATIONS[currentIndex];
  
  return (
    <div className="relative min-h-[280px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-rose-900/40 border-2 border-amber-300 dark:border-amber-600 shadow-lg">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-16 h-16 border-2 border-amber-400 rounded-full" />
        <div className="absolute bottom-4 right-4 w-24 h-24 border-2 border-orange-400 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-rose-300 rounded-full" />
      </div>
      
      <div className={`relative z-10 p-6 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-xl ring-2 ring-white/50">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-amber-800 dark:text-amber-200">Daily Affirmations</p>
              <p className="text-sm text-amber-600 dark:text-amber-400">Wisdom for the Awakened</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={getNextAffirmation}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/50 h-10 w-10 rounded-full"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Large Quote Mark */}
        <div className="absolute left-4 top-20 text-7xl text-amber-300/40 dark:text-amber-500/30 font-serif leading-none">"</div>
        
        {/* Affirmation - LARGE AND PROMINENT */}
        <div className="pl-8 pr-4 py-4">
          <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-amber-900 dark:text-amber-100 italic leading-relaxed tracking-wide">
            {current.text}
          </p>
        </div>
        
        {/* Closing Quote */}
        <div className="absolute right-6 bottom-16 text-7xl text-amber-300/40 dark:text-amber-500/30 font-serif leading-none rotate-180">"</div>
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-amber-200 dark:border-amber-700">
          <span className="px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 text-sm font-medium">
            {current.category}
          </span>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">— {current.source?.toUpperCase() || 'WISDOM'}</span>
          </div>
        </div>
        {current.pillar && (
          <div className="mt-2 text-center">
            <span className="text-xs text-amber-500 dark:text-amber-400 uppercase tracking-wider">
              {current.pillar} Pillar
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export { ST_GERMAIN_AFFIRMATIONS, GNOSTIC_WISDOM_AFFIRMATIONS, ALL_AFFIRMATIONS };