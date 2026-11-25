import { useRef, useState } from 'react';
import { GripVertical, Minus, Plus, X } from 'lucide-react';
import CanopyCardHandles from '@/components/canopy/CanopyCardHandles';

export default function CanopyCard({ id, size, scale, focused, minimized, onResize, onToggle, onRemove, dragHandle, dropTarget, children }) {
  const card = useRef(null);
  const [draft, setDraft] = useState(null);
  const saved = typeof size === 'number' ? { height: 46 + (size - 46) * scale / 100 } : size;
  const width = draft?.width ?? saved?.width;
  const height = draft?.height ?? saved?.height;
  const defaultHeight = 46 + ((id === 'Files & Knowledge' ? 320 : 156) - 46) * scale / 100;
  const style = {
    '--card-width': width ? `${width}px` : undefined,
    '--card-height': minimized ? undefined : height ? `${height}px` : focused ? undefined : `${defaultHeight}px`,
  };
  return <article ref={card} className="canopy-card" data-focused={focused || undefined} data-minimized={minimized || undefined} style={style} {...dropTarget}>
    <header>
      {dragHandle && <span className="canopy-grip" title={`Drag to reorder ${id}`} {...dragHandle}><GripVertical size={14} /></span>}
      <strong>{id}</strong>
      {onToggle && <button aria-label={`${minimized ? 'Expand' : 'Minimize'} ${id}`} onClick={onToggle}>{minimized ? <Plus size={14} /> : <Minus size={14} />}</button>}
      {onRemove && <button aria-label={`Remove ${id}`} onClick={onRemove}><X size={14} /></button>}
    </header>
    {!minimized && <div className="canopy-card-body">{children}</div>}
    <CanopyCardHandles card={card} label={id} horizontalOnly={minimized} onPreview={setDraft} onSave={change => onResize({ ...saved, ...change })} />
  </article>;
}