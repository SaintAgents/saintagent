import React from "react";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES = {
  approved: "bg-emerald-100 text-emerald-700",
  pending_review: "bg-amber-100 text-amber-700",
  rejected: "bg-rose-100 text-rose-700",
  flagged: "bg-red-100 text-red-700",
  draft: "bg-slate-100 text-slate-700",
};

export default function ProjectDetailCard({ project }) {
  if (!project) return null;
  const status = project.status || "pending_review";
  const budget = typeof project.budget === "number" ? project.budget : Number(project.budget || 0);
  const tags = Array.isArray(project.impact_tags) ? project.impact_tags : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
          <p className="text-sm text-slate-600 mt-1">{project.description}</p>
        </div>
        <Badge className={STATUS_STYLES[status] || STATUS_STYLES.pending_review}>
          {status.replace(/_/g, " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-slate-50 border">
          <div className="text-xs text-slate-500">Funding Required</div>
          <div className="text-base font-semibold text-slate-900">${budget.toLocaleString()}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border">
          <div className="text-xs text-slate-500">Humanitarian Score</div>
          <div className="text-base font-semibold text-slate-900">{project.humanitarian_score ?? "-"}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border">
          <div className="text-xs text-slate-500">Industrial Value</div>
          <div className="text-base font-semibold text-slate-900">{project.industrial_value ?? "-"}</div>
        </div>
        {project.negative_environmental_impact && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 col-span-full">
            <div className="text-xs text-rose-700 font-medium">Environmental Risk</div>
            <div className="text-sm text-rose-800">This project may have negative environmental impact.</div>
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 mb-1">Impact Tags</div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 text-[11px] rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {project.strategic_intent && (
        <div>
          <div className="text-xs text-slate-500 mb-1">Strategic Intent</div>
          <div className="text-sm text-slate-800">{project.strategic_intent}</div>
        </div>
      )}
    </div>
  );
}