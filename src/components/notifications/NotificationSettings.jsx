import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Bell, Users, Calendar, Target, MessageCircle, Coins, TrendingUp, Sparkles,
  UserPlus, Mail, Smartphone, Monitor, Moon, Clock, ChevronDown, ChevronUp,
  CircleDot, FileText, Megaphone, Heart, Briefcase, Gift, Shield, Radio,
  Newspaper, BookOpen, Video, Zap, AlertTriangle
} from "lucide-react";

// Notification categories organized by section
const NOTIFICATION_SECTIONS = [
  {
    id: 'social',
    title: 'Social & Community',
    icon: Users,
    categories: [
      { key: 'messages', label: 'Direct Messages', description: 'When someone sends you a direct message', icon: MessageCircle, color: 'text-pink-500', priority: 'high' },
      { key: 'follows', label: 'New Followers', description: 'When someone starts following you', icon: UserPlus, color: 'text-indigo-500' },
      { key: 'mentions', label: 'Mentions', description: 'When someone mentions you in a post or comment', icon: MessageCircle, color: 'text-blue-500', priority: 'high' },
      { key: 'posts', label: 'Posts & Activity', description: 'When connections post or engage with your content', icon: FileText, color: 'text-slate-500' },
      { key: 'comments', label: 'Comments & Replies', description: 'When someone comments on your posts', icon: MessageCircle, color: 'text-cyan-500' },
    ]
  },
  {
    id: 'circles',
    title: 'Circles & Groups',
    icon: CircleDot,
    categories: [
      { key: 'circle_posts', label: 'Circle Posts', description: 'New posts in circles you follow', icon: CircleDot, color: 'text-blue-500' },
      { key: 'circle_invites', label: 'Circle Invitations', description: 'Invitations to join circles', icon: UserPlus, color: 'text-violet-500' },
      { key: 'circle_events', label: 'Circle Events', description: 'Events in your circles', icon: Calendar, color: 'text-emerald-500' },
    ]
  },
  {
    id: 'missions',
    title: 'Missions & Quests',
    icon: Target,
    categories: [
      { key: 'mission_invites', label: 'Mission Invitations', description: 'Invitations to join missions', icon: Target, color: 'text-amber-500', priority: 'high' },
      { key: 'mission_updates', label: 'Mission Updates', description: 'Progress updates on missions you joined', icon: Target, color: 'text-amber-500' },
      { key: 'mission_deadlines', label: 'Mission Deadlines', description: 'Reminders for upcoming mission deadlines', icon: AlertTriangle, color: 'text-red-500', priority: 'high' },
      { key: 'quest_available', label: 'New Quests', description: 'New quests available for you', icon: Sparkles, color: 'text-violet-500' },
    ]
  },
  {
    id: 'events',
    title: 'Events & Meetings',
    icon: Calendar,
    categories: [
      { key: 'event_reminders', label: 'Event Reminders', description: 'Reminders for upcoming events', icon: Calendar, color: 'text-blue-500', priority: 'high' },
      { key: 'event_updates', label: 'Event Updates', description: 'Changes to events you\'re attending', icon: Calendar, color: 'text-blue-500' },
      { key: 'meeting_reminders', label: 'Meeting Reminders', description: 'Reminders for scheduled meetings', icon: Clock, color: 'text-cyan-500', priority: 'high' },
      { key: 'bookings', label: 'Booking Requests', description: 'New booking requests and confirmations', icon: Calendar, color: 'text-emerald-500', priority: 'high' },
      { key: 'broadcasts', label: 'Live Broadcasts', description: 'When broadcasts you\'re interested in go live', icon: Radio, color: 'text-red-500' },
    ]
  },
  {
    id: 'marketplace',
    title: 'Marketplace & Deals',
    icon: Briefcase,
    categories: [
      { key: 'listing_interest', label: 'Listing Interest', description: 'When someone shows interest in your listings', icon: Heart, color: 'text-pink-500' },
      { key: 'deal_updates', label: 'Deal Updates', description: 'Updates on deals you\'re involved in', icon: Briefcase, color: 'text-emerald-500' },
      { key: 'new_listings', label: 'New Listings', description: 'New listings matching your interests', icon: Briefcase, color: 'text-slate-500' },
    ]
  },
  {
    id: 'matches',
    title: 'Matches & Collaboration',
    icon: Sparkles,
    categories: [
      { key: 'matches', label: 'New Matches', description: 'When the Synchronicity Engine finds new matches', icon: Sparkles, color: 'text-violet-500' },
      { key: 'collaborations', label: 'Collaboration Suggestions', description: 'Suggestions for potential collaborations', icon: Users, color: 'text-emerald-500' },
      { key: 'introductions', label: 'Introductions', description: 'When someone introduces you to others', icon: UserPlus, color: 'text-blue-500' },
    ]
  },
  {
    id: 'rewards',
    title: 'Rewards & Achievements',
    icon: Gift,
    categories: [
      { key: 'ggg', label: 'GGG & Rewards', description: 'Earnings, rewards, and GGG updates', icon: Coins, color: 'text-amber-500' },
      { key: 'badges', label: 'Badges & Achievements', description: 'When you earn new badges', icon: Shield, color: 'text-violet-500' },
      { key: 'rank', label: 'Rank Changes', description: 'When your rank changes', icon: TrendingUp, color: 'text-emerald-500' },
      { key: 'reputation', label: 'Reputation Updates', description: 'Changes to your reputation score', icon: TrendingUp, color: 'text-blue-500' },
    ]
  },
  {
    id: 'content',
    title: 'Content & News',
    icon: Newspaper,
    categories: [
      { key: 'announcements', label: 'Platform Announcements', description: 'Important platform updates and news', icon: Megaphone, color: 'text-slate-700', priority: 'high' },
      { key: 'news', label: 'News Articles', description: 'New articles and content', icon: Newspaper, color: 'text-slate-500' },
      { key: 'courses', label: 'Course Updates', description: 'Updates on courses you\'re enrolled in', icon: BookOpen, color: 'text-indigo-500' },
      { key: 'videos', label: 'New Videos', description: 'Videos from creators you follow', icon: Video, color: 'text-red-500' },
    ]
  },
  {
    id: 'projects',
    title: 'Projects & Tasks',
    icon: Briefcase,
    categories: [
      { key: 'project_updates', label: 'Project Updates', description: 'Updates on projects you\'re part of', icon: Briefcase, color: 'text-blue-500' },
      { key: 'task_assigned', label: 'Task Assignments', description: 'When tasks are assigned to you', icon: Target, color: 'text-amber-500', priority: 'high' },
      { key: 'task_due', label: 'Task Deadlines', description: 'Reminders for upcoming task deadlines', icon: Clock, color: 'text-red-500', priority: 'high' },
      { key: 'task_completed', label: 'Task Completions', description: 'When team members complete tasks', icon: Zap, color: 'text-emerald-500' },
    ]
  },
];

