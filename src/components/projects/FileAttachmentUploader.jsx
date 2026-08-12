import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Paperclip, X, Upload, Loader2, FileText, Image, File, ExternalLink } from 'lucide-react';

const FILE_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.csv,.txt,.zip,.mp4,.mp3,.wav,.svg,.json,.html,.md";

function getFileIcon(name) {
  if (!name) return File;
  const ext = name.split('.').pop()?.toLowerCase();
  if (['png','jpg','jpeg','gif','svg','webp'].includes(ext)) return Image;
  if (['pdf','doc','docx','txt','md','html'].includes(ext)) return FileText;
  return File;
}

export default function FileAttachmentUploader({ files = [], onChange, maxFiles = 10, label = "Attach Files" }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    
    const remaining = maxFiles - files.length;
    const toUpload = selectedFiles.slice(0, remaining);
    if (!toUpload.length) return;

    setUploading(true);
    const newFiles = [];
    for (const file of toUpload) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newFiles.push({ url: file_url, name: file.name, size: file.size });
    }
    onChange([...files, ...newFiles]);
    setUploading(false);
    e.target.value = '';
  };

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        multiple
        accept={FILE_ACCEPT}
        className="hidden"
        ref={fileInputRef}
        onChange={handleUpload}
      />

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => {
            const Icon = getFileIcon(file.name);
            return (
              <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 group">
                <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="max-w-[160px] truncate hover:text-violet-600 hover:underline">
                  {file.name || 'Document'}
                </a>
                <button
                  onClick={() => removeFile(i)}
                  className="ml-0.5 p-0.5 rounded hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {files.length < maxFiles && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? 'Uploading...' : label}
        </Button>
      )}
    </div>
  );
}

export function FileAttachmentDisplay({ files = [] }) {
  if (!files?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {files.map((file, i) => {
        const Icon = getFileIcon(file.name);
        return (
          <a
            key={i}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-colors"
          >
            <Icon className="w-3 h-3" />
            <span className="max-w-[140px] truncate">{file.name || 'Document'}</span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
        );
      })}
    </div>
  );
}