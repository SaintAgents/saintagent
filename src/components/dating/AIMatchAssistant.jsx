import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, Send, MessageCircle, Lightbulb, Target, 
  Heart, TrendingUp, AlertCircle, ChevronRight, X,
  RefreshCw, User, Zap, Shield, Home, MessageSquare,
  Copy, Check, Pencil, UserPlus, Star, ArrowUp,
  ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import RankedAvatar from '@/components/reputation/RankedAvatar';

const suggestedQuestions = [
  { icon: Target, text: "Why am I not getting high compatibility matches?", category: "matches" },
  { icon: Heart, text: "How can I improve my chances with someone who values honesty?", category: "tips" },
  { icon: TrendingUp, text: "What should I add to my profile to attract better matches?", category: "profile" },
  { icon: AlertCircle, text: "Why did my match score drop with a specific person?", category: "analysis" },
  { icon: Lightbulb, text: "What conversation starters work best for my personality type?", category: "tips" },
  { icon: User, text: "What attachment styles am I most compatible with?", category: "compatibility" }
];

// Domain definitions for compatibility breakdown
const COMPATIBILITY_DOMAINS = [
  { key: 'identity_values', label: 'Values & Identity', icon: Heart, color: 'from-pink-500 to-rose-500', weight: 0.30 },
  { key: 'emotional_stability', label: 'Emotional Style', icon: Shield, color: 'from-purple-500 to-violet-500', weight: 0.25 },
  { key: 'communication', label: 'Communication', icon: MessageSquare, color: 'from-blue-500 to-cyan-500', weight: 0.20 },
  { key: 'growth', label: 'Growth Orientation', icon: TrendingUp, color: 'from-emerald-500 to-teal-500', weight: 0.15 },
  { key: 'lifestyle', label: 'Lifestyle Fit', icon: Home, color: 'from-amber-500 to-orange-500', weight: 0.10 }
];

