import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useCardArtwork from '@/components/profile/useCardArtwork';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { downloadBlob } from '@/components/publicprofile/publicLinks';
import BusinessCardDialog from '@/components/profile/BusinessCardDialog';
import ProfileArtworkGenerator from '@/components/profile/ProfileArtworkGenerator';
import CardArtworkUpload from '@/components/profile/CardArtworkUpload';

export default function DigitalCardArtworkTab({ profile, userId, onAvatarUpdate }) {
  const client = useQueryClient();
  const { record: { data: saved }, queryKey: key, url, isPending, isError, refetch } = useCardArtwork(userId, profile.id);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  async function save(art) {
    const entity = base44.entities.ProfileDigitalArt;
    const fields = typeof art === 'string' ? { digital_art_url: art, digital_art_uri: '' } : art;
    const current = client.getQueryData(key);
    const row = current ? await entity.update(current.id, fields) : await entity.create({ profile_id: profile.id, ...fields });
    client.setQueryData(key, row);
    await client.invalidateQueries({ queryKey: ['public-contact'] });
  }
  async function act(action) {
    setBusy(action); setMessage('');
    try {
      if (action === 'avatar') { await onAvatarUpdate(url); setMessage('Profile avatar updated.'); }
      else {
        const file = await fetch(url);
        if (!file.ok) throw new Error('Download failed.');
        const blob = await file.blob();
        const extension = ({ 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' })[blob.type] || 'png';
        await downloadBlob(blob, `contact-card-art.${extension}`);
      }
    } catch { setMessage(action === 'avatar' ? 'Could not finish updating your avatar. Try again.' : 'Could not download the artwork. Try again.'); }
    finally { setBusy(''); }
  }
  return <div className="grid items-start gap-4 xl:grid-cols-2"><div className="space-y-3">
    <BusinessCardDialog inline profile={profile} artworkUrl={url} />
    {url && <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setExpanded(true)}>Expand Artwork</Button><Button type="button" variant="outline" disabled={!!busy} onClick={() => act('download')}>{busy === 'download' ? 'Downloading…' : 'Download Artwork'}</Button>{!saved?.digital_art_uri && <Button type="button" disabled={!!busy} onClick={() => act('avatar')}>{busy === 'avatar' ? 'Updating…' : 'Make Avatar Image'}</Button>}</div>}
    {message && <p role="status" className="text-sm">{message}</p>}
    {url && <Dialog open={expanded} onOpenChange={setExpanded}><DialogContent><DialogTitle>Contact Card Artwork</DialogTitle><img src={url} alt="Expanded contact card emblem" className="max-h-[70dvh] w-full object-contain" /></DialogContent></Dialog>}
  </div>{isPending ? <p role="status">Loading saved artwork…</p> : isError ? <div><p role="alert">Could not load saved artwork.</p><Button type="button" onClick={() => refetch()}>Try Again</Button></div> : <div className="space-y-3"><CardArtworkUpload onSave={save} /><ProfileArtworkGenerator kind="card" savedArtwork={url} onSave={save} /></div>}</div>;
}