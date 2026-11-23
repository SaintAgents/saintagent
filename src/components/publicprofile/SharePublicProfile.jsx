import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { downloadBlob, qrImage } from '@/components/publicprofile/publicLinks';

export default function SharePublicProfile({ url, label, initialOpen = false, allowShare = false }) {
  const [open, setOpen] = useState(initialOpen);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [imageError, setImageError] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(url); setStatus('Link copied.'); }
    catch { setStatus('Could not copy the link.'); }
  }
  async function share() {
    if (!navigator.share) return copy();
    try { await navigator.share({ title: label, url }); }
    catch (error) { if (error.name !== 'AbortError') await copy(); }
  }
  async function download() {
    setBusy(true); setStatus('');
    try {
      const response = await fetch(qrImage(url, 800), { signal: AbortSignal.timeout(10000) });
      if (!response.ok || !response.headers.get('Content-Type')?.includes('image/png')) throw Error();
      await downloadBlob(await response.blob(), `${label.toLowerCase().replaceAll(' ', '-')}-qr.png`);
    } catch { setStatus('Could not download the QR code. Please try again.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-2">
    <div className="flex flex-wrap justify-center gap-2">
      <Button type="button" variant="outline" onClick={copy}>Copy link</Button>
      {allowShare && <Button type="button" variant="outline" onClick={share}>Share</Button>}
      <Button type="button" variant="outline" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Hide QR code' : 'Show QR code'}</Button>
    </div>
    {open && <div className="flex flex-col items-center gap-2">
      {imageError ? <p>Could not load the QR image.</p> : <img src={qrImage(url, 200)} width="160" height="160" alt={`Scan to open ${label}`} onError={() => setImageError(true)} />}
      <Button type="button" variant="outline" onClick={download} disabled={busy}>{busy ? 'Downloading…' : 'Download QR'}</Button>
    </div>}
    {status && <p role="status" className="text-center text-sm">{status}</p>}
  </div>;
}