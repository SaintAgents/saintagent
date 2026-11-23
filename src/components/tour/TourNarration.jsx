import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TourNarration({ text }) {
  const speech = typeof window !== 'undefined' && window.speechSynthesis;
  const supported = !!speech && typeof window.SpeechSynthesisUtterance === 'function';
  const run = useRef(null);
  const [status, setStatus] = useState('idle');
  const cancel = () => {
    const utterance = run.current?.current;
    if (!utterance) return;
    run.current.current = null;
    utterance.onboundary = utterance.onend = utterance.onerror = null;
    speech.cancel();
  };
  useEffect(() => () => { cancel(); run.current = null; }, [speech]);

  const stop = () => { cancel(); run.current = null; setStatus('idle'); };
  const pause = () => {
    if (!run.current) return;
    // Keep a local bookmark instead of pausing the browser's global speech queue.
    cancel();
    setStatus('paused');
  };
  const speak = session => {
    if (run.current !== session) return;
    const part = session.parts[session.index];
    if (!part) { run.current = null; setStatus('idle'); return; }
    const start = session.offset;
    const utterance = new window.SpeechSynthesisUtterance(part.slice(start));
    session.current = utterance;
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    const isCurrent = () => run.current === session && session.current === utterance;
    utterance.onboundary = ({ name, charIndex }) => {
      if (isCurrent() && name === 'word' && charIndex >= 0 && start + charIndex < part.length) session.offset = start + charIndex;
    };
    utterance.onend = () => {
      if (!isCurrent()) return;
      session.current = null;
      session.index += 1;
      session.offset = 0;
      speak(session);
    };
    utterance.onerror = () => { if (isCurrent()) { run.current = null; setStatus('error'); } };
    speech.speak(utterance);
  };
  const play = () => {
    if (!run.current) {
      const sentences = typeof Intl.Segmenter === 'function'
        ? Array.from(new Intl.Segmenter('en', { granularity: 'sentence' }).segment(text), ({ segment }) => segment)
        : text.split(/(?<=[.!?])\s+/);
      run.current = { parts: sentences.map(part => part.trim()).filter(Boolean), index: 0, offset: 0, current: null };
    }
    setStatus('playing');
    if (speech.paused) speech.resume();
    speak(run.current);
  };
  if (!supported) return <p className="text-xs">Voice narration isn’t available in this browser. The full lesson is below.</p>;
  const active = status === 'playing' || status === 'paused';
  return <div role="group" aria-label="Voice narration" className="flex flex-wrap items-center gap-2">
    <Button type="button" size="sm" variant="outline" disabled={status === 'playing'} onClick={play}>{status === 'paused' ? <Play aria-hidden="true" /> : <Volume2 aria-hidden="true" />}{status === 'paused' ? 'Resume narration' : 'Listen to lesson'}</Button>
    <Button type="button" size="icon" variant="outline" aria-label="Pause narration" title="Pause narration" disabled={status !== 'playing'} onClick={pause}><Pause aria-hidden="true" /></Button>
    <Button type="button" size="icon" variant="outline" aria-label="Stop narration" title="Stop narration" disabled={!active} onClick={stop}><Square aria-hidden="true" /></Button>
    <span role="status" className="text-xs">{status === 'paused' ? 'Paused' : status === 'playing' ? 'Playing narration' : status === 'error' ? 'Narration couldn’t play. Try again or read below.' : ''}</span>
  </div>;
}