import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AssistantMessages from '@/components/myassistant/AssistantMessages';

const suggestions = [
  ['Plan my priorities', 'I have 30 minutes. Help me plan today’s priorities.'],
  ['Draft a message', 'Draft a message asking a collaborator to confirm the garden site visit.'],
];
const objective = 'Confirm the community garden site visit';
const memory = 'I prefer short checklists with owners and due dates.';
const voice = { canSpeak: false };
function reply(text) {
  if (/briefing/i.test(text)) return '**Sample daily briefing**\n\n- Confirm Friday’s garden site visit.\n- Review the volunteer checklist.\n- Ask who has the access key.\n\n**Blocker:** Site access isn’t confirmed yet.';
  if (/draft|message/i.test(text)) return 'Hi Sam, can you confirm whether Friday at 10 a.m. works for the garden site visit? If not, please suggest another time. Thanks!\n\n*Check the name and time before sending. Nothing was sent.*';
  if (/resume/i.test(text)) return '**Next step:** Ask the site lead to confirm the time and who can unlock the gate.';
  return '**Sample plan for 30 minutes**\n\n1. Confirm the site visit time (10 minutes).\n2. Review the volunteer checklist (15 minutes).\n3. Note anything blocked (5 minutes).';
}

export default function AssistantTourLab() {
  const [tab, setTab] = useState(''), [input, setInput] = useState(''), [messages, setMessages] = useState([]);
  const [remembered, remember] = useState(false), [tracked, track] = useState(false), [briefing, setBriefing] = useState(false);
  const send = (raw) => {
    const text = raw.trim();
    if (!text) return;
    setMessages(old => [...old, { role: 'user', content: text }, { role: 'assistant', content: reply(text) }]);
    setInput('');
  };
  return <section aria-label="My Assistant practice" className="flex min-h-0 min-w-0 flex-col overflow-auto border-b bg-card p-4 text-card-foreground md:border-b-0">
    <div className="mb-3 shrink-0 border-b pb-3"><h4 className="flex items-center gap-2 font-semibold"><Sparkles size={18} /> My Assistant</h4><p className="text-xs text-muted-foreground">Practice mode · Scripted replies · Nothing is sent or saved</p></div>
    {!tab ? <Button className="self-start" onClick={() => setTab('chat')}>Open My Assistant</Button> : <>
      <div className="mb-2 flex shrink-0 flex-wrap gap-1" aria-label="Assistant views">{[['chat', 'Chat'], ['work', 'Saved work'], ['settings', 'Settings']].map(([id, label]) => <Button key={id} size="sm" aria-pressed={tab === id} className="aria-pressed:ring-2" variant={tab === id ? 'default' : 'outline'} onClick={() => setTab(id)}>{label}</Button>)}</div>
      {tab === 'chat' && <>
        <div className="flex shrink-0 flex-wrap gap-1">{[...suggestions, ...(briefing ? [['Daily briefing', 'Give me a daily briefing.']] : [])].map(([label, prompt]) => <Button key={label} size="sm" variant="outline" onClick={() => send(prompt)}>{label}</Button>)}</div>
        <div className="flex min-h-24 flex-1 flex-col" aria-live="polite">{messages.length > 0 ? <AssistantMessages chat={{ messages }} voice={voice} /> : <p className="p-4 text-sm">What would you like to accomplish?</p>}</div>
        <form className="flex shrink-0 gap-2" onSubmit={e => { e.preventDefault(); send(input); }}><Input value={input} onChange={e => setInput(e.target.value)} aria-label="Practice message" placeholder="Ask My Assistant…" maxLength={500} /><Button type="submit" disabled={!input.trim()}>Send</Button></form>
      </>}
      {tab === 'work' && <div className="space-y-3 text-sm"><p><strong>Memory:</strong> {memory}</p><Button size="sm" disabled={remembered} onClick={() => remember(true)}>{remembered ? 'Sample memory added' : 'Add sample memory'}</Button><p><strong>Objective:</strong> {objective}</p><Button size="sm" onClick={() => { if (!tracked) track(true); else { setInput(`Help me resume: ${objective}`); setTab('chat'); } }}>{tracked ? 'Resume' : 'Add sample objective'}</Button></div>}
      {tab === 'settings' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={briefing} onChange={e => setBriefing(e.target.checked)} /> Turn on Daily briefing</label>}
    </>}
  </section>;
}