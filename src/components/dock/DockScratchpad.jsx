import React, { useState } from 'react';
import { useDockWriting } from '@/components/dock/DockWritingStore';

export default function DockScratchpad() {
  const { draft, saveDraft, draftError, writable } = useDockWriting();
  const [status, setStatus] = useState('');
  if (!writable) return <p>Open the Dock outside the tour to use Scratchpad.</p>;
  return <div className="dock-added-widget session-record-block grid gap-2">
    <p>Only text entered here is saved, in this browser. It stays here when you close the Dock or reload.</p>
    <textarea className="w-full" rows={5} maxLength={20000} aria-label="Scratchpad draft" value={draft} placeholder="Start typing or paste a draft…" onChange={event => { saveDraft(event.target.value); setStatus(''); }} />
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={!draft} onClick={async () => {
        try { await navigator.clipboard.writeText(draft); setStatus('Draft copied.'); }
        catch { setStatus('Could not copy. Select the draft and copy it manually.'); }
      }}>Copy draft</button>
      <button type="button" disabled={!draft} onClick={() => { if (window.confirm('Clear this scratchpad draft?')) { saveDraft(''); setStatus('Draft cleared.'); } }}>Clear draft</button>
    </div>
    {draftError && <p role="alert">Could not save in this browser. Copy your draft before leaving.</p>}
    <p role="status">{status || (!draftError && draft ? 'Saved in this browser.' : '')}</p>
  </div>;
}