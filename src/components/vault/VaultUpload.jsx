import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import VaultRecordPicker from '@/components/vault/VaultRecordPicker';
import { folders, safeFileUrl } from '@/components/vault/vault';

export default function VaultUpload({ user, project, close, saved }) {
  const [file, setFile] = useState(null), [title, setTitle] = useState('');
  const [linked, setLinked] = useState(project ? {id:project.id,name:project.title} : null);
  const [pickProject, setPickProject] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (busy || !file || !title.trim()) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      if (!safeFileUrl(file_url)) throw new Error('Missing upload link');
      await base44.entities.HubDocument.create({ title:title.trim(), file_url, folder:fields.get('folder'),
        file_type:file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase() || file.type, description:fields.get('description').trim(), tags:fields.get('tags').trim(),
        ...(linked ? {project_id:linked.id,project_name:linked.name} : {}), version:1, created_by_name:user.full_name || 'Member' });
      saved();
    } catch { setError('The document could not be saved. Please try again.'); }
    finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={open=>{ if (!open && !busy) close(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto" data-readable-surface>
    <DialogTitle>Upload document</DialogTitle><DialogDescription>Anyone with the file link can open it. Do not upload confidential documents.</DialogDescription>
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm">File <Input type="file" required disabled={busy} onChange={e=>{const selected=e.target.files?.[0]; setFile(selected || null); if (selected) setTitle(old=>old.trim() ? old : selected.name.replace(/\.[^.]+$/, '').slice(0,200));}} /></label>
      <label className="block text-sm">Title <Input value={title} onChange={e=>setTitle(e.target.value)} required maxLength={200} disabled={busy} /></label>
      <label className="block text-sm">Folder <select name="folder" className="block w-full rounded-md border bg-background p-2" defaultValue="Other">{folders.map(value=><option key={value}>{value}</option>)}</select></label>
      <div className="space-y-1 text-sm"><p>Project: {linked?.name || 'None'}</p>{!project && <><Button type="button" variant="outline" size="sm" disabled={busy} onClick={()=>setPickProject(!pickProject)}>{pickProject ? 'Close project search' : 'Select project'}</Button>{linked && <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={()=>setLinked(null)}>Clear</Button>}{pickProject && <VaultRecordPicker type="Project" onPick={value=>{setLinked(value);setPickProject(false);}} />}</>}</div>
      <label className="block text-sm">Description <Textarea name="description" maxLength={2500} /></label>
      <label className="block text-sm">Tags <Input name="tags" maxLength={500} placeholder="Comma-separated tags" /></label>
      {error && <p role="alert">{error}</p>}<Button type="submit" disabled={busy || !file || !title.trim()}>{busy ? 'Uploading…' : 'Upload'}</Button>
    </form>
  </DialogContent></Dialog>;
}