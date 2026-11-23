import React, { useState } from 'react';
import { Download, FileText, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { canEditDocument, safeFileUrl } from '@/components/vault/vault';

function fileColor(value) {
  const ext = value?.toLowerCase().replace(/^\./, '') || '';
  if (/^(pdf|application\/pdf)$/.test(ext)) return 'text-red-500';
  if (/^(docx?|odt|rtf|txt)$/.test(ext) || /word/.test(ext)) return 'text-blue-500';
  if (/^(xlsx?|ods|csv)$/.test(ext) || /spreadsheet/.test(ext)) return 'text-emerald-500';
  if (/^(pptx?|odp)$/.test(ext) || /presentation/.test(ext)) return 'text-orange-500';
  if (/^(jpe?g|png|svg|gif|webp|avif|heic|bmp|tiff?)$|^image\//.test(ext)) return 'text-purple-500';
  if (/^(mp4|mov|webm|avi|mkv|m4v)$|^video\//.test(ext)) return 'text-pink-500';
  if (/^(zip|7z|rar|gz)$|zip/.test(ext)) return 'text-amber-500';
  return 'text-muted-foreground';
}

export default function VaultDocumentCard({ doc, user, open, changed }) {
  const [busy,setBusy] = useState(false), [error,setError] = useState('');
  const editable = canEditDocument(doc,user), url = safeFileUrl(doc.file_url);
  async function remove() {
    if (busy || !window.confirm(`Delete “${doc.title}” from the vault?`)) return;
    setBusy(true); setError('');
    try { await base44.entities.HubDocument.delete(doc.id); changed(); }
    catch { setError('Could not delete this document.'); }
    finally { setBusy(false); }
  }
  return <article className="min-w-0 space-y-3 rounded-lg border bg-card p-4 text-card-foreground">
    <div className="flex items-start gap-3"><FileText className={`size-7 shrink-0 ${fileColor(doc.file_type)}`} /><div className="min-w-0"><h3 className="break-words font-semibold">{doc.title}</h3><p className="break-words text-xs text-muted-foreground">{doc.file_type?.toUpperCase() || 'FILE'} · {doc.folder || 'Other'}{doc.created_by_name ? ` · ${doc.created_by_name}` : ''}</p></div></div>
    {doc.description && <p className="whitespace-pre-wrap break-words text-sm">{doc.description}</p>}
    {doc.assigned_to_type === 'Site-wide' ? <Badge variant="secondary">Site-wide</Badge> : doc.assigned_to_type && <p className="break-words text-sm">Assigned to: {doc.assigned_to_type}{doc.assigned_to_name ? ` · ${doc.assigned_to_name}` : ''}</p>}
    {doc.shared_with_names && <p className="break-words text-sm">Shared with: {doc.shared_with_names}</p>}
    <div className="flex flex-wrap gap-2">
      {url && <Button asChild variant="outline" size="sm"><a href={url} target="_blank" rel="noreferrer"><Download /> Save</a></Button>}
      <Button variant="outline" size="sm" onClick={async()=>{ let copied=false; try { if(url) {await navigator.clipboard.writeText(url);copied=true;} } catch { /* link remains available in the dialog */ } open({mode:'share',doc,copied}); }}><Share2 /> Share</Button>
      {editable && <><Button size="sm" variant="outline" onClick={()=>open({mode:'assign',doc})}>Assign</Button><Button size="sm" variant="ghost" disabled={busy} onClick={remove}><Trash2 /> Delete</Button></>}
    </div>{error && <p role="alert">{error}</p>}
  </article>;
}