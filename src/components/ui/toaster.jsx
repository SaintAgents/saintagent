import { useToast } from '@/components/ui/use-toast';
import ActionToast from '@/components/ui/ActionToast';
import { Button } from '@/components/ui/button';

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const open = toasts.filter(item => item.open);
  if (!open.length) return null;
  return <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col gap-2 p-4 sm:left-auto sm:top-auto sm:right-0 sm:bottom-[var(--activity-ticker-height,0px)] sm:w-[min(100%,26rem)]">
    {open.length > 1 && <Button type="button" size="sm" variant="outline" className="pointer-events-auto self-end" onClick={() => dismiss()}>Close all</Button>}
    {open.slice(0, 3).map(item => <ActionToast key={item.id} item={item} dismiss={dismiss} />)}
  </div>;
}