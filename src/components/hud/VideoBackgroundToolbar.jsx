import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Film, X, ChevronDown, Upload, Play, Pause, Settings2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const STORAGE_KEY = 'videoBgSettings';
const SURFACES = [
  { key: 'global', label: 'All Pages' },
  { key: 'commandDeck', label: 'Command Deck' },
  { key: 'profile', label: 'Profile' },
  { key: 'missions', label: 'Missions' },
  { key: 'projects', label: 'Projects' },
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'messages', label: 'Messages' },
];

function getSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('videoBgSettingsChanged'));
  } catch {}
}

export default function VideoBackgroundToolbar() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeSurface, setActiveSurface] = useState('global');
  const [settings, setSettings] = useState(getSettings);
  const [uploading, setUploading] = useState(false);
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('videoBgToolbarPos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { x: 20, y: window.innerHeight - 80 };
  });
  const dragRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const surfaceConfig = settings[activeSurface] || {
    videoUrl: '',
    enabled: false,
    opacity: 0.3,
    speed: 1,
    blur: 0,
    themeFilter: 'both',
  };

  const updateSurface = (updates) => {
    const newSettings = {
      ...settings,
      [activeSurface]: { ...surfaceConfig, ...updates },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateSurface({ videoUrl: file_url, enabled: true });
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleUrlPaste = (url) => {
    if (url.trim()) {
      updateSurface({ videoUrl: url.trim(), enabled: true });
    }
  };

  const clearVideo = () => {
    updateSurface({ videoUrl: '', enabled: false });
  };

  // Dragging logic
  const onPointerDown = (e) => {
    if (e.target.closest('button, input, select, label, [role="slider"], [role="combobox"]')) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onPointerMove = (e) => {
      if (!isDragging.current) return;
      const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragStart.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragStart.current.y));
      setPosition({ x: newX, y: newY });
    };
    const onPointerUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        try { localStorage.setItem('videoBgToolbarPos', JSON.stringify(position)); } catch {}
      }
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [position]);

  // Any surface has a video?
  const hasAnyVideo = Object.values(settings).some(s => s?.videoUrl && s?.enabled);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed z-50 p-2.5 rounded-full shadow-lg border transition-all hover:scale-110"
        style={{
          left: position.x,
          top: position.y,
          background: hasAnyVideo
            ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
            : 'rgba(15, 23, 42, 0.85)',
          borderColor: hasAnyVideo ? '#a78bfa' : '#334155',
        }}
        title="Video Backgrounds"
      >
        <Film className="w-5 h-5 text-white" />
        {hasAnyVideo && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
        )}
      </button>
    );
  }

  return (
    <div
      ref={dragRef}
      className="fixed z-50 rounded-xl shadow-2xl border overflow-hidden"
      style={{
        left: position.x,
        top: Math.min(position.y, window.innerHeight - (expanded ? 460 : 120)),
        width: expanded ? 320 : 280,
        background: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        backdropFilter: 'blur(12px)',
        cursor: 'default',
      }}
      onPointerDown={onPointerDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 text-slate-500" />
          <Film className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">Video BG</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Surface selector */}
      <div className="px-3 py-2 border-b border-slate-700/30">
        <div className="flex flex-wrap gap-1">
          {SURFACES.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSurface(s.key)}
              className={`px-2 py-0.5 text-xs rounded-full transition-all ${
                activeSurface === s.key
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              {s.label}
              {settings[s.key]?.videoUrl && settings[s.key]?.enabled && (
                <span className="ml-1 inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Video source */}
      <div className="px-3 py-2 space-y-2">
        {surfaceConfig.videoUrl ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-800 rounded px-2 py-1 flex items-center gap-2 min-w-0">
              <Play className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 truncate">{surfaceConfig.videoUrl.split('/').pop()}</span>
            </div>
            <button
              onClick={() => updateSurface({ enabled: !surfaceConfig.enabled })}
              className="p-1 rounded hover:bg-slate-700/50 transition-colors"
              title={surfaceConfig.enabled ? 'Disable' : 'Enable'}
            >
              {surfaceConfig.enabled
                ? <Eye className="w-3.5 h-3.5 text-emerald-400" />
                : <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              }
            </button>
            <button
              onClick={clearVideo}
              className="p-1 rounded hover:bg-red-900/50 text-slate-500 hover:text-red-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-dashed border-slate-600 cursor-pointer hover:border-violet-500 transition-colors">
              <input type="file" accept="video/*" onChange={handleUpload} className="hidden" />
              {uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-500 border-t-transparent" />
              ) : (
                <Upload className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-xs text-slate-400">Upload video</span>
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Or paste video URL..."
                className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUrlPaste(e.target.value);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded controls */}
      {expanded && surfaceConfig.videoUrl && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-700/30 pt-2">
          {/* Opacity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-slate-400">Opacity</Label>
              <span className="text-xs text-slate-500">{Math.round((surfaceConfig.opacity ?? 0.3) * 100)}%</span>
            </div>
            <Slider
              value={[Math.round((surfaceConfig.opacity ?? 0.3) * 100)]}
              min={5}
              max={100}
              step={5}
              onValueChange={([v]) => updateSurface({ opacity: v / 100 })}
              className="w-full"
            />
          </div>

          {/* Speed */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-slate-400">Speed</Label>
              <span className="text-xs text-slate-500">{(surfaceConfig.speed ?? 1).toFixed(1)}x</span>
            </div>
            <Slider
              value={[Math.round((surfaceConfig.speed ?? 1) * 10)]}
              min={1}
              max={30}
              step={1}
              onValueChange={([v]) => updateSurface({ speed: v / 10 })}
              className="w-full"
            />
          </div>

          {/* Blur */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-slate-400">Blur</Label>
              <span className="text-xs text-slate-500">{surfaceConfig.blur ?? 0}px</span>
            </div>
            <Slider
              value={[surfaceConfig.blur ?? 0]}
              min={0}
              max={20}
              step={1}
              onValueChange={([v]) => updateSurface({ blur: v })}
              className="w-full"
            />
          </div>

          {/* Theme filter */}
          <div>
            <Label className="text-xs text-slate-400 mb-1 block">Show on theme</Label>
            <div className="flex gap-1">
              {[
                { key: 'both', label: 'All' },
                { key: 'light', label: 'Light' },
                { key: 'dark', label: 'Dark' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => updateSurface({ themeFilter: opt.key })}
                  className={`px-2.5 py-1 text-xs rounded transition-all ${
                    (surfaceConfig.themeFilter || 'both') === opt.key
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}