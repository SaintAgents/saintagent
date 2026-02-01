import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot, Wrench, FlaskConical, CheckCircle2, 
  Clock, ChevronDown, ChevronUp, Copy
} from "lucide-react";
import { format } from 'date-fns';

export default function BugRepairChecklist({ 
  feedback, 
  currentUser, 
  onUpdate 
}) {
  const [expanded, setExpanded] = useState(true);
  const [checklist, setChecklist] = useState({
    analyzed: false,
    analyzed_at: null,
    fix_implemented: false,
    fix_implemented_at: null,
    fix_implemented_by: null,
    tested: false,
    tested_at: null,
    tested_by: null,
    confirmed_fixed: false,
    confirmed_at: null,
    confirmed_by: null
  });
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (feedback?.repair_checklist) {
      try {
        setChecklist(JSON.parse(feedback.repair_checklist));
      } catch (e) {
        console.error('Failed to parse checklist:', e);
      }
    }
    if (feedback?.ai_analysis) {
      try {
        setAnalysis(JSON.parse(feedback.ai_analysis));
      } catch (e) {
        console.error('Failed to parse analysis:', e);
      }
    }
  }, [feedback]);

  const handleChecklistUpdate = (field, value) => {
    const newChecklist = { ...checklist };
    newChecklist[field] = value;
    
    if (value && field.endsWith('_at') === false) {
      newChecklist[`${field}_at`] = new Date().toISOString();
      newChecklist[`${field}_by`] = currentUser?.email || 'admin';
    }
    
    setChecklist(newChecklist);
    
    // Determine new status based on checklist
    let newStatus = feedback.status;
    if (newChecklist.confirmed_fixed) {
      newStatus = 'resolved';
    } else if (newChecklist.tested || newChecklist.fix_implemented) {
      newStatus = 'in_progress';
    } else if (newChecklist.analyzed) {
      newStatus = 'reviewed';
    }
    
    onUpdate({
      repair_checklist: JSON.stringify(newChecklist),
      status: newStatus
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!feedback || feedback.feedback_type !== 'bug') {
    return null;
  }

  const allComplete = checklist.analyzed && checklist.fix_implemented && checklist.tested && checklist.confirmed_fixed;

  return (
    <div className="border rounded-lg bg-slate-50 overflow-hidden">
      {/* Header */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-violet-600" />
          <span className="font-medium text-slate-900">Bug Repair Workflow</span>
          {allComplete && (
            <Badge className="bg-green-100 text-green-700">Complete</Badge>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* AI Analysis Section */}
          {analysis && (
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-violet-700 font-medium">
                <Bot className="w-4 h-4" />
                AI Analysis
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Summary:</strong> {analysis.summary}</p>
                <p><strong>Likely Cause:</strong> {analysis.likely_cause}</p>
                <div className="bg-white rounded p-2 mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-violet-700">Suggested Fix:</strong>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard(analysis.suggested_fix)}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{analysis.suggested_fix}</p>
                </div>
              </div>
            </div>
          )}

          {/* Checklist Items */}
          <div className="space-y-3">
            {/* Step 1: Analyzed */}
            <div className="flex items-start gap-3 p-2 rounded hover:bg-white">
              <Checkbox 
                checked={checklist.analyzed}
                onCheckedChange={(checked) => handleChecklistUpdate('analyzed', checked)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">1. AI Analyzed</span>
                </div>
                {checklist.analyzed_at && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {format(new Date(checklist.analyzed_at), 'MMM d, yyyy h:mm a')}
                  </p>
                )}
              </div>
            </div>

            {/* Step 2: Fix Implemented */}
            <div className="flex items-start gap-3 p-2 rounded hover:bg-white">
              <Checkbox 
                checked={checklist.fix_implemented}
                onCheckedChange={(checked) => handleChecklistUpdate('fix_implemented', checked)}
                disabled={!checklist.analyzed}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">2. Fix Implemented</span>
                </div>
                <p className="text-xs text-slate-500">Manually apply the suggested fix via Base44 assistant</p>
                {checklist.fix_implemented_at && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    By {checklist.fix_implemented_by} • {format(new Date(checklist.fix_implemented_at), 'MMM d, yyyy h:mm a')}
                  </p>
                )}
              </div>
            </div>

            {/* Step 3: Tested */}
            <div className="flex items-start gap-3 p-2 rounded hover:bg-white">
              <Checkbox 
                checked={checklist.tested}
                onCheckedChange={(checked) => handleChecklistUpdate('tested', checked)}
                disabled={!checklist.fix_implemented}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">3. Tested</span>
                </div>
                <p className="text-xs text-slate-500">Admin team tested the fix in the app</p>
                {checklist.tested_at && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    By {checklist.tested_by} • {format(new Date(checklist.tested_at), 'MMM d, yyyy h:mm a')}
                  </p>
                )}
              </div>
            </div>

            {/* Step 4: Confirmed Fixed */}
            <div className="flex items-start gap-3 p-2 rounded hover:bg-white">
              <Checkbox 
                checked={checklist.confirmed_fixed}
                onCheckedChange={(checked) => handleChecklistUpdate('confirmed_fixed', checked)}
                disabled={!checklist.tested}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="font-medium">4. Confirmed Fixed</span>
                </div>
                <p className="text-xs text-slate-500">Bug is verified as resolved</p>
                {checklist.confirmed_at && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    By {checklist.confirmed_by} • {format(new Date(checklist.confirmed_at), 'MMM d, yyyy h:mm a')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}