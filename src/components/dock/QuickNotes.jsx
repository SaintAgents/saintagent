import { useEffect, useRef, useState } from 'react';

export default function QuickNotes({ value = '', save, open }) {
  const [draft, setDraft] = useState(value), [listening, setListening] = useState(false), [error, setError] = useState('');
  const active = useRef(null);
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  useEffect(() => setDraft(value), [value]);
  useEffect(() => () => { const current = active.current; active.current = null; current?.abort(); }, []);
  function dictate() {
    if (active.current) { active.current.stop(); return; }
    const recognition = new Recognition();
    recognition.lang = navigator.language;
    recognition.onresult = event => {
      if (active.current !== recognition) return;
      const speech = Array.from(event.results).slice(event.resultIndex).filter(result => result.isFinal).map(result => result[0].transcript.trim()).join(' ');
      if (speech) setDraft(text => `${text}${text && !/\s$/.test(text) ? ' ' : ''}${speech}`.slice(0, 5000));
    };
    recognition.onerror = () => { if (active.current === recognition) setError('Dictation wasn’t available. Check microphone permissions or type your note.'); };
    recognition.onend = () => { if (active.current === recognition) { active.current = null; setListening(false); } };
    setError('');
    try { recognition.start(); active.current = recognition; setListening(true); }
    catch { setError('Could not start dictation. You can still type your note.'); }
  }
  return <form className="canopy-scratch grid gap-2" onSubmit={e => { e.preventDefault(); save(draft); }}>
    <textarea rows={4} aria-label="Quick notes" value={draft} maxLength={5000} onChange={e => setDraft(e.target.value)} placeholder="Jot something down…" />
    <div className="flex flex-wrap gap-2"><button disabled={draft === value}>Save note</button>
      {Recognition && <button type="button" onClick={dictate} aria-pressed={listening}>{listening ? 'Stop dictation' : 'Dictate'}</button>}
      {open && <button type="button" onClick={() => { if (draft !== value) save(draft); open('/Notes'); }}>Open Notes</button>}
    </div>{error && <p role="alert">{error}</p>}
  </form>;
}