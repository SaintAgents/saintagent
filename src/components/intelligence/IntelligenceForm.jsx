import { Search, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sourceTypes } from '@/components/intelligence/intelligenceSources';

export default function IntelligenceForm({ objective, setObjective, source, setSource, matching, setMatching, seed, setSeed, parent, setParent, busy, run, inputRef }) {
  return <form className="space-y-4" onSubmit={e => {e.preventDefault(); run(e.nativeEvent.submitter?.value || 'search');}}>
    <label className="block font-heading text-lg font-semibold" htmlFor="intelligence-question">What would you like to discover or develop?</label>
    {(seed || parent) && <div className="flex items-center gap-2 text-sm"><span>{seed ? `Starting source: ${seed.title}` : `Branching from: ${parent.objective}`}</span><Button type="button" variant="outline" size="icon" aria-label="Clear research context" disabled={!!busy} onClick={() => {setSeed(null); setParent(null);}}><X /></Button></div>}
    <Input ref={inputRef} id="intelligence-question" required minLength={3} maxLength={400} value={objective} onChange={e => setObjective(e.target.value)} placeholder="e.g., What do we know about regenerative agriculture?" disabled={!!busy} />
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <select aria-label="Filter by source" value={source} onChange={e => setSource(e.target.value)} disabled={!!busy} className="rounded-md border px-2 py-2"><option value="all">All supported sources</option>{Object.entries(sourceTypes).map(([key,[label]]) => <option value={key} key={key}>{label}</option>)}</select>
        <select aria-label="Search match type" value={matching} onChange={e => setMatching(e.target.value)} disabled={!!busy} className="rounded-md border px-2 py-2"><option value="keywords">Keywords</option><option value="exact">Exact phrase</option><option value="related">AI related terms</option></select>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" value="search" variant="outline" disabled={!!busy || objective.trim().length < 3}><Search /> Explore</Button>
        <Button type="submit" value="research" data-intel-primary disabled={!!busy || objective.trim().length < 3}><Sparkles /> {parent ? 'Save new branch' : 'Deep Dive & Save'}</Button>
      </div>
    </div>
    {busy && <p role="status" className="text-sm">{busy === 'research' ? 'Finding accessible sources and writing a cited brief…' : 'Searching accessible sources…'}</p>}
  </form>;
}