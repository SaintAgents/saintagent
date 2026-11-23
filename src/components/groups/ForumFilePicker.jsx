import React from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const accept = '.pdf,.txt,.rtf,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.mp4,.webm,.mov,.m4v,.mp3,.wav,.m4a,.aac,.ogg,.flac,.opus';

export default function ForumFilePicker({ files, onChange, disabled }) {
  const [error, setError] = React.useState('');
  const addFiles = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = '';
    const next = [...files, ...picked];
    if (next.length > 5 || next.reduce((size, file) => size + file.size, 0) > 25 * 1024 * 1024) return setError('Choose up to five files totaling no more than 25 MB.');
    if (picked.some((file) => !file.size || file.name.length > 255 || !accept.split(',').some((ext) => file.name.toLowerCase().endsWith(ext)))) return setError('Choose a supported document, video, or audio file.');
    setError('');
    onChange(next);
  };
  return <div className="space-y-2">
    <label className="block space-y-1 text-sm font-medium">
      Attach documents, video, or audio
      <Input type="file" multiple accept={accept} disabled={disabled} onChange={addFiles} />
    </label>
    <p className="text-xs text-muted-foreground">Up to 5 files, 25 MB total.</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {files.length > 0 && <ul className="space-y-1">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 text-sm">
      <span className="min-w-0 truncate">{file.name}</span>
      <Button type="button" size="icon" variant="ghost" disabled={disabled} aria-label={`Remove ${file.name}`} onClick={() => { setError(''); onChange(files.filter((_, i) => i !== index)); }}><X className="h-4 w-4" /></Button>
    </li>)}</ul>}
  </div>;
}