import React, { useState } from 'react';
import { useDockWriting } from '@/components/dock/DockWritingStore';

export default function DockClipboardHistory() {
  const { history, saveHistory, historyError, capture, setCapture, captureError, addCopy, writable } = useDockWriting();
  const [status, setStatus] = useState('');
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); setStatus('Copied.'); }
    catch { setStatus('Could not copy. Select the text and copy it manually.'); }
  }
  if (!writable) return <p>Open the Dock outside the tour to use Clipboard History.</p>;
  return <div className="dock-added-widget session-record-block grid gap-2">
    <p>Keep up to 30 text clips in this browser. Capture saves selected page text you copy in SaintAgent. It skips form fields and doesn’t record Copy buttons or copies from other apps. Paste below to save those clips.</p>
    <div className="flex flex-wrap gap-2">
      <button type="button" aria-pressed={capture} onClick={() => setCapture(!capture)}>{capture ? 'Pause capture' : 'Enable capture'}</button>
      <button type="button" disabled={!history.length} onClick={() => { if (window.confirm('Clear all saved clipboard clips?')) { saveHistory([]); setStatus('History cleared.'); } }}>Clear history</button>
    </div>
    <input value="" onChange={() => {}} aria-label="Paste a clip to save" placeholder="Paste a clip here to save it" onPaste={event => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      if (!text.trim()) return;
      addCopy(text);
      setStatus('Clip added.');
    }} />
    {(historyError || captureError) && <p role="alert">Browser storage is unavailable. Changes may not last after reload.</p>}
    <p role="status" className={status ? '' : 'sr-only'}>{status}</p>
    {history.length === 0 ? <p>No clips saved yet.</p> : <ul className="grid gap-2">{history.map(text => <li key={text} className="grid gap-1 border-b pb-2">
      <p className="max-h-24 overflow-auto whitespace-pre-wrap select-text">{text}</p>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={() => copy(text)}>Copy</button><button type="button" onClick={() => saveHistory(items => items.filter(item => item !== text))}>Remove</button></div>
    </li>)}</ul>}
  </div>;
}