import React from 'react';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Pause, Play, SkipForward } from 'lucide-react';

export const inspirationSpeeds = [
  { label: '½×', delay: 20000 },
  { label: '1×', delay: 10000 },
  { label: '2×', delay: 5000 },
];

export default function InspirationPlayback({ paused, onToggle, delay, onSpeedChange, onNext, loading }) {
  return <div role="group" aria-label="Inspiration playback" className="flex flex-wrap items-center gap-2">
    <Button type="button" size="icon" variant="outline" aria-label={paused ? 'Resume' : 'Pause'} title={paused ? 'Resume' : 'Pause'} onClick={onToggle}>
      {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
    </Button>
    <select aria-label="Playback speed" title="Playback speed" value={delay} onChange={event => onSpeedChange(Number(event.target.value))} className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:outline focus-visible:outline-ring">
      {inspirationSpeeds.map(({ label, delay }) => <option key={delay} value={delay}>{label}</option>)}
    </select>
    <Button type="button" size="icon" variant="outline" aria-label={loading ? 'Loading next card' : 'Next card'} title="Next card" disabled={loading} onClick={onNext}>
      {loading ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <SkipForward aria-hidden="true" />}
    </Button>
  </div>;
}