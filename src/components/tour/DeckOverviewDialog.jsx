import React, { useEffect, useRef } from 'react';
import { Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import TourNarration from '@/components/tour/TourNarration';
import DeckIconDemo from '@/components/tour/DeckIconDemo';
import { DECK_OVERVIEW, DECK_STOPS } from '@/components/tour/deckOverview';
import { DECK_ICON_LESSONS } from '@/components/tour/deckIconLessons';
import { SIDEBAR_ICONS } from '@/components/tour/sidebarOverview';

export default function DeckOverviewDialog({ index, onSelect, onClose, returnFocus }) {
  const pane = useRef(null);
  const locate = useRef(null);
  const { title, area, what, action, anchor } = DECK_STOPS[index];
  const icons = DECK_ICON_LESSONS[title] || SIDEBAR_ICONS[title];
  const elements = Array.from(document.querySelectorAll(anchor)).filter(el => {
    const box = el.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
  });
  const target = title === 'Command Deck card icons' ? elements[0] : elements.find(el => { const box = el.getBoundingClientRect(); return box.right > 0 && box.left < window.innerWidth; });
  useEffect(() => { pane.current?.scrollTo({ top: 0 }); }, [index]);

  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent data-readable-surface data-hacker-draggable="true" className="inset-0 z-[10010] flex h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border-0 p-0 data-[state=open]:animate-none data-[state=closed]:animate-none sm:rounded-none"
      onCloseAutoFocus={event => { event.preventDefault(); returnFocus(locate.current); }}>
      <header className="shrink-0 space-y-1 border-b px-4 py-4 pr-12 sm:px-8">
        <DialogTitle>Command Deck Overview</DialogTitle>
        <DialogDescription>Walk through the whole screen, from navigation to the cards and tools. Choose any section or follow in order.</DialogDescription>
      </header>
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[17rem_minmax(0,1fr)] md:grid-rows-1">
        <div className="min-h-0 border-b p-3 md:overflow-y-auto md:border-b-0 md:border-r">
          <label htmlFor="deck-tour-section" className="mb-2 block text-sm font-semibold">Jump to a section</label>
          <select id="deck-tour-section" className="w-full rounded-md border bg-background px-2 py-2 text-sm text-foreground" value={index} onChange={event => onSelect(Number(event.target.value))}>
            {DECK_OVERVIEW.map(group => <optgroup key={group.area} label={group.area}>{group.stops.map(item => <option key={item.title} value={DECK_STOPS.findIndex(stop => stop.title === item.title)}>{item.title}</option>)}</optgroup>)}
          </select>
          <div className="mt-4 hidden space-y-3 md:block" aria-label="Overview sections">
            {DECK_OVERVIEW.map(group => <details key={group.area} open={group.area === area ? true : undefined} className="text-sm"><summary className="cursor-pointer font-semibold">{group.area}</summary><ul className="mt-1 space-y-1">{group.stops.map(item => <li key={item.title}><Button type="button" variant="ghost" size="sm" aria-current={item.title === title ? 'step' : undefined} className="h-auto w-full justify-start whitespace-normal text-left aria-[current=step]:underline" onClick={() => onSelect(DECK_STOPS.findIndex(stop => stop.title === item.title))}>{item.title}</Button></li>)}</ul></details>)}
          </div>
        </div>
        <div ref={pane} className="min-h-0 overflow-y-auto px-4 py-5 sm:px-8">
          <div className="mx-auto max-w-3xl space-y-5">
            <div aria-live="polite"><p className="text-sm text-muted-foreground">{area} · Section {index + 1} of {DECK_STOPS.length}</p><h2 className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">{title}</h2></div>
            <TourNarration key={title} text={`${title}. ${what} ${action} ${icons?.map(icon => `${icon.label}. ${icon.result}`).join(' ') || ''}`} />
            <div className="rounded-lg border p-4"><h3 className="font-semibold">What it is</h3><p className="mt-1 text-sm leading-relaxed">{what}</p><h3 className="mt-4 font-semibold">How to use it</h3><p className="mt-1 text-sm leading-relaxed">{action}</p></div>
            {icons && <DeckIconDemo key={title} icons={icons} cardPreview={title === 'Command Deck card icons'} />}
            {target ? <Button type="button" variant="outline" onClick={() => { locate.current = target; onClose(); }}><Crosshair aria-hidden="true" /> Highlight on my deck</Button> : <p className="text-sm text-muted-foreground">This section isn’t visible in your current layout.</p>}
          </div>
        </div>
      </div>
      <footer className="flex shrink-0 justify-between gap-2 border-t p-3 sm:px-8"><Button type="button" variant="outline" disabled={index === 0} onClick={() => onSelect(index - 1)}>Back</Button><Button type="button" onClick={() => index === DECK_STOPS.length - 1 ? onClose() : onSelect(index + 1)}>{index === DECK_STOPS.length - 1 ? 'Finish overview' : 'Next section'}</Button></footer>
    </DialogContent>
  </Dialog>;
}