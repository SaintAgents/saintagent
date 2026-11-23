import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import ObservationWorkspace from '@/components/observation/ObservationWorkspace';
import '@/components/observation/observation.css';
export default function ObservationDeck() {
  const { user } = useAuth();
  return user ? <ObservationWorkspace key={user.id} user={user}/> : null;
}