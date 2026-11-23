import React, { useEffect, useState } from 'react';
const started = Date.now();
let timerStart = null, timerTotal = 0;
const zones = ['UTC','America/Denver','America/New_York','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Dubai','Asia/Kolkata','Asia/Tokyo','Australia/Sydney'];
const elapsed = ms => { const total=Math.floor(ms/1000); return [Math.floor(total/3600),Math.floor(total/60)%60,total%60].map(n => String(n).padStart(2,'0')).join(':'); };
export default function CanopyClock({ id, settings, commit }) {
  const [now,setNow] = useState(Date.now);
  useEffect(() => { const i=setInterval(() => setNow(Date.now()),1000); return () => clearInterval(i); },[]);
  const time = zone => new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit',second:'2-digit', ...(zone ? {timeZone:zone} : {})}).format(now);
  if (id === 'Stopwatch') return <div className="canopy-links"><strong className="canopy-clock">{elapsed(timerTotal+(timerStart ? Math.max(0,now-timerStart) : 0))}</strong><div className="canopy-tabs"><button onClick={() => { if (timerStart) { timerTotal+=Date.now()-timerStart; timerStart=null; } else timerStart=Date.now(); setNow(Date.now()); }}>{timerStart ? 'Pause' : 'Start'}</button><button onClick={() => {timerStart=null;timerTotal=0;setNow(Date.now());}}>Reset</button></div></div>;
  if (id === 'Moon Phase') { const cycles=(now - Date.UTC(2000,0,6,18,14))/86400000/29.530588; const phase=Math.round((cycles%1+1)%1*8)%8; return <p>{['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'][phase]} <small>· approximate</small></p>; }
  const zone = zones.includes(settings.zone) ? settings.zone : 'UTC';
  return <div className="canopy-links">{id === 'Time' ? <><strong className="canopy-clock">{time()}</strong><small>{new Date(now).toLocaleDateString(undefined,{dateStyle:'full'})}</small><small>Session time: {elapsed(now-started)}</small></> : <strong className="canopy-clock">{time(zone)}</strong>}<label>World clock <select value={zone} onChange={e => commit({zone:e.target.value})}>{zones.map(z => <option key={z}>{z}</option>)}</select></label>{id === 'Time' && <small>{time(zone)}</small>}</div>;
}