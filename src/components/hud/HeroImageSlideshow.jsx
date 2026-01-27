import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { HERO_IMAGES } from './HeroImageData';
import { Play, Pause, SkipForward, Clock, Image, Maximize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Default rotation interval in ms (3.33 minutes = 199800ms)
const DEFAULT_INTERVAL = 199800;

export default function HeroImageSlideshow({ className }) {
  const [currentIndex, setCurrentIndex] = useState(() => 
    Math.floor(Math.random() * HERO_IMAGES.length)
  );
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch custom interval from platform settings
  const { data: settings } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.filter({ key: 'hero_slideshow_interval' }),
    staleTime: 60000
  });

  const interval = settings?.[0]?.value ? parseInt(settings[0].value) : DEFAULT_INTERVAL;

  const nextImage = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
      setIsTransitioning(false);
    }, 300);
  };

  const randomImage = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * HERO_IMAGES.length);
      } while (newIndex === currentIndex && HERO_IMAGES.length > 1);
      setCurrentIndex(newIndex);
      setIsTransitioning(false);
    }, 300);
  };

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      randomImage();
    }, interval);
    return () => clearInterval(timer);
  }, [isPaused, interval, currentIndex]);

  const current = HERO_IMAGES[currentIndex];
  const intervalMinutes = (interval / 60000).toFixed(2);

  return (
    <div className={cn("relative rounded-2xl overflow-hidden bg-slate-900 group", className)}>
      {/* Image */}
      <div className={cn(
        "relative aspect-video transition-opacity duration-300",
        isTransitioning ? "opacity-0" : "opacity-100"
      )}>
        <img 
          src={current.url}
          alt={current.title}
          className="w-full h-full object-cover hero-image"
          data-no-filter="true"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white mb-1">{current.title}</h3>
          <p className="text-white/70 text-sm">{current.description}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPaused(!isPaused)}
          className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={randomImage}
          className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            console.log('Opening hero gallery with imageId:', current.id);
            document.dispatchEvent(new CustomEvent('openHeroGallery', { 
              detail: { imageId: current.id, images: HERO_IMAGES } 
            }));
          }}
          className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
        <div 
          className="h-full bg-violet-500/70 transition-all"
          style={{ 
            animation: isPaused ? 'none' : `slideProgress ${interval}ms linear infinite`,
          }}
        />
      </div>

      {/* Timer badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white/70 text-xs">
        <Clock className="w-3 h-3" />
        <span>{intervalMinutes}m</span>
      </div>

      <style>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}