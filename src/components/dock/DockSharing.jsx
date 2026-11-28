import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import BusinessCardDialog from '@/components/profile/BusinessCardDialog';
import useCardArtwork from '@/components/profile/useCardArtwork';
import ProfileQRCode from '@/components/profile/ProfileQRCode';
import SharePublicProfile from '@/components/publicprofile/SharePublicProfile';
import { contactPath, shareUrl, webUrl } from '@/components/publicprofile/publicLinks';
import { linkTreeEditorQuery } from '@/components/publicprofile/linkTreeEditorQuery';

export default function DockSharing({type,user,visible}) {
  const [open,setOpen]=useState(false);
  const contact=type==='Contact Card';
  const profile=useQuery({ ...linkTreeEditorQuery(user), enabled: visible && contact });
  const profileId = profile.data?.profile?.id;
  const artwork = useCardArtwork(user.id, profileId, visible && contact);
  const invite=useQuery({queryKey:['dock-invite',user.email],queryFn:async () => (await base44.entities.AffiliateCode.filter({user_id:user.email},'-created_date',1))[0]?.code || null,enabled:visible && !contact});
  if (!visible) return null;
  if (contact) {
    if (profile.isPending) return <p role="status">Loading contact card…</p>;
    if (profile.isError) return <p role="alert">Could not load your contact card.</p>;
    const { profile:card, saved } = profile.data;
    if (!card) return <Link to="/Profile">Set up your profile first</Link>;
    const art = webUrl(artwork.url);
    const path = contactPath(card.sa_number || card.id);
    const isPublic = !card.profile_visibility || card.profile_visibility === 'public';
    return <div className="dock-links space-y-2">
      {art && <img src={art} alt="Digital contact card artwork" className="max-h-40 w-full object-contain" />}
      {artwork.isPending ? <p role="status">Loading card artwork…</p> : artwork.isError ? <p role="alert">Could not load card artwork.</p> : !art && <a href="/Profile#digital-card">Add card artwork</a>}
      <div className="flex items-center gap-2">{!art && card.avatar_url && <img src={card.avatar_url} alt="" className="size-9 rounded-full object-cover" />}<div><strong>{card.display_name}</strong>{saved?.contact_title && <p>{saved.contact_title}</p>}{saved?.contact_org && <p>{saved.contact_org}</p>}{card.sa_number && <p>SA#{card.sa_number}</p>}</div></div>
      {isPublic ? <><ProfileQRCode profile={card} size={80} /><a href={path} target="_blank" rel="noreferrer">Open public contact card</a><SharePublicProfile url={shareUrl(path)} label="Digital Contact Card" allowShare /></> : <p>Your contact card is not public.</p>}
      <button onClick={() => setOpen(true)}>Preview printable card</button><a href="/LinkTreeEditor#contact-card-settings">Edit card details</a>
      {open && <BusinessCardDialog open onOpenChange={setOpen} profile={card} artworkUrl={art} />}
    </div>;
  }
  const url=invite.data && shareUrl(`/Join?ref=${encodeURIComponent(invite.data)}`);
  return <div className="dock-links"><Link to="/AffiliateCenter">{url ? 'Ambassador dashboard' : 'Ambassador program'}</Link>{invite.isPending ? <p role="status">Loading your invitation…</p> : invite.isError ? <p role="alert">Could not load your invitation.</p> : url ? <><p>Referral code: <strong>{invite.data}</strong></p><a className="break-all" href={url}>{url}</a><SharePublicProfile key={url} url={url} label="Ambassador invitation" allowShare initialOpen /></> : <p>Visit the ambassador program to get your signup link.</p>}</div>;
}