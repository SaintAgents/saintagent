import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CircleCover({ circle, user }) {
  const marker = useRef(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(null);
  const canShow = user && (circle.visibility === 'public' || circle.owner_id === user.email || circle.member_ids?.includes(user.email) || user.role === 'admin');
  const uri = canShow ? circle.image_uri : null;
  useEffect(() => {
    if (!uri || visible || !marker.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { rootMargin: '150px' });
    observer.observe(marker.current);
    return () => observer.disconnect();
  }, [uri, visible]);
  const { data } = useQuery({
    queryKey: ['circle-cover', user?.id, uri],
    queryFn: () => base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri }),
    enabled: !!uri && visible,
    staleTime: 240_000,
    retry: false,
  });
  const src = data?.signed_url || circle.image_url;
  return <>
    {src && failed !== src && <img src={src} alt={circle.name} className="absolute inset-0 h-full w-full object-cover" onError={() => setFailed(src)} />}
    {uri && !visible && <span ref={marker} aria-hidden="true" className="absolute inset-0 pointer-events-none" />}
  </>;
}