import React, { useEffect, useRef } from 'react';
import { Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import TourNarration from '@/components/tour/TourNarration';
import TourScreenPreview from '@/components/tour/TourScreenPreview';
import TourSplitPane from '@/components/tour/TourSplitPane';
import { overviewPreviewTarget } from '@/components/tour/tourPreviewTargets';
import DeckIconDemo from '@/components/tour/DeckIconDemo';
import { DECK_OVERVIEW, DECK_STOPS, WELCOME_OVERVIEW, WELCOME_STOPS } from '@/components/tour/deckOverview';
import { DECK_ICON_LESSONS } from '@/components/tour/deckIconLessons';
import { SIDEBAR_ICONS } from '@/components/tour/sidebarOverview';

export default function DeckOverviewDialog({ index, onSelect, onClose, returnFocus, firstVisit = false, showAll = false, onToggleSections, onFinish = onClose, busy = false, saveError = false }) {
  const pane = useRef(null);
  const locate = useRef(null);
  const essentials = firstVisit && !showAll;
  const groups = essentials ? WELCOME_OVERVIEW : DECK_OVERVIEW;
  const stops = essentials ? WELCOME_STOPS : DECK_STOPS;
  const last = index === stops.length - 1;
  const { title, area, what, action, anchor } = stops[index];
  const icons = DECK_ICON_LESSONS[title] || SIDEBAR_ICONS[title];
  const elements = firstVisit ? [] : Array.from(document.querySelectorAll(anchor)).filter(el => {
    const box = el.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
  });
  const target = title === 'Command Deck card icons' ? elements[0] : elements.find(el => { const box = el.getBoundingClientRect(); return box.right > 0 && box.left < window.innerWidth; });
  useEffect(() => { pane.current?.scrollTo({ top: 0 }); }, [index, essentials]);

  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <DialogContent data-dock-full-tour data-readable-surface data-hacker-draggable="true" hideCloseButton={firstVisit} className="inset-0 z-[1000000] flex h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border-0 p-0 data-[state=open]:animate-none data-[state=closed]:animate-none sm:rounded-none"
      onCloseAutoFocus={event => { event.preventDefault(); returnFocus(locate.current); }}>
      <header className="shrink-0 space-y-1 border-b px-4 py-4 pr-12 sm:px-8">
        <DialogTitle>{firstVisit ? 'Welcome to SaintAgent' : 'Command Deck Overview'}</DialogTitle>
        <DialogDescription>{firstVisit ? 'Get oriented with a full-screen walkthrough. Nothing you try in the preview changes your account.' : 'Walk through the whole screen, from navigation to the cards and tools. Choose any section or follow in order.'}</DialogDescription>
        {firstVisit && <Button type="button" size="sm" variant="outline" onClick={onToggleSections} disabled={busy}>{essentials ? 'Browse all sections' : 'Back to the essentials'}</Button>}
      </header>
      <TourSplitPane preview={<TourScreenPreview targets={[overviewPreviewTarget(title, anchor)]} />} >
        <div ref={pane} className="min-h-0 min-w-0 overflow-y-auto px-4 py-5 sm:px-8">
        <div className="mx-auto mb-4 max-w-3xl">
          <label htmlFor="deck-tour-section" className="mb-2 block text-sm font-semibold">Jump to a section</label>
          <select id="deck-tour-section" className="w-full rounded-md border bg-background px-2 py-2 text-sm text-foreground" value={index} onChange={event => onSelect(Number(event.target.value))}>
            {groups.map(group => <optgroup key={group.area} label={group.area}>{group.stops.map(item => <option key={item.title} value={stops.findIndex(stop => stop.title === item.title)}>{item.title}</option>)}</optgroup>)}
          </select>
          <details className="mt-2 text-sm"><summary className="cursor-pointer">Browse overview sections</summary>
            {groups.map(group => <details key={group.area} open={group.area === area ? true : undefined} className="mt-2"><summary className="cursor-pointer font-semibold">{group.area}</summary><ul className="mt-1 space-y-1">{group.stops.map(item => <li key={item.title}><Button type="button" variant="ghost" size="sm" aria-current={item.title === title ? 'step' : undefined} className="h-auto w-full justify-start whitespace-normal text-left aria-[current=step]:underline" onClick={() => onSelect(stops.findIndex(stop => stop.title === item.title))}>{item.title}</Button></li>)}</ul></details>)}
          </details>
        </div>
          <div className="mx-auto max-w-3xl space-y-5">
            <div aria-live="polite"><p className="text-sm text-muted-foreground">{area} · Section {index + 1} of {stops.length}</p><h2 className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">{title}</h2></div>
            <TourNarration key={title} text={`${title}. ${what} ${action} ${icons?.map(icon => `${icon.label}. ${icon.result}`).join(' ') || ''}`} />
            <div className="rounded-lg border p-4"><h3 className="font-semibold">What it is</h3><p className="mt-1 text-sm leading-relaxed">{what}</p><h3 className="mt-4 font-semibold">How to use it</h3><p className="mt-1 text-sm leading-relaxed">{action}</p></div>
            {icons && <DeckIconDemo key={title} icons={icons} cardPreview={title === 'Command Deck card icons'} />}
            {!firstVisit && (target ? <Button type="button" variant="outline" onClick={() => { locate.current = target; onClose(); }}><Crosshair aria-hidden="true" /> Highlight on my deck</Button> : <p className="text-sm text-muted-foreground">This section isn’t visible in your current layout.</p>)}
          </div>
        </div>
      </TourSplitPane>
      <footer className="shrink-0 space-y-2 border-t px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8">
        {saveError && <p role="alert" className="text-sm">Couldn’t save your tour choice. Please try again.</p>}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="outline" disabled={busy || index === 0} onClick={() => onSelect(index - 1)}>Back</Button>
          {firstVisit && <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>Skip for now</Button>}
          <Button type="button" disabled={busy} onClick={() => last ? onFinish() : onSelect(index + 1)}>{busy ? 'Saving…' : last ? 'Finish overview' : 'Next section'}</Button>
        </div>
      </footer>
    </DialogContent>
  </Dialog>;
}