import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { blueprintFields } from '@/components/guide/guideEngine';

export default function GuideBlueprintEditor({ record, onSave }) {
  const [draft, setDraft] = useState(() => Object.fromEntries(Object.keys(blueprintFields).map(key => [key, record?.[key] || ''])));
  const save = useMutation({ mutationFn: async () => {
    const values = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()]));
    if (Object.values(values).every(value => !value)) {
      if (record) await base44.entities.GuideBlueprint.delete(record.id);
      return null;
    }
    return record ? base44.entities.GuideBlueprint.update(record.id, values) : base44.entities.GuideBlueprint.create(values);
  }, onSuccess: onSave });
  return <form className="space-y-3" onSubmit={e => { e.preventDefault(); save.mutate(); }}>
    <p className="text-sm text-muted-foreground">Only add what you choose to share. Your saved notes are used in an AI run only when you opt in. App admins can access stored notes.</p>
    <div className="grid gap-3 sm:grid-cols-2">{Object.entries(blueprintFields).map(([key, [label, hint]]) => <label key={key} className="grid gap-1 text-sm font-medium">{label}<Textarea rows={2} maxLength={800} value={draft[key]} placeholder={hint} disabled={save.isPending} onChange={e => setDraft({ ...draft, [key]: e.target.value })} /></label>)}</div>
    <div className="flex flex-wrap items-center gap-2"><Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save Blueprint'}</Button><Button type="button" variant="outline" disabled={save.isPending} onClick={() => setDraft(Object.fromEntries(Object.keys(blueprintFields).map(key => [key, ''])))}>Clear fields</Button>{save.isSuccess && <span role="status" className="text-sm">{save.data ? 'Blueprint saved.' : 'Blueprint cleared.'}</span>}</div>
    {save.isError && <p role="alert" className="text-sm">Could not save the Blueprint. Try again.</p>}
  </form>;
}