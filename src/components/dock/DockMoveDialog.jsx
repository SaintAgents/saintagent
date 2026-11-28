import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { widgetLabel } from '@/components/dock/dockCatalog';

export default function DockMoveDialog({ card, folders, trigger, onClose, onMove }) {
  const [destination, setDestination] = useState('');
  const choices = folders.filter(folder => folder.id !== card.deck);
  const canMove = choices.some(folder => folder.id === destination);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent data-readable-surface className="z-[10009]" onCloseAutoFocus={event => {
      event.preventDefault();
      trigger?.focus();
    }}>
      <DialogTitle>Move to folder</DialogTitle>
      <DialogDescription>Choose a folder for {card.settings.title || widgetLabel(card.type)}.</DialogDescription>
      <form className="grid gap-3" onSubmit={event => { event.preventDefault(); if (canMove) onMove(destination); }}>
        <label className="grid gap-1 text-sm font-medium">Destination folder
          <select className="min-h-11 w-full rounded-md border bg-background px-3 text-foreground" value={destination} onChange={event => setDestination(event.target.value)} required>
            <option value="" disabled>Select a folder</option>
            {choices.map(folder => <option key={folder.id} value={folder.id}>{folder.name} (#{folders.indexOf(folder) + 1})</option>)}
          </select>
        </label>
        <Button type="submit" className="min-h-11" disabled={!canMove}>Move widget</Button>
      </form>
    </DialogContent>
  </Dialog>;
}