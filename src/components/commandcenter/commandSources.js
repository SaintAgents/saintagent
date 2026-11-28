import { CalendarDays, Flag, FolderKanban, Target, Radar, Activity, Handshake, Inbox, BadgeCheck, ListChecks } from 'lucide-react';
const me = (u) => ({ $in: [u.email, u.id].filter(Boolean) });
const meetings = u => ({ $or: [{ host_id: me(u) }, { guest_id: me(u) }, { rsvp_yes: me(u) }] });
const projects = u => ({ $or: [{ owner_id: me(u) }, { claimed_by: me(u), claim_status: 'approved' }, { team_member_ids: me(u) }] });
const tasks = u => ({ assignee_id: me(u) });
const confirmed = { $in: ['scheduled','accepted'] };
const notifs = u => ({ user_id: me(u) });
const recordLink = (page, key, id) => id ? `/${page}?${new URLSearchParams({ [key]: id })}` : `/${page}`;
const row = (label, date, link, note) => ({ label, date, link, note });
const project = r => row(r.title, null, recordLink('Projects','id',r.id), Number.isFinite(r.progress_percent) ? `${r.progress_percent}% reported` : null);
const task = r => row(r.title, r.due_date, recordLink('Projects','id',r.project_id), r.priority);
const meeting = r => row(r.title, r.scheduled_time);

export const commandSources = [
  { id:'schedule', label:'Schedule', metric:'Today’s meetings', Icon:CalendarDays, path:'/Meetings', entity:'Meeting', source:'Confirmed SaintAgent meetings', empty:'No upcoming confirmed meetings.', focus:true, sort:'scheduled_time',
    list:(u,d) => ({ ...meetings(u), status:confirmed, scheduled_time:{ $gte:d.now } }), count:(u,d) => ({ ...meetings(u), status:confirmed, scheduled_time:{ $gte:d.start, $lt:d.end } }), format:meeting },
  { id:'priorities', label:'Priorities', Icon:Flag, path:'/Planner', entity:'ProjectTask', source:'Assigned project tasks', empty:'No assigned tasks are overdue or due today.', focus:true, sort:'due_date',
    list:(u,d) => ({ ...tasks(u), status:{ $in:['todo','in_progress','review','blocked'] }, due_date:{ $lte:d.day, $gte:'0001-01-01' } }), format:task },
  { id:'projects', label:'Projects', metric:'Active projects', Icon:FolderKanban, path:'/Projects', entity:'Project', source:'Your in-progress projects', empty:'No in-progress projects.', list:u => ({ ...projects(u), project_status:'in_progress' }), format:project },
  { id:'missions', label:'Missions', metric:'Active missions', Icon:Target, path:'/Missions', entity:'Mission', source:'Missions you lead or joined', empty:'No active missions you lead or have joined.', list:u => ({ status:'active', $or:[{ creator_id:me(u) },{ participant_ids:me(u) }] }), format:r => row(r.title,null,recordLink('MissionDetail','id',r.id)) },
  { id:'followups', label:'Outreach follow-ups', metric:'Follow-ups due', Icon:Handshake, path:'/CRM', entity:'Contact', source:'Your CRM contact reminders', empty:'No CRM follow-ups are due.', focus:true, sort:'next_followup_date', list:(u,d) => ({ owner_id:u.email, next_followup_date:{ $gte:'0001-01-01', $lte:d.day } }), format:r => row(r.name,r.next_followup_date,null,r.followup_note) },
  { id:'opportunities', label:'Opportunities', metric:'New opportunities', Icon:Radar, path:'/Missions', entity:'Notification', source:'Unread mission and business matches from your interest tags', empty:'No unread opportunities match your interest tags.', focus:true, list:u => ({ ...notifs(u), is_read:false, type:{ $in:['mission','business_listing'] }, 'metadata.matched_tags':{ $exists:true } }), format:r => row(r.title,r.created_date,r.metadata?.entity_type === 'Mission' ? recordLink('MissionDetail','id',r.metadata.entity_id) : recordLink('BusinessEntityProfile','id',r.metadata?.entity_id),r.message) },
  { id:'decisions', label:'Pending decisions', metric:'Meeting requests', Icon:Inbox, path:'/Meetings', entity:'Meeting', source:'Meeting invitations awaiting your response', empty:'No pending meeting invitations.', focus:true, list:u => ({ guest_id:me(u), status:'pending' }), format:meeting },
  { id:'contributions', label:'Contribution activity', metric:'Tasks completed', Icon:ListChecks, path:'/Planner', entity:'ProjectTask', source:'Completed project tasks assigned to you', empty:'No completed assigned project tasks.', list:u => ({ ...tasks(u), status:'completed' }), sort:'-completed_at', format:r => row(r.title,r.completed_at,recordLink('Projects','id',r.project_id)) },
  { id:'impact', label:'Impact progress', metric:'Projects completed', Icon:BadgeCheck, path:'/ImpactDashboard', entity:'Project', source:'Recorded project completions, not verified impact outcomes', empty:'No completed projects are recorded.', list:u => ({ ...projects(u), project_status:'completed' }), format:project },
  { id:'activity', label:'Recent activity', Icon:Activity, path:'/ActivityFeed', entity:'Notification', source:'Your recent SaintAgent notifications', empty:'No recent notifications.', list:notifs, format:r => row(r.title,r.created_date) },
];