import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Heart, Scan, Images } from 'lucide-react';
import { cn } from "@/lib/utils";
import { HERO_IMAGES } from './HeroImageData';
import { Button } from '@/components/ui/button';

export default function HeroGalleryViewer() {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [resonated, setResonated] = useState({});

  useEffect(() => {
    const handleOpen = (e) => {
      console.log('HeroGalleryViewer received event:', e.detail);
      const startIndex = e.detail?.startIndex || 0;
      // If imageId is passed, find the index
      if (e.detail?.imageId) {
        const idx = HERO_IMAGES.findIndex(img => img.id === e.detail.imageId);
        console.log('Found image at index:', idx, 'for id:', e.detail.imageId);
        if (idx !== -1) setCurrentIndex(idx);
        else setCurrentIndex(startIndex);
      } else {
        setCurrentIndex(startIndex);
      }
      setOpen(true);
      setScanning(true);
      setScanProgress(0);
    };

    document.addEventListener('openHeroGallery', handleOpen);
    console.log('HeroGalleryViewer: Event listener attached');
    return () => document.removeEventListener('openHeroGallery', handleOpen);
  }, []);

  // Scan progress animation
  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          setScanning(false);
          return 100;
        }
        return p + 4;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [scanning]);

  // Reset scan on image change
  useEffect(() => {
    if (open) {
      setScanning(true);
      setScanProgress(0);
    }
  }, [currentIndex, open]);

  const handleClose = () => {
    setOpen(false);
    setCurrentIndex(0);
    setScanning(false);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i > 0 ? i - 1 : HERO_IMAGES.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i < HERO_IMAGES.length - 1 ? i + 1 : 0));
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    const img = HERO_IMAGES[currentIndex];
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${img.id}-hero.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      window.open(img.url, '_blank');
    }
  };

  const handleResonate = (e) => {
    e.stopPropagation();
    const imgId = HERO_IMAGES[currentIndex].id;
    setResonated(prev => ({ ...prev, [imgId]: !prev[imgId] }));
  };

  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') setCurrentIndex((i) => (i > 0 ? i - 1 : HERO_IMAGES.length - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((i) => (i < HERO_IMAGES.length - 1 ? i + 1 : 0));
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  const currentImage = HERO_IMAGES[currentIndex];
  const isResonated = resonated[currentImage?.id];

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={handleClose}
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        className={cn(
          "absolute top-[60px] right-4 p-2 rounded-lg transition-all z-10",
          "bg-slate-800/80 hover:bg-slate-700 text-white",
          "dark:bg-[#0a0a0a] dark:border dark:border-[#00ff88]/50 dark:hover:border-[#00ff88]",
          "dark:hover:shadow-[0_0_15px_rgba(0,255,136,0.4)]"
        )}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Image Container */}
      <div 
        className="relative max-w-[90vw] max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Neon Glow Border Frame */}
        <div className={cn(
          "absolute -inset-1 rounded-xl opacity-75",
          "bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500",
          "dark:from-[#00ff88] dark:via-[#00d4ff] dark:to-[#00ff88]",
          "animate-pulse"
        )} />
        <div className={cn(
          "absolute -inset-1 rounded-xl blur-md",
          "bg-gradient-to-r from-violet-500/50 via-purple-500/50 to-violet-500/50",
          "dark:from-[#00ff88]/40 dark:via-[#00d4ff]/40 dark:to-[#00ff88]/40"
        )} />

        {/* Image */}
        <div className="relative bg-black rounded-xl overflow-hidden">
          <img
            src={currentImage?.url}
            alt={currentImage?.title}
            className="max-w-[90vw] max-h-[70vh] object-contain"
          />

          {/* Scan Progress Overlay */}
          {scanning && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div 
                className={cn(
                  "absolute left-0 right-0 h-1",
                  "bg-gradient-to-r from-transparent via-violet-500 to-transparent",
                  "dark:via-[#00ff88]",
                  "shadow-[0_0_20px_rgba(139,92,246,0.8)]",
                  "dark:shadow-[0_0_20px_rgba(0,255,136,0.8)]"
                )}
                style={{ top: `${scanProgress}%`, transition: 'top 0.05s linear' }}
              />
              
              <div className={cn(
                "absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg",
                "bg-black/70 text-xs font-mono",
                "text-violet-400 dark:text-[#00ff88]"
              )}>
                <Scan className="w-3 h-3 animate-pulse" />
                <span>SCANNING... {scanProgress}%</span>
              </div>
            </div>
          )}

          {/* Title and Description Overlay */}
          <div className="absolute top-4 left-4 right-16">
            <h3 className="text-xl font-bold text-white drop-shadow-lg">{currentImage?.title}</h3>
            <p className="text-sm text-white/80 drop-shadow">{currentImage?.description}</p>
          </div>

          {/* Image Counter */}
          <div className={cn(
            "absolute top-4 right-4 px-3 py-1.5 rounded-lg",
            "bg-black/70 text-xs font-mono",
            "text-white dark:text-[#00ff88]"
          )}>
            {currentIndex + 1} / {HERO_IMAGES.length}
          </div>
        </div>

        {/* Action Bar */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-xl bg-black/80 backdrop-blur border border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            className="text-white/70 hover:text-white p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="w-px h-6 bg-white/20" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResonate}
            className={cn(
              "gap-2 transition-all",
              isResonated 
                ? "text-pink-400 hover:text-pink-300" 
                : "text-white/70 hover:text-white"
            )}
          >
            <Heart className={cn("w-5 h-5", isResonated && "fill-current")} />
            <span className="text-xs">Resonate</span>
          </Button>
          
          <div className="w-px h-6 bg-white/20" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="gap-2 text-white/70 hover:text-white"
          >
            <Download className="w-5 h-5" />
            <span className="text-xs">Download</span>
          </Button>
          
          <div className="w-px h-6 bg-white/20" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="text-white/70 hover:text-white p-2"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all",
          "bg-slate-800/80 hover:bg-slate-700 text-white",
          "dark:bg-[#0a0a0a] dark:border dark:border-[#00ff88]/50 dark:hover:border-[#00ff88]",
          "dark:hover:shadow-[0_0_15px_rgba(0,255,136,0.4)]"
        )}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all",
          "bg-slate-800/80 hover:bg-slate-700 text-white",
          "dark:bg-[#0a0a0a] dark:border dark:border-[#00ff88]/50 dark:hover:border-[#00ff88]",
          "dark:hover:shadow-[0_0_15px_rgba(0,255,136,0.4)]"
        )}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Thumbnail Strip */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 rounded-xl bg-black/70 max-w-[80vw] overflow-x-auto">
        {HERO_IMAGES.map((img, idx) => (
          <button
            key={img.id}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={cn(
              "w-16 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
              idx === currentIndex 
                ? "border-violet-500 dark:border-[#00ff88] shadow-[0_0_10px_rgba(139,92,246,0.5)] dark:shadow-[0_0_10px_rgba(0,255,136,0.5)]" 
                : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

// Trigger button component to open the gallery
export function HeroGalleryTrigger({ className, startIndex = 0 }) {
  const openGallery = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.dispatchEvent(new CustomEvent('openHeroGallery', { detail: { startIndex } }));
  };

  return (
    <button
      onClick={openGallery}
      className={cn(
        "p-1.5 rounded-lg transition-all cursor-pointer pointer-events-auto",
        "bg-black/30 hover:bg-black/50 text-white/70 hover:text-white",
        "dark:bg-[#0a0a0a]/50 dark:hover:bg-[#0a0a0a] dark:border dark:border-[#00ff88]/30 dark:hover:border-[#00ff88]",
        "dark:hover:shadow-[0_0_10px_rgba(0,255,136,0.3)]",
        className
      )}
      title="View all hero images"
    >
      <Images className="w-4 h-4" />
    </button>
  );
}