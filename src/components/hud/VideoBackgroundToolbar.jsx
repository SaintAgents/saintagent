import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import {
  HelpCircle, Eye, Sun, Moon, Terminal, Sparkles, Layers, PanelLeft,
  Bell, LogOut, Download, PanelRightClose, PanelRightOpen, Upload,
  Play, X, Volume2, VolumeX, ChevronDown
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { VIDEO_LIBRARY, VIDEO_CATEGORIES } from './videoLibrary';

const STORAGE_KEY = 'videoBgSettings';
const SURFACE_OPACITY_KEY = 'surfaceOpacitySettings';
const SIDEBAR_OPACITY_KEY = 'sidebarOpacitySettings';

const SURFACES = [
  { key: 'global', label: 'All Pages' },
  { key: 'commandDeck', label: 'Command Deck' },
  { key: 'profile', label: 'Profile' },
  { key: 'missions', label: 'Missions' },
  { key: 'projects', label: 'Projects' },
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'messages', label: 'Messages' },
];

function getSettings(key) {
  try { const s = localStorage.getItem(key); if (s) return JSON.parse(s); } catch {} return {};
}
function saveSettings(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export default function VideoBackgroundToolbar({ theme, onThemeToggle, currentPageName }) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('masterToolbarCollapsed') === 'true'; } catch { return false; }
  });
  const [activePanel, setActivePanel] = useState(null); // 'hero' | 'effects' | 'surface' | 'sidebar' | 'help'
  const [videoSettings, setVideoSettings] = useState(() => getSettings(STORAGE_KEY));
  const [surfaceOpacity, setSurfaceOpacity] = useState(() => {
    const saved = getSettings(SURFACE_OPACITY_KEY);
    return {
      surfaceOpacity: 85, heroOpacity: 30, bgOpacity: 90, contentStart: 0,
      whiteWash: 0, cardBg: 90, cardOpacity: 95, cmdBackdrop: 85, applyAll: true,
      ...saved,
    };
  });
  const [sidebarSettings, setSidebarSettings] = useState(() => {
    const saved = getSettings(SIDEBAR_OPACITY_KEY);
    return { sidebarOpacity: 100, sidebarBg: 90, fontBrightness: 100, ...saved };
  });
  const [activeSurface, setActiveSurface] = useState('global');
  const [uploading, setUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryCategory, setLibraryCategory] = useState('all');
  const [helpOpen, setHelpOpen] = useState(false);
  const panelRef = useRef(null);

  const surfaceConfig = videoSettings[activeSurface] || {
    videoUrl: '', enabled: false, opacity: 0.3, speed: 1, blur: 0, themeFilter: 'both', muted: true,
  };

  const updateVideoSurface = (updates) => {
    const newSettings = { ...videoSettings, [activeSurface]: { ...surfaceConfig, ...updates } };
    setVideoSettings(newSettings);
    saveSettings(STORAGE_KEY, newSettings);
    window.dispatchEvent(new Event('videoBgSettingsChanged'));
  };

  const updateSurfaceOpacity = (updates) => {
    const merged = { ...surfaceOpacity, ...updates };
    setSurfaceOpacity(merged);
    saveSettings(SURFACE_OPACITY_KEY, merged);
    window.dispatchEvent(new CustomEvent('surfaceOpacityChanged', { detail: merged }));
  };

  const updateSidebar = (updates) => {
    const merged = { ...sidebarSettings, ...updates };
    setSidebarSettings(merged);
    saveSettings(SIDEBAR_OPACITY_KEY, merged);
    window.dispatchEvent(new CustomEvent('sidebarOpacityChanged', { detail: merged }));
  };

  const selectLibraryVideo = (video) => {
    updateVideoSurface({ videoUrl: video.url, enabled: true });
    setShowLibrary(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateVideoSurface({ videoUrl: file_url, enabled: true });
    } catch {}
    setUploading(false);
    e.target.value = '';
  };

  // Persist collapse state
  useEffect(() => {
    try { localStorage.setItem('masterToolbarCollapsed', String(collapsed)); } catch {}
  }, [collapsed]);

  // Close panel on outside click
  useEffect(() => {
    if (!activePanel) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('[data-toolbar-btn]')) {
        setActivePanel(null);
        setShowLibrary(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activePanel]);

  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
    setShowLibrary(false);
  };

  const isHacker = theme === 'hacker';
  const isDark = theme === 'dark' || isHacker;
  const accentColor = isHacker ? '#00ff00' : '#d4a017';
  const borderColor = isHacker ? '#00ff00' : '#d4a01740';
  const bgColor = isHacker ? 'rgba(0,0,0,0.95)' : 'rgba(10,15,30,0.92)';

  const hasAnyVideo = Object.values(videoSettings).some(s => s?.videoUrl && s?.enabled);

  // Collapsed state — small tab
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed z-50 right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-l-lg shadow-lg border border-r-0"
        style={{ background: bgColor, borderColor }}
      >
        <PanelRightOpen className="w-4 h-4" style={{ color: accentColor }} />
      </button>
    );
  }

  const btnClass = (active) =>
    `p-2 rounded-lg transition-all hover:scale-110 ${active ? 'ring-1' : ''}`;

  const filteredLibrary = libraryCategory === 'all'
    ? VIDEO_LIBRARY
    : VIDEO_LIBRARY.filter(v => v.category === libraryCategory);

  return (
    <>
      {/* Main Toolbar Bar */}
      <div
        className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full shadow-2xl border"
        style={{
          background: bgColor,
          borderColor,
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Help */}
        <button
          data-toolbar-btn
          onClick={() => setHelpOpen(!helpOpen)}
          className={btnClass(helpOpen)}
          title="Help"
          style={{ color: accentColor }}
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="w-px h-6 mx-0.5" style={{ background: borderColor }} />

        {/* Hero Background / Video */}
        <button
          data-toolbar-btn
          onClick={() => togglePanel('hero')}
          className={btnClass(activePanel === 'hero')}
          title="Hero / Video Background"
          style={{ color: activePanel === 'hero' ? '#fff' : accentColor, ringColor: accentColor }}
        >
          <Eye className="w-5 h-5" />
          {hasAnyVideo && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />}
        </button>

        {/* Light / Dark toggle */}
        <button
          data-toolbar-btn
          onClick={() => {
            const next = theme === 'light' ? 'dark' : 'light';
            if (onThemeToggle) onThemeToggle(next);
          }}
          className={btnClass(false)}
          title={isDark ? 'Switch to Light' : 'Switch to Dark'}
          style={{ color: accentColor }}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Matrix / Hacker toggle */}
        <button
          data-toolbar-btn
          onClick={() => {
            const next = isHacker ? 'dark' : 'hacker';
            if (onThemeToggle) onThemeToggle(next);
          }}
          className={btnClass(isHacker)}
          title="Matrix Theme"
          style={{ color: isHacker ? '#00ff00' : accentColor }}
        >
          <Terminal className="w-5 h-5" />
        </button>

        <div className="w-px h-6 mx-0.5" style={{ background: borderColor }} />

        {/* Background Effects */}
        <button
          data-toolbar-btn
          onClick={() => togglePanel('effects')}
          className={btnClass(activePanel === 'effects')}
          title="Background Effects"
          style={{ color: activePanel === 'effects' ? '#fff' : accentColor }}
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Surface Opacity */}
        <button
          data-toolbar-btn
          onClick={() => togglePanel('surface')}
          className={btnClass(activePanel === 'surface')}
          title="Surface Opacity"
          style={{ color: activePanel === 'surface' ? '#fff' : accentColor }}
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* Sidebar Transparency */}
        <button
          data-toolbar-btn
          onClick={() => togglePanel('sidebar')}
          className={btnClass(activePanel === 'sidebar')}
          title="Sidebar Transparency"
          style={{ color: activePanel === 'sidebar' ? '#fff' : accentColor }}
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <div className="w-px h-6 mx-0.5" style={{ background: borderColor }} />

        {/* Notifications */}
        <button
          data-toolbar-btn
          onClick={() => { window.location.href = '/Notifications'; }}
          className={btnClass(false)}
          title="Notifications"
          style={{ color: accentColor }}
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Log out */}
        <button
          data-toolbar-btn
          onClick={() => { base44.auth.logout('/'); }}
          className={btnClass(false)}
          title="Log Out"
          style={{ color: accentColor }}
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* Collapse */}
        <button
          data-toolbar-btn
          onClick={() => setCollapsed(true)}
          className={btnClass(false)}
          title="Collapse Toolbar"
          style={{ color: accentColor }}
        >
          <PanelRightClose className="w-5 h-5" />
        </button>
      </div>

      {/* Help Overlay */}
      {helpOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={() => setHelpOpen(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto text-sm text-slate-300 space-y-3" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><HelpCircle className="w-5 h-5 text-amber-400" /> Toolbar Guide</h2>
            <div className="space-y-2">
              <p><strong className="text-amber-400">👁 Hero Background</strong> — Select video backgrounds per page or globally. Browse the library or upload your own.</p>
              <p><strong className="text-amber-400">☀ Light/Dark</strong> — Toggle between light and dark color schemes.</p>
              <p><strong className="text-amber-400">⌨ Matrix</strong> — Activate green terminal overlay on dark mode.</p>
              <p><strong className="text-amber-400">✨ Effects</strong> — Particle/visual overlays: Starfield, Matrix Rain, Nebula, Circuit, Fractal.</p>
              <p><strong className="text-amber-400">◈ Surface Opacity</strong> — Control transparency of content surfaces, hero, cards, and backgrounds.</p>
              <p><strong className="text-amber-400">◧ Sidebar</strong> — Adjust sidebar opacity, background, and font brightness.</p>
            </div>
            <button onClick={() => setHelpOpen(false)} className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700">Got it</button>
          </div>
        </div>
      )}

      {/* Panels */}
      {activePanel && (
        <div
          ref={panelRef}
          className="fixed z-50 bottom-16 left-1/2 -translate-x-1/2 rounded-xl shadow-2xl border overflow-hidden"
          style={{
            width: activePanel === 'hero' ? 380 : 340,
            maxHeight: 'calc(100vh - 100px)',
            background: bgColor,
            borderColor,
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="overflow-y-auto max-h-[calc(100vh-100px)]">
            {/* HERO / VIDEO PANEL */}
            {activePanel === 'hero' && (
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="w-4 h-4" style={{ color: accentColor }} /> Hero / Video Background
                  </h3>
                  <button onClick={() => setActivePanel(null)} className="p-1 rounded hover:bg-slate-700/50 text-slate-400"><X className="w-4 h-4" /></button>
                </div>

                {/* Surface selector */}
                <div className="flex flex-wrap gap-1">
                  {SURFACES.map(s => (
                    <button
                      key={s.key}
                      onClick={() => setActiveSurface(s.key)}
                      className={`px-2 py-0.5 text-xs rounded-full transition-all ${
                        activeSurface === s.key
                          ? 'text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      style={activeSurface === s.key ? { background: accentColor + '30', border: `1px solid ${accentColor}` } : { background: 'rgba(51,65,85,0.5)' }}
                    >
                      {s.label}
                      {videoSettings[s.key]?.videoUrl && videoSettings[s.key]?.enabled && (
                        <span className="ml-1 inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Current video */}
                {surfaceConfig.videoUrl ? (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-video bg-black">
                      <video src={surfaceConfig.videoUrl} autoPlay loop muted={surfaceConfig.muted !== false} playsInline className="w-full h-full object-cover" style={{ opacity: surfaceConfig.opacity ?? 0.3 }} />
                      <div className="absolute bottom-1 right-1 flex gap-1">
                        <button onClick={() => updateVideoSurface({ muted: !(surfaceConfig.muted !== false) })} className="p-1 bg-black/60 rounded text-white">
                          {surfaceConfig.muted !== false ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        </button>
                        <button onClick={() => updateVideoSurface({ enabled: !surfaceConfig.enabled })} className="p-1 bg-black/60 rounded">
                          <Eye className={`w-3 h-3 ${surfaceConfig.enabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                        </button>
                        <button onClick={() => updateVideoSurface({ videoUrl: '', enabled: false })} className="p-1 bg-black/60 rounded text-red-400"><X className="w-3 h-3" /></button>
                      </div>
                    </div>

                    {/* Sliders */}
                    <SliderRow label="Opacity" value={Math.round((surfaceConfig.opacity ?? 0.3) * 100)} min={5} max={100} step={5} onChange={v => updateVideoSurface({ opacity: v / 100 })} accent={accentColor} unit="%" />
                    <SliderRow label="Speed" value={Math.round((surfaceConfig.speed ?? 1) * 10)} min={1} max={30} step={1} onChange={v => updateVideoSurface({ speed: v / 10 })} accent={accentColor} display={`${((surfaceConfig.speed ?? 1)).toFixed(1)}x`} />
                    <SliderRow label="Blur" value={surfaceConfig.blur ?? 0} min={0} max={20} step={1} onChange={v => updateVideoSurface({ blur: v })} accent={accentColor} unit="px" />

                    {/* Theme filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-20">Theme:</span>
                      <div className="flex gap-1">
                        {[{ key: 'both', l: 'All' }, { key: 'light', l: 'Light' }, { key: 'dark', l: 'Dark' }].map(o => (
                          <button key={o.key} onClick={() => updateVideoSurface({ themeFilter: o.key })}
                            className={`px-2 py-0.5 text-xs rounded ${(surfaceConfig.themeFilter || 'both') === o.key ? 'text-white' : 'text-slate-500'}`}
                            style={(surfaceConfig.themeFilter || 'both') === o.key ? { background: accentColor + '40' } : {}}
                          >{o.l}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button onClick={() => setShowLibrary(!showLibrary)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm text-white" style={{ borderColor, background: 'rgba(51,65,85,0.3)' }}>
                      <span className="flex items-center gap-2"><Play className="w-4 h-4" style={{ color: accentColor }} /> Browse Video Library</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showLibrary ? 'rotate-180' : ''}`} style={{ color: accentColor }} />
                    </button>
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed cursor-pointer hover:border-amber-500/50 transition-colors" style={{ borderColor: borderColor }}>
                      <input type="file" accept="video/*" onChange={handleUpload} className="hidden" />
                      {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" /> : <Upload className="w-4 h-4 text-slate-400" />}
                      <span className="text-xs text-slate-400">Upload video</span>
                    </label>
                    <input type="text" placeholder="Paste video URL + Enter..." className="w-full bg-transparent border rounded px-2 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/50" style={{ borderColor }}
                      onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { updateVideoSurface({ videoUrl: e.target.value.trim(), enabled: true }); } }}
                    />
                  </div>
                )}

                {/* Video Library */}
                {showLibrary && (
                  <div className="space-y-2 border-t border-slate-700/30 pt-2">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => setLibraryCategory('all')} className={`px-2 py-0.5 text-xs rounded-full ${libraryCategory === 'all' ? 'text-white' : 'text-slate-500'}`} style={libraryCategory === 'all' ? { background: accentColor + '30' } : {}}>All</button>
                      {VIDEO_CATEGORIES.map(c => (
                        <button key={c} onClick={() => setLibraryCategory(c)} className={`px-2 py-0.5 text-xs rounded-full ${libraryCategory === c ? 'text-white' : 'text-slate-500'}`} style={libraryCategory === c ? { background: accentColor + '30' } : {}}>{c}</button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                      {filteredLibrary.map(v => (
                        <button key={v.id} onClick={() => selectLibraryVideo(v)} className="relative rounded-lg overflow-hidden aspect-video bg-black group border border-transparent hover:border-amber-500/50 transition-colors">
                          <video src={v.url} muted playsInline preload="metadata" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                            onMouseEnter={e => { try { e.target.currentTime = 0; e.target.play(); } catch {} }}
                            onMouseLeave={e => { try { e.target.pause(); } catch {} }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1">
                            <span className="text-[10px] text-white font-medium leading-tight line-clamp-1">{v.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BACKGROUND EFFECTS PANEL */}
            {activePanel === 'effects' && (
              <EffectsPanel accentColor={accentColor} onClose={() => setActivePanel(null)} />
            )}

            {/* SURFACE OPACITY PANEL */}
            {activePanel === 'surface' && (
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2"><Layers className="w-4 h-4" style={{ color: accentColor }} /> Surface Opacity</h3>
                  <button onClick={() => setActivePanel(null)} className="p-1 rounded hover:bg-slate-700/50 text-slate-400"><X className="w-4 h-4" /></button>
                </div>
                <SliderRow label="Surface Opacity" value={surfaceOpacity.surfaceOpacity} min={0} max={100} onChange={v => updateSurfaceOpacity({ surfaceOpacity: v })} accent={accentColor} unit="%" />
                <SliderRow label="Hero Opacity" value={surfaceOpacity.heroOpacity} min={0} max={100} onChange={v => updateSurfaceOpacity({ heroOpacity: v })} accent={accentColor} unit="%" />
                <SliderRow label="Background Opacity" value={surfaceOpacity.bgOpacity} min={0} max={100} onChange={v => updateSurfaceOpacity({ bgOpacity: v })} accent={accentColor} unit="%" />
                <SliderRow label="Content Start" value={surfaceOpacity.contentStart} min={0} max={800} step={10} onChange={v => updateSurfaceOpacity({ contentStart: v })} accent={accentColor} unit="px" />
                <SliderRow label="White Wash" value={surfaceOpacity.whiteWash} min={0} max={100} onChange={v => updateSurfaceOpacity({ whiteWash: v })} accent={accentColor} unit="%" />
                <SliderRow label="Card Background" value={surfaceOpacity.cardBg} min={0} max={100} onChange={v => updateSurfaceOpacity({ cardBg: v })} accent={accentColor} unit="%" />
                <SliderRow label="Card Opacity" value={surfaceOpacity.cardOpacity} min={0} max={100} onChange={v => updateSurfaceOpacity({ cardOpacity: v })} accent={accentColor} unit="%" />
                <SliderRow label="Cmd Deck Backdrop" value={surfaceOpacity.cmdBackdrop} min={0} max={100} onChange={v => updateSurfaceOpacity({ cmdBackdrop: v })} accent={accentColor} unit="%" />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400">Apply to all pages</span>
                  <Switch checked={surfaceOpacity.applyAll} onCheckedChange={v => updateSurfaceOpacity({ applyAll: v })} />
                </div>
              </div>
            )}

            {/* SIDEBAR TRANSPARENCY PANEL */}
            {activePanel === 'sidebar' && (
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2"><PanelLeft className="w-4 h-4" style={{ color: accentColor }} /> Sidebar Transparency</h3>
                  <button onClick={() => setActivePanel(null)} className="p-1 rounded hover:bg-slate-700/50 text-slate-400"><X className="w-4 h-4" /></button>
                </div>
                <SliderRow label="Sidebar Opacity" value={sidebarSettings.sidebarOpacity} min={0} max={100} onChange={v => updateSidebar({ sidebarOpacity: v })} accent={accentColor} unit="%" />
                <SliderRow label="Sidebar Background" value={sidebarSettings.sidebarBg} min={0} max={100} onChange={v => updateSidebar({ sidebarBg: v })} accent={accentColor} unit="%" />
                <SliderRow label="Font Brightness" value={sidebarSettings.fontBrightness} min={30} max={150} onChange={v => updateSidebar({ fontBrightness: v })} accent={accentColor} unit="%" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* Reusable slider row */
function SliderRow({ label, value, min = 0, max = 100, step = 1, onChange, accent, unit = '', display }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-mono" style={{ color: accent }}>{display ?? `${value}${unit}`}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} className="w-full" />
    </div>
  );
}

/* Background Effects sub-panel */
function EffectsPanel({ accentColor, onClose }) {
  const [effect, setEffect] = useState(() => {
    try { return localStorage.getItem('bgEffect') || 'off'; } catch { return 'off'; }
  });
  const [speed, setSpeed] = useState(() => { try { return parseFloat(localStorage.getItem('matrixSpeed')) || 1; } catch { return 1; } });
  const [brightness, setBrightness] = useState(() => { try { return parseFloat(localStorage.getItem('matrixBrightness')) || 0.8; } catch { return 0.8; } });
  const [variance, setVariance] = useState(() => { try { return parseFloat(localStorage.getItem('matrixVariance')) || 0.5; } catch { return 0.5; } });

  const effects = [
    { key: 'off', label: 'Off' },
    { key: 'starfield', label: 'Starfield' },
    { key: 'matrix', label: 'Matrix Rain' },
    { key: 'nebula', label: 'Nebula' },
    { key: 'circuit', label: 'Circuit' },
    { key: 'fractal', label: 'Fractal' },
  ];

  const applyEffect = (key) => {
    setEffect(key);
    try { localStorage.setItem('bgEffect', key); } catch {}
    document.dispatchEvent(new CustomEvent('bgEffectChange', { detail: { effect: key } }));
  };

  const applySettings = (s, b, v) => {
    try { localStorage.setItem('matrixSpeed', String(s)); localStorage.setItem('matrixBrightness', String(b)); localStorage.setItem('matrixVariance', String(v)); } catch {}
    document.dispatchEvent(new CustomEvent('matrixSettingsChange', { detail: { speed: s, brightness: b, variance: v } }));
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4" style={{ color: accentColor }} /> Background Effects</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-slate-700/50 text-slate-400"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {effects.map(e => (
          <button key={e.key} onClick={() => applyEffect(e.key)}
            className={`px-2 py-1.5 text-xs rounded transition-all ${effect === e.key ? 'text-white font-medium' : 'text-slate-500 hover:text-white'}`}
            style={effect === e.key ? { background: accentColor + '30', border: `1px solid ${accentColor}` } : { background: 'rgba(51,65,85,0.3)' }}
          >{e.label}</button>
        ))}
      </div>
      {effect !== 'off' && (
        <div className="space-y-2 border-t border-slate-700/30 pt-2">
          <SliderRow label="Speed" value={Math.round(speed * 10)} min={1} max={30} onChange={v => { setSpeed(v / 10); applySettings(v / 10, brightness, variance); }} accent={accentColor} display={`${speed.toFixed(1)}x`} />
          <SliderRow label="Brightness" value={Math.round(brightness * 100)} min={10} max={100} onChange={v => { setBrightness(v / 100); applySettings(speed, v / 100, variance); }} accent={accentColor} unit="%" />
          <SliderRow label="Variance" value={Math.round(variance * 100)} min={0} max={100} onChange={v => { setVariance(v / 100); applySettings(speed, brightness, v / 100); }} accent={accentColor} unit="%" />
        </div>
      )}
    </div>
  );
}