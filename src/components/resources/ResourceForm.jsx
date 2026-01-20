import React from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Video, Image, Music, Link, X, Loader2 } from 'lucide-react';

export default function ResourceForm({ onSubmit, submitting }) {
  const [form, setForm] = React.useState({
    type: 'article',
    title: '',
    description: '',
    content_url: '',
    platform: '',
    categories: '',
    tags: '',
    media_url: '',
    media_type: ''
  });
  const [uploading, setUploading] = React.useState(false);

  const handle = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleFileUpload = async (e, mediaType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handle('media_url', file_url);
      handle('media_type', mediaType);
      // Auto-set type based on media
      if (mediaType === 'video') handle('type', 'video');
      else if (mediaType === 'audio') handle('type', 'audio');
      else if (mediaType === 'image') handle('type', 'article');
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const clearMedia = () => {
    handle('media_url', '');
    handle('media_type', '');
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      categories: form.categories.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean)
    };
    onSubmit(payload);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribute a Resource</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          {/* Media Upload Section */}
          <div className="space-y-3">
            <label className="text-sm text-slate-600 font-medium">Attach Media (optional)</label>
            
            {form.media_url ? (
              <div className="relative rounded-lg border border-slate-200 p-3 bg-slate-50">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={clearMedia}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                {form.media_type === 'image' && (
                  <img src={form.media_url} alt="Preview" className="max-h-48 rounded-lg mx-auto" />
                )}
                {form.media_type === 'video' && (
                  <video src={form.media_url} controls className="max-h-48 rounded-lg mx-auto w-full" />
                )}
                {form.media_type === 'audio' && (
                  <audio src={form.media_url} controls className="w-full" />
                )}
                <p className="text-xs text-slate-500 mt-2 text-center capitalize">{form.media_type} uploaded</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-violet-400 hover:bg-violet-50 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    disabled={uploading}
                  />
                  {uploading ? <Loader2 className="w-6 h-6 text-violet-500 animate-spin" /> : <Image className="w-6 h-6 text-violet-500" />}
                  <span className="text-xs text-slate-600">Image</span>
                </label>
                
                <label className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    disabled={uploading}
                  />
                  {uploading ? <Loader2 className="w-6 h-6 text-blue-500 animate-spin" /> : <Video className="w-6 h-6 text-blue-500" />}
                  <span className="text-xs text-slate-600">Video</span>
                </label>
                
                <label className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'audio')}
                    disabled={uploading}
                  />
                  {uploading ? <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /> : <Music className="w-6 h-6 text-emerald-500" />}
                  <span className="text-xs text-slate-600">Audio</span>
                </label>
                
                <div 
                  className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50 cursor-pointer transition-colors"
                  onClick={() => document.getElementById('link-input')?.focus()}
                >
                  <Link className="w-6 h-6 text-amber-500" />
                  <span className="text-xs text-slate-600">Link</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Type</label>
              <Select value={form.type} onValueChange={(v) => handle('type', v)}>
                <SelectTrigger className="w-full mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="best_practice">Best Practice</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="external_link">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-600">Platform (optional)</label>
              <Input value={form.platform} onChange={(e) => handle('platform', e.target.value)} placeholder="YouTube, Coursera, Dev.to, etc." className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Title</label>
              <Input value={form.title} onChange={(e) => handle('title', e.target.value)} className="mt-1" required />
            </div>
            <div>
              <label className="text-sm text-slate-600">Link (URL or leave empty if uploading media)</label>
              <Input 
                id="link-input"
                value={form.content_url} 
                onChange={(e) => handle('content_url', e.target.value)} 
                placeholder="https://..." 
                className="mt-1" 
                required={!form.media_url}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600">Description</label>
            <Textarea value={form.description} onChange={(e) => handle('description', e.target.value)} rows={3} className="mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Categories (comma separated)</label>
              <Input value={form.categories} onChange={(e) => handle('categories', e.target.value)} placeholder="Mentorship, Leadership, React" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Tags (comma separated)</label>
              <Input value={form.tags} onChange={(e) => handle('tags', e.target.value)} placeholder="communication, pairing" className="mt-1" />
            </div>
          </div>

          <div className="text-right">
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={submitting || uploading}>
              {uploading ? 'Uploading...' : 'Submit for Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}