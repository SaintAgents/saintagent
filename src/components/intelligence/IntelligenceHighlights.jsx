import { ArrowUpRight, Bell, BookOpen, GitBranch, Network, Target, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const highlights = [
  { title: 'Mission Intelligence', icon: Target, label: 'Turn a goal into a plan', text: 'Bring an intention to The Weaver in My Guide, review possible next steps, and save an approved plan as a private mission draft in Planner.', links: [['Open My Guide', '/MyGuide'], ['Open Planner', '/Planner']] },
  { title: 'Semantic Relationship Intelligence', icon: Network, label: 'See what connects', text: 'Explore how people, skills, resources, and opportunities relate across the Radar’s needs, initiatives, capabilities, and outcomes.', links: [['Open Collaboration Radar', '/GlobalImpactDashboard?workspace=radar'], ['Find collaborators', '/FindCollaborators']] },
  { title: 'Cross-System Orchestration', icon: GitBranch, label: 'Move work between tools', text: 'Run a study in Saint Intelligence, revisit the records you keep, and open your private action plans in Planner when you’re ready to act.', links: [['Open Saint Intelligence', '/Intelligence'], ['Open Saved Items', '/SavedItems'], ['Open Planner', '/Planner']] },
  { title: 'Proactive Intelligence', icon: Bell, label: 'Spot opportunities and updates', text: 'Browse opportunities and suggested matches in Global Impact, or follow records in My Watchlist to see related activity.', links: [['Explore opportunities', '/GlobalImpactDashboard?workspace=opportunities'], ['Open My Watchlist', '/Watchlist']] },
  { title: 'Collective Intelligence', icon: Users, label: 'Work toward a shared goal', text: 'Find a Circle organized around a shared interest or explore active missions where you can contribute.', links: [['Explore Circles', '/Circles'], ['Explore Missions', '/Missions']] },
  { title: 'Impact Intelligence', icon: TrendingUp, label: 'See what your work adds up to', text: 'Review your mission completions and contributions in My Impact, alongside the platform’s progress toward global goals.', links: [['Open My Impact', '/ImpactDashboard']] },
  { title: 'Implementation Architecture', icon: BookOpen, label: 'Understand how the tools fit together', text: 'This area covers data models, event triggers, permissions, interface design, and phased rollout. The guides below explain existing platform tools and how projects are evaluated.', links: [['Open User Guide', '/UserGuide'], ['Read evaluation docs', '/EvaluationDocs']] },
];

export default function IntelligenceHighlights() {
  return <section aria-label="Seven intelligence areas" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {highlights.map(({ title, label, text, links, icon: Icon }, index) => <article key={title} className={`impact-surface flex min-w-0 flex-col gap-3 p-4 sm:p-5 ${index === 0 ? 'md:col-span-2 xl:col-span-3' : ''}`}>
      <div className="flex items-center gap-2">
        <Icon size={19} className="impact-globe shrink-0" aria-hidden="true" />
        <p className="impact-kicker">{label}</p>
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="impact-muted max-w-3xl text-sm leading-relaxed">{text}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        {links.map(([name, to]) => <Link key={to} to={to} className="impact-control inline-flex items-center gap-1.5">{name}<ArrowUpRight size={13} aria-hidden="true" /></Link>)}
      </div>
    </article>)}
  </section>;
}