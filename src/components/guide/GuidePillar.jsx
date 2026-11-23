import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { openGuide } from '@/components/globalimpact/impactDiscovery';

const chip = 'inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary';

export default function GuidePillar({ pillar }) {
  const { name, tagline, note, tools, Icon } = pillar;
  return <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Icon className="h-5 w-5 text-primary" /></span>
      <div><h2 className="font-heading text-lg font-bold text-foreground">{name}</h2><p className="text-xs uppercase tracking-wider text-muted-foreground">{tagline}</p></div>
    </div>
    <p className="mt-3 text-sm text-muted-foreground">{note}</p>
    <div className="mt-4 flex flex-wrap gap-2">
      {tools.map(tool => tool.assistant
        ? <button key={tool.label} type="button" className={chip} onClick={() => openGuide()}>{tool.label}</button>
        : <Link key={tool.label} to={tool.to} className={chip}>{tool.label}<ArrowUpRight className="h-3 w-3" /></Link>)}
    </div>
  </article>;
}