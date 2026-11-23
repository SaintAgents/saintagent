import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CanopyRecords({ id, user, profile, open }) {
  const today = id === 'Today';
  const date = new Date(), start = new Date(date.getFullYear(),date.getMonth(),date.getDate()), end = new Date(date.getFullYear(),date.getMonth(),date.getDate()+1);
  const ids = [user.email, user.id, profile?.sa_number].filter(Boolean);
  const isMine = {$in:ids};
  const windowRange = {$gte:start.toISOString(), $lt:end.toISOString()};
  const query = useQuery({ queryKey:['canopy-records',id, ...ids, today ? start.toISOString() : null], staleTime:60000,
    queryFn:async () => {
      if (!today) return base44.entities.Project.filter({ $or:[{owner_id:isMine},{team_member_ids:isMine},{claimed_by:isMine,claim_status:'approved'}],status:{$nin:['completed','declined']} },'-updated_date',5);
      const [meetings,events] = await Promise.all([
        base44.entities.Meeting.filter({$or:[{host_id:isMine},{guest_id:isMine}],scheduled_time:windowRange,status:{$in:['accepted','scheduled']}},'scheduled_time',5),
        base44.entities.Event.filter({$or:[{host_id:isMine},{attendee_ids:isMine}],start_time:windowRange,status:{$ne:'cancelled'}},'start_time',5),
      ]);
      return [...meetings.map(row => ({...row, when:row.scheduled_time,to:'/Meetings'})),...events.map(row => ({...row,when:row.start_time,to:`/EventDetail?id=${encodeURIComponent(row.id)}`}))].sort((a,b)=>a.when.localeCompare(b.when)).slice(0,5);
    },
  });
  return <div className="canopy-links">{query.isPending ? <p>Loading…</p> : query.isError ? <button onClick={() => query.refetch()}>Retry loading {today ? 'today' : 'projects'}</button> : query.data.length ? query.data.map(row => <button key={row.id} onClick={() => open(row.to || `/Projects?id=${encodeURIComponent(row.id)}`)}>{row.title || (today ? 'Meeting' : 'Untitled project')} <small>{today ? new Date(row.when).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}) : row.status?.replaceAll('_',' ')}</small></button>) : <p>{today ? 'Nothing scheduled for today.' : 'No active projects to show.'}</p>}<button onClick={() => open(today ? '/Schedule' : '/MyDashboard')}>{today ? 'Open schedule' : 'Open my dashboard'}</button></div>;
}