import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, CheckCheck, Trash2, Play, Pause, FileText, Download, Sparkles, Image as ImageIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function MessageBubble({ 
  msg, 
  isOwn, 
  onDelete, 
  onImageClick,
  showAvatar = true 
}) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = React.useRef(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  const renderContent = () => {
    const messageType = msg.message_type || 'text';

    switch (messageType) {
      case 'image':
        return (
          <div className="relative">
            <img
              src={msg.media_url}
              alt="Shared image"
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onImageClick?.(msg.media_url)}
            />
            {msg.content && (
              <p className="text-sm mt-2">{msg.content}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="relative">
            <video
              src={msg.media_url}
              controls
              className="max-w-xs rounded-lg"
            />
            {msg.content && (
              <p className="text-sm mt-2">{msg.content}</p>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <button
              onClick={toggleAudio}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                isOwn ? "bg-white/20 hover:bg-white/30" : "bg-violet-100 hover:bg-violet-200"
              )}
            >
              {audioPlaying ? (
                <Pause className={cn("w-5 h-5", isOwn ? "text-white" : "text-violet-600")} />
              ) : (
                <Play className={cn("w-5 h-5", isOwn ? "text-white" : "text-violet-600")} />
              )}
            </button>
            <div className="flex-1">
              <div className={cn(
                "h-1 rounded-full",
                isOwn ? "bg-white/30" : "bg-violet-200"
              )}>
                <div className={cn(
                  "h-full rounded-full w-0 transition-all",
                  isOwn ? "bg-white" : "bg-violet-500"
                )} style={{ width: audioPlaying ? '50%' : '0%' }} />
              </div>
              <p className={cn("text-xs mt-1", isOwn ? "text-white/70" : "text-slate-500")}>
                Voice message
              </p>
            </div>
            <audio
              ref={audioRef}
              src={msg.media_url}
              onEnded={() => setAudioPlaying(false)}
              className="hidden"
            />
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isOwn ? "bg-white/20" : "bg-amber-100"
            )}>
              <FileText className={cn("w-5 h-5", isOwn ? "text-white" : "text-amber-600")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium truncate", isOwn ? "text-white" : "text-slate-900")}>
                {msg.file_name || 'File'}
              </p>
              <p className={cn("text-xs", isOwn ? "text-white/70" : "text-slate-500")}>
                {msg.file_size ? `${(msg.file_size / 1024).toFixed(1)} KB` : 'File'}
              </p>
            </div>
            <a
              href={msg.media_url}
              download={msg.file_name}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                isOwn ? "bg-white/20 hover:bg-white/30" : "bg-slate-100 hover:bg-slate-200"
              )}
            >
              <Download className={cn("w-4 h-4", isOwn ? "text-white" : "text-slate-600")} />
            </a>
          </div>
        );

      case 'icebreaker':
        return (
          <div>
            <div className={cn(
              "flex items-center gap-1.5 text-xs mb-2",
              isOwn ? "text-white/80" : "text-violet-600"
            )}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Icebreaker</span>
            </div>
            <p className={cn(
              "text-sm italic",
              isOwn ? "text-white/90" : "text-slate-600"
            )}>
              "{msg.icebreaker_prompt}"
            </p>
            {msg.content && msg.content !== msg.icebreaker_prompt && (
              <p className="text-sm mt-2">{msg.content}</p>
            )}
          </div>
        );

      default:
        return <p className="text-sm dark:text-white">{msg.content}</p>;
    }
  };

  return (
    <div className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
      {showAvatar && (
        <Avatar className="w-8 h-8 cursor-pointer shrink-0" data-user-id={msg.from_user_id}>
          <AvatarImage src={msg.from_avatar} />
          <AvatarFallback>{msg.from_name?.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-md", isOwn && "flex flex-col items-end")}>
        <div className={cn(
          "px-4 py-2 rounded-2xl",
          isOwn
            ? "bg-violet-600 text-white rounded-br-sm"
            : "bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[rgba(0,255,136,0.2)] rounded-bl-sm"
        )}>
          {renderContent()}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 px-1">
            {format(parseISO(msg.created_date), 'MMM d, h:mm a')}
          </p>
          {isOwn && (
            <span className="mt-1 text-xs">
              {msg.is_read ? (
                <span className="flex items-center gap-0.5">
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  {msg.read_at && (
                    <span className="text-[10px] text-slate-400">
                      Read
                    </span>
                  )}
                </span>
              ) : Array.isArray(msg.delivered_for_user_ids) && msg.delivered_for_user_ids.length > 0 ? (
                <CheckCheck className="w-4 h-4 text-slate-400" />
              ) : (
                <Check className="w-4 h-4 text-slate-400" />
              )}
            </span>
          )}
          {isOwn && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mt-0.5 text-slate-400 hover:text-rose-600"
              onClick={onDelete}
              title="Delete for me"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}