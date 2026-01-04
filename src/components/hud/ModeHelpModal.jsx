import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Hammer, GraduationCap, BookOpen, Coins,
  CheckCircle, Target, Users, Zap, Star, Trophy, Heart
} from 'lucide-react';

const MODE_CONTENT = {
  command: {
    title: 'Command Deck',
    icon: Sparkles,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-100',
    description: 'Your central hub for managing all activities, tracking progress, and accessing key features at a glance.',
    features: [
      { icon: Target, text: 'Overview of your missions, matches, and meetings' },
      { icon: Zap, text: 'Quick access to all platform features' },
      { icon: Star, text: 'Track your GGG balance and reputation' },
      { icon: Users, text: 'See your network growth and engagement' },
    ],
    tips: [
      'Use the side panel to quickly manage your wallet and boosts',
      'Click on any card to dive deeper into that feature',
      'Your activation checklist shows next steps to maximize rewards',
    ],
  },
  build: {
    title: 'Build Mode',
    icon: Hammer,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    description: 'Collaborate on missions, projects, and initiatives. Build something meaningful with your community.',
    features: [
      { icon: Target, text: 'Join or create missions with clear objectives' },
      { icon: Users, text: 'Find collaborators with complementary skills' },
      { icon: Trophy, text: 'Earn GGG and reputation for completing missions' },
      { icon: Zap, text: 'Access project management tools and resources' },
    ],
    tips: [
      'Start with smaller missions to build your reputation',
      'Invite collaborators from your network for bonus rewards',
      'Complete all mission tasks to maximize your GGG earnings',
    ],
    earnings: [
      { action: 'Complete a mission', reward: '50-500 GGG' },
      { action: 'Create a mission others complete', reward: '100-1000 GGG' },
      { action: 'Collaborate bonus', reward: '+25% GGG' },
    ],
  },
  teach: {
    title: 'Teach Mode',
    icon: GraduationCap,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    description: 'Share your knowledge and expertise. Create courses, offer mentorship, and guide others on their journey.',
    features: [
      { icon: BookOpen, text: 'Create and manage your offerings' },
      { icon: Users, text: 'Connect with students and mentees' },
      { icon: Star, text: 'Build your reputation as an expert' },
      { icon: Coins, text: 'Earn GGG for successful teaching sessions' },
    ],
    tips: [
      'Start with free sessions to build reviews and credibility',
      'Use detailed descriptions to attract the right students',
      'Respond quickly to booking requests for better visibility',
    ],
    earnings: [
      { action: 'Complete a mentorship session', reward: '25-100 GGG' },
      { action: 'Receive 5-star review', reward: '+50 GGG bonus' },
      { action: 'Reach 10 completed sessions', reward: '200 GGG milestone' },
    ],
  },
  learn: {
    title: 'Learn Mode',
    icon: BookOpen,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    description: 'Discover new skills, find mentors, and grow through courses and sessions offered by community experts.',
    features: [
      { icon: GraduationCap, text: 'Browse courses and mentorship offerings' },
      { icon: Users, text: 'Connect with teachers and mentors' },
      { icon: Heart, text: 'Leave reviews to help others find great teachers' },
      { icon: Star, text: 'Earn badges for completing learning milestones' },
    ],
    tips: [
      'Check reviews and ratings before booking sessions',
      'Start with free or low-cost offerings to find the right fit',
      'Leave detailed reviews to help teachers and other learners',
    ],
    earnings: [
      { action: 'Complete a learning session', reward: '10 GGG' },
      { action: 'Leave a helpful review', reward: '5 GGG' },
      { action: 'Complete 5 sessions', reward: '50 GGG milestone' },
    ],
  },
  earn: {
    title: 'Earn Mode',
    icon: Coins,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    description: 'Explore the marketplace, offer your services, and discover ways to earn GGG through valuable contributions.',
    features: [
      { icon: Coins, text: 'List your services and skills for GGG' },
      { icon: Users, text: 'Find opportunities that match your expertise' },
      { icon: Trophy, text: 'Track your earnings and transaction history' },
      { icon: Zap, text: 'Boost your listings for more visibility' },
    ],
    tips: [
      'Keep your listings updated with accurate availability',
      'Price competitively when starting out to build reviews',
      'Use boosts strategically during high-traffic times',
    ],
    earnings: [
      { action: 'Complete a marketplace transaction', reward: 'Variable GGG' },
      { action: 'First sale bonus', reward: '100 GGG' },
      { action: 'Top seller badge', reward: '+10% earnings boost' },
    ],
  },
};

export default function ModeHelpModal({ open, onClose, mode = 'command' }) {
  const content = MODE_CONTENT[mode] || MODE_CONTENT.command;
  const Icon = content.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <style>{`
          [data-theme='dark'] [data-radix-dialog-content] {
            background-color: #0f172a !important;
            border-color: #334155 !important;
            color: #e5e7eb !important;
          }
          [data-theme='dark'] .mode-help-title {
            color: #ffffff !important;
          }
          [data-theme='dark'] .mode-help-desc {
            color: #cbd5e1 !important;
          }
          [data-theme='dark'] .mode-help-section-title {
            color: #f1f5f9 !important;
          }
          [data-theme='dark'] .mode-help-card {
            background-color: #1e293b !important;
            border-color: #334155 !important;
          }
          [data-theme='dark'] .mode-help-text {
            color: #cbd5e1 !important;
          }
          [data-theme='dark'] .mode-help-tip {
            background-color: #1e293b !important;
            border-color: #334155 !important;
          }
          [data-theme='dark'] .mode-help-earnings {
            background-color: #1e293b !important;
            border-color: #334155 !important;
          }
        `}</style>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl mode-help-title">
            <div className={`p-2 rounded-lg ${content.iconBg}`}>
              <Icon className={`w-6 h-6 ${content.iconColor}`} />
            </div>
            {content.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          <p className="text-slate-600 mode-help-desc">{content.description}</p>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 mode-help-section-title flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Key Features
            </h3>
            <div className="grid gap-2">
              {content.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border mode-help-card">
                  <feature.icon className="w-5 h-5 text-violet-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700 mode-help-text">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 mode-help-section-title flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Pro Tips
            </h3>
            <div className="bg-amber-50 rounded-lg border border-amber-100 p-4 space-y-2 mode-help-tip">
              {content.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 mode-help-text">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings (if applicable) */}
          {content.earnings && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 mode-help-section-title flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                Earning Potential
              </h3>
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-100 p-4 mode-help-earnings">
                <div className="space-y-2">
                  {content.earnings.map((earning, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 mode-help-text">{earning.action}</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{earning.reward}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}