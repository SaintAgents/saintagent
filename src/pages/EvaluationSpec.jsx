import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, Brain, AlertTriangle, TrendingUp, Target, Scale, Leaf, Users, 
  Lightbulb, CheckCircle, XCircle, HelpCircle, FileText, BarChart3,
  Layers, GitBranch, Eye, Lock, Zap, Globe, Heart, Sparkles,
  ChevronRight, Info, BookOpen, Calculator, Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EvaluationSpec() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-violet-100">
              <Brain className="w-8 h-8 text-violet-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AI-Assisted Project Evaluation System</h1>
              <p className="text-slate-600">Comprehensive specification for humanitarian funding assessment</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className="bg-violet-100 text-violet-700">Version 1.0</Badge>
            <Badge className="bg-emerald-100 text-emerald-700">4-Phase Methodology</Badge>
            <Badge className="bg-blue-100 text-blue-700">EA + Flourishing + Blue Economy</Badge>
            <Badge className="bg-amber-100 text-amber-700">Anti-Gaming Protection</Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="gap-1"><BookOpen className="w-4 h-4" />Overview</TabsTrigger>
            <TabsTrigger value="phase1" className="gap-1"><Shield className="w-4 h-4" />Phase 1</TabsTrigger>
            <TabsTrigger value="phase2" className="gap-1"><Calculator className="w-4 h-4" />Phase 2</TabsTrigger>
            <TabsTrigger value="phase3" className="gap-1"><AlertTriangle className="w-4 h-4" />Phase 3</TabsTrigger>
            <TabsTrigger value="phase4" className="gap-1"><Target className="w-4 h-4" />Phase 4</TabsTrigger>
            <TabsTrigger value="taxonomy" className="gap-1"><Layers className="w-4 h-4" />Taxonomy</TabsTrigger>
            <TabsTrigger value="antigaming" className="gap-1"><Eye className="w-4 h-4" />Anti-Gaming</TabsTrigger>
            <TabsTrigger value="examples" className="gap-1"><FileText className="w-4 h-4" />Examples</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Section title="System Purpose" icon={Target}>
              <p className="text-slate-700 mb-4">
                This AI-assisted evaluation system provides rigorous, transparent, and fair assessment of humanitarian 
                and regenerative projects seeking funding. It combines quantitative scoring with qualitative judgment, 
                integrating principles from:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <FeatureCard 
                  icon={Scale} 
                  title="Effective Altruism" 
                  description="Evidence-based cost-effectiveness analysis and counterfactual impact assessment"
                  color="violet"
                />
                <FeatureCard 
                  icon={Heart} 
                  title="Human Flourishing" 
                  description="Multi-dimensional wellbeing across health, education, autonomy, and meaning"
                  color="rose"
                />
                <FeatureCard 
                  icon={Leaf} 
                  title="Blue Economy / Regenerative" 
                  description="Planetary boundaries, circular design, and ecosystem restoration"
                  color="emerald"
                />
              </div>
            </Section>

            <Section title="4-Phase Methodology" icon={GitBranch}>
              <div className="grid md:grid-cols-2 gap-4">
                <PhaseCard 
                  number={1} 
                  title="WHY Filter (Ethical Firewall)" 
                  description="Binary pass/fail screening for hard ethical stops and manipulation indicators"
                  icon={Shield}
                  color="rose"
                />
                <PhaseCard 
                  number={2} 
                  title="Quantitative Scoring" 
                  description="Weighted multi-criteria assessment across 10 subcriteria with evidence requirements"
                  icon={Calculator}
                  color="violet"
                />
                <PhaseCard 
                  number={3} 
                  title="Execution Risk Model" 
                  description="5-dimension risk assessment with harm gates and de-risking pathways"
                  icon={AlertTriangle}
                  color="amber"
                />
                <PhaseCard 
                  number={4} 
                  title="Decision Layer" 
                  description="Final scoring, tier assignment, and conditional recommendations"
                  icon={Target}
                  color="emerald"
                />
              </div>
            </Section>

            <Section title="Key Principles" icon={Sparkles}>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { title: "Evaluate capability, not credentials", desc: "Track record matters, but don't discount non-traditional backgrounds" },
                  { title: "Absence of evidence ≠ evidence of absence", desc: "Flag gaps rather than penalize; request information before declining" },
                  { title: "Context sensitivity", desc: "Adjust expectations based on project stage, geography, and sector norms" },
                  { title: "Transparent reasoning", desc: "Every score must include rationale and evidence citations" },
                  { title: "Anti-gaming vigilance", desc: "Detect impact theater, charisma capture, and benchmark manipulation" },
                  { title: "Human oversight required", desc: "AI recommendations require human review before final decisions" }
                ].map((p, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-white">
                    <div className="font-medium text-slate-900">{p.title}</div>
                    <div className="text-sm text-slate-600">{p.desc}</div>
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          {/* Phase 1 */}
          <TabsContent value="phase1" className="space-y-6">
            <Section title="Phase 1: WHY Filter (Ethical Firewall)" icon={Shield}>
              <p className="text-slate-700 mb-4">
                A binary pass/fail gate that screens for fundamental ethical violations. Projects that fail this 
                phase are immediately declined regardless of potential impact scores.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <ResultCard result="pass" title="PASS" description="No ethical concerns identified; proceed to Phase 2" />
                <ResultCard result="uncertain" title="UNCERTAIN" description="Missing information or ambiguous indicators; request clarification" />
                <ResultCard result="fail" title="FAIL" description="Hard stop triggered or 3+ manipulation indicators; decline" />
              </div>
            </Section>

            <Section title="Hard Stops (Automatic Fail)" icon={XCircle}>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { code: 'fraud', label: 'Fraud', desc: 'Deliberate misrepresentation of impact, financials, or capabilities' },
                  { code: 'coercion', label: 'Coercion', desc: 'Forcing participation through threats, manipulation, or undue pressure' },
                  { code: 'hate_violence', label: 'Hate/Violence', desc: 'Promoting discrimination, violence, or harm to specific groups' },
                  { code: 'medical_misinfo', label: 'Medical Misinformation', desc: 'Promoting unproven treatments or contradicting medical consensus' },
                  { code: 'scam', label: 'Scam/Ponzi', desc: 'Financial schemes that require continuous recruitment to sustain' },
                  { code: 'exploitative_labor', label: 'Exploitative Labor', desc: 'Using forced, child, or severely underpaid labor' },
                  { code: 'land_rights', label: 'Land Rights Violations', desc: 'Displacing communities without consent or fair compensation' },
                  { code: 'data_abuse', label: 'Data Abuse', desc: 'Collecting or selling personal data without informed consent' },
                  { code: 'weapons', label: 'Weapons/Dual-Use', desc: 'Technology that could enable weapons or mass surveillance' },
                  { code: 'environmental_catastrophe', label: 'Environmental Catastrophe', desc: 'Actions causing irreversible ecosystem destruction' }
                ].map((stop, i) => (
                  <div key={i} className="p-3 rounded-lg border border-rose-200 bg-rose-50">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span className="font-medium text-rose-900">{stop.label}</span>
                    </div>
                    <p className="text-sm text-rose-700">{stop.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Manipulation Indicators (3+ = Fail)" icon={Eye}>
              <p className="text-slate-600 mb-4">
                These indicators suggest cult-like or manipulative organizational dynamics. One or two may warrant 
                closer scrutiny; three or more trigger automatic failure.
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { code: 'dependency_creation', label: 'Dependency Creation', desc: 'Beneficiaries become reliant rather than empowered' },
                  { code: 'isolation_tactics', label: 'Isolation Tactics', desc: 'Separating members from outside relationships' },
                  { code: 'exclusive_truth', label: 'Exclusive Truth Claims', desc: '"Only we have the answer" messaging' },
                  { code: 'coercive_payments', label: 'Coercive Payments', desc: 'Escalating financial commitments to maintain status' },
                  { code: 'threat_punishment', label: 'Threat/Punishment', desc: 'Consequences for questioning or leaving' },
                  { code: 'sleep_food_control', label: 'Sleep/Food Control', desc: 'Manipulating basic needs to maintain control' },
                  { code: 'mandated_secrecy', label: 'Mandated Secrecy', desc: 'Prohibiting disclosure of practices or teachings' },
                  { code: 'punitive_shaming', label: 'Punitive Shaming', desc: 'Public humiliation for non-compliance' },
                  { code: 'love_bombing', label: 'Love Bombing', desc: 'Excessive initial affection that creates obligation' },
                  { code: 'leader_infallibility', label: 'Leader Infallibility', desc: 'Presenting leadership as beyond criticism' },
                  { code: 'financial_opacity', label: 'Financial Opacity', desc: 'Refusing to disclose how funds are used' }
                ].map((ind, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-amber-50 border-amber-200">
                    <div className="font-medium text-amber-900 text-sm">{ind.label}</div>
                    <p className="text-xs text-amber-700 mt-1">{ind.desc}</p>
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          {/* Phase 2 */}
          <TabsContent value="phase2" className="space-y-6">
            <Section title="Phase 2: Quantitative Scoring" icon={Calculator}>
              <p className="text-slate-700 mb-4">
                Multi-criteria assessment using weighted subcriteria. Each subcriterion is scored 1-10 with 
                mandatory rationale and evidence citations. The base score is calculated as a weighted sum.
              </p>
            </Section>

            <Section title="Scoring Categories & Weights" icon={BarChart3}>
              <div className="space-y-4">
                <ScoringCategory 
                  title="Impact Score" 
                  weight={40} 
                  color="emerald"
                  subcriteria={[
                    { name: 'Planetary Wellbeing', weight: 20, desc: 'Environmental restoration, biodiversity, climate mitigation, circular resource use' },
                    { name: 'Human Wellbeing', weight: 20, desc: 'Health, education, economic security, autonomy, meaning, and dignity' }
                  ]}
                />
                <ScoringCategory 
                  title="Regenerative & Ethical" 
                  weight={25} 
                  color="violet"
                  subcriteria={[
                    { name: 'Regenerative Potential', weight: 15, desc: 'Does the project create net-positive cycles? Restore rather than just sustain?' },
                    { name: 'Ethical Governance', weight: 10, desc: 'Transparency, accountability, informed consent, fair distribution of benefits' }
                  ]}
                />
                <ScoringCategory 
                  title="Feasibility & Sustainability" 
                  weight={20} 
                  color="blue"
                  subcriteria={[
                    { name: 'Cost Effectiveness', weight: 10, desc: 'Cost per unit of impact; efficiency relative to alternatives' },
                    { name: 'Scalability & Model', weight: 10, desc: 'Path to financial sustainability; growth potential without compromising mission' }
                  ]}
                />
                <ScoringCategory 
                  title="Team Solidity" 
                  weight={10} 
                  color="amber"
                  subcriteria={[
                    { name: 'Expertise & Track Record', weight: 5, desc: 'Relevant skills and demonstrated past performance (capability over credentials)' },
                    { name: 'Community Integration', weight: 5, desc: 'Local ownership, dignified partnership, participatory design' }
                  ]}
                />
                <ScoringCategory 
                  title="Innovation & Replicability" 
                  weight={5} 
                  color="cyan"
                  subcriteria={[
                    { name: 'Innovation', weight: 2, desc: 'Novel approaches, creative solutions, or new applications' },
                    { name: 'Replicability', weight: 3, desc: 'Can the model be adapted and transferred to other contexts?' }
                  ]}
                />
              </div>
            </Section>

            <Section title="Scoring Rubric (1-10 Scale)" icon={Gauge}>
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                {[
                  { range: '1-2', label: 'Poor', color: 'rose', desc: 'Missing or negative' },
                  { range: '3-4', label: 'Weak', color: 'orange', desc: 'Below expectations' },
                  { range: '5-6', label: 'Adequate', color: 'amber', desc: 'Meets minimum' },
                  { range: '7-8', label: 'Strong', color: 'emerald', desc: 'Above average' },
                  { range: '9-10', label: 'Exceptional', color: 'violet', desc: 'Best-in-class' }
                ].map((s, i) => (
                  <div key={i} className={cn(
                    "p-3 rounded-lg border",
                    s.color === 'rose' && "bg-rose-50 border-rose-200",
                    s.color === 'orange' && "bg-orange-50 border-orange-200",
                    s.color === 'amber' && "bg-amber-50 border-amber-200",
                    s.color === 'emerald' && "bg-emerald-50 border-emerald-200",
                    s.color === 'violet' && "bg-violet-50 border-violet-200"
                  )}>
                    <div className="font-bold text-lg">{s.range}</div>
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs text-slate-600">{s.desc}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="font-medium text-blue-900 mb-2">Confidence Score (0-100)</div>
                <p className="text-sm text-blue-700">
                  Reflects evidence quality and completeness. High confidence (80+) means strong documentation 
                  and verifiable claims. Low confidence ({"<"}50) indicates significant information gaps that 
                  should trigger RFI before final decision.
                </p>
              </div>
            </Section>
          </TabsContent>

          {/* Phase 3 */}
          <TabsContent value="phase3" className="space-y-6">
            <Section title="Phase 3: Execution Risk Model" icon={AlertTriangle}>
              <p className="text-slate-700 mb-4">
                Assesses the likelihood that the project will deliver on its promises. Generates an execution 
                multiplier (0.6-1.0) that adjusts the base score downward based on identified risks.
              </p>
            </Section>

            <Section title="Risk Dimensions (1-5 Severity)" icon={Zap}>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { dim: 'Team Risk', factors: ['Key person dependency', 'Skill gaps', 'Turnover history', 'Leadership experience'] },
                  { dim: 'Technical Risk', factors: ['Technology readiness', 'Integration complexity', 'Novel vs. proven approaches'] },
                  { dim: 'Financial Risk', factors: ['Funding runway', 'Revenue diversification', 'Cost overrun history'] },
                  { dim: 'External Risk', factors: ['Regulatory changes', 'Political instability', 'Market shifts', 'Climate events'] },
                  { dim: 'Timeline Risk', factors: ['Milestone realism', 'Dependencies', 'Buffer adequacy'] }
                ].map((r, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-white">
                    <div className="font-semibold text-slate-900 mb-2">{r.dim}</div>
                    <div className="flex flex-wrap gap-1">
                      {r.factors.map((f, j) => (
                        <Badge key={j} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Harm Gates" icon={Shield}>
              <p className="text-slate-600 mb-4">
                Binary gates that check for potential harm pathways. A triggered gate doesn't automatically fail 
                the project but requires explicit mitigation in the de-risking plan.
              </p>
              <div className="grid md:grid-cols-4 gap-3">
                {[
                  { gate: 'Physical Harm', desc: 'Risk of injury or health damage to participants or communities' },
                  { gate: 'Psychological Harm', desc: 'Trauma, manipulation, or mental health impacts' },
                  { gate: 'Environmental Harm', desc: 'Pollution, habitat destruction, or resource depletion' },
                  { gate: 'Financial Harm', desc: 'Risk of participants losing money or economic security' }
                ].map((g, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-slate-50">
                    <div className="font-medium text-slate-900 text-sm">{g.gate}</div>
                    <p className="text-xs text-slate-600 mt-1">{g.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Risk Grades & Multipliers" icon={Gauge}>
              <div className="grid grid-cols-5 gap-2 text-center">
                {[
                  { grade: 'A', mult: '1.0', label: 'Minimal Risk', color: 'emerald' },
                  { grade: 'B', mult: '0.9', label: 'Low Risk', color: 'green' },
                  { grade: 'C', mult: '0.8', label: 'Moderate Risk', color: 'amber' },
                  { grade: 'D', mult: '0.7', label: 'High Risk', color: 'orange' },
                  { grade: 'F', mult: '0.6', label: 'Critical Risk', color: 'rose' }
                ].map((r, i) => (
                  <div key={i} className={cn(
                    "p-4 rounded-lg border",
                    r.color === 'emerald' && "bg-emerald-50 border-emerald-200",
                    r.color === 'green' && "bg-green-50 border-green-200",
                    r.color === 'amber' && "bg-amber-50 border-amber-200",
                    r.color === 'orange' && "bg-orange-50 border-orange-200",
                    r.color === 'rose' && "bg-rose-50 border-rose-200"
                  )}>
                    <div className="text-3xl font-bold">{r.grade}</div>
                    <div className="text-sm font-medium">×{r.mult}</div>
                    <div className="text-xs text-slate-600">{r.label}</div>
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          {/* Phase 4 */}
          <TabsContent value="phase4" className="space-y-6">
            <Section title="Phase 4: Decision Layer" icon={Target}>
              <p className="text-slate-700 mb-4">
                Combines base score and execution multiplier to produce final score, then assigns a decision tier 
                with specific conditions and next steps.
              </p>
              <div className="p-4 rounded-lg bg-violet-50 border border-violet-200 mb-6">
                <div className="font-mono text-lg text-violet-900">
                  Final Score = Base Score × Execution Multiplier × Confidence Adjustment
                </div>
              </div>
            </Section>

            <Section title="Decision Tiers" icon={Layers}>
              <div className="grid md:grid-cols-2 gap-4">
                <TierCard 
                  tier="approve_fund"
                  title="Approve & Fund"
                  threshold="≥80"
                  requirements={['Phase 1: PASS', 'Risk Grade: A-C', 'Confidence: ≥60']}
                  actions={['Proceed to funding disbursement', 'Schedule impact milestones', 'Assign monitoring cadence']}
                  color="emerald"
                />
                <TierCard 
                  tier="incubate_derisk"
                  title="Incubate & De-Risk"
                  threshold="60-79"
                  requirements={['Phase 1: PASS', 'Risk Grade: Any', 'Addressable gaps identified']}
                  actions={['Provide technical assistance', 'Milestone-based funding tranches', 'Quarterly reassessment']}
                  color="amber"
                />
                <TierCard 
                  tier="review_reevaluate"
                  title="Review & Re-evaluate"
                  threshold="40-59"
                  requirements={['Phase 1: PASS or UNCERTAIN', 'Information gaps present']}
                  actions={['Issue RFI with specific questions', 'Set 30-day response window', 'Re-evaluate upon response']}
                  color="blue"
                />
                <TierCard 
                  tier="decline"
                  title="Decline"
                  threshold="<40 or Phase 1 FAIL"
                  requirements={['Hard stop triggered', 'Score below threshold', 'Unmitigable risks']}
                  actions={['Provide constructive feedback', 'Suggest alternative resources', 'Allow reapplication in 12 months']}
                  color="rose"
                />
              </div>
            </Section>

            <Section title="Conditional Approvals" icon={FileText}>
              <p className="text-slate-600 mb-3">
                Projects in "Approve" or "Incubate" tiers may have conditions attached. Common conditions include:
              </p>
              <div className="grid md:grid-cols-2 gap-2">
                {[
                  'Complete governance documentation within 60 days',
                  'Hire specific expertise (e.g., financial controller)',
                  'Establish community advisory board',
                  'Submit environmental impact assessment',
                  'Achieve specific milestone before next tranche',
                  'Monthly financial reporting for first year',
                  'Third-party impact verification at 6 months'
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50">
                    <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5" />
                    <span className="text-sm text-slate-700">{c}</span>
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          {/* Taxonomy */}
          <TabsContent value="taxonomy" className="space-y-6">
            <Section title="Lane Taxonomy" icon={Layers}>
              <p className="text-slate-700 mb-4">
                Projects are categorized into "lanes" for benchmarking against similar initiatives. Each lane 
                has typical budget ranges and evaluation emphases.
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { code: 'health', label: 'Global Health', budget: '$50K-$2M', emphasis: 'Cost-per-DALY, evidence base' },
                  { code: 'education', label: 'Education', budget: '$25K-$500K', emphasis: 'Learning outcomes, accessibility' },
                  { code: 'climate', label: 'Climate/Environment', budget: '$100K-$5M', emphasis: 'CO2e reduction, ecosystem metrics' },
                  { code: 'food_systems', label: 'Food Systems', budget: '$50K-$1M', emphasis: 'Nutrition security, regenerative ag' },
                  { code: 'water_sanitation', label: 'Water & Sanitation', budget: '$50K-$2M', emphasis: 'Access, quality, sustainability' },
                  { code: 'economic_empowerment', label: 'Economic Empowerment', budget: '$25K-$500K', emphasis: 'Income gains, job quality' },
                  { code: 'housing_shelter', label: 'Housing & Shelter', budget: '$100K-$2M', emphasis: 'Units built, quality, affordability' },
                  { code: 'governance', label: 'Governance & Rights', budget: '$25K-$250K', emphasis: 'Policy change, rights protection' },
                  { code: 'peace_conflict', label: 'Peace & Conflict', budget: '$50K-$1M', emphasis: 'Violence reduction, reconciliation' },
                  { code: 'technology', label: 'Technology for Good', budget: '$50K-$500K', emphasis: 'Digital access, ethical AI' },
                  { code: 'arts_culture', label: 'Arts & Culture', budget: '$10K-$250K', emphasis: 'Cultural preservation, expression' },
                  { code: 'spiritual_wellbeing', label: 'Spiritual Wellbeing', budget: '$10K-$100K', emphasis: 'Non-coercion, voluntary participation' },
                  { code: 'disaster_response', label: 'Disaster Response', budget: '$100K-$5M', emphasis: 'Speed, reach, efficiency' },
                  { code: 'research', label: 'Research & Evidence', budget: '$25K-$500K', emphasis: 'Rigor, applicability, open access' },
                  { code: 'cross_cutting', label: 'Cross-Cutting', budget: 'Varies', emphasis: 'Systems change, coordination' }
                ].map((lane, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-white">
                    <div className="font-medium text-slate-900">{lane.label}</div>
                    <div className="text-xs text-slate-500 mt-1">Typical: {lane.budget}</div>
                    <div className="text-xs text-violet-600 mt-1">Focus: {lane.emphasis}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Stage Definitions" icon={TrendingUp}>
              <div className="space-y-3">
                {[
                  { stage: 'idea', label: 'Idea Stage', desc: 'Concept only; no implementation yet', expectations: 'Strong theory of change, preliminary research, team assembled' },
                  { stage: 'prototype', label: 'Prototype', desc: 'Initial testing with limited users/beneficiaries', expectations: 'Early learnings documented, iteration evidence, user feedback' },
                  { stage: 'pilot', label: 'Pilot', desc: 'Structured test in real conditions', expectations: 'Measurable outcomes, cost data, scalability assessment' },
                  { stage: 'scaling', label: 'Scaling', desc: 'Expanding reach based on proven model', expectations: 'Consistent results across sites, operational efficiency, growth plan' },
                  { stage: 'mature_ops', label: 'Mature Operations', desc: 'Established, optimizing for efficiency', expectations: 'Demonstrated track record, financial sustainability path, knowledge sharing' }
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-white">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="uppercase">{s.stage.replace('_', ' ')}</Badge>
                      <span className="font-medium text-slate-900">{s.label}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{s.desc}</p>
                    <p className="text-xs text-violet-700"><strong>Expectations:</strong> {s.expectations}</p>
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          {/* Anti-Gaming */}
          <TabsContent value="antigaming" className="space-y-6">
            <Section title="Anti-Gaming Detection" icon={Eye}>
              <p className="text-slate-700 mb-4">
                The system actively monitors for attempts to manipulate evaluation outcomes. Detected gaming 
                flags trigger additional scrutiny and may result in score penalties or automatic decline.
              </p>
            </Section>

            <Section title="Gaming Indicators" icon={AlertTriangle}>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { flag: 'impact_theater', label: 'Impact Theater', desc: 'Impressive presentations with cherry-picked metrics that obscure actual outcomes', detection: 'Cross-reference claims with independent data; request raw numbers' },
                  { flag: 'manipulated_metrics', label: 'Manipulated Metrics', desc: 'Using misleading denominators, timeframes, or definitions to inflate impact', detection: 'Standardize metrics; compare to lane benchmarks' },
                  { flag: 'charisma_capture', label: 'Charisma Capture', desc: 'Relying on founder personality rather than demonstrable results', detection: 'Focus on verifiable outcomes; multiple team interviews' },
                  { flag: 'unverifiable_claims', label: 'Unverifiable Claims', desc: 'Assertions that cannot be independently confirmed', detection: 'Request documentation; third-party verification' },
                  { flag: 'benchmark_mismatch', label: 'Benchmark Mismatch', desc: 'Claiming exceptional results that far exceed lane norms without explanation', detection: 'Compare to lane benchmarks; flag statistical outliers' },
                  { flag: 'evidence_laundering', label: 'Evidence Laundering', desc: 'Citing self-published or circular sources as independent validation', detection: 'Trace citation chains; require peer-reviewed or third-party sources' },
                  { flag: 'stage_laundering', label: 'Stage Laundering', desc: 'Claiming a more advanced stage than evidence supports', detection: 'Match claimed stage to documented milestones' },
                  { flag: 'governance_theater', label: 'Governance Theater', desc: 'Board exists on paper but has no real oversight function', detection: 'Interview board members; review meeting minutes' }
                ].map((f, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-amber-50 border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-amber-900">{f.label}</span>
                    </div>
                    <p className="text-sm text-amber-800 mb-2">{f.desc}</p>
                    <p className="text-xs text-amber-700"><strong>Detection:</strong> {f.detection}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Human Oversight Requirements" icon={Users}>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3">AI recommendations require human review when:</h4>
                <ul className="space-y-2">
                  {[
                    'Any anti-gaming flag is triggered',
                    'Phase 1 result is UNCERTAIN',
                    'Confidence score is below 60',
                    'Project requests funding above $500K',
                    'Score is within 5 points of a tier boundary',
                    'Human reviewer override was previously applied',
                    'Project involves sensitive sectors (spiritual, governance, conflict)'
                  ].map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          </TabsContent>

          {/* Examples */}
          <TabsContent value="examples" className="space-y-6">
            <Section title="Worked Examples" icon={FileText}>
              <p className="text-slate-700 mb-4">
                These examples illustrate how the evaluation framework applies to different project types.
              </p>
            </Section>

            <ExampleCard 
              title="Example 1: Community Solar Cooperative"
              lane="climate"
              stage="pilot"
              budget="$150,000"
              phase1="PASS"
              baseScore={76}
              riskGrade="B"
              multiplier={0.9}
              finalScore={68}
              tier="incubate_derisk"
              strengths={[
                'Clear environmental benefit (estimated 500 tons CO2e/year)',
                'Strong community ownership model',
                'Experienced technical partner'
              ]}
              weaknesses={[
                'First-time management team',
                'Regulatory approval pending',
                'Limited financial reserves'
              ]}
              conditions={[
                'Secure regulatory approval before second tranche',
                'Hire part-time financial manager',
                'Monthly reporting for first 6 months'
              ]}
            />

            <ExampleCard 
              title="Example 2: Digital Literacy for Refugees"
              lane="technology"
              stage="scaling"
              budget="$80,000"
              phase1="PASS"
              baseScore={82}
              riskGrade="A"
              multiplier={1.0}
              finalScore={82}
              tier="approve_fund"
              strengths={[
                'Proven model with 3 years of data',
                '87% completion rate, 62% employment outcomes',
                'Strong local partnerships in 4 countries',
                'Low cost per beneficiary ($120)'
              ]}
              weaknesses={[
                'Dependent on volunteer instructors',
                'Limited curriculum localization'
              ]}
              conditions={[
                'Develop instructor compensation plan',
                'Submit localization roadmap within 90 days'
              ]}
            />

            <ExampleCard 
              title="Example 3: Activation Chamber Retreat Center"
              lane="spiritual_wellbeing"
              stage="prototype"
              budget="$250,000"
              phase1="FAIL"
              baseScore={null}
              riskGrade={null}
              multiplier={null}
              finalScore={null}
              tier="decline"
              flags={[
                'exclusive_truth: Claims unique access to "activation frequencies"',
                'coercive_payments: Escalating retreat fees ($500 → $2000 → $10000)',
                'isolation_tactics: Retreat requires no outside contact for 10 days',
                'leader_infallibility: Founder presented as "channeling higher beings"'
              ]}
              rationale="Project exhibits 4+ manipulation indicators associated with high-control groups. The business model relies on escalating financial commitments. Claims of unique spiritual access cannot be verified and mirror patterns seen in cultic organizations. Despite stated humanitarian intentions, the structure poses psychological and financial harm risks to participants."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Component helpers
function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-violet-600" />
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }) {
  const colors = {
    violet: 'bg-violet-50 border-violet-200',
    rose: 'bg-rose-50 border-rose-200',
    emerald: 'bg-emerald-50 border-emerald-200'
  };
  return (
    <div className={cn("p-4 rounded-lg border", colors[color])}>
      <Icon className="w-8 h-8 text-slate-600 mb-2" />
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
    </div>
  );
}

function PhaseCard({ number, title, description, icon: Icon, color }) {
  const colors = {
    rose: 'border-rose-200 bg-rose-50',
    violet: 'border-violet-200 bg-violet-50',
    amber: 'border-amber-200 bg-amber-50',
    emerald: 'border-emerald-200 bg-emerald-50'
  };
  return (
    <div className={cn("p-4 rounded-xl border", colors[color])}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-slate-700">
          {number}
        </div>
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
    </div>
  );
}

function ResultCard({ result, title, description }) {
  const colors = {
    pass: 'bg-emerald-50 border-emerald-200',
    uncertain: 'bg-amber-50 border-amber-200',
    fail: 'bg-rose-50 border-rose-200'
  };
  const icons = {
    pass: CheckCircle,
    uncertain: HelpCircle,
    fail: XCircle
  };
  const Icon = icons[result];
  return (
    <div className={cn("p-4 rounded-xl border text-center", colors[result])}>
      <Icon className={cn(
        "w-8 h-8 mx-auto mb-2",
        result === 'pass' && "text-emerald-600",
        result === 'uncertain' && "text-amber-600",
        result === 'fail' && "text-rose-600"
      )} />
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
    </div>
  );
}

function ScoringCategory({ title, weight, color, subcriteria }) {
  const colors = {
    emerald: 'border-emerald-200 bg-emerald-50',
    violet: 'border-violet-200 bg-violet-50',
    blue: 'border-blue-200 bg-blue-50',
    amber: 'border-amber-200 bg-amber-50',
    cyan: 'border-cyan-200 bg-cyan-50'
  };
  return (
    <div className={cn("p-4 rounded-xl border", colors[color])}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <Badge className="bg-white">{weight}% weight</Badge>
      </div>
      <div className="space-y-2">
        {subcriteria.map((sc, i) => (
          <div key={i} className="p-3 rounded-lg bg-white border">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm text-slate-800">{sc.name}</span>
              <Badge variant="outline" className="text-xs">{sc.weight}%</Badge>
            </div>
            <p className="text-xs text-slate-600">{sc.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TierCard({ tier, title, threshold, requirements, actions, color }) {
  const colors = {
    emerald: 'border-emerald-300 bg-emerald-50',
    amber: 'border-amber-300 bg-amber-50',
    blue: 'border-blue-300 bg-blue-50',
    rose: 'border-rose-300 bg-rose-50'
  };
  return (
    <div className={cn("p-4 rounded-xl border-2", colors[color])}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-slate-900">{title}</h3>
        <Badge className="bg-white font-mono">{threshold}</Badge>
      </div>
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1">REQUIREMENTS</div>
          {requirements.map((r, i) => (
            <div key={i} className="text-sm text-slate-700">• {r}</div>
          ))}
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1">ACTIONS</div>
          {actions.map((a, i) => (
            <div key={i} className="text-sm text-slate-700">• {a}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExampleCard({ title, lane, stage, budget, phase1, baseScore, riskGrade, multiplier, finalScore, tier, strengths, weaknesses, conditions, flags, rationale }) {
  const tierConfig = {
    approve_fund: { label: 'Approve & Fund', color: 'emerald' },
    incubate_derisk: { label: 'Incubate & De-Risk', color: 'amber' },
    review_reevaluate: { label: 'Review', color: 'blue' },
    decline: { label: 'Decline', color: 'rose' }
  };
  const tc = tierConfig[tier];

  return (
    <div className="p-6 rounded-xl border bg-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{title}</h3>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline">{lane}</Badge>
            <Badge variant="outline">{stage}</Badge>
            <Badge variant="outline">{budget}</Badge>
          </div>
        </div>
        <Badge className={cn(
          "text-sm",
          tc.color === 'emerald' && "bg-emerald-100 text-emerald-700",
          tc.color === 'amber' && "bg-amber-100 text-amber-700",
          tc.color === 'blue' && "bg-blue-100 text-blue-700",
          tc.color === 'rose' && "bg-rose-100 text-rose-700"
        )}>
          {tc.label}
        </Badge>
      </div>

      {/* Scores (if not declined) */}
      {baseScore !== null && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="p-2 rounded-lg bg-slate-50 text-center">
            <div className="text-xs text-slate-500">Phase 1</div>
            <div className={cn("font-bold", phase1 === 'PASS' ? 'text-emerald-600' : 'text-rose-600')}>{phase1}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 text-center">
            <div className="text-xs text-slate-500">Base Score</div>
            <div className="font-bold text-violet-600">{baseScore}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 text-center">
            <div className="text-xs text-slate-500">Risk × {multiplier}</div>
            <div className="font-bold">{riskGrade}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 text-center">
            <div className="text-xs text-slate-500">Final</div>
            <div className="font-bold text-indigo-600">{finalScore}</div>
          </div>
        </div>
      )}

      {/* Flags for declined */}
      {flags && (
        <div className="mb-4 p-4 rounded-lg bg-rose-50 border border-rose-200">
          <div className="font-medium text-rose-900 mb-2">Phase 1 FAIL - Flags Triggered:</div>
          {flags.map((f, i) => (
            <div key={i} className="text-sm text-rose-800">• {f}</div>
          ))}
        </div>
      )}

      {/* Rationale for declined */}
      {rationale && (
        <div className="mb-4 p-4 rounded-lg bg-slate-50 border">
          <div className="font-medium text-slate-900 mb-2">Rationale:</div>
          <p className="text-sm text-slate-700">{rationale}</p>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      {strengths && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm font-medium text-emerald-700 mb-1">Strengths</div>
            {strengths.map((s, i) => (
              <div key={i} className="text-sm text-slate-700">✓ {s}</div>
            ))}
          </div>
          <div>
            <div className="text-sm font-medium text-amber-700 mb-1">Weaknesses</div>
            {weaknesses.map((w, i) => (
              <div key={i} className="text-sm text-slate-700">⚠ {w}</div>
            ))}
          </div>
        </div>
      )}

      {/* Conditions */}
      {conditions && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="text-sm font-medium text-blue-900 mb-1">Conditions</div>
          {conditions.map((c, i) => (
            <div key={i} className="text-sm text-blue-800">→ {c}</div>
          ))}
        </div>
      )}
    </div>
  );
}