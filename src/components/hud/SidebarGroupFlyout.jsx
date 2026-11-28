import React, { useEffect, useRef } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function SidebarGroupFlyout({ group, openGroup, setOpenGroup, active, children }) {
  const open = openGroup === group.key;
  const trigger = useRef(null), content = useRef(null), timer = useRef(null), hoverOpened = useRef(false);
  const Icon = group.icon;
  const cancelClose = () => clearTimeout(timer.current);
  const close = () => setOpenGroup(key => key === group.key ? null : key);
  useEffect(() => () => clearTimeout(timer.current), []);

  function leave(event) {
    if (event.pointerType !== 'mouse') return;
    cancelClose();
    timer.current = setTimeout(() => {
      if (!content.current?.contains(document.activeElement)) close();
    }, 220);
  }

  return <Popover open={open} onOpenChange={next => {
    cancelClose();
    if (next) { hoverOpened.current = false; setOpenGroup(group.key); }
    else close();
  }}>
    <PopoverTrigger ref={trigger} type="button" data-tour-nav-group={group.key} aria-label={`Open ${group.label} navigation`}
      onPointerEnter={event => {
        if (event.pointerType !== 'mouse') return;
        cancelClose();
        if (!open) { hoverOpened.current = true; setOpenGroup(group.key); }
      }} onPointerLeave={leave}
      className={cn('relative flex w-full items-center justify-center rounded-lg p-2 transition-colors',
        active || open ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600')}>
      <Icon className="size-5" />
      {active && <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-violet-500" />}
    </PopoverTrigger>
    <PopoverContent ref={content} side="right" align="start" sideOffset={6} collisionPadding={8} hideWhenDetached
      aria-label={`${group.label} navigation`} className="z-[60] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto overscroll-contain p-2 md:block hidden"
      onPointerEnter={cancelClose} onPointerLeave={leave}
      onOpenAutoFocus={event => { if (hoverOpened.current) event.preventDefault(); }}
      onCloseAutoFocus={event => event.preventDefault()}
      onEscapeKeyDown={() => { if (content.current?.contains(document.activeElement)) trigger.current?.focus(); }}>
      <p className="px-2.5 pb-1 text-xs font-semibold uppercase tracking-wide">{group.label}</p>
      {children(close)}
    </PopoverContent>
  </Popover>;
}