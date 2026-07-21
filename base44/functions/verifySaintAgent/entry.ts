import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { sa_number, display_name } = body;

    if (!sa_number) {
      return Response.json(
        { verified: false, error: 'sa_number is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Normalize the SA number — strip leading zeros for comparison, then pad
    const normalizedNumber = sa_number.toString().replace(/^0+/, '') || '0';
    const paddedNumber = normalizedNumber.padStart(6, '0');

    // Look up by SA number using service role (public API, no user auth)
    const profiles = await base44.asServiceRole.entities.UserProfile.filter(
      { sa_number: paddedNumber },
      '-created_date',
      1
    );

    if (!profiles || profiles.length === 0) {
      // Also try the raw input in case formatting differs
      const profilesRaw = await base44.asServiceRole.entities.UserProfile.filter(
        { sa_number: sa_number.toString() },
        '-created_date',
        1
      );

      if (!profilesRaw || profilesRaw.length === 0) {
        return Response.json(
          { verified: false, message: 'No SaintAgent found with that number' },
          { status: 200, headers: CORS_HEADERS }
        );
      }

      const profile = profilesRaw[0];
      return buildResponse(profile, display_name);
    }

    const profile = profiles[0];
    return buildResponse(profile, display_name);
  } catch (error) {
    return Response.json(
      { verified: false, error: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

function buildResponse(profile, display_name) {
  // If a name was provided, check if it matches
  let nameMatch = null;
  if (display_name) {
    const profileName = (profile.display_name || '').toLowerCase().trim();
    const queryName = display_name.toLowerCase().trim();
    nameMatch = profileName === queryName || profileName.includes(queryName) || queryName.includes(profileName);
  }

  const result = {
    verified: true,
    sa_number: profile.sa_number,
    display_name: profile.display_name,
    handle: profile.handle,
    rank_code: profile.rank_code || 'seeker',
    avatar_url: profile.avatar_url || null,
    leader_tier: profile.leader_tier || 'none',
    trust_score: profile.trust_score || 0,
  };

  if (display_name) {
    result.name_match = nameMatch;
  }

  return Response.json(result, { status: 200, headers: CORS_HEADERS });
}