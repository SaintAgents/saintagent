import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  Sparkles, DollarSign, Users, Calendar, Target, TrendingUp,
  Coins, CheckCircle, ArrowRight, Zap, ShoppingBag, Radio,
  Trophy, Eye, MessageCircle, Play, Star, Shield, Crown,
  Heart, Flame, Lock
} from 'lucide-react';

// Mock data for demo
const MOCK_PROFILE = {
  display_name: 'Demo Explorer',
  handle: 'demo_explorer',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
  rp_rank_code: 'initiate',
  rp_points: 150,
  ggg_balance: 2.5,
  trust_score: 72,
  follower_count: 24,
  meetings_completed: 3,
  reach_score: 156,
  total_earnings: 45,
  sa_number: '000001'
};

const MOCK_MATCHES = [
  { id: 1, target_name: 'Luna Sharma', target_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', match_score: 94, explanation: 'Shared interest in holistic healing and community building' },
  { id: 2, target_name: 'River Stone', target_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', match_score: 87, explanation: 'Complementary skills in tech and spirituality' },
  { id: 3, target_name: 'Elder Ananda', target_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', match_score: 82, explanation: 'Aligned mission for conscious leadership' },
];

const MOCK_MISSIONS = [
  { id: 1, title: 'Global Meditation Initiative', reward_ggg: 0.5, participant_count: 47, status: 'active' },
  { id: 2, title: 'Eco-Village Planning', reward_ggg: 1.2, participant_count: 23, status: 'active' },
];

const MOCK_MEETINGS = [
  { id: 1, title: 'Collaboration Call', guest_name: 'Luna Sharma', scheduled_time: '2026-02-03T14:00:00', status: 'scheduled' },
];

const MOCK_TESTIMONIALS = [
  { id: 1, from_name: 'Sarah Chen', text: 'This platform transformed how I connect with like-minded souls!', rating: 5 },
  { id: 2, from_name: 'Marcus Johnson', text: 'Finally found my tribe. The matching algorithm is incredible.', rating: 5 },
];

export default function DemoPreview() {
  const [matchTab, setMatchTab] = useState('people');

  const handleJoinNow = () => {
    base44.auth.redirectToLogin(createPageUrl('Onboarding'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 pb-20">
      {/* Demo Banner */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 text-center shadow-lg">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Eye className="w-5 h-5" />
          <span className="font-medium">You're viewing a demo preview</span>
          <Button 
            size="sm" 
            className="bg-white text-amber-600 hover:bg-amber-50 font-semibold"
            onClick={handleJoinNow}
          >
            Join Now - It's Free
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Command Deck</h1>
              <p className="text-violet-300">Your mission control center</p>
            </div>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
              <Lock className="w-3 h-3 mr-1" />
              Demo Mode
            </Badge>
          </div>
        </div>

        {/* Profile Card */}
        <div className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img 
                src={MOCK_PROFILE.avatar_url} 
                alt="Demo User"
                className="w-28 h-28 rounded-full border-4 border-violet-500 shadow-lg shadow-violet-500/30"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white">{MOCK_PROFILE.display_name}</h2>
              <p className="text-violet-300 mb-4">
                <span className="capitalize">{MOCK_PROFILE.rp_rank_code}</span> • @{MOCK_PROFILE.handle} • SA#{MOCK_PROFILE.sa_number}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-center">
                  <p className="text-xl font-bold text-amber-400">{MOCK_PROFILE.ggg_balance}</p>
                  <p className="text-xs text-amber-300">GGG Balance</p>
                </div>
                <div className="p-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-center">
                  <p className="text-xl font-bold text-violet-400">{MOCK_PROFILE.rp_points}</p>
                  <p className="text-xs text-violet-300">Rank Points</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-center">
                  <p className="text-xl font-bold text-emerald-400">{MOCK_PROFILE.trust_score}</p>
                  <p className="text-xs text-emerald-300">Trust Score</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-center">
                  <p className="text-xl font-bold text-blue-400">{MOCK_PROFILE.follower_count}</p>
                  <p className="text-xs text-blue-300">Followers</p>
                </div>
                <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-center">
                  <p className="text-xl font-bold text-cyan-400">{MOCK_PROFILE.meetings_completed}</p>
                  <p className="text-xs text-cyan-300">Meetings</p>
                </div>
              </div>
            </div>

            {/* Trust Gauge */}
            <div className="text-center">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="url(#trustGradient)" 
                    strokeWidth="8" 
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40 * (MOCK_PROFILE.trust_score / 100)} ${2 * Math.PI * 40}`}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-400">{MOCK_PROFILE.trust_score}</span>
                </div>
              </div>
              <p className="text-xs text-emerald-400 mt-1">Trust Score</p>
            </div>
          </div>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { mode: 'earn', title: 'Earn', icon: DollarSign, color: 'from-emerald-500 to-teal-600' },
            { mode: 'learn', title: 'Learn', icon: TrendingUp, color: 'from-blue-500 to-indigo-600' },
            { mode: 'build', title: 'Build', icon: Target, color: 'from-amber-500 to-orange-600' },
            { mode: 'teach', title: 'Teach', icon: Users, color: 'from-purple-500 to-violet-600' },
            { mode: 'lead', title: 'Lead', icon: Crown, color: 'from-rose-500 to-pink-600' },
            { mode: 'connect', title: 'Connect', icon: Heart, color: 'from-cyan-500 to-blue-600' },
          ].map((item) => (
            <div 
              key={item.mode}
              className={`p-4 rounded-xl bg-gradient-to-br ${item.color} cursor-pointer hover:scale-105 transition-transform shadow-lg`}
            >
              <item.icon className="w-6 h-6 text-white mb-2" />
              <p className="text-white font-semibold">{item.title}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Synchronicity Engine */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Synchronicity Engine
                <Badge className="bg-violet-500/20 text-violet-300 ml-auto">{MOCK_MATCHES.length} matches</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={matchTab} onValueChange={setMatchTab}>
                <TabsList className="w-full grid grid-cols-3 bg-white/10">
                  <TabsTrigger value="people" className="text-white data-[state=active]:bg-violet-500">People</TabsTrigger>
                  <TabsTrigger value="offers" className="text-white data-[state=active]:bg-violet-500">Offers</TabsTrigger>
                  <TabsTrigger value="missions" className="text-white data-[state=active]:bg-violet-500">Missions</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="mt-4 space-y-3">
                {MOCK_MATCHES.map((match) => (
                  <div key={match.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <img src={match.target_avatar} alt={match.target_name} className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{match.target_name}</p>
                      <p className="text-xs text-slate-400">{match.explanation}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-emerald-500/20 text-emerald-300">{match.match_score}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Missions */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Active Missions
                <Badge className="bg-amber-500/20 text-amber-300 ml-auto">{MOCK_MISSIONS.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_MISSIONS.map((mission) => (
                <div key={mission.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-white">{mission.title}</p>
                    <Badge className="bg-emerald-500/20 text-emerald-300">+{mission.reward_ggg} GGG</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users className="w-3 h-3" />
                    <span>{mission.participant_count} participants</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-violet-500/50 text-violet-300 hover:bg-violet-500/20">
                Browse All Missions
              </Button>
            </CardContent>
          </Card>

          {/* Meetings */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Upcoming Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {MOCK_MEETINGS.map((meeting) => (
                <div key={meeting.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-semibold text-white">{meeting.title}</p>
                  <p className="text-sm text-slate-400">with {meeting.guest_name}</p>
                  <p className="text-xs text-cyan-400 mt-2">Tomorrow at 2:00 PM</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Community Voices */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-rose-400" />
                Community Voices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_TESTIMONIALS.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 italic">"{t.text}"</p>
                  <p className="text-xs text-violet-400 mt-2">— {t.from_name}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-violet-600/30 to-purple-600/30 border border-violet-500/30 text-center">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Ready to Join?</h2>
          <p className="text-slate-300 mb-6 max-w-lg mx-auto">
            Create your free account and start connecting with conscious creators, healers, and leaders worldwide.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg px-8"
            onClick={handleJoinNow}
          >
            Become a Saint Agent
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}