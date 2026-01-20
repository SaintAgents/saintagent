import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, Wand2, CheckCircle, Loader2, Type, Smile, Zap, BookOpen, Bold, List, Newspaper } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ENHANCE_OPTIONS = [
  { id: 'improve', label: 'Improve Writing', icon: Wand2, prompt: 'You are an expert editor. Improve this text to be clearer, more engaging, and compelling. Fix any grammar issues, improve word choice, enhance flow, and make it more impactful while preserving the original meaning and voice. Return ONLY the improved text:' },
  { id: 'professional', label: 'Make Professional', icon: Type, prompt: 'You are a corporate communications expert. Rewrite this text in a polished, professional business tone. Use precise language, maintain authority and credibility, avoid casual phrases, and ensure it sounds executive-ready. Return ONLY the rewritten text:' },
  { id: 'friendly', label: 'Make Friendly', icon: Smile, prompt: 'You are a warm, personable writer. Transform this text to be genuinely warm, friendly, and approachable. Use conversational language, add personality, include relatable phrases, and make it feel like talking to a trusted friend. Return ONLY the friendly version:' },
  { id: 'concise', label: 'Make Concise', icon: Zap, prompt: 'You are a ruthless editor focused on brevity. Cut this text down significantly while keeping ALL key points and meaning intact. Remove filler words, redundancies, and unnecessary phrases. Make every word count. Return ONLY the shortened text:' },
  { id: 'expand', label: 'Expand & Elaborate', icon: BookOpen, prompt: 'You are a skilled content developer. Expand this text with rich detail, examples, context, and elaboration. Add depth and substance while maintaining the original tone and message. Make it more comprehensive and informative. Return ONLY the expanded text:' },
  { id: 'newsletter', label: 'Newsletter Format', icon: Newspaper, prompt: 'You are a newsletter design expert. Transform this into a beautifully formatted HTML newsletter. Use:\n- <h2> or <h3> for compelling section headlines\n- <strong> for key terms, names, and important phrases\n- <em> for subtle emphasis and quotes\n- <p> for well-spaced paragraphs\n- <ul><li> for scannable bullet points\n- <blockquote> for standout quotes if appropriate\nMake it visually scannable, engaging, and professional. Return ONLY the HTML-formatted text:' },
  { id: 'bold_key', label: 'Bold Key Points', icon: Bold, prompt: 'You are a formatting specialist. Identify and wrap the most important words, phrases, statistics, names, key takeaways, and action items in <strong> tags for emphasis. Be selective - only bold what truly deserves attention (roughly 10-15% of content). Keep all other text unchanged. Return ONLY the text with bold tags added:' },
  { id: 'add_structure', label: 'Add Structure', icon: List, prompt: 'You are a content architect. Restructure this text into a well-organized, scannable format using HTML:\n- <h3> for clear section headers that guide the reader\n- <p> for properly separated paragraphs\n- <ul><li> or <ol><li> for lists and steps\n- <strong> for key terms and important points\n- <hr> to separate major sections if needed\nMake it easy to scan, understand, and act upon. Return ONLY the structured HTML text:' },
];

export default function AIWritingAssistant({ text, onApply, disabled = false, buttonSize = 'sm' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleEnhance = async (option) => {
    if (!text?.trim()) return;
    
    setLoading(option.id);
    setSelectedOption(option);
    setSuggestion(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${option.prompt}\n\n"${text}"\n\nRespond with ONLY the improved text, no explanations or quotes.`,
      });
      setSuggestion(result);
    } catch (err) {
      console.error('AI enhancement failed:', err);
      setSuggestion(null);
    } finally {
      setLoading(null);
    }
  };

  const applySuggestion = () => {
    if (suggestion) {
      onApply(suggestion);
      setSuggestion(null);
      setSelectedOption(null);
      setOpen(false);
    }
  };

  const isDisabled = disabled || !text?.trim();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={buttonSize}
          disabled={isDisabled}
          className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-xs">AI Enhance</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Sparkles className="w-4 h-4 text-violet-500" />
            AI Writing Assistant
          </div>

          {!suggestion ? (
            <div className="space-y-1">
              {ENHANCE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isLoading = loading === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleEnhance(option)}
                    disabled={!!loading}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-sm hover:bg-slate-100 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="text-slate-700">{option.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 flex items-center gap-1">
                {selectedOption?.icon && <selectedOption.icon className="w-3 h-3" />}
                {selectedOption?.label}
              </div>
              <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 text-sm text-slate-700 max-h-40 overflow-y-auto">
                {suggestion}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setSuggestion(null); setSelectedOption(null); }}
                  className="flex-1"
                >
                  Try Another
                </Button>
                <Button
                  size="sm"
                  onClick={applySuggestion}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  Apply
                </Button>
              </div>
            </div>
          )}

          <p className="text-[10px] text-slate-400 text-center">
            AI suggestions may need review before posting
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}