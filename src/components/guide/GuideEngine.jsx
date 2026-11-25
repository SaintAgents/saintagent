import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import GuideBlueprintEditor from '@/components/guide/GuideBlueprintEditor';
import GuideResult from '@/components/guide/GuideResult';
import { runGuide } from '@/components/guide/guideEngine';

const example = 'I want to start a neighborhood project that turns food waste into compost for a community garden. What is a realistic first milestone, and who could help?';
export default function GuideEngine({ blueprintOnly = false }) {
  const { user } = useAuth();
  const client = useQueryClient();
  const queryKey = ['guide-blueprint', user?.id];
  const blueprint = useQuery({ queryKey, enabled: !!user?.id, queryFn: async () => (await base44.entities.GuideBlueprint.filter({ created_by_id: user.id }, '-updated_date', 1))[0] || null });
  const [objective, setObjective] = useState('');
  const [seven, setSeven] = useState(false);
  const [deep, setDeep] = useState(false);
  const [useBlueprint, setUseBlueprint] = useState(false);
  const guide = useMutation({ mutationFn: runGuide });
  return <section id={blueprintOnly ? undefined : 'guide-weaver'} data-readable-surface className="scroll-mt-32 space-y-4 rounded-2xl border p-4 shadow-sm sm:p-6" aria-label={blueprintOnly ? 'Living Blueprint' : 'The Weaver'}>
    {!blueprintOnly && <div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"><Sparkles size={16} /> The Weaver</p><h3 className="mt-1 text-xl font-bold">Find your Path Forward</h3><p className="mt-1 text-sm text-muted-foreground">Search across SaintAgent, connect what you find to your goals, and turn it into a plan you can review.</p></div>}
    {blueprintOnly && <div id="guide-blueprint" className="scroll-mt-32 space-y-3 rounded-lg border p-3">
      {blueprint.isPending ? <p role="status" className="text-sm">Loading Blueprint…</p> : blueprint.isError ? <p role="alert" className="text-sm">Could not load the Blueprint. <button type="button" className="underline" onClick={() => blueprint.refetch()}>Retry</button></p> : <GuideBlueprintEditor record={blueprint.data} onSave={record => { client.setQueryData(queryKey, record); if (!record) setUseBlueprint(false); }} />}
    </div>}
    {!blueprintOnly && <form className="space-y-3" onSubmit={e => {
      e.preventDefault();
      if (guide.isPending || !user?.id || objective.trim().length < 3) return;
      guide.mutate({ objective: objective.trim(), seven, deep, owner: user.id, blueprint: useBlueprint ? blueprint.data : null }, {onSettled: () => { if (deep) client.invalidateQueries({queryKey:['intelligence-library',user.id]}); }});
      setUseBlueprint(false);
    }}>
      <label htmlFor="guide-objective" className="text-sm font-semibold">What do you want to make happen?</label>
      <Textarea id="guide-objective" className="bg-background" rows={3} maxLength={400} minLength={3} required value={objective} onChange={e => setObjective(e.target.value)} placeholder="Describe a goal, a question, or a decision you’re facing…" disabled={guide.isPending} />
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={seven} disabled={guide.isPending} onChange={e => setSeven(e.target.checked)} /> Add Seven-Point Guidance</label><label className="flex items-center gap-2"><input type="checkbox" checked={deep} disabled={guide.isPending} onChange={e => setDeep(e.target.checked)} /> Run and save a Deep Dive first</label>{blueprint.data && <label className="flex items-center gap-2"><input type="checkbox" checked={useBlueprint} disabled={guide.isPending} onChange={e => setUseBlueprint(e.target.checked)} /> Include my saved Blueprint in this run</label>}</div>
      <div className="flex flex-wrap items-center gap-2"><Button type="submit" disabled={objective.trim().length < 3 || guide.isPending || !user?.id}>{guide.isPending ? 'Researching and drafting…' : 'Build an action plan'}</Button><Button type="button" variant="outline" disabled={guide.isPending} onClick={() => { setObjective(example); setSeven(true); setUseBlueprint(false); }}>Try an example</Button></div>
      {guide.isPending && <p role="status" className="text-sm">{deep ? 'Running Deep Dive, saving the investigation, and preparing a draft for review.' : 'Searching SaintAgent and synthesizing a draft. No records are being changed.'}</p>}
      {guide.isError && <p role="alert" className="text-sm">The Guide couldn’t finish this run. Try again or narrow your question.</p>}
    </form>}
    {!blueprintOnly && guide.isSuccess && <GuideResult key={guide.submittedAt} result={guide.data} userId={user.id} />}
  </section>;
}