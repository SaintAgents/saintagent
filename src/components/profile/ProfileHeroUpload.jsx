import { useRef, useState } from 'react';
import { Edit, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { privateProfileHero } from '@/components/profile/useProfileHeroImage';

export default function ProfileHeroUpload({ onSave }) {
  const input = useRef(null);
  const [status, setStatus] = useState('');
  const busy = status === 'saving';

  async function save(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || busy) return;
    setStatus('saving');
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      if (!file_uri) throw new Error('No image reference');
      await onSave(privateProfileHero(file_uri));
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return <div className="absolute right-2 top-2 z-20 flex max-w-[64%] flex-col items-end gap-1 sm:right-3 sm:top-3">
    <input ref={input} type="file" accept="image/*" hidden onChange={save} />
    <Button type="button" variant="outline" className="min-h-11 whitespace-normal" onClick={() => input.current?.click()} disabled={busy}>
      {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Edit aria-hidden="true" />}
      {busy ? 'Saving image…' : 'Change Hero Image'}
    </Button>
    {status === 'saved' && <span role="status" className="rounded bg-card px-2 py-1 text-xs text-card-foreground">Hero image saved.</span>}
    {status === 'error' && <span role="alert" className="rounded bg-card px-2 py-1 text-xs text-card-foreground">Could not save the hero image. Try again.</span>}
  </div>;
}