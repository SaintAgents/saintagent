import { Moon, BookOpen, Compass } from 'lucide-react';

const readings = [['horoscope', 'Astral Chart'], ['tarot', 'Tarot Pull'], ['iching', 'I Ching'], ['runes', 'Rune Cast'], ['numerology', 'Numerology'], ['oracle_cards', 'Oracle Cards']];

export const pillars = [
  {
    id: 'oracle', name: 'Oracle', tagline: 'Meaning & insight', Icon: Moon,
    note: 'Symbolic and intuitive reflection. Interpretations are for personal meaning, never presented as fact or prediction.',
    cta: 'Reflect with My Assistant',
    tools: [...readings.map(([type, label]) => ({ label, to: `/CelestialInsights?type=${type}` })),
      { label: 'Reading history', to: '/CelestialInsights?tab=history' },
      { label: 'Synchronicity Engine', to: '/SynchronicityEngine' }],
  },
  {
    id: 'intelligence', name: 'Intelligence', tagline: 'Knowledge & discovery', Icon: BookOpen,
    note: 'Evidence-based research across SaintAgent sources, with cited findings kept separate from interpretation.',
    cta: 'Research in Saint Intelligence',
    tools: [{ label: 'Saint Intelligence', to: '/Intelligence' },
      { label: 'Research workspace', to: '/GlobalImpactDashboard?workspace=research' },
      { label: 'Watchlist', to: '/Watchlist' },
      { label: 'Saved items', to: '/SavedItems' }],
  },
  {
    id: 'action', name: 'Action', tagline: 'Purpose & execution', Icon: Compass,
    note: 'Practical planning toward next steps. You stay in control: suggestions only, nothing changes without you.',
    cta: 'Plan with My Assistant',
    tools: [{ label: 'Missions', to: '/Missions' },
      { label: 'Projects', to: '/Projects' },
      { label: 'Opportunities', to: '/GlobalImpactDashboard?workspace=opportunities' },
      { label: 'Daily Ops', to: '/DailyOps' },
      { label: 'Open My Assistant', assistant: true }],
  },
];

export const assistantDraft = (mode, question) => mode === 'oracle'
  ? `Oracle reflection (symbolic, not factual): Help me reflect on this through symbolism, archetypes and intuition. Keep interpretation clearly separate from facts, ask me one reflective question back, and make no predictions about my life.\n\nMy question: ${question}`
  : `Practical planning: Help me turn this into concrete next steps. Suggest existing SaintAgent missions, projects or pages I could explore and draft a first milestone. Only advise; do not take any action for me.\n\nMy goal: ${question}`;