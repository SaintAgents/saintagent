import { useId, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const styles = ['Fantasy', 'Celestial', 'Cyberpunk', 'Renaissance', 'Anime', 'Superhero', 'Royal', 'Astronaut'];

export default function ProfileArtworkGenerator({ kind, currentAvatar, savedArtwork, onSave }) {
  const id = useId();
  const card = kind === 'card';
  const reference = !card && /^https:\/\/[^\s]+$/i.test(currentAvatar || '');
  const [direction, setDirection] = useState('');
  const [preview, setPreview] = useState('');
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const max = card ? 132 : 500;
  async function run(action) {
    setPending(action); setError(''); setSuccess('');
    try {
      if (action === 'generate') {
        const { data } = await base44.functions.invoke('generateProfileArtwork', { kind, direction: direction.trim(), reference });
        if (!data?.url) throw new Error('No image was returned.');
        setPreview(data.url);
      } else {
        await onSave(preview);
        setPreview('');
        setSuccess(card ? 'Contact Card art saved.' : 'Profile avatar saved.');
      }
    } catch (err) { setError(err.response?.data?.error || (action === 'save' ? 'Could not finish saving. Please try again.' : 'Could not generate artwork. Please try again.')); }
    finally { setPending(''); }
  }
  return <section className="space-y-3 rounded-xl border bg-card p-4 text-card-foreground">
    <h2 className="font-semibold">{card ? 'AI Contact Card Artwork' : 'AI Profile Avatar'}</h2>
    <p className="text-sm text-muted-foreground">{card ? 'AI services receive your bio, causes, skills, region, and organization focus to create a symbolic emblem. The app does not include your contact fields or QR code.' : reference ? 'AI services receive your prompt and your current avatar as a reference to preserve your likeness.' : 'AI services receive your prompt. No current portrait will be sent.'}</p>
    {!card && <div className="flex flex-wrap gap-1">{styles.map(style => <Button key={style} type="button" variant="outline" size="sm" disabled={!!pending} onClick={() => setDirection(`${style} style`)}>{style}</Button>)}</div>}
    <label htmlFor={id} className="block text-sm font-medium">{card ? 'Custom direction (optional)' : 'Describe your portrait style'}</label>
    <Textarea id={id} value={direction} maxLength={max} disabled={!!pending} onChange={event => setDirection(event.target.value)} />
    {card && <p className="text-xs text-muted-foreground">{direction.length}/{max} characters</p>}
    {preview && <img src={preview} alt={card ? 'Generated emblem preview' : 'Generated avatar preview'} className="aspect-square w-full max-w-64 rounded-lg border object-cover" />}
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant={preview ? 'outline' : 'default'} disabled={!!pending || (!card && !direction.trim())} onClick={() => run('generate')}>{pending === 'generate' ? 'Generating…' : preview || savedArtwork ? 'Regenerate' : 'Generate Artwork'}</Button>
      {preview && <Button type="button" disabled={!!pending} onClick={() => run('save')}>{pending === 'save' ? 'Saving…' : card ? 'Save Card Artwork' : 'Use This'}</Button>}
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{success && <p role="status" className="text-sm">{success}</p>}
  </section>;
}