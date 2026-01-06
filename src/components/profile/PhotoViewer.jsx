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
    <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center">
      <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20" onClick={onClose}>
        <X className="w-6 h-6 text-white" />
      </button>
      <button className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20" onClick={prev}>
        <ChevronLeft className="w-7 h-7 text-white" />
      </button>
      <button className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20" onClick={next}>
        <ChevronRight className="w-7 h-7 text-white" />
      </button>
      {src ? (
        <img src={src} alt="photo" className="max-h-[85vh] max-w-[90vw] object-contain" />
      ) : (
        <div className="text-white">No images</div>
      )}
    </div>
  );
}