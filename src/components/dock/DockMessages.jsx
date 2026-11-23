import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DockCompose from '@/components/dock/DockCompose';
import { mailboxRows, markDockRead, messagePeer, useDockMail, useDockMailUpdates } from '@/components/dock/useDockMail';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';

export default function DockMessages({user, visible}) {
  const [peer,setPeer] = useState(null), [creating,setCreating] = useState(false), [error,setError] = useState('');
  const email = user.email, preview = isTourPreview();
  const active = visible && !preview;
  const refresh = useDockMailUpdates(email,active);
  const recent = useDockMail(user,active && !peer && !creating,'recent');
  const thread = useDockMail(user,active && !!peer,'thread','',peer?.id,peer?.conversation,peer?.group);
  const groups = useQuery({queryKey:['dock-message-groups',email],enabled:active,queryFn:() => base44.entities.Conversation.filter({participant_ids:email,type:'group'},'-last_message_at',40)});
  const groupMap = new Map((groups.data || []).map(group => [group.id,group]));
  const conversations = new Map();
  mailboxRows(recent).forEach(msg => {
    const group = groupMap.get(msg.conversation_id), item = group ? {id:group.id,name:group.name || 'Group chat',conversation:group.id,group:true} : messagePeer(msg,email);
    if (item.id === email) return;
    const existing = conversations.get(item.id);
    const unread = !msg.is_read && msg.to_user_id === email && msg.from_user_id !== email;
    if (!existing) conversations.set(item.id,{...item,unread});
    else if (unread) existing.unread = true;
  });
  for (const group of groupMap.values()) if (!conversations.has(group.id)) conversations.set(group.id,{id:group.id,name:group.name || 'Group chat',conversation:group.id,group:true});
  useEffect(() => {
    if (!active || !peer || !mailboxRows(thread).some(msg => msg.to_user_id === email && msg.from_user_id !== email && !msg.is_read)) return;
    const filter = peer.group ? {conversation_id:peer.conversation,from_user_id:{$ne:email}} : {from_user_id:peer.id,...(peer.conversation && {conversation_id:peer.conversation})};
    markDockRead(email,filter).then(refresh).catch(() => setError('Could not mark this chat as read.'));
  }, [active,peer,thread.data,email]);
  if (preview) return <p>Open Dock Deck outside the tour to use Messages.</p>;
  const query = peer ? thread : recent;
  return <div className="grid gap-2"><div className="flex flex-wrap gap-2"><Link to="/Messages">Full Messages</Link>{!peer && !creating && <button onClick={() => setCreating(true)}>New chat</button>}{peer && <button onClick={() => {setPeer(null);setError('');}}>Back to chats</button>}</div>
    {error && <p role="alert">{error}</p>}
    {creating ? <DockCompose user={user} visible={active} onCancel={() => setCreating(false)} onSent={recipient => {setCreating(false);setPeer(recipient);refresh();}} /> : <>
      {query.isPending && <p role="status">Loading chats…</p>}{(query.isError || groups.isError) && <p role="alert">Could not load all chats. <button onClick={() => {query.refetch();groups.refetch();}}>Retry</button></p>}
      {peer ? <><strong>{peer.name}</strong>{query.hasNextPage && <button disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Older messages</button>}<ol className="grid max-h-64 gap-1 overflow-auto">{mailboxRows(thread).slice().reverse().map(msg => <li key={msg.id} className="rounded border px-2 py-1"><strong>{msg.from_user_id === email ? 'You' : msg.from_name || peer.name}</strong><time className="block text-xs">{new Date(msg.created_date).toLocaleString()}</time><p className="whitespace-pre-wrap break-words">{msg.content || 'Attachment — open Full Messages to view'}</p></li>)}</ol><DockCompose key={peer.id} user={user} visible={active} recipient={peer} inline onSent={refresh} /></> : <>{query.isSuccess && !conversations.size && <p>No conversations yet.</p>}<ul className="grid gap-1">{[...conversations.values()].map(item => <li key={item.id}><button onClick={() => {setPeer(item);setError('');}}>{item.unread ? '● ' : ''}{item.name}</button></li>)}</ul>{query.hasNextPage && <button disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Load older chats</button>}</>}
    </>}
  </div>;
}