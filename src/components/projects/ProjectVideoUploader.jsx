import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Upload, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_VIDEOS = 5;
const MAX_DURATION_SECONDS = 300; // 5 minutes

export default function ProjectVideoUploader({ videos = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    // Check file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file.');
      return;
    }

    // Check duration via a temporary video element
    const url = URL.createObjectURL(file);
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';

    videoEl.onloadedmetadata = async () => {
      URL.revokeObjectURL(url);
      if (videoEl.duration > MAX_DURATION_SECONDS) {
        setError(`Video must be 5 minutes or less. This video is ${Math.ceil(videoEl.duration / 60)} minutes.`);
        return;
      }

      setUploading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        onChange([...videos, file_url]);
      } catch {
        setError('Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    };

    videoEl.onerror = () => {
      URL.revokeObjectURL(url);
      setError('Could not read video file. Please try a different format.');
    };

    videoEl.src = url;
    // Reset input so same file can be re-selected
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeVideo = (idx) => {
    onChange(videos.filter((_, i) => i !== idx));
  };

  const atLimit = videos.length >= MAX_VIDEOS;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Video className="w-4 h-4 text-violet-500" />
          Project Videos
        </Label>
        <Badge variant="outline" className="text-xs">
          {videos.length}/{MAX_VIDEOS}
        </Badge>
      </div>
      <p className="text-xs text-slate-500">
        Upload up to {MAX_VIDEOS} videos (5 minutes max each) to help define your project.
      </p>

      {/* Existing videos */}
      {videos.length > 0 && (
        <div className="space-y-2">
          {videos.map((url, idx) => (
            <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 bg-black">
              <video
                src={url}
                controls
                className="w-full max-h-48 object-contain"
                preload="metadata"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg"
                onClick={() => removeVideo(idx)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-black/60 text-white text-[10px]">Video {idx + 1}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {!atLimit && (
        <label className={cn(
          "flex items-center gap-2 p-3 border border-dashed rounded-lg cursor-pointer transition-colors",
          uploading
            ? "border-violet-400 bg-violet-50"
            : "border-slate-300 hover:border-violet-400 hover:bg-violet-50"
        )}>
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
          ) : (
            <Upload className="w-5 h-5 text-slate-400" />
          )}
          <div>
            <span className="text-sm font-medium text-slate-700">
              {uploading ? 'Uploading video...' : 'Upload a video'}
            </span>
            <p className="text-[10px] text-slate-400">MP4, MOV, WebM • 5 min max</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}

      {atLimit && (
        <p className="text-xs text-slate-500 italic">Maximum of {MAX_VIDEOS} videos reached.</p>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}