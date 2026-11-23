import { useState } from 'react';
import { VIDEO_LIBRARY, VIDEO_CATEGORIES } from '@/components/hud/videoLibrary';
import { getSavedHeroes } from '@/components/hero/surfaceHeroSettings';

export default function SurfaceHeroLibrary({ selected, toggle }) {
  const [search, setSearch] = useState(''), [category, setCategory] = useState('');
  const items = VIDEO_LIBRARY.filter(item => (!category || item.category === category) && item.label.toLowerCase().includes(search.trim().toLowerCase()));
  const inUse = new Set(Object.values(getSavedHeroes().surfaces || {}).flatMap(config => config?.enabled && config.mode === 'video' ? config.videos.map(item => item.url) : []));
  return <details className="space-y-2 border-t pt-3" open>
    <summary className="cursor-pointer text-sm font-semibold">Video library</summary>
    <div className="flex flex-wrap gap-2">
      <input aria-label="Search video library" type="search" placeholder="Find a video by name" value={search} onChange={event => setSearch(event.target.value)} className="min-w-0 flex-1 rounded border bg-background px-2 py-1" />
      <select aria-label="Video category" value={category} onChange={event => setCategory(event.target.value)} className="rounded border bg-background px-2 py-1"><option value="">All categories</option>{VIDEO_CATEGORIES.map(value => <option key={value}>{value}</option>)}</select>
    </div>
    {items.length ? <div className="grid max-h-48 grid-cols-2 gap-2 overflow-auto sm:grid-cols-3">{items.map(item => {
      const active = selected.some(entry => entry.url === item.url);
      return <div key={item.id} className="overflow-hidden rounded border">
        <button type="button" className="w-full text-left" aria-pressed={active} onClick={() => toggle(item)}>
          <video src={item.url} muted playsInline preload="metadata" className="pointer-events-none aspect-video w-full object-cover" />
          <span className="block px-2 py-1 text-xs">{item.label}{active ? ' · Added' : inUse.has(item.url) ? ' · In use' : ''}</span>
        </button>
        <a className="block px-2 pb-1 text-xs underline" href={item.url} download target="_blank" rel="noopener noreferrer" aria-label={`Download or open ${item.label}`}>Download / open</a>
      </div>;
    })}</div> : <p className="text-sm">No videos match your search.</p>}
  </details>;
}