import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import useTourFrameTarget from '@/components/tour/useTourFrameTarget';
import ImpactLessonPreview from '@/components/tour/ImpactLessonPreview';

export default function TourScreenPreview({ targets }) {
  const [index, setIndex] = useState(0);
  const target = targets[index] || targets[0];
  const frameKey = JSON.stringify(target);
  return <aside aria-label="Lesson screen" className="flex min-h-0 min-w-0 flex-col border-b bg-muted md:border-b-0 md:border-r">
    <div className="shrink-0 space-y-2 border-b px-4 py-3">
      <p className="text-sm font-semibold">On this screen: {target.label}</p>
      <p className="text-xs text-muted-foreground">Preview only. Follow the highlight, or open the page to try it yourself.</p>
      {targets.length > 1 && <div className="flex flex-wrap gap-1.5" aria-label="Lesson views">{targets.map((item, i) => <button key={item.label} type="button" aria-pressed={i === index} onClick={() => setIndex(i)} className="rounded-md border px-2 py-1 text-xs aria-pressed:font-bold aria-pressed:underline">{item.label}</button>)}</div>}
    </div>
    {['/GlobalImpactDashboard', '/WorldPulse'].includes(target.path)
      ? <ImpactLessonPreview key={frameKey} target={target} />
      : <TourPreviewFrame key={frameKey} target={target} />}
  </aside>;
}

function TourPreviewFrame({ target }) {
  const host = useRef(null);
  const [size, setSize] = useState(null);
  const [doc, setDoc] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const state = useTourFrameTarget(doc, target.anchor, target.setup);
  useEffect(() => {
    if (doc) return;
    const timer = setTimeout(() => setTimedOut(true), 10000);
    return () => clearTimeout(timer);
  }, [doc]);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([{ contentRect }]) => {
      const { width, height } = contentRect;
      const fullWidth = Math.max(target.path === '/CommandDeck' ? 1024 : 900, width);
      const scale = width / fullWidth;
      if (scale) setSize({ width: fullWidth, height: Math.ceil(height / scale), scale });
    });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, [target.path]);
  const params = new URLSearchParams({ ...target.params, tourPreview: '1', ...(target.view && { tourView: target.view }) });
  return <div ref={host} className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
    {size && <iframe title={`${target.label} lesson preview`} className={`absolute left-0 top-0 origin-top-left border-0 ${doc ? '' : 'pointer-events-none'}`} tabIndex={-1}
      src={`${target.path}?${params}`} style={{ width: size.width, height: size.height, transform: `scale(${size.scale})` }}
      onLoad={e => { const frameDoc = e.currentTarget.contentDocument; setDoc(frameDoc?.location?.pathname?.toLowerCase() === target.path.toLowerCase() ? frameDoc : null); }} />}
    {state !== 'ready' && <p role="status" className="pointer-events-none absolute inset-x-3 bottom-3 z-10 rounded-md border bg-popover p-2 text-xs">
      {state === 'missing' ? 'This section isn’t visible in the preview.' : timedOut && !doc ? 'The preview couldn’t open.' : 'Locating the lesson on this screen…'}
    </p>}
  </div>;
}