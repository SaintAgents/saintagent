import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, Music, Film, X } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadEpisodeModal({ open, onClose, currentUser }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const queryClient = useQueryClient();

  const reset = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setUploading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['mp3', 'mp4', 'm4a', 'wav', 'ogg', 'webm'].includes(ext)) {
      toast.error('Please select an MP3, MP4, or other audio/video file');
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      toast.error('File too large (max 500MB)');
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast.error('Please provide a title and select a file');
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      await base44.entities.Broadcast.create({
        title: title.trim(),
        description: description.trim(),
        host_id: currentUser?.email || '',
        host_name: currentUser?.full_name || 'Admin',
        scheduled_time: new Date().toISOString(),
        duration_minutes: 60,
        status: 'ended',
        broadcast_type: 'podcast',
        recording_url: file_url,
        topics: ['Deep Disclosure'],
      });

      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      toast.success('Episode uploaded successfully!');
      handleClose();
    } catch (e) {
      toast.error('Upload failed: ' + (e.message || 'Unknown error'));
    }
    setUploading(false);
  };

  const isAudio = file && ['mp3', 'm4a', 'wav', 'ogg'].includes(file.name.split('.').pop().toLowerCase());

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-violet-600" />
            Upload Episode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Input
            placeholder="Episode Title *"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="h-20"
          />

          {/* File picker */}
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".mp3,.mp4,.m4a,.wav,.ogg,.webm"
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-violet-200 bg-violet-50">
                {isAudio ? <Music className="w-5 h-5 text-violet-600 shrink-0" /> : <Film className="w-5 h-5 text-violet-600 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                </div>
                <button onClick={() => setFile(null)} className="p-1 hover:bg-violet-100 rounded">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed border-2 h-20 text-slate-500 hover:text-violet-600 hover:border-violet-300"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="w-5 h-5" />
                Select MP3 or MP4 file
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>Cancel</Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 gap-2"
              onClick={handleUpload}
              disabled={uploading || !file || !title.trim()}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Episode
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}