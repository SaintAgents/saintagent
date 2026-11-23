import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import IntelligenceLibrary from '@/components/intelligence/IntelligenceLibrary';
import DeepDiveForm from '@/components/deepdive/DeepDiveForm';
import DeepDiveReport from '@/components/deepdive/DeepDiveReport';
import { runDeepDive, readDeepDive } from '@/components/deepdive/deepDive';

export default function DeepDiveWorkspace({ request }) {
  const { user } = useAuth(), owner = user.id, client = useQueryClient();
  const [objective,setObjective] = useState(request?.objective || ''), [parent,setParent] = useState(null);
  const [target,setTarget] = useState(request?.target || null);
  const [report,setReport] = useState(null), [history,setHistory] = useState(false);
  const reportRef = useRef(null), formRef = useRef(null);
  const select = row => { setReport(row); setHistory(false); requestAnimationFrame(() => reportRef.current?.focus()); };
  const openSaved = useMutation({mutationFn: id => readDeepDive(owner,id), onSuccess: select});
  const run = useMutation({mutationFn: runDeepDive, onSuccess: select});
  const save = useMutation({mutationFn: row => base44.entities.IntelligenceStudy.create(row), onSuccess: row => { setReport(row); client.invalidateQueries({queryKey:['intelligence-library',owner]}); }});
  useEffect(() => { if (request?.id) openSaved.mutate(request.id); }, [request?.id]);
  const busy = run.isPending || save.isPending || openSaved.isPending;
  const branch = finding => {
    setTarget(null); setParent(report); setObjective(finding.slice(0,400)); setHistory(false);
    requestAnimationFrame(() => formRef.current?.querySelector('textarea')?.focus());
  };
  return <div className="space-y-5" aria-busy={busy}>
    <div className="flex flex-wrap items-center gap-3"><Button type="button" variant="outline" size="sm" disabled={busy} aria-expanded={history} onClick={() => setHistory(!history)}>{history ? 'Hide history' : 'Research history'}</Button><Link className="text-sm underline" to="/Intelligence">Open Research Hub</Link></div>
    {history && <IntelligenceLibrary owner={owner} current={report?.id} onSelect={select} />}
    <div ref={formRef}><DeepDiveForm {...{objective,setObjective,parent,busy,target}} clearTarget={() => setTarget(null)} clearParent={() => setParent(null)} onRun={input => { save.reset(); openSaved.reset(); run.mutate(input); }} /></div>
    {run.isPending && <p role="status" className="text-sm">Finding accessible sources and assembling a cited report…</p>}
    {openSaved.isPending && <p role="status" className="text-sm">Opening saved investigation…</p>}
    {run.isError && <p role="alert" className="text-sm">{run.error.response?.data?.error || 'Could not complete the investigation. Try again.'}</p>}
    {openSaved.isError && <p role="alert" className="text-sm">This saved investigation could not be opened. <Button type="button" variant="outline" size="sm" onClick={() => openSaved.mutate(openSaved.variables)}>Retry</Button></p>}
    {report && <div tabIndex={-1} ref={reportRef} className="space-y-3 border-t pt-4">
      <DeepDiveReport key={report.id || run.submittedAt} {...{report,owner,busy,branch}} onParent={() => openSaved.mutate(report.parent_id)} />
      {!report.id && <Button type="button" disabled={busy} onClick={() => save.mutate(report)}>{save.isPending ? 'Saving…' : 'Save to Research Library'}</Button>}
      {save.isError && !report.id && <p role="alert">Could not save this investigation. Try again.</p>}
    </div>}
  </div>;
}