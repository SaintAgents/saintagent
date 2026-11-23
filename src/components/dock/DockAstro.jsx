import React, { useEffect, useState } from 'react';
import { planetPositions } from '@/components/dock/astroPositions';

const timestamp = new Intl.DateTimeFormat(undefined, { month:'short', day:'numeric', hour:'numeric', minute:'2-digit', timeZoneName:'short' });

export default function DockAstro({ visible }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!visible) return;
    const refresh = () => setNow(Date.now());
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer);
  }, [visible]);
  const positions = planetPositions(now);
  return <section aria-label="Current planetary positions" className="space-y-2 text-sm">
    <p className="text-xs">Approximate tropical zodiac positions as seen from Earth.</p>
    {positions.length ? <>
      <dl className="divide-y divide-border">{positions.map(({ planet, sign, degrees }) => <div key={planet} className="flex flex-wrap justify-between gap-x-3 py-1.5">
        <dt className="font-medium">{planet}</dt><dd className="tabular-nums">{degrees}° {sign}</dd>
      </div>)}</dl>
      <p className="text-xs">As of <time dateTime={new Date(now).toISOString()}>{timestamp.format(now)}</time> · <a href="https://ssd.jpl.nasa.gov/planets/approx_pos.html" target="_blank" rel="noreferrer">NASA/JPL</a></p>
    </> : <p>Positions are unavailable for this date.</p>}
  </section>;
}