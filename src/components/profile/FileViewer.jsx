import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, Loader2, FileText, Image, Film, Music, File, ExternalLink } from 'lucide-react';

export default function FileViewer({ file, sharedFile, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(null);

  // Determine file info from either file or sharedFile
  const fileName = file?.file_name || sharedFile?.file_name || 'File';
  const mimeType = file?.mime_type || sharedFile?.mime_type || '';
  const isImage = mimeType?.startsWith('image');
  const isVideo = mimeType?.startsWith('video');
  const isAudio = mimeType?.startsWith('audio');
  const isPDF = mimeType === 'application/pdf';

  useEffect(() => {
    if (!open) {
      setFileUrl(null);
      setError(null);
      return;
    }

    const loadFile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = null;
        
        if (file) {
          // Direct file access
          if (file.is_private_storage && file.file_uri) {
            const result = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: file.file_uri });
            url = result.signed_url;
          } else {
            url = file.file_url;
          }
        } else if (sharedFile) {
          // Shared file - need to look up the original UserFile
          const userFiles = await base44.entities.UserFile.filter({ id: sharedFile.user_file_id });
          const originalFile = userFiles?.[0];
          
          if (!originalFile) {
            setError('File no longer exists');
            setLoading(false);
            return;
          }
          
          if (originalFile.is_private_storage && originalFile.file_uri) {
            const result = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: originalFile.file_uri });
            url = result.signed_url;
          } else {
            url = originalFile.file_url;
          }
        }
        
        setFileUrl(url);
      } catch (err) {
        console.error('Error loading file:', err);
        setError('Failed to load file');
      }
      
      setLoading(false);
    };

    loadFile();
  }, [open, file, sharedFile]);

  const handleDownload = async () => {
    if (!fileUrl) return;
    
    try {
      // Fetch the file as a blob
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      
      // Mark shared file as downloaded if applicable
      if (sharedFile?.status === 'pending') {
        await base44.entities.SharedFile.update(sharedFile.id, { status: 'downloaded' });
      }
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback to opening in new tab
      window.open(fileUrl, '_blank');
    }
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm">Loading file...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <File className="h-12 w-12 mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (!fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <File className="h-12 w-12 mb-2" />
          <p className="text-sm">Unable to load file</p>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex items-center justify-center max-h-[60vh] overflow-auto">
          <img 
            src={fileUrl} 
            alt={fileName} 
            className="max-w-full max-h-[60vh] object-contain rounded-lg"
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <video 
          src={fileUrl} 
          controls 
          className="w-full max-h-[60vh] rounded-lg"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (isAudio) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Music className="h-16 w-16 text-violet-500 mb-4" />
          <audio src={fileUrl} controls className="w-full max-w-md">
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    if (isPDF) {
      return (
        <iframe 
          src={fileUrl} 
          className="w-full h-[60vh] rounded-lg border"
          title={fileName}
        />
      );
    }

    // For other file types, show icon and download option
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-20 w-20 text-slate-300 mb-4" />
        <p className="text-lg font-medium text-slate-700 mb-2">{fileName}</p>
        <p className="text-sm text-slate-500 mb-4">This file type cannot be previewed</p>
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download File
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span className="truncate">{fileName}</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview and download file
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {renderPreview()}
        </div>
        
        {fileUrl && !loading && !error && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => window.open(fileUrl, '_blank')} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
            <Button onClick={handleDownload} className="gap-2 bg-violet-600 hover:bg-violet-700">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}