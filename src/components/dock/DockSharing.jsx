import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import BusinessCardDialog from '@/components/profile/BusinessCardDialog';
import ProfileQRCode from '@/components/profile/ProfileQRCode';
import SharePublicProfile from '@/components/publicprofile/SharePublicProfile';
import { contactPath, shareUrl } from '@/components/publicprofile/publicLinks';

export default function DockSharing({type,user,visible}) {
  const [open,setOpen]=useState(false), [status,setStatus]=useState('');
  const contact=type==='Contact Card';
  const profile=useQuery({queryKey:['dock-contact',user.email],queryFn:async () => (await base44.entities.UserProfile.filter({user_id:user.email},'-updated_date',1))[0] || null, enabled:visible && contact});
  const invite=useQuery({queryKey:['dock-invite',user.email],queryFn:async () => (await base44.entities.AffiliateCode.filter({user_id:user.email},'-created_date',1))[0]?.code || null,enabled:visible && !contact});
  if (contact) {
    if (profile.isPending) return <p role="status">Loading contact card…</p>;
    if (profile.isError) return <p role="alert">Could not load your contact card.</p>;
    const card = profile.data;
    if (!card) return <Link to="/Profile">Set up your profile first</Link>;
    const path = contactPath(card.sa_number || card.id);
    const isPublic = !card.profile_visibility || card.profile_visibility === 'public';
    return <div className="dock-links space-y-2">
      <div className="flex items-center gap-2">{card.avatar_url && <img src={card.avatar_url} alt="" className="size-9 rounded-full object-cover" />}<div><strong>{card.display_name}</strong>{card.sa_number && <p>SA#{card.sa_number}</p>}</div></div>
      {isPublic ? <><ProfileQRCode profile={card} size={80} /><a href={path} target="_blank" rel="noreferrer">Open public contact card</a><SharePublicProfile url={shareUrl(path)} label="Digital Contact Card" /></> : <p>Your contact card is not public.</p>}
      <button onClick={() => setOpen(true)}>Preview printable card</button><a href="/LinkTreeEditor">Edit sharing settings</a>
      {open && <BusinessCardDialog open onOpenChange={setOpen} profile={card} />}
    </div>;
  }
  const url=invite.data && `${window.location.origin}/Join?ref=${encodeURIComponent(invite.data)}`;
  return <div className="dock-links"><Link to="/AffiliateCenter">Ambassador program</Link>{invite.isPending ? <p>Loading your invitation…</p> : invite.isError ? <p>Could not load your invitation.</p> : url ? <><a href={url}>Open my signup link</a><button onClick={async()=>{try{await navigator.clipboard.writeText(url);setStatus('Link copied.');}catch{setStatus('Could not copy. Open the signup link to share it.');}}}>Copy signup link</button><button onClick={()=>setOpen(!open)}>{open?'Hide QR':'Show QR'}</button>{open && <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`} width={120} height={120} alt="Ambassador signup QR" />}{status && <p role="status">{status}</p>}</> : <p>Visit the ambassador program to get your signup link.</p>}</div>;
}