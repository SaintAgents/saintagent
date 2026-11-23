import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import DockDirectory from '@/components/dock/DockDirectory';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';

export default function DockCompose({user, visible, recipient:initial, parent, inline = false, onSent, onCancel}) {
  const [recipient,setRecipient] = useState(initial), [body,setBody] = useState(''), [busy,setBusy] = useState(false), [error,setError] = useState('');
  const preview = isTourPreview();
  async function send(event) {
    event.preventDefault();
    if (preview || busy || !recipient || !body.trim()) return;
    setBusy(true); setError('');
    try {
      const direct = [user.email,recipient.id].sort().join('_');
      const base = {from_user_id:user.email,from_name:user.full_name || user.email,to_name:recipient.name,content:body.trim(),...(parent && {parent_message_id:parent})};
      if (recipient.group) {
        const [group] = await base44.entities.Conversation.filter({id:recipient.conversation,participant_ids:user.email,type:'group'},'-updated_date',1);
        if (!group) throw new Error('You no longer have access to this group.');
        await base44.entities.Message.bulkCreate([...new Set(group.participant_ids)].map(id => ({...base,conversation_id:group.id,to_user_id:id,is_read:id === user.email})));
        await base44.entities.Conversation.update(group.id,{last_message:base.content,last_message_at:new Date().toISOString()}).catch(() => {});
      } else {
        const [profile] = await base44.entities.UserProfile.filter({user_id:recipient.id},'-updated_date',1);
        const policy = profile?.dm_policy;
        if (policy === 'none') {setError('This member is not accepting direct messages.');return;}
        if (policy === 'followers' || policy === 'mutual') {
          const follows = {follower_id:user.email,following_id:recipient.id};
          const back = {follower_id:recipient.id,following_id:user.email};
          const hasFollow = (await base44.entities.Follow.filter(follows,'-created_date',1)).length;
          if (!hasFollow || (policy === 'mutual' && !(await base44.entities.Follow.filter(back,'-created_date',1)).length)) {setError('This member limits who can send them direct messages.');return;}
        }
        const conversation = recipient.conversation || (await base44.entities.Conversation.filter({conversation_key:direct,participant_ids:user.email},'-updated_date',1))[0]?.id || direct;
        await base44.entities.Message.create({...base,conversation_id:conversation,to_user_id:recipient.id});
      }
      setBody(''); onSent(recipient);
    } catch { setError('Could not send the message. Try again.'); }
    finally { setBusy(false); }
  }
  if (!recipient) return <div className="grid gap-2"><strong>Choose a recipient</strong><DockDirectory user={user} visible={visible} action={(row,name) => <button disabled={!row.user_id} onClick={() => setRecipient({id:row.user_id,name})}>Select</button>} /><button onClick={onCancel}>Cancel</button></div>;
  return <form className="grid gap-2" onSubmit={send}>
    {!inline && <strong>To: {recipient.name}</strong>}
    <textarea aria-label="Message" placeholder="Write a message…" required maxLength={4000} rows={3} value={body} onChange={e => setBody(e.target.value)} />
    {error && <p role="alert">{error}</p>}
    <div className="flex gap-2"><button disabled={busy || preview || !body.trim()}>{busy ? 'Sending…' : 'Send'}</button>{!inline && <button type="button" disabled={busy} onClick={onCancel}>Cancel</button>}</div>
  </form>;
}