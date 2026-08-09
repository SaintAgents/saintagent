import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  HelpCircle, Eye, Sun, Moon, Terminal, Sparkles, Layers, PanelLeft,
  Bell, LogOut, Download, PanelRightClose, PanelRightOpen, Upload,
  Play, X, Volume2, VolumeX, ChevronDown, GripHorizontal
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
  const toolbarRef = useRef(null);

  // Drag state
  const [dragPos, setDragPos] = useState(() => {
    try { const s = localStorage.getItem('toolbarDragPos'); if (s) return JSON.parse(s); } catch {}
    return null; // null = default centered position
  });
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, startLeft: 0, startTop: 0, moved: false });

  const onDragStart = useCallback((clientX, clientY) => {
    const el = toolbarRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragState.current = { dragging: true, startX: clientX, startY: clientY, startLeft: rect.left, startTop: rect.top, moved: false };
  }, []);

  const onDragMove = useCallback((clientX, clientY) => {
    if (!dragState.current.dragging) return;
    const dx = clientX - dragState.current.startX;
    const dy = clientY - dragState.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragState.current.moved = true;
    if (!dragState.current.moved) return;
    const newLeft = Math.max(0, Math.min(window.innerWidth - 100, dragState.current.startLeft + dx));
    const newTop = Math.max(0, Math.min(window.innerHeight - 40, dragState.current.startTop + dy));
    setDragPos({ left: newLeft, top: newTop });
  }, []);

  const onDragEnd = useCallback(() => {
    dragState.current.dragging = false;
    // persist position
    setDragPos(prev => { if (prev) try { localStorage.setItem('toolbarDragPos', JSON.stringify(prev)); } catch {} return prev; });
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => onDragMove(e.clientX, e.clientY);
    const onMouseUp = () => onDragEnd();
    const onTouchMove = (e) => { if (dragState.current.dragging) { e.preventDefault(); onDragMove(e.touches[0].clientX, e.touches[0].clientY); } };
    const onTouchEnd = () => onDragEnd();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); window.removeEventListener('touchmove', onTouchMove); window.removeEventListener('touchend', onTouchEnd); };
  }, [onDragMove, onDragEnd]);

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
  const isLight = theme === 'light' || theme === 'custom';

  const accentColor = isHacker ? '#00ff00' : isLight ? '#4f46e5' : '#e5a620';
  const borderColor = isHacker ? '#00ff00' : isLight ? '#c7d2fe' : '#2a3a5c';
  const bgColor = isHacker ? 'rgba(0,0,0,0.95)' : isLight ? 'rgba(255,255,255,0.95)' : 'rgba(12,18,36,0.95)';
  const textColor = isLight ? '#1e293b' : '#ffffff';
  const textMuted = isLight ? '#64748b' : '#94a3b8';
  const panelItemBg = isLight ? 'rgba(241,245,249,0.8)' : 'rgba(51,65,85,0.5)';
  const panelItemBgAlt = isLight ? 'rgba(241,245,249,0.5)' : 'rgba(51,65,85,0.3)';
  const hoverBg = isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-700/50';
  const dividerBg = isLight ? '#e2e8f0' : borderColor;

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
        ref={toolbarRef}
        data-toolbar-panel="true"
        className="fixed z-50 flex items-center gap-1 px-3 py-1.5 rounded-full shadow-2xl border"
        style={{
          '--tb-bg': bgColor,
          '--tb-border': borderColor,
          '--tb-color': textColor,
          '--tb-shadow': `0 25px 50px -12px rgba(0,0,0,0.25)`,
          background: bgColor,
          borderColor,
          backdropFilter: 'blur(16px)',
          ...(dragPos
            ? { left: dragPos.left, top: dragPos.top }
            : { bottom: 16, left: '50%', transform: 'translateX(-50%)' }),
        }}
      >
        {/* Drag Handle */}
        <div
          className="cursor-grab active:cursor-grabbing p-1 rounded-lg select-none"
          style={{ color: textMuted }}
          onMouseDown={(e) => { e.preventDefault(); onDragStart(e.clientX, e.clientY); }}
          onTouchStart={(e) => { onDragStart(e.touches[0].clientX, e.touches[0].clientY); }}
          onDoubleClick={() => { setDragPos(null); try { localStorage.removeItem('toolbarDragPos'); } catch {} }}
          title="Drag to move · Double-click to reset"
        >
          <GripHorizontal className="w-4 h-4" />
        </div>

        <div className="w-px h-6 mx-0.5" style={{ background: dividerBg }} />

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

        <div className="w-px h-6 mx-0.5" style={{ background: dividerBg }} />

        {/* Hero Background / Video */}
        <button
          data-toolbar-btn
          onClick={() => togglePanel('hero')}
          className={btnClass(activePanel === 'hero')}
          title="Hero / Video Background"
          style={{ color: activePanel === 'hero' ? (isLight ? accentColor : '#fff') : accentColor, ringColor: accentColor }}
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

        <div className="w-px h-6 mx-0.5" style={{ background: dividerBg }} />

        {/* Background Effects */}
        <button
          data-toolbar-btn
          onClick={() => togglePanel('effects')}
          className={btnClass(activePanel === 'effects')}
          title="Background Effects"
          style={{ color: activePanel === 'effects' ? (isLight ? accentColor : '#fff') : accentColor }}
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Surface Opacity */}
        <button
          data-toolbar-btn
          onClick={() => togglePanel('surface')}
          className={btnClass(activePanel === 'surface')}
          title="Surface Opacity"
          style={{ color: activePanel === 'surface' ? (isLight ? accentColor : '#fff') : accentColor }}
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* Sidebar Transparency */}
        <button
          data-toolbar-btn
          onClick={() => togglePanel('sidebar')}
          className={btnClass(activePanel === 'sidebar')}
          title="Sidebar Transparency"
          style={{ color: activePanel === 'sidebar' ? (isLight ? accentColor : '#fff') : accentColor }}
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <div className="w-px h-6 mx-0.5" style={{ background: dividerBg }} />

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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setHelpOpen(false)}>
          <div data-toolbar-panel="true" className="rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto text-sm space-y-3 shadow-2xl border" style={{ '--tb-bg': isLight ? '#ffffff' : '#0f172a', '--tb-border': isLight ? '#e2e8f0' : '#334155', '--tb-color': isLight ? '#475569' : '#cbd5e1', background: isLight ? '#ffffff' : '#0f172a', borderColor: isLight ? '#e2e8f0' : '#334155', color: isLight ? '#475569' : '#cbd5e1' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: textColor }}><HelpCircle className="w-5 h-5" style={{ color: accentColor }} /> Toolbar Guide</h2>
            <div className="space-y-2">
              <p><strong style={{ color: accentColor }}>👁 Hero Background</strong> — Select video backgrounds per page or globally. Browse the library or upload your own.</p>
              <p><strong style={{ color: accentColor }}>☀ Light/Dark</strong> — Toggle between light and dark color schemes.</p>
              <p><strong style={{ color: accentColor }}>⌨ Matrix</strong> — Activate green terminal overlay on dark mode.</p>
              <p><strong style={{ color: accentColor }}>✨ Effects</strong> — Particle/visual overlays: Starfield, Matrix Rain, Nebula, Circuit, Fractal.</p>
              <p><strong style={{ color: accentColor }}>◈ Surface Opacity</strong> — Control transparency of content surfaces, hero, cards, and backgrounds.</p>
              <p><strong style={{ color: accentColor }}>◧ Sidebar</strong> — Adjust sidebar opacity, background, and font brightness.</p>
            </div>
            <button onClick={() => setHelpOpen(false)} className="mt-4 px-4 py-2 text-white rounded-lg text-sm" style={{ background: accentColor }}>Got it</button>
          </div>
        </div>
      )}

      {/* Panels */}
      {activePanel && (
        <div
          ref={panelRef}
          data-toolbar-panel="true"
          className="fixed z-50 rounded-xl shadow-2xl border overflow-hidden"
          style={{
            '--tb-bg': bgColor,
            '--tb-border': borderColor,
            '--tb-color': textColor,
            '--tb-shadow': `0 25px 50px -12px rgba(0,0,0,0.25)`,
            width: activePanel === 'hero' ? 380 : 340,
            maxHeight: 'calc(100vh - 100px)',
            background: bgColor,
            borderColor,
            backdropFilter: 'blur(16px)',
            ...(dragPos
              ? { left: dragPos.left, bottom: `calc(100vh - ${dragPos.top}px + 8px)` }
              : { bottom: 64, left: '50%', transform: 'translateX(-50%)' }),
          }}
        >
          <div className="overflow-y-auto max-h-[calc(100vh-100px)]">
            {/* HERO / VIDEO PANEL */}
            {activePanel === 'hero' && (
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: textColor }}>
                    <Eye className="w-4 h-4" style={{ color: accentColor }} /> Hero / Video Background
                  </h3>
                  <button onClick={() => setActivePanel(null)} className={`p-1 rounded ${hoverBg}`} style={{ color: textMuted }}><X className="w-4 h-4" /></button>
                </div>

                {/* Surface selector */}
                <div className="flex flex-wrap gap-1">
                  {SURFACES.map(s => (
                    <button
                      key={s.key}
                      onClick={() => setActiveSurface(s.key)}
                      className={`px-2 py-0.5 text-xs rounded-full transition-all`}
                      style={activeSurface === s.key
                        ? { background: accentColor + '20', border: `1px solid ${accentColor}`, color: isLight ? accentColor : '#fff' }
                        : { background: panelItemBg, color: textMuted }}
                    >
                      {s.label}
                      {videoSettings[s.key]?.videoUrl && videoSettings[s.key]?.enabled && (
                        <span className="ml-1 inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Current video preview + controls */}
                {surfaceConfig.videoUrl && (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-video bg-black">
                      <video src={surfaceConfig.videoUrl} autoPlay loop muted={surfaceConfig.muted !== false} playsInline className="w-full h-full object-cover" style={{ opacity: surfaceConfig.opacity ?? 0.3 }} />
                      <div className="absolute bottom-1 right-1 flex gap-1">
                        <label style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <input type="file" accept="video/*" onChange={handleUpload} style={{ display: 'none' }} />
                          {uploading ? <div style={{ width: 12, height: 12, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Upload style={{ width: 12, height: 12 }} />}
                        </label>
                        <button onClick={() => updateVideoSurface({ muted: !(surfaceConfig.muted !== false) })} style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}>
                          {surfaceConfig.muted !== false ? <VolumeX style={{ width: 12, height: 12 }} /> : <Volume2 style={{ width: 12, height: 12 }} />}
                        </button>
                        <button onClick={() => updateVideoSurface({ enabled: !surfaceConfig.enabled })} style={{ background: 'rgba(0,0,0,0.7)', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer', color: surfaceConfig.enabled ? '#34d399' : '#94a3b8' }}>
                          <Eye style={{ width: 12, height: 12 }} />
                        </button>
                        <button onClick={() => updateVideoSurface({ videoUrl: '', enabled: false })} style={{ background: 'rgba(0,0,0,0.7)', color: '#f87171', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}>
                          <X style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    </div>

                    {/* Sliders */}
                    <SliderRow label="Opacity" value={Math.round((surfaceConfig.opacity ?? 0.3) * 100)} min={5} max={100} step={5} onChange={v => updateVideoSurface({ opacity: v / 100 })} accent={accentColor} labelColor={textMuted} unit="%" />
                    <SliderRow label="Speed" value={Math.round((surfaceConfig.speed ?? 1) * 10)} min={1} max={30} step={1} onChange={v => updateVideoSurface({ speed: v / 10 })} accent={accentColor} labelColor={textMuted} display={`${((surfaceConfig.speed ?? 1)).toFixed(1)}x`} />
                    <SliderRow label="Blur" value={surfaceConfig.blur ?? 0} min={0} max={20} step={1} onChange={v => updateVideoSurface({ blur: v })} accent={accentColor} labelColor={textMuted} unit="px" />

                    {/* Theme filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-20" style={{ color: textMuted }}>Theme:</span>
                      <div className="flex gap-1">
                        {[{ key: 'both', l: 'All' }, { key: 'light', l: 'Light' }, { key: 'dark', l: 'Dark' }].map(o => (
                          <button key={o.key} onClick={() => updateVideoSurface({ themeFilter: o.key })}
                            className="px-2 py-0.5 text-xs rounded"
                            style={(surfaceConfig.themeFilter || 'both') === o.key ? { background: accentColor + '40', color: isLight ? accentColor : '#fff' } : { color: textMuted }}
                          >{o.l}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Library / Upload / URL — always visible */}
                <div className="space-y-2">
                  <button onClick={() => setShowLibrary(!showLibrary)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm" style={{ borderColor, background: panelItemBgAlt, color: textColor }}>
                    <span className="flex items-center gap-2"><Play className="w-4 h-4" style={{ color: accentColor }} /> {surfaceConfig.videoUrl ? 'Change Video' : 'Browse Video Library'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showLibrary ? 'rotate-180' : ''}`} style={{ color: accentColor }} />
                  </button>
                  {!surfaceConfig.videoUrl && (
                    <>
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed cursor-pointer transition-colors" style={{ borderColor }}>
                        <input type="file" accept="video/*" onChange={handleUpload} className="hidden" />
                        {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: accentColor }} /> : <Upload className="w-4 h-4" style={{ color: textMuted }} />}
                        <span className="text-xs" style={{ color: textMuted }}>Upload video</span>
                      </label>
                      <input type="text" placeholder="Paste video URL + Enter..." className="w-full bg-transparent border rounded px-2 py-1.5 text-xs outline-none" style={{ borderColor, color: textColor }}
                        onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { updateVideoSurface({ videoUrl: e.target.value.trim(), enabled: true }); } }}
                      />
                    </>
                  )}
                </div>

                {/* Video Library */}
                {showLibrary && (
                  <div className="space-y-2 pt-2" style={{ borderTop: `1px solid ${dividerBg}` }}>
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => setLibraryCategory('all')} className="px-2 py-0.5 text-xs rounded-full" style={libraryCategory === 'all' ? { background: accentColor + '30', color: isLight ? accentColor : '#fff' } : { color: textMuted }}>All</button>
                      {VIDEO_CATEGORIES.map(c => (
                        <button key={c} onClick={() => setLibraryCategory(c)} className="px-2 py-0.5 text-xs rounded-full" style={libraryCategory === c ? { background: accentColor + '30', color: isLight ? accentColor : '#fff' } : { color: textMuted }}>{c}</button>
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
              <EffectsPanel accentColor={accentColor} textColor={textColor} textMuted={textMuted} hoverBg={hoverBg} panelItemBgAlt={panelItemBgAlt} isLight={isLight} onClose={() => setActivePanel(null)} />
            )}

            {/* SURFACE OPACITY PANEL */}
            {activePanel === 'surface' && (
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: textColor }}><Layers className="w-4 h-4" style={{ color: accentColor }} /> Surface Opacity</h3>
                  <button onClick={() => setActivePanel(null)} className={`p-1 rounded ${hoverBg}`} style={{ color: textMuted }}><X className="w-4 h-4" /></button>
                </div>
                <SliderRow label="Surface Opacity" value={surfaceOpacity.surfaceOpacity} min={0} max={100} onChange={v => updateSurfaceOpacity({ surfaceOpacity: v })} accent={accentColor} labelColor={textMuted} unit="%" />
                <SliderRow label="Hero Opacity" value={surfaceOpacity.heroOpacity} min={0} max={100} onChange={v => updateSurfaceOpacity({ heroOpacity: v })} accent={accentColor} labelColor={textMuted} unit="%" />
                <SliderRow label="Background Opacity" value={surfaceOpacity.bgOpacity} min={0} max={100} onChange={v => updateSurfaceOpacity({ bgOpacity: v })} accent={accentColor} labelColor={textMuted} unit="%" />
                <SliderRow label="Content Start" value={surfaceOpacity.contentStart} min={0} max={800} step={10} onChange={v => updateSurfaceOpacity({ contentStart: v })} accent={accentColor} labelColor={textMuted} unit="px" />
                <SliderRow label="White Wash" value={surfaceOpacity.whiteWash} min={0} max={100} onChange={v => updateSurfaceOpacity({ whiteWash: v })} accent={accentColor} labelColor={textMuted} unit="%" />
                <SliderRow label="Card Background" value={surfaceOpacity.cardBg} min={0} max={100} onChange={v => updateSurfaceOpacity({ cardBg: v })} accent={accentColor} labelColor={textMuted} unit="%" />
                <SliderRow label="Card Opacity" value={surfaceOpacity.cardOpacity} min={0} max={100} onChange={v => updateSurfaceOpacity({ cardOpacity: v })} accent={accentColor} labelColor={textMuted} unit="%" />
                <SliderRow label="Cmd Deck Backdrop" value={surfaceOpacity.cmdBackdrop} min={0} max={100} onChange={v => updateSurfaceOpacity({ cmdBackdrop: v })} accent={accentColor} labelColor={textMuted} unit="%" />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs" style={{ color: textMuted }}>Apply to all pages</span>
                  <Switch checked={surfaceOpacity.applyAll} onCheckedChange={v => updateSurfaceOpacity({ applyAll: v })} />
                </div>
              </div>
            )}

            {/* SIDEBAR TRANSPARENCY PANEL */}
            {activePanel === 'sidebar' && (
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: textColor }}><PanelLeft className="w-4 h-4" style={{ color: accentColor }} /> Sidebar Transparency</h3>
                  <button onClick={() => setActivePanel(null)} className={`p-1 rounded ${hoverBg}`} style={{ color: textMuted }}><X className="w-4 h-4" /></button>
                </div>
                <SliderRow label="Sidebar Opacity" value={sidebarSettings.sidebarOpacity} min={0} max={100} onChange={v => updateSidebar({ sidebarOpacity: v })} accent={accentColor} labelColor={textMuted} unit="%" />
                <SliderRow label="Sidebar Background" value={sidebarSettings.sidebarBg} min={0} max={100} onChange={v => updateSidebar({ sidebarBg: v })} accent={accentColor} labelColor={textMuted} unit="%" />
                <SliderRow label="Font Brightness" value={sidebarSettings.fontBrightness} min={30} max={150} onChange={v => updateSidebar({ fontBrightness: v })} accent={accentColor} labelColor={textMuted} unit="%" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* Reusable slider row */
function SliderRow({ label, value, min = 0, max = 100, step = 1, onChange, accent, unit = '', display, labelColor }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs" style={{ color: labelColor || '#94a3b8' }}>{label}</span>
        <span className="text-xs font-mono" style={{ color: accent }}>{display ?? `${value}${unit}`}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} className="w-full" />
    </div>
  );
}

/* Background Effects sub-panel */
function EffectsPanel({ accentColor, textColor, textMuted, hoverBg, panelItemBgAlt, isLight, onClose }) {
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
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: textColor }}><Sparkles className="w-4 h-4" style={{ color: accentColor }} /> Background Effects</h3>
        <button onClick={onClose} className={`p-1 rounded ${hoverBg}`} style={{ color: textMuted }}><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {effects.map(e => (
          <button key={e.key} onClick={() => applyEffect(e.key)}
            className="px-2 py-1.5 text-xs rounded transition-all"
            style={effect === e.key ? { background: accentColor + '30', border: `1px solid ${accentColor}`, color: isLight ? accentColor : '#fff', fontWeight: 500 } : { background: panelItemBgAlt, color: textMuted }}
          >{e.label}</button>
        ))}
      </div>
      {effect !== 'off' && (
        <div className="space-y-2 pt-2" style={{ borderTop: `1px solid ${isLight ? '#e2e8f0' : 'rgba(51,65,85,0.3)'}` }}>
          <SliderRow label="Speed" value={Math.round(speed * 10)} min={1} max={30} onChange={v => { setSpeed(v / 10); applySettings(v / 10, brightness, variance); }} accent={accentColor} labelColor={textMuted} display={`${speed.toFixed(1)}x`} />
          <SliderRow label="Brightness" value={Math.round(brightness * 100)} min={10} max={100} onChange={v => { setBrightness(v / 100); applySettings(speed, v / 100, variance); }} accent={accentColor} labelColor={textMuted} unit="%" />
          <SliderRow label="Variance" value={Math.round(variance * 100)} min={0} max={100} onChange={v => { setVariance(v / 100); applySettings(speed, brightness, v / 100); }} accent={accentColor} labelColor={textMuted} unit="%" />
        </div>
      )}
    </div>
  );
}