import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import useObservationAccess from '@/components/observation/useObservationAccess';
import ErrorBoundary from '@/components/ErrorBoundary';
export default function ObservationPreview({ id, children }) {
  const { user } = useAuth();
  const allowed = useObservationAccess(user,id === 'LeaderChannel').some(page => page.id === id);
  const page = allowed ? children : null;
  useEffect(() => {
    if (window.parent !== window && allowed) window.parent.postMessage({type:'observation-preview-ready',id},window.location.origin);
  },[allowed,id]);
  if (!page) return <p className="p-6 text-foreground" role="status">{id === 'LeaderChannel' ? 'Checking channel access. If this does not open, return to the deck.' : 'This page is not available to preview.'}</p>;
  return <ErrorBoundary><main data-page={id} className="min-h-screen bg-background text-foreground">{page}</main></ErrorBoundary>;
}