import { useEffect } from 'react';

export default function PublicProfileState({ loading, missing, label }) {
  useEffect(() => {
    if (!missing || loading) return;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code'; meta.content = '404';
    document.head.append(meta);
    return () => meta.remove();
  }, [loading, missing]);
  return <main className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground"><p role="status">{loading ? `Loading ${label}…` : missing ? `${label} not found or not public.` : `Could not load ${label}. Please try again.`}</p></main>;
}