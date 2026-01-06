import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Target, 
  Star, 
  Sparkles, 
  Gift, 
  Flame,
  Zap,
  Crown,
  TrendingUp,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PointsDisplay from './PointsDisplay';
import ChallengeCard from './ChallengeCard';
import Leaderboard from './Leaderboard';
import BadgesBar from '@/components/badges/BadgesBar';

export default function GamificationHub({ profile }) {
  const [activeTab, setActiveTab] = useState('challenges');
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges', profile?.user_id],
    queryFn: () => base44.entities.Challenge.filter({ user_id: profile.user_id }, '-created_date', 20),
    enabled: !!profile?.user_id
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges', profile?.user_id],
    queryFn: () => base44.entities.Badge.filter({ user_id: profile.user_id, status: 'active' }),
    enabled: !!profile?.user_id
  });

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'claimed');
  const pendingRewards = challenges.filter(c => c.current_count >= c.target_count && c.status === 'active');

  const engagementPoints = profile?.engagement_points || 0;
  const level = Math.floor(engagementPoints / 1000) + 1;

  // Calculate streak
  const { data: recentMeetings = [] } = useQuery({
    queryKey: ['recentMeetings', profile?.user_id],
    queryFn: () => base44.entities.Meeting.filter({ 
      guest_id: profile.user_id, 
      status: 'completed' 
    }, '-created_date', 30),
    enabled: !!profile?.user_id
  });

  // Generate AI challenges
  const generateChallengesMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const prompt = `Generate 3 personalized engagement challenges for a user with these stats:
- Level: ${level}
- Points: ${engagementPoints}
- Meetings completed: ${profile?.meetings_completed || 0}
- Badges earned: ${badges.length}
- GGG balance: ${profile?.ggg_balance || 0}

Create challenges that are achievable but encourage growth. Mix difficulty levels.
Return as JSON array with: title, description, category (profile/social/meetings/missions/marketplace/learning), target_action, target_count, reward_points, ai_reasoning`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            challenges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  target_action: { type: "string" },
                  target_count: { type: "number" },
                  reward_points: { type: "number" },
                  ai_reasoning: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Create challenges
      const user = await base44.auth.me();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      for (const c of response.challenges || []) {
        await base44.entities.Challenge.create({
          user_id: user.email,
          title: c.title,
          description: c.description,
          category: c.category || 'social',
          target_action: c.target_action,
          target_count: c.target_count || 1,
          reward_points: c.reward_points || 25,
          challenge_type: 'ai_suggested',
          status: 'active',
          current_count: 0,
          expires_at: tomorrow.toISOString(),
          ai_reasoning: c.ai_reasoning
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      setIsGenerating(false);
    },
    onError: () => setIsGenerating(false)
  });

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="pt-4">
            <PointsDisplay points={engagementPoints} level={level} />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-600">Active Challenges</p>
                <p className="text-3xl font-bold text-violet-900">{activeChallenges.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-violet-100">
                <Target className="w-6 h-6 text-violet-600" />
              </div>
            </div>
            {pendingRewards.length > 0 && (
              <Badge className="mt-2 bg-emerald-100 text-emerald-700 gap-1">
                <Gift className="w-3 h-3" />
                {pendingRewards.length} rewards to claim!
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Badges Earned</p>
                <p className="text-3xl font-bold text-emerald-900">{badges.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100">
                <Crown className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2">
              <BadgesBar badges={badges.slice(0, 4)} defaultIfEmpty={false} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="challenges" className="gap-2">
            <Target className="w-4 h-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="rewards" className="gap-2">
            <Gift className="w-4 h-4" />
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Your Challenges</h3>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => generateChallengesMutation.mutate()}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-violet-500" />
              )}
              Get AI Challenges
            </Button>
          </div>

          {/* Pending Rewards Alert */}
          {pendingRewards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-200">
                  <Gift className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-emerald-900">
                    {pendingRewards.length} reward{pendingRewards.length > 1 ? 's' : ''} ready to claim!
                  </p>
                  <p className="text-sm text-emerald-700">Complete challenges to earn points and badges</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Challenges */}
          <div className="space-y-3">
            {activeChallenges.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No active challenges</p>
                <Button
                  variant="outline"
                  className="mt-3 gap-2"
                  onClick={() => generateChallengesMutation.mutate()}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Challenges
                </Button>
              </div>
            ) : (
              activeChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))
            )}
          </div>

          {/* Completed Challenges */}
          {completedChallenges.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-500 mb-3">Completed</h4>
              <div className="space-y-2">
                {completedChallenges.slice(0, 5).map(challenge => (
                  <ChallengeCard key={challenge.id} challenge={challenge} compact />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Leaderboard />
        </TabsContent>

        <TabsContent value="rewards" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Total Points Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-amber-600">{engagementPoints.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Challenges Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-600">{completedChallenges.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Badges</CardTitle>
            </CardHeader>
            <CardContent>
              {badges.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Complete challenges to earn badges!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <BadgesBar badges={badges} defaultIfEmpty={false} max={20} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Points History would go here */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How to Earn Points</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { action: 'Complete a meeting', points: 25 },
                { action: 'Send a message', points: 5 },
                { action: 'Join a mission', points: 15 },
                { action: 'Complete profile section', points: 20 },
                { action: 'Receive a testimonial', points: 30 },
                { action: 'Daily login', points: 10 }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-600">{item.action}</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">
                    +{item.points} pts
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}