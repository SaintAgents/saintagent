import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { contactLabels, contactOrder } from '@/components/publicprofile/ContactCardDetails';

export default function ContactCardFieldOrder({ value, onChange }) {
  const order = contactOrder(value);
  function move(index, offset) {
    const next = [...order];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  }
  return <fieldset className="space-y-1 rounded-md border p-2">
    <legend className="px-1 text-sm font-medium">Field order</legend>
    <p className="text-sm text-muted-foreground">Move fields up or down. Empty or unshared fields stay off the card.</p>
    <ol className="divide-y">
      {order.map((key, index) => <li key={key} className="flex items-center justify-between gap-2 py-1 text-sm">
        <span>{contactLabels[key]}</span><div className="flex gap-1">
          <Button size="icon" variant="outline" type="button" disabled={index === 0} aria-label={`Move ${contactLabels[key]} up`} onClick={() => move(index, -1)}><ArrowUp /></Button>
          <Button size="icon" variant="outline" type="button" disabled={index === order.length - 1} aria-label={`Move ${contactLabels[key]} down`} onClick={() => move(index, 1)}><ArrowDown /></Button>
        </div>
      </li>)}
    </ol>
  </fieldset>;
}