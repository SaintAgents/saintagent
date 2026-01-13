import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Download, Upload } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function MysticalIDImage({ profile, size = 'medium' }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40',
    large: 'w-56 h-56'
  };
  
  const generateMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      setError(null);
      
      // Build a detailed prompt based on profile mystical attributes
      const elements = [];
      
      if (profile?.astrological_sign) {
        elements.push(`${profile.astrological_sign} zodiac symbol`);
      }
      if (profile?.rising_sign) {
        elements.push(`${profile.rising_sign} rising energy`);
      }
      if (profile?.moon_sign) {
        elements.push(`${profile.moon_sign} moon influence`);
      }
      if (profile?.numerology_life_path) {
        elements.push(`life path number ${profile.numerology_life_path} sacred geometry`);
      }
      if (profile?.birth_card) {
        elements.push(`${profile.birth_card} tarot symbolism`);
      }
      if (profile?.human_design_type) {
        elements.push(`${profile.human_design_type} human design aura`);
      }
      if (profile?.enneagram_type) {
        elements.push(`enneagram ${profile.enneagram_type} essence`);
      }
      
      const mysticalElements = elements.length > 0 
        ? elements.join(', ')
        : 'cosmic energy, sacred geometry, celestial symbols';
      
      const prompt = `Create a mystical identification badge/seal for a spiritual profile. 
Include: ${mysticalElements}. 
Style: Ethereal, luminous, with gold and violet accents on dark cosmic background. 
Include sacred geometry patterns, subtle glowing runes, crystalline structures, and aurora-like light effects. 
The design should feel like an ancient mystical sigil combined with futuristic holographic technology.
Circular badge format with ornate border. High detail, mystical, otherworldly.
Name: ${profile?.display_name || 'Seeker'}`;
      
      const result = await base44.integrations.Core.GenerateImage({
        prompt
      });
      
      if (result?.url) {
        // Save the generated image URL to profile
        await base44.entities.UserProfile.update(profile.id, {
          mystical_id_image: result.url
        });
        return result.url;
      }
      throw new Error('Failed to generate image');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsGenerating(false);
    },
    onError: (err) => {
      setError(err.message || 'Generation failed');
      setIsGenerating(false);
    }
  });
  
  const handleDownload = async () => {
    if (!profile?.mystical_id_image) return;
    try {
      const response = await fetch(profile.mystical_id_image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mystical-id-${profile.handle || 'badge'}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, {
        mystical_id_image: file_url
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    } catch (err) {
      setError('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  // If no image exists and no mystical data, show placeholder
  const hasMysticalData = profile?.astrological_sign || profile?.numerology_life_path || 
    profile?.birth_card || profile?.human_design_type || profile?.moon_sign;
  
  if (!profile?.mystical_id_image && !hasMysticalData) {
    return (
      <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-violet-900/30 to-purple-900/30 border border-violet-500/20 flex flex-col items-center justify-center p-4 text-center`}>
        <Sparkles className="w-8 h-8 text-violet-400 mb-2" />
        <p className="text-xs text-violet-300">Complete your mystical profile to generate your ID</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${sizeClasses[size]} rounded-xl overflow-hidden group`}>
        {profile?.mystical_id_image ? (
          <>
            <img 
              src={profile.mystical_id_image} 
              alt="Mystical ID"
              className="w-full h-full object-cover"
              data-no-filter="true"
            />
            {/* Glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-violet-500/20 via-transparent to-cyan-500/20 pointer-events-none" />
            {/* Hover overlay with actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={() => generateMutation.mutate()}
                disabled={isGenerating}
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className={`w-4 h-4 ${isUploading ? 'animate-pulse' : ''}`} />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-900/50 to-purple-900/50 border border-violet-500/30 flex flex-col items-center justify-center p-4">
            {isGenerating ? (
              <>
                <div className="relative">
                  <Sparkles className="w-10 h-10 text-violet-400 animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <Sparkles className="w-10 h-10 text-violet-300 opacity-30" />
                  </div>
                </div>
                <p className="text-xs text-violet-300 mt-3 animate-pulse">Channeling your essence...</p>
              </>
            ) : (
              <>
                <Sparkles className="w-8 h-8 text-violet-400 mb-2" />
                <p className="text-xs text-violet-300 text-center mb-3">Generate your mystical ID</p>
                <Button 
                  size="sm" 
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
                  onClick={() => generateMutation.mutate()}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Generate
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}
      
      {profile?.mystical_id_image && (
        <p className="text-xs text-violet-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Mystical ID Seal
        </p>
      )}
    </div>
  );
}