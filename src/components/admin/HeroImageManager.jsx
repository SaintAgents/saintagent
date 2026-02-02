import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { HERO_IMAGES } from '@/components/hud/HeroImageData';
import { Image, Clock, Upload, Save, Trash2, Plus, Eye, Settings2 } from 'lucide-react';
import { toast } from "sonner";

// Thumbnail component with error handling
function HeroImageThumbnail({ img }) {
  const [hasError, setHasError] = useState(false);
  
  return (
    <div className="relative group rounded-lg overflow-hidden bg-slate-100">
      {hasError ? (
        <div className="w-full aspect-video flex items-center justify-center bg-slate-200">
          <div className="text-center p-2">
            <Image className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <p className="text-xs text-slate-500 truncate max-w-full">{img.title}</p>
          </div>
        </div>
      ) : (
        <img 
          src={img.url} 
          alt={img.title}
          className="w-full aspect-video object-cover"
          onError={() => setHasError(true)}
        />
      )}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
        <p className="text-white text-xs text-center">{img.title}</p>
      </div>
    </div>
  );
}

export default function HeroImageManager() {
  const queryClient = useQueryClient();
  const [newImage, setNewImage] = useState({ title: '', description: '', url: '', page: '' });
  const [intervalMinutes, setIntervalMinutes] = useState(7);

  // Fetch current interval setting
  const { data: settings } = useQuery({
    queryKey: ['heroSlideshowSettings'],
    queryFn: async () => {
      const results = await base44.entities.PlatformSetting.filter({ key: 'hero_slideshow_interval' });
      if (results?.[0]?.value) {
        setIntervalMinutes(parseInt(results[0].value) / 60000);
      }
      return results;
    }
  });

  // Fetch custom images
  const { data: customImages = [] } = useQuery({
    queryKey: ['customHeroImages'],
    queryFn: () => base44.entities.PlatformSetting.filter({ key: 'custom_hero_image' })
  });

  // Save interval setting
  const saveIntervalMutation = useMutation({
    mutationFn: async (ms) => {
      const existing = await base44.entities.PlatformSetting.filter({ key: 'hero_slideshow_interval' });
      if (existing?.[0]) {
        return base44.entities.PlatformSetting.update(existing[0].id, { value: String(ms) });
      } else {
        return base44.entities.PlatformSetting.create({ 
          key: 'hero_slideshow_interval', 
          value: String(ms),
          description: 'Hero image slideshow rotation interval in milliseconds'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
      queryClient.invalidateQueries({ queryKey: ['heroSlideshowSettings'] });
      toast.success('Slideshow interval saved');
    }
  });

  // Add custom image
  const addImageMutation = useMutation({
    mutationFn: (imageData) => base44.entities.PlatformSetting.create({
      key: 'custom_hero_image',
      value: JSON.stringify(imageData),
      description: `Custom hero image: ${imageData.title}`
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customHeroImages'] });
      setNewImage({ title: '', description: '', url: '', page: '' });
      toast.success('Image added');
    }
  });

  // Delete custom image
  const deleteImageMutation = useMutation({
    mutationFn: (id) => base44.entities.PlatformSetting.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customHeroImages'] });
      toast.success('Image removed');
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewImage(prev => ({ ...prev, url: file_url }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  const handleSaveInterval = () => {
    const ms = Math.round(intervalMinutes * 60000);
    saveIntervalMutation.mutate(ms);
  };

  return (
    <div className="space-y-6">
      {/* Interval Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Slideshow Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Rotation Interval: {intervalMinutes.toFixed(2)} minutes</Label>
            <Slider
              value={[intervalMinutes]}
              onValueChange={([v]) => setIntervalMinutes(v)}
              min={0.5}
              max={10}
              step={0.01}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              Default: 7 minutes (420 seconds)
            </p>
          </div>
          <Button onClick={handleSaveInterval} disabled={saveIntervalMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save Interval
          </Button>
        </CardContent>
      </Card>

      {/* Add Custom Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Custom Hero Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newImage.title}
                onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Image title"
              />
            </div>
            <div>
              <Label>Page (optional)</Label>
              <Input
                value={newImage.page}
                onChange={(e) => setNewImage(prev => ({ ...prev, page: e.target.value }))}
                placeholder="e.g., CommandDeck"
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={newImage.description}
              onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Short description"
            />
          </div>
          <div>
            <Label>Image URL</Label>
            <div className="flex gap-2">
              <Input
                value={newImage.url}
                onChange={(e) => setNewImage(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
                className="flex-1"
              />
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <Button type="button" variant="outline" asChild>
                  <span><Upload className="w-4 h-4 mr-2" />Upload</span>
                </Button>
              </label>
            </div>
          </div>
          {newImage.url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
              <img src={newImage.url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <Button 
            onClick={() => addImageMutation.mutate(newImage)}
            disabled={!newImage.title || !newImage.url || addImageMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Image
          </Button>
        </CardContent>
      </Card>

      {/* Custom Images List */}
      {customImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Custom Images ({customImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {customImages.map((img) => {
                const data = JSON.parse(img.value);
                return (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden">
                    <img 
                      src={data.url} 
                      alt={data.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      <p className="text-white text-sm font-medium text-center">{data.title}</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteImageMutation.mutate(img.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Built-in Images Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Built-in Hero Images ({HERO_IMAGES.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            These are built-in images. To remove them, edit the HeroImageData.jsx file.
          </p>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {HERO_IMAGES.map((img) => (
              <HeroImageThumbnail key={img.id} img={img} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}