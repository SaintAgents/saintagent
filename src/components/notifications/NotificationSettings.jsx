import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Users, 
  Calendar, 
  Target, 
  MessageCircle, 
  Coins,
  TrendingUp,
  Sparkles,
  UserPlus,
  Mail,
  Smartphone,
  Monitor
} from "lucide-react";

const NOTIFICATION_CATEGORIES = [
  {
    key: 'matches',
    label: 'New Matches',
    description: 'When the Synchronicity Engine finds new high-score matches',
    icon: Sparkles,
    color: 'text-violet-500'
  },
  {
    key: 'messages',
    label: 'Direct Messages',
    description: 'When someone sends you a direct message',
    icon: MessageCircle,
    color: 'text-pink-500'
  },
  {
    key: 'meetings',
    label: 'Meeting Updates',
    description: 'Reminders and updates for scheduled meetings',
    icon: Calendar,
    color: 'text-blue-500'
  },
  {
    key: 'missions',
    label: 'Mission Invitations',
    description: 'Invitations to join missions and quest updates',
    icon: Target,
    color: 'text-amber-500'
  },
  {
    key: 'collaborations',
    label: 'Potential Collaborations',
    description: 'Suggestions for users who share your skills or values',
    icon: Users,
    color: 'text-emerald-500'
  },
  {
    key: 'posts',
    label: 'Posts & Activity',
    description: 'When connections post or engage with your content',
    icon: UserPlus,
    color: 'text-indigo-500'
  },
  {
    key: 'ggg',
    label: 'GGG & Rewards',
    description: 'Earnings, rewards, and rank updates',
    icon: Coins,
    color: 'text-amber-500'
  },
  {
    key: 'follows',
    label: 'New Followers',
    description: 'When someone starts following you',
    icon: UserPlus,
    color: 'text-indigo-500'
  },
  {
    key: 'bookings',
    label: 'Booking Requests',
    description: 'New booking requests and confirmations',
    icon: Calendar,
    color: 'text-emerald-500'
  },
  {
    key: 'events',
    label: 'Events',
    description: 'Updates on events you\'re attending or hosting',
    icon: Calendar,
    color: 'text-blue-500'
  }
];

export default function NotificationSettings({ settings, onChange }) {
  const prefs = settings || {
    channels: { email: true, in_app: true, push: false },
    categories: {
      matches: { email: true, in_app: true },
      messages: { email: false, in_app: true },
      meetings: { email: true, in_app: true },
      missions: { email: true, in_app: true },
      collaborations: { email: false, in_app: true },
      posts: { email: false, in_app: true },
      ggg: { email: false, in_app: true },
      follows: { email: false, in_app: true },
      bookings: { email: true, in_app: true },
      events: { email: true, in_app: true }
    },
    quiet_hours: { enabled: false, start: '22:00', end: '08:00' }
  };

  const updateChannel = (channel, value) => {
    onChange({
      ...prefs,
      channels: { ...prefs.channels, [channel]: value }
    });
  };

  const updateCategory = (category, channel, value) => {
    onChange({
      ...prefs,
      categories: {
        ...prefs.categories,
        [category]: { ...prefs.categories[category], [channel]: value }
      }
    });
  };

  const toggleAllForChannel = (channel, value) => {
    const updated = { ...prefs.categories };
    Object.keys(updated).forEach(cat => {
      updated[cat] = { ...updated[cat], [channel]: value };
    });
    onChange({ ...prefs, categories: updated });
  };

  return (
    <div className="space-y-6">
      {/* Delivery Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-violet-500" />
            Delivery Channels
          </CardTitle>
          <CardDescription>Choose how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
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

      {/* Category Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Control which notifications you receive and how</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Header Row */}
          <div className="flex items-center justify-end gap-8 mb-4 pr-2">
            <button 
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              onClick={() => toggleAllForChannel('in_app', true)}
            >
              <Monitor className="w-3 h-3" />
              In-App
            </button>
            <button 
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              onClick={() => toggleAllForChannel('email', true)}
            >
              <Mail className="w-3 h-3" />
              Email
            </button>
          </div>

          <div className="space-y-4">
            {NOTIFICATION_CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              const catPrefs = prefs.categories?.[cat.key] || { email: true, in_app: true };
              
              return (
                <div key={cat.key}>
                  {idx > 0 && <Separator className="my-4" />}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg bg-slate-50`}>
                        <Icon className={`w-4 h-4 ${cat.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{cat.label}</p>
                        <p className="text-xs text-slate-500 truncate">{cat.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <Switch 
                        checked={catPrefs.in_app !== false}
                        onCheckedChange={(v) => updateCategory(cat.key, 'in_app', v)}
                        disabled={!prefs.channels?.in_app}
                      />
                      <Switch 
                        checked={catPrefs.email === true}
                        onCheckedChange={(v) => updateCategory(cat.key, 'email', v)}
                        disabled={!prefs.channels?.email}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}