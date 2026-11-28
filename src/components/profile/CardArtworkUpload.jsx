import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const formats = ['image/png', 'image/jpeg', 'image/webp'];
export default function CardArtworkUpload({ onSave }) {
  const input = useRef(null);
  const [file, setFile] = useState(null);
  const [share, setShare] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  async function upload(event) {
    event.preventDefault();
    if (!file || busy) return;
    if (!formats.includes(file.type) || !file.size || file.size > 10 * 1024 * 1024) {
      setStatus('Choose a PNG, JPEG, or WebP image up to 10 MB.'); return;
    }
    setBusy(true); setStatus('');
    try {
      const result = await (share ? base44.integrations.Core.UploadPublicFile({ file }) : base44.integrations.Core.UploadPrivateFile({ file }));
      const reference = share ? result.file_url : result.file_uri;
      if (!reference) throw new Error('Upload failed');
      await onSave(share ? { digital_art_url: reference, digital_art_uri: '' } : { digital_art_url: '', digital_art_uri: reference });
      input.current.value = ''; setFile(null); setStatus('Artwork saved to your digital card.');
    } catch { setStatus('Could not save the artwork. Please try again.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={upload} className="space-y-3 rounded-xl border bg-card p-4 text-card-foreground">
    <h2 className="font-semibold">Upload your own artwork</h2>
    <p className="text-sm text-muted-foreground">PNG, JPEG, or WebP up to 10 MB. Private artwork appears on your own preview and downloads, not on your public card.</p>
    <label className="block text-sm">Artwork image<Input ref={input} type="file" accept={formats.join(',')} disabled={busy} onChange={event => { setFile(event.target.files?.[0] || null); setStatus(''); }} /></label>
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={share} disabled={busy} onChange={event => setShare(event.target.checked)} />Share artwork on my public card (anyone with the image link can open it)</label>
    <Button type="submit" disabled={busy || !file}>{busy ? 'Uploading…' : 'Upload and use on card'}</Button>
    {status && <p className="text-sm" role="status">{status}</p>}
  </form>;
}