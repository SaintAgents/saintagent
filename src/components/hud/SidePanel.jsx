import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import EmojiPicker from "@/components/messages/EmojiPicker";
import { 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Calendar,
  Zap,
  Coins,
  TrendingUp,
  HelpCircle,
  Clock,
  ArrowRight,
  Heart,
  MessageCircle,
  Share2,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  List
} from "lucide-react";
import ProgressRing from './ProgressRing';
import CollapsibleCard from '@/components/hud/CollapsibleCard';
import FloatingPanel from '@/components/hud/FloatingPanel';
import { format, parseISO, isToday, isTomorrow } from "date-fns";

export default function SidePanel({ 
  matches = [], 
  meetings = [], 
  profile,
  isOpen,
  onToggle,
  onMatchAction,
  onMeetingAction
}) {
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [newPostText, setNewPostText] = useState('');
  const queryClient = useQueryClient();

  // Popout states for sections
  const [gggPopupOpen, setGggPopupOpen] = useState(false);
  const [gggAuditOpen, setGggAuditOpen] = useState(false);
  const [gggTxOpen, setGggTxOpen] = useState(false);
  const [schedulePopupOpen, setSchedulePopupOpen] = useState(false);
  const [matchesPopupOpen, setMatchesPopupOpen] = useState(false);
  const [helpPopupOpen, setHelpPopupOpen] = useState(false);
  const [feedPopupOpen, setFeedPopupOpen] = useState(false);

  // Fetch posts
  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 10)
  });

  // Fetch likes
  const { data: allLikes = [] } = useQuery({
    queryKey: ['postLikes'],
    queryFn: () => base44.entities.PostLike.list()
  });

  // Fetch comments
  const { data: allComments = [] } = useQuery({
    queryKey: ['postComments'],
    queryFn: () => base44.entities.PostComment.list('-created_date')
  });

  // Audit trail data (GGG + Reputation)
  const { data: gggTx = [] } = useQuery({
    queryKey: ['gggTx', profile?.user_id],
    queryFn: () => base44.entities.GGGTransaction.filter({ user_id: profile.user_id }, '-created_date', 100),
    enabled: !!profile?.user_id
  });

  const { data: rpEvents = [] } = useQuery({
    queryKey: ['rpEvents', profile?.user_id],
    queryFn: () => base44.entities.ReputationEvent.filter({ user_id: profile.user_id }, '-created_date', 100),
    enabled: !!profile?.user_id
  });

  const auditItems = React.useMemo(() => {
    const txs = (gggTx || []).map(it => ({ ...it, _type: 'ggg' }));
    const rps = (rpEvents || []).map(it => ({ ...it, _type: 'rp' }));
    return [...txs, ...rps].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [gggTx, rpEvents]);

  const likeMutation = useMutation({
    mutationFn: async ({ postId, userId }) => {
      const existing = allLikes.find(l => l.post_id === postId && l.user_id === userId);
      if (existing) {
        await base44.entities.PostLike.delete(existing.id);
        const post = posts.find(p => p.id === postId);
        if (post) {
          await base44.entities.Post.update(postId, { likes_count: Math.max(0, (post.likes_count || 0) - 1) });
        }
      } else {
        await base44.entities.PostLike.create({ post_id: postId, user_id: userId });
        const post = posts.find(p => p.id === postId);
        if (post) {
          await base44.entities.Post.update(postId, { likes_count: (post.likes_count || 0) + 1 });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postLikes'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }) => {
      await base44.entities.PostComment.create({
        post_id: postId,
        author_id: profile.user_id,
        author_name: profile.display_name,
        author_avatar: profile.avatar_url,
        content
      });
      const post = posts.find(p => p.id === postId);
      if (post) {
        await base44.entities.Post.update(postId, { comments_count: (post.comments_count || 0) + 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postComments'] });
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.Post.create({
        author_id: profile.user_id,
        author_name: profile.display_name,
        author_avatar: profile.avatar_url,
        content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPostText('');
    }
  });

  const handleLike = (postId) => {
    likeMutation.mutate({ postId, userId: profile?.user_id });
  };

  const handleComment = (postId) => {
    const text = commentText[postId];
    if (text?.trim()) {
      commentMutation.mutate({ postId, content: text.trim() });
      setCommentText({ ...commentText, [postId]: '' });
    }
  };

  const handleCreatePost = () => {
    if (newPostText.trim()) {
      createPostMutation.mutate(newPostText.trim());
    }
  };

  const isLikedByUser = (postId) => {
    return allLikes.some(l => l.post_id === postId && l.user_id === profile?.user_id);
  };

  const getPostComments = (postId) => {
    return allComments.filter(c => c.post_id === postId);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow ${format(date, 'h:mm a')}`;
    return format(date, "MMM d, h:mm a");
  };

  const rankProgress = profile?.ggg_balance || 0;
  const nextRankAt = 100;

  return (
    <div className={cn(
      "fixed right-0 top-0 h-screen bg-white border-l border-slate-200 shadow-xl z-40 transition-all duration-300 flex flex-col",
      isOpen ? "w-80" : "w-0 overflow-hidden"
    )}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -left-10 top-1/2 -translate-y-1/2 w-10 h-20 bg-white border border-r-0 border-slate-200 rounded-l-xl flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors"
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5 text-slate-600" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        )}
      </button>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Control Panel */}
          <div data-ggg-controls className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-lg btn-ctrl" onClick={() => setGggAuditOpen(true)}>
                <Activity className="w-4 h-4 mr-1" />
                Audit
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg btn-ctrl" onClick={() => setGggPopupOpen(true)}>
                <TrendingUp className="w-4 h-4 mr-1" />
                Rank
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg btn-ctrl" onClick={() => setGggTxOpen(true)}>
                <List className="w-4 h-4 mr-1" />
                Transactions
              </Button>
            </div>
            <div className="text-xs text-slate-600">
              Next rank in <span className="font-semibold text-violet-700">{Math.max(0, nextRankAt - rankProgress)}</span> pts
            </div>
          </div>

          {/* GGG & Rank */}
          <CollapsibleCard title="GGG & Rank" icon={Coins} onPopout={() => setGggPopupOpen(true)}>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">GGG Balance</p>
                  <p className="text-2xl font-bold text-violet-900 flex items-center gap-1.5">
                    <Coins className="w-5 h-5 text-amber-500" />
                    {profile?.ggg_balance?.toLocaleString() || 0}
                  </p>
                </div>
                <ProgressRing 
                  value={rankProgress} 
                  max={nextRankAt} 
                  size={64}
                  strokeWidth={5}
                  label={profile?.rank_code?.charAt(0).toUpperCase()}
                  sublabel="Rank"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">To next rank</span>
                <span className="font-medium text-violet-700">{nextRankAt - rankProgress} pts</span>
              </div>
              <div className="flex justify-end mt-3">
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setGggAuditOpen(true)}>
                  View audit trail
                </Button>
              </div>
            </div>
          </CollapsibleCard>

          {/* Today's Schedule */}
          <CollapsibleCard title="Today's Schedule" icon={Calendar} badge={meetings.length} badgeColor="blue" onPopout={() => setSchedulePopupOpen(true)}>
            <div className="space-y-2">
              {meetings.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No meetings today</p>
              ) : (
                meetings.slice(0, 4).map((meeting, i) => (
                  <button
                    key={i}
                    onClick={() => onMeetingAction?.('view', meeting)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{meeting.title}</p>
                      <p className="text-xs text-slate-500">{formatTime(meeting.scheduled_time)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))
              )}
            </div>
          </CollapsibleCard>

          {/* Top Matches */}
          <CollapsibleCard title="Top Matches" icon={Sparkles} badge={matches.length} badgeColor="violet" onPopout={() => setMatchesPopupOpen(true)}>
            <div className="space-y-2">
              {matches.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No matches yet</p>
              ) : (
                matches.slice(0, 5).map((match, i) => {
                  const handleClick = () => {
                    if (match.target_type === 'person') {
                      const event = new CustomEvent('openProfile', { detail: { userId: match.target_id } });
                      document.dispatchEvent(event);
                    } else if (match.target_type === 'offer') {
                      window.location.href = '/Marketplace';
                    } else if (match.target_type === 'mission') {
                      window.location.href = '/Missions';
                    } else if (match.target_type === 'event') {
                      window.location.href = '/Meetings';
                    } else {
                      onMatchAction?.('view', match);
                    }
                  };

                  return (
                    <button
                      key={i}
                      onClick={handleClick}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-violet-50 hover:border-violet-200 border border-transparent transition-colors text-left"
                    >
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (match.target_type === 'person') {
                            const event = new CustomEvent('openProfile', { detail: { userId: match.target_id } });
                            document.dispatchEvent(event);
                          }
                        }}
                        data-user-id={match.target_type === 'person' ? match.target_id : null}
                      >
                        <Avatar className="w-9 h-9 cursor-pointer hover:ring-2 hover:ring-violet-300 transition-all">
                          <AvatarImage src={match.target_avatar} />
                          <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                            {match.target_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{match.target_name}</p>
                        <p className="text-xs text-slate-500 truncate">{match.target_subtitle}</p>
                      </div>
                      <div className="text-sm font-bold text-violet-600">{match.match_score}%</div>
                    </button>
                  );
                })
              )}
            </div>
          </CollapsibleCard>


          {/* Help */}
          <CollapsibleCard title="Help" icon={HelpCircle} defaultOpen={false} onPopout={() => setHelpPopupOpen(true)}>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-200">
                  <HelpCircle className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Need help?</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Learn how the Synchronicity Engine finds your perfect matches.
                  </p>
                  <Button variant="link" size="sm" className="h-6 px-0 text-xs text-violet-600">
                    View guide →
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleCard>

          {/* Community Feed */}
          <CollapsibleCard title="Community Feed" icon={MessageCircle} defaultOpen={true} onPopout={() => setFeedPopupOpen(true)}>
            {/* Create Post */}
            <div className="mb-4 p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="w-9 h-9 cursor-pointer" data-user-id={profile?.user_id}>
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                    {profile?.display_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="What's on your mind?"
                  className="flex-1 resize-none text-sm"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <EmojiPicker onSelect={(e) => setNewPostText((prev) => (prev || '') + e)} />
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostText.trim() || createPostMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700"
                  size="sm"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Post
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No posts yet</p>
              ) : (
                posts.map((post) => {
                  const postComments = getPostComments(post.id);
                  const isLiked = isLikedByUser(post.id);
                  const showComments = expandedComments[post.id];

                  return (
                    <div key={post.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                      {/* Post Header */}
                      <div className="flex items-start gap-3">
                        <Avatar className="w-9 h-9 cursor-pointer hover:ring-2 hover:ring-violet-300 transition-all" data-user-id={post.author_id}>
                          <AvatarImage src={post.author_avatar} />
                          <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                            {post.author_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{post.author_name}</p>
                          <p className="text-xs text-slate-500">
                            {format(parseISO(post.created_date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>

                      {/* Post Content */}
                      <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>

                      {post.image_urls && post.image_urls.length > 0 && (
                        <img 
                          src={post.image_urls[0]} 
                          alt="" 
                          className="w-full rounded-lg"
                        />
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={cn(
                            "flex items-center gap-1.5 text-xs transition-colors",
                            isLiked ? "text-rose-600" : "text-slate-500 hover:text-rose-600"
                          )}
                        >
                          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                          <span className="font-medium">{post.likes_count || 0}</span>
                        </button>
                        <button
                          onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !showComments })}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">{post.comments_count || 0}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Comments Section */}
                      {showComments && (
                        <div className="space-y-3 pt-2">
                          {/* Existing Comments */}
                          {postComments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-2">
                              <Avatar className="w-7 h-7 cursor-pointer hover:ring-2 hover:ring-violet-300 transition-all" data-user-id={comment.author_id}>
                                <AvatarImage src={comment.author_avatar} />
                                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                                  {comment.author_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 p-2 rounded-lg bg-slate-50">
                                <p className="text-xs font-medium text-slate-900">{comment.author_name}</p>
                                <p className="text-xs text-slate-700 mt-0.5">{comment.content}</p>
                              </div>
                            </div>
                          ))}

                          {/* Comment Input */}
                          <div className="flex items-start gap-2">
                            <Avatar className="w-7 h-7 cursor-pointer" data-user-id={profile?.user_id}>
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
                                {profile?.display_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex items-end gap-2">
                              <Textarea
                                value={commentText[post.id] || ''}
                                onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                                placeholder="Write a comment..."
                                className="text-xs h-8 resize-none"
                                rows={1}
                              />
                              <EmojiPicker onSelect={(e) => setCommentText({ ...commentText, [post.id]: ((commentText[post.id] || '') + e) })} />
                              <Button
                                size="sm"
                                onClick={() => handleComment(post.id)}
                                disabled={!commentText[post.id]?.trim()}
                                className="h-8 w-8 p-0"
                              >
                                <Send className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CollapsibleCard>
        </div>
      {/* Popout Panels */}
      {gggPopupOpen && (
        <FloatingPanel title="GGG & Rank" onClose={() => setGggPopupOpen(false)}>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">GGG Balance</p>
                <p className="text-2xl font-bold text-violet-900 flex items-center gap-1.5">
                  <Coins className="w-5 h-5 text-amber-500" />
                  {profile?.ggg_balance?.toLocaleString() || 0}
                </p>
              </div>
              <ProgressRing 
                value={rankProgress} 
                max={nextRankAt} 
                size={64}
                strokeWidth={5}
                label={profile?.rank_code?.charAt(0).toUpperCase()}
                sublabel="Rank"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">To next rank</span>
              <span className="font-medium text-violet-700">{nextRankAt - rankProgress} pts</span>
            </div>
            <div className="flex justify-end mt-3">
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setGggAuditOpen(true)}>
                View audit trail
              </Button>
            </div>
          </div>
        </FloatingPanel>
      )}

      {gggAuditOpen && (
        <FloatingPanel title="GGG Audit Trail" onClose={() => setGggAuditOpen(false)}>
          <div className="space-y-2">
            {auditItems.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No audit entries yet</p>
            ) : (
              auditItems.map((item) => {
                const isGGG = item._type === 'ggg';
                const positive = (item.delta || 0) >= 0;
                return (
                  <div key={`${item._type}-${item.id}`} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                    <div className={`p-2 rounded-lg ${isGGG ? 'bg-amber-100' : positive ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                      {isGGG ? (
                        <Coins className="w-4 h-4 text-amber-600" />
                      ) : positive ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">
                          {isGGG ? (item.reason_code || 'GGG transaction') : (item.reason_code || 'Reputation update')}
                        </p>
                        <span className={`text-sm font-semibold ${isGGG ? (positive ? 'text-amber-700' : 'text-slate-700') : (positive ? 'text-emerald-700' : 'text-rose-700')}`}>
                          {positive ? '+' : ''}{item.delta}{isGGG ? ' GGG' : ' RP'}{!isGGG && item.rp_after != null ? ` • ${item.rp_after} RP` : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {isGGG ? (item.source_type || 'reward') : (item.source_type || 'system')}
                        {item.reason_code ? ` • ${item.reason_code}` : ''}
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1">
                        {format(parseISO(item.created_date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </FloatingPanel>
        )}

        {gggTxOpen && (
         <FloatingPanel title="GGG Transactions" onClose={() => setGggTxOpen(false)}>
           <div className="space-y-2">
             {(gggTx || []).length === 0 ? (
               <p className="text-sm text-slate-400 py-4 text-center">No transactions</p>
             ) : (
               gggTx.map((tx) => {
                 const positive = (tx.delta || 0) >= 0;
                 return (
                   <div key={tx.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                     <div className="p-2 rounded-lg bg-amber-100">
                       <Coins className="w-4 h-4 text-amber-600" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between">
                         <p className="text-sm font-medium text-slate-900">{tx.reason_code || 'Transaction'}</p>
                         <span className={`text-sm font-semibold ${positive ? 'text-amber-700' : 'text-slate-700'}`}>
                           {positive ? '+' : ''}{tx.delta} GGG
                         </span>
                       </div>
                       <p className="text-xs text-slate-500">
                         {tx.source_type || 'reward'}{tx.source_id ? ` • #${tx.source_id}` : ''}
                       </p>
                       {tx.description && <p className="text-xs text-slate-600 mt-1">{tx.description}</p>}
                       <p className="text-[11px] text-slate-400 mt-1">{format(parseISO(tx.created_date), 'MMM d, h:mm a')}</p>
                     </div>
                   </div>
                 );
               })
             )}
           </div>
         </FloatingPanel>
        )}

        {schedulePopupOpen && (
        <FloatingPanel title="Today's Schedule" onClose={() => setSchedulePopupOpen(false)}>
          <div className="space-y-2">
            {meetings.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No meetings today</p>
            ) : (
              meetings.map((meeting, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{meeting.title}</p>
                    <p className="text-xs text-slate-500">{formatTime(meeting.scheduled_time)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </FloatingPanel>
      )}

      {matchesPopupOpen && (
        <FloatingPanel title="Top Matches" onClose={() => setMatchesPopupOpen(false)}>
          <div className="space-y-2">
            {matches.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No matches yet</p>
            ) : (
              matches.map((match, i) => (
                <div key={i} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={match.target_avatar} />
                    <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                      {match.target_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{match.target_name}</p>
                    <p className="text-xs text-slate-500 truncate">{match.target_subtitle}</p>
                  </div>
                  <div className="text-sm font-bold text-violet-600">{match.match_score}%</div>
                </div>
              ))
            )}
          </div>
        </FloatingPanel>
      )}

      {helpPopupOpen && (
        <FloatingPanel title="Help" onClose={() => setHelpPopupOpen(false)}>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-200">
                <HelpCircle className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Need help?</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Learn how the Synchronicity Engine finds your perfect matches.
                </p>
                <Button variant="link" size="sm" className="h-6 px-0 text-xs text-violet-600">
                  View guide →
                </Button>
              </div>
            </div>
          </div>
        </FloatingPanel>
      )}

      {feedPopupOpen && (
        <FloatingPanel title="Community Feed" onClose={() => setFeedPopupOpen(false)}>
          <div className="space-y-4">
            {/* Create Post */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                    {profile?.display_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="What's on your mind?"
                  className="flex-1 resize-none text-sm"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <EmojiPicker onSelect={(e) => setNewPostText((prev) => (prev || '') + e)} />
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostText.trim() || createPostMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700"
                  size="sm"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Post
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No posts yet</p>
              ) : (
                posts.map((post) => {
                  const postComments = getPostComments(post.id);
                  const isLiked = isLikedByUser(post.id);
                  const showComments = expandedComments[post.id];
                  return (
                    <div key={post.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={post.author_avatar} />
                          <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                            {post.author_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{post.author_name}</p>
                          <p className="text-xs text-slate-500">{format(parseISO(post.created_date), 'MMM d, h:mm a')}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
                      {post.image_urls && post.image_urls.length > 0 && (
                        <img src={post.image_urls[0]} alt="" className="w-full rounded-lg" />
                      )}
                      <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={cn("flex items-center gap-1.5 text-xs transition-colors", isLiked ? "text-rose-600" : "text-slate-500 hover:text-rose-600")}
                        >
                          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                          <span className="font-medium">{post.likes_count || 0}</span>
                        </button>
                        <button
                          onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !showComments })}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">{post.comments_count || 0}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                      {showComments && (
                        <div className="space-y-3 pt-2">
                          {postComments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-2">
                              <Avatar className="w-7 h-7">
                                <AvatarImage src={comment.author_avatar} />
                                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                                  {comment.author_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 p-2 rounded-lg bg-slate-50">
                                <p className="text-xs font-medium text-slate-900">{comment.author_name}</p>
                                <p className="text-xs text-slate-700 mt-0.5">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex items-start gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
                                {profile?.display_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex items-end gap-2">
                             <Textarea
                               value={commentText[post.id] || ''}
                               onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                               placeholder="Write a comment..."
                               className="text-xs h-8 resize-none"
                               rows={1}
                             />
                             <EmojiPicker onSelect={(e) => setCommentText({ ...commentText, [post.id]: ((commentText[post.id] || '') + e) })} />
                             <Button size="sm" onClick={() => handleComment(post.id)} disabled={!commentText[post.id]?.trim()} className="h-8 w-8 p-0">
                               <Send className="w-3 h-3" />
                             </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </FloatingPanel>
      )}
      </ScrollArea>
    </div>
  );
}