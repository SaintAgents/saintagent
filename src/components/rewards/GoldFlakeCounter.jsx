import { useContext } from 'react';
import { Coins } from 'lucide-react';
import { GoldFlakeContext } from '@/components/rewards/GoldFlakeProvider';

export default function GoldFlakeCounter() {
  const progress = useContext(GoldFlakeContext);
  if (!progress) return null;
  const { count, status } = progress;
  const label = status === 'limit' ? 'Daily Gold Flakes limit reached' : status === 'processing' ? 'Gold Flakes reward pending' : `${count} of 45 qualifying clicks. Earn 0.001 GGG per click, credited at 45.`;
  return <span data-gold-flakes="" role="img" aria-label={label} title={label} className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap px-1 text-xs font-medium text-foreground">
    <Coins aria-hidden="true" className="size-3.5" />
    <span aria-hidden="true">Gold Flakes</span>
    <span aria-hidden="true">{status === 'limit' ? 'Limit' : status === 'processing' ? 'Pending' : `${count}/45`}</span>
  </span>;
}