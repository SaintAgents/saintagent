import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Network, Star, Shield, Heart, ThumbsUp,
  Loader2, Plus, Search, ChevronRight, Award, Zap,
  Code, Palette, BookOpen, Target, Crown, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// Endorsement categories with icons
const ENDORSEMENT_CATEGORIES = {
  technical: { label: 'Technical', icon: Code, color: 'blue' },
  creative: { label: 'Creative', icon: Palette, color: 'pink' },
  spiritual: { label: 'Spiritual', icon: Star, color: 'violet' },
  leadership: { label: 'Leadership', icon: Crown, color: 'amber' },
  collaboration: { label: 'Collaboration', icon: Users, color: 'emerald' },
  communication: { label: 'Communication', icon: Heart, color: 'rose' },
  reliability: { label: 'Reliability', icon: Shield, color: 'slate' },
  expertise: { label: 'Expertise', icon: BookOpen, color: 'orange' }
};

// Common endorsable qualities
const COMMON_QUALITIES = {
  skills: [
    'Web Development', 'Design', 'Writing', 'Marketing', 'Project Management',
    'Data Analysis', 'AI/ML', 'Blockchain', 'Video Production', 'Photography'
  ],
  qualities: [
    'Reliable Collaborator', 'Clear Communicator', 'Creative Problem Solver',
    'Great Mentor', 'Quick Learner', 'Supportive Teammate', 'Visionary Leader',
    'Detail Oriented', 'Empathetic Listener', 'Strategic Thinker'
  ],
  spiritual: [
    'Meditation Guide', 'Energy Healer', 'Intuitive Reader', 'Breathwork Facilitator',
    'Sound Healer', 'Spiritual Counselor', 'Ceremony Holder', 'Crystal Worker'
  ]
};

