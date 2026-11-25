import React, { useMemo, useRef, useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import newsletterReadingText from '@/components/admin/newsletterReadingText';

export default function NewsletterReader({ campaign, onClose, triggerRef, contentLabel = 'newsletter' }) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const articleRef = useRef(null);
  const versions = campaign.ab_variations || [];
  const version = versions[index] || campaign;
  const subject = version.subject || 'Untitled newsletter';
  const body = useMemo(() => contentLabel === 'article' ? version.body_content : newsletterReadingText(version.body_content), [contentLabel, version.body_content]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`);
      setFeedback('Copied to clipboard.');
    } catch {
      setFeedback('Could not copy automatically. You can still select and copy the text below.');
    }
  }

  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent data-readable-surface data-newsletter-manager className="z-[10011] grid max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden" overlayClassName="z-[10010]" onCloseAutoFocus={event => { event.preventDefault(); triggerRef.current?.focus(); }}>
      <DialogHeader className="pr-8">
        <DialogTitle className="break-words leading-snug">{subject}</DialogTitle>
        <DialogDescription>Read and copy the {contentLabel} text.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap items-center gap-3">
        {versions.length > 1 && <select aria-label="Newsletter variation" value={index} className="rounded-md border bg-background px-3 py-2 text-sm text-foreground" onChange={event => { setIndex(Number(event.target.value)); setFeedback(''); articleRef.current?.scrollTo(0, 0); }}>
          {versions.map((item, i) => <option key={item.id || i} value={i}>{item.name || `Variation ${i + 1}`}</option>)}
        </select>}
        {body && <Button type="button" variant="outline" onClick={copy}><Copy aria-hidden="true" /> Copy {contentLabel}</Button>}
        <span role="status" className="text-sm text-muted-foreground">{feedback}</span>
      </div>
      <article ref={articleRef} tabIndex={0} aria-label={`${contentLabel} text`} className="min-h-0 select-text overflow-y-auto border-t pt-4">
        {body ? <p className="whitespace-pre-wrap break-words leading-relaxed">{body}</p> : <p>No readable content was saved for this {contentLabel}.</p>}
      </article>
    </DialogContent>
  </Dialog>;
}