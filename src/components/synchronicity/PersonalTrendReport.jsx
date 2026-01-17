import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, Sparkles, TrendingUp, Calendar, Brain, 
  Loader2, RefreshCw, Download, ChevronDown, ChevronUp
} from 'lucide-react';

export default function PersonalTrendReport({ userId, profile }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const { data: mySyncs = [] } = useQuery({
    queryKey: ['mySynchronicities', userId],
    queryFn: () => base44.entities.Synchronicity.filter({ user_id: userId }, '-created_date', 30),
    enabled: !!userId
  });

  const { data: myLikes = [] } = useQuery({
    queryKey: ['myLikedSyncs', userId],
    queryFn: async () => {
      const all = await base44.entities.Synchronicity.filter({ status: 'active' }, '-created_date', 100);
      return all.filter(s => s.liked_by?.includes(userId) || s.resonated_by?.includes(userId));
    },
    enabled: !!userId
  });

  const generateReport = async () => {
    if (mySyncs.length < 2 && myLikes.length < 2) return;
    
    setIsGenerating(true);

    const myData = mySyncs.map(s => ({
      category: s.category,
      symbols: s.symbols,
      description: s.description?.substring(0, 150),
      date: s.created_date
    }));

    const likedData = myLikes.slice(0, 10).map(s => ({
      category: s.category,
      symbols: s.symbols
    }));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a personalized synchronicity trend report for user "${profile?.display_name || 'User'}".

Their shared synchronicities:
${JSON.stringify(myData, null, 2)}

Synchronicities they've resonated with:
${JSON.stringify(likedData, null, 2)}

Create a meaningful, insightful personal report that includes:
1. Their dominant synchronicity themes
2. Symbols that frequently appear in their experiences
3. Patterns over time (are certain themes increasing?)
4. What the universe might be communicating to them
5. Suggested areas to pay attention to
6. Their synchronicity "fingerprint" - what makes their experiences unique

Make it personal, meaningful, and spiritually insightful.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          dominant_themes: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                theme: { type: "string" },
                percentage: { type: "number" },
                insight: { type: "string" }
              }
            }
          },
          key_symbols: { type: "array", items: { type: "string" } },
          universe_message: { type: "string" },
          attention_areas: { type: "array", items: { type: "string" } },
          synchronicity_fingerprint: { type: "string" },
          growth_opportunity: { type: "string" }
        }
      }
    });

    setReport(result);
    setIsGenerating(false);
    setExpanded(true);
  };

  const totalInteractions = mySyncs.length + myLikes.length;

  return (
    <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border-indigo-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Personal Trend Report
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="text-indigo-300"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-800/50 text-center">
              <p className="text-2xl font-bold text-white">{mySyncs.length}</p>
              <p className="text-xs text-slate-400">Your Shares</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 text-center">
              <p className="text-2xl font-bold text-white">{myLikes.length}</p>
              <p className="text-xs text-slate-400">Resonated With</p>
            </div>
          </div>

          {!report && !isGenerating && (
            <div className="text-center py-4">
              <p className="text-slate-400 text-sm mb-3">
                {totalInteractions < 4 
                  ? "Share or interact with more synchronicities to generate your report"
                  : "Generate your personalized synchronicity analysis"}
              </p>
              <Button
                onClick={generateReport}
                disabled={totalInteractions < 4}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                <Brain className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-6">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
              <p className="text-indigo-300 text-sm">Analyzing your synchronicity patterns...</p>
            </div>
          )}

          {report && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-sm text-white">{report.summary}</p>
              </div>

              {/* Dominant Themes */}
              {report.dominant_themes?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-2">Your Dominant Themes</p>
                  <div className="space-y-2">
                    {report.dominant_themes.map((theme, i) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-800/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white">{theme.theme}</span>
                          <span className="text-xs text-indigo-300">{theme.percentage}%</span>
                        </div>
                        <Progress value={theme.percentage} className="h-1 mb-1" />
                        <p className="text-xs text-slate-400">{theme.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Symbols */}
              {report.key_symbols?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-2">Your Key Symbols</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.key_symbols.map((symbol, i) => (
                      <Badge key={i} className="bg-violet-500/20 text-violet-300">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Universe Message */}
              {report.universe_message && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs font-medium text-amber-300 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Message for You
                  </p>
                  <p className="text-sm text-white">{report.universe_message}</p>
                </div>
              )}

              {/* Attention Areas */}
              {report.attention_areas?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-2">Pay Attention To</p>
                  <ul className="space-y-1">
                    {report.attention_areas.map((area, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fingerprint */}
              {report.synchronicity_fingerprint && (
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-xs font-medium text-slate-400 mb-1">Your Synchronicity Fingerprint</p>
                  <p className="text-sm text-slate-300 italic">{report.synchronicity_fingerprint}</p>
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={generateReport}
                className="w-full text-indigo-300 border-indigo-500/30"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Regenerate Report
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}