export default function TrustNetworkGraph({ userId, profile }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('received');
  const [showEndorseModal, setShowEndorseModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch endorsements received
  const { data: receivedEndorsements = [] } = useQuery({
    queryKey: ['receivedEndorsements', userId],
    queryFn: () => base44.entities.SkillEndorsement.filter({ to_user_id: userId }),
    enabled: !!userId
  });

  // Fetch endorsements given
  const { data: givenEndorsements = [] } = useQuery({
    queryKey: ['givenEndorsements', userId],
    queryFn: () => base44.entities.SkillEndorsement.filter({ from_user_id: userId }),
    enabled: !!userId
  });

  // Fetch all profiles for network
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 100)
  });

  // Fetch followings for trust network
  const { data: followings = [] } = useQuery({
    queryKey: ['userFollowings', userId],
    queryFn: () => base44.entities.Follow.filter({ follower_id: userId }),
    enabled: !!userId
  });

  // Calculate trust network stats
  const calculateNetworkStats = () => {
    // Unique endorsers
    const uniqueEndorsers = [...new Set(receivedEndorsements.map(e => e.from_user_id))];
    
    // Category breakdown
    const categoryBreakdown = {};
    receivedEndorsements.forEach(e => {
      const cat = e.category || 'general';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    // Top skills
    const skillCounts = {};
    receivedEndorsements.forEach(e => {
      skillCounts[e.skill_or_quality] = (skillCounts[e.skill_or_quality] || 0) + 1;
    });
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Average strength
    const avgStrength = receivedEndorsements.length > 0
      ? receivedEndorsements.reduce((sum, e) => sum + (e.strength_level || 3), 0) / receivedEndorsements.length
      : 0;

    return {
      totalReceived: receivedEndorsements.length,
      totalGiven: givenEndorsements.length,
      uniqueEndorsers: uniqueEndorsers.length,
      categoryBreakdown,
      topSkills,
      avgStrength,
      networkSize: followings.length
    };
  };

  const stats = calculateNetworkStats();

  // Build trust network visualization data
  const buildNetworkData = () => {
    const nodes = new Map();
    const connections = [];

    // Add self as center
    nodes.set(userId, {
      id: userId,
      type: 'self',
      profile: profile,
      x: 200,
      y: 200
    });

    // Add endorsers
    receivedEndorsements.forEach((endorsement, idx) => {
      if (!nodes.has(endorsement.from_user_id)) {
        const endorserProfile = allProfiles.find(p => p.user_id === endorsement.from_user_id);
        const angle = (idx / Math.min(receivedEndorsements.length, 12)) * 2 * Math.PI;
        const radius = 120;
        nodes.set(endorsement.from_user_id, {
          id: endorsement.from_user_id,
          type: 'endorser',
          profile: endorserProfile,
          x: 200 + Math.cos(angle) * radius,
          y: 200 + Math.sin(angle) * radius,
          endorsements: receivedEndorsements.filter(e => e.from_user_id === endorsement.from_user_id)
        });
      }
      connections.push({
        from: endorsement.from_user_id,
        to: userId,
        strength: endorsement.strength_level || 3
      });
    });

    return { nodes: Array.from(nodes.values()), connections };
  };

  const networkData = buildNetworkData();

  // Filter profiles for endorsement
  const filteredProfiles = allProfiles.filter(p => 
    p.user_id !== userId &&
    (p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.handle?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-4 text-center">
            <ThumbsUp className="w-6 h-6 text-violet-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-900">{stats.totalReceived}</p>
            <p className="text-xs text-slate-600">Endorsements Received</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4 text-center">
            <Award className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-900">{stats.totalGiven}</p>
            <p className="text-xs text-slate-600">Endorsements Given</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-900">{stats.uniqueEndorsers}</p>
            <p className="text-xs text-slate-600">Unique Endorsers</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 text-amber-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-900">{stats.avgStrength.toFixed(1)}</p>
            <p className="text-xs text-slate-600">Avg. Strength (1-5)</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Skills */}
      {stats.topSkills.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Top Endorsed Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.topSkills.map(([skill, count]) => (
                <Badge 
                  key={skill} 
                  className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1"
                >
                  {skill} <span className="ml-1 text-amber-600">×{count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Visualization */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-violet-600" />
              <CardTitle className="text-lg">Trust Network</CardTitle>
            </div>
            <Button
              onClick={() => setShowEndorseModal(true)}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Endorse Someone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TrustNetworkVisualization 
            networkData={networkData}
            onNodeClick={(node) => {
              if (node.type !== 'self') {
                document.dispatchEvent(new CustomEvent('openProfile', { 
                  detail: { userId: node.id } 
                }));
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Endorsements Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
              <TabsTrigger value="received" className="rounded-none">
                Received ({receivedEndorsements.length})
              </TabsTrigger>
              <TabsTrigger value="given" className="rounded-none">
                Given ({givenEndorsements.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="p-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {receivedEndorsements.length === 0 ? (
                    <div className="text-center py-8">
                      <ThumbsUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No endorsements received yet</p>
                      <p className="text-sm text-slate-400">Build your reputation by collaborating with others</p>
                    </div>
                  ) : (
                    receivedEndorsements.map(endorsement => (
                      <EndorsementCard 
                        key={endorsement.id} 
                        endorsement={endorsement}
                        profiles={allProfiles}
                        showFrom={true}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="given" className="p-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {givenEndorsements.length === 0 ? (
                    <div className="text-center py-8">
                      <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">You haven't endorsed anyone yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-3"
                        onClick={() => setShowEndorseModal(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Endorse Someone
                      </Button>
                    </div>
                  ) : (
                    givenEndorsements.map(endorsement => (
                      <EndorsementCard 
                        key={endorsement.id} 
                        endorsement={endorsement}
                        profiles={allProfiles}
                        showFrom={false}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Endorse Modal */}
      <EndorseUserModal
        open={showEndorseModal}
        onClose={() => {
          setShowEndorseModal(false);
          setSelectedUser(null);
        }}
        fromUserId={userId}
        profiles={filteredProfiles}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
}

// Simple network visualization component
function TrustNetworkVisualization({ networkData, onNodeClick }) {
  const { nodes, connections } = networkData;

  return (
    <div className="relative w-full h-80 bg-gradient-to-br from-slate-50 to-violet-50 rounded-xl overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        {/* Draw connections */}
        {connections.map((conn, idx) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;
          
          return (
            <line
              key={idx}
              x1={`${(fromNode.x / 400) * 100}%`}
              y1={`${(fromNode.y / 400) * 100}%`}
              x2={`${(toNode.x / 400) * 100}%`}
              y2={`${(toNode.y / 400) * 100}%`}
              stroke={`rgba(139, 92, 246, ${conn.strength * 0.15})`}
              strokeWidth={conn.strength * 0.5}
            />
          );
        })}
      </svg>

      {/* Draw nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className={cn(
            "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110",
            node.type === 'self' && "z-10"
          )}
          style={{
            left: `${(node.x / 400) * 100}%`,
            top: `${(node.y / 400) * 100}%`
          }}
          onClick={() => onNodeClick(node)}
        >
          <div className={cn(
            "rounded-full border-2 overflow-hidden",
            node.type === 'self' 
              ? "w-16 h-16 border-violet-500 ring-4 ring-violet-200" 
              : "w-10 h-10 border-slate-300"
          )}>
            {node.profile?.avatar_url ? (
              <img 
                src={node.profile.avatar_url} 
                alt={node.profile?.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={cn(
                "w-full h-full flex items-center justify-center text-white font-bold",
                node.type === 'self' ? "bg-violet-500 text-lg" : "bg-slate-400 text-xs"
              )}>
                {node.profile?.display_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          {node.type === 'self' && (
            <p className="text-xs text-center mt-1 font-medium text-slate-700">You</p>
          )}
        </div>
      ))}

      {nodes.length <= 1 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-4">
            <Network className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">Your trust network will grow as you receive endorsements</p>
          </div>
        </div>
      )}
    </div>
  );
}

function EndorsementCard({ endorsement, profiles, showFrom }) {
  const profile = profiles.find(p => 
    p.user_id === (showFrom ? endorsement.from_user_id : endorsement.to_user_id)
  );
  const category = ENDORSEMENT_CATEGORIES[endorsement.category] || ENDORSEMENT_CATEGORIES.expertise;
  const Icon = category.icon;

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
      <Avatar className="w-10 h-10">
        <AvatarImage src={profile?.avatar_url} />
        <AvatarFallback>{profile?.display_name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-slate-900">{profile?.display_name || 'Unknown'}</span>
          <Badge variant="outline" className="text-xs">
            <Icon className="w-3 h-3 mr-1" />
            {category.label}
          </Badge>
        </div>
        <p className="font-medium text-violet-700 text-sm">{endorsement.skill_or_quality}</p>
        {endorsement.endorsement_text && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{endorsement.endorsement_text}</p>
        )}
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Star 
              key={star}
              className={cn(
                "w-3 h-3",
                star <= endorsement.strength_level ? "fill-amber-400 text-amber-400" : "text-slate-300"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EndorseUserModal({ open, onClose, fromUserId, profiles, selectedUser, onSelectUser, searchQuery, onSearchChange }) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('');
  const [skillOrQuality, setSkillOrQuality] = useState('');
  const [strength, setStrength] = useState(3);
  const [text, setText] = useState('');

  const createEndorsement = useMutation({
    mutationFn: async () => {
      await base44.entities.SkillEndorsement.create({
        from_user_id: fromUserId,
        to_user_id: selectedUser.user_id,
        endorsement_type: 'skill',
        skill_or_quality: skillOrQuality,
        category,
        strength_level: strength,
        endorsement_text: text,
        visibility: 'public'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['givenEndorsements'] });
      onClose();
      // Reset form
      setCategory('');
      setSkillOrQuality('');
      setStrength(3);
      setText('');
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Endorse Someone</DialogTitle>
          <DialogDescription>
            Recognize someone's skills or qualities to build trust in the network
          </DialogDescription>
        </DialogHeader>

        {!selectedUser ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {profiles.slice(0, 20).map(profile => (
                  <div
                    key={profile.user_id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => onSelectUser(profile)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback>{profile.display_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{profile.display_name}</p>
                      <p className="text-xs text-slate-500">@{profile.handle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected User */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-50 border border-violet-200">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedUser.avatar_url} />
                <AvatarFallback>{selectedUser.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-slate-900">{selectedUser.display_name}</p>
                <p className="text-sm text-slate-500">@{selectedUser.handle}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto"
                onClick={() => onSelectUser(null)}
              >
                Change
              </Button>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ENDORSEMENT_CATEGORIES).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Skill/Quality */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Skill or Quality</label>
              <Input
                placeholder="e.g., Great Mentor, Web Development..."
                value={skillOrQuality}
                onChange={(e) => setSkillOrQuality(e.target.value)}
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {[...COMMON_QUALITIES.qualities.slice(0, 4), ...COMMON_QUALITIES.skills.slice(0, 4)].map(q => (
                  <Badge 
                    key={q}
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-violet-50"
                    onClick={() => setSkillOrQuality(q)}
                  >
                    {q}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Strength */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">How strongly do you endorse? ({strength}/5)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setStrength(star)}
                    className="p-1"
                  >
                    <Star className={cn(
                      "w-6 h-6 transition-colors",
                      star <= strength ? "fill-amber-400 text-amber-400" : "text-slate-300"
                    )} />
                  </button>
                ))}
              </div>
            </div>

            {/* Text */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Comment (Optional)</label>
              <Textarea
                placeholder="Share your experience working with them..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {selectedUser && (
            <Button
              onClick={() => createEndorsement.mutate()}
              disabled={!category || !skillOrQuality || createEndorsement.isPending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {createEndorsement.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              <Check className="w-4 h-4 mr-2" />
              Submit Endorsement
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}