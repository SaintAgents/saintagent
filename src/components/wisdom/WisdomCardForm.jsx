import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import WisdomFactCheck from '@/components/wisdom/WisdomFactCheck';
import { callWisdom, categories, errorText, factKey, fields, safeUrl, statusFor } from '@/components/wisdom/wisdomCards';

const inputs = [['title','Title'],['insight','Insight'],['region','Region'],['tags','Tags (comma-separated)'],['learned_from','Learned from'],['linked_record_type','Record type'],['linked_record_id','Record ID'],['linked_record_name','Record name']];
export default function WisdomCardForm({ card, close, save }) {
  const [draft,setDraft] = useState(() => ({ ...Object.fromEntries(inputs.map(([field]) => [field,card?.[field] || ''])), category:card?.category || categories[0], source_links:(card?.source_links || []).join('\n'), is_public:card?.is_public ?? true }));
  const [result,setResult] = useState(() => card?.fact_check?.verdict ? { key:factKey({ ...draft, source_links:card.source_links || [] }), check:card.fact_check } : null);
  const [busy,setBusy] = useState('');
  const [error,setError] = useState('');
  const set = (key,value) => setDraft(d => ({ ...d,[key]:value }));
  const data = () => ({ ...Object.fromEntries(inputs.map(([key]) => [key,draft[key].trim()])), category:draft.category,is_public:draft.is_public,source_links:draft.source_links.split(/\r?\n/).map(link => link.trim()).filter(Boolean) });
  const values = data();
  const check = result?.key === factKey(values) ? result.check : null;
  const run = async action => {
    setError('');
    if (!values.title || !values.insight) return setError('Title and insight are required.');
    if (values.source_links.length > 12 || values.source_links.some(url => url.length > 1200 || !safeUrl(url))) return setError('Enter up to 12 valid HTTP or HTTPS source URLs, one per line.');
    const linked = [values.linked_record_type,values.linked_record_id,values.linked_record_name];
    if (linked.some(Boolean) && !linked.every(Boolean)) return setError('Enter a type, ID, and name for the linked record, or leave all three blank.');
    setBusy(action);
    try {
      if (action === 'check') setResult({ key:factKey(values),check:(await callWisdom('check',{ card:values })).check });
      else await save({ ...values,status:statusFor(check),fact_check:check || {},fact_checked_at:check?.checked_at || '',...(card && (card.title !== values.title || card.insight !== values.insight) ? { quiz:[],quiz_ready:false,quiz_generated_at:'',quiz_attempts:0,quiz_best_score:0 } : {}) });
    } catch (err) { setError(errorText(err,action === 'check' ? 'Fact-check failed. Please try again.' : 'Could not save the card. Please try again.')); }
    finally { setBusy(''); }
  };
  return <Dialog open onOpenChange={open => { if (!open && !busy) close(); }}><DialogContent hideCloseButton={!!busy} data-readable-surface className="max-h-[85dvh] max-w-2xl overflow-y-auto">
    <DialogHeader><DialogTitle>{card ? 'Edit Wisdom Card' : 'Make a Wisdom Card'}</DialogTitle><DialogDescription>Capture an insight and where it came from.</DialogDescription></DialogHeader>
    <form onSubmit={e => { e.preventDefault(); run('save'); }} className="space-y-3">
      <fieldset disabled={!!busy} className="grid gap-3 sm:grid-cols-2">
        {inputs.map(([key,label]) => { const Control = key === 'insight' ? Textarea : Input; return <label key={key} className={`block space-y-1 text-sm ${['title','insight','learned_from'].includes(key) ? 'sm:col-span-2' : ''}`}><span>{label}</span><Control value={draft[key]} maxLength={fields[key]} required={['title','insight'].includes(key)} onChange={e => set(key,e.target.value)} /></label>; })}
        <label className="space-y-1 text-sm">Category<select className="block h-9 w-full rounded-md border bg-background px-2" value={draft.category} onChange={e => set('category',e.target.value)}>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.is_public} onChange={e => set('is_public',e.target.checked)} /> Show in the shared library</label>
        <label className="space-y-1 text-sm sm:col-span-2">Source links (one URL per line)<Textarea value={draft.source_links} maxLength={15000} onChange={e => set('source_links',e.target.value)} /></label>
      </fieldset>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <WisdomFactCheck check={check} />
      <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={!!busy} onClick={() => run('check')}>{busy === 'check' ? 'Checking…' : 'Run AI fact-check'}</Button><Button disabled={!!busy}>{busy === 'save' ? 'Saving…' : 'Save card'}</Button></div>
    </form>
  </DialogContent></Dialog>;
}