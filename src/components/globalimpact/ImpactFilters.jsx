import React from 'react';
import { Link } from 'react-router-dom';
import { Grid2X2, List, Map, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { categories, titleCase } from '@/components/globalimpact/impactDiscovery';

const views = [['cards','Cards',Grid2X2],['list','List',List],['map','Map',Map]];
const choices = [['category','Category',categories.map(value => [value,titleCase(value)])],['format','Format',[['online','Online'],['in-person','In-person'],['hybrid','Hybrid']]],['duration','Commitment',[['short','Up to 60 minutes'],['long','Over 60 minutes']]]];

export default function ImpactFilters({ mode, setMode, filters, patch, view, setView, expanded, setExpanded }) {
  return <>
    <div className="impact-tools grid gap-2 pb-3">
      <div className="flex gap-1" role="group" aria-label="Opportunity feed">{[['forYou','For You'],['all','All Opportunities']].map(([key,label]) => <button type="button" key={key} aria-pressed={mode === key} className={`impact-control ${mode === key ? 'impact-selected' : ''}`} onClick={() => setMode(key)}>{label}</button>)}</div>
      <label className="impact-control impact-search flex min-w-0 items-center gap-2"><Search size={15} className="shrink-0" /><input aria-label="Search opportunities" placeholder="Search opportunities…" value={filters.search} maxLength={120} onChange={e => patch({ search:e.target.value })} /></label>
      <button type="button" aria-expanded={expanded} aria-controls="impact-filters" className="impact-control inline-flex items-center gap-1.5" onClick={() => setExpanded(!expanded)}><SlidersHorizontal size={14} /> Filters</button>
      <div className="flex gap-1" role="group" aria-label="Opportunity view">{views.map(([key,label,Icon]) => <button type="button" key={key} aria-pressed={view === key} className={`impact-control inline-flex items-center gap-1.5 ${view === key ? 'impact-selected' : ''}`} onClick={() => setView(key)}><Icon size={14} /> {label}</button>)}</div>
      <Link className="impact-control impact-primary inline-flex items-center gap-1.5" to="/Marketplace?create=opportunity"><Plus size={15} /> Create Opportunity</Link>
    </div>
    {expanded && <div id="impact-filters" className="mb-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
      {choices.map(([key,label,items]) => <label key={key} className="grid gap-1 text-xs">{label}<select className="impact-control" value={filters[key]} onChange={e => patch({ [key]:e.target.value })}><option value="">Any</option>{items.map(([value,text]) => <option key={value} value={value}>{text}</option>)}</select></label>)}
      <label className="grid gap-1 text-xs">Location<input className="impact-control" value={filters.region} placeholder="City or region" maxLength={80} onChange={e => patch({ region:e.target.value })} /></label>
      <label className="grid gap-1 text-xs">Required skill<input className="impact-control" value={filters.skill} placeholder="e.g. first aid" maxLength={80} onChange={e => patch({ skill:e.target.value })} /></label>
    </div>}
  </>;
}