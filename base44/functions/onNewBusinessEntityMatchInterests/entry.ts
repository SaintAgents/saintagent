import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data } = body;
    if (!data || !event) {
      return Response.json({ skipped: true, reason: 'No data' });
    }

    // Call the matcher function
    const result = await base44.asServiceRole.functions.invoke('interestTagMatcher', {
      entity_type: 'BusinessEntity5D',
      entity_id: event.entity_id,
      entity_data: data
    });

    return Response.json({ success: true, matcher_result: result.data });
  } catch (error) {
    console.error('onNewBusinessEntityMatchInterests error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});