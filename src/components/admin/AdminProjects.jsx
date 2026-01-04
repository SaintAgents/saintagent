import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, CheckCircle, XCircle, AlertTriangle, Clock, Eye } from "lucide-react";
import ProjectCSVImport from "@/components/projects/ProjectCSVImport";
import LegacySAImport from "@/components/admin/LegacySAImport";
import FloatingPanel from "@/components/hud/FloatingPanel";
import ProjectDetailCard from "@/components/projects/ProjectDetailCard";

export default function AdminProjects() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [bulkEvaluating, setBulkEvaluating] = useState(false);
  const [evaluatingIds, setEvaluatingIds] = useState(new Set());

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date", 200)
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Project.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] })
  });

  const runSingleEvaluation = async (projectId) => {
    setEvaluatingIds(prev => new Set([...prev, projectId]));
    try {
      await base44.functions.invoke('evaluateProject', { project_id: projectId });
      qc.invalidateQueries({ queryKey: ["projects"] });
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setEvaluatingIds(prev => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  };

  const runBulkEvaluation = async () => {
    const pending = projects.filter(p => p.status === 'pending_review' && !p.ai_evaluated_at);
    if (pending.length === 0) return;
    
    setBulkEvaluating(true);
    for (const project of pending.slice(0, 10)) { // Limit to 10 at a time
      await runSingleEvaluation(project.id);
    }
    setBulkEvaluating(false);
  };

  const pendingCount = projects.filter(p => p.status === 'pending_review').length;
  const unevaluatedCount = projects.filter(p => !p.ai_evaluated_at && p.status === 'pending_review').length;

  const filtered = (projects || []).filter((p) => {
    const text = (p.title + " " + (p.description || "")).toLowerCase();
    const textOk = !q || text.includes(q.toLowerCase());
    const statusOk = status === "all" || p.status === status;
    return textOk && statusOk;
  });

  const total = projects.length;
  const approved = projects.filter((p) => p.status === "approved").length;
  const pending = projects.filter((p) => p.status === "pending_review").length;
  const submitted = projects.filter((p) => ["draft", "pending_review"].includes(p.status)).length;

  return (
    <div className="space-y-6">
      {/* Legacy SA Import */}
      <LegacySAImport />

      {/* Bulk Import */}
      <ProjectCSVImport />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border"><div className="text-xs text-slate-500">Total</div><div className="text-xl font-bold">{total}</div></div>
        <div className="p-3 rounded-xl bg-emerald-50 border"><div className="text-xs text-emerald-700">Approved</div><div className="text-xl font-bold text-emerald-700">{approved}</div></div>
        <div className="p-3 rounded-xl bg-amber-50 border"><div className="text-xs text-amber-700">Pending</div><div className="text-xl font-bold text-amber-700">{pending}</div></div>
        <div className="p-3 rounded-xl bg-violet-50 border"><div className="text-xs text-violet-700">Submitted</div><div className="text-xl font-bold text-violet-700">{submitted}</div></div>
      </div>

      {/* AI Evaluation Controls */}
      <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-violet-900 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Evaluation Engine
            </h3>
            <p className="text-sm text-violet-700 mt-1">
              {unevaluatedCount} projects awaiting evaluation
            </p>
          </div>
          <Button 
            onClick={runBulkEvaluation}
            disabled={bulkEvaluating || unevaluatedCount === 0}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {bulkEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Bulk Evaluate ({Math.min(unevaluatedCount, 10)})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects..." />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="incubate">Incubating</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="rfi_pending">RFI Pending</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Status</th>
              <th className="text-center p-3">Score</th>
              <th className="text-center p-3">Risk</th>
              <th className="text-center p-3">Tier</th>
              <th className="text-right p-3">Budget</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="p-6 text-center text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-slate-400">No projects found</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id} className="border-t hover:bg-slate-50">
                <td className="p-3">
                  <div className="font-medium text-slate-900">{p.title}</div>
                  <div className="text-xs text-slate-500">
                    {p.lane_code && <span className="capitalize">{p.lane_code.replace(/_/g, ' ')}</span>}
                    {p.stage && <span> • {p.stage}</span>}
                  </div>
                </td>
                <td className="p-3">
                  <Select value={p.status} onValueChange={(v) => updateStatus.mutate({ id: p.id, status: v })}>
                    <SelectTrigger className="h-8 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="incubate">Incubating</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="rfi_pending">RFI Pending</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3 text-center">
                  {p.final_score !== undefined && p.final_score !== null ? (
                    <span className={`font-bold ${
                      p.final_score >= 80 ? 'text-emerald-600' :
                      p.final_score >= 60 ? 'text-amber-600' :
                      p.final_score >= 40 ? 'text-blue-600' : 'text-rose-600'
                    }`}>
                      {p.final_score.toFixed(0)}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {p.phase3_risk_grade ? (
                    <Badge className={`
                      ${p.phase3_risk_grade === 'A' ? 'bg-emerald-100 text-emerald-700' : ''}
                      ${p.phase3_risk_grade === 'B' ? 'bg-green-100 text-green-700' : ''}
                      ${p.phase3_risk_grade === 'C' ? 'bg-amber-100 text-amber-700' : ''}
                      ${p.phase3_risk_grade === 'D' ? 'bg-orange-100 text-orange-700' : ''}
                      ${p.phase3_risk_grade === 'F' ? 'bg-rose-100 text-rose-700' : ''}
                    `}>
                      {p.phase3_risk_grade}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {p.decision_tier ? (
                    <Badge className={`text-xs ${
                      p.decision_tier === 'approve_fund' ? 'bg-emerald-100 text-emerald-700' :
                      p.decision_tier === 'incubate_derisk' ? 'bg-amber-100 text-amber-700' :
                      p.decision_tier === 'review_reevaluate' ? 'bg-blue-100 text-blue-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {p.decision_tier === 'approve_fund' && 'Approve'}
                      {p.decision_tier === 'incubate_derisk' && 'Incubate'}
                      {p.decision_tier === 'review_reevaluate' && 'Review'}
                      {p.decision_tier === 'decline' && 'Decline'}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="p-3 text-right text-slate-600">${(p.budget || 0).toLocaleString()}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedProject(p)}
                      className="gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runSingleEvaluation(p.id)}
                      disabled={evaluatingIds.has(p.id)}
                      className="gap-1"
                    >
                      {evaluatingIds.has(p.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Brain className="w-4 h-4" />
                      )}
                      {p.ai_evaluated_at ? 'Re-eval' : 'Eval'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Project Detail Panel */}
      {selectedProject && (
        <FloatingPanel 
          title={selectedProject.title} 
          onClose={() => setSelectedProject(null)}
          className="max-w-3xl"
        >
          <ProjectDetailCard project={selectedProject} />
        </FloatingPanel>
      )}
    </div>
  );
}