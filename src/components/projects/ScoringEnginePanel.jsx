import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, AlertTriangle, CheckCircle, XCircle, FileText, 
  Loader2, Shield, AlertCircle, ChevronDown, ChevronUp,
  Copy, Leaf, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EthicalFloorIndicator from './EthicalFloorIndicator';
import RFIListPanel from './RFIListPanel';

export default function ScoringEnginePanel({ project, onUpdate }) {
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();

  const scoreMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('autoScoringEngine', { project_id: project.id });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects_all'] });
      queryClient.invalidateQueries({ queryKey: ['evaluationProject', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projectEvaluations', project.id] });
      queryClient.invalidateQueries({ queryKey: ['evaluationAuditLogs', project.id] });
      onUpdate?.();
    }
  });

  const ethicalFloorViolations = project.metadata?.ethical_floor_violations || [];
  const rfiItems = project.phase1_rfi_items || [];
  const hasViolations = ethicalFloorViolations.length > 0;
  const hasRFI = rfiItems.length > 0;
  const harmGatesTriggered = project.phase3_harm_gates 
    ? Object.entries(project.phase3_harm_gates).filter(([_, d]) => d?.triggered).length 
    : 0;

  return (
    <div className="space-y-4">
      {/* Run Scoring Engine */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={() => scoreMutation.mutate()}
          disabled={scoreMutation.isPending}
          className="bg-violet-600 hover:bg-violet-700 gap-2"
        >
          {scoreMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Running Scoring Engine...</>
          ) : (
            <><Zap className="w-4 h-4" /> Run Auto-Scoring Engine</>
          )}
        </Button>
        {project.metadata?.scoring_engine_version && (
          <Badge variant="outline" className="text-xs">
            Engine {project.metadata.scoring_engine_version}
          </Badge>
        )}
        {project.metadata?.last_auto_score_at && (
          <span className="text-xs text-slate-500">
            Last scored: {new Date(project.metadata.last_auto_score_at).toLocaleString()}
          </span>
        )}
      </div>

      {scoreMutation.isError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          Scoring failed: {scoreMutation.error?.message || 'Unknown error'}
        </div>
      )}

      {scoreMutation.isSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          Scoring complete — Score: {scoreMutation.data?.final_score}, Tier: {scoreMutation.data?.decision_tier?.replace(/_/g, ' ')}, 
          RFIs generated: {scoreMutation.data?.rfi_items_generated || 0}
        </div>
      )}

      {/* Ethical Floor Violations */}
      {hasViolations && (
        <EthicalFloorIndicator violations={ethicalFloorViolations} />
      )}

      {/* Harm Gates Summary */}
      {harmGatesTriggered > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-rose-600" />
            <span className="font-bold text-rose-800">
              {harmGatesTriggered} Harm Gate{harmGatesTriggered > 1 ? 's' : ''} Triggered
            </span>
          </div>
          <div className="space-y-1">
            {Object.entries(project.phase3_harm_gates || {}).filter(([_, d]) => d?.triggered).map(([gate, data]) => (
              <div key={gate} className="flex items-start gap-2 text-sm text-rose-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium capitalize">{gate.replace(/_/g, ' ')}</span>
                  {data.rationale && <span className="text-rose-600"> — {data.rationale}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RFI List */}
      {hasRFI && (
        <RFIListPanel rfiItems={rfiItems} projectTitle={project.title} />
      )}

      {/* Quick Score Summary */}
      {project.phase2_scores && (
        <div>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-2"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showDetails ? 'Hide' : 'Show'} Detailed Subcriteria Scores
          </button>
          {showDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(project.phase2_scores).map(([key, data]) => {
                if (!data?.score) return null;
                const isBelowFloor = (key === 'planetary_wellbeing' && data.score < 3) || 
                                     (key === 'human_wellbeing' && data.score < 3);
                return (
                  <div key={key} className={cn(
                    "p-3 rounded-lg border",
                    isBelowFloor ? "bg-rose-50 border-rose-300" : "bg-white border-slate-200"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize flex items-center gap-1">
                        {isBelowFloor && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className={cn(
                        "text-sm font-bold",
                        data.score >= 7 ? "text-emerald-600" : data.score >= 4 ? "text-amber-600" : "text-rose-600"
                      )}>
                        {data.score}/10
                      </span>
                    </div>
                    <Progress value={data.score * 10} className="h-1.5" />
                    {data.rationale && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{data.rationale}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}