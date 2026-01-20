import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Users, Target, BookOpen, RefreshCw, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function AIRecommendationEngine({ profile, context = 'insights' }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const { data: articles = [] } = useQuery({
    queryKey: ['newsArticles'],
    queryFn: () => base44.entities.NewsArticle.filter({ is_published: true }, '-published_date', 50),
    enabled: context === 'insights'
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['activeMissions'],
    queryFn: () => base44.entities.Mission.filter({ status: 'active' }, '-created_date', 30)
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['potentialConnections'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 50)
  });

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const userContext = {
        skills: profile?.skills || [],
        values: profile?.values_tags || [],
        intentions: profile?.intentions || [],
        spiritual_practices: profile?.spiritual_practices || [],
        current_focus_areas: profile?.current_focus_areas || [],
        seeking_support_in: profile?.seeking_support_in || [],
        can_offer_support_in: profile?.can_offer_support_in || []
      };

      const prompt = `Based on this user profile: ${JSON.stringify(userContext)}

Available content: ${articles.slice(0, 10).map(a => `"${a.title}" (${a.category})`).join(', ')}
Available missions: ${missions.slice(0, 10).map(m => `"${m.title}" (${m.mission_type})`).join(', ')}
Available people: ${profiles.slice(0, 10).map(p => `${p.display_name} - skills: ${(p.skills || []).join(', ')}`).join(' | ')}

Generate personalized recommendations with exact matching. Return JSON with:
- content: array of 3 article titles that match user interests
- missions: array of 3 mission titles aligned with their goals
- connections: array of 3 people names who complement their skills/values
- reasoning: brief explanation of each recommendation

Focus on genuine alignment, not generic suggestions.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            content: { type: 'array', items: { type: 'string' } },
            missions: { type: 'array', items: { type: 'string' } },
            connections: { type: 'array', items: { type: 'string' } },
            reasoning: { type: 'object' }
          }
        }
      });

      setRecommendations(result);
    } catch (error) {
      console.error('AI recommendations failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const findArticle = (title) => articles.find(a => a.title.includes(title) || title.includes(a.title));
  const findMission = (title) => missions.find(m => m.title.includes(title) || title.includes(m.title));
  const findProfile = (name) => profiles.find(p => p.display_name?.includes(name) || name.includes(p.display_name));

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-purple-50/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-violet-600" />
            AI Recommendations
          </span>
          <Button
            size="sm"
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!recommendations ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-violet-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">
              Get personalized recommendations based on your profile, skills, and goals.
            </p>
            <Button
              onClick={generateRecommendations}
              disabled={isGenerating}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isGenerating ? 'Analyzing...' : 'Get Recommendations'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Content Recommendations */}
            {context === 'insights' && recommendations.content?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-violet-600" />
                  <h4 className="font-semibold text-slate-900">Recommended Reading</h4>
                </div>
                <div className="space-y-2">
                  {recommendations.content.map((title, idx) => {
                    const article = findArticle(title);
                    if (!article) return null;
                    return (
                      <button
                        key={idx}
                        onClick={() => window.location.href = createPageUrl('Insights')}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm">{article.title}</p>
                          <Badge className="mt-1 text-xs">{article.category}</Badge>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
                {recommendations.reasoning?.content && (
                  <p className="text-xs text-slate-500 mt-2 italic">
                    {recommendations.reasoning.content}
                  </p>
                )}
              </div>
            )}

            {/* Mission Recommendations */}
            {recommendations.missions?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-violet-600" />
                  <h4 className="font-semibold text-slate-900">Aligned Missions</h4>
                </div>
                <div className="space-y-2">
                  {recommendations.missions.map((title, idx) => {
                    const mission = findMission(title);
                    if (!mission) return null;
                    return (
                      <button
                        key={idx}
                        onClick={() => window.location.href = createPageUrl('Missions')}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm">{mission.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{mission.participant_count || 0} joined</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
                {recommendations.reasoning?.missions && (
                  <p className="text-xs text-slate-500 mt-2 italic">
                    {recommendations.reasoning.missions}
                  </p>
                )}
              </div>
            )}

            {/* Connection Recommendations */}
            {recommendations.connections?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-violet-600" />
                  <h4 className="font-semibold text-slate-900">Potential Connections</h4>
                </div>
                <div className="space-y-2">
                  {recommendations.connections.map((name, idx) => {
                    const person = findProfile(name);
                    if (!person) return null;
                    return (
                      <button
                        key={idx}
                        data-user-id={person.user_id}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={person.avatar_url}
                            alt={person.display_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{person.display_name}</p>
                            <p className="text-xs text-slate-500">@{person.handle}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
                {recommendations.reasoning?.connections && (
                  <p className="text-xs text-slate-500 mt-2 italic">
                    {recommendations.reasoning.connections}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}