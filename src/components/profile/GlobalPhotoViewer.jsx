import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Scan } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function GlobalPhotoViewer() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const handleOpen = (e) => {
      const imgs = e.detail?.images || [];
      if (imgs.length > 0) {
        setImages(imgs);
        setCurrentIndex(0);
        setOpen(true);
        // Trigger scan animation
        setScanning(true);
        setScanProgress(0);
      }
    };

    document.addEventListener('openPhotoViewer', handleOpen);
    return () => document.removeEventListener('openPhotoViewer', handleOpen);
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
    setImages([]);
    setCurrentIndex(0);
    setScanning(false);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  };

  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setImages([]);
        setCurrentIndex(0);
        setScanning(false);
      }
      if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
      }
      if (e.key === 'ArrowRight') {
        e.stopPropagation();
        setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, images.length]);

  if (!open || images.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={handleClose}
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        className={cn(
          "absolute top-4 right-4 p-2 rounded-lg transition-all z-10",
          "bg-slate-800/80 hover:bg-slate-700 text-white",
          "dark:bg-[#0a0a0a] dark:border dark:border-[#00ff88]/50 dark:hover:border-[#00ff88]",
          "dark:hover:shadow-[0_0_15px_rgba(0,255,136,0.4)]"
        )}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Image Container */}
      <div 
        className="relative max-w-[90vw] max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Neon Glow Border Frame */}
        <div className={cn(
          "absolute -inset-1 rounded-xl opacity-75",
          "bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500",
          "dark:from-[#00ff88] dark:via-[#00d4ff] dark:to-[#00ff88]",
          "[data-theme='hacker'] &:from-[#00ff00] [data-theme='hacker'] &:via-[#00ff00] [data-theme='hacker'] &:to-[#00ff00]",
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
            src={images[currentIndex]}
            alt={`Photo ${currentIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain"
          />

          {/* Scan Progress Overlay */}
          {scanning && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Scan line */}
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
              
              {/* Scan text */}
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

          {/* Image Counter */}
          {images.length > 1 && (
            <div className={cn(
              "absolute bottom-4 right-4 px-3 py-1.5 rounded-lg",
              "bg-black/70 text-xs font-mono",
              "text-white dark:text-[#00ff88]"
            )}>
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
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
        </>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 rounded-xl bg-black/70">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={cn(
                "w-12 h-12 rounded-lg overflow-hidden border-2 transition-all",
                idx === currentIndex 
                  ? "border-violet-500 dark:border-[#00ff88] shadow-[0_0_10px_rgba(139,92,246,0.5)] dark:shadow-[0_0_10px_rgba(0,255,136,0.5)]" 
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}