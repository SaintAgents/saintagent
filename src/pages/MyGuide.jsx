import GuideAsk from '@/components/guide/GuideAsk';
import GuideHero from '@/components/guide/GuideHero';
import GuidePillar from '@/components/guide/GuidePillar';
import GuidePrimaryFunctions from '@/components/guide/GuidePrimaryFunctions';
import GuideLessons from '@/components/guide/GuideLessons';
import { pillars } from '@/components/guide/guideTools';

export default function MyGuide() {
  return <section className="min-h-dvh px-3 pb-24 pt-6 sm:px-6">
    <div className="mx-auto max-w-6xl space-y-6">
      <GuideHero />
      <GuidePrimaryFunctions />
      <GuideAsk />
      <div className="grid gap-4 md:grid-cols-3">{pillars.map(p => <GuidePillar key={p.id} pillar={p} />)}</div>
      <GuideLessons />
    </div>
  </section>;
}