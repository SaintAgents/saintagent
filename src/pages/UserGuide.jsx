import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Sparkles, 
  Coins, 
  Folder, 
  Target, 
  ShoppingBag, 
  Crown,
  Shield,
  Users,
  Calendar,
  Wallet,
  CheckCircle
} from "lucide-react";

export default function UserGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-violet-600" />
            SAINTAGENT Master User Guide
          </h1>
          <p className="text-slate-500 mt-2">Your complete guide to the Social Operating System for Impact</p>
        </div>

        {/* Section 1: Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              1. Introduction & Core Philosophy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <p>
              <strong>SAINTAGENT</strong> is a "Social Operating System for Impact" designed to replace traditional vanity metrics with verified regenerative action.
            </p>
            <p>
              <strong>The Mission:</strong> To accelerate humanitarian and ethical initiatives through AI-assisted coordination.
            </p>
            <p>
              <strong>Gaia Global Gold (GGG):</strong> The native utility currency that represents a tangible measure of value created within the ecosystem.
            </p>
          </CardContent>
        </Card>

        {/* Section 2: Onboarding */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              2. Onboarding: Your Agent Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <p>
              <strong>Command Deck Setup:</strong> Your central hub for tracking Rank (Seeker to Guardian), Reach, and your GGG Balance.
            </p>
            <p>
              <strong>Profile Completion:</strong> You must fill out both your "Skills" and "Mystical Identity." This dual-data approach allows the Synchronicity Engine to find your highest-resonance collaborators.
            </p>
            <p>
              <strong>Mobile Access:</strong> On mobile, use the "My Profile" button at the bottom of the left sidebar for quick navigation to your badges and rank progression.
            </p>
          </CardContent>
        </Card>

        {/* Section 3: GGG Economy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              3. The GGG Economy & Withdrawal Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <p>
              GGG is earned through active participation, mission completion, and marketplace exchanges.
            </p>
            <p>
              <strong>The Withdrawal Threshold:</strong> GGG is convertible to external liquidity once an agent reaches a balance of <Badge className="bg-amber-100 text-amber-700">350.00 GGG</Badge>.
            </p>
            <p>
              <strong>Verification Requirement:</strong> Withdrawal triggers a final "Trust Score" check to ensure all earned GGG was acquired through verified mission evidence.
            </p>
            <p>
              <strong>Wallet Integration:</strong> Once the threshold is met, the "Withdraw" function becomes active in your Wallet dashboard.
            </p>
          </CardContent>
        </Card>

        {/* Section 4: Projects */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-violet-600" />
              4. Projects & The AI Evaluation Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <p>
              Every project submitted undergoes a <strong>4-phase audit</strong> to ensure it is hard to game and anti-grift by design.
            </p>
            <div className="grid gap-3 mt-4">
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="font-semibold text-red-800">Phase 1: Ethical Firewall</p>
                <p className="text-sm text-red-700">Screens for "Hard Stops" like fraud or coercion and "Anti-Cult" indicators like leader infallibility.</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="font-semibold text-blue-800">Phase 2: Quantitative Scoring</p>
                <p className="text-sm text-blue-700">A 0–100 score based on Planetary Well-being (20%), Human Well-being (20%), and Feasibility.</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="font-semibold text-amber-800">Phase 3: Risk Model</p>
                <p className="text-sm text-amber-700">Calculates an Execution Multiplier (0.6x–1.0x) and checks for Harm Gates.</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="font-semibold text-emerald-800">Phase 4: Decision Tiers</p>
                <p className="text-sm text-emerald-700">Routes projects to Approve, Incubate, Review, or Decline.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Missions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              5. Missions: The Call to Action
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <p>
              Missions are <strong>structured units of work</strong> that drive real-world impact.
            </p>
            <p>
              <strong>Browse & Join:</strong> Find missions by Lane (e.g., Food Security, Regenerative Ag) or Region.
            </p>
            <p>
              <strong>Execute Tasks:</strong> Complete assigned tasks and submit Evidence (files, links, or photos).
            </p>
            <p>
              <strong>Verification & Payout:</strong> Once the Leader verifies the evidence, GGG is released from the mission escrow to your wallet.
            </p>
          </CardContent>
        </Card>

        {/* Section 6: Marketplace */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-500" />
              6. Marketplace: Value Exchange
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <p>
              <strong>Offerings:</strong> List your skills (Mentorship, Healing, Consulting) for a GGG price.
            </p>
            <p>
              <strong>Bookings:</strong> Users spend GGG to book your time. The system automatically handles scheduling and payment.
            </p>
            <p>
              <strong>Mutual Aid:</strong> Listings can be set to "Free" to support the community without GGG exchange.
            </p>
          </CardContent>
        </Card>

        {/* Section 7: Leaders */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              7. Leader's Operations & Funding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <p>
              Leaders act as <strong>architects of impact</strong>.
            </p>
            <p>
              <strong>Mission Design:</strong> Creating clear, tractable tasks with milestone-based GGG bounties.
            </p>
            <p>
              <strong>Funding Requests:</strong> For large-scale projects, Leaders can request GGG injections from the platform treasury by proving the "Impact ROI" and "Neglectedness" of the mission.
            </p>
            <p>
              <strong>Audit Log:</strong> All decisions and fund movements are recorded in the Evaluation Audit Log for full transparency.
            </p>
          </CardContent>
        </Card>

        {/* Section 8: Meetings & Connections */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              8. Meetings & Connections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <p>
              Meetings are verified touchpoints that build trust and earn GGG.
            </p>
            <p>
              <strong>Request & Accept:</strong> Send meeting requests to matches or accept incoming requests from collaborators.
            </p>
            <p>
              <strong>Dual Confirmation:</strong> Both parties must confirm meeting completion to trigger GGG rewards—this prevents gaming.
            </p>
            <p>
              <strong>Types:</strong> Collaboration, Mentorship, Consultation, Casual, or Mission-related meetings each serve different purposes.
            </p>
          </CardContent>
        </Card>

        {/* Section 9: Synchronicity Engine */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              9. Synchronicity Engine: AI-Powered Matching
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <p>
              The Synchronicity Engine uses your profile data—skills, intentions, values, spiritual practices, and mystical identifiers—to find <strong>highest-resonance collaborators</strong>.
            </p>
            <p>
              <strong>Match Scoring:</strong> Combines Intent Alignment, Skill Complementarity, Proximity, Timing Readiness, Trust Score, and Spiritual Alignment.
            </p>
            <p>
              <strong>Match Types:</strong> People, Offers, Missions, Events, and Teachers—each category surfaces different opportunities.
            </p>
            <p>
              <strong>Conversation Starters:</strong> AI-generated openers help break the ice based on shared values and complementary skills.
            </p>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-violet-600" />
              Quick Reference: Key Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-2xl font-bold text-amber-600">350</p>
                <p className="text-xs text-slate-500">GGG Withdrawal Threshold</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-2xl font-bold text-violet-600">4</p>
                <p className="text-xs text-slate-500">Project Evaluation Phases</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">0-100</p>
                <p className="text-xs text-slate-500">Project Score Range</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-2xl font-bold text-blue-600">9</p>
                <p className="text-xs text-slate-500">Rank Levels</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}