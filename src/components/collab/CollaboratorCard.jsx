import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, UserPlus } from "lucide-react";

export default function CollaboratorCard({ profile, score, onMessage, onInvite }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-white">
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback>{profile?.display_name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <span
          className={
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white " +
            (profile?.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300')
          }
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{profile?.display_name}</p>
        <p className="text-xs text-slate-500 truncate">@{profile?.handle}</p>
        {typeof score === 'number' && (
          <p className="text-xs text-violet-700 mt-1">Match score: {Math.round(score)}%</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="rounded-xl" onClick={onMessage}>
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </Button>
        <Button className="rounded-xl bg-violet-600 hover:bg-violet-700" onClick={onInvite}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite
        </Button>
      </div>
    </div>
  );
}