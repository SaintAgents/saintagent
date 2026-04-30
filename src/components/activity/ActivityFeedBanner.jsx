import React, { useState, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ActivityFeedBanner({ context = 'activity' }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const { data: settings } = useQuery({
    queryKey: ['platformSettings', 'activity_banner'],
    queryFn: () => base44.entities.PlatformSetting.filter({ key: 'activity_banner' }),
    staleTime: 300000,
  });

  const banner = React.useMemo(() => {
    if (!settings?.[0]?.value) return null;
    try {
      const parsed = JSON.parse(settings[0].value);
      if (context === 'commanddeck') {
        return parsed.show_on_command_deck ? parsed : null;
      }
      return parsed.enabled ? parsed : null;
    } catch { return null; }
  }, [settings]);

  if (!banner) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } 
    else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(isNaN(pct) ? 0 : pct);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  const align = banner.layout === 'center' ? 'items-center text-center' : banner.layout === 'right' ? 'items-end text-right' : 'items-start text-left';

  return (
    <div className="w-full mb-8 rounded-none md:rounded-xl overflow-hidden shadow-lg relative" style={{ height: 300, backgroundColor: banner.bg_color }}>
      {/* Background Image */}
      {banner.image_url && (
        <>
          <img src={banner.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" data-no-filter="true" />
          <div className="absolute inset-0" style={{ backgroundColor: banner.bg_color, opacity: (banner.overlay_opacity || 50) / 100 }} />
        </>
      )}

      {/* Content */}
      <div className={`relative z-10 flex flex-col justify-center h-full px-6 md:px-10 ${align}`}>
        <div className="max-w-2xl">
          {banner.title && (
            <h2 className="text-2xl md:text-4xl font-bold leading-tight" style={{ color: banner.text_color }}>
              {banner.title}
            </h2>
          )}
          {banner.subtitle && (
            <p className="text-base md:text-lg mt-2 opacity-85" style={{ color: banner.text_color }}>
              {banner.subtitle}
            </p>
          )}
          {banner.description && (
            <p className="text-sm md:text-base mt-3 opacity-70 line-clamp-2" style={{ color: banner.text_color }}>
              {banner.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3 flex-wrap" style={{ justifyContent: banner.layout === 'center' ? 'center' : banner.layout === 'right' ? 'flex-end' : 'flex-start' }}>
            {/* CTA Button */}
            {banner.cta_text && banner.cta_url && (
              <Link to={banner.cta_url}>
                <Button size="sm" className="gap-2 font-semibold shadow-md" style={{ backgroundColor: banner.accent_color, color: banner.bg_color }}>
                  {banner.cta_text}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}

            {/* Audio Player */}
            {banner.audio_url && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
                <button onClick={togglePlay} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: banner.accent_color, color: banner.bg_color }}>
                  {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </button>
                {/* Progress bar */}
                <div className="w-24 md:w-36 h-1.5 rounded-full cursor-pointer" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} onClick={handleSeek}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: banner.accent_color }} />
                </div>
                <button onClick={() => { setMuted(!muted); if (audioRef.current) audioRef.current.muted = !muted; }} className="opacity-70 hover:opacity-100 transition-opacity">
                  {muted ? <VolumeX className="w-3.5 h-3.5" style={{ color: banner.text_color }} /> : <Volume2 className="w-3.5 h-3.5" style={{ color: banner.text_color }} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      {banner.audio_url && (
        <audio
          ref={audioRef}
          src={banner.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => { setPlaying(false); setProgress(0); }}
          preload="metadata"
        />
      )}
    </div>
  );
}