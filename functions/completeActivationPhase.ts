import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const PHASE_GGG = {
  phase_1_profile: 50,
  phase_2_assessments: 75,
  phase_3_matches: 50,
  phase_4_mission: 100,
  phase_5_introduction: 75,
  phase_6_ggg: 50,
  phase_7_synchronicity: 150,
};

const PHASE_LABELS = {
  phase_1_profile: 'Profile Setup',
  phase_2_assessments: 'Assessments Complete',
  phase_3_matches: 'First Matches Viewed',
  phase_4_mission: 'First Mission',
  phase_5_introduction: 'First Connection',
  phase_6_ggg: 'First GGG Earned',
  phase_7_synchronicity: 'Synchronicity Activated',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phase } = await req.json();

    if (!phase || !PHASE_GGG[phase]) {
      return Response.json({ error: 'Invalid phase' }, { status: 400 });
    }

    // Get or create checklist
    let checklists = await base44.entities.ActivationChecklist.filter({ user_id: user.email });
    let checklist = checklists[0];

    if (!checklist) {
      checklist = await base44.entities.ActivationChecklist.create({ user_id: user.email });
    }

    // Check if already completed
    if (checklist[phase]) {
      return Response.json({ 
        success: false, 
        message: 'Phase already completed',
        checklist 
      });
    }

    // Mark phase complete
    const gggEarned = PHASE_GGG[phase];
    const completedAtKey = phase.replace('phase_', 'phase_') + '_completed_at';
    
    const updateData = {
      [phase]: true,
      [completedAtKey]: new Date().toISOString(),
      total_ggg_earned: (checklist.total_ggg_earned || 0) + gggEarned
    };

    // Check if all phases complete
    const allPhases = Object.keys(PHASE_GGG);
    const willBeComplete = allPhases.every(p => p === phase || checklist[p]);
    
    if (willBeComplete) {
      updateData.fully_activated = true;
      updateData.activated_at = new Date().toISOString();
    }

    await base44.entities.ActivationChecklist.update(checklist.id, updateData);

    // Award GGG via transaction
    await base44.entities.GGGTransaction.create({
      user_id: user.email,
      source_type: 'reward',
      delta: gggEarned,
      reason_code: 'activation_phase',
      description: `Activation Phase: ${PHASE_LABELS[phase]}`
    });

    // Update user profile GGG balance
    const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
    if (profiles[0]) {
      await base44.entities.UserProfile.update(profiles[0].id, {
        ggg_balance: (profiles[0].ggg_balance || 0) + gggEarned
      });
    }

    // Create notification
    await base44.entities.Notification.create({
      user_id: user.email,
      type: 'ggg',
      title: `Phase Complete: ${PHASE_LABELS[phase]}`,
      message: `You earned ${gggEarned} GGG! ${willBeComplete ? '🎉 You are now fully activated!' : ''}`,
      priority: willBeComplete ? 'high' : 'normal'
    });

    return Response.json({ 
      success: true, 
      phase,
      ggg_earned: gggEarned,
      fully_activated: willBeComplete,
      message: willBeComplete 
        ? 'Congratulations! You are now a fully activated Saint Agent!' 
        : `Phase complete! +${gggEarned} GGG`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});