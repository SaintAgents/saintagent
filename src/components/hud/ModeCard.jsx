import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const MODE_BACKGROUNDS = {
  earn: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/d7ae3f928_c9f98f91-174a-46a0-b12f-26bde09c8ea8.png",
  learn: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/622103084_gemini-25-flash-image-preview_A_futuristic_illustration_of_the_Global_Digital_Commodity_Exchange_depicting_a_sleek_modern_tradin-0.jpg",
  build: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
  teach: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80",
  lead: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  connect: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&q=80"
};

// Theme-aware custom icons
const MODE_ICONS_LIGHT = {
  command: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/78a908ab8_lighttv.png",
  earn: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/2a92a8b82_earndark.png",
  build: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/b0460b6fc_lightbuild.png",
  teach: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/5ec3e631c_lightteach.png"
};

const MODE_ICONS_DARK = {
  command: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/dbc5c74f4_commandgreen.png",
  earn: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/2a92a8b82_earndark.png",
  build: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/1c3eade4b_bulkddark.png",
  teach: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/888735e7a_teahsgreen.png"
};

export default function ModeCard({ 
  mode, 
  title, 
  icon: Icon,
  stats,
  onClick 
}) {
  // Get current theme
  const theme = typeof document !== 'undefined' 
    ? document.documentElement.getAttribute('data-theme') 
    : 'light';
  const isDark = theme === 'dark' || theme === 'hacker';
  
  // Check if this mode has a custom icon
  const customIcon = isDark ? MODE_ICONS_DARK[mode] : MODE_ICONS_LIGHT[mode];
  
  return (
    <button
      onClick={onClick}
      className="group relative w-full h-32 rounded-2xl overflow-hidden border border-slate-200 hover:border-violet-300 transition-all hover:scale-[1.02] shadow-md hover:shadow-xl"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${MODE_BACKGROUNDS[mode]})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative h-full p-4 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="text-left">
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            {stats && (
              <p className="text-sm text-white/80">{stats}</p>
            )}
          </div>
          {customIcon ? (
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <img 
                src={customIcon} 
                alt={title}
                className="w-10 h-10 object-contain"
                data-no-filter="true"
              />
            </div>
          ) : Icon ? (
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <Icon className="w-5 h-5 text-white" />
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs text-white/60">Explore</span>
            <ChevronRight className="w-3 h-3 text-white/60 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </button>
  );
}