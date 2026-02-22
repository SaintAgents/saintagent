import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Building2, Globe, Wallet, FileCheck, 
  Users, TrendingUp, CheckCircle2, ExternalLink,
  Coins, Lock, Database, BarChart3, Target,
  Calendar, AlertCircle, Info, Play, BookOpen, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import GaiaGlobalTreasurySiteClone from '@/components/treasury/GaiaGlobalTreasurySiteClone';

const HERO_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/39cbe3778_universal_upscale_0_670aa858-8e9d-4a5c-b555-2af097ec5967_0.jpg";

const PILLARS = [
  {
    title: 'Office of Currency Control',
    icon: Shield,
    color: 'blue',
    description: 'Governance layer ensuring digital currency issuance is backed by verified collateral with transparent issuance rules and regulatory compliance standards.',
    features: [
      'Verified collateral backing',
      'Transparent issuance rules',
      'Regulatory compliance enforcement',
      'No speculation on backing ratios'
    ]
  },
  {
    title: 'Global Asset Ledger (GAL)',
    icon: Database,
    color: 'emerald',
    description: 'Transparent, immutable registry tracking real-world assets across jurisdictions. Every deed, reserve, title, and patent mapped, verified, and auditable in real-time.',
    features: [
      'Real-time asset tracking',
      'Cross-jurisdiction reconciliation',
      'Immutable audit trails',
      'Reduced settlement friction'
    ]
  },
  {
    title: 'G3DEX (GDCE)',
    icon: Coins,
    color: 'amber',
    description: 'Compliant commodity exchange bridging physical assets with digital titles. Tokenization represents digital title, verified custody, settlement records, and compliant trading.',
    features: [
      'Digital title representation',
      'Verified custody chains',
      'Compliant trading protocols',
      'Prevention of pump-and-dumps'
    ]
  },
  {
    title: 'Distributed Governance',
    icon: Users,
    color: 'purple',
    description: '144,000 verified custodians selected by competency and accountability to provide oversight, dispute resolution, and audit review.',
    features: [
      'Global accountable board',
      'Competency-based selection',
      'Dispute resolution framework',
      'Transparent oversight'
    ]
  }
];

const TIMELINE = [
  { date: 'March 2026', phase: 'Initial Regulatory Compliance', status: 'upcoming', items: [
    'Build ledger architecture',
    'Certify custody workflows',
    'Onboard regulatory interfaces',
    'Operationalize governance selection'
  ]},
  { date: 'Q2 2026', phase: 'Technology Integration', status: 'planned', items: [
    'Blockchain ledger deployment',
    'Smart contract implementation',
    'Digital identity & KYC systems',
    'IoT custody verification'
  ]},
  { date: 'Q3 2026', phase: 'Use Case Rollout', status: 'planned', items: [
    'Tokenized real estate portfolios',
    'Cross-border commodity settlement',
    'Sovereign reserve verification',
    'Compliant stablecoin issuance'
  ]}
];

const USE_CASES = [
  { title: 'Tokenized Real Estate', icon: Building2, description: 'Digital titles for property portfolios with verified custody' },
  { title: 'Commodity Settlement', icon: Coins, description: 'Cross-border settlement of physical commodities with transparent backing' },
  { title: 'Reserve Verification', icon: Lock, description: 'Sovereign reserve auditing and verification systems' },
  { title: 'Stablecoin Compliance', icon: Wallet, description: 'Regulatory-compliant stablecoin issuance with verified collateral' }
];

