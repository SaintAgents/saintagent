import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Compass, HelpCircle, Mic, MicOff, Sparkles, Star, VolumeX } from 'lucide-react';
import RightSideTabs from '@/components/hud/RightSideTabs';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AssistantMessages from '@/components/myassistant/AssistantMessages';
import AssistantSavedWork from '@/components/myassistant/AssistantSavedWork';
import AssistantSettings from '@/components/myassistant/AssistantSettings';
import AssistantWindow from '@/components/myassistant/AssistantWindow';
import useAssistantConversation from '@/components/myassistant/useAssistantConversation';
import useAssistantVoice from '@/components/myassistant/useAssistantVoice';

const defaults = { name: 'My Assistant', icon: 'sparkles', accent: 'primary', greeting: '', voice: '', autoOpen: false, briefing: false };
const icons = { sparkles: Sparkles, compass: Compass, star: Star };
const accents = { primary: 'border-t-primary', secondary: 'border-t-secondary', accent: 'border-t-accent' };
const routes = { 'command deck': '/CommandDeck', projects: '/Projects', missions: '/Missions', circles: '/Circles', marketplace: '/Marketplace', messages: '/Messages', settings: '/Settings', 'daily ops': '/DailyOps', meetings: '/Meetings', notes: '/Notes', 'observation deck': '/ObservationDeck' };
const autoOpened = new Set();

