import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  Clock, 
  Video, 
  MapPin, 
  Eye,
  MessageCircle,
  TrendingUp,
  MoreHorizontal,
  Zap,
  Pause,
  Play,
  Edit
} from "lucide-react";
import MiniProfile from '@/components/profile/MiniProfile';
import { createPageUrl } from '@/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ListingCard({ listing, onAction, isOwner = false }) {
  const categoryColors = {
    mentorship: "bg-violet-100 text-violet-700",
    course: "bg-blue-100 text-blue-700",
    session: "bg-emerald-100 text-emerald-700",
    consulting: "bg-amber-100 text-amber-700",
    healing: "bg-rose-100 text-rose-700",
    mutual_aid: "bg-pink-100 text-pink-700",
    collaboration: "bg-cyan-100 text-cyan-700",
  };

  const deliveryIcons = {
    online: Video,
    "in-person": MapPin,
    hybrid: Video,
  };

  const DeliveryIcon = deliveryIcons[listing.delivery_mode] || Video;

  return (
    <div
      className="bg-white rounded-xl border border-slate-200/60 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => window.location.href = createPageUrl('ListingDetail') + '?id=' + listing.id}
    >
      {listing.image_url && (
        <div className="relative h-36">
          <img 
            src={listing.image_url} 
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <Badge className={cn("absolute top-3 left-3", categoryColors[listing.category])}>
            {listing.category}
          </Badge>
          {listing.is_free && (
            <Badge className="absolute top-3 right-3 bg-emerald-500 text-white">
              Free
            </Badge>
          )}
        </div>
      )}

      <div className="p-4">
        {!listing.image_url && (
          <div className="flex items-center gap-2 mb-3">
            <Badge className={categoryColors[listing.category]}>
              {listing.category}
            </Badge>
            {listing.is_free && (
              <Badge className="bg-emerald-100 text-emerald-700">Free</Badge>
            )}
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-slate-900 line-clamp-2">{listing.title}</h4>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAction?.('edit', listing)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction?.('toggle', listing)}>
                  {listing.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction?.('boost', listing)}>
                  <Zap className="w-4 h-4 mr-2" />
                  Boost
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 mt-2">{listing.description}</p>

        <div className="flex items-center gap-3 mt-3">
          <MiniProfile userId={listing.owner_id} name={listing.owner_name} avatar={listing.owner_avatar} size={36} showHelpHint={false} />
          {listing.rating && (
            <div className="flex items-center gap-1 ml-auto">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-slate-700">{listing.rating}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {listing.duration_minutes}min
          </div>
          <div className="flex items-center gap-1">
            <DeliveryIcon className="w-4 h-4" />
            {listing.delivery_mode}
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-sm">
            <div className="flex items-center gap-1 text-slate-500">
              <Eye className="w-4 h-4" />
              {listing.views_count || 0} views
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <MessageCircle className="w-4 h-4" />
              {listing.requests_count || 0} requests
            </div>
            <div className="flex items-center gap-1 text-emerald-600 ml-auto">
              <TrendingUp className="w-4 h-4" />
              {listing.bookings_count || 0} booked
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-4">
          {!listing.is_free && (
            <div className="text-lg font-bold text-slate-900">
              ${listing.price_amount}
            </div>
          )}
          <Button 
            className={cn(
              "flex-1 rounded-lg",
              listing.listing_type === 'request' 
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-violet-600 hover:bg-violet-700"
            )}
            onClick={(e) => { e.stopPropagation(); onAction?.('book', listing); }}
          >
            {listing.listing_type === 'request' ? 'Offer to Help' : 'Book Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}