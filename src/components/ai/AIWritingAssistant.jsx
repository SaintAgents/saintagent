import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, Wand2, CheckCircle, Loader2, Type, Smile, Zap, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ENHANCE_OPTIONS = [
  { id: 'improve', label: 'Improve Writing', icon: Wand2, prompt: 'Improve this text to be clearer, more engaging, and well-written while keeping the same meaning and tone:' },
  { id: 'professional', label: 'Make Professional', icon: Type, prompt: 'Rewrite this text in a professional, polished tone while preserving the core message:' },
  { id: 'friendly', label: 'Make Friendly', icon: Smile, prompt: 'Rewrite this text to be warm, friendly, and approachable while keeping the same meaning:' },
  { id: 'concise', label: 'Make Concise', icon: Zap, prompt: 'Shorten and tighten this text while keeping all important points:' },
  { id: 'expand', label: 'Expand & Elaborate', icon: BookOpen, prompt: 'Expand this text with more detail and elaboration while maintaining the original tone:' },
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