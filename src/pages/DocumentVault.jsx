import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import VaultLibrary from '@/components/vault/VaultLibrary';

export default function DocumentVault() {
  const { user } = useAuth();
  if (!user) return null;
  return <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 md:px-8"><VaultLibrary user={user} /></div>;
}