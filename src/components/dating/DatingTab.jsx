import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';
import DatingSettings from './DatingSettings';
import CompatibilityResults from './CompatibilityResults';
import AIMatchAssistant from './AIMatchAssistant';
import ProfileBoostCard from './ProfileBoostCard';
import AdvancedMatchFilters, { DEFAULT_FILTERS } from './AdvancedMatchFilters';
import AIDiscoverMatches from '@/components/ai/AIDiscoverMatches';

// Default weights - can be overridden by user preferences
const DEFAULT_WEIGHTS = {
  identity_values: 0.30,
  emotional_stability: 0.25,
  communication: 0.20,
  growth: 0.15,
  lifestyle: 0.10,
};

function intersect(a = [], b = []) {
  const A = new Set((a||[]).map((s)=>String(s).toLowerCase().trim()));
  const B = new Set((b||[]).map((s)=>String(s).toLowerCase().trim()));
  const inter = [...A].filter((x) => B.has(x));
  const uni = new Set([...A, ...B]);
  const score = uni.size ? (inter.length / uni.size) : 0;
  return { score, inter };
}

function closeness(a, b, order) {
  if (!a || !b) return 0.5;
  const idxA = order.indexOf(a);
  const idxB = order.indexOf(b);
  if (idxA < 0 || idxB < 0) return 0.5;
  const d = Math.abs(idxA - idxB);
  return Math.max(0, 1 - d / (order.length - 1));
}

// Check if candidate has any of user's dealbreakers
function hasDealbreaker(myDealbreakers = [], candidateProfile) {
  if (!myDealbreakers.length) return { blocked: false, reasons: [] };
  const reasons = [];
  const dealbreakersLower = myDealbreakers.map(d => d.toLowerCase().trim());
  
  // Check against candidate's values, bio, tags
  const candidateTraits = [
    ...(candidateProfile.values || []),
    ...(candidateProfile.tags || []),
    candidateProfile.relationship_orientation || '',
    candidateProfile.bio || ''
  ].map(t => String(t).toLowerCase());
  
  for (const db of dealbreakersLower) {
    if (candidateTraits.some(t => t.includes(db))) {
      reasons.push(db);
    }
  }
  
  return { blocked: reasons.length > 0, reasons };
}

// Calculate compatibility prediction (likelihood of success)
function calculatePrediction(domainScores, strengths, frictions) {
  const avgScore = Object.values(domainScores).reduce((a, b) => a + b, 0) / (Object.values(domainScores).length || 1);
  const strengthBonus = Math.min(strengths.length * 3, 15);
  const frictionPenalty = Math.min(frictions.length * 5, 20);
  const prediction = Math.min(100, Math.max(0, avgScore + strengthBonus - frictionPenalty));
  
  let label = 'Low';
  let color = 'text-red-500';
  if (prediction >= 75) { label = 'Excellent'; color = 'text-emerald-500'; }
  else if (prediction >= 60) { label = 'Good'; color = 'text-teal-500'; }
  else if (prediction >= 45) { label = 'Moderate'; color = 'text-amber-500'; }
  
  return { score: Math.round(prediction), label, color };
}

