import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import {
  Sparkles,
  Loader2,
  CheckCircle2,
  User,
  Heart,
  Zap,
  Target,
  MapPin,
  Star,
  X,
  Lightbulb,
  TrendingUp,
  Wand2,
  ArrowRight,
  RotateCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';
import ProfileFieldEditDialog from './ProfileFieldEditDialog';

const FIELD_CONFIG = {
  bio: {
    label: 'Bio',
    icon: User,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    weight: 15,
    description: 'Tell others about yourself'
  },
  skills: {
    label: 'Skills',
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    weight: 20,
    description: 'What can you offer or teach?'
  },
  interests: {
    label: 'Interests',
    icon: Heart,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    weight: 15,
    description: 'What topics excite you?'
  },
  spiritual_practices: {
    label: 'Spiritual Practices',
    icon: Star,
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    weight: 15,
    description: 'Your meditation, yoga, or other practices'
  },
  core_values: {
    label: 'Core Values',
    icon: Target,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    weight: 15,
    description: 'What principles guide your life?'
  },
  location: {
    label: 'Location',
    icon: MapPin,
    color: 'text-cyan-500',
    bg: 'bg-cyan-50',
    weight: 10,
    description: 'Where are you based?'
  },
  avatar_url: {
    label: 'Profile Photo',
    icon: User,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    weight: 10,
    description: 'Add a photo to connect better'
  }
};


export default function AIProfileCompletionPrompt({ profile, showCard = true, onComplete }) {
  const queryClient = useQueryClient();
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [formData, setFormData] = useState({});
  const [magicFilling, setMagicFilling] = useState(false);
  const [magicResults, setMagicResults] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('profileCompletionDismissed') === 'true';
    } catch {
      return false;
    }
  });

  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!profile) return 0;
    
    let totalWeight = 0;
    let completedWeight = 0;
    
    Object.entries(FIELD_CONFIG).forEach(([field, config]) => {
      totalWeight += config.weight;
      const value = profile[field];
      if (value && (Array.isArray(value) ? value.length > 0 : value.trim?.() !== '')) {
        completedWeight += config.weight;
      }
    });
    
    return Math.round((completedWeight / totalWeight) * 100);
  };

  const completionPercent = calculateCompletion();

  // Get missing fields
  const getMissingFields = () => {
    if (!profile) return [];
    
    return Object.entries(FIELD_CONFIG)
      .filter(([field]) => {
        const value = profile[field];
        return !value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && !value.trim());
      })
      .map(([field, config]) => ({ field, ...config }))
      .sort((a, b) => b.weight - a.weight);
  };

  const missingFields = getMissingFields();

  // AI Analysis
  const analyzeProfile = async () => {
    if (!profile) return;
    
    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this user profile and provide personalized suggestions to improve it for better matching and community engagement.

PROFILE:
- Name: ${profile.display_name}
- Bio: ${profile.bio || 'Not set'}
- Location: ${profile.location || 'Not set'}
- Skills: ${profile.skills?.join(', ') || 'None listed'}
- Interests: ${profile.interests?.join(', ') || 'None listed'}
- Spiritual Practices: ${profile.spiritual_practices?.join(', ') || 'None listed'}
- Core Values: ${profile.core_values?.join(', ') || 'None listed'}
- Has Photo: ${profile.avatar_url ? 'Yes' : 'No'}

Provide:
1. An overall assessment of profile completeness
2. The TOP 3 most impactful fields to complete first
3. Personalized suggestions for each missing field based on what IS filled in
4. A motivating message about why completing the profile helps`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            completeness_assessment: { type: "string" },
            priority_fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  reason: { type: "string" },
                  suggestion: { type: "string" },
                  example_values: { type: "array", items: { type: "string" } }
                }
              }
            },
            motivation_message: { type: "string" },
            match_quality_boost: { type: "number" }
          }
        }
      });

      setAnalysis(response);
    } catch (error) {
      console.error('Profile analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Magic Fill All - AI generates all missing fields at once
  const handleMagicFill = async () => {
    if (!profile) return;
    setMagicFilling(true);
    try {
      const profileContext = `Name: ${profile.display_name}\nBio: ${profile.bio || 'Not set'}\nSkills: ${(profile.skills || []).join(', ') || 'None'}\nInterests: ${(profile.interests || []).join(', ') || 'None'}\nPractices: ${(profile.spiritual_practices || []).join(', ') || 'None'}\nValues: ${(profile.core_values || []).join(', ') || 'None'}\nLocation: ${profile.location || 'Not set'}\nMystical ID: ${profile.mystical_identifier || ''}\nSign: ${profile.astrological_sign || ''}`;
      
      const missing = missingFields.map(f => f.field).filter(f => f !== 'avatar_url');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate profile content for these missing fields: ${missing.join(', ')}
        
Based on this existing profile:\n${profileContext}

For each field, generate the best possible content that feels authentic and personal.
- bio: 2-3 engaging sentences
- skills: array of 5-8 specific skills  
- interests: array of 5-8 interest topics
- spiritual_practices: array of 3-5 practices (use snake_case like "sound_healing")
- core_values: array of 4-6 values
- location: best guess city/country format

Only include fields that are in the missing list: ${missing.join(', ')}`,
        response_json_schema: {
          type: "object",
          properties: {
            bio: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            interests: { type: "array", items: { type: "string" } },
            spiritual_practices: { type: "array", items: { type: "string" } },
            core_values: { type: "array", items: { type: "string" } },
            location: { type: "string" },
            summary: { type: "string" }
          }
        }
      });
      
      // Filter to only missing fields
      const filtered = {};
      missing.forEach(f => {
        if (response[f]) filtered[f] = response[f];
      });
      setMagicResults({ fields: filtered, summary: response.summary });
    } catch (err) {
      console.error('Magic fill failed:', err);
    } finally {
      setMagicFilling(false);
    }
  };

  const applyMagicResults = async () => {
    if (!magicResults?.fields || !profile?.id) return;
    updateMutation.mutate(magicResults.fields);
    setMagicResults(null);
  };

  // Auto-analyze on mount if profile is incomplete
  useEffect(() => {
    if (profile && completionPercent < 80 && !analysis && !dismissed) {
      // Only auto-analyze if significantly incomplete
      if (completionPercent < 50) {
        analyzeProfile();
      }
    }
  }, [profile?.id]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      await base44.entities.UserProfile.update(profile.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setActiveField(null);
      setFormData({});
      onComplete?.();
    }
  });

  const handleSaveField = () => {
    if (!activeField || !formData[activeField]) return;
    
    const value = formData[activeField];
    const updates = {};
    
    // Handle array fields
    if (['skills', 'interests', 'spiritual_practices', 'core_values'].includes(activeField)) {
      updates[activeField] = Array.isArray(value) ? value : value.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      updates[activeField] = value;
    }
    
    updateMutation.mutate(updates);
  };

  const toggleArrayItem = (field, item) => {
    const current = formData[field] || profile[field] || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  if (dismissed || completionPercent >= 95) {
    return null;
  }

  // Compact inline prompt (for dashboard cards)
  if (!showCard) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200">
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900">Profile {completionPercent}% complete</p>
          <p className="text-xs text-slate-500 truncate">
            Add {missingFields[0]?.label?.toLowerCase()} to improve matches
          </p>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => window.location.href = createPageUrl('Profile') + '?edit=true'}
        >
          Complete
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50/70 to-indigo-50/70 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Complete Your Profile
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => {
                setDismissed(true);
                try {
                  localStorage.setItem('profileCompletionDismissed', 'true');
                } catch {}
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-600">Profile Completion</span>
              <span className={cn(
                "font-medium",
                completionPercent >= 80 ? "text-emerald-600" : 
                completionPercent >= 50 ? "text-amber-600" : "text-rose-600"
              )}>
                {completionPercent}%
              </span>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Magic Fill Results Preview */}
          {magicResults ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-violet-100 to-indigo-100 border border-violet-200">
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-semibold text-violet-800">AI-Generated Profile</span>
                </div>
                <p className="text-xs text-violet-700">{magicResults.summary}</p>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {Object.entries(magicResults.fields).map(([field, value]) => {
                  const config = FIELD_CONFIG[field];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <div key={field} className="p-3 rounded-lg bg-white border border-emerald-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={cn("w-4 h-4", config.color)} />
                        <span className="text-xs font-medium text-slate-700">{config.label}</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto" />
                      </div>
                      <p className="text-xs text-slate-600">
                        {Array.isArray(value) ? value.join(', ') : value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setMagicResults(null)}>
                  Discard
                </Button>
                <Button 
                  className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" 
                  onClick={applyMagicResults}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Apply All
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Magic Fill Button */}
              <Button
                className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md"
                onClick={handleMagicFill}
                disabled={magicFilling}
              >
                {magicFilling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI is writing your profile...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Magic Fill — Let AI Complete It
                  </>
                )}
              </Button>

              {/* AI Analysis */}
              {analysis ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white border">
                    <p className="text-sm text-slate-700">{analysis.completeness_assessment}</p>
                    {analysis.match_quality_boost && (
                      <div className="flex items-center gap-2 mt-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-emerald-600">
                          Complete profile for up to {analysis.match_quality_boost}% better matches
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Priority fields */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Recommended to complete
                    </p>
                    <p className="text-xs text-violet-600 italic">{analysis.motivation_message}</p>
                    {(analysis.priority_fields || []).slice(0, 3).map((item, idx) => {
                      const fieldConfig = FIELD_CONFIG[item.field];
                      if (!fieldConfig) return null;
                      const Icon = fieldConfig.icon;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveField(item.field)}
                          className="w-full flex items-start gap-3 p-3 rounded-lg bg-white border hover:border-violet-300 hover:shadow-sm transition-all text-left group"
                        >
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", fieldConfig.bg)}>
                            <Icon className={cn("w-4 h-4", fieldConfig.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">{fieldConfig.label}</p>
                            <p className="text-xs text-slate-500 line-clamp-2">{item.suggestion}</p>
                            {item.example_values?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {item.example_values.slice(0, 3).map((v, i) => (
                                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-100">{v}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 shrink-0 mt-1 transition-colors" />
                        </button>
                      );
                    })}
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full gap-2 text-violet-600"
                    onClick={analyzeProfile}
                    disabled={isAnalyzing}
                  >
                    <RotateCw className={cn("w-3.5 h-3.5", isAnalyzing && "animate-spin")} />
                    Re-analyze
                  </Button>
                </div>
              ) : (
                /* Missing fields list */
                <div className="space-y-2">
                  {missingFields.slice(0, 4).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.field}
                        onClick={() => setActiveField(item.field)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border hover:border-violet-300 hover:shadow-sm transition-all"
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", item.bg)}>
                          <Icon className={cn("w-4 h-4", item.color)} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          +{item.weight}%
                        </Badge>
                      </button>
                    );
                  })}

                  <Button 
                    variant="outline" 
                    className="w-full gap-2 mt-1"
                    onClick={analyzeProfile}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Get AI Suggestions
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Edit Dialog */}
      <ProfileFieldEditDialog
        activeField={activeField}
        onClose={() => setActiveField(null)}
        fieldConfig={FIELD_CONFIG}
        profile={profile}
        formData={formData}
        setFormData={setFormData}
        toggleArrayItem={toggleArrayItem}
        onSave={handleSaveField}
        isSaving={updateMutation.isPending}
      />
    </>
  );
}