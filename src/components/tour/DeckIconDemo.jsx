import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const CARD_STATES = {
  'Pop out': ['Separate panel', 'Sample card opened in its own view'],
  'Card symbol': ['Daily Ops', 'The calendar symbol identifies the card'],
  'View All': ['Full page', 'More details than the dashboard preview'],
  'Create new': ['Creation form', 'New item · Draft only'],
  'Refresh data': ['Daily Ops', 'Data refreshed · 3 upcoming items'],
  'Send to side panel': ['Right panel → Stored cards', 'Daily Ops moved here from the deck'],
  'Hide card': ['Controls Deck → Hidden cards', 'Daily Ops is hidden, not deleted'],
  'Pin / unpin': ['Pinned', 'Daily Ops · Pin active'],
  'More actions': ['More actions menu', 'Options vary by card'],
  'Expand / collapse': ['Daily Ops', 'Card body is collapsed · Header remains visible'],
};

export default function DeckIconDemo({ icons, cardPreview }) {
  const [selected, setSelected] = useState(0);
  const { label, result } = icons[selected];
  return <section aria-label="Practice with the icons" className="space-y-3 rounded-lg border p-4">
    <h3 className="font-heading font-semibold">Try the icons</h3>
    <p className="text-sm">Select an icon to see what it does. These examples won’t change your deck.</p>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Example controls">
      {icons.map(({ label: name, visual: Icon, image }, index) => (
        <Button key={name} type="button" variant="outline" onClick={() => setSelected(index)} aria-pressed={index === selected} className="h-auto min-h-9 whitespace-normal text-left aria-pressed:ring-2 aria-pressed:ring-[var(--readable-link)]">
          {image ? <img src={image} alt="" className="h-5 w-5 object-contain" /> : <Icon aria-hidden="true" />} {name}
        </Button>
      ))}
    </div>
    <div aria-live="polite" className="border-l-2 border-[var(--readable-border)] pl-3">
      <h4 className="font-semibold">{label}</h4>
      <p className="mt-1 text-sm">{result}</p>
      {cardPreview && <div className="mt-3 max-w-md overflow-hidden rounded-md border border-[var(--readable-border)]">
        <div className="border-b border-[var(--readable-border)] px-3 py-2 text-sm font-semibold">{CARD_STATES[label][0]}</div>
        <p className="px-3 py-2 text-sm">{CARD_STATES[label][1]}</p>
      </div>}
    </div>
  </section>;
}