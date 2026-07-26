import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { project_id, claim_note, admin_override, assign_to_email } = await req.json();

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
        auto_claimed: true,
        owner_id: ownerEmail
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

    // =====================================================
    // AUTO-APPROVE: If the person who originally put this
    // project in the database (created_by_id) matches the
    // claimer's email, auto-approve immediately.
    // =====================================================
    const originalSubmitterEmail = project.created_by_id;
    const isOriginalSubmitter = originalSubmitterEmail && 
      originalSubmitterEmail.toLowerCase() === user.email.toLowerCase();

    // Also check legacy_sa_email as a secondary auto-approve path
    const isLegacyMatch = project.legacy_sa_email && 
      project.legacy_sa_email.toLowerCase() === user.email.toLowerCase();

    if (isOriginalSubmitter || isLegacyMatch) {
      // Auto-approve — email matches original submitter in the database
      await base44.asServiceRole.entities.Project.update(project_id, {
        claim_status: 'approved',
        claimed_by: user.email,
        claimed_at: new Date().toISOString(),
        claim_note: claim_note || (isOriginalSubmitter 
          ? 'Auto-approved: claimer is the original database submitter' 
          : 'Auto-approved via legacy SA email match'),
        auto_claimed: true,
        owner_id: user.email
      });

      // Create notification
      await base44.asServiceRole.entities.Notification.create({
        user_id: user.email,
        type: 'system',
        title: 'Project Ownership Confirmed!',
        message: `You've been verified as the owner of "${project.title}". You can now edit and manage this project.`,
        priority: 'high'
      });

      // Send email confirmation (best-effort)
      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `Project Ownership Confirmed: ${project.title}`,
          body: `<h2>Project Ownership Confirmed!</h2>
<p>Hi ${user.full_name || 'there'},</p>
<p>Your claim on the project <strong>"${project.title}"</strong> has been <strong>auto-approved</strong> because your email matches our records.</p>
<p>You can now edit and manage this project from your dashboard.</p>
<p>— Saint Agents World</p>`
        });
      } catch (emailErr) {
        console.error('Failed to send claim confirmation email:', emailErr.message);
      }

      return Response.json({ 
        success: true, 
        auto_approved: true,
        message: 'Ownership verified! Your email matches the original submission.'
      });
    }

    // =====================================================
    // NO MATCH: Email doesn't match original submitter.
    // Submit for admin review via AdminRequest.
    // =====================================================
    await base44.asServiceRole.entities.Project.update(project_id, {
      claim_status: 'pending',
      claimed_by: user.email,
      claimed_at: new Date().toISOString(),
      claim_note: claim_note || ''
    });

    // Create an AdminRequest for the claim
    await base44.asServiceRole.entities.AdminRequest.create({
      request_type: 'project_claim',
      title: `Project Claim: ${project.title}`,
      description: `${user.full_name || user.email} is requesting ownership of "${project.title}".\n\nOriginal submitter: ${originalSubmitterEmail || 'Unknown'}\nClaimer: ${user.email}\n\nNote: ${claim_note || 'No note provided'}`,
      requester_id: user.email,
      requester_name: user.full_name || user.email,
      reference_type: 'project',
      reference_id: project_id,
      requested_value: {
        project_id: project_id,
        project_title: project.title,
        claimer_email: user.email,
        original_submitter: originalSubmitterEmail || null,
        claim_note: claim_note || ''
      },
      priority: 'high',
      status: 'pending'
    });

    // Notify admins
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    for (const admin of admins) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: admin.email,
        type: 'system',
        title: 'Project Claim Request',
        message: `${user.full_name || user.email} is requesting ownership of "${project.title}". Original submitter: ${originalSubmitterEmail || 'Unknown'}. Requires admin review.`,
        action_url: '/Admin?tab=requests',
        priority: 'high'
      });
    }

    // Send email confirmation to user
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Project Claim Submitted: ${project.title}`,
        body: `<h2>Claim Submitted for Admin Review</h2>
<p>Hi ${user.full_name || 'there'},</p>
<p>Your claim on the project <strong>"${project.title}"</strong> has been submitted for admin review because your email doesn't match the original submitter on file.</p>
<p>An admin will review your request and you'll be notified of the decision.</p>
<p>— Saint Agents World</p>`
      });
    } catch (emailErr) {
      console.error('Failed to send claim submission email:', emailErr.message);
    }

    return Response.json({ 
      success: true, 
      auto_approved: false,
      message: 'Your claim has been submitted for admin review. You\'ll be notified once it\'s processed.'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});