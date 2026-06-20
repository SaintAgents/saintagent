import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    isLoadingAuth: true,
    authError: null,
  });

  useEffect(() => {
    let active = true;

    // Timeout: force stop after 8 seconds
    const timer = setTimeout(() => {
      if (active) {
        setState(s => s.isLoadingAuth ? { ...s, isLoadingAuth: false, authError: { type: 'transient', message: 'Timed out' } } : s);
      }
    }, 8000);

    base44.auth.me()
      .then(u => {
        if (active) setState({ user: u, isAuthenticated: true, isLoadingAuth: false, authError: null });
      })
      .catch(err => {
        if (!active) return;
        const status = err?.status || err?.response?.status;
        const reason = err?.data?.extra_data?.reason || err?.response?.data?.extra_data?.reason;
        let errorType = 'transient';
        if (reason === 'user_not_registered') errorType = 'user_not_registered';
        else if (status === 401 || status === 403 || reason === 'auth_required') errorType = 'auth_required';
        setState({ user: null, isAuthenticated: false, isLoadingAuth: false, authError: { type: errorType, message: err?.message || 'Auth failed' } });
      });

    return () => { active = false; clearTimeout(timer); };
  }, []);

  const logout = (shouldRedirect = true) => {
    setState(s => ({ ...s, user: null, isAuthenticated: false }));
    if (shouldRedirect) {
      base44.auth.logout(window.location.href);
    } else {
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoadingAuth: state.isLoadingAuth,
    isLoadingPublicSettings: false,
    authError: state.authError,
    appPublicSettings: null,
    logout,
    navigateToLogin,
    checkAppState: () => window.location.reload(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};