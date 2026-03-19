import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, Users, Shield, Sparkles, Coins, 
  FileCheck, ArrowRight, Target, Scale, Gem
} from 'lucide-react';

const SECTIONS = [
  {
    icon: TrendingUp,
    title: 'What is Deal Maker?',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    text: 'Deal Maker is the platform\'s deal origination and execution engine. Saint Agents bring deals — acquisitions, purchases, partnerships, gold buys, asset plays — to the platform for review, approval, and execution by the 144K leadership network.'
  },
  {
    icon: Users,
    title: 'Who Can Submit Deals?',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    text: 'Any Saint Agent can submit a deal for consideration. Deals enter the pipeline in "Pending Approval" status. 144K Leaders with deal-closer authority review, approve, assign, and move deals through the pipeline stages.'
  },
  {
    icon: Shield,
    title: 'Deal Approval & Assignment',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    text: 'Submitted deals go through a multi-stage approval process: Due Diligence → Negotiation → Agreement Drafting → Awaiting Execution → Complete/Funding Review. Admins and authorized closers can assign deals to specialists, add team members, and manage stage transitions.'
  },
  {
    icon: Sparkles,
    title: 'AI Synergy Analysis',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    text: 'Our AI engine analyzes incoming deals for synergy and synchronicity with the platform\'s mission and existing portfolio. High-alignment deals are surfaced to the top of the admin dashboard, flagging opportunities that resonate with the collective vision.'
  },
  {
    icon: Coins,
    title: 'Commissions & Rewards',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    text: 'Saint Agents earn a 10% commission on successfully closed and funded deals. Commissions are tracked automatically and paid through the platform\'s GGG economy. Introducers who connect deal originators also receive referral rewards.'
  },
  {
    icon: Gem,
    title: 'Gold, Assets & Neo-NFT Routing',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    text: 'Some deals — gold purchases, mineral rights, real estate — may be routed through the Neo-NFT provenance system for transparent tracking, verification, and fractional ownership. This ensures full audit trails on high-value acquisitions.'
  },
  {
    icon: Scale,
    title: 'Deal Categories',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    text: 'Deals span multiple sectors: Gold/Vault, Oil & Energy, Bonds, Banking, Sovereign Instruments, Minerals, Diamonds, AI/Tech, Telecom, Water, Housing, MedTech, and Space. Each category has specialized review criteria and dedicated closers.'
  },
  {
    icon: FileCheck,
    title: 'Pipeline Stages',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    items: [
      { label: 'Due Diligence', desc: 'Initial research, vetting, and feasibility assessment' },
      { label: 'Negotiation', desc: 'Terms discussion, counterparty engagement' },
      { label: 'Agreement Drafting', desc: 'Legal documents, contracts, and structures' },
      { label: 'Awaiting Execution', desc: 'Signatures, funding arrangements, final approvals' },
      { label: 'Complete → Funding Review', desc: 'Deal closed, enters project tracking or funding pipeline' },
    ]
  },
];

export default function DealMakerInfoModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-cyan-500" />
            About Deal Maker
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[65vh] px-6 pb-6">
          <div className="space-y-4 pt-4">
            {SECTIONS.map((section, i) => {
              const Icon = section.icon;
              return (
                <div key={i} className={`${section.bg} rounded-lg p-4 border border-white/5`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-black/20 shrink-0`}>
                      <Icon className={`w-5 h-5 ${section.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">{section.title}</h3>
                      {section.text && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{section.text}</p>
                      )}
                      {section.items && (
                        <div className="space-y-2 mt-2">
                          {section.items.map((item, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <ArrowRight className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400"> — {item.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-lg p-4 border border-cyan-500/20 mt-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 text-center leading-relaxed">
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">Ready to bring a deal?</span> Click "New Deal" to submit an opportunity. 
                Your deal will be reviewed by the 144K leadership team for approval, assignment, and execution.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}