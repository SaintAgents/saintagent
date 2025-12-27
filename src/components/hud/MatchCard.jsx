import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Calendar, 
  UserPlus, 
  Bookmark, 
  X, 
  ChevronDown,
  Sparkles,
  Clock,
  Target,
  Users,
  Brain,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MatchCard({ match, onAction }) {
  const [showExplanation, setShowExplanation] = useState(false);
  
  const scoreColor = match.match_score >= 80 
    ? "text-emerald-600 bg-emerald-50" 
    : match.match_score >= 60 
    ? "text-amber-600 bg-amber-50" 
    : "text-slate-600 bg-slate-50";

  const typeIcons = {
    person: Users,
    offer: Target,
    mission: Sparkles,
    event: Calendar,
    teacher: Brain
  };

  const TypeIcon = typeIcons[match.target_type] || Users;

  const scoreBreakdown = [
    { label: "Intent Alignment", value: match.intent_alignment || 0, icon: Target },
    { label: "Skill Match", value: match.skill_complementarity || 0, icon: Brain },
    { label: "Proximity", value: match.proximity_score || 0, icon: Users },
    { label: "Timing", value: match.timing_readiness || 0, icon: Clock },
    { label: "Trust", value: match.trust_score || 0, icon: Shield },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-xl border border-slate-200/60 p-4 hover:shadow-lg hover:border-violet-200 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
            <AvatarImage src={match.target_avatar} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-medium">
              {match.target_name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
            <TypeIcon className="w-3 h-3 text-violet-500" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-slate-900 truncate">{match.target_name}</h4>
              <p className="text-sm text-slate-500 truncate">{match.target_subtitle}</p>
            </div>
            <div className={cn(
              "shrink-0 px-2.5 py-1 rounded-full text-sm font-bold",
              scoreColor
            )}>
              {match.match_score}%
            </div>
          </div>

          {match.timing_window && (
            <div className="flex items-center gap-1.5 mt-2">
              <Clock className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs text-violet-600 font-medium">{match.timing_window}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Button 
          size="sm" 
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg h-9"
          onClick={() => onAction?.('message', match)}
        >
          <MessageCircle className="w-4 h-4 mr-1.5" />
          Message
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="flex-1 rounded-lg h-9"
          onClick={() => onAction?.('book', match)}
        >
          <Calendar className="w-4 h-4 mr-1.5" />
          Book
        </Button>
        <Button 
          size="icon" 
          variant="ghost"
          className="h-9 w-9 shrink-0"
          onClick={() => onAction?.('save', match)}
        >
          <Bookmark className="w-4 h-4 text-slate-400" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost"
          className="h-9 w-9 shrink-0"
          onClick={() => onAction?.('decline', match)}
        >
          <X className="w-4 h-4 text-slate-400" />
        </Button>
      </div>

      <button
        onClick={() => setShowExplanation(!showExplanation)}
        className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 hover:text-violet-600 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Why this match?
        <ChevronDown className={cn(
          "w-3.5 h-3.5 transition-transform",
          showExplanation && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-sm text-slate-600 mb-3">{match.explanation}</p>
              <div className="grid grid-cols-5 gap-2">
                {scoreBreakdown.map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="flex justify-center mb-1">
                      <item.icon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700">{item.value}</div>
                    <div className="text-[10px] text-slate-400 truncate">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  More like this
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  Less like this
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}