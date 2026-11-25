import { Landmark } from 'lucide-react';
import PulseActivity from '@/components/globalimpact/pulse/PulseActivity';

const samples = [
  ['funding', 'Community resilience funding window opens', '$120,000 illustrative pool', 'A fictional funding round invites proposals for local flood resilience and emergency readiness.'],
  ['projects', 'Watershed restoration proposal enters review', 'Review milestone', 'The sample proposal includes land access notes and a draft water-quality monitoring plan. No award has been made.'],
  ['opportunities', 'Due diligence reviewers invited', '3 illustrative reviewer seats', 'A fictional review team needs expertise in community finance, project delivery, and impact measurement.'],
  ['signals', 'Solar cooperative flags a matching-funds gap', '$25,000 illustrative gap', 'The sample team has not confirmed its matching funds. The next step is to verify written commitments before any funding decision.'],
].map(([category, headline, metric, description]) => ({ id: `sample-ggt-${category}`, category, headline, metric, description, is_demo: true }));

export default function TreasuryPulse({ demo }) {
  return <section className="impact-surface p-3 sm:p-4" aria-labelledby="treasury-pulse-title">
    <div className="flex flex-wrap items-center gap-2"><Landmark size={19} aria-hidden="true" /><h1 id="treasury-pulse-title" className="text-2xl font-bold sm:text-3xl">Gaia Global Treasury Pulse</h1><span className="impact-chip">{demo ? 'Demo data' : 'Not connected'}</span></div>
    {demo ? <PulseActivity title="Sample Treasury activity" events={samples} /> : <p className="impact-muted mt-3 text-sm">The live Treasury feed isn’t connected yet. Switch to Demo to explore sample funding, projects, opportunities, and signals.</p>}
  </section>;
}