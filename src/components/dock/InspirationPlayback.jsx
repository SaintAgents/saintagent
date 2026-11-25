import React from 'react';
import { Button } from '@/components/ui/button';

export const inspirationSpeeds = [
  { label: 'Slow (20s)', delay: 20000 },
  { label: 'Normal (10s)', delay: 10000 },
  { label: 'Fast (5s)', delay: 5000 },
];

export default function InspirationPlayback({ paused, onToggle, delay, onSpeedChange, onNext, loading }) {
  return <div role="group" aria-label="Inspiration playback" className="flex flex-wrap items-center gap-2">
    <Button type="button" size="sm" variant="outline" onClick={onToggle}>{paused ? 'Resume' : 'Pause'}</Button>
    <label className="flex items-center gap-1.5 text-sm">
      Speed
      <select value={delay} onChange={event => onSpeedChange(Number(event.target.value))} className="h-8 rounded-md border border-input bg-background px-2 text-foreground focus-visible:outline focus-visible:outline-ring">
        {inspirationSpeeds.map(({ label, delay }) => <option key={delay} value={delay}>{label}</option>)}
      </select>
    </label>
    <Button type="button" size="sm" variant="outline" disabled={loading} onClick={onNext}>{loading ? 'Loading…' : 'Next card'}</Button>
  </div>;
}