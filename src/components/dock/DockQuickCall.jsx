import React, { useState } from 'react';
import DockDirectory from '@/components/dock/DockDirectory';
import DockConferenceRooms from '@/components/dock/DockConferenceRooms';
import { openMember } from '@/components/dock/useDockDirectory';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function DockQuickCall({user, visible, settings, save}) {
  const [tab,setTab] = useState('members'), [invite,setInvite] = useState(null);
  const favorites = settings.callFavorites || [];
  const contactIds = favorites.filter(f => f.contact).map(f => f.id);
  const contacts = useQuery({queryKey:['dock-call-contacts',user.id,contactIds],enabled:visible && !!contactIds.length,queryFn:() => base44.entities.Contact.filter({owner_id:user.email,id:{$in:contactIds}},'name',30)});
  return <div className="grid gap-2">
    {invite && <div className="grid gap-2 border-b pb-2"><strong>Call {invite.name}</strong><DockConferenceRooms key={invite.id} user={user} visible={visible} invite={invite} /></div>}
    <strong>Favorites</strong>
    {!favorites.length && <p>Pin a member or contact to call them here.</p>}
    {favorites.map(f => {
      const contact = contacts.data?.find(row => row.id === f.id);
      const phone = contact?.phone?.replace(/[^+0-9]/g,'');
      return <div key={`${f.contact}:${f.id}`} className="flex flex-wrap items-center gap-2">
        {f.contact ? <span>{contact?.name || f.name}</span> : <button onClick={() => openMember(f.id)}>{f.name}</button>}
        {f.contact ? phone ? <a href={`tel:${phone}`}>Call</a> : <span>No phone available</span> : <button disabled={!!invite} onClick={() => setInvite(f)}>Voice call</button>}
        <button aria-label={`Remove ${f.name} from favorites`} onClick={() => save({callFavorites:favorites.filter(x => x !== f)})}>Remove</button>
      </div>;
    })}
    {invite && <button onClick={() => { if (window.confirm('Close this call panel and disconnect if connected?')) setInvite(null); }}>Close call panel</button>}
    <div className="flex gap-2">{['members','contacts'].map(value => <button key={value} aria-pressed={tab === value} onClick={() => setTab(value)}>{value === 'members' ? 'Members' : 'My CRM contacts'}</button>)}</div>
    <DockDirectory key={tab} user={user} visible={visible} contacts={tab === 'contacts'} action={(row,name) => {
      const contact = tab === 'contacts', id = contact ? row.id : row.user_id;
      const pinned = favorites.some(f => f.id === id && f.contact === contact);
      return <button disabled={!id || pinned || favorites.length >= 30} onClick={() => save({callFavorites:[...favorites,{id,name,contact}]})}>{pinned ? 'Pinned' : 'Pin'}</button>;
    }} />
  </div>;
}