import React, { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function InspirationArtwork({ image, compactLoading = false }) {
  const [failedUrl, setFailedUrl] = useState('');
  const { data, isPending, isError } = useQuery({
    queryKey: ['inspiration-artwork', image.file_uri],
    queryFn: () => base44.integrations.Core.CreateFileSignedUrl({ file_uri: image.file_uri, expires_in: 300 }),
    staleTime: 240000,
    gcTime: 240000,
  });
  if (isPending) return compactLoading ? <div role="status" className="flex justify-center py-2"><LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" /><span className="sr-only">Loading image…</span></div> : <p role="status" className="text-sm">Loading image…</p>;
  if (isError || !data?.signed_url || failedUrl === data.signed_url) return <p className="text-sm">Image unavailable</p>;
  return <img className="max-h-80 w-full object-contain" src={data.signed_url} alt={image.alt_text} onError={() => setFailedUrl(data.signed_url)} />;
}