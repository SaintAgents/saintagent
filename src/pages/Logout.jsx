import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  LogOut, 
  Clock, 
  Activity, 
  Calendar, 
  TrendingUp,
  Users,
  Target,
  Award,
  ArrowLeft
} from "lucide-react";
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import SignInModal from '@/components/SignInModal';

export default function Logout() {
  const [sessionDuration, setSessionDuration] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: currentUser.email });
    },
    enabled: !!user
  });
  const profile = profiles?.[0];

  const { data: todayMeetings = [] } = useQuery({
    queryKey: ['todayMeetings'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const meetings = await base44.entities.Meeting.list('-scheduled_time', 50);
      return meetings.filter(m => m.scheduled_time?.startsWith(today));
    },
    enabled: !!user
  });

  const { data: activeMissions = [] } = useQuery({
    queryKey: ['activeMissions'],
    queryFn: async () => {
      const missions = await base44.entities.Mission.filter({ status: 'active' });
      return missions.filter(m => m.participant_ids?.includes(profile?.user_id));
    },
    enabled: !!profile
  });

  useEffect(() => {
    const loginTime = localStorage.getItem('session_start_time');
    if (loginTime) {
      const duration = Date.now() - parseInt(loginTime);
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      setSessionDuration(`${hours}h ${minutes}m`);
    } else {
      // Set session start time if not already set
      localStorage.setItem('session_start_time', Date.now().toString());
      setSessionDuration('Just started');
    }
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('session_start_time');
    base44.auth.logout(createPageUrl('Landing'));
  };

  const handleCancel = () => {
    window.history.back();
  };

  useEffect(() => {
    if (!user) {
      setShowSignIn(true);
    }
  }, [user]);

  if (!user || !profile) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30" />
        <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
      </>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardContent className="p-8">
          {!confirming ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24 ring-4 ring-white shadow-xl">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                      {profile.display_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-1">
                      {profile.rank_code}
                    </Badge>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{profile.display_name}</h1>
                <p className="text-slate-500">@{profile.handle}</p>
              </div>

              {/* Session Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Session Duration</p>
                      <p className="text-lg font-bold text-slate-900">{sessionDuration}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Today's Meetings</p>
                      <p className="text-lg font-bold text-slate-900">{todayMeetings.length}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Active Missions</p>
                      <p className="text-lg font-bold text-slate-900">{activeMissions.length}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Rank Points</p>
                      <p className="text-lg font-bold text-slate-900">{profile.rank_points?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Activity Summary */}
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 mb-8">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-violet-500" />
                  Session Summary
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Total GGG Balance</span>
                    <span className="font-semibold text-amber-600">{profile.ggg_balance?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reach Score</span>
                    <span className="font-semibold text-violet-600">{profile.reach_score || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Followers</span>
                    <span className="font-semibold text-blue-600">{profile.follower_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Meetings Completed</span>
                    <span className="font-semibold text-emerald-600">{profile.meetings_completed || 0}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12"
                  onClick={handleCancel}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Stay Logged In
                </Button>
                <Button 
                  onClick={() => setConfirming(true)}
                  className="flex-1 h-12 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Screen */}
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
                  <LogOut className="w-10 h-10 text-rose-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Sign Out?</h2>
                <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                  You'll need to sign in again to access your account and continue your journey.
                </p>

                {(todayMeetings.length > 0 || activeMissions.length > 0) && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
                    <p className="text-sm text-amber-900 font-medium mb-2">⚠️ Active Items</p>
                    <div className="text-xs text-amber-800 space-y-1 text-left">
                      {todayMeetings.length > 0 && (
                        <div>• {todayMeetings.length} meeting{todayMeetings.length > 1 ? 's' : ''} scheduled today</div>
                      )}
                      {activeMissions.length > 0 && (
                        <div>• {activeMissions.length} active mission{activeMissions.length > 1 ? 's' : ''}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12"
                    onClick={() => setConfirming(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleLogout}
                    className="flex-1 h-12 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white"
                  >
                    Confirm Sign Out
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </div>
      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
      </>
      );
      }