import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import SaintBrowser from '@/components/browser/SaintBrowser';
import AdvancedSearchModal from '@/components/search/AdvancedSearchModal';
import { links } from '@/components/dock/dockCatalog';

const prompts = ['What is one small action you can take today?', 'Who could help you see this differently?', 'What would you try if the first step were easy?'];
const paths = {profile:['/Profile','user_id'], listing:['/ListingDetail','id'], mission:['/MissionDetail','id'], circle:['/Circles','id'], event:['/EventDetail','id'], post:['/CommunityFeed','id']};
export default function DockTools({type, settings, navigate, visible}) {
  const [open, setOpen] = useState(false), [text, setText] = useState(''), [index,setIndex] = useState(0);
  if (type === 'AI Assistant') return <Chat />;
  if (type === 'Music Player') return <Music compact={settings.compact} />;
  if (type === 'Stopwatch' || type === 'Moon Phase') return <TimeTool type={type} visible={visible} />;
  if (type === 'Inspiration') return <div className="grid gap-2"><p>{prompts[index]}</p><button onClick={() => setIndex((index+1)%prompts.length)}>Next reflection</button></div>;
  if (type === 'InSite Browser') return <><button onClick={() => setOpen(true)}>Open SaintAgent Browser</button>{open && <SaintBrowser open onClose={() => setOpen(false)} />}</>;
  if (type === 'Global Search') return <div className="grid gap-2"><input aria-label="Find a page" placeholder="Find a page…" value={text} onChange={e => setText(e.target.value)} />{text.trim() && Object.entries(links).filter(([name]) => name.toLowerCase().includes(text.trim().toLowerCase())).map(([name,path]) => <button key={name} onClick={() => navigate(path)}>{name}</button>)}<button onClick={() => setOpen(true)}>Search platform records</button>{open && <AdvancedSearchModal open initialQuery={text} onClose={() => setOpen(false)} onSelect={(kind,item) => {
    if (kind === 'project') document.dispatchEvent(new CustomEvent('openProjectDetail', {detail:{project:item}}));
    else if (paths[kind]) navigate(`${paths[kind][0]}?id=${encodeURIComponent(item[paths[kind][1]])}`);
  }} />}</div>;
  return null;
}
function Chat() {
  const [question,setQuestion] = useState(''), [messages,setMessages] = useState([]), [busy,setBusy] = useState(false), [error,setError] = useState(false);
  async function send(e) {
    e.preventDefault(); if (!question.trim() || busy) return;
    const current = [...messages, question.trim()]; setBusy(true); setError(false);
    try { const answer = await base44.integrations.Core.InvokeLLM({prompt:`You are a lightweight chat helper. Answer concisely. You have no access to private app records or tools. Conversation (alternating user and assistant): ${JSON.stringify(current.slice(-9))}`}); setMessages([...current,answer]); setQuestion(''); }
    catch {setError(true);} finally {setBusy(false);}
  }
  return <form className="grid gap-2" onSubmit={send}>{messages.map((m,i) => <p className="whitespace-pre-wrap break-words" key={i}><strong>{i%2 ? 'Assistant: ' : 'You: '}</strong>{m}</p>)}{error && <p role="alert">Could not get a reply. Try again.</p>}<input disabled={busy} aria-label="Ask the assistant" maxLength={2000} value={question} onChange={e => setQuestion(e.target.value)} /><button disabled={busy || !question.trim()}>{busy ? 'Thinking…' : 'Send'}</button></form>;
}
function Music({compact}) {
  const [url,setUrl] = useState('');
  useEffect(() => () => {if (url) URL.revokeObjectURL(url);}, [url]);
  return <div className="grid gap-2">{(!compact || !url) && <label>Choose audio <input aria-label="Choose audio" type="file" accept="audio/*" onChange={e => { const file=e.target.files?.[0]; if(file) setUrl(URL.createObjectURL(file)); }} /></label>}{url && <audio className="w-full" controls src={url} />}</div>;
}
function TimeTool({type,visible}) {
  const [start,setStart] = useState(null), [total,setTotal] = useState(0), [now,setNow] = useState(Date.now), [laps,setLaps] = useState([]);
  useEffect(() => { if (!visible || (type === 'Stopwatch' && !start)) return; const i = setInterval(() => setNow(Date.now()), type === 'Stopwatch' ? 100 : 60000); return () => clearInterval(i); }, [start,type,visible]);
  if (type === 'Moon Phase') { const days=29.530588, fraction=(((Date.now()-Date.UTC(2000,0,6,18,14))/86400000/days)%1+1)%1; const date=f=>new Date(Date.now()+((f-fraction+1)%1)*days*86400000).toLocaleDateString(); return <p>Approx. {Math.round((1-Math.cos(2*Math.PI*fraction))*50)}% illuminated · {Math.floor(fraction*days)} days old<br />Next full moon: {date(.5)}<br />Next new moon: {date(0)}</p>; }
  const elapsed = total + (start ? Math.max(0,now-start) : 0), format = ms => `${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${Math.floor(ms/100)%10}`;
  return <div className="grid gap-2"><strong>{format(elapsed)}</strong><div className="flex flex-wrap gap-1"><button onClick={() => { const t=Date.now(); if(start) setTotal(total+t-start); setNow(t); setStart(start ? null : t); }}>{start?'Pause':'Start'}</button><button disabled={!start} onClick={() => setLaps([...laps, total+Date.now()-start])}>Lap</button><button onClick={() => {setStart(null);setTotal(0);setLaps([]);}}>Reset</button></div>{laps.length>0 && <ol>{laps.map((lap,i) => <li key={i}>Lap {i+1}: {format(lap)}</li>)}</ol>}</div>;
}