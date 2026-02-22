import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, Search, Share2, Coins, Shield, Eye, Lock, Globe,
  ArrowRight, CheckCircle, Star, Sparkles, Network, UserPlus,
  Mail, BarChart3, Zap, Target, Upload, Trash2, Brain, 
  Calendar, Tag, TrendingUp, MessageSquare, BookOpen, Play
} from 'lucide-react';

export default function NetworkHelpModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" style={isDark ? { backgroundColor: '#0f172a', borderColor: '#334155', color: '#e5e7eb' } : {}}>
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
            <BookOpen className="w-6 h-6 text-violet-600" />
            CRM Complete Guide
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1">Everything you need to know about your Contact Network</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="contacts" className="text-xs">Contacts</TabsTrigger>
            <TabsTrigger value="federation" className="text-xs">Federation</TabsTrigger>
            <TabsTrigger value="automation" className="text-xs">Automation</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">AI Tools</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6 mt-0 pr-4">
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
        </TabsContent>

        {/* CONTACTS TAB */}
        <TabsContent value="contacts" className="space-y-6 mt-0 pr-4">
          <div className="help-modal-core bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Managing Your Contacts
            </h3>
            <p className="text-sm text-slate-600 help-modal-text">
              Your private CRM to store, organize, and track all your professional relationships.
            </p>
          </div>

          {/* How to Add Contacts */}
          <div className="help-modal-feature bg-white rounded-lg border p-4">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              How to Add Contacts
            </h4>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge className="bg-violet-100 text-violet-700">1</Badge>
                <div>
                  <strong>Manual Entry:</strong> Click "Add Contact" → Fill in name, email, company, role, and notes.
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge className="bg-violet-100 text-violet-700">2</Badge>
                <div>
                  <strong>CSV Import:</strong> Click "Import CSV" → Upload a spreadsheet with your contacts. Map columns to fields.
                </div>
              </div>
            </div>
          </div>

          {/* Contact Fields */}
          <div className="help-modal-feature bg-white rounded-lg border p-4">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-600" />
              Key Contact Fields
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-slate-50 rounded"><strong>Lead Status:</strong> new, contacted, qualified, proposal, won, lost</div>
              <div className="p-2 bg-slate-50 rounded"><strong>Lead Source:</strong> referral, website, event, cold outreach, etc.</div>
              <div className="p-2 bg-slate-50 rounded"><strong>Domain:</strong> finance, tech, health, education, etc.</div>
              <div className="p-2 bg-slate-50 rounded"><strong>Quality Score:</strong> Auto-calculated based on completeness & activity</div>
              <div className="p-2 bg-slate-50 rounded"><strong>Tags:</strong> Custom labels for filtering</div>
              <div className="p-2 bg-slate-50 rounded"><strong>Follow-up Date:</strong> Set reminders for next action</div>
            </div>
          </div>

          {/* Tools */}
          <div className="help-modal-feature bg-white rounded-lg border p-4">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              Contact Tools
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                <Trash2 className="w-4 h-4 text-rose-500 mt-0.5" />
                <div><strong>Cleanup:</strong> Find & remove duplicates, incomplete records</div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                <Brain className="w-4 h-4 text-violet-500 mt-0.5" />
                <div><strong>Enrich:</strong> AI fills in missing company/role info</div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                <Target className="w-4 h-4 text-amber-500 mt-0.5" />
                <div><strong>Scoring:</strong> Auto-score contacts by quality</div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                <Calendar className="w-4 h-4 text-blue-500 mt-0.5" />
                <div><strong>Follow-ups:</strong> See overdue reminders in panel</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* FEDERATION TAB */}
        <TabsContent value="federation" className="space-y-6 mt-0 pr-4">
          <div className="help-modal-core bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              Federated Network
            </h3>
            <p className="text-sm text-slate-600 help-modal-text">
              Share select contacts with the community to help others find warm introductions—and earn GGG rewards.
            </p>
          </div>

          {/* Permission Levels */}
          <div className="help-modal-section bg-slate-50 rounded-xl p-5 border">
            <h3 className="font-semibold text-slate-900 mb-3">Permission Levels</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="help-modal-card bg-white rounded-lg p-3 border text-center">
                <Lock className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                <div className="text-sm font-medium">Private</div>
                <div className="text-xs text-slate-500">Only you can see</div>
              </div>
              <div className="help-modal-card bg-white rounded-lg p-3 border text-center">
                <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <div className="text-sm font-medium">Signal Only</div>
                <div className="text-xs text-slate-500">Shows you know someone in X field</div>
              </div>
              <div className="help-modal-card bg-white rounded-lg p-3 border text-center">
                <UserPlus className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <div className="text-sm font-medium">Masked</div>
                <div className="text-xs text-slate-500">Role & domain, no name</div>
              </div>
              <div className="help-modal-card bg-white rounded-lg p-3 border text-center">
                <Globe className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <div className="text-sm font-medium">Shared</div>
                <div className="text-xs text-slate-500">Full profile visible</div>
              </div>
            </div>
          </div>

          {/* How to Federate */}
          <div className="help-modal-feature bg-white rounded-lg border p-4">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-600" />
              How to Federate Contacts
            </h4>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge className="bg-emerald-100 text-emerald-700">1</Badge>
                <div><strong>Single:</strong> Open a contact → Toggle "Federate" → Choose permission level</div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge className="bg-emerald-100 text-emerald-700">2</Badge>
                <div><strong>Batch:</strong> Click "Batch Federate" → Select multiple contacts → Apply permissions</div>
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="help-modal-value-emerald bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
            <h4 className="font-medium text-emerald-800 mb-2 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              GGG Rewards
            </h4>
            <ul className="text-sm text-slate-600 help-modal-text space-y-1">
              <li>• <strong>+5 GGG</strong> for each contact you federate</li>
              <li>• <strong>+10 GGG</strong> when someone requests an intro through your contact</li>
              <li>• <strong>+25 GGG</strong> for successful introductions that lead to meetings</li>
            </ul>
          </div>
        </TabsContent>

        {/* AUTOMATION TAB */}
        <TabsContent value="automation" className="space-y-6 mt-0 pr-4">
          <div className="help-modal-core bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              Automated Follow-Up Sequences
            </h3>
            <p className="text-sm text-slate-600 help-modal-text">
              Set up workflows that automatically send emails, update statuses, and remind you based on lead behavior.
            </p>
          </div>

          {/* How to Create */}
          <div className="help-modal-feature bg-white rounded-lg border p-4">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600" />
              Creating a Workflow
            </h4>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge className="bg-amber-100 text-amber-700">1</Badge>
                <div>Go to <strong>CRM → Automations</strong> tab → Click "New Workflow"</div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge className="bg-amber-100 text-amber-700">2</Badge>
                <div><strong>Set a Trigger:</strong> Days since contact, status change, score change, or tag added</div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge className="bg-amber-100 text-amber-700">3</Badge>
                <div><strong>Add Actions:</strong> Send email, wait X hours, update status</div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge className="bg-amber-100 text-amber-700">4</Badge>
                <div><strong>Activate:</strong> Toggle the workflow on—it runs automatically!</div>
              </div>
            </div>
          </div>

          {/* Trigger Types */}
          <div className="help-modal-feature bg-white rounded-lg border p-4">
            <h4 className="font-medium text-slate-900 mb-3">Available Triggers</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-500 mb-1" />
                <strong>Days Since Contact</strong>
                <p className="text-xs text-slate-500">Trigger after X days without activity</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
                <strong>Status Change</strong>
                <p className="text-xs text-slate-500">When lead moves to a specific status</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <Target className="w-4 h-4 text-amber-500 mb-1" />
                <strong>Score Change</strong>
                <p className="text-xs text-slate-500">When quality score crosses threshold</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <Tag className="w-4 h-4 text-violet-500 mb-1" />
                <strong>Tag Added</strong>
                <p className="text-xs text-slate-500">When a specific tag is applied</p>
              </div>
            </div>
          </div>

          {/* Email Actions */}
          <div className="help-modal-value-violet bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-100">
            <h4 className="font-medium text-violet-800 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Actions
            </h4>
            <ul className="text-sm text-slate-600 help-modal-text space-y-1">
              <li>• Use templates: Intro, Follow-Up, Meeting Request, Value Proposition</li>
              <li>• Or click <strong>"AI Generate"</strong> to create personalized emails</li>
              <li>• Use placeholders: <code>{"{{first_name}}"}</code>, <code>{"{{company}}"}</code></li>
            </ul>
          </div>
        </TabsContent>

        {/* AI TAB */}
        <TabsContent value="ai" className="space-y-6 mt-0 pr-4">
          <div className="help-modal-core bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-100">
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              AI-Powered Tools
            </h3>
            <p className="text-sm text-slate-600 help-modal-text">
              Use AI to write emails, analyze deals, get recommendations, and save hours of manual work.
            </p>
          </div>

          {/* AI Assistant */}
          <div className="help-modal-feature bg-white rounded-lg border p-4">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-600" />
              AI Assistant (CRM → AI Assistant tab)
            </h4>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Ask anything about your contacts or get help with:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-violet-50 rounded flex items-center gap-2">
                  <Mail className="w-4 h-4 text-violet-500" />
                  Compose emails
                </div>
                <div className="p-2 bg-violet-50 rounded flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-500" />
                  Follow-up ideas
                </div>
                <div className="p-2 bg-violet-50 rounded flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-500" />
                  Qualify leads
                </div>
                <div className="p-2 bg-violet-50 rounded flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-500" />
                  Outreach strategies
                </div>
              </div>
            </div>
          </div>

          {/* AI Deal Prediction */}
          <div className="help-modal-feature bg-white rounded-lg border p-4">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              AI Deal Prediction (Analytics → AI Predictions)
            </h4>
            <div className="text-sm text-slate-600 space-y-2">
              <p>Get ML-style analysis of your deals:</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Win probability scores based on stage, age, contact quality
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Pipeline health summary
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  At-risk deal alerts with recommendations
                </li>
              </ul>
            </div>
          </div>

          {/* AI Email Generation */}
          <div className="help-modal-feature bg-white rounded-lg border p-4">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              AI Email Generation
            </h4>
            <div className="text-sm text-slate-600 space-y-2">
              <p>Available in:</p>
              <ul className="space-y-1">
                <li>• <strong>Contact Detail → Email Outreach:</strong> Generate personalized emails based on contact info</li>
                <li>• <strong>Automation Workflows:</strong> Click "AI Generate" when adding email actions</li>
                <li>• <strong>AI Assistant:</strong> Ask "Write an email to [contact]"</li>
              </ul>
            </div>
          </div>

          {/* Contact Enrichment */}
          <div className="help-modal-value-violet bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-100">
            <h4 className="font-medium text-violet-800 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Contact Enrichment
            </h4>
            <ul className="text-sm text-slate-600 help-modal-text space-y-1">
              <li>• Click "Enrich" in the contact summary header</li>
              <li>• AI fills in missing company info, roles, and domains</li>
              <li>• Works best when you have email or company name</li>
            </ul>
          </div>
        </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}