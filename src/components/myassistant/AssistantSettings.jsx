import React from 'react';
import { Input } from '@/components/ui/input';

export default function AssistantSettings({ settings, onChange, voices }) {
  return <div className="grid gap-4 p-4 text-sm">
    <label className="grid gap-1">Assistant name<Input maxLength={36} value={settings.name} onChange={e => onChange({ name: e.target.value })} /></label>
    <label className="grid gap-1">Greeting<Input maxLength={140} value={settings.greeting} onChange={e => onChange({ greeting: e.target.value })} /></label>
    <div className="grid grid-cols-2 gap-2">
      <label className="grid gap-1">Icon<select className="rounded border bg-background p-2" value={settings.icon} onChange={e => onChange({ icon: e.target.value })}><option value="sparkles">Sparkles</option><option value="compass">Compass</option><option value="star">Star</option></select></label>
      <label className="grid gap-1">Accent<select className="rounded border bg-background p-2" value={settings.accent} onChange={e => onChange({ accent: e.target.value })}><option value="primary">Violet</option><option value="secondary">Periwinkle</option><option value="accent">Lavender</option></select></label>
    </div>
    <label className="grid gap-1">Read-aloud voice<select className="rounded border bg-background p-2" value={settings.voice} onChange={e => onChange({ voice: e.target.value })}><option value="">Device default</option>{voices.map(voice => <option key={voice.voiceURI} value={voice.name}>{voice.name}</option>)}</select></label>
    <label className="flex items-center gap-2"><input type="checkbox" checked={settings.autoOpen} onChange={e => onChange({ autoOpen: e.target.checked })} /> Open automatically when I return</label>
    <label className="flex items-center gap-2"><input type="checkbox" checked={settings.briefing} onChange={e => onChange({ briefing: e.target.checked })} /> Show a daily briefing prompt</label>
  </div>;
}