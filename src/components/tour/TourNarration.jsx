import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TourNarration({ text }) {
  const speech = typeof window !== 'undefined' && window.speechSynthesis;
  const supported = !!speech && typeof window.SpeechSynthesisUtterance === 'function';
  const run = useRef(null);
  const [status, setStatus] = useState('idle');
  useEffect(() => () => { if (run.current) { run.current = null; speech.cancel(); } }, [speech]);

  const stop = () => { run.current = null; speech.cancel(); setStatus('idle'); };
  const play = () => {
    if (status === 'paused' && run.current) {
      const session = run.current;
      session.paused = false;
      setStatus('playing');
      speech.resume();
      if (!session.current) session.next();
      return;
    }
    const sentences = typeof Intl.Segmenter === 'function'
      ? Array.from(new Intl.Segmenter('en', { granularity: 'sentence' }).segment(text), ({ segment }) => segment)
      : text.split(/(?<=[.!?])\s+/);
    const parts = sentences.map(part => part.trim()).filter(Boolean);
    const session = { paused: false, current: null };
    run.current = session;
    session.next = () => {
      if (run.current !== session || session.paused) return;
      const part = parts.shift();
      if (!part) { run.current = null; setStatus('idle'); return; }
      const utterance = new SpeechSynthesisUtterance(part);
      session.current = utterance;
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => { session.current = null; session.next(); };
      utterance.onerror = () => { if (run.current === session) { run.current = null; setStatus('error'); } };
      speech.speak(utterance);
    };
    setStatus('playing');
    speech.resume();
    session.next();
  };
  if (!supported) return <p className="text-xs">Voice narration isn’t available in this browser. The full lesson is below.</p>;
  const active = status === 'playing' || status === 'paused';
  return <div role="group" aria-label="Voice narration" className="flex flex-wrap items-center gap-2">
    <Button type="button" size="sm" variant="outline" disabled={status === 'playing'} onClick={play}>{status === 'paused' ? <Play aria-hidden="true" /> : <Volume2 aria-hidden="true" />}{status === 'paused' ? 'Resume narration' : 'Listen to lesson'}</Button>
    <Button type="button" size="icon" variant="outline" aria-label="Pause narration" title="Pause narration" disabled={status !== 'playing'} onClick={() => { if (run.current) { run.current.paused = true; speech.pause(); setStatus('paused'); } }}><Pause aria-hidden="true" /></Button>
    <Button type="button" size="icon" variant="outline" aria-label="Stop narration" title="Stop narration" disabled={!active} onClick={stop}><Square aria-hidden="true" /></Button>
    <span role="status" className="text-xs">{status === 'paused' ? 'Paused' : status === 'playing' ? 'Playing narration' : status === 'error' ? 'Narration couldn’t play. Try again or read below.' : ''}</span>
  </div>;
}