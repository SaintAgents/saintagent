import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Loader2, Sparkles, TrendingUp, MessageSquare, AlertCircle } from 'lucide-react';

export default function DealAIAssistant({ deal, notes, activities, currentUser, profile }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const context = `
Deal: ${deal.title}
Company: ${deal.company_name || 'N/A'}
Amount: $${deal.amount?.toLocaleString() || 0}
Stage: ${deal.stage}
Priority: ${deal.priority}
Probability: ${deal.probability || 0}%
Expected Close: ${deal.expected_close_date || 'Not set'}
Description: ${deal.description || 'None'}

Recent Notes:
${notes.slice(0, 5).map(n => `- ${n.content}`).join('\n') || 'No notes'}

Recent Activity:
${activities.slice(0, 5).map(a => `- ${a.description}`).join('\n') || 'No activity'}
      `.trim();

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a sales assistant. Analyze this deal and provide:
1. Key strengths of the deal
2. Potential risks or concerns
3. Recommended next steps
4. Tips to increase win probability

${context}

Provide concise, actionable insights.`,
        response_json_schema: {
          type: "object",
          properties: {
            strengths: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
            next_steps: { type: "array", items: { type: "string" } },
            tips: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSuggestions(result);
    } catch (error) {
      console.error('AI insights failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const context = `
Deal: ${deal.title}
Company: ${deal.company_name || 'N/A'}
Amount: $${deal.amount?.toLocaleString() || 0}
Stage: ${deal.stage}
Description: ${deal.description || 'None'}
Notes: ${notes.map(n => n.content).join('. ') || 'No notes'}
      `.trim();

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a sales assistant helping with this deal:

${context}

User question: ${query}

Provide a helpful, concise answer.`
      });

      setResponse(result);
      setQuery('');
    } catch (error) {
      console.error('AI query failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Generate Insights Button */}
      {!suggestions && (
        <div className="text-center py-6">
          <Bot className="w-12 h-12 mx-auto text-violet-400 mb-3" />
          <p className="text-sm text-slate-600 mb-4">
            Get AI-powered insights and recommendations for this deal
          </p>
          <Button
            onClick={generateInsights}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Deal Insights
          </Button>
        </div>
      )}

      {/* Insights Display */}
      {suggestions && (
        <div className="space-y-4">
          {/* Strengths */}
          {suggestions.strengths?.length > 0 && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <h4 className="text-sm font-medium text-emerald-700 flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" />
                Strengths
              </h4>
              <ul className="text-sm text-emerald-800 space-y-1">
                {suggestions.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {suggestions.risks?.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <h4 className="text-sm font-medium text-amber-700 flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" />
                Risks & Concerns
              </h4>
              <ul className="text-sm text-amber-800 space-y-1">
                {suggestions.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {suggestions.next_steps?.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-sm font-medium text-blue-700 flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4" />
                Recommended Next Steps
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {suggestions.next_steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          {suggestions.tips?.length > 0 && (
            <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
              <h4 className="text-sm font-medium text-violet-700 flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                Tips to Win
              </h4>
              <ul className="text-sm text-violet-800 space-y-1">
                {suggestions.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-violet-500">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSuggestions(null)}
            className="text-slate-500"
          >
            Regenerate Insights
          </Button>
        </div>
      )}

      {/* Q&A Section */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium text-slate-700 mb-2">Ask a Question</h4>
        {response && (
          <div className="p-3 bg-slate-50 rounded-lg mb-3">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{response}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about this deal..."
            rows={2}
            className="flex-1"
          />
          <Button
            onClick={askQuestion}
            disabled={!query.trim() || loading}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}