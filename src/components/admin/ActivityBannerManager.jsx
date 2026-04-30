import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Upload, Trash2, Image, Music, Eye, EyeOff, Palette } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_BANNER = {
  enabled: false,
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  audio_url: '',
  cta_text: '',
  cta_url: '',
  bg_color: '#051C2C',
  text_color: '#ffffff',
  accent_color: '#10b981',
  overlay_opacity: 50,
  layout: 'left', // left, center, right
};

export default function ActivityBannerManager() {
  const queryClient = useQueryClient();
  const [banner, setBanner] = useState(DEFAULT_BANNER);
  const [saving, setSaving] = useState(false);
  const [settingId, setSettingId] = useState(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const { data: settings } = useQuery({
    queryKey: ['platformSettings', 'activity_banner'],
    queryFn: () => base44.entities.PlatformSetting.filter({ key: 'activity_banner' }),
  });

  useEffect(() => {
    if (settings?.[0]) {
      setSettingId(settings[0].id);
      try {
        const parsed = JSON.parse(settings[0].value);
        setBanner({ ...DEFAULT_BANNER, ...parsed });
      } catch {}
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const payload = { key: 'activity_banner', value: JSON.stringify(banner) };
    if (settingId) {
      await base44.entities.PlatformSetting.update(settingId, payload);
    } else {
      const created = await base44.entities.PlatformSetting.create(payload);
      setSettingId(created.id);
    }
    queryClient.invalidateQueries({ queryKey: ['platformSettings', 'activity_banner'] });
    setSaving(false);
    toast.success('Banner saved');
  };

  const handleFileUpload = async (file, type) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setBanner(prev => ({ ...prev, [type === 'image' ? 'image_url' : 'audio_url']: file_url }));
    toast.success(`${type === 'image' ? 'Image' : 'Audio'} uploaded`);
  };

  const update = (field, value) => setBanner(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Activity Feed Banner</h2>
          <p className="text-sm text-slate-500">Configure the promotional banner on the Activity Feed page</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Activity Feed</Label>
            <Switch checked={banner.enabled} onCheckedChange={v => update('enabled', v)} />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Command Deck</Label>
            <Switch checked={banner.show_on_command_deck || false} onCheckedChange={v => update('show_on_command_deck', v)} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Banner'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content */}
        <Card>
          <CardHeader><CardTitle className="text-base">Content</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={banner.title} onChange={e => update('title', e.target.value)} placeholder="Banner headline…" />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input value={banner.subtitle} onChange={e => update('subtitle', e.target.value)} placeholder="Short subtitle…" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={banner.description} onChange={e => update('description', e.target.value)} placeholder="Longer description text…" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CTA Button Text</Label>
                <Input value={banner.cta_text} onChange={e => update('cta_text', e.target.value)} placeholder="Learn More" />
              </div>
              <div>
                <Label>CTA Button URL</Label>
                <Input value={banner.cta_url} onChange={e => update('cta_url', e.target.value)} placeholder="/Missions" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader><CardTitle className="text-base">Media</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Image */}
            <div>
              <Label className="flex items-center gap-2 mb-2"><Image className="w-4 h-4" /> Banner Image</Label>
              {banner.image_url && (
                <div className="relative mb-2 rounded-lg overflow-hidden h-32">
                  <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover" />
                  <button onClick={() => update('image_url', '')} className="absolute top-2 right-2 p-1 bg-black/60 rounded text-white hover:bg-black/80">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')} />
              <Button variant="outline" size="sm" className="gap-2" onClick={() => imageInputRef.current?.click()}>
                <Upload className="w-4 h-4" /> Upload Image
              </Button>
            </div>

            {/* Audio */}
            <div>
              <Label className="flex items-center gap-2 mb-2"><Music className="w-4 h-4" /> Audio (MP3)</Label>
              {banner.audio_url && (
                <div className="flex items-center gap-2 mb-2">
                  <audio controls src={banner.audio_url} className="flex-1 h-10" />
                  <button onClick={() => update('audio_url', '')} className="p-1 bg-red-100 rounded text-red-600 hover:bg-red-200">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
              <input ref={audioInputRef} type="file" accept="audio/mp3,audio/mpeg,audio/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'audio')} />
              <Button variant="outline" size="sm" className="gap-2" onClick={() => audioInputRef.current?.click()}>
                <Upload className="w-4 h-4" /> Upload MP3
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Styling */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="w-4 h-4" /> Styling</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Background</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={banner.bg_color} onChange={e => update('bg_color', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={banner.bg_color} onChange={e => update('bg_color', e.target.value)} className="text-xs" />
                </div>
              </div>
              <div>
                <Label>Text</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={banner.text_color} onChange={e => update('text_color', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={banner.text_color} onChange={e => update('text_color', e.target.value)} className="text-xs" />
                </div>
              </div>
              <div>
                <Label>Accent</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={banner.accent_color} onChange={e => update('accent_color', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={banner.accent_color} onChange={e => update('accent_color', e.target.value)} className="text-xs" />
                </div>
              </div>
            </div>
            <div>
              <Label>Image Overlay Opacity ({banner.overlay_opacity}%)</Label>
              <input type="range" min={0} max={90} value={banner.overlay_opacity} onChange={e => update('overlay_opacity', Number(e.target.value))} className="w-full mt-1" />
            </div>
            <div>
              <Label>Layout</Label>
              <Select value={banner.layout} onValueChange={v => update('layout', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left aligned</SelectItem>
                  <SelectItem value="center">Center aligned</SelectItem>
                  <SelectItem value="right">Right aligned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="w-4 h-4" /> Live Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden" style={{ height: 150 }}>
              <ActivityBannerPreview banner={banner} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Mini preview used inside admin
function ActivityBannerPreview({ banner }) {
  const align = banner.layout === 'center' ? 'items-center text-center' : banner.layout === 'right' ? 'items-end text-right' : 'items-start text-left';

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: banner.bg_color }}>
      {banner.image_url && (
        <>
          <img src={banner.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: banner.bg_color, opacity: banner.overlay_opacity / 100 }} />
        </>
      )}
      <div className={`relative z-10 flex flex-col justify-center h-full px-6 ${align}`}>
        {banner.title && <h3 className="text-lg font-bold truncate" style={{ color: banner.text_color }}>{banner.title}</h3>}
        {banner.subtitle && <p className="text-xs mt-0.5 opacity-80 truncate" style={{ color: banner.text_color }}>{banner.subtitle}</p>}
        {banner.description && <p className="text-xs mt-1 opacity-70 line-clamp-2" style={{ color: banner.text_color }}>{banner.description}</p>}
        {banner.cta_text && (
          <span className="mt-2 inline-block px-3 py-1 text-xs font-semibold rounded" style={{ backgroundColor: banner.accent_color, color: banner.bg_color }}>
            {banner.cta_text}
          </span>
        )}
      </div>
    </div>
  );
}