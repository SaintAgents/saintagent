import { base44 } from '@/api/base44Client';
import { addDays, format } from 'date-fns';

// Stage transition rules: what happens when a deal moves to each stage
const STAGE_TRANSITION_RULES = {
  prospecting: {
    note: 'Deal moved to Due Diligence stage. Begin research and initial assessment.',
    tasks: [
      { title: 'Complete due diligence research', task_type: 'review', priority: 'medium', dueDays: 7 },
      { title: 'Verify company credentials', task_type: 'review', priority: 'high', dueDays: 3 },
    ]
  },
  qualification: {
    note: 'Deal advanced to Negotiation stage. Terms discussion in progress.',
    tasks: [
      { title: 'Schedule negotiation call', task_type: 'schedule_meeting', priority: 'high', dueDays: 2 },
      { title: 'Prepare negotiation brief', task_type: 'prepare_proposal', priority: 'medium', dueDays: 3 },
    ]
  },
  proposal: {
    note: 'Deal moved to Agreement Drafting. Prepare formal documentation.',
    tasks: [
      { title: 'Draft agreement document', task_type: 'prepare_proposal', priority: 'high', dueDays: 5 },
      { title: 'Send draft for internal review', task_type: 'review', priority: 'medium', dueDays: 7 },
    ]
  },
  negotiation: {
    note: 'Deal is now Awaiting Execution. Final signatures and approvals pending.',
    tasks: [
      { title: 'Follow up on agreement signing', task_type: 'follow_up', priority: 'urgent', dueDays: 2 },
      { title: 'Confirm all parties have signed', task_type: 'review', priority: 'high', dueDays: 5 },
    ]
  },
  closed_won: {
    note: 'Deal closed successfully! Proceeding to funding review.',
    tasks: [
      { title: 'Submit for funding review', task_type: 'review', priority: 'urgent', dueDays: 1 },
      { title: 'Send congratulations email to contact', task_type: 'send_email', priority: 'medium', dueDays: 1 },
    ]
  },
  closed_lost: {
    note: 'Deal marked as lost. Record lessons learned.',
    tasks: [
      { title: 'Document reasons for loss', task_type: 'review', priority: 'medium', dueDays: 3 },
      { title: 'Schedule re-engagement review', task_type: 'follow_up', priority: 'low', dueDays: 30 },
    ]
  }
};

const STAGE_LABELS = {
  prospecting: 'Due Diligence',
  qualification: 'Negotiation',
  proposal: 'Agreement Drafting',
  negotiation: 'Awaiting Execution',
  closed_won: 'Complete → Funding Review',
  closed_lost: 'Lost'
};

export async function handleDealStageTransition({ deal, oldStage, newStage, currentUser, profile }) {
  const rules = STAGE_TRANSITION_RULES[newStage];
  if (!rules) return;

  const now = new Date().toISOString();
  const userName = currentUser?.full_name || 'Unknown';
  const userEmail = currentUser?.email || '';

  // 1. Create a DealActivity (stage change log)
  const activityPromise = base44.entities.DealActivity.create({
    deal_id: deal.id,
    activity_type: 'stage_change',
    description: `Stage changed from ${STAGE_LABELS[oldStage] || oldStage} to ${STAGE_LABELS[newStage] || newStage}`,
    actor_id: userEmail,
    actor_name: userName,
    old_value: oldStage,
    new_value: newStage
  });

  // 2. Create a DealNote (auto note)
  const notePromise = base44.entities.DealNote.create({
    deal_id: deal.id,
    content: `[Auto] ${rules.note}`,
    author_id: userEmail,
    author_name: userName,
    author_avatar: profile?.avatar_url || ''
  });

  // 3. Create CRM follow-up tasks
  const taskPromises = rules.tasks.map(taskDef =>
    base44.entities.CRMTask.create({
      title: `${taskDef.title} — ${deal.title}`,
      description: `Auto-generated when "${deal.title}" moved to ${STAGE_LABELS[newStage]}.`,
      contact_id: deal.contact_email || deal.owner_id || '',
      contact_name: deal.contact_name || deal.company_name || '',
      deal_id: deal.id,
      deal_title: deal.title,
      assigned_to: deal.owner_id || userEmail,
      assigned_to_name: deal.owner_name || userName,
      due_date: addDays(new Date(), taskDef.dueDays).toISOString(),
      status: 'pending',
      priority: taskDef.priority,
      task_type: taskDef.task_type,
      auto_generated: true
    })
  );

  await Promise.all([activityPromise, notePromise, ...taskPromises]);
}

export { STAGE_TRANSITION_RULES, STAGE_LABELS };