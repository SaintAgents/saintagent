import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Folder, Target, ShoppingBag, Calendar, MessageCircle } from 'lucide-react';

function StatTile({ label, value, Icon, color = 'text-slate-900' }) {
  return (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">{label}</div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
          {Icon && <Icon className="w-6 h-6 text-slate-400" />}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminStats() {
  const { data: users = [] } = useQuery({ queryKey: ['stats_users'], queryFn: () => base44.entities.User.list('-created_date', 1000) });
  const { data: projects = [] } = useQuery({ queryKey: ['stats_projects'], queryFn: () => base44.entities.Project.list('-created_date', 1000) });
  const { data: missions = [] } = useQuery({ queryKey: ['stats_missions'], queryFn: () => base44.entities.Mission.list('-created_date', 1000) });
  const { data: listings = [] } = useQuery({ queryKey: ['stats_listings'], queryFn: () => base44.entities.Listing.list('-created_date', 1000) });
  const { data: meetings = [] } = useQuery({ queryKey: ['stats_meetings'], queryFn: () => base44.entities.Meeting.list('-created_date', 1000) });
  const { data: posts = [] } = useQuery({ queryKey: ['stats_posts'], queryFn: () => base44.entities.Post.list('-created_date', 1000) });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatTile label="Users" value={users.length} Icon={Users} />
        <StatTile label="Projects" value={projects.length} Icon={Folder} />
        <StatTile label="Missions" value={missions.length} Icon={Target} />
        <StatTile label="Listings" value={listings.length} Icon={ShoppingBag} />
        <StatTile label="Meetings" value={meetings.length} Icon={Calendar} />
        <StatTile label="Posts" value={posts.length} Icon={MessageCircle} />
      </div>

      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-2">Recent Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(projects || []).slice(0, 6).map((p) => (
            <div key={p.id} className="p-3 rounded-xl bg-white border">
              <div className="font-medium text-slate-900 truncate">{p.title || 'Untitled'}</div>
              <div className="text-xs text-slate-500 mt-1 capitalize">{(p.status || '').replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}