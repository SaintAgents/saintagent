import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe2, MapPin, Sparkles, Users } from 'lucide-react';
import RecordKeepActions from '@/components/watch/RecordKeepActions';
import { shareUrl } from '@/components/publicprofile/publicLinks';
import { matchReasons, openGuide, opportunityPath, researchPath, titleCase } from '@/components/globalimpact/impactDiscovery';

export default function ImpactOpportunityDetail({ row, tags, demo }) {
  const [panel, setPanel] = useState('Overview');
  const [share, setShare] = useState('');
  const path = opportunityPath(row.id);
  const sampleResearch = `/Intelligence?demo=${row.id}`;
  const reasons = matchReasons(row, tags);
  const requirements = row.skills_required?.length ? row.skills_required : [];
  return <aside aria-label="Opportunity details" className="impact-detail min-w-0">
    <div className="impact-detail-art">{row.image_url ? <img src={row.image_url} alt="" /> : <Globe2 aria-hidden="true" size={52} />}</div>
    <div className="space-y-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2"><span className="impact-chip">{titleCase(row.category) || 'Opportunity'}</span><span className="impact-muted text-xs">{row.listing_type === 'request' ? 'Request for help' : 'Offer'}</span></div>
      <h3 className="break-words text-lg font-bold leading-tight">{row.title}</h3>
      <p className="impact-muted flex flex-wrap gap-x-3 gap-y-1 text-xs"><span className="inline-flex items-center gap-1"><Users size={13} /> {row.entity_name || row.owner_name || 'Organizer not listed'}</span><span className="inline-flex items-center gap-1"><MapPin size={13} /> {row.region || titleCase(row.delivery_mode) || 'Location not listed'}</span></p>
      <div className="flex flex-wrap gap-1 border-y py-2" role="group" aria-label="Opportunity detail sections">{['Overview','Details','Requirements','AI Intelligence'].map(name => <button type="button" key={name} aria-pressed={panel === name} className={`impact-control impact-small ${panel === name ? 'impact-selected' : ''}`} onClick={() => setPanel(name)}>{name}</button>)}</div>
      <div className="min-h-16 break-words text-sm">
        {panel === 'Overview' && <p className="whitespace-pre-wrap">{row.description || 'The organizer has not provided an overview.'}</p>}
        {panel === 'Details' && <dl className="space-y-1"><div>Format: {titleCase(row.delivery_mode) || 'Not listed'}</div><div>Location: {row.region || 'Not listed'}</div><div>Commitment: {row.duration_minutes ? `${row.duration_minutes} minutes per session` : 'Not listed'}</div></dl>}
        {panel === 'Requirements' && <p>{requirements.length ? requirements.join(', ') : 'No formal requirements have been listed.'}</p>}
        {panel === 'AI Intelligence' && <div className="space-y-2"><p>{reasons.length ? `Matches your profile interests or offered skills: ${reasons.join(', ')}.` : 'No exact match to your profile interests or offered skills was found.'}</p><Link className="impact-text-link" to={demo ? sampleResearch : researchPath(`Research this SaintAgent opportunity, similar listings, and what participation might require: ${row.title}`)}>{demo ? 'Open sample research' : 'Open in Research Hub'}</Link></div>}
      </div>
      {demo ? <Link className="impact-control impact-primary flex items-center justify-between" to={sampleResearch}>Open sample research <ArrowRight size={16} /></Link> : <>
        <Link className="impact-control impact-primary flex items-center justify-between" to={path}>View opportunity <ArrowRight size={16} /></Link>
        <div className="flex flex-wrap gap-2"><button type="button" className="impact-control inline-flex items-center gap-1" onClick={() => openGuide(`Help me evaluate this SaintAgent opportunity: ${row.title}. What should I check before taking the next step?`)}><Sparkles size={14} /> Ask My Guide</button><button type="button" className="impact-control" onClick={async () => { try { await navigator.clipboard.writeText(shareUrl(path)); setShare('Link copied'); } catch { setShare('Could not copy the link'); } }}>Share</button></div>
        {share && <p role="status" className="impact-muted text-xs">{share}</p>}
        <RecordKeepActions type="listing" id={row.id} title={row.title} subtitle={row.entity_name || row.owner_name} />
      </>}
    </div>
  </aside>;
}