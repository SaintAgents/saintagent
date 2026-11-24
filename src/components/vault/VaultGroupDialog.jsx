import React, { useState } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VaultRecordPicker from '@/components/vault/VaultRecordPicker';

export default function VaultGroupDialog({ user, close, created }) {
  const [name, setName] = useState(''), [members, setMembers] = useState([]);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const pick = (person) => {
    if (!person.userId || person.userId === user.email || members.some(item => item.userId === person.userId)) return;
    setMembers(prev => prev.length < 50 ? [...prev, person] : prev);
  };
  async function submit(event) {
    event.preventDefault();
    if (busy || !name.trim() || !members.length) return;
    setBusy(true); setError('');
    try {
      const group = await base44.entities.VaultGroup.create({ name: name.trim(), member_emails: members.map(item => item.userId) });
      created(group);
    } catch { setError('The group could not be created. Please try again.'); }
    finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={open => { if (!open && !busy) close(); }}><DialogContent data-readable-surface className="max-h-[90dvh] overflow-y-auto">
    <DialogTitle>Create vault group</DialogTitle>
    <DialogDescription>Name the tab and choose which members can use it. You’re included automatically.</DialogDescription>
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={busy} className="space-y-3">
        <label className="block text-sm">Group name <Input required maxLength={80} value={name} onChange={e => setName(e.target.value)} /></label>
        <p className="text-sm font-medium">Selected members ({members.length}/50)</p>
        {members.length ? <ul className="flex max-h-32 flex-wrap gap-1 overflow-y-auto">{members.map(person => <li key={person.userId}><Button type="button" variant="outline" size="sm" aria-label={`Remove ${person.name}`} onClick={() => setMembers(prev => prev.filter(item => item.userId !== person.userId))}>{person.name}<X /></Button></li>)}</ul> : <p className="text-sm text-muted-foreground">Choose at least one member below.</p>}
        <VaultRecordPicker type="User" onPick={pick} isPicked={id => Boolean(id && (id === user.email || members.some(item => item.userId === id)))} />
      </fieldset>
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={busy || !name.trim() || !members.length}>{busy ? 'Creating…' : 'Create group'}</Button>
    </form>
  </DialogContent></Dialog>;
}