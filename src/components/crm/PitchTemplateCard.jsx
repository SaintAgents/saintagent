import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, StarOff, Pencil, Copy, Trash2, Clock, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

const CATEGORY_COLORS = {
  cold_pitch: 'bg-blue-100 text-blue-700',
  warm_pitch: 'bg-emerald-100 text-emerald-700',
  follow_up: 'bg-amber-100 text-amber-700',
  partnership: 'bg-violet-100 text-violet-700',
  investor: 'bg-rose-100 text-rose-700',
  referral: 'bg-cyan-100 text-cyan-700',
  nurture: 'bg-pink-100 text-pink-700',
  re_engagement: 'bg-orange-100 text-orange-700',
  welcome: 'bg-green-100 text-green-700',
  custom: 'bg-slate-100 text-slate-700',
};

const CATEGORY_LABELS = {
  cold_pitch: 'Cold Pitch', warm_pitch: 'Warm Pitch', follow_up: 'Follow Up',
  partnership: 'Partnership', investor: 'Investor', referral: 'Referral',
  nurture: 'Nurture', re_engagement: 'Re-engagement', welcome: 'Welcome',
  custom: 'Custom', notification: 'Notification',
};

const TYPE_LABELS = {
  one_time: 'One-Time', repeat_sequence: 'Repeat', drip: 'Drip',
};

export default function PitchTemplateCard({ template, onEdit, onDelete, onToggleFav, onDuplicate }) {
  return (
    <Card className="hover:border-violet-300 transition-all group">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 truncate">{template.name}</h4>
            <p className="text-xs text-slate-500 truncate mt-0.5">{template.subject}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onToggleFav}>
            {template.is_favorite ? (
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            ) : (
              <StarOff className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
            )}
          </Button>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2">{template.body?.slice(0, 120)}...</p>

        <div className="flex flex-wrap gap-1.5">
          <Badge className={cn("text-xs", CATEGORY_COLORS[template.category] || CATEGORY_COLORS.custom)}>
            {CATEGORY_LABELS[template.category] || template.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {TYPE_LABELS[template.pitch_type] || 'One-Time'}
          </Badge>
          {(template.tags || []).slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs text-slate-500">{tag}</Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Send className="w-3 h-3" /> {template.times_used || 0} uses</span>
            {template.last_used_at && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {format(parseISO(template.last_used_at), 'MMM d')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} title="Edit">
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate} title="Duplicate">
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-700" onClick={onDelete} title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}