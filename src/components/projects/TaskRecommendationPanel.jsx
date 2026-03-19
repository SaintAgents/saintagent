import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, Zap, Clock, BarChart3, Tag, ChevronDown, ChevronUp, Loader2, Brain, CheckCircle } from 'lucide-react';

function ScoreBar({ label, score, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-3 h-3 ${color}`} />
      <span className="text-[10px] text-slate-500 w-14">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${
          score >= 70 ? 'bg-emerald-400' : score >= 40 ? 'bg-amber-400' : 'bg-red-400'
        }`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[10px] font-semibold w-6 text-right">{score}</span>
    </div>
  );
}

function RecommendationCard({ rec, rank, onSelect, isSelected }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border rounded-lg p-3 transition-all cursor-pointer ${
        isSelected ? 'border-violet-400 bg-violet-50/50 ring-1 ring-violet-300' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
      }`}
      onClick={() => onSelect(rec.member_id)}
    >
      <div className="flex items-center gap-3">
        {/* Rank badge */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
          rank === 1 ? 'bg-amber-100 text-amber-700' : rank === 2 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'
        }`}>
          {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : rank}
        </div>

        {/* Avatar + name */}
        <Avatar className="w-8 h-8">
          <AvatarImage src={rec.avatar_url} />
          <AvatarFallback className="text-xs bg-slate-100">{rec.display_name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{rec.display_name}</span>
            {rank === 1 && <Badge className="bg-violet-100 text-violet-700 text-[9px] px-1.5">Best Match</Badge>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-slate-400">{rec.active_task_count} active · {rec.completed_count} completed</span>
          </div>
        </div>

        {/* Composite score */}
        <div className="text-right shrink-0">
          <div className={`text-lg font-bold ${
            rec.composite_score >= 70 ? 'text-emerald-600' : rec.composite_score >= 40 ? 'text-amber-600' : 'text-red-500'
          }`}>
            {rec.composite_score}
          </div>
          <div className="text-[9px] text-slate-400 uppercase">Score</div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="p-1 hover:bg-slate-100 rounded"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <ScoreBar label="Speed" score={rec.speed_score} icon={Zap} color="text-amber-500" />
          <ScoreBar label="Capacity" score={rec.capacity_score} icon={BarChart3} color="text-blue-500" />
          <ScoreBar label="Skills" score={rec.skill_score} icon={Tag} color="text-violet-500" />
          {rec.on_time_rate !== null && rec.on_time_rate !== undefined && (
            <ScoreBar label="On-Time" score={rec.on_time_rate} icon={CheckCircle} color="text-emerald-500" />
          )}

          {rec.matched_skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {rec.matched_skills.map((s, i) => (
                <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 gap-1">
                  <Tag className="w-2.5 h-2.5" />{s.name}
                  <span className="text-slate-400">L{s.proficiency}</span>
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-0.5">
            {rec.reasons.map((r, i) => (
              <p key={i} className="text-[10px] text-slate-500 flex items-start gap-1">
                <span className="text-slate-300 mt-0.5">•</span>{r}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TaskRecommendationPanel({ projectId, taskTitle, taskDescription, taskPriority, estimatedHours, skillTags, selectedAssignee, onSelectAssignee }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['taskRecommendations', projectId, taskTitle, taskDescription],
    queryFn: async () => {
      const res = await base44.functions.invoke('recommendTaskAssignee', {
        project_id: projectId,
        task_title: taskTitle,
        task_description: taskDescription,
        task_priority: taskPriority,
        estimated_hours: estimatedHours,
        skill_tags: skillTags || [],
      });
      return res.data;
    },
    enabled: !!projectId && (taskTitle?.length > 2 || false),
    staleTime: 30000,
  });

  const recommendations = data?.recommendations || [];
  const aiInsight = data?.ai_insight;

  if (!projectId) return null;

  return (
    <div className="border border-slate-200 rounded-lg bg-slate-50/50">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200">
        <Brain className="w-4 h-4 text-violet-500" />
        <span className="text-xs font-semibold text-slate-700">AI Recommendations</span>
        <span className="text-[10px] text-slate-400 ml-auto">Speed · Capacity · Skills</span>
      </div>

      <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing team members...
          </div>
        ) : error ? (
          <p className="text-xs text-red-400 text-center py-4">Unable to load recommendations</p>
        ) : recommendations.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Enter a task title to get recommendations</p>
        ) : (
          <>
            {aiInsight?.top_pick_insight && (
              <div className="p-2 rounded-lg bg-violet-50 border border-violet-200 mb-2">
                <div className="flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-violet-700">{aiInsight.top_pick_insight}</p>
                </div>
                {aiInsight.overload_warning && (
                  <div className="flex items-start gap-1.5 mt-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-amber-700">{aiInsight.overload_warning}</p>
                  </div>
                )}
              </div>
            )}
            {recommendations.map((rec, i) => (
              <RecommendationCard
                key={rec.member_id}
                rec={rec}
                rank={i + 1}
                isSelected={selectedAssignee === rec.member_id}
                onSelect={onSelectAssignee}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}