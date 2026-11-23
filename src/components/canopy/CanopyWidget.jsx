import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { actions, links, tabs } from '@/components/canopy/canopyCatalog';
import CanopyRecords from '@/components/canopy/CanopyRecords';
import CanopyClock from '@/components/canopy/CanopyClock';
import DailyToursCard from '@/components/tour/DailyToursCard';
import DockTools from '@/components/dock/DockTools';

export default function CanopyWidget({ id, user, profile, settings, commit, notifications, recent, open }) {
  if (id === 'Quick Notes') return <Scratch value={settings.scratch} save={scratch => commit({scratch})} open={open} />;
  if (['Time','World Clock','Stopwatch','Moon Phase'].includes(id)) return <CanopyClock {...{ id, settings, commit }} />;
  if (id === 'Today' || id === 'Active Projects') return <CanopyRecords {...{ id, user, profile, open }} />;
  if (id === 'Tours') return <DailyToursCard userId={user.id} embedded />;
  if (id === 'AI Assistant') return <div className="canopy-links"><DockTools type="AI Assistant" /><button onClick={() => open('my-assistant')}>Open My Assistant</button><button onClick={() => open('assistant')}>Open Concierge</button></div>;
  if (id === 'Notifications') return <Notifications {...{user, notifications, open}} />;
  if (id === 'Recent') return <div className="canopy-links">{recent.length ? recent.map(path => <button key={path} onClick={() => open(path)}>{tabs.find(([,route]) => route === path)?.[0] || path.split('/').filter(Boolean)[0]?.replace(/([a-z])([A-Z])/g, '$1 $2') || 'Home'}</button>) : <p>No recent destinations yet.</p>}</div>;
  return <div className={id === 'Actions' ? 'canopy-action-grid' : 'canopy-links'}>{(id === 'Actions' ? actions : links[id] || []).map(([label,to]) => <button key={label} onClick={() => open(to)}>{label}</button>)}</div>;
}

function Scratch({ value, save, open }) {
  const [draft,setDraft] = useState(value);
  useEffect(() => { setDraft(value); }, [value]);
  return <div className="canopy-scratch"><textarea aria-label="Quick notes scratchpad" placeholder="Jot something down…" maxLength={5000} value={draft} onChange={e => setDraft(e.target.value)} /><div className="canopy-tabs"><button disabled={draft === value} onClick={() => save(draft)}>Save note</button><button onClick={() => { if (draft !== value) save(draft); open('/Notes'); }}>Open Notes</button></div></div>;
}

function Notifications({ user, notifications, open }) {
  const qc = useQueryClient();
  const [expanded,setExpanded] = useState(null);
  const { isError, mutate } = useMutation({ mutationFn:id => base44.entities.Notification.update(id,{is_read:true}), onSuccess:() => qc.invalidateQueries({queryKey:['notifications',user.email]}) });
  const routes = { meeting:'/Meetings', booking:'/Meetings', mission:'/Missions', event:'/Events', post:'/CommunityFeed', message:'/Messages', project:'/Projects', follow:'/Profiles', ggg:'/CommandDeck', rank:'/Gamification', task_assigned:'/Projects' };
  return <div className="canopy-links">{notifications.length ? notifications.slice(0,8).map(n => {
    const target = /^\/(?![\\/])/.test(n.action_url || '') && !n.action_url.includes('\\') ? n.action_url : routes[n.type];
    return <div key={n.id}><button aria-expanded={expanded === n.id} onClick={() => { setExpanded(expanded === n.id ? null : n.id); if (!n.is_read) mutate(n.id); }}>{!n.is_read && '• '}{n.title}</button>{expanded === n.id && <div className="canopy-status"><p>{n.message}</p>{target && <button onClick={() => open(target)}>{n.action_label || 'Open'}</button>}</div>}</div>;
  }) : <p>No notifications yet.</p>}{isError && <p role="alert">Could not mark this notification as read.</p>}</div>;
}