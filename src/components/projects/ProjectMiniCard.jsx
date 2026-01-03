import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, AlertTriangle } from "lucide-react";

const STATUS_STYLES = {
  approved: "bg-emerald-100 text-emerald-700",
  pending_review: "bg-amber-100 text-amber-700",
  rejected: "bg-rose-100 text-rose-700",
  flagged: "bg-red-100 text-red-700",
  draft: "bg-slate-100 text-slate-700",
};

export default function ProjectMiniCard({ project, onClick }) {
  const status = project.status || "pending_review";
  const budget = typeof project.budget === "number" ? project.budget : Number(project.budget || 0);
  const h = project.humanitarian_score;
  const i = project.industrial_value;
  const tags = Array.isArray(project.impact_tags) ? project.impact_tags : [];

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
          {project.description && (
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{project.description}</p>
          )}
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="bg-slate-50">Funding: ${budget.toLocaleString()}</Badge>
            {typeof h === "number" && (
              <Badge variant="outline" className="bg-slate-50">Humanitarian: {h}</Badge>
            )}
            {typeof i === "number" && (
              <Badge variant="outline" className="bg-slate-50">Industrial: {i}</Badge>
            )}
            {project.negative_environmental_impact && (
              <Badge className="bg-rose-100 text-rose-700 inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Env. Risk
              </Badge>
            )}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {tags.slice(0, 4).map((t, idx) => (
                <span key={idx} className="px-2 py-0.5 text-[11px] rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                  {t}
                </span>
              ))}
              {tags.length > 4 && (
                <span className="px-2 py-0.5 text-[11px] rounded-full bg-slate-50 text-slate-600 border">
                  +{tags.length - 4} more
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </button>
  );
}