export default function DatingTab({ profile }) {
  const queryClient = useQueryClient();
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [savedMatches, setSavedMatches] = useState([]);
  const [dismissedMatches, setDismissedMatches] = useState([]);
  const [advancedFilters, setAdvancedFilters] = useState(DEFAULT_FILTERS);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myDPs = [] } = useQuery({
    queryKey: ['datingProfile', currentUser?.email],
    queryFn: async () => {
      const me = await base44.auth.me();
      return base44.entities.DatingProfile.filter({ user_id: me.email });
    },
    enabled: !!currentUser?.email,
  });
  const myDP = myDPs?.[0];

  // Load all dating profiles (including demo profiles)
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allDatingProfiles'],
    queryFn: () => base44.entities.DatingProfile.list('-updated_date', 100),
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Load user profiles for avatar/name info
  const { data: userProfiles = [] } = useQuery({
    queryKey: ['datingUserProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 200),
  });

  // Fetch wallet balance for boost feature
  const { data: walletRes } = useQuery({
    queryKey: ['wallet', currentUser?.email],
    queryFn: async () => {
      try {
        const { data } = await base44.functions.invoke('walletEngine', {
          action: 'getWallet',
          payload: { user_id: currentUser.email }
        });
        return data;
      } catch (e) {
        return { wallet: { available_balance: 0 } };
      }
    },
    enabled: !!currentUser?.email
  });
  const walletBalance = walletRes?.wallet?.available_balance || 0;

  const compute = useCallback(async () => {
    if (!currentUser?.email) return;
    setRunning(true);

    // Get user's custom weights or use defaults
    const weights = myDP?.domain_weights || DEFAULT_WEIGHTS;
    
    // Filter candidates: exclude self and dismissed matches
    const candidates = allProfiles.filter(p => 
      p.user_id !== currentUser.email && 
      !dismissedMatches.includes(p.user_id) &&
      (p.is_active !== false) // Include demo profiles
    );

    const out = [];
    
    for (const other of candidates) {
      // Check dealbreakers first
      const dealbreakCheck = hasDealbreaker(myDP?.dealbreakers || [], other);
      if (dealbreakCheck.blocked && myDP?.strict_dealbreakers) {
        continue; // Skip this candidate entirely
      }

      const domainScores = {};
      const strengths = [];
      const frictions = [];
      const assumptions = [];

      // Get user profile info for display
      const otherUserProfile = userProfiles.find(up => up.user_id === other.user_id);

      // 1) Identity & Values (highest weight by default)
      const myValues = myDP?.core_values_ranked || [];
      const otherValues = other.values || other.core_values_ranked || [];
      const v = intersect(myValues, otherValues);
      
      const myPriorities = myDP?.life_priorities || [];
      const otherPriorities = other.life_priorities || [];
      const p = intersect(myPriorities, otherPriorities);
      
      const base = (v.score * 0.7 + p.score * 0.3) * 100;
      const penalty = dealbreakCheck.blocked ? 25 : 0;
      domainScores.identity_values = Math.max(0, base - penalty);
      
      if (v.inter.length) strengths.push(`Shared values: ${v.inter.join(', ')}`);
      if (dealbreakCheck.blocked) frictions.push(`Dealbreaker concern: ${dealbreakCheck.reasons.join(', ')}`);

      // 2) Emotional & Stability
      const reg = closeness(myDP?.regulation_style, other.regulation_style, ['internal_processor','calm_regulator','adaptive','expressive_processor']);
      const conf = closeness(myDP?.conflict_response, other.conflict_response, ['avoidant','reflective_space','direct_repair','assertive']);
      const stress = closeness(myDP?.stress_tolerance, other.stress_tolerance, ['low','medium','high']);
      domainScores.emotional_stability = (reg*0.4 + conf*0.4 + stress*0.2) * 100;
      
      if (reg > 0.7) strengths.push('Compatible regulation styles');
      if (conf > 0.7) strengths.push('Conflict repair styles align');
      if (reg < 0.4) frictions.push('Different regulation styles');
      if (conf < 0.4) frictions.push('Conflict styles may clash');

      // 3) Communication
      const depth = closeness(myDP?.comm_depth, other.comm_depth, ['light','balanced','deep']);
      const freq = closeness(myDP?.comm_frequency, other.comm_frequency, ['weekly','few_times_week','daily']);
      const recept = closeness(myDP?.feedback_receptivity, other.feedback_receptivity, ['low','medium','high']);
      domainScores.communication = (depth*0.5 + freq*0.3 + recept*0.2) * 100;
      
      if (depth > 0.7) strengths.push('Communication depth aligns');
      if (freq < 0.4) frictions.push('Different messaging cadence');

      // 4) Growth & Intent
      const orient = closeness(myDP?.growth_orientation, other.growth_orientation, ['steady','seasonal','accelerated']);
      const learn = closeness(myDP?.learning_mindset, other.learning_mindset, ['beginner','intermediate','advanced']);
      const intent = closeness(myDP?.relationship_intent, other.relationship_intent || other.intent, ['companionship','partnership','co_creation','undecided']);
      domainScores.growth = (orient*0.4 + learn*0.2 + intent*0.4) * 100;
      
      if (intent > 0.7) strengths.push('Aligned relationship intent');
      if (intent < 0.4) frictions.push('Different relationship goals');

      // 5) Lifestyle
      const mob = closeness(myDP?.location_mobility, other.location_mobility, ['fixed','flexible','nomadic']);
      const rhythm = closeness(myDP?.daily_rhythm, other.daily_rhythm, ['introvert','ambivert','extrovert']);
      const worklife = closeness(myDP?.work_life_balance, other.work_life_balance, ['work_leaning','balanced','life_leaning']);
      domainScores.lifestyle = (mob*0.3 + rhythm*0.4 + worklife*0.3) * 100;
      
      if (rhythm > 0.7) strengths.push('Daily rhythm compatible');
      if (mob < 0.4) frictions.push('Location flexibility differs');

      // Calculate weighted overall score
      const totalWeight = Object.entries(weights)
        .filter(([k]) => domainScores[k] != null)
        .reduce((acc, [k]) => acc + (weights[k] || 0), 0) || 1;
      
      const overall = Object.entries(domainScores)
        .reduce((acc, [k, v]) => acc + (v * (weights[k] || DEFAULT_WEIGHTS[k] || 0)), 0) / totalWeight;

      // Calculate prediction score
      const prediction = calculatePrediction(domainScores, strengths, frictions);

      // Build display info
      const displayName = otherUserProfile?.display_name || other.user_id?.split('@')[0] || 'User';
      const avatar = otherUserProfile?.avatar_url;
      const isDemo = other.is_demo === true;
      const isSaved = savedMatches.includes(other.user_id);

      out.push({
        user_id: other.user_id,
        display_name: displayName,
        avatar,
        bio: other.bio || other.seeking || '',
        location: other.location || otherUserProfile?.location || '',
        relationship_orientation: other.relationship_orientation,
        intent: other.intent || other.relationship_intent,
        tags: other.tags || [],
        domainScores,
        overall: Math.round(overall),
        prediction,
        strengths,
        frictions,
        assumptions,
        isDemo,
        isSaved,
        synchronicity_note: other.synchronicity_note
      });
    }

    out.sort((a, b) => b.overall - a.overall);
    setResults(out);
    setLastRefresh(new Date());
    setRunning(false);
    }, [currentUser?.email, myDP, allProfiles, userProfiles, dismissedMatches, savedMatches]);

    // Apply advanced filters to results
    const filteredResults = React.useMemo(() => {
    return results.filter(match => {
      // Score range
      if (match.overall < advancedFilters.minScore || match.overall > advancedFilters.maxScore) {
        return false;
      }

      // Find the original profile for this match
      const originalProfile = allProfiles.find(p => p.user_id === match.user_id);

      // Relationship intent filter
      if (advancedFilters.relationshipIntent?.length > 0) {
        const matchIntent = originalProfile?.relationship_intent || match.intent;
        if (!advancedFilters.relationshipIntent.includes(matchIntent)) {
          return false;
        }
      }

      // Growth orientation filter
      if (advancedFilters.growthOrientation?.length > 0) {
        const matchGrowth = originalProfile?.growth_orientation;
        if (!advancedFilters.growthOrientation.includes(matchGrowth)) {
          return false;
        }
      }

      // Communication depth filter
      if (advancedFilters.commDepth?.length > 0) {
        const matchComm = originalProfile?.comm_depth;
        if (!advancedFilters.commDepth.includes(matchComm)) {
          return false;
        }
      }

      // Daily rhythm filter
      if (advancedFilters.dailyRhythm?.length > 0) {
        const matchRhythm = originalProfile?.daily_rhythm;
        if (!advancedFilters.dailyRhythm.includes(matchRhythm)) {
          return false;
        }
      }

      // Required values filter
      if (advancedFilters.requiredValues?.length > 0) {
        const matchValues = (originalProfile?.core_values_ranked || []).map(v => v.toLowerCase());
        const hasAllRequired = advancedFilters.requiredValues.every(rv => 
          matchValues.some(mv => mv.includes(rv.toLowerCase()))
        );
        if (!hasAllRequired) {
          return false;
        }
      }

      // Excluded values filter
      if (advancedFilters.excludedValues?.length > 0) {
        const matchValues = (originalProfile?.core_values_ranked || []).map(v => v.toLowerCase());
        const hasExcluded = advancedFilters.excludedValues.some(ev => 
          matchValues.some(mv => mv.includes(ev.toLowerCase()))
        );
        if (hasExcluded) {
          return false;
        }
      }

      // Boosted only filter
      if (advancedFilters.showOnlyBoosted && !originalProfile?.is_boosted) {
        return false;
      }

      // Hide no photo filter
      if (advancedFilters.hideNoPhoto && !match.avatar) {
        return false;
      }

      return true;
    }).map(match => {
      // Apply priority value boost
      if (advancedFilters.prioritizeValues?.length > 0) {
        const originalProfile = allProfiles.find(p => p.user_id === match.user_id);
        const matchValues = (originalProfile?.core_values_ranked || []).map(v => v.toLowerCase());
        const priorityMatches = advancedFilters.prioritizeValues.filter(pv => 
          matchValues.some(mv => mv.includes(pv.toLowerCase()))
        ).length;

        if (priorityMatches > 0) {
          return {
            ...match,
            overall: Math.min(100, match.overall + (priorityMatches * 5)),
            priorityBoost: priorityMatches * 5
          };
        }
      }
      return match;
    }).sort((a, b) => b.overall - a.overall);
    }, [results, advancedFilters, allProfiles]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !myDP?.opt_in) return;
    
    // Initial compute
    compute();
    
    const interval = setInterval(() => {
      compute();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, myDP?.opt_in, compute]);

  const handleSave = (userId) => {
    setSavedMatches(prev => [...prev, userId]);
  };

  const handleDismiss = (userId) => {
    setDismissedMatches(prev => [...prev, userId]);
    setResults(prev => prev.filter(r => r.user_id !== userId));
  };

  const handleUnsave = (userId) => {
    setSavedMatches(prev => prev.filter(id => id !== userId));
  };

  return (
    <div className="space-y-6">
      <DatingSettings currentUser={currentUser} />
      
      {/* AI Discover Section */}
      <AIDiscoverMatches profile={profile} />

      {/* AI Match Assistant & Profile Boost */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIMatchAssistant 
            profile={profile} 
            datingProfile={myDP} 
          />
        </div>
        <div>
          <ProfileBoostCard 
            datingProfile={myDP}
            userProfile={profile}
            walletBalance={walletBalance}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Compatibility Results</h3>
          {lastRefresh && (
            <p className="text-xs text-slate-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
              {autoRefresh && ' • Auto-refreshing every 30s'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh}
              id="auto-refresh"
            />
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
          </div>
          <Button 
            className="rounded-xl gap-2" 
            disabled={!myDP?.opt_in || running} 
            onClick={compute}
          >
            <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Calculating…' : 'Run Check'}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedMatchFilters 
        filters={advancedFilters}
        onChange={setAdvancedFilters}
        resultCount={filteredResults.length}
      />
      
      <CompatibilityResults 
        results={filteredResults} 
        onSave={handleSave}
        onDismiss={handleDismiss}
        onUnsave={handleUnsave}
        savedMatches={savedMatches}
      />
    </div>
  );
}