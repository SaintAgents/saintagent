import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admin can process commissions
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    const { deal_id } = await req.json();
    
    if (!deal_id) {
      return Response.json({ error: 'deal_id is required' }, { status: 400 });
    }
    
    // Get the deal
    const deals = await base44.asServiceRole.entities.Deal.filter({ id: deal_id });
    const deal = deals[0];
    
    if (!deal) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }
    
    // Check if deal is funded and commission not yet paid
    if (deal.stage !== 'closed_won') {
      return Response.json({ error: 'Deal must be closed_won to process commission' }, { status: 400 });
    }
    
    if (deal.funding_status !== 'funded') {
      return Response.json({ error: 'Deal must be funded to process commission' }, { status: 400 });
    }
    
    if (deal.commission_paid) {
      return Response.json({ error: 'Commission already paid for this deal' }, { status: 400 });
    }
    
    // Calculate commission
    const commissionRate = deal.commission_rate || 10;
    const commissionAmount = (deal.amount || 0) * (commissionRate / 100);
    
    // Get owner's current GGG balance
    const ownerProfiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: deal.owner_id });
    const ownerProfile = ownerProfiles[0];
    
    if (!ownerProfile) {
      return Response.json({ error: 'Deal owner profile not found' }, { status: 404 });
    }
    
    const currentBalance = ownerProfile.ggg_balance || 0;
    const newBalance = currentBalance + commissionAmount;
    
    // Create GGG transaction
    await base44.asServiceRole.entities.GGGTransaction.create({
      user_id: deal.owner_id,
      source_type: 'deal_commission',
      source_id: deal.id,
      delta: commissionAmount,
      reason_code: 'deal_commission',
      description: `Commission for deal: ${deal.title}`,
      balance_after: newBalance
    });
    
    // Update owner's GGG balance
    await base44.asServiceRole.entities.UserProfile.update(ownerProfile.id, {
      ggg_balance: newBalance
    });
    
    // Mark commission as paid on the deal
    await base44.asServiceRole.entities.Deal.update(deal.id, {
      commission_paid: true,
      commission_amount: commissionAmount,
      commission_paid_date: new Date().toISOString()
    });
    
    // Log activity
    await base44.asServiceRole.entities.DealActivity.create({
      deal_id: deal.id,
      activity_type: 'updated',
      description: `Commission of $${commissionAmount.toLocaleString()} paid to ${deal.owner_name}`,
      actor_id: user.email,
      actor_name: user.full_name
    });
    
    // Send notification to owner
    await base44.asServiceRole.entities.Notification.create({
      user_id: deal.owner_id,
      title: 'Commission Received!',
      message: `You earned $${commissionAmount.toLocaleString()} commission for deal: ${deal.title}`,
      type: 'success',
      action_url: `/Deals?id=${deal.id}`
    });
    
    return Response.json({
      success: true,
      commission_amount: commissionAmount,
      new_balance: newBalance,
      deal_title: deal.title,
      owner_name: deal.owner_name
    });
    
  } catch (error) {
    console.error('Commission processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});