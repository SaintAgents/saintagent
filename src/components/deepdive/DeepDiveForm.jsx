import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sourceTypes } from '@/components/intelligence/intelligenceSources';

export default function DeepDiveForm({ objective, setObjective, parent, clearParent, busy, onRun }) {
  return <form className="space-y-4" key={parent?.id || 'root'} onSubmit={e => {
    e.preventDefault();
    if (busy || objective.trim().length < 3) return;
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    onRun({ objective: objective.trim(), angle: fields.angle.trim(), source: fields.scope === 'all' ? fields.filter : fields.scope, purpose: fields.purpose, matching: fields.matching, parentId: parent?.id });
  }}>
    {parent && <div className="flex flex-wrap items-center gap-2 border-b pb-2 text-sm"><span>Branch from: {parent.objective}</span><Button type="button" variant="ghost" size="sm" onClick={clearParent}>Clear branch</Button></div>}
    <fieldset disabled={busy} className="space-y-4">
      <label className="block space-y-1.5 text-sm font-medium">What would you like to investigate?<Textarea name="objective" rows={2} minLength={3} maxLength={400} required value={objective} onChange={e => setObjective(e.target.value)} placeholder="Ask about a subject, person, idea, or opportunity…" /></label>
      <label className="block space-y-1.5 text-sm font-medium">Investigation angle (optional)<Input name="angle" maxLength={250} placeholder="For example, focus on community-led approaches" /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">Research scope<select name="scope" defaultValue={parent?.source_filter === 'library' ? 'library' : parent?.source_filter === 'authorized' ? 'authorized' : 'all'} className="h-10 rounded-md border bg-background px-2 text-foreground"><option value="all">SaintAgent Knowledge Only</option><option value="library">My Research Library</option><option value="authorized">All Authorized Sources</option><option disabled>SaintAgent + Live Web (not connected)</option></select></label>
        <label className="grid gap-1.5 text-sm font-medium">Research purpose<select name="purpose" className="h-10 rounded-md border bg-background px-2 text-foreground"><option value="explore">Explore &amp; Understand</option><option value="connect">Find Connections &amp; Collaborators</option><option value="develop">Develop an Idea or Initiative</option><option value="plan">Build an Action Plan</option></select></label>
      </div>
      <p className="text-xs text-muted-foreground">All Authorized Sources combines SaintAgent and your private library. Live web and starting URLs aren’t connected.</p>
      <details className="space-y-2 border-y py-2 text-sm"><summary className="cursor-pointer font-medium">Advanced filters</summary><div className="grid gap-2 sm:grid-cols-2"><label className="grid gap-1">SaintAgent source (Knowledge Only)<select name="filter" className="rounded-md border bg-background p-2"><option value="all">All SaintAgent sources</option>{Object.entries(sourceTypes).filter(([key]) => key !== 'library').map(([key,[label]]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="grid gap-1">Match by<select name="matching" className="rounded-md border bg-background p-2"><option value="keywords">Keywords</option><option value="exact">Exact phrase</option><option value="related">Related terms</option></select></label></div></details>
      <Button type="submit" disabled={busy || objective.trim().length < 3}>{busy ? 'Investigating…' : 'Begin Deep Dive'} <ArrowRight aria-hidden="true" /></Button>
    </fieldset>
  </form>;
}