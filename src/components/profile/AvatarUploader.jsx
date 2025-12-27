import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AvatarUploader({ currentAvatar, displayName, onAvatarUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, PNG, and WEBP files are allowed');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      await onAvatarUpdate(result.file_url);
      setPreview(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setPreview(null);
    await onAvatarUpdate(null);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="w-32 h-32 ring-4 ring-slate-100">
              <AvatarImage src={preview || currentAvatar} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                {displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {(currentAvatar || preview) && !uploading && (
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-slate-900 mb-1">Profile Photo</p>
            <p className="text-xs text-slate-500 mb-3">
              JPG, PNG, or WEBP • Max 5MB • Square recommended
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {currentAvatar ? 'Change Photo' : 'Upload Photo'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}