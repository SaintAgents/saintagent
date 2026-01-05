import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Paperclip, Image, Video, FileText, Mic, X, Upload, Loader2 } from "lucide-react";

export default function MediaAttachment({ onAttach }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [recordingAudio, setRecordingAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleFileSelect = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Show preview for images
      if (type === 'image' && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview({ type: 'image', url: e.target.result });
        reader.readAsDataURL(file);
      }

      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      onAttach({
        type,
        url: file_url,
        fileName: file.name,
        fileSize: file.size,
        thumbnail: type === 'image' ? file_url : null
      });
      
      setOpen(false);
      setPreview(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setUploading(true);
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: audioBlob });
          onAttach({
            type: 'audio',
            url: file_url,
            fileName: 'Voice message.webm',
            fileSize: audioBlob.size
          });
          setOpen(false);
        } catch (error) {
          console.error('Audio upload failed:', error);
        } finally {
          setUploading(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingAudio(true);
    } catch (error) {
      console.error('Could not start recording:', error);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && recordingAudio) {
      mediaRecorderRef.current.stop();
      setRecordingAudio(false);
    }
  };

  const attachmentTypes = [
    { type: 'image', icon: Image, label: 'Photo', accept: 'image/*', color: 'text-emerald-500' },
    { type: 'video', icon: Video, label: 'Video', accept: 'video/*', color: 'text-blue-500' },
    { type: 'file', icon: FileText, label: 'File', accept: '*/*', color: 'text-amber-500' }
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          title="Attach media"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        {uploading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            <span className="ml-2 text-sm text-slate-600">Uploading...</span>
          </div>
        ) : recordingAudio ? (
          <div className="p-4 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
              <Mic className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-sm text-slate-600 mb-3">Recording...</p>
            <Button onClick={stopAudioRecording} variant="destructive" size="sm">
              Stop Recording
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {attachmentTypes.map((item) => (
                <button
                  key={item.type}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={item.accept}
                    onChange={(e) => handleFileSelect(e, item.type)}
                    className="hidden"
                  />
                  <div className={cn("w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center", item.color)}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-600">{item.label}</span>
                </button>
              ))}
              
              {/* Voice Message */}
              <button
                onClick={startAudioRecording}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-rose-500">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-600">Voice</span>
              </button>
            </div>

            {preview && (
              <div className="mt-3 relative">
                <img src={preview.url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => setPreview(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}