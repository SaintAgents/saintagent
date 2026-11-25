import { useContext } from 'react';
import { Coins } from 'lucide-react';
import { GoldFlakeContext } from '@/components/rewards/GoldFlakeProvider';
import { GOAL } from '@/components/rewards/goldFlakeClicks';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function GoldFlakeCounter() {
  const progress = useContext(GoldFlakeContext);
  if (!progress) return null;
  const { count, status } = progress;
  const progressText = status === 'limit' ? 'Daily limit reached' : status === 'processing' ? 'Reward pending' : `${count}/${GOAL}`;
  return <div data-gold-flakes="" className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-1 text-xs font-medium text-foreground">
    <span className="inline-flex items-center gap-1">
      <Coins aria-hidden="true" className="size-3.5" />
      Gold Flakes <span>{progressText}</span>
    </span>
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label="How Gold Flakes work" className="min-h-8 px-1 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 max-md:min-h-11">How it works</button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} data-gold-flakes="" data-readable-surface="" aria-label="How Gold Flakes work" className="z-[10001] w-72 max-w-[calc(100vw-2rem)] space-y-2 text-sm">
        <h3 className="font-semibold">What are Gold Flakes?</h3>
        <p>Gold Flakes are small GGG rewards you earn by using SaintAgent. At {GOAL} qualifying clicks, 0.045 GGG is added to your balance automatically.</p>
        <p>Use buttons, links, and other controls as you normally would. Empty-space clicks and rapid or excessive repeats don’t count.</p>
        <p>You can earn up to 10 rewards per day.</p>
      </PopoverContent>
    </Popover>
  </div>;
}