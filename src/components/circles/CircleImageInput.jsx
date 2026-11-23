import React, { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CircleImageInput({ file, error, onChange, disabled }) {
  const id = useId();
  const input = useRef(null);
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Circle image (optional)</Label>
      <Input ref={input} id={id} type="file" accept="image/jpeg,image/png,image/webp,image/gif" aria-describedby={`${id}-help`} aria-invalid={!!error} disabled={disabled} onChange={(e) => onChange(e.target.files?.[0] || null)} />
      <p id={`${id}-help`} className="text-xs text-muted-foreground">JPG, PNG, WebP, or GIF, up to 10 MB.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {file && preview && <img src={preview} alt="Circle image preview" className="h-28 w-full rounded-md object-cover" />}
      {(file || error) && <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => { input.current.value = ''; onChange(null); }}>Remove image</Button>}
    </div>
  );
}