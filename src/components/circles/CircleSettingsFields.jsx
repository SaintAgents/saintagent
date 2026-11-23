import React, { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const selections = [
  ['category', 'Category', ['spiritual', 'creative', 'business', 'wellness', 'learning', 'social', 'activism', 'other'], 'social'],
  ['visibility', 'Visibility', ['public', 'private', 'invite_only'], 'public'],
  ['meeting_frequency', 'Meeting frequency', ['daily', 'weekly', 'biweekly', 'monthly', 'as_needed'], 'as_needed'],
];

export default function CircleSettingsFields({ local, onChange }) {
  const chatId = useId();
  return <>
    {selections.map(([field, label, options, fallback]) => (
      <label key={field} className="block text-sm font-medium">
        {label}
        <select className="mt-1 block h-9 w-full rounded-md border bg-background px-3 text-foreground" value={local[field] || fallback} onChange={(e) => onChange(field, e.target.value)}>
          {options.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ').replace(/^./, (first) => first.toUpperCase())}</option>)}
        </select>
      </label>
    ))}
    {[['values', 'Shared values'], ['interests', 'Common interests']].map(([field, label]) => (
      <label key={field} className="block text-sm font-medium">
        {label} (comma-separated)
        <Input className="mt-1" value={Array.isArray(local[field]) ? local[field].join(', ') : local[field] || ''} onChange={(e) => onChange(field, e.target.value)} />
      </label>
    ))}
    <div className="flex items-center justify-between gap-2">
      <Label htmlFor={chatId}>Enable circle chat</Label>
      <Switch id={chatId} checked={local.chat_enabled ?? true} onCheckedChange={(checked) => onChange('chat_enabled', checked)} />
    </div>
  </>;
}