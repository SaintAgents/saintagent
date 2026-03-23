import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { project_id, claim_note, claim_from_submitter, admin_override, assign_to_email } = await req.json();

    if (!project_id) {
      return Response.json({ error: 'project_id required' }, { status: 400 });
    }

    // Get project
    const projects = await base44.entities.Project.filter({ id: project_id });
    const project = projects?.[0];

    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    // Admin override - auto-approve immediately (optionally assign to another user)
    if (admin_override && user.role === 'admin') {
      const ownerEmail = assign_to_email || user.email;
      
      await base44.asServiceRole.entities.Project.update(project_id, {
        claim_status: 'approved',
        claimed_by: ownerEmail,
        claimed_at: new Date().toISOString(),
        claim_note: claim_note || `Admin override claim${assign_to_email ? ` - assigned to ${assign_to_email}` : ''}`,
        auto_claimed: true
      });

      // Notify the assigned user if different from admin
      if (assign_to_email && assign_to_email !== user.email) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: assign_to_email,
          type: 'system',
          title: 'Project Ownership Assigned',
          message: `An admin has assigned you ownership of "${project.title}". You can now edit and manage this project.`,
          action_url: `/Projects?id=${project_id}`,
          priority: 'high'
        });
      }

      return Response.json({ 
        success: true, 
        auto_approved: true,
        message: assign_to_email && assign_to_email !== user.email 
          ? `Ownership assigned to ${assign_to_email}.`
          : 'Admin override: Ownership granted immediately.'
      });
    }

    if (project.claim_status === 'approved') {
      return Response.json({ error: 'Project already claimed' }, { status: 400 });
    }

    // If claiming as original submitter, notify the project creator
    if (claim_from_submitter && project.created_by && project.created_by !== user.email) {
      await base44.asServiceRole.entities.Project.update(project_id, {
        claim_status: 'pending',
        claimed_by: user.email,
        claimed_at: new Date().toISOString(),
        claim_note: claim_note || 'User claims this is their submission'
      });

      // Notify the original submitter
      await base44.asServiceRole.entities.Notification.create({
        user_id: project.created_by,
        type: 'system',
        title: 'Ownership Claim on Your Submission',
        message: `${user.full_name || user.email} is claiming ownership of "${project.title}" which you submitted. Please review and approve/reject.`,
        action_url: `/Projects?id=${project_id}`,
        priority: 'high'
      });

      // Also notify admins
      const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
      for (const admin of admins) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: admin.email,
          type: 'system',
          title: 'Project Claim Request (Submitter Notified)',
          message: `${user.full_name || user.email} claims ownership of "${project.title}". Original submitter (${project.created_by}) has been notified.`,
          action_url: '/Admin?tab=projects',
          priority: 'normal'
        });
      }

      return Response.json({ 
        success: true, 
        auto_approved: false,
        message: `Request sent to the original submitter (${project.created_by}) for approval.`
      });
    }

    // Check if user email matches legacy SA list
    const legacySAs = await base44.entities.LegacySaintAgent.filter({ 
      email: user.email.toLowerCase() 
    });
    const legacySA = legacySAs?.[0];

    // Check if this project belongs to a legacy SA with matching email
    const isLegacyMatch = legacySA || 
      (project.legacy_sa_email && project.legacy_sa_email.toLowerCase() === user.email.toLowerCase());

    if (isLegacyMatch) {
      // Auto-approve claim
      await base44.asServiceRole.entities.Project.update(project_id, {
        claim_status: 'approved',
        claimed_by: user.email,
        claimed_at: new Date().toISOString(),
        claim_note: claim_note || 'Auto-approved via legacy SA verification',
        auto_claimed: true
      });

      // Mark legacy SA as claimed if exists
      if (legacySA && !legacySA.claimed) {
        await base44.asServiceRole.entities.LegacySaintAgent.update(legacySA.id, {
          claimed: true,
          claimed_by: user.email,
          claimed_at: new Date().toISOString()
        });
      }

      // Create notification
      await base44.asServiceRole.entities.Notification.create({
        user_id: user.email,
        type: 'system',
        title: 'Project Ownership Confirmed!',
        message: `You've been verified as the owner of "${project.title}". You can now edit and manage this project.`,
        priority: 'high'
      });

      return Response.json({ 
        success: true, 
        auto_approved: true,
        message: 'Ownership verified! You are recognized as a legacy Saint Agent.'
      });
    }

    // Not a legacy match - submit for manual review
    await base44.asServiceRole.entities.Project.update(project_id, {
      claim_status: 'pending',
      claimed_by: user.email,
      claimed_at: new Date().toISOString(),
      claim_note: claim_note || ''
    });

    // Notify admins using service role
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    for (const admin of admins) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: admin.email,
        type: 'system',
        title: 'Project Claim Request',
        message: `${user.full_name || user.email} is requesting ownership of "${project.title}"`,
        action_url: '/Admin?tab=projects',
        priority: 'normal'
      });
    }

    return Response.json({ 
      success: true, 
      auto_approved: false,
      message: 'Claim submitted for review. An admin will verify your ownership.'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});