export default function MyAssistant({ userId, currentPage, supportOnly = false, previewOnly = false }) {
  const key = `sa-my-assistant:${userId}:preferences`;
  const [settings, setSettings] = useState(() => { try { return { ...defaults, ...JSON.parse(localStorage.getItem(key)) }; } catch { return defaults; } });
  const [open, setOpen] = useState(false);
  const [activated, setActivated] = useState(false);
  const [tab, setTab] = useState(supportOnly ? 'support' : 'chat');
  const [supportModal, setSupportModal] = useState(false);
  const showSupport = useCallback(() => { setTab('support'); setOpen(true); }, []);
  const [initialWork, setInitialWork] = useState('memory');
  const [input, setInput] = useState('');
  const field = useRef(null);
  const launcher = useRef(null);
  const focusInput = useRef(false);
  const navigate = useNavigate();
  const chat = useAssistantConversation(userId, activated);
  const voice = useAssistantVoice(open && tab === 'chat', settings.voice, chat.messages);
  const count = useQuery({ queryKey: ['my-assistant-counts', userId], enabled: open && !supportOnly && tab !== 'support', staleTime: 30000, queryFn: async () => {
    const { rows } = await base44.entities.PersonalAssistantItem.aggregate({ query: { created_by_id: userId, status: 'active' }, groupBy: 'kind' });
    return Object.fromEntries(rows.map(row => [row.kind, row.count]));
  } });
  function show(focus = true) { focusInput.current = focus; setActivated(true); setOpen(true); setTab('chat'); }
  function close() { voice.setVoiceTurn(null); setOpen(false); requestAnimationFrame(() => launcher.current?.focus()); }
  useEffect(() => {
    if (!supportOnly && !autoOpened.has(userId)) { autoOpened.add(userId); if (settings.autoOpen) show(false); }
  }, [userId, supportOnly]);
  useEffect(() => { if (open && tab === 'chat' && focusInput.current) { focusInput.current = false; field.current?.focus(); } }, [open, tab]);
  useEffect(() => {
    if (supportOnly) return;
    const summon = () => show();
    const keyboard = e => { if (!e.repeat && !e.defaultPrevented && e.altKey && e.shiftKey && e.code === 'KeyA') { e.preventDefault(); open && tab === 'chat' ? close() : show(); } };
    document.addEventListener('openMyAssistant', summon);
    document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('openMyAssistant', summon); document.removeEventListener('keydown', keyboard); };
  }, [open, supportOnly, tab]);
  function saveSettings(patch) {
    const next = { ...settings, ...patch }; setSettings(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  }
  async function send(raw, spoken = false) {
    const text = raw.trim();
    if (!text || chat.sending || chat.loading) return;
    const match = text.match(/^(?:please )?(?:open|go to|navigate to|take me to) (?:the )?(.+?)[.!?]?$/i);
    const target = match?.[1]?.toLowerCase();
    if (target && Object.hasOwn(routes, target)) { setInput(''); close(); navigate(routes[target]); return; }
    if (spoken) voice.setVoiceTurn(chat.messages.length);
    else voice.setVoiceTurn(null);
    setInput('');
    if (!await chat.send(text, currentPage)) { setInput(previous => previous || text); voice.setVoiceTurn(null); }
  }
  const Icon = supportOnly ? HelpCircle : icons[settings.icon] || Sparkles;
  const title = supportOnly ? 'Saint Support' : settings.name.trim() || defaults.name;
  return <>
    {!open && <Button ref={launcher} data-deck-tour="help" onClick={() => supportOnly || tab === 'support' ? showSupport() : show()} title={supportOnly ? 'Open Saint Support' : 'Open My Assistant (Alt+Shift+A)'} className={`fixed bottom-24 right-4 z-[170] gap-2 shadow-lg md:bottom-6 md:right-16 ${supportOnly ? 'hidden md:inline-flex' : ''}`} aria-keyshortcuts={supportOnly ? undefined : 'Alt+Shift+A'} aria-label={`Open ${title}`} aria-controls="sa-assistant-panel"><Icon />{title}</Button>}
    <AssistantWindow title={title} icon={Icon} accent={accents[settings.accent] || accents.primary} open={open && !supportModal} onClose={close}>
      {!supportOnly && <div className="flex shrink-0 flex-wrap items-center gap-1 border-b px-3 py-2">
        {[['chat', 'Chat'], ['support', 'Saint Support'], ['work', count.isSuccess ? `Saved work · ${count.data.memory || 0} memories` : 'Saved work'], ['settings', 'Settings']].map(([id, label]) => <Button size="sm" variant={tab === id ? 'default' : 'ghost'} className="aria-pressed:ring-1 aria-pressed:ring-inset aria-pressed:ring-current" aria-pressed={tab === id} key={id} onClick={() => { setInitialWork('memory'); if (id === 'chat') setActivated(true); if (id === 'support') voice.stop(); setTab(id); }}>{label}</Button>)}
        {tab === 'chat' && <Button size="sm" variant="ghost" disabled={chat.sending || chat.loading} onClick={() => { if (window.confirm('Start a new conversation? This stops resuming the current chat; it does not delete saved work or erase chat history.')) { chat.reset(); setInput(''); voice.setVoiceTurn(null); voice.stop(); } }}>New chat</Button>}
      </div>}
      <RightSideTabs visible={open && tab === 'support' && !supportModal} panelOpen={open} onOpen={showSupport} onClose={close} onModalChange={setSupportModal} previewOnly={previewOnly} />
      {open && tab !== 'support' && (tab === 'chat' ? <>
        {settings.briefing && <Button className="mx-3 mt-2 self-start" size="sm" disabled={chat.loading || chat.sending} onClick={() => send('Give me a daily briefing on my active objectives, projects and missions, with the next three priorities and any blockers visible in my records.')}>Daily briefing</Button>}
        {!!count.data?.objective && <Button className="mx-3 mt-2 self-start" size="sm" onClick={() => { setInitialWork('objective'); setTab('work'); }}>Resume work · {count.data.objective} active</Button>}
        <AssistantMessages chat={chat} greeting={settings.greeting} onPrompt={send} voice={voice} onSupport={() => { voice.stop(); showSupport(); }} />
        {voice.voiceError && <p role="alert" className="px-3 text-xs">{voice.voiceError}</p>}
        <form className="flex shrink-0 items-center gap-1 border-t p-2" onSubmit={e => { e.preventDefault(); send(input); }}>
          <Input ref={field} aria-label="Message My Assistant" placeholder="Ask or say what you want to do…" value={input} maxLength={6000} onChange={e => setInput(e.target.value)} />
          {voice.canListen && <Button type="button" size="icon" aria-pressed={voice.listening} aria-label={voice.listening ? 'Stop listening' : 'Speak to My Assistant'} onClick={() => voice.listen(text => { if (text.trim()) send(text, true); })} disabled={chat.sending || chat.loading}>{voice.listening ? <MicOff /> : <Mic />}</Button>}
          {voice.canSpeak && <Button size="icon" type="button" aria-label="Stop reading aloud" onClick={voice.stop}><VolumeX /></Button>}
          <Button type="submit" size="sm" disabled={!input.trim() || chat.sending || chat.loading || !!chat.retry}>Send</Button>
        </form>
      </> : <div className="min-h-0 flex-1 overflow-auto">{tab === 'work' ? <AssistantSavedWork userId={userId} initialKind={initialWork} onResume={text => { setInput(`Help me resume this objective: ${text}`); focusInput.current = true; setTab('chat'); }} /> : <AssistantSettings settings={settings} onChange={saveSettings} voices={voice.voices} />}</div>)}
    </AssistantWindow>
  </>;
}