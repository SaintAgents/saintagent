import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, Trash2, Upload, Plus } from 'lucide-react';

const ORIGINAL_CMD_DECK_BG = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/ccd2173e5_universal_upscale_0_cd3894c1-6a97-4a04-8d63-916963fb681c_0.jpg';

const DEFAULT_BACKGROUNDS = [
  ORIGINAL_CMD_DECK_BG,
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
];

export default function BackgroundSettings() {
  const [backgrounds, setBackgrounds] = useState(() => {
    try {
      const saved = localStorage.getItem('lightBgImages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_BACKGROUNDS;
  });

  const [intervalSec, setIntervalSec] = useState(() => {
    try {
      const saved = localStorage.getItem('lightBgInterval');
      if (saved) return Math.max(5, parseInt(saved, 10) || 30);
    } catch {}
    return 30;
  });

  const [uploading, setUploading] = useState(false);

  // Save to localStorage and notify rotator
  const persist = (newBgs, newInterval) => {
    try {
      localStorage.setItem('lightBgImages', JSON.stringify(newBgs));
      localStorage.setItem('lightBgInterval', String(newInterval));
      window.dispatchEvent(new Event('lightBgSettingsChanged'));
    } catch {}
  };

  const handleIntervalChange = (val) => {
    const num = Math.max(5, parseInt(val, 10) || 30);
    setIntervalSec(num);
    persist(backgrounds, num);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const newBgs = [...backgrounds, file_url];
    setBackgrounds(newBgs);
    persist(newBgs, intervalSec);
    setUploading(false);
    e.target.value = '';
  };

  const handleRemove = (index) => {
    const newBgs = backgrounds.filter((_, i) => i !== index);
    const final = newBgs.length > 0 ? newBgs : DEFAULT_BACKGROUNDS;
    setBackgrounds(final);
    persist(final, intervalSec);
  };

  const handleReset = () => {
    setBackgrounds(DEFAULT_BACKGROUNDS);
    setIntervalSec(30);
    persist(DEFAULT_BACKGROUNDS, 30);
  };

  return (
    <Card className="bg-violet-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Background Slideshow
        </CardTitle>
        <CardDescription>
          Customize the rotating background images (light theme only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Interval control */}
        <div>
          <Label>Change every (seconds)</Label>
          <Input
            type="number"
            min={5}
            max={600}
            value={intervalSec}
            onChange={(e) => handleIntervalChange(e.target.value)}
            className="mt-2 w-32"
          />
          <p className="text-xs text-slate-500 mt-1">Minimum 5 seconds</p>
        </div>

        {/* Image gallery */}
        <div>
          <Label>Background Images ({backgrounds.length})</Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
            {backgrounds.map((url, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden aspect-video border">
                <img
                  src={url}
                  alt={`BG ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemove(i)}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-1 py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {i + 1}
                </div>
              </div>
            ))}

            {/* Upload button */}
            <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              {uploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-violet-600 border-t-transparent" />
              ) : (
                <>
                  <Plus className="w-5 h-5 text-slate-400" />
                  <span className="text-xs text-slate-500 mt-1">Upload</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newBgs = backgrounds.includes(ORIGINAL_CMD_DECK_BG)
                ? backgrounds
                : [ORIGINAL_CMD_DECK_BG, ...backgrounds];
              setBackgrounds(newBgs);
              persist(newBgs, intervalSec);
            }}
          >
            Restore Original Background
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          The first image is the original Command Deck background. Changes apply to the Command Deck page background.
        </p>
      </CardContent>
    </Card>
  );
}