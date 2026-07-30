import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ClipboardCheck, FileText, AlertTriangle, CheckCircle, ChevronRight,
  Clock, Loader2, Save, Send, ArrowLeft, Eye, History, Brain,
  Flag, AlertCircle, BarChart3, Plus, X, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReviewChecklist from '@/components/review/ReviewChecklist';
import SectionScorer from '@/components/review/SectionScorer';
import AIComparisonPanel from '@/components/review/AIComparisonPanel';
import PreviousReviewsPanel from '@/components/review/PreviousReviewsPanel';
import { REVIEW_SECTIONS, RECOMMENDATION_OPTIONS, calculateWeightedScore, CHECKLIST_ITEMS } from '@/components/review/reviewScoringConfig';

const STAGE_STEPS = [
  { id: 'ethics_check', label: 'Ethics', icon: Shield },
  { id: 'scoring', label: 'Scoring', icon: BarChart3 },
  { id: 'risk_assessment', label: 'Risk', icon: AlertTriangle },
  { id: 'final_recommendation', label: 'Final', icon: CheckCircle },
];

export default function ReviewerWorkflow() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('id');

  // If no assignment ID, show the reviewer's queue
  const { data: myAssignments = [], isLoading: loadingQueue } = useQuery({
    queryKey: ['myReviewAssignments', user?.email],
    queryFn: () => base44.entities.ReviewAssignment.filter(
      { reviewer_id: user.email, status: { $in: ['pending', 'in_progress', 'checklist_complete', 'scoring_complete'] } },
      '-created_date', 50
    ),
    enabled: !!user?.email && !assignmentId,
  });

  const { data: assignment, isLoading: loadingAssignment } = useQuery({
    queryKey: ['reviewAssignment', assignmentId],
    queryFn: async () => {
      const results = await base44.entities.ReviewAssignment.filter({ id: assignmentId });
      return results[0];
    },
    enabled: !!assignmentId,
  });

  const { data: project } = useQuery({
    queryKey: ['reviewProject', assignment?.project_id],
    queryFn: async () => {
      const results = await base44.entities.Project.filter({ id: assignment.project_id });
      return results[0];
    },
    enabled: !!assignment?.project_id,
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ['reviewProjectEvals', assignment?.project_id],
    queryFn: () => base44.entities.ProjectEvaluation.filter({ project_id: assignment.project_id }, '-created_date'),
    enabled: !!assignment?.project_id,
  });

  const { data: previousReviews = [] } = useQuery({
    queryKey: ['reviewPrevious', assignment?.project_id],
    queryFn: () => base44.entities.ReviewAssignment.filter(
      { project_id: assignment.project_id, status: 'submitted' }, '-created_date', 20
    ),
    enabled: !!assignment?.project_id,
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['reviewAudit', assignment?.project_id],
    queryFn: () => base44.entities.EvaluationAuditLog.filter({ project_id: assignment.project_id }, '-created_date', 50).catch(() => []),
    enabled: !!assignment?.project_id,
  });

  // Local state for the review form
  const [checklist, setChecklist] = useState({});
  const [sectionScores, setSectionScores] = useState({});
  const [sectionComments, setSectionComments] = useState({});
  const [overallComment, setOverallComment] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [flags, setFlags] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [requiredRevisions, setRequiredRevisions] = useState([]);
  const [criticalIssues, setCriticalIssues] = useState([]);
  const [deviationJustification, setDeviationJustification] = useState('');
  const [outlierJustification, setOutlierJustification] = useState('');
  const [newFlag, setNewFlag] = useState('');
  const [newConcern, setNewConcern] = useState('');
  const [newRevision, setNewRevision] = useState('');
  const [newCritical, setNewCritical] = useState('');
  const [activeTab, setActiveTab] = useState('checklist');
  const [reviewStage, setReviewStage] = useState('ethics_check');

  // Load existing data from assignment
  useEffect(() => {
    if (!assignment) return;
    setChecklist(assignment.checklist || {});
    setSectionScores(assignment.section_scores || {});
    setSectionComments(assignment.section_comments || {});
    setOverallComment(assignment.overall_comment || '');
    setRecommendation(assignment.recommendation || '');
    setFlags(assignment.flags || []);
    setConcerns(assignment.concerns || []);
    setRequiredRevisions(assignment.required_revisions || []);
    setCriticalIssues(assignment.critical_issues || []);
    setDeviationJustification(assignment.deviation_justification || '');
    setOutlierJustification(assignment.outlier_justification || '');
    setReviewStage(assignment.review_stage || 'ethics_check');
  }, [assignment?.id]);

  const reviewerWeightedScore = calculateWeightedScore(sectionScores);
  const aiScore = project?.final_score;
  const scoreDeviation = aiScore != null && reviewerWeightedScore > 0 ? Math.abs(reviewerWeightedScore - aiScore) : 0;
  const needsDeviationJustification = scoreDeviation > 10;
  const hasOutlierScores = Object.values(sectionScores).some(s => s <= 2 || s >= 9);

  const checklistComplete = CHECKLIST_ITEMS.every(i => checklist[i.id]);
  const scoringComplete = REVIEW_SECTIONS.every(s => sectionScores[s.id] > 0);
  const canSubmit = checklistComplete && scoringComplete && recommendation && overallComment.trim().length >= 20
    && (!needsDeviationJustification || deviationJustification.trim().length >= 10)
    && (!hasOutlierScores || outlierJustification.trim().length >= 10);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.ReviewAssignment.update(assignmentId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviewAssignment', assignmentId] }),
  });

  const handleSave = () => {
    const checklistDone = CHECKLIST_ITEMS.every(i => checklist[i.id]);
    const scoringDone = REVIEW_SECTIONS.every(s => sectionScores[s.id] > 0);
    let status = 'in_progress';
    if (checklistDone && scoringDone) status = 'scoring_complete';
    else if (checklistDone) status = 'checklist_complete';

    saveMutation.mutate({
      checklist,
      section_scores: sectionScores,
      section_comments: sectionComments,
      overall_comment: overallComment,
      recommendation: recommendation || undefined,
      flags,
      concerns,
      required_revisions: requiredRevisions,
      critical_issues: criticalIssues,
      reviewer_weighted_score: reviewerWeightedScore,
      ai_score_at_review: aiScore,
      score_deviation: scoreDeviation,
      deviation_justification: deviationJustification,
      outlier_justification: outlierJustification,
      review_stage: reviewStage,
      status,
      started_at: assignment?.started_at || new Date().toISOString(),
    });
  };

  const handleSubmit = () => {
    saveMutation.mutate({
      checklist,
      section_scores: sectionScores,
      section_comments: sectionComments,
      overall_comment: overallComment,
      recommendation,
      flags,
      concerns,
      required_revisions: requiredRevisions,
      critical_issues: criticalIssues,
      reviewer_weighted_score: reviewerWeightedScore,
      ai_score_at_review: aiScore,
      score_deviation: scoreDeviation,
      deviation_justification: deviationJustification,
      outlier_justification: outlierJustification,
      review_stage: 'complete',
      status: 'submitted',
      started_at: assignment?.started_at || new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });
    // Log audit
    base44.entities.EvaluationAuditLog.create({
      project_id: assignment.project_id,
      action: 'human_reviewed',
      actor_id: user.email,
      actor_type: 'human',
      reason: `Review submitted. Score: ${reviewerWeightedScore}. Recommendation: ${recommendation}`,
      metadata: { assignment_id: assignmentId, reviewer_score: reviewerWeightedScore, ai_score: aiScore, deviation: scoreDeviation },
    }).catch(() => {});
  };

  // Queue view when no assignment selected
  if (!assignmentId) {
    return <ReviewerQueue assignments={myAssignments} loading={loadingQueue} />;
  }

  if (loadingAssignment || !assignment) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const latestAIEval = evaluations.find(e => e.evaluation_type === 'ai_single' || e.evaluation_type === 'ai_bulk');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{project?.title || 'Loading...'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{assignment.review_type}</Badge>
              {assignment.is_resubmission && (
                <Badge className="bg-blue-100 text-blue-700 text-xs">Resubmission #{assignment.resubmission_number}</Badge>
              )}
              <Badge className={cn("text-xs",
                assignment.priority === 'urgent' ? "bg-rose-100 text-rose-700" :
                assignment.priority === 'high' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
              )}>{assignment.priority}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Save Draft
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit || saveMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="w-4 h-4 mr-1" /> Submit Review
          </Button>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="flex items-center gap-1 p-2 bg-slate-50 rounded-lg overflow-x-auto">
        {STAGE_STEPS.map((step, i) => {
          const StepIcon = step.icon;
          const stageIndex = STAGE_STEPS.findIndex(s => s.id === reviewStage);
          const isActive = step.id === reviewStage;
          const isDone = i < stageIndex;
          return (
            <React.Fragment key={step.id}>
              {i > 0 && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
              <button
                onClick={() => setReviewStage(step.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                  isActive ? "bg-violet-600 text-white" :
                  isDone ? "bg-emerald-100 text-emerald-700" : "text-slate-500 hover:bg-slate-200"
                )}
              >
                {isDone ? <CheckCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                {step.label}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Score summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-xs text-slate-500">Your Score</div>
          <div className="text-2xl font-bold text-blue-700">{reviewerWeightedScore || '—'}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-slate-500">AI Score</div>
          <div className="text-2xl font-bold text-violet-700">{aiScore || '—'}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-slate-500">Deviation</div>
          <div className={cn("text-2xl font-bold", scoreDeviation > 10 ? "text-amber-600" : "text-emerald-600")}>
            {reviewerWeightedScore > 0 ? scoreDeviation : '—'}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-slate-500">Checklist</div>
          <div className="text-2xl font-bold text-slate-700">
            {CHECKLIST_ITEMS.filter(i => checklist[i.id]).length}/{CHECKLIST_ITEMS.length}
          </div>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Review Form */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start flex-wrap">
              <TabsTrigger value="checklist"><ClipboardCheck className="w-4 h-4 mr-1" />Checklist</TabsTrigger>
              <TabsTrigger value="scoring"><BarChart3 className="w-4 h-4 mr-1" />Scoring</TabsTrigger>
              <TabsTrigger value="flags"><Flag className="w-4 h-4 mr-1" />Flags & Issues</TabsTrigger>
              <TabsTrigger value="recommendation"><CheckCircle className="w-4 h-4 mr-1" />Final</TabsTrigger>
            </TabsList>

            <TabsContent value="checklist" className="mt-4">
              <ReviewChecklist checklist={checklist} onChange={setChecklist} />
            </TabsContent>

            <TabsContent value="scoring" className="mt-4 space-y-3">
              {REVIEW_SECTIONS.map(section => (
                <SectionScorer
                  key={section.id}
                  section={section}
                  score={sectionScores[section.id]}
                  comment={sectionComments[section.id]}
                  aiScore={latestAIEval?.phase2_scores?.[section.id]?.score}
                  onChange={({ score, comment }) => {
                    setSectionScores(prev => ({ ...prev, [section.id]: score }));
                    setSectionComments(prev => ({ ...prev, [section.id]: comment }));
                  }}
                />
              ))}
            </TabsContent>

            <TabsContent value="flags" className="mt-4 space-y-4">
              <ListEditor label="Flags" icon={Flag} color="amber" items={flags} setItems={setFlags} newItem={newFlag} setNewItem={setNewFlag} placeholder="Describe the flag..." />
              <ListEditor label="Concerns" icon={AlertCircle} color="orange" items={concerns} setItems={setConcerns} newItem={newConcern} setNewItem={setNewConcern} placeholder="Describe the concern..." />
              <ListEditor label="Required Revisions" icon={FileText} color="blue" items={requiredRevisions} setItems={setRequiredRevisions} newItem={newRevision} setNewItem={setNewRevision} placeholder="Describe what needs revision..." />
              <ListEditor label="Critical Issues" icon={AlertTriangle} color="rose" items={criticalIssues} setItems={setCriticalIssues} newItem={newCritical} setNewItem={setNewCritical} placeholder="Describe the critical issue..." />
            </TabsContent>

            <TabsContent value="recommendation" className="mt-4 space-y-4">
              {/* Recommendation */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Recommendation</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {RECOMMENDATION_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setRecommendation(opt.value)}
                        className={cn(
                          "p-3 rounded-lg border-2 text-left transition-all",
                          recommendation === opt.value
                            ? `border-${opt.color}-400 bg-${opt.color}-50`
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="font-medium text-sm">{opt.label}</div>
                        <div className="text-xs text-slate-500">Score {opt.scoreRange}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Overall Comment */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Overall Comment (required, min 20 chars)</CardTitle></CardHeader>
                <CardContent>
                  <Textarea
                    value={overallComment}
                    onChange={(e) => setOverallComment(e.target.value)}
                    placeholder="Provide your overall assessment of this project..."
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-slate-400 mt-1">{overallComment.length} characters</p>
                </CardContent>
              </Card>

              {/* Deviation Justification */}
              {needsDeviationJustification && (
                <Card className="border-amber-300 bg-amber-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="w-4 h-4" />
                      Score Deviation Justification Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-amber-700 mb-2">
                      Your score ({reviewerWeightedScore}) differs from AI ({aiScore}) by {scoreDeviation} points. Please explain.
                    </p>
                    <Textarea
                      value={deviationJustification}
                      onChange={(e) => setDeviationJustification(e.target.value)}
                      placeholder="Explain why your score differs significantly from the AI evaluation..."
                      className="min-h-[80px]"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Outlier Justification */}
              {hasOutlierScores && (
                <Card className="border-amber-300 bg-amber-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="w-4 h-4" />
                      Extreme Score Justification Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-amber-700 mb-2">
                      You have scores of 1-2 or 9-10. Please justify extreme ratings.
                    </p>
                    <Textarea
                      value={outlierJustification}
                      onChange={(e) => setOutlierJustification(e.target.value)}
                      placeholder="Justify your extreme score(s)..."
                      className="min-h-[80px]"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Submit readiness */}
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium text-sm mb-2">Submission Readiness</h4>
                  <div className="space-y-1 text-sm">
                    <ReadinessItem ok={checklistComplete} label="Checklist complete" />
                    <ReadinessItem ok={scoringComplete} label="All sections scored" />
                    <ReadinessItem ok={!!recommendation} label="Recommendation selected" />
                    <ReadinessItem ok={overallComment.trim().length >= 20} label="Overall comment (min 20 chars)" />
                    {needsDeviationJustification && <ReadinessItem ok={deviationJustification.trim().length >= 10} label="Deviation justification" />}
                    {hasOutlierScores && <ReadinessItem ok={outlierJustification.trim().length >= 10} label="Outlier score justification" />}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Context panel */}
        <div className="space-y-4">
          {/* Project summary */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4" />Project Info</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div><span className="text-slate-500">Stage:</span> <Badge variant="outline" className="text-xs ml-1">{project?.stage}</Badge></div>
              <div><span className="text-slate-500">Sector:</span> <span className="ml-1">{project?.sector}</span></div>
              <div><span className="text-slate-500">Budget:</span> <span className="ml-1">${(project?.budget || project?.amount_requested || 0).toLocaleString()}</span></div>
              <div><span className="text-slate-500">Owner:</span> <span className="ml-1">{project?.owner_name || project?.contact_name}</span></div>
              {project?.description && <p className="text-xs text-slate-600 pt-2 border-t">{project.description.slice(0, 200)}...</p>}
            </CardContent>
          </Card>

          {/* AI vs Reviewer Comparison */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="w-4 h-4" />AI Comparison</CardTitle></CardHeader>
            <CardContent>
              <AIComparisonPanel
                sectionScores={sectionScores}
                aiScores={latestAIEval?.phase2_scores}
                reviewerWeightedScore={reviewerWeightedScore}
                aiTotalScore={aiScore}
              />
            </CardContent>
          </Card>

          {/* Previous reviews */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><History className="w-4 h-4" />Review History</CardTitle></CardHeader>
            <CardContent>
              <PreviousReviewsPanel
                reviews={previousReviews.filter(r => r.id !== assignmentId)}
                evaluations={evaluations}
              />
            </CardContent>
          </Card>

          {/* Audit log */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4" />Audit Trail</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="max-h-60">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No audit logs yet</p>
                ) : (
                  <div className="space-y-2">
                    {auditLogs.slice(0, 20).map(log => (
                      <div key={log.id} className="text-xs p-2 rounded bg-slate-50 border">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px]">{log.action?.replace(/_/g, ' ')}</Badge>
                          <span className="text-slate-400">{log.created_date && new Date(log.created_date).toLocaleDateString()}</span>
                        </div>
                        {log.reason && <p className="text-slate-600 mt-1">{log.reason}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ReadinessItem({ ok, label }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-slate-300" />}
      <span className={ok ? "text-emerald-700" : "text-slate-400"}>{label}</span>
    </div>
  );
}

function ListEditor({ label, icon: Icon, color, items, setItems, newItem, setNewItem, placeholder }) {
  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-sm flex items-center gap-2", `text-${color}-700`)}>
          <Icon className="w-4 h-4" /> {label} ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className={cn("flex items-start gap-2 p-2 rounded text-sm", `bg-${color}-50`)}>
            <span className="flex-1">{item}</span>
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-slate-400 hover:text-rose-500">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder={placeholder}
            className="flex-1 text-sm px-3 py-1.5 border rounded-md"
          />
          <Button size="sm" variant="outline" onClick={addItem}><Plus className="w-3 h-3" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewerQueue({ assignments, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
  const sorted = [...assignments].sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Review Queue</h1>
      {sorted.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No pending review assignments.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(a => (
            <a
              key={a.id}
              href={`/ReviewerWorkflow?id=${a.id}`}
              className="block p-4 rounded-xl border bg-white hover:border-violet-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={cn("text-xs",
                    a.priority === 'urgent' ? "bg-rose-100 text-rose-700" :
                    a.priority === 'high' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                  )}>{a.priority}</Badge>
                  <span className="font-medium text-slate-900">Project #{a.project_id?.slice(-6)}</span>
                  <Badge variant="outline" className="text-[10px]">{a.review_type}</Badge>
                  {a.is_resubmission && <Badge className="bg-blue-100 text-blue-700 text-[10px]">Resubmission</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{a.status}</Badge>
                  {a.due_date && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due {new Date(a.due_date).toLocaleDateString()}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}