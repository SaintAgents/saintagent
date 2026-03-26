import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, User, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function PostAsSelector({ value, onChange }) {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 300000
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfileForPostAs', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email }, '-updated_date', 1);
      return profiles?.[0];
    },
    enabled: !!currentUser?.email,
    staleTime: 300000
  });

  const { data: myEntities = [] } = useQuery({
    queryKey: ['myBusinessEntities', currentUser?.email],
    queryFn: () => base44.entities.BusinessEntity5D.filter({ owner_id: currentUser.email }),
    enabled: !!currentUser?.email,
    staleTime: 300000
  });

  // Also include entities where user is a team member
  const { data: teamEntities = [] } = useQuery({
    queryKey: ['teamBusinessEntities', currentUser?.email],
    queryFn: async () => {
      const all = await base44.entities.BusinessEntity5D.filter({ status: 'active' });
      return all.filter(e => 
        e.owner_id !== currentUser.email && 
        (e.team_member_ids?.includes(currentUser.email) || 
         e.team_roles?.some(r => r.user_id === currentUser.email))
      );
    },
    enabled: !!currentUser?.email,
    staleTime: 300000
  });

  const allEntities = [...myEntities, ...teamEntities];

  // If no entities, don't show selector
  if (allEntities.length === 0) return null;

  const selectedEntity = value ? allEntities.find(e => e.id === value) : null;

  return (
    <div className="mb-4 p-3 rounded-lg border border-slate-200 bg-slate-50" style={{ backgroundColor: 'rgba(248,250,252,0.8)' }}>
      <label className="text-xs font-medium text-slate-500 mb-1.5 block">Post as</label>
      <Select value={value || 'personal'} onValueChange={(v) => onChange(v === 'personal' ? null : v)}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              {selectedEntity ? (
                <>
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={selectedEntity.logo_url} />
                    <AvatarFallback className="text-[10px] bg-violet-100 text-violet-700">
                      {selectedEntity.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{selectedEntity.name}</span>
                  <Building2 className="w-3 h-3 text-violet-500 shrink-0" />
                </>
              ) : (
                <>
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={myProfile?.avatar_url} />
                    <AvatarFallback className="text-[10px] bg-slate-200">
                      {currentUser?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{myProfile?.display_name || currentUser?.full_name || 'Myself'}</span>
                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                </>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="personal">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <span>{myProfile?.display_name || currentUser?.full_name || 'Myself'}</span>
            </div>
          </SelectItem>
          {allEntities.map(entity => (
            <SelectItem key={entity.id} value={entity.id}>
              <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={entity.logo_url} />
                  <AvatarFallback className="text-[10px] bg-violet-100 text-violet-700">
                    {entity.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{entity.name}</span>
                {entity.owner_id === currentUser?.email && (
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded">Owner</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}