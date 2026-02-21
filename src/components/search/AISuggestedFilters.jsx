import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, RefreshCw, Lightbulb } from "lucide-react";

export default function AISuggestedFilters({ 
  currentUser, 
  activeTab, 
  onApplySuggestion,
  recentSearches = []
}) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user profile for context
  const { data: profile } = useQuery({
    queryKey: ['userProfileForSuggestions', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser?.email });
      return profiles?.[0];
    },
    enabled: !!currentUser?.email,
    staleTime: 300000
  });

  // Fetch user's saved filters to understand patterns
  const { data: savedFilters = [] } = useQuery({
    queryKey: ['savedFiltersForAI', currentUser?.email],
    queryFn: () => base44.entities.SavedFilter.filter({ user_id: currentUser?.email }),
    enabled: !!currentUser?.email,
    staleTime: 60000
  });

  const generateSuggestions = async () => {
    if (!currentUser) return;
    setLoading(true);

    // Build context for AI
    const context = {
      userSkills: profile?.skills_offered || [],
      userInterests: profile?.interests || [],
      userLocation: profile?.location || profile?.region,
      recentSearches: recentSearches.slice(0, 5),
      savedFilterPatterns: savedFilters.slice(0, 3).map(f => ({
        type: f.entity_type,
        filters: Object.keys(f.filters || {})
      })),
      activeTab
    };

    const prompt = `Based on this user's profile and behavior, suggest 3-4 smart search filters they might find useful.

User Context:
- Skills: ${context.userSkills.join(', ') || 'Not specified'}
- Interests: ${context.userInterests.join(', ') || 'Not specified'}
- Location: ${context.userLocation || 'Global'}
- Recent searches: ${context.recentSearches.join(', ') || 'None'}
- Currently searching: ${activeTab === 'all' ? 'All categories' : activeTab}
- Frequently used filters: ${context.savedFilterPatterns.map(p => p.filters.join(', ')).join('; ') || 'None'}

Return a JSON object with this structure:
{
  "suggestions": [
    {
      "label": "Short display label",
      "description": "Why this might be useful",
      "filters": { filter object to apply },
      "searchTerm": "optional search term"
    }
  ],
  "searchTerms": ["suggested", "search", "terms"]
}

Make suggestions contextual to ${activeTab === 'all' ? 'general discovery' : activeTab}. 
For people tab, suggest skill/location filters.
For missions tab, suggest reward/type filters.
For circles tab, suggest category/size filters.
For offers tab, suggest price/category filters.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  description: { type: "string" },
                  filters: { type: "object" },
                  searchTerm: { type: "string" }
                }
              }
            },
            searchTerms: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      setSuggestions(result);
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
      // Fallback suggestions
      setSuggestions({
        suggestions: getDefaultSuggestions(activeTab, profile),
        searchTerms: getDefaultSearchTerms(activeTab)
      });
    }
    setLoading(false);
  };

  // Generate on mount or tab change
  useEffect(() => {
    if (currentUser && !suggestions) {
      generateSuggestions();
    }
  }, [currentUser, activeTab]);

  if (!currentUser) return null;

  return (
    <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-3 border border-violet-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium text-violet-700">AI Suggestions</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs gap-1"
          onClick={generateSuggestions}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
        </div>
      ) : suggestions ? (
        <div className="space-y-2">
          {/* Filter suggestions */}
          {suggestions.suggestions?.slice(0, 4).map((sug, i) => (
            <button
              key={i}
              onClick={() => onApplySuggestion(sug.filters, sug.searchTerm)}
              className="w-full text-left p-2 rounded-lg bg-white/60 hover:bg-white transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-violet-700">
                  {sug.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 pl-5">{sug.description}</p>
            </button>
          ))}

          {/* Search term suggestions */}
          {suggestions.searchTerms?.length > 0 && (
            <div className="pt-2 border-t border-violet-100">
              <p className="text-xs text-slate-500 mb-1">Try searching:</p>
              <div className="flex flex-wrap gap-1">
                {suggestions.searchTerms.slice(0, 5).map((term, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer text-xs bg-white hover:bg-violet-100"
                    onClick={() => onApplySuggestion({}, term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

// Default suggestions when AI fails
function getDefaultSuggestions(tab, profile) {
  const location = profile?.location || profile?.region;
  
  const defaults = {
    all: [
      { label: 'Active this week', description: 'Recently updated content', filters: { dateFrom: new Date(Date.now() - 7*24*60*60*1000).toISOString() } },
      { label: 'High engagement', description: 'Popular with the community', filters: { engagementLevel: 'engaged' } },
    ],
    people: [
      { label: 'In my area', description: 'People nearby', filters: { location: location || '' } },
      { label: 'Power users', description: 'Most active members', filters: { engagementLevel: 'power' } },
    ],
    missions: [
      { label: 'High rewards', description: 'Missions with good GGG', filters: {} },
      { label: 'Actively recruiting', description: 'Open missions', filters: { status: 'active' } },
    ],
    circles: [
      { label: 'Growing communities', description: 'Popular circles', filters: { minMembers: 10 } },
      { label: 'Small & intimate', description: 'Cozy groups', filters: { maxMembers: 20 } },
    ],
    offers: [
      { label: 'Free resources', description: 'No cost to access', filters: { isFree: true } },
      { label: 'Top rated', description: 'Highly reviewed', filters: {} },
    ],
  };
  
  return defaults[tab] || defaults.all;
}

function getDefaultSearchTerms(tab) {
  const terms = {
    all: ['collaboration', 'mentorship', 'learning'],
    people: ['developer', 'designer', 'mentor'],
    missions: ['community', 'creative', 'tech'],
    circles: ['meditation', 'business', 'creative'],
    offers: ['coaching', 'consulting', 'course'],
  };
  return terms[tab] || terms.all;
}