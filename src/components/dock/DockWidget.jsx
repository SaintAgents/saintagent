import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CanopyClock from '@/components/canopy/CanopyClock';
import CanopyWidget from '@/components/canopy/CanopyWidget';
import DailyToursCard from '@/components/tour/DailyToursCard';
import NewsViewerModal from '@/components/news/NewsViewerModal';
import CommunityFeedCard from '@/components/community/CommunityFeedCard';
import DockTools from '@/components/dock/DockTools';
import DockOnlineMembers from '@/components/dock/DockOnlineMembers';
import DockSharing from '@/components/dock/DockSharing';
import DockLinkTree from '@/components/dock/DockLinkTree';
import WatchlistWidget from '@/components/watch/WatchlistWidget';
import { links, safePath } from '@/components/dock/dockCatalog';

export default function DockWidget({ card, user, save, navigate, shortcuts, recent, openModal, visible, panelOpen }) {
  const {type, settings} = card;
  const {data: news, isError} = useQuery({queryKey:['dock-news'], queryFn:async () => (await base44.entities.NewsArticle.filter({is_published:true}, {sort:'-published_date',limit:8})).items, enabled:visible && type === 'News'});
  const { data:notifications = [] } = useQuery({queryKey:['notifications',user.email], queryFn:() => base44.entities.Notification.filter({user_id:user.email}, '-created_date', 30), enabled:visible && type === 'Notifications', staleTime:300000});
  const [article, setArticle] = useState(null);
  if (type === 'News') return <><div className="dock-links">{isError ? <p>News could not be loaded.</p> : !news ? <p>Loading headlines…</p> : news.length ? news.map(a => <button key={a.id} onClick={() => setArticle(a)}>{a.title}</button>) : <p>No published headlines.</p>}<Link to="/News">All news</Link></div>{article && <NewsViewerModal article={article} open onClose={() => setArticle(null)} />}</>;
  if (['Notifications','Recent'].includes(type)) return <CanopyWidget id={type} {...{user, notifications, recent}} open={navigate} />;
  if (type === 'World Clock') return <CanopyClock id={type} settings={settings} commit={save} />;
  if (type === 'Tours') return <DailyToursCard userId={user.id} embedded />;
  if (type === 'Community Feed') return <CommunityFeedCard maxHeight="22rem" />;
  if (type === 'Contact Card' || type === 'Invites') return <DockSharing {...{type,user,visible}} />;
  if (type === 'LinkTree') return <DockLinkTree {...{user,visible}} />;
  if (type === 'Watchlist') return <WatchlistWidget {...{user, visible}} />;
  if (type === 'Who Is Online') return <DockOnlineMembers visible={visible && panelOpen} userId={user.id} />;
  if (type === 'pinned_item') return <div className="dock-links">{safePath(settings.path) ? <a href={settings.path}>{settings.title}</a> : <p>{settings.title}</p>}{settings.subtitle && <p>{settings.subtitle}</p>}</div>;
  if (type === 'Quick Notes') return <Scratch value={settings.note || ''} save={note => save({note})} />;
  if (type === 'Quick Access' || type === 'Quick Links') return <div className="dock-links">{(type === 'Quick Access' ? shortcuts : Object.keys(links)).map(label => <Link key={label} to={links[label]}>{label}</Link>)}{type === 'Quick Access' && <button onClick={() => openModal('shortcuts')}>Edit Quick Access</button>}</div>;
  if (type === 'Pinned Item') return settings.path ? <Link to={settings.path}>{settings.title || settings.path}</Link> : <form onSubmit={e => { e.preventDefault(); const path = new FormData(e.currentTarget).get('path').trim(); if (safePath(path)) save({path, title:path}); else { e.currentTarget.elements.path.setCustomValidity('Enter a SaintAgent path beginning with one slash.'); e.currentTarget.elements.path.reportValidity(); } }}><label>SaintAgent path <input name="path" required maxLength={500} onInput={e => e.currentTarget.setCustomValidity('')} placeholder="/Projects" /></label><button>Pin</button></form>;
  return <DockTools {...{type, settings, save, navigate, visible}} />;
}
function Scratch({value, save}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return <form className="grid gap-2" onSubmit={e => {e.preventDefault(); save(draft);}}><textarea rows={4} aria-label="Quick notes" value={draft} maxLength={5000} onChange={e => setDraft(e.target.value)} placeholder="Jot something down…" /><button disabled={draft === value}>Save note</button></form>;
}