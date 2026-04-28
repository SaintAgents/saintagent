import React, { useState, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, ExternalLink, X } from "lucide-react";

function getEmbedUrl(url) {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0` };
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
  // Direct media file (mp3, mp4, webm, ogg, wav)
  if (/\.(mp3|wav|ogg|m4a)(\?|$)/i.test(url)) return { type: 'audio', embedUrl: url };
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { type: 'video', embedUrl: url };
  // Zoom — can't embed, fallback
  if (url.includes('zoom.us')) return { type: 'external', embedUrl: url };
  // Spotify
  if (url.includes('open.spotify.com')) {
    const spotifyUrl = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
    return { type: 'spotify', embedUrl: spotifyUrl };
  }
  // Default: try iframe
  return { type: 'iframe', embedUrl: url };
}

export default function EmbeddedMediaPlayer({ url, title, onClose }) {
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const media = getEmbedUrl(url);
  if (!media) return null;

  // External-only (Zoom etc) — show message + link
  if (media.type === 'external') {
    return (
      <div className="rounded-xl border bg-slate-900 p-6 text-center">
        <p className="text-white/70 text-sm mb-3">This episode streams on an external platform</p>
        <Button
          className="gap-2 bg-violet-600 hover:bg-violet-700"
          onClick={() => window.open(url, '_blank')}
        >
          <ExternalLink className="w-4 h-4" /> Open in New Tab
        </Button>
      </div>
    );
  }

  // Audio player
  if (media.type === 'audio') {
    return (
      <div className="rounded-xl border bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-violet-600/30 flex items-center justify-center shrink-0">
            <Volume2 className="w-6 h-6 text-violet-300" />
          </div>
          <div className="flex-1 min-w-0">
            {title && <p className="text-sm font-medium text-white truncate mb-1">{title}</p>}
            <audio
              ref={audioRef}
              controls
              className="w-full h-10"
              style={{ filter: 'invert(1) hue-rotate(180deg) brightness(0.8)' }}
            >
              <source src={media.embedUrl} />
            </audio>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Native video player
  if (media.type === 'video') {
    return (
      <div className="rounded-xl overflow-hidden border bg-black relative group">
        {onClose && (
          <button onClick={onClose} className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
        <video
          ref={videoRef}
          controls
          className="w-full max-h-[400px]"
          poster=""
        >
          <source src={media.embedUrl} />
        </video>
      </div>
    );
  }

  // YouTube / Vimeo / Spotify / generic iframe
  return (
    <div className="rounded-xl overflow-hidden border bg-black relative">
      {onClose && (
        <button onClick={onClose} className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/70 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      )}
      <div className={cn(
        "w-full",
        media.type === 'spotify' ? "h-[160px]" : "aspect-video"
      )}>
        <iframe
          src={media.embedUrl}
          className="w-full h-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          title={title || 'Episode Player'}
        />
      </div>
    </div>
  );
}