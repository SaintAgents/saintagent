import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { heroMedia, heroUrl } from '@/components/hero/surfaceHeroSettings';

export default function SurfaceHeroQueue({ config, update, add, notice }) {
  const [url, setUrl] = useState('');
  const dragIndex = useRef(null);
  const media = heroMedia(config), field = config.mode === 'image' ? 'images' : 'videos';
  function move(from, to) {
    if (from === null || from === to || to < 0 || to >= media.length) return;
    const next = [...media]; const [item] = next.splice(from, 1); next.splice(to, 0, item); update({ [field]: next });
  }
  return <section className="space-y-2 border-t pt-3" aria-label="Carousel queue">
    <h3 className="text-sm font-semibold">Carousel order · {media.length}/4</h3>
    {media.length ? <ol className="space-y-1">{media.map((item, index) => <li key={item.url} className="flex flex-wrap items-center gap-1 rounded border p-1.5" draggable onDragStart={event => { dragIndex.current = index; event.dataTransfer.setData('text/plain', String(index)); }} onDragEnd={() => { dragIndex.current = null; }} onDragOver={event => { if (dragIndex.current !== null) event.preventDefault(); }} onDrop={event => { event.preventDefault(); move(dragIndex.current, index); dragIndex.current = null; }}>
      <span className="min-w-0 flex-1 break-all text-sm">{index + 1}. {item.label}</span>
      <Button type="button" size="sm" variant="outline" aria-label={`Move ${item.label} earlier`} disabled={index === 0} onClick={() => move(index, index - 1)}>↑</Button>
      <Button type="button" size="sm" variant="outline" aria-label={`Move ${item.label} later`} disabled={index === media.length - 1} onClick={() => move(index, index + 1)}>↓</Button>
      <Button type="button" size="sm" variant="outline" aria-label={`Remove ${item.label}`} onClick={() => update({ [field]: media.filter(entry => entry.url !== item.url) })}>Remove</Button>
    </li>)}</ol> : <p className="text-sm text-muted-foreground">Add media to start a carousel.</p>}
    <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
      event.preventDefault(); const valid = heroUrl(url.trim());
      if (!valid) { notice('Enter a direct HTTPS media URL.'); return; }
      const name = new URL(valid).hostname;
      if (add({ url: valid, label: name })) setUrl('');
    }}>
      <label className="min-w-0 flex-1 text-sm">Direct {config.mode} URL<input type="url" value={url} required onChange={event => setUrl(event.target.value)} placeholder="https://…" className="block w-full rounded border bg-background px-2 py-1.5" /></label>
      <Button size="sm" variant="outline">Add URL</Button>
    </form>
  </section>;
}