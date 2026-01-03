import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CoWatch({ conversationId }) {
  const queryClient = useQueryClient();
  const { data: me } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: sessions = [] } = useQuery({
    queryKey: ['coWatch', conversationId],
    queryFn: () => base44.entities.CoWatchSession.filter({ conversation_id: conversationId }),
    enabled: !!conversationId,
    refetchInterval: 1000
  });
  const session = sessions?.[0];

  const upsert = useMutation({
    mutationFn: async (patch) => {
      if (session) return base44.entities.CoWatchSession.update(session.id, { ...session, ...patch, updated_by: me?.email });
      return base44.entities.CoWatchSession.create({ conversation_id: conversationId, updated_by: me?.email, ...patch });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coWatch', conversationId] })
  });

  const videoRef = React.useRef(null);
  const [url, setUrl] = React.useState('');
  React.useEffect(() => { if (session && session.media_url !== url) setUrl(session.media_url || ''); }, [session?.id, session?.media_url]);

  // Apply remote state to player
  React.useEffect(() => {
    const v = videoRef.current;
    if (!v || !session) return;
    if (url && v.src !== url) v.src = url;
    if (typeof session.position_seconds === 'number' && Math.abs(v.currentTime - session.position_seconds) > 1) {
      v.currentTime = session.position_seconds;
    }
    if (session.is_playing) v.play().catch(() => {}); else v.pause();
  }, [session?.is_playing, session?.position_seconds, url]);

  const applyUrl = () => { if (url) upsert.mutate({ media_url: url, position_seconds: 0, is_playing: false }); };
  const onPlay = () => upsert.mutate({ is_playing: true, position_seconds: Math.round(videoRef.current.currentTime) });
  const onPause = () => upsert.mutate({ is_playing: false, position_seconds: Math.round(videoRef.current.currentTime) });
  const onSeeked = () => upsert.mutate({ position_seconds: Math.round(videoRef.current.currentTime) });

  return (
    <div className="border rounded-xl bg-white p-3">
      <div className="flex items-center gap-2 mb-2">
        <Input placeholder="Paste MP4/stream URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button onClick={applyUrl} variant="outline">Set</Button>
      </div>
      <video ref={videoRef} controls onPlay={onPlay} onPause={onPause} onSeeked={onSeeked} className="w-full rounded-lg bg-black" />
      <div className="text-xs text-slate-500 mt-1">Play/pause/seek are synced across viewers.</div>
    </div>
  );
}