import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Star, ShieldCheck } from "lucide-react";
import MiniProfile from '@/components/profile/MiniProfile';

const RISK_GRADE_COLORS = {
  A: 'text-emerald-600',
  B: 'text-green-600',
  C: 'text-amber-600',
  D: 'text-orange-600',
  F: 'text-rose-600'
};

const STATUS_STYLES = {
  approved: "bg-emerald-100 text-emerald-700",
  pending_review: "bg-amber-100 text-amber-700",
  rejected: "bg-rose-100 text-rose-700",
  flagged: "bg-red-100 text-red-700",
  draft: "bg-slate-100 text-slate-700"
};

export default function ProjectMiniCard({ project, onClick }) {
  const status = project.status || "pending_review";
  const budget = typeof project.budget === "number" ? project.budget : Number(project.budget || 0);
  const h = project.humanitarian_score;
  const i = project.industrial_value;
  const tags = Array.isArray(project.impact_tags) ? project.impact_tags : [];
  const ownerId = project.owner_id || project.creator_id || project.claimed_by;

  const { data: reviews = [] } = useQuery({
    queryKey: ['projectReviewsMini', project.id],
    queryFn: () => base44.entities.Review.filter({ project_id: project.id }, '-created_date', 50),
    enabled: !!project.id,
    staleTime: 300000,
  });
  const reviewAvg = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <button onClick={onClick} className="text-left w-full">
      <Card className="hover:shadow-md transition-shadow border-slate-200">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold text-slate-900 line-clamp-1">
              {project.title || "Untitled Project"}
            </CardTitle>
            <Badge className={STATUS_STYLES[status] || STATUS_STYLES.pending_review}>
              {status.replace(/_/g, " ")}
            </Badge>
          </div>
          {project.description &&
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{project.description}</p>
          }
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {ownerId && (
            <div className="-mt-2 mb-1">
              <MiniProfile userId={ownerId} size={24} />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="bg-slate-50">Funding: ${budget.toLocaleString()}</Badge>
            {typeof h === "number" &&
            <Badge variant="outline" className="bg-slate-50">Humanitarian: {h}</Badge>
            }
            {typeof i === "number" &&
            <Badge variant="outline" className="bg-violet-100 text-foreground px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">Industrial: {i}</Badge>
            }
            {project.negative_environmental_impact &&
            <Badge className="bg-rose-100 text-rose-700 inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Env. Risk
              </Badge>
            }
          </div>
          {tags.length > 0 &&
          <div className="flex flex-wrap gap-1.5 mt-1">
              {tags.slice(0, 4).map((t, idx) =>
            <span key={idx} className="px-2 py-0.5 text-[11px] rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                  {t}
                </span>
            )}
              {tags.length > 4 &&
            <span className="px-2 py-0.5 text-[11px] rounded-full bg-slate-50 text-slate-600 border">
                  +{tags.length - 4} more
                </span>
            }
            </div>
          }

          {/* Ownership / Claim controls */}
          {project.owner_id && project.claim_status === 'approved' ? (
            <div className="pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium cursor-default">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Owned
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Owner: {project.owner_name || project.claimed_by || project.owner_id}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (!project.claim_status || project.claim_status === 'unclaimed') ? (
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async (e) => {
                  e.stopPropagation();
                  const me = await base44.auth.me();
                  await base44.entities.Project.update(project.id, {
                    claim_status: 'pending',
                    claimed_by: me.email,
                    claimed_at: new Date().toISOString()
                  });
                  window.location.reload();
                }}
              >
                Claim Project
              </Button>
            </div>
          ) : project.claim_status === 'pending' ? (
            <div className="pt-2 text-xs text-slate-500">Claim pending approval</div>
          ) : project.claim_status === 'rejected' ? (
            <div className="pt-2 text-xs text-rose-500">Claim rejected</div>
          ) : null}

          {/* Scores in bottom right */}
          <div className="flex justify-end items-center gap-2 pt-2 mt-auto">
            {reviewAvg && (
              <>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-amber-600">{reviewAvg}</span>
                <span className="text-xs text-slate-400">({reviews.length})</span>
              </>
            )}
            <span className="text-xs text-slate-500">Score:</span>
            <span className="text-sm font-bold text-indigo-600">
              {project.final_score ? project.final_score.toFixed(0) : 'N/A'}
            </span>
            <span className="text-xs text-slate-500">Grade:</span>
            <span className={`text-sm font-bold ${project.phase3_risk_grade ? RISK_GRADE_COLORS[project.phase3_risk_grade] : 'text-slate-400'}`}>
              {project.phase3_risk_grade || 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>
    </button>);

}