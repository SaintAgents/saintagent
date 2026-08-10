import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Landmark, ChevronLeft, ArrowLeft, ArrowRight, Save, Loader2,
  Send, Globe, DollarSign, Target, Shield, Calculator, FileText
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';

import BPStepSovereignIntake from '@/components/businessplan/BPStepSovereignIntake';
import BPStepFinancialModel from '@/components/businessplan/BPStepFinancialModel';
import BPStepImpactMatrix from '@/components/businessplan/BPStepImpactMatrix';
import BPStepGovernance from '@/components/businessplan/BPStepGovernance';
import BPStepResourceRisk from '@/components/businessplan/BPStepResourceRisk';
import BPStepExport from '@/components/businessplan/BPStepExport';

const STEPS = [
  { key: 'sovereign', label: 'Sovereign Intake', icon: Globe, color: 'text-amber-600', desc: 'Funding track, asset mapping & GGT alignment' },
  { key: 'financial', label: 'Financial Model', icon: DollarSign, color: 'text-blue-600', desc: 'Dual-engine: traditional + regenerative ledger' },
  { key: 'impact', label: 'Impact Matrix', icon: Target, color: 'text-emerald-600', desc: 'UN SDG alignment & humanitarian allocation' },
  { key: 'governance', label: 'Governance', icon: Shield, color: 'text-violet-600', desc: 'Entity structure, multi-sig, transparency' },
  { key: 'resource', label: 'Resources & Risk', icon: Calculator, color: 'text-cyan-600', desc: 'Resource calculator, escrow, stress test' },
  { key: 'export', label: 'Review & Export', icon: FileText, color: 'text-rose-600', desc: 'AI summary, dossier & pitch deck' },
];

export default function BusinessPlanBuilder() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [planId, setPlanId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || null;
  });
  const [formData, setFormData] = useState({ title: '' });
  const [saving, setSaving] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email,
  });
  const profile = profiles?.[0];

  // Load existing plan if editing
  const { data: existingPlan } = useQuery({
    queryKey: ['businessPlan', planId],
    queryFn: () => base44.entities.BusinessPlan.filter({ id: planId }),
    enabled: !!planId,
  });

  useEffect(() => {
    if (existingPlan?.[0]) {
      setFormData(existingPlan[0]);
    }
  }, [existingPlan]);

  const updateForm = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      if (planId) {
        const { id, created_date, updated_date, created_by_id, ...updateData } = formData;
        await base44.entities.BusinessPlan.update(planId, { ...updateData, status: 'in_progress' });
      } else {
        const plan = await base44.entities.BusinessPlan.create({
          ...formData,
          owner_id: currentUser?.email,
          owner_name: profile?.display_name || currentUser?.full_name,
          status: 'in_progress',
        });
        setPlanId(plan.id);
        window.history.replaceState(null, '', `?id=${plan.id}`);
      }
      queryClient.invalidateQueries({ queryKey: ['businessPlans'] });
    } catch (e) {
      console.error('Save failed', e);
    }
    setSaving(false);
  };

  const submitPlan = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        owner_id: currentUser?.email,
        owner_name: profile?.display_name || currentUser?.full_name,
        status: 'complete',
      };
      if (planId) {
        const { id, created_date, updated_date, created_by_id, ...updateData } = payload;
        await base44.entities.BusinessPlan.update(planId, updateData);
      } else {
        await base44.entities.BusinessPlan.create(payload);
      }
      queryClient.invalidateQueries({ queryKey: ['businessPlans'] });
      window.location.href = createPageUrl('Projects');
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const currentStep = STEPS[step];
  const StepIcon = currentStep.icon;

  const renderStep = () => {
    switch (step) {
      case 0: return <BPStepSovereignIntake data={formData} onChange={updateForm} />;
      case 1: return <BPStepFinancialModel data={formData} onChange={updateForm} />;
      case 2: return <BPStepImpactMatrix data={formData} onChange={updateForm} />;
      case 3: return <BPStepGovernance data={formData} onChange={updateForm} />;
      case 4: return <BPStepResourceRisk data={formData} onChange={updateForm} />;
      case 5: return <BPStepExport data={formData} onChange={updateForm} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 relative z-10">
      {/* Hero */}
      <div className="page-hero relative overflow-hidden">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/e61c7afac_universal_upscale_0_9d714c8a-311f-436e-a407-485dfe85801f_01.jpg"
          alt="Business Plan Builder"
          className="w-full h-full object-cover object-center hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-slate-50 dark:to-[#050505]" />
        <HeroGalleryTrigger startIndex={12} className="absolute bottom-4 left-4 text-white/80 !p-1 [&_svg]:w-3 [&_svg]:h-3 z-10" />
        <div className="absolute inset-0 flex items-center justify-center hero-content">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg tracking-wide flex items-center gap-3"
                  style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(139,92,246,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
                <Landmark className="w-9 h-9 text-amber-300 drop-shadow-lg" />
                GGT Business Architecture
              </h1>
              <ForwardButton currentPage="BusinessPlanBuilder" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
            </div>
            <div className="p-3 rounded-2xl bg-black/[0.04] backdrop-blur-sm border border-white/20 mt-3">
              <p className="text-cyan-100/[0.92] text-base tracking-wider drop-shadow-lg">
                Grant & Project Readiness Engine
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        {/* Title Input */}
        {!formData.title && step === 0 && (
          <div className="mb-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <label className="text-sm font-semibold text-slate-800 mb-2 block flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-600" /> Project / Venture Title
            </label>
            <Input
              value={formData.title || ''}
              onChange={e => updateForm({ title: e.target.value })}
              placeholder="Enter the name of your project or venture..."
              className="text-lg font-medium"
            />
          </div>
        )}

        {/* Step Indicator */}
        <div className="mb-6 flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <button
                key={s.key}
                onClick={() => setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-white border-2 border-amber-400 shadow-sm text-slate-900'
                    : isDone
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? s.color : isDone ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Step Header */}
          <div className="px-6 pt-5 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <StepIcon className={`w-5 h-5 ${currentStep.color}`} />
                  Module {step + 1}: {currentStep.label}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{currentStep.desc}</p>
              </div>
              {formData.title && (
                <div className="text-right hidden md:block">
                  <div className="text-xs text-slate-400">Project</div>
                  <div className="text-sm font-semibold text-slate-700 max-w-[200px] truncate">{formData.title}</div>
                </div>
              )}
            </div>
          </div>

          {/* Step Content */}
          <ScrollArea className="px-6 py-5 max-h-[60vh]">
            {renderStep()}
          </ScrollArea>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Module {step + 1} of {STEPS.length}</span>
              <Button variant="ghost" size="sm" onClick={saveDraft} disabled={saving || !formData.title} className="gap-1 text-xs">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save Draft
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => setStep(step + 1)} disabled={step === 0 && !formData.title}>
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1" onClick={submitPlan} disabled={saving || !formData.title}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Plan
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}