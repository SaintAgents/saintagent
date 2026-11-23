import React, { useRef } from 'react';

export default function CanopyResize({ label, className, value, min, max, direction, onChange }) {
  const drag = useRef(null);
  const clamp = n => Math.round(Math.min(max, Math.max(min, n)));
  const point = e => direction === 'down' ? e.clientY : e.clientX;
  const measure = e => clamp(drag.current.value + (point(e) - drag.current.start) * (direction === 'left' ? -1 : 1));
  return <input type="range" aria-label={label} title={label} className={className} min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value), false)}
    onKeyUp={() => onChange(value, true)} onBlur={() => { if (!drag.current) onChange(value, true); }}
    onPointerDown={e => { e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); drag.current = { start: point(e), value }; }}
    onPointerMove={e => { if (drag.current) onChange(measure(e), false); }}
    onPointerUp={e => { if (drag.current) onChange(measure(e), true); drag.current = null; }}
    onPointerCancel={() => { drag.current = null; onChange(value, true); }} />;
}