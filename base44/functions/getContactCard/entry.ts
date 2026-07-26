import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const saNumber = body?.sa_number;

    if (!saNumber) {
      return Response.json({ error: 'SA number required' }, { status: 400 });
    }

    const profiles = await base44.asServiceRole.entities.UserProfile.filter(
      { sa_number: String(saNumber) }, '-updated_date', 1
    );

    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Contact not found' }, { status: 404 });
    }

    const profile = profiles[0];

    return Response.json({
      display_name: profile.display_name || '',
      handle: profile.handle || '',
      user_id: profile.user_id || '',
      bio: profile.bio || '',
      region: profile.region || '',
      avatar_url: profile.avatar_url || '',
      trust_score: profile.trust_score || 0,
      sa_number: profile.sa_number || '',
      social_links: profile.social_links || {}
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}