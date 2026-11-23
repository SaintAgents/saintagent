import GuideAsk from '@/components/guide/GuideAsk';
import GuideHero from '@/components/guide/GuideHero';
import GuidePillar from '@/components/guide/GuidePillar';
import { laterPhases, pillars } from '@/components/guide/guideTools';

export default function MyGuide() {
  return <section className="min-h-dvh px-3 pb-24 pt-6 sm:px-6">
    <div className="mx-auto max-w-6xl space-y-6">
      <GuideHero />
      <GuideAsk />
      <div className="grid gap-4 md:grid-cols-3">{pillars.map(p => <GuidePillar key={p.id} pillar={p} />)}</div>
      <footer className="rounded-2xl border border-dashed border-border p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Planned for later phases · not yet available</p>
        <ul className="mt-2 flex flex-wrap gap-2">{laterPhases.map(item => <li key={item} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{item}</li>)}</ul>
      </footer>
    </div>
  </section>;
}