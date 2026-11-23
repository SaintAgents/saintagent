import { useEffect, useState } from 'react';

const DAY = 86400000;
const CYCLE = 29.530588 * DAY;
const EPOCH = Date.UTC(2000, 0, 6, 18, 14);
const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
const format = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${Math.floor(ms / 100) % 10}`;

export default function TimeTool({ type, visible = true }) {
  const [start, setStart] = useState(null), [total, setTotal] = useState(0);
  const [now, setNow] = useState(Date.now), [laps, setLaps] = useState([]);
  const moon = type === 'Moon Phase';
  useEffect(() => {
    if (!visible || (!moon && start === null)) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), moon ? 30000 : 100);
    return () => clearInterval(timer);
  }, [start, moon, visible]);
  if (moon) {
    const fraction = (((now - EPOCH) / CYCLE) % 1 + 1) % 1;
    const next = target => {
      const delta = ((target - fraction + 1) % 1 || 1) * CYCLE;
      const minutes = Math.ceil(delta / 60000);
      const countdown = `${Math.floor(minutes / 1440)}d ${Math.floor(minutes / 60) % 24}h ${minutes % 60}m`;
      return `${new Date(now + delta).toLocaleDateString(undefined, { dateStyle: 'medium' })} (${countdown})`;
    };
    return <div className="space-y-1"><strong>{phases[Math.round(fraction * 8) % 8]}</strong>
      <p>{fraction < 0.5 ? 'Waxing' : 'Waning'} · {Math.round((1 - Math.cos(2 * Math.PI * fraction)) * 50)}% illuminated · {(fraction * CYCLE / DAY).toFixed(1)} days old</p>
      <p>Next full moon: {next(0.5)}</p><p>Next new moon: {next(0)}</p><small>Approximate lunar dates and countdowns</small></div>;
  }
  const elapsed = total + (start === null ? 0 : Math.max(0, now - start));
  return <div className="grid gap-2"><strong className="tabular-nums">{format(elapsed)}</strong><div className="flex flex-wrap gap-1">
    <button type="button" onClick={() => { const t = Date.now(); if (start !== null) setTotal(total + t - start); setNow(t); setStart(start === null ? t : null); }}>{start === null ? 'Start' : 'Pause'}</button>
    <button type="button" disabled={start === null || laps.length >= 10} onClick={() => { const time = total + Date.now() - start; setLaps(previous => previous.length < 10 ? [...previous, time] : previous); }}>Lap</button>
    <button type="button" onClick={() => { setStart(null); setTotal(0); setLaps([]); }}>Reset</button></div>
    {laps.length > 0 && <ol>{laps.map((lap, i) => <li key={i}>Lap {i + 1}: {format(lap)}</li>)}</ol>}{laps.length === 10 && <small>10-lap limit reached</small>}</div>;
}