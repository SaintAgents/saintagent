import { useEffect, useRef, useState } from 'react';
import { Microscope } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DeepDiveDragTrigger from '@/components/deepdive/DeepDiveDragTrigger';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import DeepDiveWorkspace from '@/components/deepdive/DeepDiveWorkspace';

export default function DeepDiveLauncher() {
  const [open, setOpen] = useState(false);
  const [request,setRequest] = useState({});
  const returnFocus = useRef(null);
  const hidden = isTourPreview() || (window.parent !== window && new URLSearchParams(window.location.search).get('observationPreview') === '1');
  useEffect(() => {
    if (hidden) return;
    const launch = event => { returnFocus.current = document.activeElement; setRequest(event.detail || {}); setOpen(true); };
    document.addEventListener('openDeepDive', launch);
    return () => document.removeEventListener('openDeepDive', launch);
  }, [hidden]);
  if (hidden) return null;
  return <Dialog open={open} onOpenChange={setOpen}>
    <DeepDiveDragTrigger onOpen={(detail, trigger) => { returnFocus.current = trigger; setRequest(detail); setOpen(true); }} />
    <DialogContent data-readable-surface onCloseAutoFocus={event => { if (returnFocus.current?.isConnected) { event.preventDefault(); returnFocus.current.focus(); } }} overlayClassName="z-[10999]" className="z-[11000] max-h-[85dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-xl p-4 sm:p-7">
      <div className="space-y-2 border-b pb-4 pr-7">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"><Microscope size={17} aria-hidden="true" /> Discover · Investigate · Connect · Develop · Activate</p>
        <DialogTitle className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl">DEEP DIVE INTELLIGENCE</DialogTitle>
        <DialogDescription>Explore Anything. Discover Connections. Develop Possibilities.</DialogDescription>
        <p className="text-sm">From curiosity to discovery. From discovery to meaningful action.</p>
      </div>
      <DeepDiveWorkspace key={request.id || (request.target ? `${request.target.kind}:${request.target.id || request.target.title}` : request.objective) || 'new'} request={request} />
    </DialogContent>
  </Dialog>;
}