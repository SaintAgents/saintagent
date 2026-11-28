import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowUpRight, MonitorDot, Sparkles } from 'lucide-react';
import { commandDate } from '@/components/commandcenter/useCommandOverview';
export default function CommandBriefing({ user, now, data }) {
  const profile = useQuery({ queryKey:['myProfile',user.email], queryFn:() => base44.entities.UserProfile.filter({ user_id:user.email },'-updated_date',1), staleTime:60000, enabled:!!user.email });
  const intention = profile.data?.[0]?.intentions?.find(text => typeof text === 'string' && text.trim());
  const counts = [['schedule','confirmed meetings today'],['priorities','assigned tasks due'],['followups','follow-ups due'],['opportunities','unread interest matches']];
  const facts = counts.flatMap(([id,label]) => data[id].data?.total == null ? [] : [`${data[id].data.total} ${label}`]);
  const next = data.schedule.data?.rows?.find(row => Date.parse(row.date) >= +now);
  const briefing = facts.length ? `${facts.join(' · ')}.` : counts.some(([id]) => data[id].isPending) ? 'Gathering your authorized records…' : 'Your briefing is unavailable right now.';
  const guideQuestion = facts.length ? `Help me prioritize my SaintAgent work today. My Command Center shows: ${facts.join(', ')}. Suggest next steps for me to review, and tell me what else you need to know.` : 'Help me decide what to prioritize in my SaintAgent Command Center today.';
  return <header className="cc-hero">
    <div className="cc-orbit" aria-hidden="true"><MonitorDot size={74} strokeWidth={1} /></div>
    <div className="cc-hero-copy"><div className="cc-kicker">SAINTAGENT / PERSONAL OPERATIONS</div>
      <h1>My Command Center</h1>
      <p>Welcome{user.full_name?.trim() ? `, ${user.full_name.trim().split(/\s+/)[0]}` : ''}. <time dateTime={now.toISOString()}>{now.toLocaleString(undefined,{ weekday:'long', month:'long', day:'numeric', hour:'numeric', minute:'2-digit', timeZoneName:'short' })}</time></p>
      <p>Primary intention: {profile.isPending ? 'Loading…' : profile.isError ? 'Unavailable' : intention || <Link className="cc-record" to="/Profile">Set an intention</Link>}</p>
      <div className="cc-kicker cc-brief-label">YOUR DAILY BRIEFING</div><p aria-live="polite">{briefing}</p>
      <p>Up next: {next ? <Link className="cc-record" to="/Meetings">{next.label} · {commandDate(next.date)}</Link> : data.schedule.isPending ? 'Loading…' : !data.schedule.data?.rows ? 'Schedule unavailable' : 'No upcoming confirmed meeting in this view'}</p>
      <Link className="cc-action cc-primary" to="/MyGuide" state={{ commandQuestion:guideQuestion }}><Sparkles size={16} /> Ask My Guide <ArrowUpRight size={15} /></Link>
    </div>
  </header>;
}