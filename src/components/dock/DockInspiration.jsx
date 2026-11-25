import React, { useCallback, useEffect, useState } from 'react';
import InspirationArtwork from '@/components/dock/InspirationArtwork';
import InspirationPlayback, { inspirationSpeeds } from '@/components/dock/InspirationPlayback';
import { useInspirationImages } from '@/components/dock/useInspirationImages';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';

export default function DockInspiration({ visible }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [delay, setDelay] = useState(inspirationSpeeds[1].delay);
  const preview = isTourPreview();
  const { data, isPending, isError, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = useInspirationImages(visible && !preview);
  const images = data?.pages.flatMap(page => page.items) ?? [];
  const count = images.length;
  const position = index % (count || 1);
  const image = images[position];
  const canCycle = count > 1 || Boolean(hasNextPage);
  const next = useCallback(async () => {
    if (position === count - 1 && hasNextPage) {
      const result = await fetchNextPage();
      if (result.isFetchNextPageError) return;
      const size = result.data?.pages.reduce((total, page) => total + page.items.length, 0) ?? 0;
      setIndex(size > count ? position + 1 : 0);
    } else setIndex((position + 1) % (count || 1));
  }, [position, count, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (!visible || preview || paused || !canCycle || isFetchingNextPage || isFetchNextPageError) return;
    let timer;
    const schedule = () => {
      window.clearTimeout(timer);
      if (!document.hidden) timer = window.setTimeout(() => void next(), delay);
    };
    schedule();
    document.addEventListener('visibilitychange', schedule);
    return () => { window.clearTimeout(timer); document.removeEventListener('visibilitychange', schedule); };
  }, [visible, preview, paused, canCycle, isFetchingNextPage, isFetchNextPageError, next, delay]);

  if (!visible) return null;
  if (preview) return <p>Open Inspiration outside the tour to view your cards.</p>;
  if (isPending) return <p role="status">Loading inspiration cards…</p>;
  if (!image) return <p role="status">{isError ? 'Could not load inspiration cards.' : 'No inspiration cards have been uploaded yet.'}</p>;
  return <div className="flex min-h-0 min-w-0 flex-1 flex-col">
    {canCycle && <InspirationPlayback paused={paused} onToggle={() => setPaused(value => !value)}
      delay={delay} onSpeedChange={setDelay} onNext={() => void next()} loading={isFetchingNextPage} />}
    {isFetchNextPageError && <p role="status" className="text-sm">Could not load more cards. Select Next card to retry.</p>}
    <InspirationArtwork key={image.file_uri} image={image} fitWidget />
  </div>;
}