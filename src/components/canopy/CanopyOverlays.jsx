import React from 'react';
import OnlineUsersModal from '@/components/OnlineUsersModal';
import SaintBrowser from '@/components/browser/SaintBrowser';
import BusinessCardDialog from '@/components/profile/BusinessCardDialog';

export default function CanopyOverlays({ type, profile, close }) {
  if (type === 'online') return <OnlineUsersModal open onClose={close} />;
  if (type === 'browser') return <SaintBrowser open onClose={close} />;
  if (type === 'card' && profile) return <BusinessCardDialog open profile={profile} onOpenChange={open => { if (!open) close(); }} />;
  return null;
}