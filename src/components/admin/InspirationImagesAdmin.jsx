import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import InspirationImageForm from '@/components/admin/InspirationImageForm';
import { inspirationKey, useInspirationImages } from '@/components/dock/useInspirationImages';

const formats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export default function InspirationImagesAdmin() {
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const client = useQueryClient();
  const images = useInspirationImages();
  const rows = images.data?.pages.flatMap(page => page.items) ?? [];
  const change = useMutation({
    mutationFn: async ({ image, remove, file, ...fields }) => {
      const records = base44.entities.InspirationImage;
      if (remove) return records.delete(image.id);
      if (!fields.alt_text) throw new Error('Enter a description for the image.');
      if (file?.name && (!formats.includes(file.type) || !file.size || file.size > 10 * 1024 * 1024)) throw new Error('Choose a supported image no larger than 10 MB.');
      const file_uri = file?.name ? (await base44.integrations.Core.UploadPrivateFile({ file })).file_uri : image?.file_uri;
      if (!file_uri) throw new Error('Choose an image file.');
      return image ? records.update(image.id, { ...fields, file_uri }) : records.create({ ...fields, file_uri });
    },
    onSuccess: async (_, action) => {
      setEditing(null);
      setNotice(action.remove ? 'Image removed from the widget.' : 'Image saved to the widget.');
      await client.invalidateQueries({ queryKey: inspirationKey });
    },
  });
  const select = image => { change.reset(); setNotice(''); setEditing(image); };
  return <section className="space-y-4 rounded-lg border bg-card p-4 text-card-foreground sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">Inspiration Images</h2><p className="text-sm text-muted-foreground">Manage artwork in Dock Deck’s Inspiration widget. Lower display numbers appear first.</p></div><Button disabled={change.isPending || editing !== null} onClick={() => select('new')}>Add image</Button></div>
    {notice && <p role="status">{notice}</p>}
    {change.isError && <p role="alert" className="text-destructive">{change.error?.message || 'Could not save the change.'}</p>}
    {editing && <InspirationImageForm key={editing.id || 'new'} image={editing === 'new' ? null : editing} defaultOrder={images.hasNextPage ? '' : Math.min(9999, (rows.at(-1)?.display_order ?? 0) + 1)} busy={change.isPending} onCancel={() => select(null)} onSave={values => change.mutate({ ...values, image: editing === 'new' ? null : editing })} />}
    {images.isPending ? <p role="status">Loading images…</p> : !rows.length && !images.isError ? <p>No images yet. The widget still shows its reflection prompts.</p> : null}
    {images.isError && <p role="alert">Could not load images. <Button variant="outline" onClick={() => images.refetch()}>Retry</Button></p>}
    {!!rows.length && <ul className="divide-y border-y">{rows.map(image => <li key={image.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
      <div className="min-w-0 break-words"><p className="font-medium">{image.display_order}. {image.alt_text}</p>{image.caption && <p className="text-sm text-muted-foreground">{image.caption}</p>}</div>
      <div className="flex gap-2"><Button size="sm" variant="outline" disabled={change.isPending || editing !== null} onClick={() => select(image)}>Edit</Button><Button size="sm" variant="outline" disabled={change.isPending || editing !== null} onClick={() => { if (window.confirm(`Remove “${image.alt_text}” from Inspiration?`)) { select(null); change.mutate({ image, remove: true }); } }}>Remove</Button></div>
    </li>)}</ul>}
    {images.hasNextPage && <Button variant="outline" disabled={images.isFetching} onClick={() => images.fetchNextPage()}>{images.isFetchingNextPage ? 'Loading…' : 'Load more'}</Button>}
  </section>;
}