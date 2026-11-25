import React, { useCallback, useState } from 'react';
import InspirationArtwork from '@/components/dock/InspirationArtwork';

export default function InspirationSlides({ image, onSettled }) {
  const [displayed, setDisplayed] = useState(null);
  const settle = useCallback((ready) => {
    if (ready) setDisplayed(image);
    onSettled(image.file_uri);
  }, [image, onSettled]);
  const slides = displayed && displayed.file_uri !== image.file_uri ? [displayed, image] : [image];

  return <div className="relative [contain:paint] [overflow-anchor:none]">
    {slides.map(slide => {
      const incoming = slide.file_uri === image.file_uri;
      const staged = incoming && slides.length > 1;
      return <div key={slide.file_uri} className={staged ? 'invisible pointer-events-none absolute inset-x-0 top-0' : undefined} aria-hidden={staged || undefined}>
        <InspirationArtwork image={slide} fitWidget onSettled={incoming ? settle : undefined} />
      </div>;
    })}
  </div>;
}