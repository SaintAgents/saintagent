import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList, ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';

import IntakeStepIndicator from './intake/IntakeStepIndicator';
import IntakeStepBasicInfo from './intake/IntakeStepBasicInfo';
import IntakeStepOverview from './intake/IntakeStepOverview';
import IntakeStepFunding from './intake/IntakeStepFunding';
import IntakeStepFinancial from './intake/IntakeStepFinancial';
import IntakeStepImpact from './intake/IntakeStepImpact';
import IntakeStepReadiness from './intake/IntakeStepReadiness';
import IntakeStepDocuments from './intake/IntakeStepDocuments';
import IntakeStepAlignment from './intake/IntakeStepAlignment';

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

export default function ProjectIntakeWizard({ open, onClose, currentUser, profile }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fundedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['userProjects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
      setStep(1);
      setFormData(INITIAL_FORM);
    }
  });

  const canProceed = () => {
    switch (step) {
      case 1: return formData.title && formData.contact_name && formData.contact_email;
      case 2: return formData.description && formData.problem_statement;
      case 3: return formData.funding_type && formData.amount_requested && formData.use_of_funds;
      case 4: return true; // financial is conditional
      case 5: return formData.impact_beneficiaries && formData.impact_scale;
      case 6: return true; // readiness is optional
      case 7: return true; // documents are optional
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
      claim_status: 'approved',
      claimed_by: currentUser?.email,
      claimed_at: new Date().toISOString(),
      auto_claimed: true,
      status: 'pending_review',
      project_status: 'planned',
      progress_percent: 0,
      intake_completed: true,
      intake_completed_at: new Date().toISOString(),
      geography: formData.geographic_focus,
    };
    createMutation.mutate(payload);
  };

  const handleClose = () => {
    onClose();
    // Don't reset form data so user doesn't lose progress on accidental close
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

  const stepTitles = [
    '', 'Basic Information', 'Project Overview', 'Funding Type & Details',
    'Financial Structure', 'Impact & Reach', 'Readiness Assessment',
    'Supporting Documents', 'Final Alignment'
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="w-5 h-5 text-violet-600" />
              Project Submission & Funding Intake
            </DialogTitle>
          </DialogHeader>
          <div className="mt-3">
            <IntakeStepIndicator currentStep={step} />
          </div>
        </div>

        {/* Step Title */}
        <div className="px-6 pt-3 pb-1">
          <h3 className="text-sm font-semibold text-slate-800">
            Step {step}: {stepTitles[step]}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {step === 1 && 'Tell us about yourself and the project.'}
            {step === 2 && 'Help us understand your project at a high level.'}
            {step === 3 && 'What kind of funding are you looking for?'}
            {step === 4 && 'Financial details and structure preferences.'}
            {step === 5 && 'Describe the impact your project will have.'}
            {step === 6 && 'What do you currently have in place?'}
            {step === 7 && 'Upload any supporting materials.'}
            {step === 8 && 'Final thoughts on alignment and success.'}
          </p>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-6 pb-2">
          <div className="py-2">
            {renderStep()}
          </div>
        </ScrollArea>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white rounded-b-lg">
          <div className="text-xs text-slate-400">
            Step {step} of {TOTAL_STEPS}
          </div>
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
      </DialogContent>
    </Dialog>
  );
}