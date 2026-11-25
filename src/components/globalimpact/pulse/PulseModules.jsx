import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { pulseDomains } from '@/components/globalimpact/pulse/pulseDomains';
import { readScope } from '@/components/globalimpact/pulse/pulseGeography';
import PulseExplorer from '@/components/globalimpact/pulse/PulseExplorer';

export default function PulseModules({ demo, preview }) {
  const [params,setParams] = useSearchParams();
  const { hash } = useLocation();
  const [previewId,setPreviewId] = useState('');
  const [previewScope,setPreviewScope] = useState({region:'',country:'',local:''});
  const active = pulseDomains.find(domain => domain.id === (preview ? previewId : params.get('pulse')));
  const heading = useRef(null), triggers = useRef({}), focusNext = useRef(false);
  const scope = preview ? previewScope : readScope(params);
  useEffect(() => {
    const shouldFocus = active && (focusNext.current || (!preview && hash === '#world-pulse'));
    focusNext.current = false;
    if (!shouldFocus) return;
    const frame = requestAnimationFrame(() => { heading.current?.focus({preventScroll:true}); heading.current?.scrollIntoView({block:'start'}); });
    return () => cancelAnimationFrame(frame);
  }, [active,hash,preview]);
  function update(id, selection = {}) {
    if (preview) { setPreviewId(id); setPreviewScope({region:'',country:'',local:'',...selection}); return; }
    setParams(current => {
      const next = new URLSearchParams(current);
      if (id) next.set('pulse',id); else next.delete('pulse');
      for (const key of ['region','country','local']) {
        if (selection[key]) next.set(`pulse${key}`,selection[key]); else next.delete(`pulse${key}`);
      }
      return next;
    }, { preventScrollReset:true });
  }
  function close() {
    const id = active.id;
    update('');
    triggers.current[id]?.focus();
  }
  return <div className="min-w-0">
    <p className="impact-muted mb-2 text-sm">Choose an intelligence domain to explore its indicators, geography, sources and next steps.</p>
    <div className="impact-grid" aria-label="Intelligence domains">{pulseDomains.map(({id,title,icon:Icon,topic}) => <button type="button" key={id} ref={node => {triggers.current[id] = node;}} className={`impact-control flex min-w-0 items-start gap-2 text-left ${active?.id === id ? 'impact-selected' : ''}`} aria-expanded={active?.id === id} aria-controls={active?.id === id ? 'world-pulse-explorer' : undefined} onClick={() => { if (active?.id === id) close(); else { focusNext.current = true; update(id); } }}>
      <Icon size={16} className="shrink-0" aria-hidden="true"/><span className="min-w-0 flex-1"><strong className="block">{title}</strong><span className="impact-muted mt-1 block text-[11px] font-normal">{topic}</span></span><ChevronDown size={14} className={active?.id === id ? 'shrink-0 rotate-180' : 'shrink-0'} aria-hidden="true"/>
    </button>)}</div>
    {active && <PulseExplorer key={active.id} domain={active} headingRef={heading} setScope={selection => update(active.id,selection)} onClose={close} {...{demo,scope,preview}} />}
  </div>;
}