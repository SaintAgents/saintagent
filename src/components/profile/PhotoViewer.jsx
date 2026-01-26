import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PhotoViewer({ open, images = [], startIndex = 0, onClose }) {
  const [idx, setIdx] = useState(startIndex || 0);

  const safeLen = Math.max(1, images?.length || 1);
  const next = useCallback(() => setIdx((i) => (i + 1) % safeLen), [safeLen]);
  const prev = useCallback(() => setIdx((i) => (i - 1 + safeLen) % safeLen), [safeLen]);

  useEffect(() => { setIdx(startIndex || 0); }, [startIndex, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, next, prev, onClose]);

  if (!open) return null;
  const has = images && images.length > 0;
  const src = has ? images[idx % safeLen] : null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button 
        className="absolute top-4 right-4 p-3 rounded-full bg-white/20 hover:bg-white/30 z-50 transition-colors" 
        onClick={(e) => { e.stopPropagation(); onClose?.(); }}
      >
        <X className="w-7 h-7 text-white" />
      </button>
      {images.length > 1 && (
        <>
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors" 
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft className="w-7 h-7 text-white" />
          </button>
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors" 
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="w-7 h-7 text-white" />
          </button>
        </>
      )}
      <div onClick={(e) => e.stopPropagation()}>
        {src ? (
          <img src={src} alt="photo" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" />
        ) : (
          <div className="text-white">No images</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 text-white text-sm font-medium">
          {idx + 1} / {images.length}
        </div>
      )}
    </div>
  );
}