export default function GaiaGlobalTreasury() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showFullSite, setShowFullSite] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent">
      {/* Hero Section */}
      <div className="page-hero relative h-64 md:h-72 overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Gaia Global Treasury"
          className="hero-image w-full h-full object-cover"
          style={{ filter: 'none', WebkitFilter: 'none' }}
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 hero-content">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Gaia Global Treasury
            </h1>
          </div>
          <p className="text-white/90 text-lg max-w-2xl">
            Transparent infrastructure for verified collateral, regulatory compliance, and global asset reconciliation
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Badge className="bg-emerald-500 text-white">Regulatory Framework</Badge>
            <Badge className="bg-blue-500 text-white">March 2026 Launch</Badge>
            <Badge className="bg-purple-500 text-white">144K Governance</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Video Introduction */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Play className="w-6 h-6 text-violet-600" />
                <div>
                  <h3 className="font-bold text-slate-900">Framework Introduction</h3>
                  <p className="text-sm text-slate-600">Understanding the Gaia Global Treasury Vision</p>
                </div>
              </div>
              <a 
                href="https://youtu.be/igeV4LxrEik" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="bg-red-600 hover:bg-red-700">
                  <Play className="w-4 h-4 mr-2 text-white" />
                  <span className="text-white">Watch Video</span>
                </Button>
              </a>
            </div>
            <p className="text-sm text-slate-600">
              A comprehensive framework for transparent financial infrastructure, regulatory compliance, 
              and global asset coordination through blockchain technology and distributed governance.
            </p>
          </CardContent>
        </Card>

        {/* Mission Statement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-600" />
              Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">
              The Gaia Global Treasury Framework provides the transparency infrastructure that lets regulators 
              and custodians verify what they oversee reliably and at scale. Not through mystical promises, 
              but through systematic technological integration, clear governance, and public auditability.
            </p>
          </CardContent>
        </Card>

        {/* Four Pillars */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-violet-600" />
            Four Core Pillars
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600 border-blue-200',
                emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 text-emerald-600 border-emerald-200',
                amber: 'from-amber-500 to-amber-600 bg-amber-50 text-amber-600 border-amber-200',
                purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600 border-purple-200'
              };
              const [bg, text, border] = colorClasses[pillar.color].split(' ');
              
              return (
                <Card key={pillar.title} className={cn('border-2', border)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center', bg)}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-lg">{pillar.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 text-sm">{pillar.description}</p>
                    <div className="space-y-2">
                      {pillar.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className={cn('w-4 h-4 shrink-0 mt-0.5', text)} />
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-violet-600" />
            Implementation Timeline
          </h2>
          <div className="space-y-4">
            {TIMELINE.map((phase, idx) => (
              <Card key={phase.date} className={cn(
                'border-l-4',
                phase.status === 'upcoming' && 'border-l-emerald-500 bg-emerald-50/50',
                phase.status === 'planned' && 'border-l-blue-500 bg-blue-50/50'
              )}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {phase.phase}
                    </CardTitle>
                    <Badge className={cn(
                      phase.status === 'upcoming' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {phase.date}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {phase.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                          phase.status === 'upcoming' ? 'bg-emerald-500' : 'bg-blue-500'
                        )}>
                          <span className="text-white text-xs font-bold">{i + 1}</span>
                        </div>
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-violet-600" />
            Key Use Cases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map((useCase) => {
              const Icon = useCase.icon;
              return (
                <Card key={useCase.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{useCase.title}</h3>
                    <p className="text-sm text-slate-600">{useCase.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits for Compliance Leaders */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Value for Web3 Compliance Leaders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Faster Audits</h4>
                  <p className="text-sm text-slate-600">Reconcile cross-border collateral in hours, not months</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Lower Compliance Costs</h4>
                  <p className="text-sm text-slate-600">Automated verification reduces manual overhead</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Stronger Evidence Chains</h4>
                  <p className="text-sm text-slate-600">Audit trails regulators trust without endless manual verification</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Fewer Exceptions</h4>
                  <p className="text-sm text-slate-600">Standardized processes reduce edge cases and errors</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-violet-600" />
              Technology Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Core Technologies
                </h4>
                <ul className="space-y-2 text-sm text-slate-600 ml-6">
                  <li>• Blockchain ledgers for immutable records</li>
                  <li>• Smart contracts for conditional settlement</li>
                  <li>• Digital identity and KYC verification</li>
                  <li>• IoT-enabled custody verification</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  Integration Points
                </h4>
                <ul className="space-y-2 text-sm text-slate-600 ml-6">
                  <li>• Regulatory interface APIs</li>
                  <li>• Cross-jurisdiction data feeds</li>
                  <li>• Real-time asset verification</li>
                  <li>• Distributed governance tools</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The World Audit Initiative */}
        <Card className="border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileCheck className="w-6 h-6 text-amber-600" />
              The World Audit Initiative
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4">
              A comprehensive reconciliation of global assets to expose inconsistencies and free up dormant wealth 
              to offset sovereign debt. This systematic audit provides the transparency needed for verified 
              collateral backing and regulatory confidence.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">Asset Mapping</h4>
                <p className="text-sm text-slate-600">Complete registry of global reserves, titles, and holdings</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">Reconciliation</h4>
                <p className="text-sm text-slate-600">Cross-reference and verify asset claims across systems</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">Transparency</h4>
                <p className="text-sm text-slate-600">Public auditability for verified asset backing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Governance Model */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              144,000 Super Council Governance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">
              Governance held by a "Super Council" of 144,000 verified custodians. Membership based on 
              competency, ethical alignment, and accountability rather than traditional power structures.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Selection Criteria</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Verified via SaintAgent.world</li>
                  <li>• Ethical & spiritual alignment</li>
                  <li>• Demonstrated competency</li>
                  <li>• Accountability standards</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Responsibilities</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Oversight & audit review</li>
                  <li>• Dispute resolution</li>
                  <li>• Governance decisions</li>
                  <li>• Compliance enforcement</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Transparency</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Public decision records</li>
                  <li>• Accountable voting</li>
                  <li>• Open governance rules</li>
                  <li>• Community oversight</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-violet-100 to-purple-100 border-violet-300">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Join the Framework Development</h3>
            <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
              If you're a Web3 compliance leader ready to explore detailed framework specifications, 
              integration patterns, and pilot opportunities, engage with the documentation and collaboration hub.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button className="bg-violet-600 hover:bg-violet-700" size="lg">
                <ExternalLink className="w-4 h-4 mr-2 text-white" />
                <span className="text-white">Request Compliance White Paper</span>
              </Button>
              <Button variant="outline" size="lg">
                <FileCheck className="w-4 h-4 mr-2" />
                Propose Pilot Data Feed
              </Button>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Documentation & collaboration available at SaintAgent.world
            </p>
          </CardContent>
        </Card>

        {/* Key Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-900">Transparency First</h3>
              </div>
              <p className="text-sm text-slate-600">
                Public auditability and verified asset backing eliminate speculation and build regulatory trust.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-900">Tech-Driven</h3>
              </div>
              <p className="text-sm text-slate-600">
                Blockchain, smart contracts, and IoT verification create systematic compliance infrastructure.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-900">Distributed Governance</h3>
              </div>
              <p className="text-sm text-slate-600">
                144,000 verified custodians ensure accountability without single-point-of-failure risks.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="border-slate-300 bg-slate-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-600 space-y-2">
                <p>
                  <strong>Important:</strong> The Gaia Global Treasury Framework is a comprehensive regulatory 
                  and compliance infrastructure proposal. This is not about debt forgiveness or magical wealth 
                  redistribution—it's about creating the transparency infrastructure that lets regulators and 
                  custodians verify what they oversee reliably and at scale.
                </p>
                <p>
                  Implementation requires coordination with regulatory bodies, financial institutions, and 
                  international stakeholders. Timeline and features subject to regulatory approval and technical validation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learn More Button */}
        <div className="text-center">
          <Button
            onClick={() => setShowFullSite(!showFullSite)}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-2"
          >
            <BookOpen className="w-5 h-5" />
            {showFullSite ? 'Hide Full Documentation' : 'Learn More - Full Sacred Charter & Documents'}
            <ChevronDown className={cn("w-5 h-5 transition-transform", showFullSite && "rotate-180")} />
          </Button>
        </div>

        {/* Full Site Clone */}
        {showFullSite && (
          <div className="mt-8 -mx-6 md:-mx-0">
            <GaiaGlobalTreasurySiteClone />
          </div>
        )}
      </div>
    </div>
  );
}