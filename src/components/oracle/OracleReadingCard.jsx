import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Share2, BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const ORACLE_ICONS = {
  horoscope: '♈',
  tarot: '🃏',
  iching: '☯',
  runes: 'ᚱ',
  numerology: '🔢',
  oracle_cards: '✨',
};

const FOCUS_LABELS = {
  general: 'General Guidance',
  wealth: 'Wealth & Abundance',
  love: 'Love & Relationships',
  career: 'Career & Purpose',
  health: 'Health & Vitality',
  spiritual: 'Spiritual Growth',
  creativity: 'Creativity & Expression',
  shadow: 'Shadow Work',
};

const TIMEFRAME_LABELS = {
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
  yearly: 'Year Ahead',
};

export default function OracleReadingCard({ reading, readingType, focus, timeframe }) {
  if (!reading) return null;

  const icon = ORACLE_ICONS[readingType] || '✨';
  const focusLabel = FOCUS_LABELS[focus] || focus;
  const timeLabel = TIMEFRAME_LABELS[timeframe] || timeframe;

  const handleShare = () => {
    const text = `🔮 My ${focusLabel} reading for ${timeLabel}:\n\n${reading.slice(0, 200)}...\n\n— via SaintAgent Oracle`;
    navigator.clipboard.writeText(text);
    toast.success('Reading copied to clipboard');
  };

  return (
    <Card className="overflow-hidden border-violet-200/50">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-violet-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <div>
              <h3 className="text-white font-bold text-lg">{focusLabel}</h3>
              <p className="text-violet-300 text-sm">{timeLabel}'s Reading</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-violet-300 hover:text-white hover:bg-white/10" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Reading content */}
      <CardContent className="p-6">
        <div className="prose prose-slate prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h2 className="text-lg font-bold text-slate-900 mt-4 mb-2 first:mt-0">{children}</h2>,
              h2: ({ children }) => <h3 className="text-base font-semibold text-violet-800 mt-4 mb-2">{children}</h3>,
              h3: ({ children }) => <h4 className="text-sm font-semibold text-indigo-700 mt-3 mb-1">{children}</h4>,
              p: ({ children }) => <p className="text-slate-700 leading-relaxed mb-3">{children}</p>,
              strong: ({ children }) => <strong className="text-slate-900 font-semibold">{children}</strong>,
              em: ({ children }) => <em className="text-violet-700 not-italic font-medium">{children}</em>,
              ul: ({ children }) => <ul className="space-y-1 mb-3">{children}</ul>,
              li: ({ children }) => <li className="text-slate-700 flex items-start gap-2"><Sparkles className="w-3 h-3 text-violet-500 mt-1.5 shrink-0" /><span>{children}</span></li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-violet-400 bg-violet-50 pl-4 py-2 my-3 rounded-r-lg italic text-violet-800">
                  {children}
                </blockquote>
              ),
              hr: () => <div className="my-4 flex items-center justify-center gap-2"><span className="text-violet-300">✦</span><div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-200 to-transparent" /><span className="text-violet-300">✦</span></div>,
            }}
          >
            {reading}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}