import React, { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { actions, links, tabs, shortcuts } from '@/components/canopy/canopyCatalog';

export default function CanopyCommandBar({ open, user, profile, activePath }) {
  const [query, setQuery] = useState('');
  const destinations = tabs.filter(([label]) => label !== 'Treasury' || user.role === 'admin');
  const commands = [...new Map([...destinations, ...actions, ...shortcuts, ...Object.values(links).flat()].filter(([, target]) => target !== 'card' || profile).map(item => [item[0], item])).values()];
  const term = query.trim();
  const matches = term ? commands.filter(([label,target]) => `${label} ${target}`.toLowerCase().includes(term.toLowerCase())).slice(0, 6) : [];
  const run = item => { if (!item) return; setQuery(''); open(item[1]); };
  return <div className="canopy-command-bar">
    <form className="canopy-command-form" onSubmit={e => { e.preventDefault(); if (term) matches.length ? run(matches[0]) : open('search',term); }}>
      <label><Search size={16} aria-hidden="true" /><input aria-label="Canopy command or search" placeholder="What do you want to do?" value={query} maxLength={200} onChange={e => setQuery(e.target.value)} /></label>
      <button type="submit" className="canopy-run" disabled={!term}>Run <ArrowRight size={14} /></button>
    </form>
    {term && <div className="canopy-tabs canopy-command-results" aria-label="Matching commands">{matches.map(item => <button key={item[0]} onClick={() => run(item)}>{item[0]}</button>)}<button onClick={() => { setQuery(''); open('search',term); }}>Search SaintAgent for “{term}”</button></div>}
    <nav className="canopy-tabs canopy-destinations" aria-label="Canopy destinations">{destinations.map(([label,target]) => <button key={label} aria-current={target.toLowerCase() === activePath?.toLowerCase() ? 'page' : undefined} onClick={() => open(target)}>{label}</button>)}</nav>
  </div>;
}