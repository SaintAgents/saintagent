import { createPortal } from 'react-dom';
import { BellOff, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TourReminderToast({ rewardAvailable, refresher, onOpen, onDismiss, onMute }) {
  return createPortal(
    <section data-readable-surface aria-label="Tour reminder" className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-[10001] mx-auto max-w-sm rounded-lg border p-3 shadow-lg md:inset-x-auto md:bottom-6 md:right-6 md:w-96">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1" role="status">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><BookOpen aria-hidden="true" className="size-4 shrink-0" />{refresher ? 'Take a refresher tour' : 'Learn more with a SaintAgent tour'}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{rewardAvailable ? 'Complete the Site Skills Quest to earn a one-time reward of 0.77 GGG.' : 'Explore SaintAgent’s tools at your own pace.'}</p>
        </div>
        <Button type="button" size="icon" variant="ghost" className="shrink-0" title="Don't remind me again on this device" aria-label="Don't remind me again on this device" onClick={onMute}><BellOff aria-hidden="true" /></Button>
        <Button type="button" size="icon" variant="ghost" className="shrink-0" title="Dismiss tour reminder" aria-label="Dismiss tour reminder" onClick={onDismiss}><X aria-hidden="true" /></Button>
      </div>
      <Button type="button" size="sm" variant="outline" className="mt-2" onClick={onOpen}>Explore tours</Button>
    </section>, document.body,
  );
}