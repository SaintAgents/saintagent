import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import BusinessCardDialog from '@/components/profile/BusinessCardDialog';

export default function DockSharing({type,user,visible}) {
  const [open,setOpen]=useState(false), [status,setStatus]=useState('');
  const contact=type==='Contact Card';
  const profile=useQuery({queryKey:['dock-contact',user.email],queryFn:async () => (await base44.entities.UserProfile.filter({user_id:user.email},'-updated_date',1))[0] || null, enabled:visible && open && contact});
  const invite=useQuery({queryKey:['dock-invite',user.email],queryFn:async () => (await base44.entities.AffiliateCode.filter({user_id:user.email},'-created_date',1))[0]?.code || null,enabled:visible && !contact});
  if (contact) return <div className="dock-links"><button onClick={()=>setOpen(true)}>Open contact card</button>{open && (profile.isPending ? <p>Loading contact card…</p> : profile.isError ? <p>Could not load your contact card.</p> : !profile.data ? <Link to="/Profile">Set up your profile first</Link> : <BusinessCardDialog open onOpenChange={setOpen} profile={profile.data} />)}</div>;
  const url=invite.data && `${window.location.origin}/Join?ref=${encodeURIComponent(invite.data)}`;
  return <div className="dock-links"><Link to="/AffiliateCenter">Ambassador program</Link>{invite.isPending ? <p>Loading your invitation…</p> : invite.isError ? <p>Could not load your invitation.</p> : url ? <><a href={url}>Open my signup link</a><button onClick={async()=>{try{await navigator.clipboard.writeText(url);setStatus('Link copied.');}catch{setStatus('Could not copy. Open the signup link to share it.');}}}>Copy signup link</button><button onClick={()=>setOpen(!open)}>{open?'Hide QR':'Show QR'}</button>{open && <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`} width={120} height={120} alt="Ambassador signup QR" />}{status && <p role="status">{status}</p>}</> : <p>Visit the ambassador program to get your signup link.</p>}</div>;
}