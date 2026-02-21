import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

const SORT_OPTIONS = {
  all: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'created_date', label: 'Date Created' },
    { value: 'updated_date', label: 'Recently Updated' },
  ],
  people: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'display_name', label: 'Name' },
    { value: 'follower_count', label: 'Followers' },
    { value: 'rank_points', label: 'Rank Points' },
    { value: 'ggg_balance', label: 'GGG Balance' },
    { value: 'created_date', label: 'Joined Date' },
  ],
  missions: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'title', label: 'Title' },
    { value: 'participant_count', label: 'Participants' },
    { value: 'reward_ggg', label: 'GGG Reward' },
    { value: 'reward_rank_points', label: 'RP Reward' },
    { value: 'start_time', label: 'Start Date' },
    { value: 'end_time', label: 'End Date' },
    { value: 'created_date', label: 'Date Created' },
  ],
  circles: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'name', label: 'Name' },
    { value: 'member_count', label: 'Members' },
    { value: 'created_date', label: 'Date Created' },
  ],
  offers: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'title', label: 'Title' },
    { value: 'price_amount', label: 'Price' },
    { value: 'views_count', label: 'Views' },
    { value: 'bookings_count', label: 'Bookings' },
    { value: 'rating', label: 'Rating' },
    { value: 'created_date', label: 'Date Created' },
  ],
  events: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'title', label: 'Title' },
    { value: 'start_time', label: 'Event Date' },
    { value: 'created_date', label: 'Date Created' },
  ],
  projects: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'name', label: 'Name' },
    { value: 'priority', label: 'Priority' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'created_date', label: 'Date Created' },
  ],
  posts: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'likes_count', label: 'Likes' },
    { value: 'comments_count', label: 'Comments' },
    { value: 'created_date', label: 'Date Posted' },
  ],
};

export default function SortOptionsPanel({ 
  activeTab, 
  sortBy, 
  sortOrder, 
  onSortChange 
}) {
  const options = SORT_OPTIONS[activeTab] || SORT_OPTIONS.all;

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-slate-400" />
      <Select 
        value={sortBy || 'relevance'} 
        onValueChange={(v) => onSortChange(v, sortOrder)}
      >
        <SelectTrigger className="h-8 text-xs w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      >
        {sortOrder === 'asc' ? (
          <ArrowUp className="w-4 h-4" />
        ) : (
          <ArrowDown className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}