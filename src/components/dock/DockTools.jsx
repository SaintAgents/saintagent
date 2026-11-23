import React, { useEffect, useState } from 'react';
import DockAssistantChat from '@/components/dock/DockAssistantChat';
import SaintBrowser from '@/components/browser/SaintBrowser';
import AdvancedSearchModal from '@/components/search/AdvancedSearchModal';
import { links } from '@/components/dock/dockCatalog';
import TimeTool from '@/components/dock/TimeTool';
import DockInspiration from '@/components/dock/DockInspiration';
const paths = {profile:['/Profile','user_id'], listing:['/ListingDetail','id'], mission:['/MissionDetail','id'], circle:['/Circles','id'], event:['/EventDetail','id'], post:['/CommunityFeed','id']};
export default function DockTools({type, settings, save, navigate, visible}) {
  const [open, setOpen] = useState(false), [text, setText] = useState('');
  if (type === 'AI Assistant') return <DockAssistantChat history={settings.assistantHistory} onSave={assistantHistory => save({ assistantHistory })} />;
  if (type === 'Music Player') return <Music compact={settings.compact} />;
  if (type === 'Stopwatch' || type === 'Moon Phase') return <TimeTool type={type} visible={visible} />;
  if (type === 'Inspiration') return <DockInspiration visible={visible} />;
  if (type === 'InSite Browser') return <><button onClick={() => setOpen(true)}>Open SaintAgent Browser</button>{open && <SaintBrowser open onClose={() => setOpen(false)} />}</>;
  if (type === 'Global Search') return <div className="grid gap-2"><input aria-label="Find a page" placeholder="Find a page…" value={text} onChange={e => setText(e.target.value)} />{text.trim() && Object.entries(links).filter(([name]) => name.toLowerCase().includes(text.trim().toLowerCase())).map(([name,path]) => <button key={name} onClick={() => navigate(path)}>{name}</button>)}<button onClick={() => setOpen(true)}>Search platform records</button>{open && <AdvancedSearchModal open initialQuery={text} onClose={() => setOpen(false)} onSelect={(kind,item) => {
    if (kind === 'project') document.dispatchEvent(new CustomEvent('openProjectDetail', {detail:{project:item}}));
    else if (paths[kind]) navigate(`${paths[kind][0]}?id=${encodeURIComponent(item[paths[kind][1]])}`);
  }} />}</div>;
  return null;
}

function Music({compact}) {
  const [url,setUrl] = useState('');
  useEffect(() => () => {if (url) URL.revokeObjectURL(url);}, [url]);
  return <div className="grid gap-2">{(!compact || !url) && <label>Choose audio <input aria-label="Choose audio" type="file" accept="audio/*" onChange={e => { const file=e.target.files?.[0]; if(file) setUrl(URL.createObjectURL(file)); }} /></label>}{url && <audio className="w-full" controls src={url} />}</div>;
}