import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageSquare, Target, Calendar, FileText, Star, ShoppingBag, Award } from 'lucide-react';

const STATS = [
  { key: 'activeUsers', label: 'Active Users', icon: Users, color: 'violet', format: (v, p) => `${v} / ${p.totalUsers}` },
  { key: 'posts', label: 'Posts', icon: FileText, color: 'blue' },
  { key: 'messages', label: 'Messages', icon: MessageSquare, color: 'emerald' },
  { key: 'meetings', label: 'Meetings', icon: Calendar, color: 'amber' },
  { key: 'missions', label: 'Missions', icon: Target, color: 'purple' },
  { key: 'journals', label: 'Journal Entries', icon: Star, color: 'pink' },
  { key: 'bookings', label: 'Bookings', icon: ShoppingBag, color: 'teal' },
  { key: 'badgesEarned', label: 'Badges Earned', icon: Award, color: 'orange' },
];

const colorMap = {
  violet: 'bg-violet-50 text-violet-600',
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
  pink: 'bg-pink-50 text-pink-600',
  teal: 'bg-teal-50 text-teal-600',
  orange: 'bg-orange-50 text-orange-600',
};

export default function UsageStatsCards(props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {STATS.map(s => {
        const Icon = s.icon;
        const value = s.format ? s.format(props[s.key], props) : props[s.key];
        return (
          <Card key={s.key} className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[s.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}