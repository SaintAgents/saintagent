import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Book, Shield, Brain, AlertTriangle, TrendingUp, Scale, Target,
  CheckCircle, XCircle, HelpCircle, Users, Leaf, Lightbulb, Globe,
  FileText, ChevronRight, Sparkles, BarChart3, Lock, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Book },
  { id: 'phase1', label: 'Phase 1: Ethics', icon: Shield },
  { id: 'phase2', label: 'Phase 2: Scoring', icon: Brain },
  { id: 'phase3', label: 'Phase 3: Risk', icon: AlertTriangle },
  { id: 'phase4', label: 'Phase 4: Decision', icon: TrendingUp },
  { id: 'lanes', label: 'Lane Taxonomy', icon: Target },
  { id: 'stages', label: 'Stage Definitions', icon: BarChart3 },
  { id: 'antigaming', label: 'Anti-Gaming', icon: Lock },
  { id: 'examples', label: 'Worked Examples', icon: FileText }
];

export default function EvaluationDocs() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Book className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Project Evaluation System Documentation
              </h1>
              <p className="text-slate-500">
                Comprehensive guide to the AI-assisted 4-phase evaluation methodology
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-4 sticky top-6">
              <h3 className="font-semibold text-slate-900 mb-3">Contents</h3>
              <nav className="space-y-1">
                {SECTIONS.map(section => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                        activeSection === section.id
                          ? "bg-violet-100 text-violet-700 font-medium"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="bg-white rounded-xl border p-6">
                {activeSection === 'overview' && <OverviewSection />}
                {activeSection === 'phase1' && <Phase1Section />}
                {activeSection === 'phase2' && <Phase2Section />}
                {activeSection === 'phase3' && <Phase3Section />}
                {activeSection === 'phase4' && <Phase4Section />}
                {activeSection === 'lanes' && <LanesSection />}
                {activeSection === 'stages' && <StagesSection />}
                {activeSection === 'antigaming' && <AntiGamingSection />}
                {activeSection === 'examples' && <ExamplesSection />}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-6 pb-4 border-b">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ type = 'info', title, children }) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    danger: 'bg-rose-50 border-rose-200 text-rose-800'
  };

  return (
    <div className={cn("p-4 rounded-lg border mb-4", styles[type])}>
      {title && <h4 className="font-semibold mb-1">{title}</h4>}
      <div className="text-sm">{children}</div>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={Book} title="System Overview" subtitle="Introduction to the evaluation methodology" />
      
      <p className="text-slate-700">
        The Saint Agents Project Evaluation System is a comprehensive, AI-assisted framework designed to assess 
        humanitarian and regenerative projects through a rigorous 4-phase methodology. It combines ethical screening, 
        quantitative scoring, risk modeling, and decision pathways to ensure fair, consistent, and transparent evaluations.
      </p>

      <InfoBox type="info" title="Key Principles">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Capability over credentials</strong> - Evaluate what teams can do, not just their background</li>
          <li><strong>Evidence-based scoring</strong> - All scores require supporting evidence</li>
          <li><strong>Anti-gaming measures</strong> - Built-in detection for manipulation attempts</li>
          <li><strong>Lane & stage awareness</strong> - Context-appropriate benchmarks</li>
          <li><strong>Human oversight</strong> - AI assists, humans decide</li>
        </ul>
      </InfoBox>

      <h3 className="text-lg font-semibold text-slate-900 mt-6">The 4-Phase Pipeline</h3>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <PhaseCard 
          number={1} 
          title="WHY Filter" 
          subtitle="Ethical Firewall"
          description="Binary pass/fail screening for hard stops and manipulation indicators"
          color="rose"
        />
        <PhaseCard 
          number={2} 
          title="Quantitative Scoring" 
          subtitle="Impact & Feasibility"
          description="Weighted multi-criteria assessment with confidence intervals"
          color="violet"
        />
        <PhaseCard 
          number={3} 
          title="Risk Model" 
          subtitle="Execution Assessment"
          description="Risk grade assignment and de-risking pathway identification"
          color="amber"
        />
        <PhaseCard 
          number={4} 
          title="Decision Gateway" 
          subtitle="Final Determination"
          description="Tier assignment and conditional approval pathways"
          color="emerald"
        />
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mt-6">Score Calculation Formula</h3>
      
      <div className="p-4 rounded-lg bg-slate-100 font-mono text-sm">
        <div className="mb-2"><strong>Final Score</strong> = Base Score × Execution Multiplier × Confidence Adjustment</div>
        <div className="text-slate-600">
          <div>• Base Score: Weighted sum of subcriteria (0-100)</div>
          <div>• Execution Multiplier: 0.6 to 1.0 based on risk</div>
          <div>• Confidence Adjustment: Penalty for low-evidence evaluations</div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mt-6">Decision Tiers</h3>
      
      <div className="space-y-2">
        <TierRow tier="approve_fund" label="Approve & Fund" threshold="≥80" requirements="Phase 1 pass, Risk A-C" color="emerald" />
        <TierRow tier="incubate_derisk" label="Incubate & De-Risk" threshold="60-79" requirements="Addressable gaps" color="amber" />
        <TierRow tier="review_reevaluate" label="Review & Re-evaluate" threshold="40-59" requirements="Major info gaps" color="blue" />
        <TierRow tier="decline" label="Decline" threshold="<40 or P1 fail" requirements="Fundamental issues" color="rose" />
      </div>
    </div>
  );
}

