import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { categories } from '@/components/live/activity';

const tickerSpeeds = ['slow', 'normal', 'fast'];

export default function LiveActivityPreferences({ prefs, preferences, onSaved, preview = false }) {
  const [draft, set] = useState(prefs);
  const speedIndex = tickerSpeeds.includes(draft.speed) ? tickerSpeeds.indexOf(draft.speed) : 1;
  const update = (key, value) => set(current => ({ ...current, [key]: value }));
  const check = (label, key, invert = false, disabled = false) => <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" checked={invert ? !draft[key] : !!draft[key]} onChange={e => update(key, invert ? !e.target.checked : e.target.checked)} disabled={disabled} />{label}</label>;
  return <form className="space-y-4 text-sm" onSubmit={e => {
    e.preventDefault();
    if (!preview) preferences.mutate({ ...draft, revision: Date.now() }, { onSuccess: onSaved });
  }}>
    <fieldset disabled={preferences.isPending} className="space-y-2">
      <legend className="mb-2 font-semibold">Toasts</legend>
      {check('Show live activity and achievement toasts', 'suppress', true)}
      {check('Show me a welcome toast when I sign in', 'welcomeToast', false, draft.suppress)}
      {check('Show me when other members sign in', 'memberSignInToasts', false, draft.suppress)}
      {check('Let other members see when I sign in', 'shareSignIn')}
    </fieldset>
    <fieldset disabled={preferences.isPending} className="space-y-2 border-t pt-3">
      <legend className="mb-2 font-semibold">Activity ticker</legend>
      {check('Show live ticker', 'enabled')}
      <label className="flex flex-wrap items-center justify-between gap-2">Ticker placement <select className="rounded border bg-background p-1" value={draft.placement} onChange={e => update('placement', e.target.value)}><option value="bottom">Bottom bar</option><option value="sidebar">Sidebar</option><option value="canopy">Command Canopy HUD</option></select></label>
      {draft.placement !== 'canopy' && check('Also show ticker in Command Canopy', 'showInCanopy')}
      <label className="block">
        Ticker speed
        <input type="range" min={0} max={2} step={1} value={speedIndex} aria-label="Ticker speed" aria-valuetext={tickerSpeeds[speedIndex]} onChange={e => update('speed', tickerSpeeds[e.target.valueAsNumber])} className="block h-7 w-full cursor-pointer accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" />
        <span className="flex justify-between text-xs" aria-hidden="true">
          {tickerSpeeds.map((speed, index) => <span key={speed} className={index === speedIndex ? 'font-semibold capitalize' : 'capitalize'}>{speed}</span>)}
        </span>
      </label>
      {check('Show shared demo events when enabled by an admin', 'demo')}
      <fieldset className="grid gap-2 sm:grid-cols-2"><legend className="mb-2">Activity categories (none selected means all)</legend>{Object.entries(categories).filter(([id]) => id !== 'sign_ins').map(([id, [label]]) => <label key={id} className="flex items-center gap-2"><input type="checkbox" checked={draft.categories.includes(id)} onChange={e => update('categories', e.target.checked ? [...draft.categories, id] : draft.categories.filter(category => category !== id))} />{label}</label>)}</fieldset>
    </fieldset>
    {preferences.isError && <p role="alert" className="text-destructive">Couldn’t save activity preferences. Try again.</p>}
    <Button type="submit" disabled={preview || preferences.isPending}>{preferences.isPending ? 'Saving…' : 'Save activity preferences'}</Button>
  </form>;
}