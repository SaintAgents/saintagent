import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  X, 
  Bookmark, 
  BookmarkCheck, 
  MapPin, 
  Sparkles, 
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertTriangle,
  MessageCircle,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';

function PredictionGauge({ prediction }) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (prediction.score / 100) * circumference;
  
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-slate-100"
        />
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-500",
            prediction.score >= 75 ? "text-emerald-500" :
            prediction.score >= 60 ? "text-teal-500" :
            prediction.score >= 45 ? "text-amber-500" : "text-red-500"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900">{prediction.score}%</span>
        <span className={cn("text-xs font-medium", prediction.color)}>{prediction.label}</span>
      </div>
    </div>
  );
}

function DomainBar({ label, score }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 capitalize">{label.replaceAll('_', ' ')}</span>
        <span className="font-medium text-slate-900">{Math.round(score)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-300",
            score >= 70 ? "bg-emerald-500" :
            score >= 50 ? "bg-teal-500" :
            score >= 30 ? "bg-amber-500" : "bg-red-400"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function CompatibilityResults({ results, onSave, onDismiss, onUnsave, savedMatches = [] }) {
  const [expandedCards, setExpandedCards] = React.useState({});

  const toggleExpand = (userId) => {
    setExpandedCards(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No compatibility results yet.</p>
        <p className="text-slate-400 text-xs mt-1">Save your settings and run a compatibility check to find matches.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((r) => {
        const isExpanded = expandedCards[r.user_id];
        const isSaved = savedMatches.includes(r.user_id);
        
        return (
          <Card key={r.user_id} className={cn(
            "bg-white border rounded-xl overflow-hidden transition-all",
            isSaved && "ring-2 ring-violet-200 border-violet-300"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                {/* Avatar & Basic Info */}
                <div className="flex-shrink-0">
                  <Avatar className="w-16 h-16 border-2 border-slate-100">
                    <AvatarImage src={r.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700 text-lg font-semibold">
                      {r.display_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        {r.display_name}{r.isDemo && ' [demo]'}
                        {isSaved && (
                          <BookmarkCheck className="w-4 h-4 text-violet-500" />
                        )}
                      </h3>
                      {r.location && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {r.location}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.relationship_orientation && (
                          <Badge variant="secondary" className="text-[10px] capitalize">
                            {r.relationship_orientation}
                          </Badge>
                        )}
                        {r.intent && (
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {r.intent}
                          </Badge>
                        )}
                        {r.tags?.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] text-violet-600 border-violet-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Prediction Gauge */}
                    <PredictionGauge prediction={r.prediction} />
                  </div>
                  
                  {/* Bio snippet */}
                  {r.bio && (
                    <p className="text-sm text-slate-600 mt-3 line-clamp-2">{r.bio}</p>
                  )}
                  
                  {/* Synchronicity note */}
                  {r.synchronicity_note && (
                    <p className="text-xs text-violet-600 italic mt-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {r.synchronicity_note}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Quick Stats Bar */}
              <div className="mt-4 flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{r.strengths.length} strengths</span>
                </div>
                {r.frictions.length > 0 && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{r.frictions.length} considerations</span>
                  </div>
                )}
                <div className="ml-auto text-slate-500">
                  Overall: <span className="font-semibold text-slate-900">{r.overall}%</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Domain Scores */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                {Object.entries(r.domainScores).map(([k, v]) => (
                  <DomainBar key={k} label={k} score={v} />
                ))}
              </div>
              
              {/* Expandable Details */}
              <button
                onClick={() => toggleExpand(r.user_id)}
                className="w-full flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-slate-700 py-2 border-t border-slate-100"
              >
                {isExpanded ? (
                  <>Less details <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>More details <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
              
              {isExpanded && (
                <div className="pt-3 space-y-4 border-t border-slate-100">
                  {/* Strengths */}
                  {r.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-emerald-700 mb-2 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Why this could work
                      </h4>
                      <ul className="space-y-1">
                        {r.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Frictions */}
                  {r.frictions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Things to consider
                      </h4>
                      <ul className="space-y-1">
                        {r.frictions.map((s, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-amber-500 mt-1">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Assumptions */}
                  {r.assumptions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Assumptions made</h4>
                      <ul className="space-y-1">
                        {r.assumptions.map((s, i) => (
                          <li key={i} className="text-sm text-slate-500 italic">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-500 hover:text-red-500 hover:border-red-200"
                  onClick={() => onDismiss?.(r.user_id)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Not Interested
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = createPageUrl('Profile') + `?id=${r.user_id}`;
                    }}
                  >
                    <User className="w-4 h-4 mr-1" />
                    View Profile
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      isSaved ? "text-violet-600 border-violet-300 bg-violet-50" : "text-slate-600"
                    )}
                    onClick={() => isSaved ? onUnsave?.(r.user_id) : onSave?.(r.user_id)}
                  >
                    {isSaved ? (
                      <><BookmarkCheck className="w-4 h-4 mr-1" /> Saved</>
                    ) : (
                      <><Bookmark className="w-4 h-4 mr-1" /> Save</>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                    onClick={() => {
                      document.dispatchEvent(new CustomEvent('openFloatingChat', {
                        detail: {
                          recipientId: r.user_id,
                          recipientName: r.display_name,
                          recipientAvatar: r.avatar
                        }
                      }));
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}