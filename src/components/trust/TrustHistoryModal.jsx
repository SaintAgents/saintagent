import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Users, 
  MessageSquare, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import ProgressRing from '@/components/hud/ProgressRing';

const EVENT_ICONS = {
  testimonial_received: Star,
  testimonial_given: MessageSquare,
  meeting_completed: Calendar,
  collaboration_completed: Users,
  mission_completed: CheckCircle,
  profile_verified: Shield,
  endorsement_received: TrendingUp,
  warning_issued: AlertCircle,
  default: FileText
};

const EVENT_COLORS = {
  testimonial_received: 'bg-amber-100 text-amber-700 border-amber-200',
  testimonial_given: 'bg-blue-100 text-blue-700 border-blue-200',
  meeting_completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  collaboration_completed: 'bg-violet-100 text-violet-700 border-violet-200',
  mission_completed: 'bg-green-100 text-green-700 border-green-200',
  profile_verified: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  endorsement_received: 'bg-purple-100 text-purple-700 border-purple-200',
  warning_issued: 'bg-red-100 text-red-700 border-red-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function TrustHistoryModal({ open, onClose, userId, currentScore = 0, breakdown = null }) {
  // Fetch trust events
  const { data: trustEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['trustEvents', userId],
    queryFn: () => base44.entities.TrustEvent.filter({ user_id: userId }, '-created_date', 100),
    enabled: !!userId && open
  });

  // Fetch testimonials
  const { data: testimonials = [] } = useQuery({
    queryKey: ['trustTestimonials', userId],
    queryFn: () => base44.entities.Testimonial.filter({ to_user_id: userId }, '-created_date', 50),
    enabled: !!userId && open
  });

  // Fetch meetings completed
  const { data: meetings = [] } = useQuery({
    queryKey: ['trustMeetings', userId],
    queryFn: () => base44.entities.Meeting.filter({ 
      $or: [{ host_id: userId }, { guest_id: userId }],
      status: 'completed'
    }, '-scheduled_time', 50),
    enabled: !!userId && open
  });

  // Fetch user profile for context
  const { data: profiles = [] } = useQuery({
    queryKey: ['trustProfile', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!userId && open
  });
  const profile = profiles?.[0];

  // Compute trust timeline (combine all events)
  const timeline = React.useMemo(() => {
    const items = [];
    
    // Add trust events
    trustEvents.forEach(event => {
      items.push({
        id: `event-${event.id}`,
        type: event.event_type || 'trust_event',
        title: event.title || event.event_type?.replace(/_/g, ' ') || 'Trust Event',
        description: event.description || '',
        delta: event.points_delta || 0,
        date: event.created_date,
        source: event.source_user_name || null
      });
    });
    
    // Add testimonials
    testimonials.forEach(t => {
      items.push({
        id: `testimonial-${t.id}`,
        type: 'testimonial_received',
        title: 'Received Testimonial',
        description: t.text?.slice(0, 100) + (t.text?.length > 100 ? '...' : ''),
        delta: t.rating ? t.rating * 2 : 5,
        date: t.created_date,
        source: t.from_name,
        rating: t.rating
      });
    });
    
    // Add meetings
    meetings.forEach(m => {
      items.push({
        id: `meeting-${m.id}`,
        type: 'meeting_completed',
        title: 'Meeting Completed',
        description: m.title || 'Completed meeting',
        delta: 3,
        date: m.scheduled_time || m.created_date,
        source: m.host_id === userId ? m.guest_name : m.host_name
      });
    });
    
    // Sort by date descending
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [trustEvents, testimonials, meetings, userId]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const positive = timeline.filter(t => t.delta > 0).length;
    const negative = timeline.filter(t => t.delta < 0).length;
    const totalGained = timeline.filter(t => t.delta > 0).reduce((sum, t) => sum + t.delta, 0);
    const totalLost = timeline.filter(t => t.delta < 0).reduce((sum, t) => sum + Math.abs(t.delta), 0);
    
    return {
      totalEvents: timeline.length,
      positive,
      negative,
      totalGained,
      totalLost,
      netChange: totalGained - totalLost
    };
  }, [timeline]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-5 h-5 text-emerald-600" />
            Trust Transparency Report
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Current Score */}
            <div className="flex items-center justify-center gap-8 py-6 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl">
              <ProgressRing 
                value={currentScore} 
                max={100} 
                size={120} 
                strokeWidth={10} 
                color="emerald" 
                label={`${currentScore}`} 
                sublabel="Trust Score" 
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-700">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-2xl font-bold">+{stats.totalGained}</span>
                  <span className="text-sm">points earned</span>
                </div>
                {stats.totalLost > 0 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <TrendingDown className="w-5 h-5" />
                    <span className="text-xl font-bold">-{stats.totalLost}</span>
                    <span className="text-sm">points deducted</span>
                  </div>
                )}
                <p className="text-sm text-slate-500">{stats.totalEvents} trust events recorded</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <Star className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{testimonials.length}</p>
                  <p className="text-xs text-slate-500">Testimonials</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <Calendar className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{meetings.length}</p>
                  <p className="text-xs text-slate-500">Meetings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <CheckCircle className="w-6 h-6 mx-auto text-violet-500 mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{stats.positive}</p>
                  <p className="text-xs text-slate-500">Positive Events</p>
                </CardContent>
              </Card>
            </div>

            {/* Trust Level Explanation */}
            <Card className="bg-slate-50">
              <CardContent className="pt-4">
                <h4 className="font-medium text-slate-900 mb-2">Trust Level: {
                  currentScore >= 80 ? 'Highly Trusted' :
                  currentScore >= 60 ? 'Trusted' :
                  currentScore >= 40 ? 'Building Trust' :
                  currentScore >= 20 ? 'New Member' :
                  'Getting Started'
                }</h4>
                <p className="text-sm text-slate-600">
                  {currentScore >= 80 ? 
                    'This user has demonstrated exceptional reliability and positive community engagement.' :
                   currentScore >= 60 ?
                    'This user has a solid track record of trustworthy interactions.' :
                   currentScore >= 40 ?
                    'This user is actively building their reputation through positive engagement.' :
                    'This user is new to the community. Trust scores grow through collaboration and testimonials.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {timeline.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No trust events recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeline.map((event) => {
                    const Icon = EVENT_ICONS[event.type] || EVENT_ICONS.default;
                    const colorClass = EVENT_COLORS[event.type] || EVENT_COLORS.default;
                    
                    return (
                      <div 
                        key={event.id}
                        className={cn(
                          "p-3 rounded-lg border transition-all hover:shadow-sm",
                          colorClass
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-white/50">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-medium text-sm">{event.title}</h4>
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "text-xs",
                                  event.delta > 0 ? "bg-emerald-200 text-emerald-800" : 
                                  event.delta < 0 ? "bg-red-200 text-red-800" : 
                                  "bg-slate-200 text-slate-800"
                                )}
                              >
                                {event.delta > 0 ? '+' : ''}{event.delta} pts
                              </Badge>
                            </div>
                            {event.description && (
                              <p className="text-xs mt-1 opacity-80">{event.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs opacity-70">
                              {event.source && (
                                <span>From: {event.source}</span>
                              )}
                              {event.rating && (
                                <span>{'★'.repeat(event.rating)}</span>
                              )}
                              <span>{format(parseISO(event.date), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="breakdown" className="mt-4 space-y-4">
            {breakdown ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Testimonials</span>
                        <span className="font-bold text-slate-900">{Math.round(breakdown.testimonials)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, breakdown.testimonials)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Based on {testimonials.length} testimonials received</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Collaborations</span>
                        <span className="font-bold text-slate-900">{Math.round(breakdown.collaborations)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, breakdown.collaborations)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Projects and missions completed</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Interactions</span>
                        <span className="font-bold text-slate-900">{Math.round(breakdown.interactions)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, breakdown.interactions)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Messages and community engagement</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Presence</span>
                        <span className="font-bold text-slate-900">{Math.round(breakdown.presence)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, breakdown.presence)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Profile completeness and activity</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-2">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Reputation Points (RP)</span>
                        <span className="font-bold text-slate-900">{Math.round(breakdown.rp)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, breakdown.rp)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Overall platform reputation contribution</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-br from-emerald-50 to-cyan-50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-slate-900 mb-3">How Trust Score is Calculated</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span><strong>Testimonials (25%):</strong> Positive reviews from collaborators</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span><strong>Collaborations (25%):</strong> Completed projects and missions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span><strong>Interactions (20%):</strong> Meaningful community engagement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span><strong>Presence (15%):</strong> Profile quality and regular activity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span><strong>RP Contribution (15%):</strong> Overall reputation standing</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Breakdown data not available</p>
                <p className="text-xs mt-1">Click Refresh on the Trust Score card to load details</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}