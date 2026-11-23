import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Loader2 } from "lucide-react";
import AvatarCropDialog from '@/components/profile/AvatarCropDialog';

export default function AvatarUploader({ currentAvatar, displayName, onAvatarUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function handleFileSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    if (file.size > 5 * 1024 * 1024) return setError('File size must be less than 5MB.');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setError('Only JPG, PNG, and WEBP files are allowed.');
    setSelectedFile(file);
  }

  async function savePhoto(file) {
    setUploading(true); setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      if (!file_url) throw new Error('Upload did not return a photo.');
      await onAvatarUpdate(file_url);
      setSelectedFile(null);
    } catch { setError('Could not finish saving your photo. Please try again.'); }
    finally { setUploading(false); }
  }

  async function handleRemove() {
    setUploading(true); setError('');
    try { await onAvatarUpdate(null); }
    catch { setError('Could not finish removing your photo. Please try again.'); }
    finally { setUploading(false); }
  }

  return (
    <Card>
      <CardContent className="bg-purple-100 pt-6 p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="w-32 h-32 ring-4 ring-slate-100">
              <AvatarImage src={currentAvatar} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                {displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {currentAvatar && !uploading &&
            <button
              type="button"
              aria-label="Remove profile photo"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">

                <X className="w-4 h-4" />
              </button>
            }
            {uploading &&
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            }
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-slate-900 mb-1">Profile Photo</p>
            <p className="text-xs text-slate-500 mb-3">
              JPG, PNG, or WEBP • Max 5MB • Crop and rotate before saving
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden" />

            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2">

              <Upload className="w-4 h-4" />
              {currentAvatar ? 'Change Photo' : 'Upload Photo'}
            </Button>
          </div>
        </div>
        {!selectedFile && error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
        {selectedFile && <AvatarCropDialog file={selectedFile} busy={uploading} errorMessage={error} onClose={() => setSelectedFile(null)} onSave={savePhoto} />}
      </CardContent>
    </Card>);

}