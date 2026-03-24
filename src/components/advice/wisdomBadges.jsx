import { 
  MessageSquarePlus, Lightbulb, CheckCircle2, Heart, Award, Star, 
  Trophy, Flame, Shield, Crown, Zap, Brain, Target, Sparkles, Users
} from 'lucide-react';

// Badge definitions with unlock criteria
export const WISDOM_BADGES = {
  first_question: {
    id: 'first_question',
    label: 'Curious Mind',
    description: 'Asked your first question',
    icon: MessageSquarePlus,
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    check: (s) => (s.questions_asked || 0) >= 1,
  },
  first_answer: {
    id: 'first_answer',
    label: 'First Answer',
    description: 'Gave your first answer',
    icon: Lightbulb,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100',
    border: 'border-emerald-200',
    check: (s) => (s.answers_given || 0) >= 1,
  },
  helpful_5: {
    id: 'helpful_5',
    label: 'Community Helper',
    description: 'Received 5 helpful votes',
    icon: Heart,
    color: 'text-pink-500',
    bg: 'bg-pink-100',
    border: 'border-pink-200',
    check: (s) => (s.helpful_count || 0) >= 5,
  },
  accepted_1: {
    id: 'accepted_1',
    label: 'Problem Solver',
    description: 'Had an answer accepted',
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-100',
    border: 'border-green-200',
    check: (s) => (s.accepted_answers || 0) >= 1,
  },
  accepted_5: {
    id: 'accepted_5',
    label: 'Resolved Question Expert',
    description: 'Had 5 answers accepted',
    icon: Shield,
    color: 'text-indigo-500',
    bg: 'bg-indigo-100',
    border: 'border-indigo-200',
    check: (s) => (s.accepted_answers || 0) >= 5,
  },
  answers_10: {
    id: 'answers_10',
    label: 'Wise Advisor',
    description: 'Gave 10 answers',
    icon: Brain,
    color: 'text-purple-500',
    bg: 'bg-purple-100',
    border: 'border-purple-200',
    check: (s) => (s.answers_given || 0) >= 10,
  },
  answers_25: {
    id: 'answers_25',
    label: 'Top Contributor',
    description: 'Gave 25 answers',
    icon: Trophy,
    color: 'text-amber-500',
    bg: 'bg-amber-100',
    border: 'border-amber-200',
    check: (s) => (s.answers_given || 0) >= 25,
  },
  points_100: {
    id: 'points_100',
    label: 'Rising Star',
    description: 'Earned 100 wisdom points',
    icon: Star,
    color: 'text-yellow-500',
    bg: 'bg-yellow-100',
    border: 'border-yellow-200',
    check: (s) => (s.wisdom_points || 0) >= 100,
  },
  points_500: {
    id: 'points_500',
    label: 'Wisdom Master',
    description: 'Earned 500 wisdom points',
    icon: Crown,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    check: (s) => (s.wisdom_points || 0) >= 500,
  },
  upvotes_50: {
    id: 'upvotes_50',
    label: 'Crowd Favorite',
    description: 'Received 50 upvotes on answers',
    icon: Flame,
    color: 'text-orange-500',
    bg: 'bg-orange-100',
    border: 'border-orange-200',
    check: (s) => (s.total_upvotes_received || 0) >= 50,
  },
};

// Compute which badges a user has earned
export function computeEarnedBadges(wisdomScore) {
  if (!wisdomScore) return [];
  return Object.values(WISDOM_BADGES).filter(b => b.check(wisdomScore)).map(b => b.id);
}

// Points breakdown config
export const POINTS_CONFIG = {
  ask_question: { points: 2, label: 'Ask a question' },
  give_answer: { points: 5, label: 'Give an answer' },
  answer_upvoted: { points: 2, label: 'Answer upvoted' },
  answer_helpful: { points: 10, label: 'Marked helpful' },
  answer_accepted: { points: 25, label: 'Answer accepted' },
};