import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Wand2, Loader2, Check, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const AI_ACTIONS = [
  { id: 'improve', label: 'Improve Writing', icon: Wand2 },
  { id: 'summarize', label: 'Summarize', icon: Sparkles },
  { id: 'expand', label: 'Expand Ideas', icon: Sparkles },
  { id: 'tone', label: 'Change Tone', icon: Wand2 },
  { id: 'seo', label: 'SEO Optimize', icon: Sparkles }
];

export default function AIWritingAssistant({ projectId, content, onApplySuggestion }) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  const handleAIAction = async (action) => {
    if (!content) {
      toast.error('No content to work with');
      return;
    }

    setSelectedAction(action);
    setLoading(true);
    setResult('');

    try {
      const prompts = {
        improve: `Improve the following content for clarity, grammar, and flow:\n\n${content}`,
        summarize: `Create a concise summary of the following content:\n\n${content}`,
        expand: `Expand on the following content with more details and examples:\n\n${content}`,
        tone: `Rewrite the following content in a more professional and engaging tone:\n\n${content}`,
        seo: `Optimize the following content for SEO with better keywords and structure:\n\n${content}`
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[action]
      });

      setResult(response);
    } catch (e) {
      toast.error('AI generation failed');
      console.error(e);
    }
    setLoading(false);
  };

  const handleCustomPrompt = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${prompt}\n\nContent:\n${content}`
      });
      setResult(response);
    } catch (e) {
      toast.error('AI generation failed');
    }
    setLoading(false);
  };

  const handleApply = () => {
    onApplySuggestion(result);
    toast.success('Applied AI suggestion');
    setResult('');
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          AI Writing Assistant
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {AI_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleAIAction(action.id)}
                disabled={loading || !content}
              >
                <Icon className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-slate-700 mb-2">Custom Request</h4>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI to help with your content..."
          rows={3}
          className="mb-2"
        />
        <Button 
          onClick={handleCustomPrompt}
          disabled={loading || !prompt.trim()}
          size="sm"
          className="w-full"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
          Generate
        </Button>
      </div>

      {loading && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
            <p className="text-sm text-slate-600">AI is working...</p>
          </div>
        </Card>
      )}

      {result && !loading && (
        <Card className="p-4 bg-violet-50 border-violet-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-violet-900">AI Suggestion</h4>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  toast.success('Copied to clipboard');
                }}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7"
                onClick={handleApply}
              >
                <Check className="w-3 h-3 text-emerald-600" />
              </Button>
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <div className="text-sm text-slate-700 whitespace-pre-wrap">{result}</div>
          </div>
        </Card>
      )}
    </div>
  );
}