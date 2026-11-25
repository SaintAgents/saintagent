import { useRef } from 'react';

const edges = [['left','w'], ['right','e'], ['top','n'], ['bottom','s'], ['top left','nw'], ['top right','ne'], ['bottom left','sw'], ['bottom right','se']];
const clamp = (value, min, max) => Math.round(Math.max(Math.min(min, max), Math.min(value, max)));
const box = node => {
  const { width, height } = node.getBoundingClientRect();
  return { width, height, maxWidth: node.parentElement.clientWidth };
};
function dimensions(start, direction, dx, dy) {
  const change = {};
  if (dx && /[ew]/.test(direction)) {
    const width = clamp(start.width + dx * (direction.includes('w') ? -1 : 1), 160, start.maxWidth);
    if (width !== Math.round(start.width)) change.width = width;
  }
  if (dy && /[ns]/.test(direction)) {
    const height = clamp(start.height + dy * (direction.includes('n') ? -1 : 1), 100, Math.max(640, start.height));
    if (height !== Math.round(start.height)) change.height = height;
  }
  return change;
}

export default function CanopyCardHandles({ card, label, horizontalOnly, onPreview, onSave }) {
  const drag = useRef(null);
  const measure = (e, dir) => dimensions(drag.current, dir, e.clientX - drag.current.x, e.clientY - drag.current.y);
  function finish(e, change) {
    if (drag.current?.pointer !== e.pointerId) return;
    drag.current = null;
    onPreview(null);
    if (Object.keys(change).length) onSave(change);
  }
  return edges.slice(0, horizontalOnly ? 2 : 8).map(([side, dir], i) => <button key={dir} type="button" tabIndex={i > 3 ? -1 : 0}
    className="canopy-card-handle" data-edge={dir} aria-label={`Resize ${label} from ${side} (arrow keys)`} title={`Resize from ${side}`}
    onPointerDown={e => {
      if (e.button !== 0 || drag.current) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = { ...box(card.current), pointer: e.pointerId, x: e.clientX, y: e.clientY };
    }}
    onPointerMove={e => { if (drag.current?.pointer === e.pointerId) onPreview(measure(e, dir)); }}
    onPointerUp={e => { if (drag.current?.pointer === e.pointerId) finish(e, measure(e, dir)); }}
    onPointerCancel={e => finish(e, {})} onLostPointerCapture={e => finish(e, {})}
    onKeyDown={e => {
      const offset = { ArrowLeft: [-16,0], ArrowRight: [16,0], ArrowUp: [0,-16], ArrowDown: [0,16] }[e.key];
      if (!offset || (offset[0] ? !/[ew]/.test(dir) : !/[ns]/.test(dir))) return;
      e.preventDefault();
      if (!e.repeat && !drag.current) { const change = dimensions(box(card.current), dir, ...offset); if (Object.keys(change).length) onSave(change); }
    }} />);
}