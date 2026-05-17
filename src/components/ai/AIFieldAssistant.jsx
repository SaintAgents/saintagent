import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Sparkles, Loader2, RefreshCw, Check, Wand2 } from 'lucide-react';

export default function AIFieldAssistant({ field, profile, onApplySuggestion }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const profileContext = `
Name: ${profile?.display_name || 'Unknown'}
Bio: ${profile?.bio || 'Not set'}
Skills: ${(profile?.skills || []).join(', ') || 'None'}
Interests: ${(profile?.interests || []).join(', ') || 'None'}
Spiritual Practices: ${(profile?.spiritual_practices || []).join(', ') || 'None'}
Core Values: ${(profile?.core_values || []).join(', ') || 'None'}
Location: ${profile?.location || 'Not set'}
Mystical ID: ${profile?.mystical_identifier || 'Not set'}
Astrological Sign: ${profile?.astrological_sign || 'Not set'}
`;

      const fieldPrompts = {
        bio: `Write 3 different engaging bio options (each 2-3 sentences) for this community member. Make them warm, authentic, and highlight their unique qualities. Base them on whatever profile data exists.`,
        skills: `Suggest 10 specific skills this person likely has based on their profile. Include both hard and soft skills. Return as a flat array of strings.`,
        interests: `Suggest 10 interest topics this person would likely resonate with based on their profile. Return as a flat array of strings.`,
        spiritual_practices: `Suggest 8 spiritual or mindfulness practices this person might enjoy based on their profile. Return as a flat array of strings using snake_case (e.g. "sound_healing").`,
        core_values: `Suggest 8 core values that align with this person's profile and spiritual orientation. Return as a flat array of strings.`,
        location: `Based on any clues in the profile, suggest 3 possible location formats they might use (city, country style). If no clues, suggest common formats like "Los Angeles, USA".`,
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${fieldPrompts[field] || 'Suggest content for this field.'}\n\nPROFILE:\n${profileContext}`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: field === 'bio' || field === 'location'
              ? { type: "array", items: { type: "string" } }
              : { type: "array", items: { type: "string" } },
            reasoning: { type: "string" }
          }
        }
      });

      setSuggestions(response);
    } catch (err) {
      console.error('AI suggestions failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!suggestions && !loading) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 border-violet-200 text-violet-600 hover:bg-violet-50 hover:text-violet-700"
        onClick={generateSuggestions}
      >
        <Wand2 className="w-3.5 h-3.5" />
        AI Suggest for me
      </Button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-violet-50 border border-violet-200">
        <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
        <span className="text-sm text-violet-600">Generating personalized suggestions...</span>
      </div>
    );
  }

  const isTextSuggestions = field === 'bio' || field === 'location';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-violet-600 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          AI Suggestions
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-violet-500"
          onClick={generateSuggestions}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh
        </Button>
      </div>

      {suggestions?.reasoning && (
        <p className="text-xs text-slate-500 italic">{suggestions.reasoning}</p>
      )}

      {isTextSuggestions ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(suggestions?.suggestions || []).map((text, idx) => (
            <button
              key={idx}
              onClick={() => onApplySuggestion(text)}
              className="w-full text-left p-3 rounded-lg border border-violet-100 bg-white hover:border-violet-300 hover:bg-violet-50 transition-all group"
            >
              <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
              <span className="text-xs text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Click to use
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {(suggestions?.suggestions || []).map((item, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="cursor-pointer capitalize hover:bg-violet-100 hover:border-violet-300 transition-colors"
              onClick={() => onApplySuggestion(item)}
            >
              <span className="mr-1">+</span>
              {item.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}