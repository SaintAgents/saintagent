import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { openDeepDive } from '@/components/deepdive/deepDive';
import { researchPath } from '@/components/globalimpact/impactDiscovery';
import { scopeRoute } from '@/components/globalimpact/pulse/pulseGeography';

export default function PulseActions({ domain, demo, scope, location, preview, section }) {
  const objective = `Investigate ${domain.topic} in ${location === 'Global' ? 'a global context' : location}. Cite source dates and reporting periods, distinguish evidence from interpretation, and identify practical next steps. No World Pulse demo values should be used as evidence.`;
  if (preview) return <p className="impact-muted text-sm">Research and action handoffs are disabled in this tour preview.</p>;
  async function share() {
    try {
      await navigator.clipboard.writeText(new URL(scopeRoute(domain.id, demo, scope), window.location.origin).href);
      toast.success('World Pulse link copied');
    } catch { toast.error('Could not copy the link. Open the shareable view and copy its address instead.'); }
  }
  if (section === 'opportunities') return <div className="space-y-3">
    <p className="impact-muted text-sm">No verified opportunities are linked to this selection. Explore existing listings or research needs relating to {domain.topic} before proposing an intervention.</p>
    <div className="flex flex-wrap gap-2"><Link className="impact-control" to="/GlobalImpactDashboard?workspace=opportunities">Discover Opportunities</Link><Link className="impact-control" to="/FindCollaborators">Find Collaborators</Link><Link className="impact-control" to="/Missions">Open Missions to create a mission</Link><Link className="impact-control" to="/ProjectCreate">Create Project</Link></div>
  </div>;
  if (section === 'insights') return <div className="space-y-3">
    <p className="impact-muted text-sm">No verified readings are loaded for automated interpretation, risk scoring or recommendations. Start a research session to investigate this topic and review its evidence.</p>
    <div className="flex flex-wrap gap-2"><button type="button" className="impact-control" onClick={() => openDeepDive({objective})}>Deep Dive</button><Link className="impact-control" to={`/MyGuide?${new URLSearchParams({question:objective})}`}>Ask My Guide</Link><Link className="impact-control" to={researchPath(objective)}>Open Saint Intelligence</Link></div>
  </div>;
  return <div className="flex flex-wrap gap-2"><button type="button" className="impact-control" onClick={share}>Share Intelligence</button><Link className="impact-text-link self-center text-xs" to={scopeRoute(domain.id,demo,scope)}>Open shareable view</Link></div>;
}