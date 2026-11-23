import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DockCompose from '@/components/dock/DockCompose';
import { mailBox, mailboxRows, markDockRead, messagePeer, useDockMail, useDockMailUpdates } from '@/components/dock/useDockMail';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';

export default function DockInbox({user, visible}) {
  const email = user.email, preview = isTourPreview();
  const [tab,setTab] = useState('inbox'), [search,setSearch] = useState(''), [detail,setDetail] = useState(null), [compose,setCompose] = useState(false), [busy,setBusy] = useState(false), [notice,setNotice] = useState('');
  const query = useDockMail(user,visible && !preview,tab,search), refresh = useDockMailUpdates(email,visible && !preview);
  const unread = useQuery({queryKey:['dock-mail',email,'unread'],enabled:visible && !preview,queryFn:() => base44.entities.Message.count({...mailBox(email,false),is_read:{$ne:true}})});
  const rows = mailboxRows(query);
  async function action(fn) {setBusy(true);setNotice('');try {await fn();await refresh();} catch {setNotice('Could not update your mailbox. Try again.');} finally {setBusy(false);}}
  function remove(all, msg) {
    if (!window.confirm(all ? `Remove all messages from your ${tab === 'sent' ? 'Sent' : 'Inbox'} view, including those outside this search?` : 'Remove this message from your view?')) return;
    action(async () => {
      const filter = {...mailBox(email,tab === 'sent'),...(!all && {id:msg.id})};
      let batch;
      do { batch = await base44.entities.Message.updateMany(filter,{$addToSet:{deleted_for_user_ids:email}}); } while (all && batch.has_more);
      setDetail(null);setNotice('Removed from your mailbox.');
    });
  }
  const group = useQuery({queryKey:['dock-mail',email,'group',detail?.conversation_id],enabled:visible && !!detail?.conversation_id,queryFn:async () => (await base44.entities.Conversation.filter({id:detail.conversation_id,participant_ids:email,type:'group'},'-updated_date',1))[0] || null});
  const peer = detail && (group.data ? {id:group.data.id,name:group.data.name || 'Group chat',conversation:group.data.id,group:true} : messagePeer(detail,email));
  const direct = peer && peer.id !== email && (!detail.conversation_id || group.isSuccess);
  return <div className="grid gap-2">
    <div className="flex flex-wrap gap-1"><Link to="/Messages">Full Messages</Link><button disabled={busy || compose} onClick={() => {setDetail(null);setCompose(true);}}>Compose</button><button disabled={query.isFetching} onClick={refresh}>Refresh</button></div>
    {notice && <p role="status">{notice}</p>}
    {compose ? <DockCompose user={user} visible={visible} recipient={compose === true ? null : compose} parent={detail?.id} onCancel={() => setCompose(false)} onSent={() => {setCompose(false);setNotice('Message sent.');refresh();}} /> : detail ? <><button onClick={() => setDetail(null)}>Back to {tab === 'sent' ? 'Sent' : 'Inbox'}</button><strong>{peer?.name}</strong><time className="text-xs">{new Date(detail.created_date).toLocaleString()}</time><p className="whitespace-pre-wrap break-words">{detail.content || (detail.message_type !== 'text' ? 'Open Full Messages to view the attachment.' : '')}</p><div className="flex gap-2">{direct && <button onClick={() => setCompose(peer)}>Reply</button>}<button disabled={busy} onClick={() => remove(false,detail)}>Remove</button></div></> : <>
      <div className="flex flex-wrap gap-1">{['inbox','sent'].map(value => <button key={value} aria-pressed={tab === value} disabled={busy} onClick={() => setTab(value)}>{value === 'inbox' ? `Inbox${unread.data ? ` (${unread.data} unread)` : ''}` : 'Sent'}</button>)}<button disabled={busy || query.isPending} onClick={() => remove(true)}>Remove all</button></div>
      <form className="flex flex-wrap gap-1" onSubmit={e => {e.preventDefault();setSearch(new FormData(e.currentTarget).get('search').trim());}}><input name="search" className="min-w-0 flex-1" aria-label="Search messages" placeholder="Search messages" maxLength={80} /><button>Search</button></form>
      {query.isPending && <p role="status">Loading messages…</p>}{query.isError && <p role="alert">Could not load messages. Use Refresh to retry.</p>}{query.isSuccess && !rows.length && <p>No matching messages.</p>}
      <ul>{rows.map(msg => <li key={msg.id} className="grid border-b py-1"><button className="text-left min-w-0" disabled={busy} onClick={() => {setDetail(msg);if (tab === 'inbox' && !msg.is_read) action(() => markDockRead(email,{id:msg.id}));}}><strong>{tab === 'inbox' && !msg.is_read ? '• ' : ''}{messagePeer(msg,email).name}</strong><span className="block truncate">{msg.content || 'Attachment'}</span></button></li>)}</ul>
      {query.hasNextPage && <button disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Load more</button>}
    </>}
  </div>;
}