import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import ResearchBrowser from '@/components/deepdive/ResearchBrowser';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import IntelligenceLibrary from '@/components/intelligence/IntelligenceLibrary';
import DeepDiveForm from '@/components/deepdive/DeepDiveForm';
import DeepDiveReport from '@/components/deepdive/DeepDiveReport';
import { runDeepDive, readDeepDive, researchFollowup } from '@/components/deepdive/deepDive';

export default function DeepDiveWorkspace({ request, onAssistant }) {
  const { user } = useAuth(), owner = user.id, client = useQueryClient();
  const [objective,setObjective] = useState(request?.objective || ''), [parent,setParent] = useState(null);
  const [target,setTarget] = useState(request?.target || null);
  const [report,setReport] = useState(null), [view,setView] = useState(request?.view || 'investigate');
  const reportRef = useRef(null), formRef = useRef(null);
  const focusForm = () => requestAnimationFrame(() => formRef.current?.querySelector('textarea')?.focus());
  const select = row => { setReport(row); setView('investigate'); requestAnimationFrame(() => reportRef.current?.focus()); };
  function investigate(source) {
    const title = source.title.trim();
    setTarget(source); setParent(null); setObjective(title.length >= 3 ? title.slice(0, 400) : `Investigate ${title}`);
    setView('investigate'); run.reset(); save.reset(); openSaved.reset(); focusForm();
  }
  const openSaved = useMutation({mutationFn: id => readDeepDive(owner,id), onSuccess: select});
  const run = useMutation({mutationFn: runDeepDive, onSuccess: select});
  const save = useMutation({mutationFn: row => base44.entities.IntelligenceStudy.create(row), onSuccess: row => { setReport(row); client.invalidateQueries({queryKey:['intelligence-library',owner]}); }});
  useEffect(() => { if (request?.id) openSaved.mutate(request.id); }, [request?.id]);
  const busy = run.isPending || save.isPending || openSaved.isPending;
  const branch = finding => {
    setTarget(null); setParent(report); setObjective(finding.slice(0,400)); setView('investigate');
    focusForm();
  };
  return <div className="space-y-5" aria-busy={busy}>
    <nav aria-label="Research views" className="flex flex-wrap items-center gap-2 border-b pb-3">
      {[['investigate','Investigate'],['cards','Research cards'],['insights','Published insights'],['history','Research history']].map(([id,label]) => <Button key={id} type="button" variant="outline" size="sm" aria-pressed={view === id} className="aria-pressed:ring-2 aria-pressed:ring-current" disabled={busy} onClick={() => setView(id)}>{label}</Button>)}
      <Link className="text-sm underline sm:ml-auto" to="/Intelligence">Open Research Hub</Link>
    </nav>
    {(view === 'cards' || view === 'insights') && <ResearchBrowser key={view} {...{owner,view}} onInvestigate={investigate} />}
    {view === 'history' && <IntelligenceLibrary owner={owner} current={report?.id} onSelect={select} onOpenCards={() => setView('cards')} />}
    <div hidden={view !== 'investigate'} className="space-y-4">
    <div ref={formRef}><DeepDiveForm {...{objective,setObjective,parent,busy,target}} clearTarget={() => setTarget(null)} clearParent={() => setParent(null)} onRun={input => { save.reset(); openSaved.reset(); run.mutate(input); }} /></div>
    {run.isPending && <p role="status" className="text-sm">Finding accessible sources and assembling a cited report…</p>}
    {openSaved.isPending && <p role="status" className="text-sm">Opening saved investigation…</p>}
    {run.isError && <p role="alert" className="text-sm">{run.error.response?.data?.error || 'Could not complete the investigation. Try again.'}</p>}
    {openSaved.isError && <p role="alert" className="text-sm">This saved investigation could not be opened. <Button type="button" variant="outline" size="sm" onClick={() => openSaved.mutate(openSaved.variables)}>Retry</Button></p>}
    {report && <div tabIndex={-1} ref={reportRef} className="space-y-3 border-t pt-4">
      <DeepDiveReport key={report.id || run.submittedAt} {...{report,owner,busy,branch}} onOpenStudy={id => openSaved.mutate(id)} onParent={() => openSaved.mutate(report.parent_id)} />
      {!report.id && <Button type="button" disabled={busy} onClick={() => save.mutate(report)}>{save.isPending ? 'Saving…' : 'Save to Research Library'}</Button>}
      {save.isError && !report.id && <p role="alert">Could not save this investigation. Try again.</p>}
      {onAssistant && <Button type="button" variant="outline" disabled={busy} onClick={() => {
        if (!report.id && !window.confirm('This investigation is not saved. Close Deep Dive and open a draft in My Assistant anyway?')) return;
        onAssistant(researchFollowup(report));
      }}>Discuss this report with My Assistant</Button>}
    </div>}
    {onAssistant && !report && <Button type="button" variant="outline" disabled={busy || objective.trim().length < 3} onClick={() => onAssistant(`Help me refine this research question and outline what evidence would answer it. Treat the topic as private and do not include it in public web searches.\n\n${objective.trim()}`)}>Refine my question with My Assistant</Button>}
    </div>
  </div>;
}