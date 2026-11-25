import { Link } from 'react-router-dom';
import { openGuide } from '@/components/globalimpact/impactDiscovery';
import GuidePossibilitySimulator from '@/components/guide/GuidePossibilitySimulator';

const functions = [
  ['SAINT Mission Intelligence', 'Research a goal, review next steps and save a private Planner draft.', 'Open The Weaver', '#guide-weaver'],
  ['Living Knowledge Graph', 'Explore relationships already recorded in your contact network.', 'Open Contact Network graph', '/CRM?tab=network'],
  ['SAINT Deep Research Studio', 'Run a cited investigation across SaintAgent and reopen your saved studies.', 'Open Saint Intelligence', '/Intelligence'],
  ['Intelligent Action Orchestrator', 'Turn meeting notes into proposed follow-ups, assignments and a checkpoint. This drafts suggestions only.', 'Draft follow-up actions'],
  ['Possibility Simulator', 'Compare team capacity, deadlines and funding delays using your own assumptions.', 'Compare scenarios', '#guide-simulator'],
  ['Living Purpose & Capability Profile', 'Maintain your private Living Blueprint and choose whether to include it in a Weaver run.', 'Open Living Blueprint', '#guide-blueprint'],
  ['Global Collaboration Radar', 'Explore emerging needs, active initiatives, offered capabilities and reported outcomes.', 'Open Collaboration Radar', '/GlobalImpactDashboard?workspace=radar'],
];
const launch = 'Help me draft a follow-up plan from meeting notes. First ask me to paste the notes. Separate confirmed commitments from suggestions, flag missing owners or dates, and draft optional messages, tasks, deal updates and a checkpoint for my review. Do not send anything, make changes or schedule anything.';
const linkClass = 'text-sm font-semibold underline underline-offset-4';

export default function GuidePrimaryFunctions() {
  return <section className="space-y-4" aria-labelledby="guide-functions-title">
    <h2 id="guide-functions-title" className="font-heading text-2xl font-bold">Primary functions</h2>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {functions.map(([title, copy, label, to], index) => <section key={title} data-readable-surface className="flex flex-col gap-2 rounded-xl border p-4">
        <h3 className="font-semibold">{index + 1}. {title}</h3>
        <p className="flex-1 text-sm text-muted-foreground">{copy}</p>
        {to?.startsWith('#') ? <a className={linkClass} href={to} onClick={to === '#guide-simulator' ? () => { const simulator = document.getElementById('guide-simulator'); if (simulator) simulator.open = true; } : undefined}>{label}</a> : to ? <Link className={linkClass} to={to}>{label}</Link> : <button type="button" className={`${linkClass} self-start rounded-md border px-2 py-1 text-left`} onClick={() => openGuide(launch)}>{label}</button>}
      </section>)}
    </div>
    <GuidePossibilitySimulator />
  </section>;
}