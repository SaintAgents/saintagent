import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import DatingSettings from './DatingSettings';
import CompatibilityResults from './CompatibilityResults';

const WEIGHTS = {
  identity_values: 0.25,
  emotional_stability: 0.25,
  communication: 0.2,
  growth: 0.15,
  lifestyle: 0.1,
  synchronicity: 0.05,
};

function intersect(a = [], b = []) {
  const A = new Set((a||[]).map((s)=>String(s).toLowerCase()));
  const B = new Set((b||[]).map((s)=>String(s).toLowerCase()));
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

export default function DatingTab({ profile }) {
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

  const [results, setResults] = React.useState([]);
  const [running, setRunning] = React.useState(false);

  const compute = async () => {
    setRunning(true);
    // Load others
    const others = await base44.entities.DatingProfile.filter({ opt_in: true, visible: true }, '-updated_date', 100);
    const candidates = (others || []).filter((o) => o.user_id !== currentUser.email);

    const out = [];
    for (const other of candidates) {
      const domainScores = {};
      const strengths = [];
      const frictions = [];
      const assumptions = [];

      // 1) Identity & Values
      if (myDP?.domains_enabled?.identity_values !== false && other?.domains_enabled?.identity_values !== false) {
        const v = intersect(myDP?.core_values_ranked, other?.core_values_ranked);
        const p = intersect(myDP?.life_priorities, other?.life_priorities);
        const dealbreak = intersect(myDP?.dealbreakers, other?.dealbreakers);
        const base = (v.score * 0.7 + p.score * 0.3) * 100;
        const penalty = dealbreak.inter.length > 0 ? 25 : 0;
        domainScores.identity_values = Math.max(0, base - penalty);
        if (v.inter.length) strengths.push(`Shared values: ${v.inter.join(', ')}`);
        if (dealbreak.inter.length) frictions.push(`Potential dealbreakers overlap: ${dealbreak.inter.join(', ')}`);
      }

      // 2) Emotional & Stability
      if (myDP?.domains_enabled?.emotional_stability !== false && other?.domains_enabled?.emotional_stability !== false) {
        const reg = closeness(myDP?.regulation_style, other?.regulation_style, ['internal_processor','calm_regulator','adaptive','expressive_processor']);
        const conf = closeness(myDP?.conflict_response, other?.conflict_response, ['avoidant','reflective_space','direct_repair','assertive']);
        const stress = closeness(myDP?.stress_tolerance, other?.stress_tolerance, ['low','medium','high']);
        const score = (reg*0.4 + conf*0.4 + stress*0.2) * 100;
        domainScores.emotional_stability = score;
        if (reg > 0.7) strengths.push('Compatible regulation styles'); else frictions.push('Different regulation styles');
        if (conf > 0.7) strengths.push('Conflict repair styles align'); else frictions.push('Conflict styles may clash');
      }

      // 3) Communication
      if (myDP?.domains_enabled?.communication !== false && other?.domains_enabled?.communication !== false) {
        const depth = closeness(myDP?.comm_depth, other?.comm_depth, ['light','balanced','deep']);
        const freq = closeness(myDP?.comm_frequency, other?.comm_frequency, ['weekly','few_times_week','daily']);
        const recept = closeness(myDP?.feedback_receptivity, other?.feedback_receptivity, ['low','medium','high']);
        const score = (depth*0.5 + freq*0.3 + recept*0.2) * 100;
        domainScores.communication = score;
        if (depth > 0.7) strengths.push('Preferred depth aligns');
        if (freq < 0.4) frictions.push('Different messaging cadence');
      }

      // 4) Growth & Intent
      if (myDP?.domains_enabled?.growth !== false && other?.domains_enabled?.growth !== false) {
        const orient = closeness(myDP?.growth_orientation, other?.growth_orientation, ['steady','seasonal','accelerated']);
        const learn = closeness(myDP?.learning_mindset, other?.learning_mindset, ['beginner','intermediate','advanced']);
        const intent = closeness(myDP?.relationship_intent, other?.relationship_intent, ['companionship','partnership','co_creation','undecided']);
        const score = (orient*0.4 + learn*0.2 + intent*0.4) * 100;
        domainScores.growth = score;
        if (intent > 0.7) strengths.push('Aligned relationship intent'); else frictions.push('Intent may differ');
      }

      // 5) Lifestyle
      if (myDP?.domains_enabled?.lifestyle !== false && other?.domains_enabled?.lifestyle !== false) {
        const mob = closeness(myDP?.location_mobility, other?.location_mobility, ['fixed','flexible','nomadic']);
        const rhythm = closeness(myDP?.daily_rhythm, other?.daily_rhythm, ['introvert','ambivert','extrovert']);
        const worklife = closeness(myDP?.work_life_balance, other?.work_life_balance, ['work_leaning','balanced','life_leaning']);
        const score = (mob*0.3 + rhythm*0.4 + worklife*0.3) * 100;
        domainScores.lifestyle = score;
        if (rhythm > 0.7) strengths.push('Daily rhythm compatible');
      }

      // 6) Synchronicity (optional)
      if (myDP?.synchronicity_enabled && other?.synchronicity_enabled && myDP?.domains_enabled?.synchronicity !== false && other?.domains_enabled?.synchronicity !== false) {
        // Simple placeholder: modest boost
        domainScores.synchronicity = 65;
        assumptions.push('Synchronicity signals enabled (placeholder metric).');
      }

      // Weighted overall
      const totalWeight = Object.entries(WEIGHTS)
        .filter(([k]) => domainScores[k] != null)
        .reduce((acc, [k]) => acc + WEIGHTS[k], 0) || 1;
      const overall = Object.entries(domainScores)
        .reduce((acc, [k, v]) => acc + (v * (WEIGHTS[k] || 0)), 0) / totalWeight;

      out.push({ user_id: other.user_id, domainScores, overall, strengths, frictions, assumptions });
    }

    out.sort((a,b) => b.overall - a.overall);
    setResults(out);
    setRunning(false);
  };

  return (
    <div className="space-y-6">
      <DatingSettings currentUser={currentUser} />
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Compatibility Results</h3>
        <Button className="rounded-xl" disabled={!myDP?.opt_in || running} onClick={compute}>
          {running ? 'Calculating…' : 'Run Compatibility Check'}
        </Button>
      </div>
      <CompatibilityResults results={results} />
    </div>
  );
}