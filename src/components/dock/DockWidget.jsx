import React from 'react';
import QuickNotes from '@/components/dock/QuickNotes';
import DockNews from '@/components/dock/DockNews';
import DockMarketTicker from '@/components/dock/DockMarketTicker';
import WorldClocks from '@/components/dock/WorldClocks';
import { Link } from 'react-router-dom';
import DockNotifications from '@/components/dock/DockNotifications';
import DailyToursCard from '@/components/tour/DailyToursCard';
import CommunityFeedCard from '@/components/community/CommunityFeedCard';
import DockTools from '@/components/dock/DockTools';
import DockDirectory from '@/components/dock/DockDirectory';
import DockQuickCall from '@/components/dock/DockQuickCall';
import DockConferenceRooms from '@/components/dock/DockConferenceRooms';
import DockAstro from '@/components/dock/DockAstro';
import DockMacro from '@/components/dock/DockMacro';
import DockInbox from '@/components/dock/DockInbox';
import DockMessages from '@/components/dock/DockMessages';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import DockOnlineMembers from '@/components/dock/DockOnlineMembers';
import DockHistory from '@/components/dock/DockHistory';
import DockSharing from '@/components/dock/DockSharing';
import DockLinkTree from '@/components/dock/DockLinkTree';
import WatchlistWidget from '@/components/watch/WatchlistWidget';
import { links, safePath } from '@/components/dock/dockCatalog';

const addedWidgets = { Astro:DockAstro, Members:DockDirectory, 'Quick Call':DockQuickCall, 'Conference Rooms':DockConferenceRooms, Macro:DockMacro, Inbox:DockInbox, Messages:DockMessages };

export default function DockWidget({ card, user, save, navigate, shortcuts, history, openModal, visible, panelOpen }) {
  const {type, settings} = card;
  const active = visible && panelOpen;
  const AddedWidget = addedWidgets[type];
  if (AddedWidget) return <div className="dock-added-widget">{isTourPreview() ? <p>Open the Dock outside the tour to use this widget.</p> : <AddedWidget {...{user,settings,save}} visible={active} />}</div>;
  if (type === 'Gold Spot Ticker' || type === 'Crypto Ticker') return <DockMarketTicker type={type} visible={active && !isTourPreview()} />;
  if (type === 'News') return <DockNews visible={visible} />;
  if (type === 'Recent') return <DockHistory history={history} />;
  if (type === 'Notifications') return <DockNotifications {...{user, visible, settings, save}} open={navigate} />;
  if (type === 'World Clock') return <WorldClocks settings={settings} commit={save} visible={visible} />;
  if (type === 'Tours') return <DailyToursCard userId={user.id} embedded />;
  if (type === 'Community Feed') return <CommunityFeedCard maxHeight="22rem" postsLimit={settings.postsLimit || 5} onShowMore={postsLimit => save({ postsLimit })} />;
  if (type === 'Contact Card' || type === 'Invites') return <DockSharing {...{type,user,visible}} />;
  if (type === 'LinkTree') return <DockLinkTree {...{user,visible}} />;
  if (type === 'Watchlist') return <WatchlistWidget {...{user, visible}} />;
  if (type === 'Who Is Online') return <DockOnlineMembers visible={visible && panelOpen} userId={user.id} />;
  if (type === 'pinned_item') return <div className="dock-links">{safePath(settings.path) ? <a href={settings.path}>{settings.title}</a> : <p>{settings.title}</p>}{settings.subtitle && <p>{settings.subtitle}</p>}</div>;
  if (type === 'Quick Notes') return <QuickNotes value={settings.note} save={note => save({note})} />;
  if (type === 'Quick Access' || type === 'Quick Links') return <div className="dock-links">{(type === 'Quick Access' ? shortcuts : Object.keys(links)).map(label => <Link key={label} to={links[label]}>{label}</Link>)}{type === 'Quick Access' && <button onClick={() => openModal('shortcuts')}>Edit Quick Access</button>}</div>;
  if (type === 'Pinned Item') return settings.path ? <Link to={settings.path}>{settings.title || settings.path}</Link> : <form onSubmit={e => { e.preventDefault(); const path = new FormData(e.currentTarget).get('path').trim(); if (safePath(path)) save({path, title:path}); else { e.currentTarget.elements.path.setCustomValidity('Enter a SaintAgent path beginning with one slash.'); e.currentTarget.elements.path.reportValidity(); } }}><label>SaintAgent path <input name="path" required maxLength={500} onInput={e => e.currentTarget.setCustomValidity('')} placeholder="/Projects" /></label><button>Pin</button></form>;
  return <DockTools {...{type, settings, save, navigate, visible}} />;
}