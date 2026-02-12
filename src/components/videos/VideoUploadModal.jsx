import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload, Video, X, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const CATEGORIES = [
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'music', label: 'Music' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'news', label: 'News' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'other', label: 'Other' }
];

const MAX_DURATION_SECONDS = 1200; // 20 minutes

export default function VideoUploadModal({ open, onClose, currentUser, profile }) {
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const queryClient = useQueryClient();

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    // Check duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      if (video.duration > MAX_DURATION_SECONDS) {
        setError(`Video must be 20 minutes or less. Your video is ${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60).toString().padStart(2, '0')}`);
        setVideoFile(null);
        setVideoPreview(null);
        return;
      }
      setVideoDuration(video.duration);
      setError('');
    };
    video.src = URL.createObjectURL(file);

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for thumbnail');
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setError('');
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      
      let finalVideoUrl;
      
      if (uploadMode === 'file') {
        // Upload video file
        const videoResult = await base44.integrations.Core.UploadFile({ file: videoFile });
        finalVideoUrl = videoResult.file_url;
      } else {
        // Use provided URL directly
        finalVideoUrl = videoUrl.trim();
      }
      
      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbResult = await base44.integrations.Core.UploadFile({ file: thumbnailFile });
        thumbnailUrl = thumbResult.file_url;
      }

      // Create video record
      await base44.entities.Video.create({
        title,
        description,
        video_url: finalVideoUrl,
        thumbnail_url: thumbnailUrl,
        duration_seconds: uploadMode === 'file' ? Math.floor(videoDuration) : 0,
        uploader_id: currentUser.email,
        uploader_name: profile?.display_name || currentUser.full_name,
        uploader_avatar: profile?.avatar_url,
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        status: 'published',
        views: 0,
        likes: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      resetForm();
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to upload video');
      setUploading(false);
    }
  });

  const resetForm = () => {
    setUploadMode('file');
    setVideoFile(null);
    setVideoPreview(null);
    setVideoDuration(0);
    setVideoUrl('');
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setTitle('');
    setDescription('');
    setCategory('other');
    setTags('');
    setUploading(false);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }
    if (uploadMode === 'file' && !videoFile) {
      setError('Please select a video file');
      return;
    }
    if (uploadMode === 'url' && !videoUrl.trim()) {
      setError('Please provide a video URL');
      return;
    }
    if (uploadMode === 'file' && videoDuration > MAX_DURATION_SECONDS) {
      setError('Video must be 20 minutes or less');
      return;
    }
    uploadMutation.mutate();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { resetForm(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-red-500" />
            Upload Video
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Upload Mode Toggle */}
          <div className="space-y-2">
            <Label>Video Source</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={uploadMode === 'file' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploadMode('file')}
                className={uploadMode === 'file' ? 'bg-violet-600 hover:bg-violet-700' : ''}
              >
                <Upload className="w-4 h-4 mr-1" />
                Upload File
              </Button>
              <Button
                type="button"
                variant={uploadMode === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploadMode('url')}
                className={uploadMode === 'url' ? 'bg-violet-600 hover:bg-violet-700' : ''}
              >
                🔗 Paste URL
              </Button>
            </div>
          </div>

          {/* Video Upload or URL */}
          {uploadMode === 'file' ? (
            <div className="space-y-2">
              <Label>Video File (max 20 minutes)</Label>
              {!videoPreview ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-violet-300 hover:bg-violet-50/50 transition-colors"
                >
                  <Video className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600">Click to select a video</p>
                  <p className="text-xs text-slate-400 mt-1">MP4, WebM, MOV • Max 20 minutes</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-black">
                  <video
                    src={videoPreview}
                    className="w-full max-h-64 object-contain"
                    controls
                  />
                  <button
                    type="button"
                    onClick={() => { setVideoFile(null); setVideoPreview(null); setVideoDuration(0); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs">
                    {formatDuration(videoDuration)}
                  </div>
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or direct video link"
              />
              <p className="text-xs text-slate-500">
                Supports YouTube, Vimeo, or direct video file URLs
              </p>
            </div>
          )}

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label>Thumbnail (optional)</Label>
            <div className="flex gap-4">
              {thumbnailPreview ? (
                <div className="relative w-40 h-24 rounded-lg overflow-hidden">
                  <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-black/80"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-40 h-24 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center hover:border-red-300 transition-colors"
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-xs text-slate-500 mt-1">Add thumbnail</span>
                </button>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video"
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. tutorial, howto, tips"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={uploading || !title.trim() || (uploadMode === 'file' ? !videoFile : !videoUrl.trim())}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}