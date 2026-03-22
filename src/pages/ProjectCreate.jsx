import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, ArrowLeft, ArrowRight, Send, Loader2, ChevronLeft } from "lucide-react";
import { createPageUrl } from "@/utils";

import IntakeStepIndicator from "@/components/projects/intake/IntakeStepIndicator";
import IntakeStepBasicInfo from "@/components/projects/intake/IntakeStepBasicInfo";
import IntakeStepOverview from "@/components/projects/intake/IntakeStepOverview";
import IntakeStepFunding from "@/components/projects/intake/IntakeStepFunding";
import IntakeStepFinancial from "@/components/projects/intake/IntakeStepFinancial";
import IntakeStepImpact from "@/components/projects/intake/IntakeStepImpact";
import IntakeStepReadiness from "@/components/projects/intake/IntakeStepReadiness";
import IntakeStepDocuments from "@/components/projects/intake/IntakeStepDocuments";
import IntakeStepAlignment from "@/components/projects/intake/IntakeStepAlignment";

const TOTAL_STEPS = 8;

const INITIAL_FORM = {
  title: '', contact_name: '', organization_name: '', contact_email: '', contact_phone: '',
  website_url: '', description: '', problem_statement: '', stage: 'idea',
  funding_type: '', amount_requested: '', use_of_funds: '', funding_timeline: '',
  other_funding_sources: '', revenue_model: '', current_revenue: '', projected_revenue: '',
  exit_repayment_plan: '', open_to_structures: [], impact_beneficiaries: '', impact_scale: '',
  geographic_focus: '', readiness_items: [], pitch_deck_url: '', business_plan_url: '',
  financial_projections_url: '', other_documents_urls: [], alignment_statement: '',
  success_definition: '',
};

const STEP_TITLES = [
  '', 'Basic Information', 'Project Overview', 'Funding Type & Details',
  'Financial Structure', 'Impact & Reach', 'Readiness Assessment',
  'Supporting Documents', 'Final Alignment'
];

const STEP_DESCS = [
  '', 'Tell us about yourself and the project.',
  'Help us understand your project at a high level.',
  'What kind of funding are you looking for?',
  'Financial details and structure preferences.',
  'Describe the impact your project will have.',
  'What do you currently have in place?',
  'Upload any supporting materials.',
  'Final thoughts on alignment and success.'
];

export default function ProjectCreate() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = profiles?.[0];

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const project = await base44.entities.Project.create(data);
      // Gamification: points + badge
      try {
        if (profile) {
          await base44.entities.UserProfile.update(profile.id, {
            engagement_points: (profile.engagement_points || 0) + 30
          });
          const existing = await base44.entities.Badge.filter({ user_id: profile.user_id, code: 'project_contributor' });
          if (!(existing && existing.length)) {
            await base44.entities.Badge.create({ user_id: profile.user_id, code: 'project_contributor', status: 'active' });
          }
        }
      } catch (e) {
        console.error('Gamification project award failed', e);
      }
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['fundedProjects'] });
      window.location.href = createPageUrl("Projects");
    }
  });

  const canProceed = () => {
    switch (step) {
      case 1: return formData.title && formData.contact_name && formData.contact_email;
      case 2: return formData.description && formData.problem_statement;
      case 3: return formData.funding_type && formData.amount_requested && formData.use_of_funds;
      case 4: return true;
      case 5: return formData.impact_beneficiaries && formData.impact_scale;
      case 6: return true;
      case 7: return true;
      case 8: return formData.alignment_statement && formData.success_definition;
      default: return false;
    }
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      amount_requested: parseFloat(formData.amount_requested) || 0,
      budget: parseFloat(formData.amount_requested) || 0,
      owner_id: currentUser?.email,
      owner_name: profile?.display_name || currentUser?.full_name,
      owner_avatar: profile?.avatar_url,
      status: 'pending_review',
      project_status: 'planned',
      progress_percent: 0,
      intake_completed: true,
      intake_completed_at: new Date().toISOString(),
      geography: formData.geographic_focus,
    };
    createMutation.mutate(payload);
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <IntakeStepBasicInfo formData={formData} onChange={setFormData} />;
      case 2: return <IntakeStepOverview formData={formData} onChange={setFormData} />;
      case 3: return <IntakeStepFunding formData={formData} onChange={setFormData} />;
      case 4: return <IntakeStepFinancial formData={formData} onChange={setFormData} />;
      case 5: return <IntakeStepImpact formData={formData} onChange={setFormData} />;
      case 6: return <IntakeStepReadiness formData={formData} onChange={setFormData} />;
      case 7: return <IntakeStepDocuments formData={formData} onChange={setFormData} />;
      case 8: return <IntakeStepAlignment formData={formData} onChange={setFormData} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 gap-1 text-slate-600 hover:text-slate-900"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="w-4 h-4" /> Back to Projects
        </Button>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-violet-600" />
              Project Submission & Funding Intake
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Complete this questionnaire to submit your project for review.
            </p>
            <div className="mt-4">
              <IntakeStepIndicator currentStep={step} />
            </div>
          </div>

          {/* Step Content */}
          <div className="px-6 pt-4 pb-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Step {step}: {STEP_TITLES[step]}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">{STEP_DESCS[step]}</p>
          </div>

          <ScrollArea className="px-6 max-h-[55vh]">
            <div className="pb-4">
              {renderStep()}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-xs text-slate-400">Step {step} of {TOTAL_STEPS}</span>
            <div className="flex items-center gap-2">
              {step > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              )}
              {step < TOTAL_STEPS ? (
                <Button
                  type="button"
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700"
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                >
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSubmit}
                  disabled={!canProceed() || createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-1" /> Submit for Review</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}