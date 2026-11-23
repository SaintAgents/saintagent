import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import WisdomFactCheck from '@/components/wisdom/WisdomFactCheck';
import { canManage, safeUrl, tagsFor } from '@/components/wisdom/wisdomCards';

export default function WisdomCardDetail({ card, user, close, edit, quiz, check, remove, checking, error }) {
  const [confirm,setConfirm] = useState(false);
  const [deleting,setDeleting] = useState(false);
  const [deleteError,setDeleteError] = useState(false);
  const manage = canManage(card,user);
  const erase = async () => {
    setDeleting(true); setDeleteError(false);
    try { await remove(); } catch { setDeleting(false); setDeleteError(true); }
  };
  return <Dialog open onOpenChange={open => { if (!open && !deleting) close(); }}><DialogContent hideCloseButton={deleting} data-readable-surface className="max-h-[85dvh] max-w-2xl overflow-y-auto break-words">
    <DialogHeader><DialogTitle>{card.title}</DialogTitle><DialogDescription>{card.owner_name}{card.region ? ` · ${card.region}` : ''}{card.is_public ? '' : ' · Private card'}</DialogDescription></DialogHeader>
    <div className="flex flex-wrap gap-2"><Badge>{checking ? 'Checking' : card.status}</Badge><Badge variant="outline">{card.category}</Badge>{tagsFor(card).map(tag => <Badge key={tag} variant="secondary" className="max-w-full break-all">{tag}</Badge>)}</div>
    <p className="whitespace-pre-wrap text-sm leading-relaxed">{card.insight}</p>
    {card.learned_from && <p className="whitespace-pre-wrap text-sm"><strong>Learned from:</strong> {card.learned_from}</p>}
    {card.linked_record_name && <p className="text-sm"><strong>Linked record:</strong> {card.linked_record_name} ({card.linked_record_type} · {card.linked_record_id})</p>}
    {!!card.source_links?.length && <div><h3 className="font-semibold">Source links</h3><ul className="list-disc space-y-1 pl-5 text-sm">{card.source_links.map((link,i) => safeUrl(link) && <li key={i}><a className="break-all underline" href={safeUrl(link)} target="_blank" rel="noreferrer">{link}</a></li>)}</ul></div>}
    <WisdomFactCheck check={card.fact_check} />
    <section className="space-y-2 rounded-lg border p-3"><h3 className="font-semibold">{card.quiz_ready ? 'Quiz ready' : 'No quiz yet'}</h3><p className="text-sm">{card.quiz_attempts || 0} completed attempts · Best score: {card.quiz_attempts ? `${card.quiz_best_score}%` : '—'}</p><Button variant="outline" onClick={quiz}>{card.quiz_ready ? 'Take quiz' : 'Make a quiz'}</Button></section>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {manage && <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={checking || deleting} onClick={edit}>Edit card</Button><Button variant="outline" disabled={checking || deleting} onClick={check}>{checking ? 'Checking…' : card.fact_check?.verdict ? 'Recheck with AI' : 'Fact-check'}</Button><Button variant="destructive" disabled={checking || deleting} onClick={() => setConfirm(true)}>Delete</Button></div>}
    {confirm && <section role="group" aria-label="Confirm deletion" className="space-y-2 rounded-lg border p-3"><p>Delete this Wisdom Card and its quiz? This cannot be undone.</p>{deleteError && <p role="alert">Could not delete the card. Please try again.</p>}<div className="flex gap-2"><Button variant="outline" disabled={deleting} onClick={() => setConfirm(false)}>Cancel</Button><Button variant="destructive" disabled={deleting} onClick={erase}>{deleting ? 'Deleting…' : 'Confirm delete'}</Button></div></section>}
  </DialogContent></Dialog>;
}