import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Process commission for a closed/funded deal
 * Called when a deal moves to closed_won and funding_status becomes 'funded'
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Check if deal qualifies for commission
    if (deal.stage !== 'closed_won' || deal.funding_status !== 'funded') {
      return Response.json({ 
        error: 'Deal must be closed_won and funded to process commission' 
      }, { status: 400 });
    }

    // Check if commission already exists
    const existingCommissions = await base44.asServiceRole.entities.DealCommission.filter({ 
      deal_id: deal.id 
    });
    
    if (existingCommissions.length > 0) {
      return Response.json({ 
        message: 'Commission already processed',
        commission: existingCommissions[0]
      });
    }

    // Calculate commission (10% default rate)
    const commissionRate = 0.10;
    const commissionAmount = deal.amount * commissionRate;
    
    // Calculate GGG equivalent (example: 1 GGG per $1000 commission)
    const gggAmount = commissionAmount / 1000;

    // Create commission record
    const commission = await base44.asServiceRole.entities.DealCommission.create({
      deal_id: deal.id,
      deal_title: deal.title,
      agent_id: deal.owner_id,
      agent_name: deal.owner_name,
      deal_amount: deal.amount,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      ggg_amount: gggAmount,
      status: 'pending',
      notes: `Auto-generated commission for funded deal: ${deal.title}`
    });

    // Log activity
    await base44.asServiceRole.entities.DealActivity.create({
      deal_id: deal.id,
      activity_type: 'commission_paid',
      description: `Commission of $${commissionAmount.toLocaleString()} (${commissionRate * 100}%) created for ${deal.owner_name}`,
      actor_id: 'system',
      actor_name: 'System'
    });

    // Create notification for the agent
    await base44.asServiceRole.entities.Notification.create({
      user_id: deal.owner_id,
      title: '💰 Commission Earned!',
      message: `You earned a commission of $${commissionAmount.toLocaleString()} for closing deal "${deal.title}"`,
      type: 'deal_commission',
      action_url: `/Deals?id=${deal.id}`,
      is_read: false
    });

    return Response.json({
      success: true,
      commission,
      message: `Commission of $${commissionAmount.toLocaleString()} created for ${deal.owner_name}`
    });

  } catch (error) {
    console.error('Error processing commission:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});