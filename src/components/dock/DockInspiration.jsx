import React, { useState } from 'react';
import InspirationArtwork from '@/components/dock/InspirationArtwork';
import { useInspirationImages } from '@/components/dock/useInspirationImages';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';

const prompts = ['What is one small action you can take today?', 'Who could help you see this differently?', 'What would you try if the first step were easy?'];

export default function DockInspiration({ visible }) {
  const [index, setIndex] = useState(0);
  const [reflection, setReflection] = useState(0);
  const preview = isTourPreview();
  const { data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = useInspirationImages(visible && !preview);
  const images = preview ? [] : data?.pages.flatMap(page => page.items) ?? [];
  const position = index % (images.length || 1);
  const image = images[position];
  async function next() {
    if (image && position === images.length - 1 && hasNextPage) {
      const result = await fetchNextPage();
      if (result.isFetchNextPageError) return;
      const size = result.data?.pages.reduce((count, page) => count + page.items.length, 0) ?? 0;
      setIndex(size > images.length ? position + 1 : 0);
    } else setIndex((position + 1) % (images.length || 1));
    setReflection(previous => (previous + 1) % prompts.length);
  }
  return <div className="grid gap-2">
    {visible && image && <InspirationArtwork key={image.file_uri} image={image} />}
    {image?.caption && <p className="text-sm break-words">{image.caption}</p>}
    <p>{prompts[reflection]}</p>
    {isFetchNextPageError && <p role="status" className="text-sm">Could not load more images. Select Next reflection to retry.</p>}
    <button type="button" disabled={isFetchingNextPage} onClick={next}>{isFetchingNextPage ? 'Loading…' : 'Next reflection'}</button>
  </div>;
}