// Icebreaker message component
function IcebreakerGenerator({ myProfile, myDatingProfile, matchProfile, matchDatingProfile }) {
  const [icebreakers, setIcebreakers] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('friendly');

  const messageStyles = [
    { value: 'friendly', label: 'Friendly & Warm', emoji: '😊' },
    { value: 'witty', label: 'Witty & Playful', emoji: '😄' },
    { value: 'deep', label: 'Deep & Thoughtful', emoji: '🤔' },
    { value: 'curious', label: 'Curious & Engaging', emoji: '✨' }
  ];

  const generateIcebreakers = async () => {
    setIsGenerating(true);
    try {
      const sharedValues = findSharedItems(
        myDatingProfile?.core_values_ranked || myProfile?.values_tags || [],
        matchDatingProfile?.core_values_ranked || matchProfile?.values_tags || []
      );
      const sharedInterests = findSharedItems(
        myProfile?.skills || [],
        matchProfile?.skills || []
      );
      const sharedPractices = findSharedItems(
        myProfile?.spiritual_practices || [],
        matchProfile?.spiritual_practices || []
      );

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 personalized icebreaker messages for a dating app conversation.

MY PROFILE:
- Name: ${myProfile?.display_name || 'User'}
- Values: ${(myDatingProfile?.core_values_ranked || myProfile?.values_tags || []).join(', ') || 'Not specified'}
- Interests/Skills: ${(myProfile?.skills || []).join(', ') || 'Not specified'}
- Spiritual Practices: ${(myProfile?.spiritual_practices || []).join(', ') || 'Not specified'}
- Communication Style: ${myProfile?.communication_style || myDatingProfile?.comm_depth || 'balanced'}
- Bio: ${myProfile?.bio || 'Not specified'}

MATCH PROFILE:
- Name: ${matchProfile?.display_name || 'Match'}
- Values: ${(matchDatingProfile?.core_values_ranked || matchProfile?.values_tags || []).join(', ') || 'Not specified'}
- Interests/Skills: ${(matchProfile?.skills || []).join(', ') || 'Not specified'}
- Spiritual Practices: ${(matchProfile?.spiritual_practices || []).join(', ') || 'Not specified'}
- Bio: ${matchProfile?.bio || 'Not specified'}
- Seeking: ${matchDatingProfile?.seeking || matchProfile?.relationship_type_seeking?.join(', ') || 'Not specified'}

SHARED CONNECTIONS:
- Shared Values: ${sharedValues.join(', ') || 'None identified'}
- Shared Interests: ${sharedInterests.join(', ') || 'None identified'}
- Shared Practices: ${sharedPractices.join(', ') || 'None identified'}

MESSAGE STYLE: ${selectedStyle}
${selectedStyle === 'friendly' ? 'Warm, approachable, genuine tone' : ''}
${selectedStyle === 'witty' ? 'Playful, clever, includes light humor' : ''}
${selectedStyle === 'deep' ? 'Thoughtful, meaningful, philosophical' : ''}
${selectedStyle === 'curious' ? 'Asking engaging questions, showing genuine interest' : ''}

REQUIREMENTS:
- Each message should be 1-3 sentences
- Reference specific shared values/interests when possible
- Be authentic and not generic
- Avoid cheesy pickup lines
- Include a conversation hook or question
- Make it easy for them to respond`,
        response_json_schema: {
          type: "object",
          properties: {
            icebreakers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  hook: { type: "string", description: "What shared interest/value this references" },
                  tone: { type: "string" }
                }
              }
            }
          }
        }
      });

      setIcebreakers(response.icebreakers || []);
    } catch (error) {
      console.error('Failed to generate icebreakers:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-slate-600">Message style:</span>
        {messageStyles.map(style => (
          <button
            key={style.value}
            onClick={() => setSelectedStyle(style.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              selectedStyle === style.value
                ? "bg-violet-100 text-violet-700 border-2 border-violet-300"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent"
            )}
          >
            {style.emoji} {style.label}
          </button>
        ))}
      </div>

      <Button
        onClick={generateIcebreakers}
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-violet-500 to-rose-500 hover:from-violet-600 hover:to-rose-600 gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Crafting messages...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Icebreakers
          </>
        )}
      </Button>

      {icebreakers.length > 0 && (
        <div className="space-y-3">
          {icebreakers.map((ib, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-rose-50 border border-violet-100">
              <p className="text-sm text-slate-800 mb-2">{ib.message}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-violet-600 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  {ib.hook}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1.5 text-xs"
                  onClick={() => copyToClipboard(ib.message, idx)}
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check className="w-3 h-3 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Profile improvement suggestions component
function ProfileImprovements({ myProfile, myDatingProfile }) {
  const [suggestions, setSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const analyzeProfile = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this dating profile and provide specific, actionable suggestions for improvement.

PROFILE DATA:
- Display Name: ${myProfile?.display_name || 'Not set'}
- Bio: ${myProfile?.bio || 'Not set'}
- Location: ${myProfile?.location || myProfile?.region || 'Not set'}
- Values: ${(myDatingProfile?.core_values_ranked || myProfile?.values_tags || []).join(', ') || 'Not set'}
- Life Priorities: ${(myDatingProfile?.life_priorities || []).join(', ') || 'Not set'}
- Dealbreakers: ${(myDatingProfile?.dealbreakers || []).join(', ') || 'Not set'}
- Seeking: ${myDatingProfile?.seeking || (myProfile?.relationship_type_seeking || []).join(', ') || 'Not specified'}
- Communication Style: ${myProfile?.communication_style || 'Not set'}
- Comm Depth Preference: ${myDatingProfile?.comm_depth || 'Not set'}
- Comm Frequency: ${myDatingProfile?.comm_frequency || 'Not set'}
- Attachment/Regulation Style: ${myDatingProfile?.regulation_style || 'Not set'}
- Conflict Response: ${myDatingProfile?.conflict_response || 'Not set'}
- Growth Orientation: ${myDatingProfile?.growth_orientation || 'Not set'}
- Spiritual Practices: ${(myProfile?.spiritual_practices || []).join(', ') || 'Not set'}
- Skills: ${(myProfile?.skills || []).join(', ') || 'Not set'}
- Avatar: ${myProfile?.avatar_url ? 'Set' : 'Not set'}
- Gallery Photos: ${(myProfile?.gallery_images || []).length} photos

Analyze completeness and quality. Provide specific improvements for each category.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number", description: "Profile completeness score 0-100" },
            overall_summary: { type: "string", description: "Brief overall assessment" },
            categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  score: { type: "number" },
                  status: { type: "string", enum: ["excellent", "good", "needs_work", "missing"] },
                  current: { type: "string", description: "What they currently have" },
                  suggestions: { type: "array", items: { type: "string" } },
                  impact: { type: "string", description: "How improving this affects matches" }
                }
              }
            },
            quick_wins: {
              type: "array",
              items: { type: "string" },
              description: "3 easiest high-impact improvements"
            },
            match_potential_boost: { type: "string", description: "Estimated improvement if suggestions followed" }
          }
        }
      });

      setSuggestions(response);
    } catch (error) {
      console.error('Failed to analyze profile:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const statusColors = {
    excellent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    good: 'bg-blue-100 text-blue-700 border-blue-200',
    needs_work: 'bg-amber-100 text-amber-700 border-amber-200',
    missing: 'bg-red-100 text-red-700 border-red-200'
  };

  const statusIcons = {
    excellent: <Check className="w-3 h-3" />,
    good: <ArrowUp className="w-3 h-3" />,
    needs_work: <Pencil className="w-3 h-3" />,
    missing: <AlertCircle className="w-3 h-3" />
  };

  return (
    <div className="space-y-4">
      {!suggestions ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Profile Optimization</h3>
          <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
            Get AI-powered suggestions to improve your profile and attract better matches.
          </p>
          <Button
            onClick={analyzeProfile}
            disabled={isAnalyzing}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze My Profile
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overall Score */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-emerald-50 border border-violet-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Profile Score</span>
              <span className="text-2xl font-bold text-violet-700">{suggestions.overall_score}%</span>
            </div>
            <Progress value={suggestions.overall_score} className="h-2 mb-3" />
            <p className="text-sm text-slate-600">{suggestions.overall_summary}</p>
            {suggestions.match_potential_boost && (
              <div className="mt-3 p-2 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {suggestions.match_potential_boost}
              </div>
            )}
          </div>

          {/* Quick Wins */}
          {suggestions.quick_wins?.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Wins
              </h4>
              <ul className="space-y-1.5">
                {suggestions.quick_wins.map((win, i) => (
                  <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                    <Star className="w-3 h-3 mt-1 text-amber-500 shrink-0" />
                    {win}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Category Breakdown */}
          <div className="space-y-2">
            {suggestions.categories?.map((cat, idx) => (
              <div key={idx} className="border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
                  className="w-full p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={cn("text-xs gap-1", statusColors[cat.status])}>
                      {statusIcons[cat.status]}
                      {cat.status.replace('_', ' ')}
                    </Badge>
                    <span className="font-medium text-slate-800">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">{cat.score}%</span>
                    {expandedSection === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {expandedSection === idx && (
                  <div className="px-4 pb-4 border-t bg-slate-50">
                    {cat.current && (
                      <p className="text-xs text-slate-500 mt-3 mb-2">Current: {cat.current}</p>
                    )}
                    {cat.suggestions?.length > 0 && (
                      <ul className="space-y-1.5 mb-3">
                        {cat.suggestions.map((s, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                            <ArrowUp className="w-3 h-3 mt-1 text-emerald-500 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                    {cat.impact && (
                      <p className="text-xs text-violet-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {cat.impact}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={analyzeProfile}
            disabled={isAnalyzing}
            className="w-full gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
            Re-analyze Profile
          </Button>
        </div>
      )}
    </div>
  );
}

// Detailed compatibility breakdown component
function CompatibilityBreakdown({ myProfile, myDatingProfile, matchProfile, matchDatingProfile, match }) {
  const [breakdown, setBreakdown] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCompatibility = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform a detailed compatibility analysis between two users on a conscious dating platform.

USER 1 (ME):
- Values: ${(myDatingProfile?.core_values_ranked || myProfile?.values_tags || []).join(', ') || 'Not specified'}
- Life Priorities: ${(myDatingProfile?.life_priorities || []).join(', ') || 'Not specified'}
- Dealbreakers: ${(myDatingProfile?.dealbreakers || []).join(', ') || 'None'}
- Regulation Style: ${myDatingProfile?.regulation_style || 'Not specified'}
- Conflict Response: ${myDatingProfile?.conflict_response || 'Not specified'}
- Stress Tolerance: ${myDatingProfile?.stress_tolerance || 'medium'}
- Comm Depth: ${myDatingProfile?.comm_depth || 'balanced'}
- Comm Frequency: ${myDatingProfile?.comm_frequency || 'daily'}
- Feedback Receptivity: ${myDatingProfile?.feedback_receptivity || 'medium'}
- Growth Orientation: ${myDatingProfile?.growth_orientation || 'steady'}
- Location Mobility: ${myDatingProfile?.location_mobility || 'flexible'}
- Daily Rhythm: ${myDatingProfile?.daily_rhythm || 'ambivert'}
- Work-Life Balance: ${myDatingProfile?.work_life_balance || 'balanced'}
- Relationship Intent: ${myDatingProfile?.relationship_intent || 'Not specified'}

USER 2 (MATCH):
- Name: ${matchProfile?.display_name || 'Match'}
- Values: ${(matchDatingProfile?.core_values_ranked || matchProfile?.values_tags || []).join(', ') || 'Not specified'}
- Life Priorities: ${(matchDatingProfile?.life_priorities || []).join(', ') || 'Not specified'}
- Dealbreakers: ${(matchDatingProfile?.dealbreakers || []).join(', ') || 'None'}
- Regulation Style: ${matchDatingProfile?.regulation_style || 'Not specified'}
- Conflict Response: ${matchDatingProfile?.conflict_response || 'Not specified'}
- Stress Tolerance: ${matchDatingProfile?.stress_tolerance || 'medium'}
- Comm Depth: ${matchDatingProfile?.comm_depth || 'balanced'}
- Comm Frequency: ${matchDatingProfile?.comm_frequency || 'daily'}
- Feedback Receptivity: ${matchDatingProfile?.feedback_receptivity || 'medium'}
- Growth Orientation: ${matchDatingProfile?.growth_orientation || 'steady'}
- Location Mobility: ${matchDatingProfile?.location_mobility || 'flexible'}
- Daily Rhythm: ${matchDatingProfile?.daily_rhythm || 'ambivert'}
- Work-Life Balance: ${matchDatingProfile?.work_life_balance || 'balanced'}
- Relationship Intent: ${matchDatingProfile?.relationship_intent || 'Not specified'}

Provide detailed analysis for each compatibility domain.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            overall_summary: { type: "string" },
            chemistry_potential: { type: "string", description: "Brief chemistry assessment" },
            domains: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: { type: "string" },
                  score: { type: "number" },
                  strengths: { type: "array", items: { type: "string" } },
                  challenges: { type: "array", items: { type: "string" } },
                  advice: { type: "string" }
                }
              }
            },
            shared_values: { type: "array", items: { type: "string" } },
            complementary_traits: { type: "array", items: { type: "string" } },
            potential_friction_points: { type: "array", items: { type: "string" } },
            growth_opportunities: { type: "array", items: { type: "string" } },
            long_term_outlook: { type: "string" }
          }
        }
      });

      setBreakdown(response);
    } catch (error) {
      console.error('Failed to analyze compatibility:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze on mount if match is selected
  React.useEffect(() => {
    if (match && !breakdown && !isAnalyzing) {
      analyzeCompatibility();
    }
  }, [match?.id]);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500">Analyzing compatibility...</p>
      </div>
    );
  }

  if (!breakdown) {
    return (
      <div className="text-center py-8">
        <Button onClick={analyzeCompatibility} className="bg-violet-600 hover:bg-violet-700 gap-2">
          <Sparkles className="w-4 h-4" />
          Analyze Compatibility
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-rose-50 border border-violet-100">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-slate-700">Overall Compatibility</span>
          <span className="text-3xl font-bold text-violet-700">{breakdown.overall_score}%</span>
        </div>
        <Progress value={breakdown.overall_score} className="h-3 mb-3" />
        <p className="text-sm text-slate-600">{breakdown.overall_summary}</p>
        {breakdown.chemistry_potential && (
          <div className="mt-2 p-2 rounded-lg bg-rose-100 text-rose-800 text-xs flex items-center gap-2">
            <Heart className="w-4 h-4" />
            {breakdown.chemistry_potential}
          </div>
        )}
      </div>

      {/* Domain Scores */}
      <div className="space-y-3">
        {COMPATIBILITY_DOMAINS.map(domain => {
          const domainData = breakdown.domains?.find(d => d.key === domain.key) || { score: 50 };
          return (
            <div key={domain.key} className="p-3 rounded-xl border bg-white">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", domain.color)}>
                  <domain.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{domain.label}</span>
                    <span className="text-sm font-bold text-slate-700">{domainData.score}%</span>
                  </div>
                  <Progress value={domainData.score} className="h-1.5 mt-1" />
                </div>
              </div>
              {(domainData.strengths?.length > 0 || domainData.challenges?.length > 0) && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  {domainData.strengths?.length > 0 && (
                    <div className="p-2 rounded-lg bg-emerald-50">
                      <span className="font-medium text-emerald-700 block mb-1">Strengths</span>
                      <ul className="space-y-0.5 text-emerald-800">
                        {domainData.strengths.slice(0, 2).map((s, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <Check className="w-3 h-3 mt-0.5 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {domainData.challenges?.length > 0 && (
                    <div className="p-2 rounded-lg bg-amber-50">
                      <span className="font-medium text-amber-700 block mb-1">Challenges</span>
                      <ul className="space-y-0.5 text-amber-800">
                        {domainData.challenges.slice(0, 2).map((c, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {domainData.advice && (
                <p className="mt-2 text-xs text-violet-600 flex items-start gap-1">
                  <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" />
                  {domainData.advice}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Shared & Complementary */}
      <div className="grid grid-cols-2 gap-3">
        {breakdown.shared_values?.length > 0 && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <h4 className="text-xs font-medium text-emerald-800 mb-2 flex items-center gap-1">
              <Heart className="w-3 h-3" /> Shared Values
            </h4>
            <div className="flex flex-wrap gap-1">
              {breakdown.shared_values.slice(0, 4).map((v, i) => (
                <Badge key={i} variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                  {v}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {breakdown.complementary_traits?.length > 0 && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <h4 className="text-xs font-medium text-blue-800 mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Complementary
            </h4>
            <div className="flex flex-wrap gap-1">
              {breakdown.complementary_traits.slice(0, 4).map((t, i) => (
                <Badge key={i} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Long-term outlook */}
      {breakdown.long_term_outlook && (
        <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
          <h4 className="font-medium text-violet-800 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Long-term Outlook
          </h4>
          <p className="text-sm text-violet-900">{breakdown.long_term_outlook}</p>
        </div>
      )}

      <Button variant="outline" onClick={analyzeCompatibility} className="w-full gap-2">
        <RefreshCw className="w-4 h-4" />
        Re-analyze
      </Button>
    </div>
  );
}

// Utility function to find shared items between two arrays
function findSharedItems(arr1, arr2) {
  const set1 = new Set((arr1 || []).map(s => s?.toLowerCase?.() || s));
  return (arr2 || []).filter(item => set1.has(item?.toLowerCase?.() || item));
}

export default function AIMatchAssistant({ 
  isOpen, 
  onClose, 
  selectedMatch = null,
  className 
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(selectedMatch ? 'compatibility' : 'chat');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfiles = [] } = useQuery({
    queryKey: ['myProfile', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user?.email }),
    enabled: !!user?.email
  });
  const myProfile = myProfiles?.[0];

  const { data: myDatingProfiles = [] } = useQuery({
    queryKey: ['myDatingProfile', user?.email],
    queryFn: () => base44.entities.DatingProfile.filter({ user_id: user?.email }),
    enabled: !!user?.email
  });
  const myDatingProfile = myDatingProfiles?.[0];

  // Fetch match's profile data if a match is selected
  const { data: matchProfiles = [] } = useQuery({
    queryKey: ['matchProfile', selectedMatch?.target_id],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: selectedMatch?.target_id }),
    enabled: !!selectedMatch?.target_id
  });
  const matchProfile = matchProfiles?.[0];

  const { data: matchDatingProfiles = [] } = useQuery({
    queryKey: ['matchDatingProfile', selectedMatch?.target_id],
    queryFn: () => base44.entities.DatingProfile.filter({ user_id: selectedMatch?.target_id }),
    enabled: !!selectedMatch?.target_id
  });
  const matchDatingProfile = matchDatingProfiles?.[0];

  // Reset tab when match changes
  React.useEffect(() => {
    if (selectedMatch) {
      setActiveTab('compatibility');
    } else {
      setActiveTab('chat');
    }
  }, [selectedMatch?.id]);

  const buildContext = () => {
    let context = `You are an AI dating assistant helping users understand their compatibility scores and improve their matches on a spiritual/conscious dating platform.

USER PROFILE:
- Name: ${myProfile?.display_name || 'Unknown'}
- Attachment Style: ${myDatingProfile?.attachment_style || myDatingProfile?.regulation_style || 'Not set'}
- Conflict Style: ${myDatingProfile?.conflict_response || 'Not set'}
- Core Values: ${(myDatingProfile?.core_values_ranked || myProfile?.values_tags || []).join(', ') || 'Not set'}
- Dealbreakers: ${(myDatingProfile?.dealbreakers || []).join(', ') || 'None specified'}
- Seeking: ${(myProfile?.relationship_type_seeking || []).join(', ') || 'Not specified'}
- Communication Preference: ${myDatingProfile?.comm_frequency || 'daily'} check-ins, ${myDatingProfile?.comm_depth || 'balanced'} depth
- Growth Orientation: ${myDatingProfile?.growth_orientation || 'steady'}
- Location Flexibility: ${myDatingProfile?.location_mobility || 'flexible'}
`;

    if (selectedMatch) {
      context += `
SELECTED MATCH TO ANALYZE:
- Name: ${selectedMatch.target_name || 'Unknown'}
- Overall Score: ${selectedMatch.match_score || 0}%
- Spiritual Alignment: ${selectedMatch.spiritual_alignment_score || 'N/A'}%
- Shared Values: ${(selectedMatch.shared_values || []).join(', ') || 'Unknown'}
- AI Reasoning: ${selectedMatch.ai_reasoning || selectedMatch.explanation || 'No analysis available'}
- Conversation Starters: ${(selectedMatch.conversation_starters || []).join('; ') || 'None generated'}
`;
    }

    context += `
COMPATIBILITY DOMAINS (how we calculate match scores):
1. Identity & Values (30%): Core values alignment, life priorities, ethical boundaries
2. Emotional Style (25%): Attachment style compatibility, conflict resolution, stress tolerance
3. Communication (20%): Depth preference, frequency needs, feedback receptivity
4. Growth Orientation (15%): Personal development focus, learning mindset, long-term vision
5. Lifestyle (10%): Location flexibility, daily rhythm, work-life balance

INSTRUCTIONS:
- Be warm, supportive, and insightful
- Give specific, actionable advice
- Reference their actual profile data when relevant
- Explain compatibility concepts in accessible terms
- If asked about a specific match, analyze the compatibility factors
- Suggest profile improvements that align with their authentic self
- Never suggest being inauthentic to get matches
- Keep responses concise but helpful (2-3 paragraphs max)
`;

    return context;
  };

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = buildContext();
      const conversationHistory = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${context}

CONVERSATION HISTORY:
${conversationHistory}

User: ${text}

Provide a helpful, warm response:`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            suggestions: { 
              type: "array", 
              items: { type: "string" },
              description: "2-3 follow-up questions or actions the user might want to take"
            },
            profile_tips: {
              type: "array",
              items: { type: "string" },
              description: "Specific profile improvements if relevant, otherwise empty"
            }
          }
        }
      });

      const assistantMessage = { 
        role: 'assistant', 
        content: response.response,
        suggestions: response.suggestions || [],
        profile_tips: response.profile_tips || []
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an issue processing your question. Please try again.",
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (question) => {
    handleSend(question);
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4",
      className
    )}>
      <Card className="w-full max-w-2xl h-[700px] flex flex-col shadow-2xl">
        <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-rose-50 rounded-t-lg pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Match Assistant</CardTitle>
                <p className="text-sm text-slate-500">Get insights on your compatibility</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {selectedMatch && (
            <div className="mt-3 p-3 rounded-lg bg-white/80 border border-slate-200 flex items-center gap-3">
              <RankedAvatar 
                src={selectedMatch.target_avatar} 
                name={selectedMatch.target_name} 
                size={40}
                userId={selectedMatch.target_id}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{selectedMatch.target_name}</p>
                <p className="text-xs text-slate-500">Analyzing this match</p>
              </div>
              <Badge className="bg-violet-100 text-violet-700">{selectedMatch.match_score}% match</Badge>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
            <TabsList className="w-full grid grid-cols-4 h-9">
              <TabsTrigger value="chat" className="text-xs gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                Chat
              </TabsTrigger>
              {selectedMatch && (
                <TabsTrigger value="compatibility" className="text-xs gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  Compatibility
                </TabsTrigger>
              )}
              {selectedMatch && (
                <TabsTrigger value="icebreakers" className="text-xs gap-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Icebreakers
                </TabsTrigger>
              )}
              <TabsTrigger value="profile" className="text-xs gap-1">
                <UserPlus className="w-3.5 h-3.5" />
                My Profile
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <ScrollArea className="flex-1 p-4">
          {activeTab === 'compatibility' && selectedMatch && (
            <CompatibilityBreakdown
              myProfile={myProfile}
              myDatingProfile={myDatingProfile}
              matchProfile={matchProfile}
              matchDatingProfile={matchDatingProfile}
              match={selectedMatch}
            />
          )}

          {activeTab === 'icebreakers' && selectedMatch && (
            <IcebreakerGenerator
              myProfile={myProfile}
              myDatingProfile={myDatingProfile}
              matchProfile={matchProfile}
              matchDatingProfile={matchDatingProfile}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileImprovements
              myProfile={myProfile}
              myDatingProfile={myDatingProfile}
            />
          )}

          {activeTab === 'chat' && (
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-rose-100 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">How can I help?</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Ask me anything about your compatibility, matches, or how to improve your dating profile.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide px-1">
                  Suggested questions
                </p>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(q.text)}
                    className="w-full p-3 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left flex items-center gap-3 group"
                  >
                    <q.icon className="w-5 h-5 text-slate-400 group-hover:text-violet-600" />
                    <span className="text-sm text-slate-700 flex-1">{q.text}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-3",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    msg.role === 'user' 
                      ? "bg-violet-600 text-white" 
                      : msg.isError 
                        ? "bg-red-50 border border-red-200 text-red-800"
                        : "bg-slate-100 text-slate-800"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.suggestions?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
                        <p className="text-xs font-medium text-slate-500">Follow-up:</p>
                        {msg.suggestions.map((s, j) => (
                          <button
                            key={j}
                            onClick={() => handleSend(s)}
                            className="block w-full text-left text-xs p-2 rounded bg-white hover:bg-violet-50 border border-slate-200 text-slate-700"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {msg.profile_tips?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs font-medium text-emerald-700 mb-1.5 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Profile Tips:
                        </p>
                        <ul className="text-xs space-y-1">
                          {msg.profile_tips.map((tip, j) => (
                            <li key={j} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span className="text-slate-700">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-violet-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-violet-600 animate-spin" />
                      <span className="text-sm text-slate-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          )}
        </ScrollArea>

        {activeTab === 'chat' && (
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask about your matches or compatibility..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}