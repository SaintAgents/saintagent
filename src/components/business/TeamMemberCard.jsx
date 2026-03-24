import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Shield, Users, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';

const ROLE_STYLES = {
  owner: { label: 'Owner', color: 'bg-amber-100 text-amber-700', icon: Crown },
  admin: { label: 'Admin', color: 'bg-violet-100 text-violet-700', icon: Shield },
  member: { label: 'Member', color: 'bg-blue-100 text-blue-700', icon: Users },
};

export default function TeamMemberCard({ member, isOwner, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(member.role || 'member');
  const [title, setTitle] = useState(member.title || '');
  const [saving, setSaving] = useState(false);
  const isOwnerRole = member.role === 'owner';

  const roleStyle = ROLE_STYLES[member.role] || ROLE_STYLES.member;
  const RoleIcon = roleStyle.icon;

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(member.user_id, { role, title });
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setRole(member.role || 'member');
    setTitle(member.title || '');
    setEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 cursor-pointer" data-user-id={member.user_id}>
          <AvatarImage src={member.avatar} />
          <AvatarFallback className="bg-violet-100 text-violet-700 font-bold">
            {member.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 truncate">{member.name || 'Team Member'}</p>
          {!editing && <p className="text-sm text-slate-500 truncate">{member.title || 'Member'}</p>}
        </div>
        {isOwner && !isOwnerRole && !editing && (
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-violet-600" onClick={() => setEditing(true)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => onRemove(member.user_id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Marketing Lead, Advisor"
            className="h-8 text-xs"
          />
          <div className="flex gap-1.5 justify-end">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCancel}>
              <X className="w-3 h-3 mr-1" /> Cancel
            </Button>
            <Button size="sm" className="h-7 text-xs bg-violet-600 hover:bg-violet-700" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <Badge className={`${roleStyle.color} gap-1 text-xs`}>
            <RoleIcon className="w-3 h-3" /> {roleStyle.label}
          </Badge>
        </div>
      )}
    </div>
  );
}