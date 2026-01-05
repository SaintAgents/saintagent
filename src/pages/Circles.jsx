import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CircleDot, Plus, Users, Search, MessageCircle, Heart, Sparkles, ArrowRight } from "lucide-react";
import CircleManageModal from "@/components/circles/CircleManageModal";
import CreateCircleModal from "@/components/community/CreateCircleModal";
import CircleChatPanel from "@/components/community/CircleChatPanel";
import GroupDetailPage from "@/components/groups/GroupDetailPage";

export default function Circles() {
  const [createOpen, setCreateOpen] = useState(false);
  const [manageCircle, setManageCircle] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: circles = [] } = useQuery({
    queryKey: ['circles'],
    queryFn: () => base44.entities.Circle.list('-created_date', 100)
  });

  const joinMutation = useMutation({
    mutationFn: async (circle) => {
      const newMembers = [...(circle.member_ids || []), user.email];
      return base44.entities.Circle.update(circle.id, {
        member_ids: newMembers,
        member_count: newMembers.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['circles'] })
  });

  const leaveMutation = useMutation({
    mutationFn: async (circle) => {
      const newMembers = (circle.member_ids || []).filter((id) => id !== user.email);
      return base44.entities.Circle.update(circle.id, {
        member_ids: newMembers,
        member_count: newMembers.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['circles'] })
  });

  // Filter circles
  const filteredCircles = circles.filter((c) => {
    // Tab filter
    if (tab === 'my_circles' && !c.member_ids?.includes(user?.email)) return false;
    if (tab === 'owned' && c.owner_id !== user?.email) return false;
    if (tab === 'featured' && !c.is_featured) return false;

    // Category filter
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.name?.toLowerCase().includes(q) &&
      !c.description?.toLowerCase().includes(q) &&
      !c.purpose?.toLowerCase().includes(q) &&
      !c.values?.some((v) => v.toLowerCase().includes(q)) &&
      !c.interests?.some((i) => i.toLowerCase().includes(q))) {
        return false;
      }
    }

    return true;
  });

  // Stats
  const myCirclesCount = circles.filter((c) => c.member_ids?.includes(user?.email)).length;
  const ownedCount = circles.filter((c) => c.owner_id === user?.email).length;

  const categoryColors = {
    spiritual: 'bg-purple-100 text-purple-700',
    creative: 'bg-pink-100 text-pink-700',
    business: 'bg-blue-100 text-blue-700',
    wellness: 'bg-emerald-100 text-emerald-700',
    learning: 'bg-amber-100 text-amber-700',
    social: 'bg-cyan-100 text-cyan-700',
    activism: 'bg-rose-100 text-rose-700',
    other: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 [data-theme='hacker']_&:bg-[#000]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white [data-theme='hacker']_&:text-[#00ff00] flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500 dark:text-cyan-400 [data-theme='hacker']_&:text-[#00ff00]" />
              Groups & Communities
            </h1>
            <p className="text-slate-500 dark:text-slate-400 [data-theme='hacker']_&:text-[#00ff00] mt-1">Find your tribe based on shared values and interests</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 [data-theme='hacker']_&:bg-[#001a00] [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:text-[#00ff00] [data-theme='hacker']_&:hover:shadow-[0_0_12px_#00ff00] rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Create Group
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white border dark:bg-slate-900/90 dark:border-slate-700 [data-theme='hacker']_&:bg-[#0a0a0a] [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:shadow-[0_0_6px_#00ff00]">
            <p className="text-xs text-slate-500 dark:text-slate-400 [data-theme='hacker']_&:text-[#00ff00]">Total Groups</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white [data-theme='hacker']_&:text-[#00ff00]">{circles.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-white border dark:bg-slate-900/90 dark:border-slate-700 [data-theme='hacker']_&:bg-[#0a0a0a] [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:shadow-[0_0_6px_#00ff00]">
            <p className="text-xs text-slate-500 dark:text-slate-400 [data-theme='hacker']_&:text-[#00ff00]">My Groups</p>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 [data-theme='hacker']_&:text-[#00ff00]">{myCirclesCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-white border dark:bg-slate-900/90 dark:border-slate-700 [data-theme='hacker']_&:bg-[#0a0a0a] [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:shadow-[0_0_6px_#00ff00]">
            <p className="text-xs text-slate-500 dark:text-slate-400 [data-theme='hacker']_&:text-[#00ff00]">I Created</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-cyan-400 [data-theme='hacker']_&:text-[#00ff00]">{ownedCount}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-cyan-400 [data-theme='hacker']_&:text-[#00ff00]" />
            <Input
              placeholder="Search by name, values, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-white dark:bg-slate-900/90 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-400 [data-theme='hacker']_&:bg-[#0a0a0a] [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:text-[#00ff00] [data-theme='hacker']_&:placeholder:text-[#006600] [data-theme='dark']_&:shadow-[0_0_10px_rgba(139,92,246,0.15)]" />

          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 h-12 rounded-xl dark:bg-slate-900/90 dark:border-slate-700 dark:text-white [data-theme='hacker']_&:bg-[#0a0a0a] [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:text-[#00ff00]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-900 dark:border-slate-700 [data-theme='hacker']_&:bg-[#0a0a0a] [data-theme='hacker']_&:border-[#00ff00]">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="spiritual">Spiritual</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="wellness">Wellness</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="activism">Activism</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="h-12 bg-white rounded-xl border dark:bg-slate-900/90 dark:border-slate-700 [data-theme='hacker']_&:bg-[#0a0a0a] [data-theme='hacker']_&:border-[#00ff00]">
            <TabsTrigger value="all" className="rounded-lg dark:text-slate-300 dark:data-[state=active]:bg-violet-600 dark:data-[state=active]:text-white [data-theme='hacker']_&:text-[#00ff00] [data-theme='hacker']_&:data-[state=active]:bg-[#001a00] [data-theme='hacker']_&:data-[state=active]:shadow-[0_0_8px_#00ff00]">All Groups</TabsTrigger>
            <TabsTrigger value="my_circles" className="rounded-lg dark:text-slate-300 dark:data-[state=active]:bg-violet-600 dark:data-[state=active]:text-white [data-theme='hacker']_&:text-[#00ff00] [data-theme='hacker']_&:data-[state=active]:bg-[#001a00] [data-theme='hacker']_&:data-[state=active]:shadow-[0_0_8px_#00ff00]">My Groups</TabsTrigger>
            <TabsTrigger value="owned" className="rounded-lg dark:text-slate-300 dark:data-[state=active]:bg-violet-600 dark:data-[state=active]:text-white [data-theme='hacker']_&:text-[#00ff00] [data-theme='hacker']_&:data-[state=active]:bg-[#001a00] [data-theme='hacker']_&:data-[state=active]:shadow-[0_0_8px_#00ff00]">I Created</TabsTrigger>
            <TabsTrigger value="featured" className="rounded-lg dark:text-slate-300 dark:data-[state=active]:bg-violet-600 dark:data-[state=active]:text-white [data-theme='hacker']_&:text-[#00ff00] [data-theme='hacker']_&:data-[state=active]:bg-[#001a00] [data-theme='hacker']_&:data-[state=active]:shadow-[0_0_8px_#00ff00]">Featured</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Circles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCircles.map((circle) => {
            const isMember = circle.member_ids?.includes(user?.email);
            const isOwner = circle.owner_id === user?.email;

            return (
              <div key={circle.id} className="bg-white dark:bg-slate-900/90 dark:border-slate-700 [data-theme='hacker']_&:bg-[#0a0a0a] [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:hover:shadow-[0_0_12px_#00ff00] rounded-xl border overflow-hidden hover:shadow-lg dark:hover:shadow-violet-500/20 transition-all">
                {/* Header gradient */}
                <div className={cn(
                  "h-24 relative",
                  circle.image_url ?
                  "" :
                  "bg-gradient-to-r from-blue-500 to-indigo-600"
                )}>
                  {circle.image_url &&
                  <img src={circle.image_url} alt={circle.name} className="w-full h-full object-cover" />
                  }
                  {circle.is_featured &&
                  <Badge className="absolute top-2 left-2 bg-amber-500 text-white gap-1">
                      <Sparkles className="w-3 h-3" /> Featured
                    </Badge>
                  }
                </div>
                
                <div className="p-4">
                  {/* Category & Visibility */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {circle.category &&
                    <Badge className={cn("text-xs", categoryColors[circle.category] || categoryColors.other)}>
                        {circle.category}
                      </Badge>
                    }
                    <Badge variant="outline" className="bg-purple-200 text-foreground px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      {circle.visibility}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-white [data-theme='hacker']_&:text-[#00ff00] mb-1">{circle.name}</h3>
                  {circle.purpose &&
                  <p className="text-xs text-violet-600 mb-2">{circle.purpose}</p>
                  }
                  <p className="text-sm text-slate-500 dark:text-slate-400 [data-theme='hacker']_&:text-[#00cc00] mb-3 line-clamp-2">{circle.description}</p>
                  
                  {/* Values */}
                  {circle.values?.length > 0 &&
                  <div className="flex flex-wrap gap-1 mb-2">
                      {circle.values.slice(0, 3).map((val, i) =>
                    <Badge key={i} variant="outline" className="text-xs bg-violet-50">
                          <Heart className="w-2.5 h-2.5 mr-1" />{val}
                        </Badge>
                    )}
                    </div>
                  }

                  {/* Interests */}
                  {circle.interests?.length > 0 &&
                  <div className="flex flex-wrap gap-1 mb-3">
                      {circle.interests.slice(0, 3).map((int, i) =>
                    <Badge key={i} variant="outline" className="bg-fuchsia-300 text-foreground px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          {int}
                        </Badge>
                    )}
                    </div>
                  }

                  {/* Member count */}
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 [data-theme='hacker']_&:text-[#00ff00] mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {circle.member_count || 0} members
                    </span>
                    {circle.meeting_frequency && circle.meeting_frequency !== 'as_needed' &&
                    <span className="text-xs capitalize">{circle.meeting_frequency}</span>
                    }
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isMember ?
                    <>
                        <Button
                        variant="outline"
                        onClick={() => setSelectedGroup(circle)}
                        className="flex-1 rounded-xl gap-1">

                          <ArrowRight className="w-4 h-4" />
                          Enter
                        </Button>
                        {circle.chat_enabled &&
                      <Button
                        onClick={() => setActiveChat(circle)}
                        className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 gap-1">

                            <MessageCircle className="w-4 h-4" />
                            Chat
                          </Button>
                      }
                      </> :

                    <Button
                      onClick={() => joinMutation.mutate(circle)}
                      disabled={joinMutation.isPending}
                      className="w-full rounded-xl bg-violet-600 hover:bg-violet-700">

                        Join Group
                      </Button>
                    }
                  </div>
                </div>
              </div>);

          })}
        </div>

        {filteredCircles.length === 0 &&
        <div className="text-center py-16">
            <CircleDot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No groups found</h3>
            <p className="text-slate-500 mb-6">Create your own group to gather like-minded people</p>
            <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2">
              <Plus className="w-4 h-4" />
              Create Group
            </Button>
          </div>
        }
      </div>

      {/* Modals */}
      <CreateCircleModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        user={user} />


      <CircleManageModal
        open={!!manageCircle}
        onOpenChange={(o) => !o && setManageCircle(null)}
        circle={manageCircle}
        currentUser={user} />


      {/* Circle Chat Panel */}
      {activeChat &&
      <div className={cn(
        "fixed z-50",
        chatExpanded ? "inset-4" : "bottom-4 right-4 w-96"
      )}>
          <CircleChatPanel
          circle={activeChat}
          user={user}
          onClose={() => setActiveChat(null)}
          expanded={chatExpanded}
          onToggleExpand={() => setChatExpanded(!chatExpanded)} />

        </div>
      }

      {/* Group Detail View */}
      {selectedGroup &&
      <div className="fixed inset-0 z-50 bg-slate-50">
          <GroupDetailPage
          circle={selectedGroup}
          user={user}
          onBack={() => setSelectedGroup(null)} />

        </div>
      }
    </div>);

}