// Flatten all categories for easy lookup
const ALL_CATEGORIES = NOTIFICATION_SECTIONS.flatMap(s => s.categories);

function SectionCard({ section, categoryPrefs, globalChannels, onUpdateCategory, expanded, onToggleExpand }) {
  const Icon = section.icon;
  const enabledCount = section.categories.filter(cat => 
    categoryPrefs[cat.key]?.in_app !== false || categoryPrefs[cat.key]?.email === true
  ).length;

  return (
    <Collapsible open={expanded} onOpenChange={onToggleExpand}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {enabledCount} of {section.categories.length} enabled
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {section.categories.length} types
                </Badge>
                {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Column Headers */}
            <div className="flex items-center justify-end gap-6 mb-3 pr-1 text-xs text-slate-500">
              <span className="w-12 text-center">In-App</span>
              <span className="w-12 text-center">Email</span>
            </div>
            <div className="space-y-3">
              {section.categories.map((cat, idx) => {
                const CatIcon = cat.icon;
                const prefs = categoryPrefs[cat.key] || { email: false, in_app: true };
                
                return (
                  <div key={cat.key}>
                    {idx > 0 && <Separator className="my-3" />}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-1.5 rounded-md bg-slate-50">
                          <CatIcon className={`w-4 h-4 ${cat.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{cat.label}</p>
                            {cat.priority === 'high' && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700">Important</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{cat.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="w-12 flex justify-center">
                          <Switch 
                            checked={prefs.in_app !== false}
                            onCheckedChange={(v) => onUpdateCategory(cat.key, 'in_app', v)}
                            disabled={!globalChannels?.in_app}
                          />
                        </div>
                        <div className="w-12 flex justify-center">
                          <Switch 
                            checked={prefs.email === true}
                            onCheckedChange={(v) => onUpdateCategory(cat.key, 'email', v)}
                            disabled={!globalChannels?.email}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function NotificationSettings({ settings, onChange }) {
  const [expandedSections, setExpandedSections] = useState(['social']);
  const [activeTab, setActiveTab] = useState('channels');

  const prefs = settings || {
    channels: { email: true, in_app: true, push: false },
    digest: { enabled: false, frequency: 'none', time: '09:00', day: 'monday' },
    quiet_hours: { enabled: false, start: '22:00', end: '08:00' },
    categories: {}
  };

  // Initialize category defaults
  const categoryPrefs = prefs.categories || {};
  ALL_CATEGORIES.forEach(cat => {
    if (!categoryPrefs[cat.key]) {
      categoryPrefs[cat.key] = { 
        in_app: true, 
        email: cat.priority === 'high' 
      };
    }
  });

  const updateChannel = (channel, value) => {
    onChange({
      ...prefs,
      channels: { ...prefs.channels, [channel]: value }
    });
  };

  const updateDigest = (field, value) => {
    onChange({
      ...prefs,
      digest: { ...prefs.digest, [field]: value }
    });
  };

  const updateQuietHours = (field, value) => {
    onChange({
      ...prefs,
      quiet_hours: { ...prefs.quiet_hours, [field]: value }
    });
  };

  const updateCategory = (category, channel, value) => {
    onChange({
      ...prefs,
      categories: {
        ...categoryPrefs,
        [category]: { ...categoryPrefs[category], [channel]: value }
      }
    });
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const enableAllInApp = () => {
    const updated = { ...categoryPrefs };
    ALL_CATEGORIES.forEach(cat => {
      updated[cat.key] = { ...updated[cat.key], in_app: true };
    });
    onChange({ ...prefs, categories: updated });
  };

  const disableAllEmail = () => {
    const updated = { ...categoryPrefs };
    ALL_CATEGORIES.forEach(cat => {
      updated[cat.key] = { ...updated[cat.key], email: false };
    });
    onChange({ ...prefs, categories: updated });
  };

  const enableImportantOnly = () => {
    const updated = { ...categoryPrefs };
    ALL_CATEGORIES.forEach(cat => {
      updated[cat.key] = { 
        in_app: true, 
        email: cat.priority === 'high' 
      };
    });
    onChange({ ...prefs, categories: updated });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="channels" className="gap-2">
            <Bell className="w-4 h-4" /> Channels
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Zap className="w-4 h-4" /> Events
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Clock className="w-4 h-4" /> Schedule
          </TabsTrigger>
        </TabsList>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-violet-500" />
                Delivery Channels
              </CardTitle>
              <CardDescription>Choose how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Monitor className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">In-App Notifications</p>
                    <p className="text-sm text-slate-500">Show notifications in the app</p>
                  </div>
                </div>
                <Switch 
                  checked={prefs.channels?.in_app !== false}
                  onCheckedChange={(v) => updateChannel('in_app', v)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Mail className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive important updates via email</p>
                  </div>
                </div>
                <Switch 
                  checked={prefs.channels?.email !== false}
                  onCheckedChange={(v) => updateChannel('email', v)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-slate-500">Get alerts on your device (coming soon)</p>
                  </div>
                </div>
                <Switch 
                  checked={prefs.channels?.push === true}
                  onCheckedChange={(v) => updateChannel('push', v)}
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Settings</CardTitle>
              <CardDescription>Apply presets to all notification types</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={enableAllInApp}>
                Enable All In-App
              </Button>
              <Button variant="outline" size="sm" onClick={disableAllEmail}>
                Disable All Email
              </Button>
              <Button variant="outline" size="sm" onClick={enableImportantOnly}>
                Important Only
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4 mt-4">
          <p className="text-sm text-slate-500 mb-4">
            Configure which events trigger notifications and how you receive them.
          </p>
          {NOTIFICATION_SECTIONS.map(section => (
            <SectionCard
              key={section.id}
              section={section}
              categoryPrefs={categoryPrefs}
              globalChannels={prefs.channels}
              onUpdateCategory={updateCategory}
              expanded={expandedSections.includes(section.id)}
              onToggleExpand={() => toggleSection(section.id)}
            />
          ))}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4 mt-4">
          {/* Digest Emails */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-500" />
                Email Digest
              </CardTitle>
              <CardDescription>
                Receive a summary of notifications instead of individual emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Digest Emails</p>
                  <p className="text-sm text-slate-500">Combine notifications into a single email</p>
                </div>
                <Switch 
                  checked={prefs.digest?.enabled === true}
                  onCheckedChange={(v) => updateDigest('enabled', v)}
                  disabled={!prefs.channels?.email}
                />
              </div>

              {prefs.digest?.enabled && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={prefs.digest?.frequency || 'daily'}
                        onValueChange={(v) => updateDigest('frequency', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Delivery Time</Label>
                      <Select
                        value={prefs.digest?.time || '09:00'}
                        onValueChange={(v) => updateDigest('time', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="06:00">6:00 AM</SelectItem>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="17:00">5:00 PM</SelectItem>
                          <SelectItem value="20:00">8:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {prefs.digest?.frequency === 'weekly' && (
                    <div className="space-y-2">
                      <Label>Day of Week</Label>
                      <Select
                        value={prefs.digest?.day || 'monday'}
                        onValueChange={(v) => updateDigest('day', v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="tuesday">Tuesday</SelectItem>
                          <SelectItem value="wednesday">Wednesday</SelectItem>
                          <SelectItem value="thursday">Thursday</SelectItem>
                          <SelectItem value="friday">Friday</SelectItem>
                          <SelectItem value="saturday">Saturday</SelectItem>
                          <SelectItem value="sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <p className="text-sm text-emerald-700">
                      <strong>Digest Preview:</strong> You'll receive a summary email{' '}
                      {prefs.digest?.frequency === 'weekly' 
                        ? `every ${prefs.digest?.day || 'Monday'}` 
                        : 'every day'
                      } at {prefs.digest?.time || '9:00 AM'}.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-500" />
                Quiet Hours
              </CardTitle>
              <CardDescription>
                Pause non-urgent notifications during specific hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Quiet Hours</p>
                  <p className="text-sm text-slate-500">Only urgent notifications during this time</p>
                </div>
                <Switch 
                  checked={prefs.quiet_hours?.enabled === true}
                  onCheckedChange={(v) => updateQuietHours('enabled', v)}
                />
              </div>

              {prefs.quiet_hours?.enabled && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Select
                        value={prefs.quiet_hours?.start || '22:00'}
                        onValueChange={(v) => updateQuietHours('start', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20:00">8:00 PM</SelectItem>
                          <SelectItem value="21:00">9:00 PM</SelectItem>
                          <SelectItem value="22:00">10:00 PM</SelectItem>
                          <SelectItem value="23:00">11:00 PM</SelectItem>
                          <SelectItem value="00:00">12:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Select
                        value={prefs.quiet_hours?.end || '08:00'}
                        onValueChange={(v) => updateQuietHours('end', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="06:00">6:00 AM</SelectItem>
                          <SelectItem value="07:00">7:00 AM</SelectItem>
                          <SelectItem value="08:00">8:00 AM</SelectItem>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                    <p className="text-sm text-indigo-700">
                      <strong>Quiet Hours:</strong> Non-urgent notifications will be paused from{' '}
                      {prefs.quiet_hours?.start || '10:00 PM'} to {prefs.quiet_hours?.end || '8:00 AM'}.
                      Important notifications (messages, deadlines) will still come through.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}