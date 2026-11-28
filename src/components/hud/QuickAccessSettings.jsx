import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export default function QuickAccessSettings({ pages, pinned, ids, onSave, error, onClose }) {
  const [selected, setSelected] = useState('');
  const available = pages.filter(({ page }) => !ids.includes(page)).sort((a, b) => a.label.localeCompare(b.label));
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent data-readable-surface className="max-h-[85dvh] w-11/12 max-w-md overflow-y-auto rounded-xl [&[role=dialog][data-state=open]]:!z-[100001]" overlayClassName="z-[100000]">
      <DialogTitle>Quick access</DialogTitle>
      <DialogDescription>Choose which page icons appear in your navigation bar.</DialogDescription>
      <form className="flex items-end gap-2" onSubmit={event => {
        event.preventDefault();
        if (!available.some(item => item.page === selected)) return;
        onSave([...ids, selected]);
        setSelected('');
      }}>
        <label className="grid min-w-0 flex-1 gap-1 text-sm font-medium">Page
          <select className="h-11 rounded-md border border-input bg-background px-2 text-sm text-foreground" value={selected} onChange={event => setSelected(event.target.value)} disabled={!available.length}>
            <option value="">{available.length ? 'Choose a page' : 'All available pages are pinned'}</option>
            {available.map(({ page, label }) => <option key={page} value={page}>{label}</option>)}
          </select>
        </label>
        <Button type="submit" className="h-11" disabled={!selected}><Plus aria-hidden="true" /> Add</Button>
      </form>
      {error && <p role="alert" className="text-sm">Quick access couldn’t be saved on this device.</p>}
      <div>
        <h3 className="mb-1 text-sm font-semibold">Pinned pages</h3>
        {pinned.length ? <ul>{pinned.map(({ page, label, Icon }) => <li key={page} className="flex items-center gap-2 border-b py-1 last:border-0">
          <Icon aria-hidden="true" className="size-4 shrink-0" /><span className="flex-1 text-sm">{label}</span>
          <Button type="button" size="icon" variant="ghost" aria-label={`Remove ${label}`} title={`Remove ${label}`} onClick={() => onSave(ids.filter(id => id !== page))}><X aria-hidden="true" /></Button>
        </li>)}</ul> : <p className="text-sm text-muted-foreground">No pinned pages.</p>}
      </div>
    </DialogContent>
  </Dialog>;
}