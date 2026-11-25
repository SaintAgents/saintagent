import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Orbit, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import CommandMission from '@/components/globalimpact/command/CommandMission';
import CommandRelationshipGraph from '@/components/globalimpact/command/CommandRelationshipGraph';
import CommandSignals from '@/components/globalimpact/command/CommandSignals';
import CommandStatus from '@/components/globalimpact/command/CommandStatus';
import '@/components/globalimpact/command/masterCommand.css';

export default function MasterCommandHud({ demo }) {
  const { user } = useAuth();
  const [{ run, revision }, setRun] = useState({ run: null, revision: 0 });
  const [plan, setPlan] = useState(null);
  const [missionDraft, setMissionDraft] = useState(null);
  function receive(result) {setRun(previous => ({run: result, revision: previous.revision + 1})); setPlan(null); setMissionDraft(null);}
  return <section id="impact-workspace" className="master-command" aria-labelledby="master-command-title">
    <div className="mc-header"><div className="flex min-w-0 items-center gap-3"><Orbit aria-hidden="true" className="mc-gold shrink-0" size={26} /><div><p className="mc-kicker">SaintAgent / Mission Intelligence</p><h1 id="master-command-title">Master Command HUD</h1></div></div><span className="mc-badge"><ShieldCheck size={14} /> Review required</span></div>
    <div className="mc-grid">
      <CommandMission result={run} revision={revision} owner={user?.id} onResult={receive} onSave={setPlan} onMissionDraft={setMissionDraft} />
      <CommandRelationshipGraph result={run} />
      <CommandSignals demo={demo} result={run} />
      <CommandStatus result={run} plan={plan} missionDraft={missionDraft} />
      <details className="mc-panel mc-architecture"><summary className="mc-panel-title">Implementation Architecture <span>Governance &amp; audit</span></summary><div className="mc-body space-y-2 text-sm">
        <p>Mission Intelligence uses The Weaver and Saint Intelligence. The map shows citation links from the current run, not inferred relationships between people.</p>
        <p>Review and save a private plan before approving a Mission draft. Nothing publishes automatically.</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1"><Link to="/Intelligence">Research library</Link><Link to="/Planner#guide-action-plans">Planner drafts</Link></div>
      </div></details>
    </div>
  </section>;
}