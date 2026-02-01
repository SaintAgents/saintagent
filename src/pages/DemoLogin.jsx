import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Sparkles } from 'lucide-react';

// Demo user credentials - these are pre-created demo accounts
const DEMO_USERS = [
  { email: 'elderananda@demo.saintagent.world', name: 'Elder Ananda - Demo' },
  { email: 'lunasharma@demo.saintagent.world', name: 'Luna Sharma - Demo' },
  { email: 'riverstone@demo.saintagent.world', name: 'River Stone - Demo' },
];

export default function DemoLogin() {
  const [status, setStatus] = useState('Preparing demo experience...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const initDemo = async () => {
      try {
        // Check if already logged in
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          setStatus('Already logged in, redirecting...');
          window.location.href = createPageUrl('CommandDeck');
          return;
        }

        // For demo, we'll redirect to login with a demo account
        // The user will need to use the demo credentials shown
        setStatus('Redirecting to demo login...');
        
        // Show demo credentials and redirect
        setError('demo_info');
        
      } catch (err) {
        console.error('Demo init error:', err);
        setError(err.message);
      }
    };

    initDemo();
  }, []);

  if (error === 'demo_info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-violet-500/30 p-8 text-center">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Demo Access</h1>
          <p className="text-slate-300 mb-6">
            To explore Saint Agents, please sign in with one of these demo accounts:
          </p>
          
          <div className="space-y-3 mb-6">
            {DEMO_USERS.map((user, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-left">
                <p className="text-sm text-violet-400 font-medium">{user.name}</p>
                <p className="text-xs text-slate-400 font-mono">{user.email}</p>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-amber-400 mb-6">
            Use any password - demo accounts accept any input.
          </p>
          
          <button
            onClick={() => base44.auth.redirectToLogin(createPageUrl('CommandDeck'))}
            className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all"
          >
            Continue to Login
          </button>
          
          <button
            onClick={() => window.location.href = createPageUrl('Join')}
            className="mt-3 text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Join page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">{status}</p>
        {error && error !== 'demo_info' && (
          <p className="text-red-400 mt-2 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}