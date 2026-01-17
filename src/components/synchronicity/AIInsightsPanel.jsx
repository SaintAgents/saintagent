import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, Brain, TrendingUp, Lightbulb, RefreshCw, Loader2,
  Eye, Hash, Clock, Users, MessageCircle, Flame
} from 'lucide-react';

const THEME_ICONS = {
  numbers: Hash,
  dreams: Eye,
  encounters: Users,
  signs: Sparkles,
  timing: Clock,
  patterns: TrendingUp,
  messages: MessageCircle,
  other: Flame
};

export default function AIInsightsPanel({ userId, synchronicities = [] }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);

  const analyzePatterns = async () => {
    if (synchronicities.length < 3) return;
    
    setIsAnalyzing(true);
    
    const recentSyncs = synchronicities.slice(0, 20).map(s => ({
      category: s.category,
      symbols: s.symbols,
      description: s.description?.substring(0, 200),
      theme_tags: s.theme_tags
    }));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze these synchronicity reports from a spiritual community and identify:
1. Recurring themes and patterns across multiple reports
2. Collective consciousness trends (what the community is experiencing together)
3. Symbol clusters that appear together frequently
4. Time-based patterns (if any themes are emerging recently)
5. Guidance messages that seem to be coming through to the collective

Synchronicities:
${JSON.stringify(recentSyncs, null, 2)}

Provide insightful, meaningful analysis that helps users understand the deeper patterns in their collective experiences.`,
      response_json_schema: {
        type: "object",
        properties: {
          recurring_themes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                theme: { type: "string" },
                frequency: { type: "string" },
                meaning: { type: "string" }
              }
            }
          },
          collective_message: { type: "string" },
          symbol_clusters: {
            type: "array",
            items: {
              type: "object",
              properties: {
                symbols: { type: "array", items: { type: "string" } },
                interpretation: { type: "string" }
              }
            }
          },
          emerging_trend: { type: "string" },
          guidance: { type: "string" }
        }
      }
    });

    setInsights(result);
    setIsAnalyzing(false);
  };

  return (
    <Card className="bg-gradient-to-br from-violet-900/40 to-slate-900/60 border-violet-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" />
            AI Pattern Insights
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={analyzePatterns}
            disabled={isAnalyzing || synchronicities.length < 3}
            className="text-violet-300 hover:text-violet-100"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!insights && !isAnalyzing && (
          <div className="text-center py-6">
            <Sparkles className="w-10 h-10 text-violet-500/40 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-3">
              {synchronicities.length < 3 
                ? "Need at least 3 synchronicities to analyze patterns"
                : "Click refresh to analyze community patterns"}
            </p>
            {synchronicities.length >= 3 && (
              <Button
                size="sm"
                onClick={analyzePatterns}
                className="bg-violet-600 hover:bg-violet-500"
              >
                <Brain className="w-4 h-4 mr-2" />
                Analyze Patterns
              </Button>
            )}
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
            <p className="text-violet-300 text-sm">Analyzing collective patterns...</p>
          </div>
        )}

        {insights && (
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-4">
              {/* Collective Message */}
              {insights.collective_message && (
                <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <p className="text-xs font-medium text-violet-300 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Collective Message
                  </p>
                  <p className="text-sm text-white">{insights.collective_message}</p>
                </div>
              )}

              {/* Recurring Themes */}
              {insights.recurring_themes?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-2">Recurring Themes</p>
                  <div className="space-y-2">
                    {insights.recurring_themes.map((theme, i) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-800/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-violet-500/20 text-violet-300 text-xs">
                            {theme.theme}
                          </Badge>
                          <span className="text-xs text-slate-500">{theme.frequency}</span>
                        </div>
                        <p className="text-xs text-slate-300">{theme.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Symbol Clusters */}
              {insights.symbol_clusters?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-2">Symbol Clusters</p>
                  {insights.symbol_clusters.map((cluster, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-800/50 mb-2">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {cluster.symbols?.map((sym, si) => (
                          <span key={si} className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs">
                            {sym}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-300">{cluster.interpretation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Emerging Trend */}
              {insights.emerging_trend && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs font-medium text-emerald-300 mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Emerging Trend
                  </p>
                  <p className="text-sm text-white">{insights.emerging_trend}</p>
                </div>
              )}

              {/* Guidance */}
              {insights.guidance && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs font-medium text-amber-300 mb-1 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Collective Guidance
                  </p>
                  <p className="text-sm text-white">{insights.guidance}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}