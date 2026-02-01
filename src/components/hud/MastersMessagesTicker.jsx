import React, { useState, useEffect } from 'react';

// Combined Masters Messages - wisdom from multiple Ascended Masters
const MASTERS_MESSAGES = [
  // St. Germain
  { master: "St. Germain", text: "I AM the presence of God's perfecting love." },
  { master: "St. Germain", text: "I AM the violet flame in action in me now." },
  { master: "St. Germain", text: "I AM the resurrection and the life of every cell of my body." },
  { master: "St. Germain", text: "The light of God never fails, and the light of God never fails me." },
  { master: "St. Germain", text: "I AM a being of violet fire, I AM the purity God desires." },
  { master: "St. Germain", text: "I call forth the violet flame to transmute all negative energy in my world." },
  { master: "St. Germain", text: "I AM the victory of light over darkness in every situation." },
  { master: "St. Germain", text: "I AM surrounded by the protective violet flame." },
  { master: "St. Germain", text: "My words are cups of light that bless all who hear them." },
  { master: "St. Germain", text: "I AM the open door which no man can shut." },
  { master: "St. Germain", text: "The flame of freedom is blazing within my heart." },
  { master: "St. Germain", text: "I AM the ascended master consciousness in action." },
  { master: "St. Germain", text: "I AM the fulfillment of my divine plan." },
  { master: "St. Germain", text: "I AM one with the cosmic violet flame." },
  { master: "St. Germain", text: "Through the violet flame, I AM made whole." },
  { master: "St. Germain", text: "I AM the presence of victory in all things." },
  
  // Mary Magdalene
  { master: "Mary Magdalene", text: "I AM the sacred feminine rising in power and grace." },
  { master: "Mary Magdalene", text: "Love is the bridge between worlds, and I walk it fearlessly." },
  { master: "Mary Magdalene", text: "I honor the divine within myself and all beings." },
  { master: "Mary Magdalene", text: "My heart is a temple of unconditional love." },
  { master: "Mary Magdalene", text: "I embody the wisdom of the ages in every breath." },
  { master: "Mary Magdalene", text: "I AM the rose of divine remembrance blooming in my heart." },
  { master: "Mary Magdalene", text: "Through love, all wounds are healed and all paths revealed." },
  { master: "Mary Magdalene", text: "I carry the light of the Divine Mother within me." },
  
  // Kuthumi
  { master: "Kuthumi", text: "Wisdom flows through me like a river of golden light." },
  { master: "Kuthumi", text: "I AM a student and teacher of the universal truths." },
  { master: "Kuthumi", text: "In stillness, I find the answers I seek." },
  { master: "Kuthumi", text: "I embrace learning as the path to enlightenment." },
  { master: "Kuthumi", text: "My mind is clear, my heart is open, my spirit is free." },
  { master: "Kuthumi", text: "I walk the path of wisdom with patience and grace." },
  
  // El Morya
  { master: "El Morya", text: "I AM the will of God in action." },
  { master: "El Morya", text: "Divine will and my will are one." },
  { master: "El Morya", text: "I stand firm in the blue flame of protection." },
  { master: "El Morya", text: "With courage and determination, I fulfill my divine purpose." },
  { master: "El Morya", text: "I AM aligned with the highest will for all." },
  
  // Quan Yin
  { master: "Quan Yin", text: "Compassion is my nature, mercy is my gift." },
  { master: "Quan Yin", text: "I extend loving kindness to all beings without exception." },
  { master: "Quan Yin", text: "In the lotus of my heart, peace eternally blooms." },
  { master: "Quan Yin", text: "I AM the embodiment of divine mercy and forgiveness." },
  { master: "Quan Yin", text: "Through compassion, I transform suffering into liberation." },
  
  // Hilarion
  { master: "Hilarion", text: "Truth is my beacon, healing is my mission." },
  { master: "Hilarion", text: "I AM a channel for divine healing energy." },
  { master: "Hilarion", text: "The green ray of truth illuminates my path." },
  { master: "Hilarion", text: "I embrace truth in all its forms and expressions." },
  
  // Serapis Bey
  { master: "Serapis Bey", text: "I AM the purity of the white flame ascending." },
  { master: "Serapis Bey", text: "Discipline and devotion accelerate my ascension." },
  { master: "Serapis Bey", text: "I purify my being to embody divine perfection." },
  { master: "Serapis Bey", text: "The white light of ascension surrounds and uplifts me." },
  
  // Lady Nada
  { master: "Lady Nada", text: "I serve with love, I lead with grace." },
  { master: "Lady Nada", text: "Divine love flows through me to heal and uplift." },
  { master: "Lady Nada", text: "I AM the presence of selfless service in the world." },
  { master: "Lady Nada", text: "Through loving service, I fulfill my highest calling." },
  
  // Djwal Khul
  { master: "Djwal Khul", text: "I bridge the teachings of the ages with present understanding." },
  { master: "Djwal Khul", text: "Esoteric wisdom flows through me for the benefit of all." },
  { master: "Djwal Khul", text: "I AM a vessel for divine knowledge and truth." },
  
  // Sananda (Jesus)
  { master: "Sananda", text: "I AM the way, the truth, and the life." },
  { master: "Sananda", text: "Love one another as I have loved you." },
  { master: "Sananda", text: "The kingdom of heaven is within you." },
  { master: "Sananda", text: "I AM the resurrection and the life." },
  { master: "Sananda", text: "With faith, all things are possible." }
];

// Legacy export for backwards compatibility
const ST_GERMAIN_MESSAGES = MASTERS_MESSAGES.filter(m => m.master === "St. Germain").map(m => m.text);

export default function MastersMessagesTicker() {
  const [currentIndex, setCurrentIndex] = useState(() => 
    Math.floor(Math.random() * MASTERS_MESSAGES.length)
  );
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a truly random index different from current
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * MASTERS_MESSAGES.length);
      } while (newIndex === currentIndex && MASTERS_MESSAGES.length > 1);
      setCurrentIndex(newIndex);
    }, 133200); // 2.22 minutes (133.2 seconds = 133200ms)
    return () => clearInterval(interval);
  }, [currentIndex]);
  
  const current = MASTERS_MESSAGES[currentIndex];
  
  return (
    <div className="flex-1 overflow-hidden mx-2 md:mx-4 min-w-0">
      <div className="flex items-center gap-2 animate-marquee">
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">{current.master}:</span>
        <div className="text-xs text-slate-700 dark:text-amber-200 italic whitespace-nowrap">
          "{current.text}"
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Export messages for use elsewhere
export { ST_GERMAIN_MESSAGES, MASTERS_MESSAGES };