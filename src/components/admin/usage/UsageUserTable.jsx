import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function getActivityLevel(total) {
  if (total >= 20) return { label: 'Power User', color: 'bg-violet-100 text-violet-700' };
  if (total >= 10) return { label: 'Active', color: 'bg-emerald-100 text-emerald-700' };
  if (total >= 3) return { label: 'Moderate', color: 'bg-blue-100 text-blue-700' };
  if (total >= 1) return { label: 'Low', color: 'bg-amber-100 text-amber-700' };
  return { label: 'Inactive', color: 'bg-slate-100 text-slate-500' };
}

export default function UsageUserTable({ users, search, onSearchChange, sortBy, onSortChange }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-600" />
            User Activity ({users.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                className="pl-9 w-48 h-9"
              />
            </div>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Last Active</SelectItem>
                <SelectItem value="most_active">Most Active</SelectItem>
                <SelectItem value="posts">Most Posts</SelectItem>
                <SelectItem value="messages">Most Messages</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500">
                <th className="text-left p-3 font-medium">User</th>
                <th className="text-center p-3 font-medium">Level</th>
                <th className="text-center p-3 font-medium">Posts</th>
                <th className="text-center p-3 font-medium">Messages</th>
                <th className="text-center p-3 font-medium">Meetings</th>
                <th className="text-center p-3 font-medium">Missions</th>
                <th className="text-center p-3 font-medium">Journals</th>
                <th className="text-center p-3 font-medium">Bookings</th>
                <th className="text-center p-3 font-medium">Badges</th>
                <th className="text-center p-3 font-medium">Total</th>
                <th className="text-right p-3 font-medium">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 100).map(user => {
                const level = getActivityLevel(user.totalActions);
                return (
                  <tr key={user.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2" data-user-id={user.user_id}>
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="text-xs bg-violet-100 text-violet-600">
                            {(user.display_name || '?').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate cursor-pointer hover:text-violet-600 text-xs">{user.display_name || user.user_id}</p>
                          {user.handle && <p className="text-[10px] text-slate-400 truncate">@{user.handle}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <Badge className={`text-[10px] px-1.5 py-0.5 ${level.color}`}>{level.label}</Badge>
                    </td>
                    <td className="text-center p-3 text-slate-700">{user.usage.posts || '-'}</td>
                    <td className="text-center p-3 text-slate-700">{user.usage.messages_sent || '-'}</td>
                    <td className="text-center p-3 text-slate-700">{user.usage.meetings || '-'}</td>
                    <td className="text-center p-3 text-slate-700">{user.usage.missions_joined || '-'}</td>
                    <td className="text-center p-3 text-slate-700">{user.usage.journals || '-'}</td>
                    <td className="text-center p-3 text-slate-700">{user.usage.bookings || '-'}</td>
                    <td className="text-center p-3 text-slate-700">{user.usage.badges_earned || '-'}</td>
                    <td className="text-center p-3">
                      <span className="font-semibold text-violet-700">{user.totalActions}</span>
                    </td>
                    <td className="text-right p-3 text-xs text-slate-500">
                      {user.lastActive ? (
                        <span className="flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}