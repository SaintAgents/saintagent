import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

// Demo testimonials data
const DEMO_TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah M.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    role: "Healer & Coach",
    rank: "Sage",
    text: "This platform changed everything for me. I found my tribe, my collaborators, and tripled my income doing meaningful work!",
    rating: 5
  },
  {
    id: 2,
    name: "Marcus J.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    role: "Tech Entrepreneur",
    rank: "Master",
    text: "The AI matching is incredible. Every connection I've made has been deeply aligned with my mission. Finally, a platform that gets it.",
    rating: 5
  },
  {
    id: 3,
    name: "Elena R.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    role: "Spiritual Teacher",
    rank: "Oracle",
    text: "I've been searching for a conscious community like this for years. The energy here is transformative. My students love it!",
    rating: 5
  },
  {
    id: 4,
    name: "David K.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    role: "Impact Investor",
    rank: "Adept",
    text: "Saint Agents bridges the gap between purpose and profit beautifully. I've found amazing projects to support here.",
    rating: 5
  },
  {
    id: 5,
    name: "Aisha N.",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop",
    role: "Community Builder",
    rank: "Practitioner",
    text: "The mission system keeps me accountable and connected. I've completed more meaningful projects here than anywhere else!",
    rating: 5
  },
  {
    id: 6,
    name: "James L.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    role: "Creative Director",
    rank: "Master",
    text: "Every day I'm amazed by the caliber of people here. Real visionaries, real collaboration, real results. This is the future.",
    rating: 5
  },
  {
    id: 7,
    name: "Sarah Mitchell",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    role: "Top Contributor",
    rank: "Sage",
    text: "So excited about the opportunities here! Already made my first 500 GGG in just two days.",
    rating: 5
  },
  {
    id: 8,
    name: "Robert C.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    role: "Author & Speaker",
    rank: "Oracle",
    text: "I've launched two successful courses through this platform. The community support is unmatched anywhere online.",
    rating: 5
  }
];

const TestimonialCard = ({ testimonial }) => (
  <div className="flex-shrink-0 w-[320px] md:w-[380px] p-5 mx-3 rounded-xl bg-slate-800/70 border border-violet-500/30 backdrop-blur-sm">
    <div className="flex items-start gap-3 mb-3">
      <Avatar className="w-12 h-12 ring-2 ring-violet-500/50">
        <AvatarImage src={testimonial.avatar} />
        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold text-white">{testimonial.name}</p>
        <p className="text-xs text-violet-400">{testimonial.role}</p>
        <div className="flex items-center gap-1 mt-1">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
      <Quote className="w-6 h-6 text-violet-500/50" />
    </div>
    <p className="text-sm text-slate-300 leading-relaxed">{testimonial.text}</p>
  </div>
);

export default function TestimonialsMarquee({ className = "" }) {
  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...DEMO_TESTIMONIALS, ...DEMO_TESTIMONIALS];

  return (
    <div className={`overflow-hidden ${className}`}>
      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .testimonial-marquee {
          animation: marqueeScroll 40s linear infinite;
        }
        .testimonial-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="flex testimonial-marquee" style={{ width: 'fit-content' }}>
        {duplicatedTestimonials.map((testimonial, index) => (
          <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
}

// Compact version for Command Deck
export function TestimonialsCompact({ limit = 3 }) {
  const testimonials = DEMO_TESTIMONIALS.slice(0, limit);
  
  return (
    <div className="space-y-3 flex flex-col items-center">
      {testimonials.map((t) => (
        <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 w-full max-w-md mx-auto text-center">
          <Avatar className="w-9 h-9 mx-auto">
            <AvatarImage src={t.avatar} />
            <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium truncate">{t.name}</span>
              <div className="flex">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 text-center">{t.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export { DEMO_TESTIMONIALS };