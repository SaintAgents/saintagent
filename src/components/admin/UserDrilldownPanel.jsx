import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, Coins, MessageSquare, Target, MapPin, Hash, Calendar,
  TrendingUp, Eye, Clock, ArrowUpRight, ArrowDownRight, Users, 
  Zap, Star, BookOpen, ShoppingBag, Globe
} from 'lucide-react';
import { cn } from "@/lib/utils";
import moment from 'moment';

export default function UserDrilldownPanel({ profile, isOnline, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user-specific data
  const { data: userTransactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ['drilldownTx', profile.user_id],
    queryFn: () => base44.entities.GGGTransaction.filter({ user_id: profile.user_id }, '-created_date', 50),
    enabled: !!profile.user_id,
  });

  const { data: userPosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['drilldownPosts', profile.user_id],
    queryFn: () => base44.entities.Post.filter({ author_id: profile.user_id }, '-created_date', 30),
    enabled: !!profile.user_id,
  });

  const { data: userBookings = [] } = useQuery({
    queryKey: ['drilldownBookings', profile.user_id],
    queryFn: () => base44.entities.Booking.filter({ buyer_id: profile.user_id }, '-created_date', 20),
    enabled: !!profile.user_id,
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: ['drilldownBadges', profile.user_id],
    queryFn: () => base44.entities.Badge.filter({ user_id: profile.user_id }, '-created_date', 50),
    enabled: !!profile.user_id,
  });

  const { data: liveStatus } = useQuery({
    queryKey: ['drilldownLiveStatus', profile.user_id],
    queryFn: async () => {
      const statuses = await base44.entities.LiveStatus.filter({ user_id: profile.user_id });
      return statuses?.[0] || null;
    },
    enabled: !!profile.user_id,
  });

  // GGG balance is maintained on profile.ggg_balance — single source of truth
  const gggBalance = profile?.ggg_balance || 0;
  // Earned/spent breakdown from transactions (for admin detail view only)
  const gggEarned = userTransactions.filter(t => t.delta > 0).reduce((sum, t) => sum + t.delta, 0);
  const gggSpent = userTransactions.filter(t => t.delta < 0).reduce((sum, t) => sum + Math.abs(t.delta), 0);

  return (
    <Card className="sticky top-32">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative" data-user-id={profile.user_id}>
              <Avatar className="w-12 h-12 cursor-pointer">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-violet-100 text-violet-700">
                  {(profile.display_name || '?')[0]}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">{profile.display_name || 'Unknown'}</CardTitle>
              <p className="text-xs text-slate-400">{profile.user_id}</p>
              <div className="flex items-center gap-2 mt-1">
                {profile.sa_number && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                    <Hash className="w-2.5 h-2.5 mr-0.5" />SA{profile.sa_number}
                  </Badge>
                )}
                <Badge className={cn("text-[10px]",
                  isOnline ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                )}>
                  {isOnline ? 'Online' : liveStatus?.status || 'offline'}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Quick Stats Grid */}
      <CardContent className="pb-2">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2 rounded-lg bg-amber-50 text-center">
            <p className="text-lg font-bold text-amber-700">{parseFloat(gggBalance.toFixed(2))}</p>
            <p className="text-[10px] text-amber-500">GGG Balance</p>
          </div>
          <div className="p-2 rounded-lg bg-violet-50 text-center">
            <p className="text-lg font-bold text-violet-700">{profile.rank_points || 0}</p>
            <p className="text-[10px] text-violet-500">Rank Points</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 text-center">
            <p className="text-lg font-bold text-blue-700">{profile.follower_count || 0}</p>
            <p className="text-[10px] text-blue-500">Followers</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-slate-50 text-center">
            <p className="text-xs font-bold text-slate-700">{userPosts.length}</p>
            <p className="text-[9px] text-slate-400">Posts</p>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-50 text-center">
            <p className="text-xs font-bold text-slate-700">{userTransactions.length}</p>
            <p className="text-[9px] text-slate-400">Txns</p>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-50 text-center">
            <p className="text-xs font-bold text-slate-700">{userBadges.length}</p>
            <p className="text-[9px] text-slate-400">Badges</p>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-50 text-center">
            <p className="text-xs font-bold text-slate-700">{userBookings.length}</p>
            <p className="text-[9px] text-slate-400">Bookings</p>
          </div>
        </div>
        {/* Meta info row */}
        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 mb-1">
          {profile.location && (
            <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{profile.location}</span>
          )}
          <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />Joined {moment(profile.created_date).format('MMM YYYY')}</span>
          <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5" />{profile.rank_code || 'seeker'}</span>
        </div>
        {liveStatus?.current_activity && (
          <div className="text-[10px] text-emerald-600 bg-emerald-50 rounded px-2 py-1 mt-1">
            <Zap className="w-2.5 h-2.5 inline mr-1" />
            {liveStatus.current_activity}
          </div>
        )}
      </CardContent>

      {/* Tabs for drilldown */}
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full h-8 text-xs">
            <TabsTrigger value="overview" className="text-xs px-2">
              <Eye className="w-3 h-3 mr-1" />Info
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs px-2">
              <Coins className="w-3 h-3 mr-1" />Txns ({userTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="text-xs px-2">
              <MessageSquare className="w-3 h-3 mr-1" />Posts ({userPosts.length})
            </TabsTrigger>
            <TabsTrigger value="badges" className="text-xs px-2">
              <Star className="w-3 h-3 mr-1" />Badges ({userBadges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-3">
            <div className="space-y-2">
              <InfoRow label="Handle" value={`@${profile.handle || 'none'}`} />
              <InfoRow label="Email" value={profile.user_id} />
              <InfoRow label="Region" value={profile.region || 'N/A'} />
              <InfoRow label="Timezone" value={profile.timezone || 'N/A'} />
              <InfoRow label="DM Policy" value={profile.dm_policy || 'everyone'} />
              <InfoRow label="Profile Visibility" value={profile.profile_visibility || 'public'} />
              <InfoRow label="Theme" value={profile.theme_preference || 'light'} />
              <InfoRow label="Last Updated" value={moment(profile.updated_date).format('MMM D, YYYY h:mm A')} />
              {profile.bio && (
                <div className="p-2 rounded-lg bg-slate-50 mt-2">
                  <p className="text-[10px] text-slate-400 mb-1">Bio</p>
                  <p className="text-xs text-slate-600 line-clamp-3">{profile.bio}</p>
                </div>
              )}
              {/* GGG Flow */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2 rounded-lg bg-green-50">
                  <div className="flex items-center gap-1 mb-1">
                    <ArrowUpRight className="w-3 h-3 text-green-600" />
                    <p className="text-[10px] text-green-600 font-medium">Earned</p>
                  </div>
                  <p className="text-sm font-bold text-green-700">{gggEarned.toFixed(2)} GGG</p>
                </div>
                <div className="p-2 rounded-lg bg-red-50">
                  <div className="flex items-center gap-1 mb-1">
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                    <p className="text-[10px] text-red-500 font-medium">Spent</p>
                  </div>
                  <p className="text-sm font-bold text-red-600">{gggSpent.toFixed(2)} GGG</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-3">
            {loadingTx ? (
              <div className="py-8 text-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600 mx-auto" /></div>
            ) : userTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No transactions</p>
            ) : (
              <ScrollArea className="h-[350px]">
                <div className="space-y-1">
                  {userTransactions.map(tx => (
                    <div key={tx.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 border-b border-slate-50 last:border-0">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        tx.delta > 0 ? "bg-green-100" : "bg-red-100"
                      )}>
                        {tx.delta > 0 
                          ? <ArrowUpRight className="w-3 h-3 text-green-600" />
                          : <ArrowDownRight className="w-3 h-3 text-red-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 truncate">{tx.description || tx.reason_code || 'Transaction'}</p>
                        <p className="text-[10px] text-slate-400">{moment(tx.created_date).format('MMM D, h:mm A')}</p>
                      </div>
                      <span className={cn("text-xs font-bold whitespace-nowrap",
                        tx.delta > 0 ? "text-green-600" : "text-red-500"
                      )}>
                        {tx.delta > 0 ? '+' : ''}{tx.delta?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-3">
            {loadingPosts ? (
              <div className="py-8 text-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600 mx-auto" /></div>
            ) : userPosts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No posts</p>
            ) : (
              <ScrollArea className="h-[350px]">
                <div className="space-y-2">
                  {userPosts.map(post => (
                    <div key={post.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-700 line-clamp-3">{post.content || '(no text)'}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                        <span>{moment(post.created_date).format('MMM D, h:mm A')}</span>
                        <span>❤️ {post.likes_count || 0}</span>
                        <span>💬 {post.comments_count || 0}</span>
                        {post.image_urls?.length > 0 && <span>📷 {post.image_urls.length}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="badges" className="mt-3">
            {userBadges.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No badges earned</p>
            ) : (
              <ScrollArea className="h-[350px]">
                <div className="space-y-1">
                  {userBadges.map(badge => (
                    <div key={badge.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{badge.name || badge.code}</p>
                        <p className="text-[10px] text-slate-400">{badge.category || 'general'} · {moment(badge.created_date).format('MMM D, YYYY')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium text-right truncate max-w-[60%]">{value}</span>
    </div>
  );
}