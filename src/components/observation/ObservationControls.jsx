import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { arrangements } from '@/components/observation/observationGeometry';
import { DECK_NAMES } from '@/components/observation/useObservationWorkspace';
export default function ObservationControls({ deck, selectDeck, arrangement, arrange, viewport, setViewport, actual, status, retry }) {
  const [open,setOpen]=useState(false);
  return <section className="ob-controls" aria-label="Deck controls">
    <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}><SlidersHorizontal size={16}/> {DECK_NAMES[deck]} · Layout controls</button>
    {open && <div className="ob-controls-body">
      <label>Deck <select value={deck} onChange={e => selectDeck(+e.target.value)}>{DECK_NAMES.map((name,i) => <option key={name} value={i}>{name}</option>)}</select></label>
      <label>Arrangement <select value={arrangement} onChange={e => arrange(e.target.value)}>{arrangements.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label>Viewport <select value={viewport} onChange={e => setViewport(e.target.value)}><option value="auto">Auto ({actual})</option><option value="desktop" disabled={actual !== 'desktop'}>Desktop</option><option value="tablet">Tablet</option><option value="mobile">Mobile</option></select></label>
      {status && <small role="status">{status} {status === 'Could not save' && <button type="button" onClick={retry}>Retry</button>}</small>}
    </div>}
  </section>;
}