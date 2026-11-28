import React from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export default function WalkthroughIntro({ ttsEnabled, onToggleVoice, onStart, onClose }) {
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent hideCloseButton data-readable-surface overlayClassName="z-[100000]" className="pointer-events-auto z-[100001] w-11/12 max-w-md gap-4 rounded-2xl p-6 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-accent text-accent-foreground"><Play aria-hidden="true" /></div>
      <DialogTitle>5D Business Entity Walkthrough</DialogTitle>
      <DialogDescription>I’ll guide you through registering your business entity, highlight each field, and explain what to do along the way.</DialogDescription>
      <Button type="button" variant="outline" className="mx-auto min-h-11" aria-pressed={ttsEnabled} onClick={onToggleVoice}>
        {ttsEnabled ? <Volume2 /> : <VolumeX />}{ttsEnabled ? 'Voice ON' : 'Voice OFF'}
      </Button>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" variant="outline" className="min-h-11" onClick={onClose}>Cancel</Button>
        <Button type="button" className="min-h-11" onClick={onStart}><Play /> Start Walkthrough</Button>
      </div>
    </DialogContent>
  </Dialog>;
}