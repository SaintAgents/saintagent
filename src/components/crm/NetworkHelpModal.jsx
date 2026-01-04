import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Search, Share2, Coins, Shield, Eye, Lock, Globe,
  ArrowRight, CheckCircle, Star, Sparkles, Network, UserPlus
} from 'lucide-react';

export default function NetworkHelpModal({ open, onClose }) {
  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" style={isDark ? { backgroundColor: '#0f172a', borderColor: '#334155', color: '#e5e7eb' } : {}}>
        <style>{`
          [data-theme='dark'] [data-radix-dialog-content] {
            background-color: #0f172a !important;
            border-color: #334155 !important;
            color: #e5e7eb !important;
          }
          [data-theme='dark'] .help-modal-core {
            background: linear-gradient(to right, rgba(91, 33, 182, 0.3), rgba(126, 34, 206, 0.3)) !important;
            border-color: #5b21b6 !important;
          }
          [data-theme='dark'] .help-modal-core h3,
          [data-theme='dark'] .help-modal-title {
            color: #ffffff !important;
          }
          [data-theme='dark'] .help-modal-core p,
          [data-theme='dark'] .help-modal-text {
            color: #cbd5e1 !important;
          }
          [data-theme='dark'] .help-modal-feature {
            background-color: #1e293b !important;
            border-color: #334155 !important;
          }
          [data-theme='dark'] .help-modal-feature h4 {
            color: #f1f5f9 !important;
          }
          [data-theme='dark'] .help-modal-section {
            background-color: #1e293b !important;
            border-color: #334155 !important;
          }
          [data-theme='dark'] .help-modal-section h3 {
            color: #f1f5f9 !important;
          }
          [data-theme='dark'] .help-modal-card {
            background-color: #334155 !important;
            border-color: #475569 !important;
          }
          [data-theme='dark'] .help-modal-card .font-medium {
            color: #f1f5f9 !important;
          }
          [data-theme='dark'] .help-modal-card .text-xs {
            color: #94a3b8 !important;
          }
          [data-theme='dark'] .help-modal-value-violet {
            background: linear-gradient(to bottom right, rgba(91, 33, 182, 0.4), rgba(126, 34, 206, 0.4)) !important;
            border-color: #6d28d9 !important;
          }
          [data-theme='dark'] .help-modal-value-violet h4 {
            color: #c4b5fd !important;
          }
          [data-theme='dark'] .help-modal-value-emerald {
            background: linear-gradient(to bottom right, rgba(6, 95, 70, 0.4), rgba(20, 184, 166, 0.4)) !important;
            border-color: #059669 !important;
          }
          [data-theme='dark'] .help-modal-value-emerald h4 {
            color: #6ee7b7 !important;
          }
          [data-theme='dark'] .help-modal-footer {
            background-color: #1e293b !important;
          }
          [data-theme='dark'] .help-modal-footer strong {
            color: #f1f5f9 !important;
          }
        `}</style>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl help-modal-title">
            <Network className="w-6 h-6 text-violet-600" />
            Network Introduction Platform
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Core Idea */}
          <div className="help-modal-core bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-100">
            <h3 className="font-semibold text-slate-900 mb-2">Core Idea</h3>
            <p className="text-sm text-slate-600 help-modal-text">
              A platform that enables people to leverage their networks for introductions by searching others' 
              notes about people they know, requesting introductions through mutual connections, and earning 
              GGG rewards for facilitating connections—all while maintaining privacy and curation of shared network information.
            </p>
          </div>

          {/* Key Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 help-modal-title flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Key Features
            </h3>

            {/* Feature 1 */}
            <div className="help-modal-feature bg-white rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">1. Network Knowledge Base</h4>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600 help-modal-text">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Maintain private notes about people in your network
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Selectively share sanitized/curated portions for discovery
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Tags: expertise, location, industry, interests, availability
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="help-modal-feature bg-white rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-violet-100">
                  <Search className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">2. Search & Discovery</h4>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600 help-modal-text">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Search across shared network notes (not full access)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Find: "Who knows a Series A investor in climate tech?"
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Results show: connection path, context, introduction feasibility
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="help-modal-feature bg-white rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Share2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">3. Introduction Flow</h4>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="outline">Requester finds connection</Badge>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <Badge variant="outline">Sends intro request</Badge>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <Badge variant="outline">Connector reviews</Badge>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <Badge className="bg-emerald-100 text-emerald-700">Both consent</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="help-modal-feature bg-white rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">4. GGG Token Economy</h4>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600 help-modal-text">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Earn GGG for successful introductions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Stake GGG to access premium search features
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Reputation system: quality intros = higher rewards
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Prevents spam through token requirements
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="help-modal-feature bg-white rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-100">
                  <Shield className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">5. Privacy & Security</h4>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600 help-modal-text">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Granular control over what's searchable
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Encryption of full notes; only metadata shared
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Opt-in for each person in your network
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Revocable access at any time
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Permission Levels */}
          <div className="help-modal-section bg-slate-50 rounded-xl p-5 border">
            <h3 className="font-semibold text-slate-900 mb-3">Permission Levels</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="help-modal-card bg-white rounded-lg p-3 border text-center">
                <Lock className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                <div className="text-sm font-medium">Private</div>
                <div className="text-xs text-slate-500">Not shared</div>
              </div>
              <div className="help-modal-card bg-white rounded-lg p-3 border text-center">
                <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <div className="text-sm font-medium">Signal Only</div>
                <div className="text-xs text-slate-500">Existence + strength</div>
              </div>
              <div className="help-modal-card bg-white rounded-lg p-3 border text-center">
                <UserPlus className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <div className="text-sm font-medium">Masked</div>
                <div className="text-xs text-slate-500">Role/domain only</div>
              </div>
              <div className="help-modal-card bg-white rounded-lg p-3 border text-center">
                <Globe className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <div className="text-sm font-medium">Shared</div>
                <div className="text-xs text-slate-500">Full details</div>
              </div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 help-modal-title flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Value Proposition
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="help-modal-value-violet bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-100">
                <h4 className="font-medium text-violet-800 mb-2">For Connectors</h4>
                <ul className="text-sm text-slate-600 help-modal-text space-y-1">
                  <li>• Monetize your network without spam</li>
                  <li>• Maintain full control</li>
                  <li>• Build reputation through quality</li>
                </ul>
              </div>
              
              <div className="help-modal-value-emerald bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                <h4 className="font-medium text-emerald-800 mb-2">For Seekers</h4>
                <ul className="text-sm text-slate-600 help-modal-text space-y-1">
                  <li>• Access warm introductions at scale</li>
                  <li>• Transparent connection paths</li>
                  <li>• Quality-gated requests</li>
                </ul>
              </div>
            </div>

            <div className="help-modal-footer bg-slate-100 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600 help-modal-text">
                <strong>vs. LinkedIn:</strong> More curated, incentive-aligned, focuses on quality intros not broadcasting
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}