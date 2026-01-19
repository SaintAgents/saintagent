import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const redirect = async () => {
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();
        const queryString = window.location.search;
        
        if (isAuthenticated) {
          // Authenticated users go to Command Deck
          window.location.replace(createPageUrl('CommandDeck') + queryString);
        } else {
          // Unauthenticated users go to Join page
          window.location.replace(createPageUrl('Join') + queryString);
        }
      } catch {
        // If check fails, default to Join page
        const queryString = window.location.search;
        window.location.replace(createPageUrl('Join') + queryString);
      }
    };
    redirect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white">Redirecting...</p>
      </div>
    </div>
  );
}