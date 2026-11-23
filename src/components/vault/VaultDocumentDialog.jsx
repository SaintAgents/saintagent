import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import VaultRecordPicker from '@/components/vault/VaultRecordPicker';
import { safeFileUrl } from '@/components/vault/vault';

const types = ['Site-wide','User','Project','Mission','Circle','Need'];
export default function VaultDocumentDialog({ mode, doc, editable, copied, close, saved }) {
  const [names,setNames] = useState(doc.shared_with_names || '');
  const [type,setType] = useState(doc.assigned_to_type || 'Site-wide');
  const [target,setTarget] = useState(doc.assigned_to_id ? {id:doc.assigned_to_id,name:doc.assigned_to_name,userId:doc.assigned_user_id} : null);
  const [busy,setBusy] = useState(false), [error,setError] = useState('');
  const share = mode === 'share', url = safeFileUrl(doc.file_url);
  async function submit(e) {
    e.preventDefault();
    if (busy || !editable || (!share && type !== 'Site-wide' && !target)) return;
    setBusy(true); setError('');
    try {
      await base44.entities.HubDocument.update(doc.id, share ? {shared_with_names:[...new Set(names.split(',').map(name=>name.trim()).filter(Boolean))].join(', ')} : {
        assigned_to_type:type, assigned_to_id:target?.id || '', assigned_to_name:target?.name || '', assigned_user_id:type === 'User' ? target?.userId || '' : ''
      });
      saved();
    } catch { setError('Changes could not be saved. Please try again.'); }
    finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={open=>{if(!open && !busy) close();}}><DialogContent className="max-h-[90dvh] overflow-y-auto" data-readable-surface>
    <DialogTitle>{share ? 'Share' : 'Assign'}: {doc.title}</DialogTitle>
    <DialogDescription>{share ? `${copied ? 'Link copied. ' : ''}Named sharing records recipients but does not restrict who can open the link.` : 'Choose where this document belongs.'}</DialogDescription>
    <form onSubmit={submit} className="space-y-3">
      {share ? <>{url && <a className="block break-all underline" href={url} target="_blank" rel="noreferrer">{url}</a>}
        {editable ? <><label className="block text-sm">Recipient names <Input value={names} onChange={e=>setNames(e.target.value)} placeholder="Enter comma-separated names" maxLength={1000} /></label>
          <VaultRecordPicker type="User" onPick={value=>setNames(old=>[...new Set([...old.split(',').map(name=>name.trim()).filter(Boolean),value.name])].join(', ').slice(0,1000))} /></> : names && <p>Shared with: {names}</p>}</> : <>
        <label className="block text-sm">Assignment type <select className="block w-full rounded-md border bg-background p-2" value={type} onChange={e=>{setType(e.target.value);setTarget(null);}}>{types.map(item=><option key={item}>{item}</option>)}</select></label>
        {type !== 'Site-wide' && <>{target && <p>Selected: {target.name}</p>}<VaultRecordPicker key={type} type={type} onPick={setTarget} /></>}
      </>}
      {error && <p role="alert">{error}</p>}{editable && <Button disabled={busy || (!share && type !== 'Site-wide' && !target)}>{busy ? 'Saving…' : share ? 'Save names' : 'Save assignment'}</Button>}
    </form>
  </DialogContent></Dialog>;
}