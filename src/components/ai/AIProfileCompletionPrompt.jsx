import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Heart,
  Zap,
  Target,
  MapPin,
  Star,
  ChevronRight,
  X,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';

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

const SUGGESTED_VALUES = [
  'compassion', 'integrity', 'authenticity', 'growth', 'service', 'community',
  'creativity', 'wisdom', 'love', 'freedom', 'joy', 'peace', 'harmony', 'purpose'
];

const SUGGESTED_PRACTICES = [
  'meditation', 'yoga', 'breathwork', 'prayer', 'journaling', 'mindfulness',
  'energy_work', 'sound_healing', 'tarot', 'astrology', 'qigong', 'tai_chi'
];

const SUGGESTED_SKILLS = [
  'coaching', 'writing', 'design', 'programming', 'marketing', 'teaching',
  'healing', 'consulting', 'facilitation', 'speaking', 'art', 'music'
];

export default function AIProfileCompletionPrompt({ profile, showCard = true, onComplete }) {
  const queryClient = useQueryClient();
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [formData, setFormData] = useState({});
  const [dismissed, setDismissed] = useState(false);

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
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-indigo-50/50 overflow-hidden">
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
              onClick={() => setDismissed(true)}
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
          {/* AI Analysis */}
          {analysis ? (
            <div className="space-y-4">
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
                {(analysis.priority_fields || []).slice(0, 3).map((item, idx) => {
                  const fieldConfig = FIELD_CONFIG[item.field];
                  if (!fieldConfig) return null;
                  const Icon = fieldConfig.icon;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveField(item.field)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg bg-white border hover:border-violet-300 hover:shadow-sm transition-all text-left"
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", fieldConfig.bg)}>
                        <Icon className={cn("w-4 h-4", fieldConfig.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{fieldConfig.label}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{item.suggestion}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-500 italic">{analysis.motivation_message}</p>
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
                className="w-full gap-2 mt-2"
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
        </CardContent>
      </Card>

      {/* Field Edit Dialog */}
      <Dialog open={!!activeField} onOpenChange={(open) => !open && setActiveField(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeField && FIELD_CONFIG[activeField] && (
                <>
                  {React.createElement(FIELD_CONFIG[activeField].icon, { 
                    className: cn("w-5 h-5", FIELD_CONFIG[activeField].color) 
                  })}
                  Add {FIELD_CONFIG[activeField].label}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {activeField && FIELD_CONFIG[activeField]?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Bio field */}
            {activeField === 'bio' && (
              <Textarea
                placeholder="Tell others about yourself, your journey, and what you're passionate about..."
                value={formData.bio || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="min-h-[120px]"
              />
            )}

            {/* Location field */}
            {activeField === 'location' && (
              <Input
                placeholder="City, Country"
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            )}

            {/* Skills field */}
            {activeField === 'skills' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">Select or add your skills:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS.map((skill) => {
                    const isSelected = (formData.skills || profile?.skills || []).includes(skill);
                    return (
                      <Badge
                        key={skill}
                        variant={isSelected ? "default" : "outline"}
                        className={cn("cursor-pointer capitalize", isSelected && "bg-amber-500")}
                        onClick={() => toggleArrayItem('skills', skill)}
                      >
                        {skill}
                      </Badge>
                    );
                  })}
                </div>
                <Input
                  placeholder="Add custom skill (comma separated)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const newSkills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setFormData(prev => ({
                        ...prev,
                        skills: [...(prev.skills || profile?.skills || []), ...newSkills]
                      }));
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            )}

            {/* Core Values field */}
            {activeField === 'core_values' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">What principles guide your life?</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_VALUES.map((value) => {
                    const isSelected = (formData.core_values || profile?.core_values || []).includes(value);
                    return (
                      <Badge
                        key={value}
                        variant={isSelected ? "default" : "outline"}
                        className={cn("cursor-pointer capitalize", isSelected && "bg-emerald-500")}
                        onClick={() => toggleArrayItem('core_values', value)}
                      >
                        {value}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Spiritual Practices field */}
            {activeField === 'spiritual_practices' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">Select your practices:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PRACTICES.map((practice) => {
                    const isSelected = (formData.spiritual_practices || profile?.spiritual_practices || []).includes(practice);
                    return (
                      <Badge
                        key={practice}
                        variant={isSelected ? "default" : "outline"}
                        className={cn("cursor-pointer capitalize", isSelected && "bg-violet-500")}
                        onClick={() => toggleArrayItem('spiritual_practices', practice)}
                      >
                        {practice.replace(/_/g, ' ')}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Interests field */}
            {activeField === 'interests' && (
              <div className="space-y-3">
                <Textarea
                  placeholder="What topics excite you? (comma separated)"
                  value={Array.isArray(formData.interests) ? formData.interests.join(', ') : formData.interests || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                />
              </div>
            )}

            {/* Avatar hint */}
            {activeField === 'avatar_url' && (
              <div className="text-center py-4">
                <User className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600 mb-4">
                  Add a profile photo to help others recognize and connect with you.
                </p>
                <Button onClick={() => window.location.href = createPageUrl('Profile') + '?edit=true'}>
                  Go to Profile Settings
                </Button>
              </div>
            )}
          </div>

          {activeField !== 'avatar_url' && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveField(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveField}
                disabled={updateMutation.isPending}
                className="gap-2"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Save
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}