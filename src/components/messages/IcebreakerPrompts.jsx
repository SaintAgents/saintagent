import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Sparkles, RefreshCw, Heart, Compass, Star, Zap } from "lucide-react";

const ICEBREAKER_CATEGORIES = {
  spiritual: {
    icon: Star,
    color: 'text-violet-500',
    prompts: [
      "What spiritual practice has had the most profound impact on your journey?",
      "If you could have a conversation with any spiritual teacher, who would it be?",
      "What's a synchronicity that happened to you recently?",
      "How do you stay grounded when life gets chaotic?",
      "What does 'awakening' mean to you personally?",
      "What's a book or teaching that transformed your perspective?"
    ]
  },
  connection: {
    icon: Heart,
    color: 'text-pink-500',
    prompts: [
      "What's something you're passionate about that most people don't know?",
      "What does an ideal day look like for you?",
      "What quality do you value most in deep friendships?",
      "What's a dream you're actively working toward?",
      "How do you recharge when you're feeling drained?",
      "What's something that always makes you smile?"
    ]
  },
  exploration: {
    icon: Compass,
    color: 'text-emerald-500',
    prompts: [
      "If you could live anywhere in the world for a year, where would you go?",
      "What skill are you currently learning or want to learn?",
      "What's a perspective you've changed your mind about recently?",
      "What's the most meaningful conversation you've had lately?",
      "What adventure is on your bucket list?",
      "What topic could you talk about for hours?"
    ]
  },
  playful: {
    icon: Zap,
    color: 'text-amber-500',
    prompts: [
      "If you had a superpower, what would it be and why?",
      "What's a guilty pleasure you're not ashamed to admit?",
      "What song always gets you dancing?",
      "If you could master any instrument overnight, which one?",
      "What fictional world would you want to visit?",
      "What's the best meal you've ever had?"
    ]
  }
};

export default function IcebreakerPrompts({ onSelect, recipientName }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('connection');
  const [shuffleKey, setShuffleKey] = useState(0);

  const shufflePrompts = () => {
    setShuffleKey(prev => prev + 1);
  };

  const handleSelect = (prompt) => {
    onSelect(prompt);
    setOpen(false);
  };

  const getRandomPrompts = (prompts) => {
    const shuffled = [...prompts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  const currentCategory = ICEBREAKER_CATEGORIES[category];
  const displayPrompts = getRandomPrompts(currentCategory.prompts);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100 hover:border-violet-300 h-9 px-3 gap-1.5"
          title="Send an icebreaker"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Icebreaker</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="p-3 border-b bg-gradient-to-r from-violet-50 to-pink-50">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            Start a Conversation
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Break the ice with {recipientName || 'your match'}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b px-2 pt-2">
          {Object.entries(ICEBREAKER_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-t-lg transition-colors",
                category === key
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <cat.icon className={cn("w-3.5 h-3.5", cat.color)} />
              <span className="capitalize hidden sm:inline">{key}</span>
            </button>
          ))}
        </div>

        {/* Prompts */}
        <div className="p-3 space-y-2" key={shuffleKey}>
          {displayPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(prompt)}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-sm text-slate-700 hover:text-slate-900"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Shuffle */}
        <div className="p-3 border-t bg-slate-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={shufflePrompts}
            className="w-full gap-2 text-slate-600"
          >
            <RefreshCw className="w-4 h-4" />
            Shuffle prompts
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}