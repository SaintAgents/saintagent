import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, ShoppingBag, Target, Calendar, CircleDot, FileText, 
  Folder, StickyNote, Clock, MapPin, TrendingUp, Star
} from "lucide-react";
import { format } from "date-fns";

const RESULT_CONFIGS = {
  profile: {
    icon: Users,
    bgColor: 'bg-violet-100',
    iconColor: 'text-violet-600'
  },
  listing: {
    icon: ShoppingBag,
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  mission: {
    icon: Target,
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  circle: {
    icon: CircleDot,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  event: {
    icon: Calendar,
    bgColor: 'bg-rose-100',
    iconColor: 'text-rose-600'
  },
  meeting: {
    icon: Clock,
    bgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  },
  post: {
    icon: FileText,
    bgColor: 'bg-slate-100',
    iconColor: 'text-slate-600'
  },
  project: {
    icon: Folder,
    bgColor: 'bg-cyan-100',
    iconColor: 'text-cyan-600'
  },
  note: {
    icon: StickyNote,
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  dailylog: {
    icon: Calendar,
    bgColor: 'bg-violet-100',
    iconColor: 'text-violet-600'
  }
};

export default function SearchResultCard({ type, item, onClick, highlight }) {
  const config = RESULT_CONFIGS[type] || RESULT_CONFIGS.post;
  const Icon = config.icon;

  const renderContent = () => {
    switch (type) {
      case 'profile':
        return (
          <>
            <Avatar className="w-12 h-12">
              <AvatarImage src={item.avatar_url} />
              <AvatarFallback className={config.bgColor}>
                {item.display_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900 truncate">{item.display_name}</p>
                {item.rank_code && item.rank_code !== 'seeker' && (
                  <Badge variant="outline" className="text-[10px] px-1">
                    {item.rank_code}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500">@{item.handle}</p>
              {item.location && (
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                </div>
              )}
            </div>
            {item.follower_count > 0 && (
              <div className="text-right text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {item.follower_count}
                </div>
              </div>
            )}
          </>
        );

      case 'listing':
        return (
          <>
            {item.cover_image_url ? (
              <img src={item.cover_image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${config.iconColor}`} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{item.title}</p>
              <p className="text-sm text-slate-500 truncate">{item.description?.substring(0, 60)}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={item.is_free ? "secondary" : "outline"} className="text-xs">
                  {item.is_free ? 'Free' : `$${item.price_amount}`}
                </Badge>
                {item.category && (
                  <Badge variant="outline" className="text-xs">{item.category}</Badge>
                )}
              </div>
            </div>
          </>
        );

      case 'mission':
        return (
          <>
            <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{item.title}</p>
              <p className="text-sm text-slate-500 truncate">{item.objective || item.description?.substring(0, 60)}</p>
              <div className="flex items-center gap-2 mt-1">
                {item.status && (
                  <Badge variant={item.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {item.status}
                  </Badge>
                )}
                {item.mission_type && (
                  <Badge variant="outline" className="text-xs capitalize">{item.mission_type}</Badge>
                )}
                {item.participant_count > 0 && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {item.participant_count}
                  </span>
                )}
              </div>
            </div>
            {item.ggg_reward > 0 && (
              <div className="text-right">
                <Badge className="bg-amber-100 text-amber-700 text-xs">
                  +{item.ggg_reward} GGG
                </Badge>
              </div>
            )}
          </>
        );

      case 'circle':
        return (
          <>
            {item.image_url ? (
              <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${config.iconColor}`} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{item.name}</p>
              <p className="text-sm text-slate-500 truncate">{item.description?.substring(0, 60)}</p>
              <div className="flex items-center gap-2 mt-1">
                {item.circle_type && (
                  <Badge variant="outline" className="text-xs capitalize">{item.circle_type}</Badge>
                )}
                {item.region && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.region}
                  </span>
                )}
              </div>
            </div>
            {item.member_count > 0 && (
              <div className="text-right text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {item.member_count}
                </div>
              </div>
            )}
          </>
        );

      case 'event':
        return (
          <>
            <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{item.title}</p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {item.start_time && (
                  <span>{format(new Date(item.start_time), 'MMM d, yyyy')}</span>
                )}
                {item.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </span>
                )}
              </div>
            </div>
            {item.attendee_count > 0 && (
              <div className="text-right text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {item.attendee_count}
                </div>
              </div>
            )}
          </>
        );

      case 'post':
        return (
          <>
            <Avatar className="w-10 h-10">
              <AvatarImage src={item.author_avatar} />
              <AvatarFallback>{item.author_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-500">{item.author_name}</p>
              <p className="text-sm text-slate-900 line-clamp-2">{item.content?.substring(0, 100)}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                {item.likes_count > 0 && <span>❤️ {item.likes_count}</span>}
                {item.comments_count > 0 && <span>💬 {item.comments_count}</span>}
              </div>
            </div>
          </>
        );

      default:
        return (
          <>
            <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{item.title || item.name || 'Untitled'}</p>
              <p className="text-sm text-slate-500 truncate">
                {item.description || item.content?.substring(0, 60) || item.overview || ''}
              </p>
            </div>
          </>
        );
    }
  };

  return (
    <button
      onClick={() => onClick?.(type, item)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left ${
        highlight ? 'bg-violet-50 ring-1 ring-violet-200' : ''
      }`}
    >
      {renderContent()}
    </button>
  );
}