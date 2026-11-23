import React from 'react';
import { ArrowRight, Globe2, MapPin } from 'lucide-react';
import { matchReasons, titleCase } from '@/components/globalimpact/impactDiscovery';

export default function ImpactOpportunityCards({ rows, selected, select, view, tags }) {
  return <div className={view === 'cards' ? 'impact-grid' : 'grid gap-2'}>{rows.map(row => {
    const reasons = matchReasons(row, tags);
    return <button type="button" key={row.id} aria-pressed={selected === row.id} className={`impact-record text-left ${view === 'list' ? 'impact-record-list' : ''}`} onClick={() => select(row.id)}>
      <div className="impact-record-art">{row.image_url ? <img src={row.image_url} alt="" loading="lazy" /> : <Globe2 aria-hidden="true" size={31} />}</div>
      <div className="min-w-0 space-y-1.5 p-2.5">
        <div className="flex flex-wrap items-center gap-1"><span className="impact-chip">{titleCase(row.category) || 'Opportunity'}</span><span className="impact-muted text-[10px]">{row.listing_type === 'request' ? 'Request' : 'Offer'}</span></div>
        <strong className="block break-words text-sm leading-tight">{row.title}</strong>
        {(row.entity_name || row.owner_name) && <p className="impact-muted truncate text-xs">{row.entity_name || row.owner_name}</p>}
        <span className="impact-muted flex items-center gap-1 text-xs"><MapPin size={12} className="shrink-0" /> {row.region || titleCase(row.delivery_mode) || 'Location not listed'}</span>
        {reasons.length > 0 && <p className="impact-match text-xs">Matches: {reasons.slice(0, 2).join(', ')}</p>}
      </div>
      {view === 'list' && <ArrowRight size={16} className="ml-auto mr-3 shrink-0" />}
    </button>;
  })}</div>;
}