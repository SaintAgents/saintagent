import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InspirationArtwork from '@/components/dock/InspirationArtwork';

export default function InspirationImageForm({ image, defaultOrder, onSave, onCancel, busy }) {
  return <form className="grid gap-3 rounded-lg border p-4" onSubmit={event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({ file: form.get('image'), alt_text: form.get('alt').trim(), caption: form.get('caption').trim(), display_order: Number(form.get('order')) });
  }}>
    <h3 className="font-semibold">{image ? 'Edit image' : 'Add image'}</h3>
    {image && <div className="max-w-60"><InspirationArtwork image={image} /></div>}
    <fieldset disabled={busy} className="grid gap-3">
      <label className="grid gap-1 text-sm">{image ? 'Replace image (optional)' : 'Image file'}
        <Input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required={!image} />
        <span className="text-muted-foreground">JPEG, PNG, WebP or GIF, up to 10 MB.</span>
      </label>
      <label className="grid gap-1 text-sm">Image description (alt text)<Input name="alt" required maxLength={200} defaultValue={image?.alt_text ?? ''} /></label>
      <label className="grid gap-1 text-sm">Caption (optional)<Input name="caption" maxLength={240} defaultValue={image?.caption ?? ''} /></label>
      <label className="grid max-w-48 gap-1 text-sm">Display order<Input name="order" type="number" min={1} max={9999} step={1} required defaultValue={image?.display_order ?? defaultOrder} /></label>
      <div className="flex flex-wrap gap-2"><Button type="submit">{busy ? 'Saving…' : 'Save image'}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div>
    </fieldset>
  </form>;
}