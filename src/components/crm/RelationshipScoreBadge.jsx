import React from 'react';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Calculate a dynamic relationship score 0-100 based on CRM activity
export function calculateRelationshipScore(contact) {
  let score = 0;
  const now = Date.now();

  // 1. Email engagement (0-25)
  const emailCount = contact.email_outreach_count || 0;
  score += Math.min(emailCount * 5, 25);

  // 2. Meeting/contact recency (0-25)
  if (contact.last_contact_date) {
    const daysSince = (now - new Date(contact.last_contact_date).getTime()) / 86400000;
    if (daysSince < 7) score += 25;
    else if (daysSince < 14) score += 20;
    else if (daysSince < 30) score += 15;
    else if (daysSince < 60) score += 8;
    else if (daysSince < 90) score += 3;
  }

  // 3. Note sentiment / richness (0-20)
  if (contact.notes) {
    const noteLen = contact.notes.length;
    if (noteLen > 500) score += 15;
    else if (noteLen > 200) score += 10;
    else if (noteLen > 50) score += 5;
    // Bonus for AI intel
    if (contact.notes.includes('AI Intelligence Report') || contact.notes.includes('AI Deep Dive')) score += 5;
  }
  if (contact.sentiment_label === 'hot') score += 5;
  else if (contact.sentiment_label === 'warm') score += 3;

  // 4. Relationship strength (0-15)
  score += (contact.relationship_strength || 0) * 3;

  // 5. Data completeness / engagement signals (0-15)
  if (contact.email) score += 2;
  if (contact.phone) score += 2;
  if (contact.company) score += 1;
  if (contact.role) score += 1;
  if (contact.location) score += 1;
  if (contact.social_links?.linkedin) score += 2;
  if (contact.tags?.length > 0) score += 1;
  if (contact.ai_dossier) score += 3;
  if (contact.next_followup_date) score += 2;

  return Math.min(Math.round(score), 100);
}

export function getScoreConfig(score) {
  if (score >= 80) return { label: 'Strong', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', barColor: 'bg-emerald-500', textColor: 'text-emerald-600' };
  if (score >= 60) return { label: 'Good', color: 'bg-blue-100 text-blue-700 border-blue-200', barColor: 'bg-blue-500', textColor: 'text-blue-600' };
  if (score >= 40) return { label: 'Fair', color: 'bg-amber-100 text-amber-700 border-amber-200', barColor: 'bg-amber-500', textColor: 'text-amber-600' };
  if (score >= 20) return { label: 'Weak', color: 'bg-orange-100 text-orange-700 border-orange-200', barColor: 'bg-orange-500', textColor: 'text-orange-600' };
  return { label: 'Cold', color: 'bg-red-100 text-red-700 border-red-200', barColor: 'bg-red-500', textColor: 'text-red-600' };
}

export default function RelationshipScoreBadge({ contact, showBar = false }) {
  const score = calculateRelationshipScore(contact);
  const config = getScoreConfig(score);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            <Activity className={cn("w-3 h-3", config.textColor)} />
            {showBar ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", config.barColor)} style={{ width: `${score}%` }} />
                </div>
                <span className={cn("text-[10px] font-semibold tabular-nums", config.textColor)}>{score}</span>
              </div>
            ) : (
              <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", config.color)}>
                {score} {config.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[200px]">
          <p className="font-medium">Engagement Score: {score}/100 ({config.label})</p>
          <p className="text-slate-400 mt-0.5">Based on emails, recency, notes, strength & data quality</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}