function Phase1Section() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={Shield} title="Phase 1: WHY Filter" subtitle="Ethical Firewall & Hard Stop Screening" />
      
      <p className="text-slate-700">
        Phase 1 is a binary pass/fail screening that ensures projects meet fundamental ethical standards before 
        proceeding to detailed evaluation. This phase cannot be bypassed or overridden.
      </p>

      <h3 className="text-lg font-semibold text-slate-900">Hard Stops (Immediate Fail)</h3>
      <p className="text-sm text-slate-600 mb-3">
        Any of these triggers results in automatic failure:
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        {[
          { code: 'fraud', label: 'Fraud or Misrepresentation' },
          { code: 'coercion', label: 'Coercion or Manipulation' },
          { code: 'hate_violence', label: 'Hate or Violence Promotion' },
          { code: 'medical_misinfo', label: 'Medical Misinformation' },
          { code: 'scam', label: 'Scam or Ponzi Structure' },
          { code: 'exploitative_labor', label: 'Exploitative Labor Practices' },
          { code: 'land_rights', label: 'Land Rights Violations' },
          { code: 'data_abuse', label: 'Data Privacy Abuse' },
          { code: 'weapons', label: 'Weapons or Harm Enablement' },
          { code: 'environmental_catastrophe', label: 'Environmental Catastrophe Risk' }
        ].map(item => (
          <div key={item.code} className="flex items-center gap-2 p-2 rounded bg-rose-50 text-rose-700 text-sm">
            <XCircle className="w-4 h-4" />
            {item.label}
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mt-6">Manipulation Indicators</h3>
      <p className="text-sm text-slate-600 mb-3">
        1-2 triggers = UNCERTAIN (needs human review). 3+ triggers = FAIL.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {[
          { code: 'dependency_creation', label: 'Dependency Creation' },
          { code: 'isolation_tactics', label: 'Isolation Tactics' },
          { code: 'exclusive_truth', label: 'Exclusive Truth Claims' },
          { code: 'coercive_payments', label: 'Coercive Payment Structures' },
          { code: 'threat_punishment', label: 'Threat/Punishment Systems' },
          { code: 'sleep_food_control', label: 'Sleep/Food Control' },
          { code: 'mandated_secrecy', label: 'Mandated Secrecy' },
          { code: 'punitive_shaming', label: 'Punitive Shaming' },
          { code: 'love_bombing', label: 'Love Bombing Tactics' },
          { code: 'leader_infallibility', label: 'Leader Infallibility Claims' },
          { code: 'financial_opacity', label: 'Financial Opacity' }
        ].map(item => (
          <div key={item.code} className="flex items-center gap-2 p-2 rounded bg-amber-50 text-amber-700 text-sm">
            <AlertTriangle className="w-4 h-4" />
            {item.label}
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mt-6">Phase 1 Results</h3>
      
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="font-medium text-emerald-800">PASS</div>
            <div className="text-sm text-emerald-600">No hard stops or manipulation indicators detected</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <div>
            <div className="font-medium text-amber-800">UNCERTAIN</div>
            <div className="text-sm text-amber-600">1-2 manipulation indicators OR missing critical information</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-50 border border-rose-200">
          <XCircle className="w-5 h-5 text-rose-600" />
          <div>
            <div className="font-medium text-rose-800">FAIL</div>
            <div className="text-sm text-rose-600">Any hard stop OR 3+ manipulation indicators</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase2Section() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={Brain} title="Phase 2: Quantitative Scoring" subtitle="Multi-Criteria Impact Assessment" />
      
      <p className="text-slate-700">
        Phase 2 evaluates projects across 10 subcriteria grouped into 5 weighted categories. Each subcriterion 
        is scored 1-10 with required rationale and evidence. The system applies lane-specific and stage-specific 
        benchmarks to ensure fair comparison.
      </p>

      <h3 className="text-lg font-semibold text-slate-900">Scoring Categories</h3>
      
      <div className="space-y-4 mt-4">
        <ScoringCategory 
          title="Impact Score" 
          weight={40} 
          color="emerald"
          icon={Leaf}
          subcriteria={[
            { name: 'Planetary Wellbeing', weight: 20, description: 'Environmental impact, regenerative design, ecosystem restoration' },
            { name: 'Human Wellbeing', weight: 20, description: 'Direct benefit to people across flourishing domains (health, agency, belonging, etc.)' }
          ]}
        />
        <ScoringCategory 
          title="Regenerative & Ethical" 
          weight={25} 
          color="violet"
          icon={Scale}
          subcriteria={[
            { name: 'Regenerative Potential', weight: 15, description: 'Circular design, restoration capacity, positive feedback loops' },
            { name: 'Ethical Governance', weight: 10, description: 'Transparency, accountability, consent practices, equity' }
          ]}
        />
        <ScoringCategory 
          title="Feasibility & Sustainability" 
          weight={20} 
          color="blue"
          icon={Target}
          subcriteria={[
            { name: 'Cost Effectiveness', weight: 10, description: 'Cost per outcome, efficient resource use, value for money' },
            { name: 'Scalability & Model', weight: 10, description: 'Sustainability path, scaling potential, business model viability' }
          ]}
        />
        <ScoringCategory 
          title="Team Solidity" 
          weight={10} 
          color="amber"
          icon={Users}
          subcriteria={[
            { name: 'Expertise & Track Record', weight: 5, description: 'Team capability, relevant experience, past performance' },
            { name: 'Community Integration', weight: 5, description: 'Local ownership, dignified partnership, community buy-in' }
          ]}
        />
        <ScoringCategory 
          title="Innovation & Replicability" 
          weight={5} 
          color="cyan"
          icon={Lightbulb}
          subcriteria={[
            { name: 'Innovation', weight: 2, description: 'Novel approaches, creative solutions, breakthrough potential' },
            { name: 'Replicability', weight: 3, description: 'Transfer potential, documentation, adaptability' }
          ]}
        />
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mt-6">Evidence Quality Requirements</h3>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="font-medium text-emerald-800">High Evidence</div>
          <div className="text-xs text-emerald-600 mt-1">Third-party verification, peer review, audited data</div>
        </div>
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="font-medium text-amber-800">Medium Evidence</div>
          <div className="text-xs text-amber-600 mt-1">Self-reported with documentation, testimonials</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="font-medium text-slate-800">Low Evidence</div>
          <div className="text-xs text-slate-600 mt-1">Claims only, no supporting documentation</div>
        </div>
      </div>

      <InfoBox type="warning" title="Confidence Adjustment">
        Low-evidence evaluations receive a confidence penalty that reduces the final score. 
        Confidence below 50% triggers mandatory human review.
      </InfoBox>
    </div>
  );
}

function Phase3Section() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={AlertTriangle} title="Phase 3: Risk Model" subtitle="Execution Risk Assessment & De-risking" />
      
      <p className="text-slate-700">
        Phase 3 assesses execution risks that could prevent a project from achieving its stated impact. 
        It generates a risk grade, execution multiplier, and de-risking plan for projects that need support.
      </p>

      <h3 className="text-lg font-semibold text-slate-900">Risk Dimensions</h3>
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        {[
          { dimension: 'Team Risk', description: 'Key person dependency, skill gaps, capacity constraints' },
          { dimension: 'Technical Risk', description: 'Technology readiness, implementation complexity' },
          { dimension: 'Financial Risk', description: 'Funding uncertainty, burn rate, revenue model' },
          { dimension: 'External Risk', description: 'Regulatory, political, market conditions' },
          { dimension: 'Timeline Risk', description: 'Schedule pressure, milestone feasibility' },
          { dimension: 'Operational Risk', description: 'Supply chain, logistics, partnerships' }
        ].map(item => (
          <div key={item.dimension} className="p-3 rounded-lg border bg-white">
            <div className="font-medium text-slate-900">{item.dimension}</div>
            <div className="text-xs text-slate-500 mt-1">{item.description}</div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mt-6">Risk Grade Scale</h3>
      
      <div className="space-y-2">
        {[
          { grade: 'A', label: 'Minimal Risk', multiplier: '1.0', color: 'emerald' },
          { grade: 'B', label: 'Low Risk', multiplier: '0.95', color: 'green' },
          { grade: 'C', label: 'Moderate Risk', multiplier: '0.85', color: 'amber' },
          { grade: 'D', label: 'High Risk', multiplier: '0.75', color: 'orange' },
          { grade: 'F', label: 'Critical Risk', multiplier: '0.60', color: 'rose' }
        ].map(item => (
          <div key={item.grade} className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            item.color === 'emerald' && "bg-emerald-50 border-emerald-200",
            item.color === 'green' && "bg-green-50 border-green-200",
            item.color === 'amber' && "bg-amber-50 border-amber-200",
            item.color === 'orange' && "bg-orange-50 border-orange-200",
            item.color === 'rose' && "bg-rose-50 border-rose-200"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg",
                item.color === 'emerald' && "bg-emerald-100 text-emerald-700",
                item.color === 'green' && "bg-green-100 text-green-700",
                item.color === 'amber' && "bg-amber-100 text-amber-700",
                item.color === 'orange' && "bg-orange-100 text-orange-700",
                item.color === 'rose' && "bg-rose-100 text-rose-700"
              )}>
                {item.grade}
              </div>
              <div className="font-medium">{item.label}</div>
            </div>
            <div className="text-sm text-slate-600">
              Multiplier: <span className="font-mono">{item.multiplier}×</span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mt-6">Harm Gates</h3>
      <p className="text-sm text-slate-600 mb-3">
        Binary checks that can trigger additional review or automatic fail:
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        {[
          { gate: 'Physical Harm', description: 'Risk of bodily injury to participants or third parties' },
          { gate: 'Psychological Harm', description: 'Mental health risks, trauma potential' },
          { gate: 'Environmental Harm', description: 'Ecosystem damage, pollution, resource depletion' },
          { gate: 'Financial Harm', description: 'Risk of financial loss to participants or investors' }
        ].map(item => (
          <div key={item.gate} className="p-3 rounded-lg border bg-white">
            <div className="font-medium text-slate-900">{item.gate}</div>
            <div className="text-xs text-slate-500 mt-1">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Phase4Section() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={TrendingUp} title="Phase 4: Decision Gateway" subtitle="Final Determination & Conditional Pathways" />
      
      <p className="text-slate-700">
        Phase 4 synthesizes all prior phases into a final decision tier with specific conditions and next steps. 
        The decision is based on final score, Phase 1 result, risk grade, and portfolio considerations.
      </p>

      <h3 className="text-lg font-semibold text-slate-900">Decision Matrix</h3>
      
      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse mt-4">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3 text-left border">Tier</th>
              <th className="p-3 text-left border">Score Range</th>
              <th className="p-3 text-left border">Phase 1</th>
              <th className="p-3 text-left border">Risk Grade</th>
              <th className="p-3 text-left border">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-emerald-50">
              <td className="p-3 border font-medium text-emerald-800">Approve & Fund</td>
              <td className="p-3 border">≥80</td>
              <td className="p-3 border">Pass</td>
              <td className="p-3 border">A, B, or C</td>
              <td className="p-3 border">Proceed to funding</td>
            </tr>
            <tr className="bg-amber-50">
              <td className="p-3 border font-medium text-amber-800">Incubate & De-Risk</td>
              <td className="p-3 border">60-79</td>
              <td className="p-3 border">Pass</td>
              <td className="p-3 border">Any</td>
              <td className="p-3 border">Support program + milestone funding</td>
            </tr>
            <tr className="bg-blue-50">
              <td className="p-3 border font-medium text-blue-800">Review & Re-evaluate</td>
              <td className="p-3 border">40-59</td>
              <td className="p-3 border">Pass/Uncertain</td>
              <td className="p-3 border">Any</td>
              <td className="p-3 border">Request for Information</td>
            </tr>
            <tr className="bg-rose-50">
              <td className="p-3 border font-medium text-rose-800">Decline</td>
              <td className="p-3 border">&lt;40 OR Any</td>
              <td className="p-3 border">Fail</td>
              <td className="p-3 border">D or F</td>
              <td className="p-3 border">Rejection with feedback</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mt-6">Conditional Approval Types</h3>
      
      <div className="space-y-2">
        {[
          { type: 'Milestone-Based', description: 'Funding released in tranches tied to verified achievements' },
          { type: 'Time-Bounded', description: 'Approval valid for specific period, requires renewal' },
          { type: 'Scope-Limited', description: 'Approved for specific activities only' },
          { type: 'Mentorship-Required', description: 'Must engage with assigned mentor/advisor' },
          { type: 'Reporting-Enhanced', description: 'More frequent progress reports required' }
        ].map(item => (
          <div key={item.type} className="flex items-start gap-3 p-3 rounded-lg border bg-white">
            <ChevronRight className="w-4 h-4 text-violet-600 mt-0.5" />
            <div>
              <div className="font-medium text-slate-900">{item.type}</div>
              <div className="text-sm text-slate-500">{item.description}</div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mt-6">Portfolio Optimization</h3>
      
      <InfoBox type="info" title="Portfolio Considerations">
        Final decisions may be adjusted based on portfolio-level factors:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Geographic distribution balance</li>
          <li>Lane/sector diversification</li>
          <li>Stage mix (early vs. mature)</li>
          <li>Risk profile balance</li>
          <li>Strategic priority alignment</li>
        </ul>
      </InfoBox>
    </div>
  );
}

function LanesSection() {
  const lanes = [
    { code: 'regenerative_agriculture', label: 'Regenerative Agriculture', description: 'Soil health, permaculture, agroforestry' },
    { code: 'clean_energy', label: 'Clean Energy', description: 'Renewable energy, efficiency, storage' },
    { code: 'water_systems', label: 'Water Systems', description: 'Clean water access, watershed restoration' },
    { code: 'circular_economy', label: 'Circular Economy', description: 'Waste reduction, upcycling, closed loops' },
    { code: 'ecosystem_restoration', label: 'Ecosystem Restoration', description: 'Habitat repair, rewilding, conservation' },
    { code: 'sustainable_housing', label: 'Sustainable Housing', description: 'Eco-building, affordable housing' },
    { code: 'health_wellbeing', label: 'Health & Wellbeing', description: 'Healthcare access, mental health, nutrition' },
    { code: 'education_capacity', label: 'Education & Capacity', description: 'Skills training, knowledge transfer' },
    { code: 'economic_empowerment', label: 'Economic Empowerment', description: 'Livelihoods, microfinance, cooperatives' },
    { code: 'governance_transparency', label: 'Governance & Transparency', description: 'Civic tech, accountability, participation' },
    { code: 'cultural_preservation', label: 'Cultural Preservation', description: 'Indigenous knowledge, heritage, arts' },
    { code: 'technology_innovation', label: 'Technology & Innovation', description: 'Open source, appropriate tech, R&D' },
    { code: 'food_systems', label: 'Food Systems', description: 'Food security, local food, nutrition' },
    { code: 'transportation', label: 'Transportation', description: 'Clean mobility, logistics, infrastructure' },
    { code: 'biodiversity', label: 'Biodiversity', description: 'Species protection, genetic diversity' }
  ];

  return (
    <div className="space-y-6">
      <SectionTitle icon={Target} title="Lane Taxonomy" subtitle="Sector Classification System" />
      
      <p className="text-slate-700">
        Projects are classified into lanes (sectors) to enable appropriate benchmarking and comparison. 
        Each lane has specific scoring adjustments and benchmark thresholds.
      </p>

      <div className="grid grid-cols-1 gap-2 mt-4">
        {lanes.map(lane => (
          <div key={lane.code} className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-slate-50">
            <div>
              <div className="font-medium text-slate-900">{lane.label}</div>
              <div className="text-xs text-slate-500">{lane.description}</div>
            </div>
            <Badge variant="outline" className="font-mono text-xs">{lane.code}</Badge>
          </div>
        ))}
      </div>

      <InfoBox type="info" title="Multi-Lane Projects">
        Projects can have a primary lane and up to 3 secondary lanes. Scoring uses the primary lane 
        benchmarks with consideration for secondary lane synergies.
      </InfoBox>
    </div>
  );
}

function StagesSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={BarChart3} title="Stage Definitions" subtitle="Project Maturity Classification" />
      
      <p className="text-slate-700">
        Projects are classified by development stage to ensure fair comparison. Earlier-stage projects 
        have adjusted expectations and benchmarks.
      </p>

      <div className="space-y-4 mt-4">
        {[
          { 
            stage: 'idea', 
            label: 'Idea Stage', 
            description: 'Concept only, no implementation yet',
            expectations: ['Clear problem statement', 'Proposed solution concept', 'Target beneficiaries identified'],
            evidenceLevel: 'Low - theoretical basis acceptable'
          },
          { 
            stage: 'prototype', 
            label: 'Prototype', 
            description: 'Early implementation, testing approach',
            expectations: ['Working prototype or pilot design', 'Initial user feedback', 'Basic metrics defined'],
            evidenceLevel: 'Medium - early results acceptable'
          },
          { 
            stage: 'pilot', 
            label: 'Pilot', 
            description: 'Small-scale implementation with results',
            expectations: ['Pilot results documented', 'Lessons learned captured', 'Scale-up plan drafted'],
            evidenceLevel: 'Medium-High - pilot data required'
          },
          { 
            stage: 'scaling', 
            label: 'Scaling', 
            description: 'Expanding proven model',
            expectations: ['Proven impact metrics', 'Replication playbook', 'Sustainable operations'],
            evidenceLevel: 'High - verified results required'
          },
          { 
            stage: 'mature_ops', 
            label: 'Mature Operations', 
            description: 'Established, sustainable operations',
            expectations: ['Multi-year track record', 'Independent verification', 'Financial sustainability'],
            evidenceLevel: 'Very High - third-party validation'
          }
        ].map(item => (
          <div key={item.stage} className="p-4 rounded-xl border bg-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-slate-900">{item.label}</div>
                <div className="text-sm text-slate-500">{item.description}</div>
              </div>
              <Badge className="bg-violet-100 text-violet-700">{item.stage}</Badge>
            </div>
            <div className="mt-3 space-y-2">
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase">Expectations</div>
                <ul className="text-sm text-slate-700 mt-1">
                  {item.expectations.map((exp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5" />
                      {exp}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs font-medium text-slate-500 uppercase">Evidence Level</div>
                <div className="text-sm text-slate-700">{item.evidenceLevel}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AntiGamingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={Lock} title="Anti-Gaming Measures" subtitle="Manipulation Detection & Prevention" />
      
      <p className="text-slate-700">
        The evaluation system includes multiple layers of protection against gaming and manipulation. 
        These measures ensure evaluation integrity while avoiding false positives.
      </p>

      <h3 className="text-lg font-semibold text-slate-900">Detection Patterns</h3>
      
      <div className="space-y-3 mt-4">
        {[
          { 
            flag: 'impact_theater', 
            label: 'Impact Theater',
            description: 'Inflated claims without proportionate evidence; impressive-sounding metrics that don\'t withstand scrutiny',
            indicators: ['Vague beneficiary numbers', 'Unmeasurable outcomes', 'Marketing-speak over substance']
          },
          { 
            flag: 'manipulated_metrics', 
            label: 'Manipulated Metrics',
            description: 'Cherry-picked data, misleading comparisons, or selective reporting',
            indicators: ['Missing baseline data', 'Inconsistent timeframes', 'Only positive outcomes shown']
          },
          { 
            flag: 'charisma_capture', 
            label: 'Charisma Capture',
            description: 'Over-reliance on founder personality rather than systems and team',
            indicators: ['Single spokesperson', 'Personality cult signals', 'No succession planning']
          },
          { 
            flag: 'unverifiable_claims', 
            label: 'Unverifiable Claims',
            description: 'Assertions that cannot be independently confirmed',
            indicators: ['No documentation provided', 'Refused verification requests', 'Circular references']
          },
          { 
            flag: 'benchmark_mismatch', 
            label: 'Benchmark Mismatch',
            description: 'Claiming inappropriate comparisons or standards',
            indicators: ['Wrong sector benchmarks cited', 'Comparing to outliers', 'Stage-inappropriate metrics']
          },
          { 
            flag: 'evidence_laundering', 
            label: 'Evidence Laundering',
            description: 'Using weak evidence to generate appearance of strong evidence',
            indicators: ['Self-citations', 'Paid endorsements', 'Astroturfed testimonials']
          },
          { 
            flag: 'stage_laundering', 
            label: 'Stage Laundering',
            description: 'Misrepresenting project maturity to game expectations',
            indicators: ['Claiming pilot status for ideas', 'Hiding previous failures', 'Rebrand of failed project']
          },
          { 
            flag: 'governance_theater', 
            label: 'Governance Theater',
            description: 'Appearance of good governance without substance',
            indicators: ['Advisory board with no engagement', 'Policies not followed', 'Checkbox compliance']
          }
        ].map(item => (
          <div key={item.flag} className="p-4 rounded-xl border bg-white">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <div className="font-semibold text-slate-900">{item.label}</div>
              <Badge variant="outline" className="font-mono text-xs ml-auto">{item.flag}</Badge>
            </div>
            <p className="text-sm text-slate-600 mb-3">{item.description}</p>
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase mb-1">Indicators</div>
              <ul className="text-xs text-slate-600 space-y-1">
                {item.indicators.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Eye className="w-3 h-3 text-slate-400 mt-0.5" />
                    {ind}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <InfoBox type="warning" title="Flag Response Protocol">
        When anti-gaming flags are triggered:
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Automatic human review is required</li>
          <li>Project owner is notified of concerns (without specifics)</li>
          <li>Additional documentation may be requested</li>
          <li>Pattern matching across portfolio is performed</li>
        </ol>
      </InfoBox>
    </div>
  );
}

function ExamplesSection() {
  return (
    <div className="space-y-6">
      <SectionTitle icon={FileText} title="Worked Examples" subtitle="Illustrative Evaluation Cases" />
      
      <p className="text-slate-700">
        The following examples demonstrate how the evaluation system handles different project types, 
        including edge cases and challenging scenarios.
      </p>

      {/* Example 1: Strong Project */}
      <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200">
        <h3 className="font-semibold text-emerald-800 mb-2">Example 1: Community Solar Cooperative</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-emerald-700">Project Summary</div>
            <p className="text-emerald-600 mt-1">
              Rural solar installation cooperative with 3-year track record, 500 households served, 
              40% energy cost reduction, community ownership model.
            </p>
          </div>
          <div>
            <div className="font-medium text-emerald-700">Evaluation Result</div>
            <div className="mt-1 space-y-1 text-emerald-600">
              <div>Phase 1: <Badge className="bg-emerald-200 text-emerald-800">PASS</Badge></div>
              <div>Base Score: <strong>85</strong></div>
              <div>Risk Grade: <strong>B</strong></div>
              <div>Final Score: <strong>81</strong></div>
              <div>Decision: <Badge className="bg-emerald-200 text-emerald-800">Approve & Fund</Badge></div>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-emerald-200">
          <div className="text-xs font-medium text-emerald-700 uppercase mb-1">Key Factors</div>
          <ul className="text-xs text-emerald-600 space-y-1">
            <li>• Strong evidence: Verified energy savings data, third-party audit</li>
            <li>• Community integration: Local board, member ownership</li>
            <li>• Scalability: Replicable model documented</li>
          </ul>
        </div>
      </div>

      {/* Example 2: Needs Support */}
      <div className="p-4 rounded-xl border bg-amber-50 border-amber-200">
        <h3 className="font-semibold text-amber-800 mb-2">Example 2: Urban Food Forest Initiative</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-amber-700">Project Summary</div>
            <p className="text-amber-600 mt-1">
              First-time team converting vacant lots to food forests. Strong vision, community demand, 
              but limited track record and no financial sustainability plan.
            </p>
          </div>
          <div>
            <div className="font-medium text-amber-700">Evaluation Result</div>
            <div className="mt-1 space-y-1 text-amber-600">
              <div>Phase 1: <Badge className="bg-emerald-200 text-emerald-800">PASS</Badge></div>
              <div>Base Score: <strong>68</strong></div>
              <div>Risk Grade: <strong>C</strong></div>
              <div>Final Score: <strong>58</strong></div>
              <div>Decision: <Badge className="bg-amber-200 text-amber-800">Incubate & De-Risk</Badge></div>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-amber-200">
          <div className="text-xs font-medium text-amber-700 uppercase mb-1">Conditions Applied</div>
          <ul className="text-xs text-amber-600 space-y-1">
            <li>• Mentorship: Assigned to experienced urban agriculture mentor</li>
            <li>• Milestone funding: 30% upfront, 70% on first harvest</li>
            <li>• Required: Business model workshop completion</li>
          </ul>
        </div>
      </div>

      {/* Example 3: Red Flags */}
      <div className="p-4 rounded-xl border bg-rose-50 border-rose-200">
        <h3 className="font-semibold text-rose-800 mb-2">Example 3: The "Activation Chamber" (Edge Case)</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-rose-700">Project Summary</div>
            <p className="text-rose-600 mt-1">
              Spiritual retreat offering "DNA activation" and "quantum healing" with mandatory 
              week-long residential programs, high fees, and aggressive testimonial marketing.
            </p>
          </div>
          <div>
            <div className="font-medium text-rose-700">Evaluation Result</div>
            <div className="mt-1 space-y-1 text-rose-600">
              <div>Phase 1: <Badge className="bg-rose-200 text-rose-800">FAIL</Badge></div>
              <div className="text-xs mt-1">Triggers: medical_misinfo, isolation_tactics, coercive_payments, exclusive_truth, financial_opacity</div>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-rose-200">
          <div className="text-xs font-medium text-rose-700 uppercase mb-1">Analysis</div>
          <ul className="text-xs text-rose-600 space-y-1">
            <li>• Medical misinformation: Unproven health claims</li>
            <li>• Isolation: Remote location, no outside contact during program</li>
            <li>• Coercive payments: Non-refundable fees, upselling pressure</li>
            <li>• Financial opacity: No disclosure of fund usage</li>
          </ul>
        </div>
      </div>

      <InfoBox type="info" title="Continuous Learning">
        The evaluation system incorporates feedback loops:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Calibration projects are periodically re-evaluated to ensure consistency</li>
          <li>Human reviewer feedback improves AI prompts over time</li>
          <li>Funded project outcomes are tracked to validate scoring accuracy</li>
          <li>False positives and negatives are analyzed for system improvement</li>
        </ul>
      </InfoBox>
    </div>
  );
}

// Helper Components

function PhaseCard({ number, title, subtitle, description, color }) {
  const colors = {
    rose: 'border-rose-200 bg-rose-50',
    violet: 'border-violet-200 bg-violet-50',
    amber: 'border-amber-200 bg-amber-50',
    emerald: 'border-emerald-200 bg-emerald-50'
  };

  return (
    <div className={cn("p-4 rounded-xl border", colors[color])}>
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center font-bold",
          color === 'rose' && "bg-rose-200 text-rose-700",
          color === 'violet' && "bg-violet-200 text-violet-700",
          color === 'amber' && "bg-amber-200 text-amber-700",
          color === 'emerald' && "bg-emerald-200 text-emerald-700"
        )}>
          {number}
        </div>
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}

function TierRow({ tier, label, threshold, requirements, color }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border",
      color === 'emerald' && "bg-emerald-50 border-emerald-200",
      color === 'amber' && "bg-amber-50 border-amber-200",
      color === 'blue' && "bg-blue-50 border-blue-200",
      color === 'rose' && "bg-rose-50 border-rose-200"
    )}>
      <div className="font-medium">{label}</div>
      <div className="text-sm text-slate-600">
        <span className="font-mono">{threshold}</span> • {requirements}
      </div>
    </div>
  );
}

function ScoringCategory({ title, weight, color, icon: Icon, subcriteria }) {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-200',
    violet: 'bg-violet-50 border-violet-200',
    blue: 'bg-blue-50 border-blue-200',
    amber: 'bg-amber-50 border-amber-200',
    cyan: 'bg-cyan-50 border-cyan-200'
  };

  return (
    <div className={cn("p-4 rounded-xl border", colors[color])}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <span className="font-semibold text-slate-900">{title}</span>
        </div>
        <Badge className="bg-white">{weight}% weight</Badge>
      </div>
      <div className="space-y-2">
        {subcriteria.map((sub, i) => (
          <div key={i} className="pl-4 border-l-2 border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{sub.name}</span>
              <span className="text-xs text-slate-500">({sub.weight}%)</span>
            </div>
            <p className="text-xs text-slate-500">{sub.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}