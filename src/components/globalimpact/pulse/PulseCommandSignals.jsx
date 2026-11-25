import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import CommandSignals from '@/components/globalimpact/command/CommandSignals';
import { commandDemo } from '@/components/globalimpact/command/commandDemo';
import '@/components/globalimpact/command/masterCommand.css';

export default function PulseCommandSignals({ demo, preview }) {
  const { user } = useAuth();
  const studyQuery = useQuery({
    queryKey: ['pulse-latest-study', user?.id], enabled: !demo && !preview && !!user?.id,
    queryFn: async () => (await base44.entities.IntelligenceStudy.filter({ created_by_id: user.id }, '-created_date', 1))[0] ?? null,
  });
  const study = !demo && studyQuery.data;
  const result = demo ? commandDemo : study ? {
    sources: study.sources ?? [], evidence: study.findings ?? [],
    questions: (study.findings ?? []).filter(item => item.kind === 'unresolved').map(item => item.text),
  } : null;
  return <div className="master-command mt-4 p-3 sm:p-4">
    <CommandSignals demo={demo} result={result} pulse />
    {!demo && !preview && <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
      {studyQuery.isPending && <p role="status" className="mc-muted">Loading your latest saved study…</p>}
      {studyQuery.isError && <p role="alert" className="mc-muted">Couldn’t load your latest study. <button type="button" className="underline" onClick={() => studyQuery.refetch()}>Retry</button></p>}
      {study && <Link className="impact-control" to={`/Intelligence?${new URLSearchParams({ study: study.id })}`}>Open latest saved study</Link>}
      <Link className="impact-control" to="/GlobalImpactDashboard?workspace=command">Open Command HUD</Link>
    </div>}
  </div>;
}