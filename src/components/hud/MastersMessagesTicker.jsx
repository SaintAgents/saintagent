import React, { useState, useEffect } from 'react';

// Masters Messages - wisdom from those at Master rank and above
// St. Germain messages - to be expanded with Mary Magdalene and other Masters
const ST_GERMAIN_MESSAGES = [
  "I AM the presence of God's perfecting love.",
  "I AM the violet flame in action in me now.",
  "I AM the resurrection and the life of every cell of my body.",
  "The light of God never fails, and the light of God never fails me.",
  "I AM a being of violet fire, I AM the purity God desires.",
  "I call forth the violet flame to transmute all negative energy in my world.",
  "I AM the victory of light over darkness in every situation.",
  "I AM surrounded by the protective violet flame.",
  "My words are cups of light that bless all who hear them.",
  "I AM the open door which no man can shut.",
  "The flame of freedom is blazing within my heart.",
  "I AM the ascended master consciousness in action.",
  "Every thought I think is a thought of victory.",
  "I AM the fulfillment of my divine plan.",
  "I release all that is less than God's perfection.",
  "I AM the master presence of the ascended state.",
  "I AM clothed in the light of the living God.",
  "I AM the love of the sacred fire blazing through me.",
  "I AM the fullness of the Godhead bodily.",
  "The violet flame goes before me to prepare my way.",
  "I AM the embodiment of Saint Germain's freedom flame.",
  "I AM transmuting all karma through the violet fire.",
  "I stand in the flame of cosmic transmutation.",
  "I AM the victory of light in this hour.",
  "I AM a pillar of violet fire radiating God's love.",
  "I call upon the law of forgiveness for myself and all mankind.",
  "I AM one with the cosmic violet flame.",
  "The light within me is greater than any darkness without.",
  "I AM the resurrection and the life of my eternal youth.",
  "I AM freedom's holy light in action.",
  "I AM the immaculate concept of my divine self.",
  "I AM the power of transmutation in my life.",
  "Through the violet flame, I AM made whole.",
  "I AM the presence of victory in all things."
];

export default function MastersMessagesTicker() {
  const [currentIndex, setCurrentIndex] = useState(() => 
    Math.floor(Math.random() * ST_GERMAIN_MESSAGES.length)
  );
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(Math.floor(Math.random() * ST_GERMAIN_MESSAGES.length));
    }, 133200); // 2.22 minutes (133.2 seconds)
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex-1 overflow-hidden mx-2 md:mx-4 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 whitespace-nowrap">St. Germain:</span>
        <div className="text-xs text-slate-600 dark:text-violet-300 italic overflow-x-auto whitespace-nowrap scrollbar-hide md:truncate" style={{ WebkitOverflowScrolling: 'touch' }}>
          "{ST_GERMAIN_MESSAGES[currentIndex]}"
        </div>
      </div>
    </div>
  );
}

// Export messages for use elsewhere
export { ST_GERMAIN_MESSAGES };