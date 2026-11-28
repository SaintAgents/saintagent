import { useState } from 'react';
import { ArrowDown, ArrowUp, SlidersHorizontal } from 'lucide-react';
import { commandSources } from '@/components/commandcenter/commandSources';
import { defaultCommandLayout } from '@/components/commandcenter/useCommandLayout';
export default function CommandLayoutControls({ settings }) {
  const [open,setOpen] = useState(false);
  const { layout, patch, move, status, commit, retry } = settings;
  return <div className="cc-settings">
    <div className="cc-actions"><button type="button" className="cc-control" aria-expanded={open} aria-controls="cc-layout-controls" onClick={() => setOpen(!open)}><SlidersHorizontal size={16} /> Customize cards</button>
      <small role="status">{status}</small>{status === 'Layout could not be saved' && <button type="button" className="cc-control" onClick={retry}>Retry save</button>}</div>
    {open && <div id="cc-layout-controls">
      <p>Pinned cards stay first and remain visible in Focus unless hidden. Layout changes save to your account.</p>
      {[...layout.order].sort((a,b) => Number(Boolean(layout.cards[b]?.pinned)) - Number(Boolean(layout.cards[a]?.pinned))).map(id => {
        const source = commandSources.find(s => s.id === id), card = layout.cards[id] || {};
        const group = layout.order.filter(other => !!layout.cards[other]?.pinned === !!card.pinned);
        const i = group.indexOf(id);
        return <div className="cc-setting-row" key={id}>
          <strong>{source.label}</strong>
          <div className="cc-actions">
            <button type="button" className="cc-control" aria-label={`Move ${source.label} up`} disabled={i === 0} onClick={() => move(id,group[i-1])}><ArrowUp size={17} /></button>
            <button type="button" className="cc-control" aria-label={`Move ${source.label} down`} disabled={i === group.length-1} onClick={() => move(id,group[i+1])}><ArrowDown size={17} /></button>
            <button type="button" className="cc-control" onClick={() => patch(id,{ pinned:!card.pinned })}>{card.pinned ? 'Unpin' : 'Pin'}</button>
            <button type="button" className="cc-control" onClick={() => patch(id,{ collapsed:!card.collapsed })}>{card.collapsed ? 'Expand' : 'Collapse'}</button>
            <button type="button" className="cc-control" onClick={() => patch(id,{ hidden:!card.hidden })}>{card.hidden ? 'Show' : 'Hide'}</button>
            <select className="cc-control" aria-label={`${source.label} width`} value={card.span || ''} onChange={e => patch(id,{ span:Number(e.target.value) || null })}>
              <option value="">Auto width</option><option value="4">Compact</option><option value="6">Half width</option><option value="12">Full width</option>
            </select>
          </div>
        </div>;
      })}
      <button type="button" className="cc-control" onClick={() => commit({ ...defaultCommandLayout })}>Reset to defaults</button>
    </div>}
  </div>;
}