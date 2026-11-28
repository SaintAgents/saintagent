import React, { useRef } from 'react';

export default function CanopyResize({ label, className, value, min, max, direction, onChange }) {
  const drag = useRef(null);
  const pending = useRef(null);
  function preview(next) { pending.current = next; onChange(next, false); }
  function finish() {
    if (pending.current == null) return;
    const next = pending.current;
    pending.current = null;
    onChange(next, true);
  }
  const clamp = n => Math.round(Math.min(max, Math.max(min, n)));
  const point = e => direction === 'down' ? e.clientY : e.clientX;
  const measure = e => clamp(drag.current.value + (point(e) - drag.current.start) * (direction === 'left' ? -1 : 1));
  return <input type="range" aria-label={label} title={label} className={className} min={min} max={max} value={value} onChange={e => preview(Number(e.target.value))}
    onKeyUp={finish} onBlur={() => { if (!drag.current) finish(); }}
    onPointerDown={e => { e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); drag.current = { start: point(e), value }; }}
    onPointerMove={e => { if (drag.current && (point(e) !== drag.current.start || pending.current != null)) preview(measure(e)); }}
    onPointerUp={e => { if (drag.current && point(e) !== drag.current.start) pending.current = measure(e); drag.current = null; finish(); }}
    onPointerCancel={() => { drag.current = null; finish(); }} />;
}