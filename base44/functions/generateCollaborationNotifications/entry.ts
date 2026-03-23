import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile
    const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
    const profile = profiles?.[0];
    
    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check notification preferences
    const notifPrefs = profile.notification_prefs || {};
    if (notifPrefs.categories?.collaborations?.in_app === false) {
      return Response.json({ message: 'Collaboration notifications disabled' });
    }

    // Get all profiles
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list('-last_seen_at', 100);
    
    // Get user's skills
    const mySkills = await base44.entities.Skill.filter({ user_id: user.email });
    const mySkillNames = mySkills.map(s => s.skill_name?.toLowerCase()) || [];
    const myValues = profile.values_tags || [];

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find recent, relevant users
    const suggestions = allProfiles
      .filter(p => p.user_id !== user.email)
      .filter(p => {
        // Only users active in last 24 hours
        if (!p.last_seen_at) return false;
        return new Date(p.last_seen_at) > oneDayAgo;
      })
      .map(other => {
        const otherValues = other.values_tags || [];
        const otherSkills = other.skills || [];
        
        const sharedValues = myValues.filter(v => 
          otherValues.some(ov => ov.toLowerCase() === v.toLowerCase())
        );
        
        const sharedSkills = mySkillNames.filter(s => 
          otherSkills.some(os => os.toLowerCase().includes(s) || s.includes(os.toLowerCase()))
        );
        
        const isOnline = other.last_seen_at && new Date(other.last_seen_at) > fiveMinutesAgo;
        
        let score = 0;
        score += sharedValues.length * 15;
        score += sharedSkills.length * 20;
        if (isOnline) score += 25;
        
        return {
          ...other,
          score,
          sharedValues,
          sharedSkills,
          isOnline
        };
      })
      .filter(p => p.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // Check for existing notifications to avoid duplicates
    const existingNotifs = await base44.entities.Notification.filter({
      user_id: user.email,
      type: 'collaboration'
    });
    const existingSourceIds = new Set(existingNotifs.map(n => n.source_user_id));

    // Create notifications for new suggestions
    const created = [];
    for (const s of suggestions) {
      if (existingSourceIds.has(s.user_id)) continue;

      await base44.entities.Notification.create({
        user_id: user.email,
        type: 'collaboration',
        title: `Potential collaborator: ${s.display_name}`,
        message: s.sharedValues.length > 0 
          ? `Shares ${s.sharedValues.slice(0, 2).join(', ')} values with you${s.isOnline ? ' • Online now' : ''}`
          : `Has complementary skills in ${s.sharedSkills.slice(0, 2).join(', ')}${s.isOnline ? ' • Online now' : ''}`,
        priority: s.isOnline ? 'high' : 'normal',
        source_user_id: s.user_id,
        source_user_name: s.display_name,
        source_user_avatar: s.avatar_url,
        metadata: {
          sharedValues: s.sharedValues,
          sharedSkills: s.sharedSkills,
          score: s.score
        }
      });
      created.push(s.display_name);
    }

    // Send email if enabled
    if (notifPrefs.categories?.collaborations?.email && created.length > 0) {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `New collaboration suggestions on SaintAgent`,
        body: `
          <h2>New Potential Collaborators</h2>
          <p>We found ${created.length} new users who share your values and skills:</p>
          <ul>
            ${created.map(name => `<li>${name}</li>`).join('')}
          </ul>
          <p>Log in to connect with them!</p>
        `
      });
    }

    return Response.json({ 
      success: true, 
      created: created.length,
      suggestions: created 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});