import GuideAsk from '@/components/guide/GuideAsk';
import GuidePillar from '@/components/guide/GuidePillar';
import { laterPhases, pillars } from '@/components/guide/guideTools';

export default function MyGuide() {
  return <section className="min-h-dvh px-3 pb-24 pt-6 sm:px-6">
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">My Guide · SaintAgent Personal Intelligence</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">Your wisdom. Your intelligence. Your path forward.</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">One place to explore meaning, investigate ideas, and move toward action, each kept clearly distinct.</p>
      </header>
      <GuideAsk />
      <div className="grid gap-4 md:grid-cols-3">{pillars.map(p => <GuidePillar key={p.id} pillar={p} />)}</div>
      <footer className="rounded-2xl border border-dashed border-border p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Planned for later phases · not yet available</p>
        <ul className="mt-2 flex flex-wrap gap-2">{laterPhases.map(item => <li key={item} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{item}</li>)}</ul>
      </footer>
    </div>
  </section>;
}