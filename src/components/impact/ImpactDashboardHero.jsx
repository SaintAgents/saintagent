import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { impactRankBackground } from '@/components/impact/impactRankArt';
import ImpactHeroAvatar from '@/components/globalimpact/ImpactHeroAvatar';
import '@/components/impact/impactDashboardHero.css';

export default function ImpactDashboardHero({ name, rank, embedded, avatarUrl }) {
  const Heading = embedded ? 'h3' : 'h1';
  return <header className="personal-impact-hero" style={{ '--hero-art': impactRankBackground(rank?.code) }}>
    {!embedded && <Button asChild variant="ghost" size="icon" className="personal-impact-back">
      <Link to="/CommandDeck" aria-label="Back to Command Deck"><ArrowLeft /></Link>
    </Button>}
    <div className="personal-impact-heading mx-auto flex min-w-0 max-w-2xl flex-col items-center text-center">
      {embedded && <ImpactHeroAvatar name={name} avatarUrl={avatarUrl} />}
      <Heading className="flex flex-wrap items-center justify-center gap-2 text-3xl font-bold leading-tight sm:text-5xl"><TrendingUp className="size-7 shrink-0 sm:size-9" aria-hidden="true" /> Impact Dashboard</Heading>
      <p className="mt-2 text-sm sm:text-lg">Your contributions, progress, and impact on the global mission</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Badge variant="outline" className="personal-impact-identity max-w-full min-w-0 whitespace-normal break-words px-3 py-1 text-sm">{name}</Badge>
        {rank && <Badge variant="outline" className="personal-impact-identity personal-impact-rank px-3 py-1 text-sm">{rank.title}</Badge>}
      </div>
    </div>
  </header>;
}