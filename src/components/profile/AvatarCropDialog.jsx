import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { RotateCcw, RotateCw } from 'lucide-react';

export default function AvatarCropDialog({ file, busy, errorMessage, onClose, onSave }) {
  const canvas = useRef(null);
  const [image, setImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState('');
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const source = new Image();
    source.onload = () => setImage(source);
    source.onerror = () => setError('This image could not be opened.');
    source.src = url;
    return () => { source.onload = null; source.onerror = null; URL.revokeObjectURL(url); };
  }, [file]);
  useEffect(() => {
    if (!image || !canvas.current) return;
    const context = canvas.current.getContext('2d');
    const scale = 256 * zoom / Math.min(image.naturalWidth, image.naturalHeight);
    const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = '#fff'; context.fillRect(0, 0, 256, 256);
    context.translate(128, 128); context.rotate(rotation * Math.PI / 180);
    context.drawImage(image, -w / 2, -h / 2, w, h);
  }, [image, rotation, zoom]);
  function save() {
    canvas.current.toBlob(blob => {
      if (blob) onSave(new File([blob], 'profile-avatar.jpg', { type: 'image/jpeg' }));
      else setError('Could not prepare this image.');
    }, 'image/jpeg', 0.9);
  }
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}><DialogContent className="max-w-sm">
    <DialogTitle>Crop Profile Photo</DialogTitle><DialogDescription>Adjust the square crop and rotate your photo before saving.</DialogDescription>
    <canvas ref={canvas} width={256} height={256} aria-label="Square photo crop preview" className="mx-auto aspect-square w-full max-w-64 rounded-lg border" />
    {(error || errorMessage) && <p role="alert" className="text-sm text-destructive">{error || errorMessage}</p>}
    <label className="grid gap-2 text-sm">Crop zoom<input type="range" min="1" max="3" step="0.05" value={zoom} disabled={busy || !image} onChange={event => setZoom(Number(event.target.value))} /></label>
    <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="icon" aria-label="Rotate left" disabled={busy || !image} onClick={() => setRotation(value => value - 90)}><RotateCcw /></Button><Button type="button" variant="outline" size="icon" aria-label="Rotate right" disabled={busy || !image} onClick={() => setRotation(value => value + 90)}><RotateCw /></Button><Button type="button" className="ml-auto" disabled={busy || !image} onClick={save}>{busy ? 'Saving…' : 'Save Photo'}</Button></div>
  </DialogContent></Dialog>;
}