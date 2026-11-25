import React, { useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function InspirationArtwork({ image, fitWidget = false, onSettled }) {
  const imgRef = useRef(null);
  const [failedUrl, setFailedUrl] = useState('');
  const { data, isPending, isError } = useQuery({
    queryKey: ['inspiration-artwork', image.file_uri],
    queryFn: () => base44.integrations.Core.CreateFileSignedUrl({ file_uri: image.file_uri, expires_in: 300 }),
    staleTime: 240000,
    gcTime: 240000,
  });
  const url = data?.signed_url;
  const unavailable = isError || (!isPending && (!url || failedUrl === url));
  useEffect(() => {
    if (!onSettled || isPending) return;
    if (unavailable) { onSettled(false); return; }
    let current = true;
    imgRef.current.decode().then(
      () => { if (current) onSettled(true); },
      () => { if (current) setFailedUrl(url); },
    );
    return () => { current = false; };
  }, [onSettled, isPending, unavailable, url]);

  if (isPending) return fitWidget ? <div role="status" className="flex justify-center py-2"><LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" /><span className="sr-only">Loading image…</span></div> : <p role="status" className="text-sm">Loading image…</p>;
  if (unavailable) return <p className="text-sm">Image unavailable</p>;
  return <img ref={imgRef} className={fitWidget ? 'block h-auto w-full flex-none' : 'max-h-80 w-full object-contain'} src={url} alt={image.alt_text} onError={() => setFailedUrl(url)} />;
}