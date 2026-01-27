import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Quote, Star } from "lucide-react";
import { DEMO_AVATARS_MALE, DEMO_AVATARS_FEMALE } from '@/components/demoAvatars';

const TESTIMONIALS = [
  {
    name: "Marcus Chen",
    avatar: DEMO_AVATARS_MALE[1],
    quote: "The fabric of this community is incredible! I've never felt more connected to like-minded souls.",
    role: "Mission Leader"
  },
  {
    name: "Sarah Mitchell",
    avatar: DEMO_AVATARS_FEMALE[0],
    quote: "So excited about the opportunities here! Already made my first 500 GGG in just two weeks.",
    role: "Top Contributor"
  },
  {
    name: "David Wright",
    avatar: DEMO_AVATARS_MALE[0],
    quote: "Finally making money doing what I love. The mission system is absolutely brilliant!",
    role: "Sacred Agent"
  },
  {
    name: "Elena Rodriguez",
    avatar: DEMO_AVATARS_FEMALE[3],
    quote: "This platform changed my life. The energy and support from fellow agents is unmatched.",
    role: "Verified 144K"
  },
  {
    name: "James Thompson",
    avatar: DEMO_AVATARS_MALE[3],
    quote: "From skeptic to believer! The earning potential here is real and the missions are meaningful.",
    role: "Mission Creator"
  },
  {
    name: "Aisha Johnson",
    avatar: DEMO_AVATARS_FEMALE[1],
    quote: "Love the collaborative spirit! Every mission feels like we're building something sacred together.",
    role: "Circle Leader"
  },
  {
    name: "Michael Torres",
    avatar: DEMO_AVATARS_MALE[4],
    quote: "The community here is genuine. I've found my tribe and we're thriving together!",
    role: "Top Earner"
  },
  {
    name: "Luna Patel",
    avatar: DEMO_AVATARS_FEMALE[4],
    quote: "Excited for what's coming! This is just the beginning of something extraordinary.",
    role: "Early Adopter"
  }
];

export default function AgentTestimonialsMarquee() {
  // Duplicate for seamless loop
  const allTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div className="mt-16 mb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          What Agents Are Saying
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Real stories from our thriving community
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative overflow-hidden py-4">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 dark:from-[#050505] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 dark:from-[#050505] to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused]">
          {allTestimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-80 bg-white dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Quote Icon */}
              <Quote className="w-6 h-6 text-violet-400 mb-3 opacity-60" />
              
              {/* Quote Text */}
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4 min-h-[60px]">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-violet-100 dark:ring-violet-900">
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-violet-600 dark:text-violet-400">
                    {testimonial.role}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}