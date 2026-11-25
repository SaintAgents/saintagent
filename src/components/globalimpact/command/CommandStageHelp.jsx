import { useEffect, useId, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import CommandStageDetails from '@/components/globalimpact/command/CommandStageDetails';

export default function CommandStageHelp({ index, label, done, ...details }) {
  const [mode, setMode] = useState(null);
  const timer = useRef();
  const trigger = useRef();
  const content = useRef();
  const heading = useId();
  const cancelClose = () => clearTimeout(timer.current);
  useEffect(() => () => clearTimeout(timer.current), []);
  const leave = event => {
    if (event.pointerType !== 'mouse') return;
    cancelClose();
    timer.current = setTimeout(() => setMode(value => value === 'hover' ? null : value), 200);
  };
  return <Popover open={!!mode} onOpenChange={open => { if (!open) { cancelClose(); setMode(null); } }}>
    <PopoverTrigger asChild>
      <button ref={trigger} type="button" className="mc-stage-help" aria-label={`About ${label}`} onPointerEnter={event => {
        if (event.pointerType !== 'mouse') return;
        cancelClose(); setMode(value => value || 'hover');
      }} onPointerLeave={leave} onClick={event => {
        event.preventDefault(); cancelClose(); setMode(mode === 'pinned' ? null : 'pinned');
        if (event.detail === 0 && mode !== 'pinned') requestAnimationFrame(() => content.current?.focus());
      }}>
        <span className="mc-stage-circle" aria-hidden="true">{done ? <Check size={13} /> : index + 1}</span>
        <span>{label}</span><span aria-hidden="true" className="mc-stage-question">?</span>
      </button>
    </PopoverTrigger>
    <PopoverContent ref={content} data-readable-surface className="mc-stage-popover max-h-[min(21rem,var(--radix-popover-content-available-height))] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain text-sm" tabIndex={0} aria-labelledby={heading} side="top" sideOffset={8} collisionPadding={{top:112,bottom:24,left:16,right:16}}
      onPointerEnter={cancelClose} onPointerLeave={leave} onFocusCapture={() => { cancelClose(); setMode('pinned'); }}
      onOpenAutoFocus={event => event.preventDefault()} onCloseAutoFocus={event => event.preventDefault()}
      onEscapeKeyDown={() => { if (mode === 'pinned') trigger.current?.focus(); }}>
      <h3 id={heading} className="mb-2 font-semibold">{label}{details.demoStage !== null && <small className="ml-2 font-normal text-muted-foreground">Demo only</small>}</h3>
      <CommandStageDetails index={index} {...details} />
    </PopoverContent>
  </Popover>;
}