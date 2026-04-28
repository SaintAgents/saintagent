import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { entity_type, entity_id, entity_data } = await req.json();

    if (!entity_type || !entity_data) {
      return Response.json({ error: 'Missing entity_type or entity_data' }, { status: 400 });
    }

    // Extract searchable text from the entity
    let searchableText = '';
    let entityTitle = '';
    let actionUrl = '';

    if (entity_type === 'Mission') {
      entityTitle = entity_data.title || 'New Mission';
      searchableText = [
        entity_data.title,
        entity_data.description,
        entity_data.objective,
        entity_data.mission_type,
        ...(entity_data.roles_needed || []),
        ...(entity_data.tags || [])
      ].filter(Boolean).join(' ').toLowerCase();
      actionUrl = `/MissionDetail?id=${entity_id}`;
    } else if (entity_type === 'BusinessEntity5D') {
      entityTitle = entity_data.name || 'New Business Entity';
      searchableText = [
        entity_data.name,
        entity_data.description,
        entity_data.tagline,
        entity_data.mission_statement,
        entity_data.category,
        ...(entity_data.focus_areas || []),
        ...(entity_data.services_offered || []).map(s => s.name + ' ' + (s.description || ''))
      ].filter(Boolean).join(' ').toLowerCase();
      actionUrl = `/BusinessEntityProfile?id=${entity_id}`;
    } else {
      return Response.json({ skipped: true, reason: 'Unknown entity type' });
    }

    // Fetch all profiles that have interest tags and alerts enabled
    const allProfiles = await base44.asServiceRole.entities.UserProfile.filter({
      interest_alerts_enabled: true
    });

    const matchedUsers = [];

    for (const profile of allProfiles) {
      const tags = profile.interest_tags;
      if (!tags || tags.length === 0) continue;

      // Skip notifying the creator of the entity
      if (entity_type === 'Mission' && entity_data.creator_id === profile.user_id) continue;
      if (entity_type === 'BusinessEntity5D' && entity_data.owner_id === profile.user_id) continue;

      // Check if any interest tag matches the searchable text
      const matchedTags = tags.filter(tag => searchableText.includes(tag.toLowerCase()));

      if (matchedTags.length > 0) {
        // Create a notification for this user
        await base44.asServiceRole.entities.Notification.create({
          user_id: profile.user_id,
          type: entity_type === 'Mission' ? 'mission' : 'business_listing',
          title: `New ${entity_type === 'Mission' ? 'Mission' : 'Business Entity'} matches your interests`,
          message: `"${entityTitle}" matches your tags: ${matchedTags.join(', ')}`,
          action_url: actionUrl,
          action_label: entity_type === 'Mission' ? 'View Mission' : 'View Entity',
          priority: 'normal',
          metadata: {
            matched_tags: matchedTags,
            entity_type,
            entity_id
          }
        });

        matchedUsers.push({
          user_id: profile.user_id,
          matched_tags: matchedTags
        });
      }
    }

    return Response.json({
      success: true,
      entity_type,
      entity_id,
      notifications_sent: matchedUsers.length,
      matched_users: matchedUsers
    });
  } catch (error) {
    console.error('Interest tag matcher error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});