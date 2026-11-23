import React from 'react';
import { Link2 } from 'lucide-react';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';

export default function AffiliateHero() {
  return (
    <div className="page-hero relative overflow-hidden">
      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/f660ad96b_gemini-25-flash-image_The_Ascension_Blueprint_Lab_Theme_Divine_architecture_plus_futuristic_creation_V-61.jpg"
        alt="Affiliate Center"
        className="w-full h-full object-cover object-center hero-image"
        data-no-filter="true"
      />
      <div aria-hidden="true" className="affiliate-hero-scrim absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50 dark:to-[#050505]" style={{ opacity: '0.50' }} />
      <HeroGalleryTrigger startIndex={16} className="absolute bottom-4 left-4 text-white/80 !p-1 [&_svg]:w-3 [&_svg]:h-3 z-10" />
      <div className="absolute inset-0 flex items-center justify-center hero-content">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] tracking-wide flex items-center justify-center gap-3"
                style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(139,92,246,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
              <Link2 className="w-10 h-10 text-amber-300 drop-shadow-lg" />
              Affiliate Center
            </h1>
            <ForwardButton currentPage="AffiliateCenter" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
          </div>
          <div className="p-4 rounded-2xl bg-black/[0.04] backdrop-blur-sm border border-white/20 mt-4">
            <p className="text-white text-base tracking-wider drop-shadow-lg">
              Invite people who would genuinely benefit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}