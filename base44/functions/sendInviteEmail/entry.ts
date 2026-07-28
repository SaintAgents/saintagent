import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const ROLE_DESCRIPTIONS: Record<string, { title: string; tagline: string; responsibilities: string[]; perks: string[] }> = {
  user: {
    title: 'Member',
    tagline: 'Welcome to the SaintAgent community!',
    responsibilities: [
      'Create and maintain your profile',
      'Participate in missions, events, and community discussions',
      'Earn GGG tokens through contributions and engagement',
      'Connect with other conscious creators and collaborators'
    ],
    perks: [
      'Access to the marketplace, messaging, and collaboration tools',
      'AI-powered matching with compatible collaborators',
      'Rank progression and badge earning system',
      'Community circles, forums, and live broadcasts'
    ]
  },
  member: {
    title: 'Member',
    tagline: 'You\'re now part of the SaintAgent community.',
    responsibilities: [
      'Create and manage your profile',
      'Earn rank progression through engagement',
      'Submit content, prompts, or actions',
      'Engage with features based on your rank level'
    ],
    perks: [
      'Full platform access for missions, marketplace, and matching',
      'GGG token earning through contributions',
      'Community circles and event participation',
      'AI-powered tools and collaboration features'
    ]
  },
  contributor: {
    title: 'Contributor',
    tagline: 'You\'ve been recognized as a trusted content creator.',
    responsibilities: [
      'Submit featured content, articles, or resources',
      'Propose improvements and innovative ideas',
      'Participate in structured discussions and workshops',
      'Assist and mentor newer community members'
    ],
    perks: [
      'Featured content placement and visibility',
      'Access to the Content Studio and publishing tools',
      'Higher GGG earning multipliers for contributions',
      'Direct input on community direction and features'
    ]
  },
  reviewer: {
    title: 'Reviewer',
    tagline: 'Your expertise is needed to evaluate and guide quality.',
    responsibilities: [
      'Score and review project submissions and proposals',
      'Provide structured, constructive feedback',
      'Participate in governance and evaluation workflows',
      'Flag ethical, technical, or quality issues for escalation'
    ],
    perks: [
      'Access to the evaluation and scoring dashboard',
      'GGG rewards for completed reviews',
      'Influence on which projects receive funding and support',
      'Recognition as a trusted evaluator in the community'
    ]
  },
  moderator: {
    title: 'Moderator',
    tagline: 'You\'re entrusted to maintain community standards and safety.',
    responsibilities: [
      'Review and moderate user-generated content across forums, feeds, and circles',
      'Resolve disputes and enforce community guidelines fairly',
      'Flag critical issues for admin escalation',
      'Issue warnings and temporary restrictions when necessary'
    ],
    perks: [
      'Access to the moderation dashboard and content queue',
      'Admin panel visibility for community health metrics',
      'GGG rewards for moderation activity',
      'Direct communication channel with leadership team'
    ]
  },
  coordinator: {
    title: 'Coordinator',
    tagline: 'You\'re a key operational leader helping run SaintAgent.',
    responsibilities: [
      'Oversee project submissions and conduct coordinator reviews',
      'Test bug fixes and confirm resolution (coordinator testing)',
      'Help manage missions, events, and community operations',
      'Review admin requests and assist with user onboarding',
      'Coordinate between teams, contributors, and leadership',
      'Monitor platform health and report issues proactively'
    ],
    perks: [
      'Full admin dashboard access (without financial controls)',
      'Coordinator review panel for scoring and evaluating projects',
      'Bug fix testing and confirmation authority',
      'Higher GGG earning rates and coordinator-specific badges',
      'Direct involvement in platform strategy and decision-making',
      'Leadership recognition in the community'
    ]
  },
  guardian_role: {
    title: 'Guardian',
    tagline: 'You\'re a high-trust protector of platform integrity.',
    responsibilities: [
      'Override moderation decisions when necessary for fairness',
      'Handle sensitive and high-stakes community cases',
      'Safeguard core platform values and ethical standards',
      'Serve as the final human judgment layer before admin escalation'
    ],
    perks: [
      'Highest-level moderation authority',
      'Access to sensitive case management tools',
      'Guardian badge and elite recognition',
      'Direct line to the Founder/Custodian team'
    ]
  },
  council_member: {
    title: 'Council Member',
    tagline: 'You\'re a strategic advisor shaping SaintAgent\'s future.',
    responsibilities: [
      'Participate in platform-level strategic decisions',
      'Influence policy, rank criteria, and governance frameworks',
      'Resolve high-level disputes and escalated issues',
      'Approve major platform changes and initiatives'
    ],
    perks: [
      'Voting power on governance proposals',
      'Access to strategic planning sessions and roadmap input',
      'Council Member badge and elite community status',
      'Priority access to new features and beta programs'
    ]
  },
  admin: {
    title: 'Administrator',
    tagline: 'You have full operational control of the platform.',
    responsibilities: [
      'Manage all users, roles, and permissions',
      'Configure platform settings, GGG rules, and reward systems',
      'Monitor platform health, analytics, and security',
      'Deploy updates and manage infrastructure operations'
    ],
    perks: [
      'Full admin dashboard with all controls',
      'User management and GGG balance controls',
      'Platform settings and broadcast management',
      'Complete analytics and audit log access'
    ]
  },
  administrator: {
    title: 'Administrator',
    tagline: 'You have full operational control of the platform.',
    responsibilities: [
      'Manage all users, roles, and permissions',
      'Configure platform settings, GGG rules, and reward systems',
      'Monitor platform health, analytics, and security',
      'Deploy updates and manage infrastructure operations'
    ],
    perks: [
      'Full admin dashboard with all controls',
      'User management and GGG balance controls',
      'Platform settings and broadcast management',
      'Complete analytics and audit log access'
    ]
  },
  architect: {
    title: 'Architect',
    tagline: 'You\'re a designer of the systems that power SaintAgent.',
    responsibilities: [
      'Design core agents, workflows, and evaluation frameworks',
      'Define schemas, data models, and system logic',
      'Influence long-term platform architecture and evolution',
      'Collaborate with the Founder/Custodian on technical vision'
    ],
    perks: [
      'Full platform access including all admin tools',
      'Architecture decision authority',
      'Architect badge and elite recognition',
      'Direct collaboration with the founding team'
    ]
  },
  founder_custodian: {
    title: 'Founder / Custodian',
    tagline: 'You are an originator and ultimate steward of the vision.',
    responsibilities: [
      'Final authority on platform purpose, mission, and values',
      'Long-term guardianship of the community and its principles',
      'Emergency override capability (rare and restrained)',
      'Vision-setting and strategic direction'
    ],
    perks: [
      'Unrestricted platform access',
      'Final decision authority',
      'Founder badge and permanent recognition',
      'Legacy stewardship of the SaintAgent ecosystem'
    ]
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emails, subject, personalNote, senderName, affiliateUrl, role } = await req.json();
    
    if (!emails || emails.length === 0) {
      return Response.json({ error: 'No emails provided' }, { status: 400 });
    }

    const fromName = senderName || 'SaintAgent';
    const link = affiliateUrl || 'https://saintagent.world';

    // Build role-specific section if role is provided
    const roleInfo = role ? ROLE_DESCRIPTIONS[role] || ROLE_DESCRIPTIONS['user'] : null;
    
    let roleHtml = '';
    if (roleInfo) {
      const responsibilitiesList = roleInfo.responsibilities.map(r => 
        `<li style="color:#334155;font-size:14px;line-height:1.6;margin-bottom:4px;">✦ ${r}</li>`
      ).join('');
      const perksList = roleInfo.perks.map(p => 
        `<li style="color:#334155;font-size:14px;line-height:1.6;margin-bottom:4px;">⚡ ${p}</li>`
      ).join('');

      roleHtml = `
        <div style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #c4b5fd;">
          <div style="text-align:center;margin-bottom:16px;">
            <span style="display:inline-block;background:#6d28d9;color:#fff;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">YOUR ROLE</span>
          </div>
          <h2 style="color:#6d28d9;font-size:22px;margin:0 0 4px 0;text-align:center;font-weight:700;">${roleInfo.title}</h2>
          <p style="color:#7c3aed;font-size:15px;text-align:center;margin:0 0 16px 0;font-style:italic;">${roleInfo.tagline}</p>
          
          <div style="margin-bottom:16px;">
            <h3 style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 8px 0;border-bottom:2px solid #c4b5fd;padding-bottom:4px;">📋 Your Responsibilities</h3>
            <ul style="list-style:none;padding:0;margin:0;">${responsibilitiesList}</ul>
          </div>
          
          <div>
            <h3 style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 8px 0;border-bottom:2px solid #c4b5fd;padding-bottom:4px;">🎁 What You Get</h3>
            <ul style="list-style:none;padding:0;margin:0;">${perksList}</ul>
          </div>
        </div>`;
    }

    const noteHtml = personalNote 
      ? `<p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 16px 0;padding-bottom:16px;border-bottom:1px solid #e2e8f0;">${personalNote.replace(/\n/g, '<br/>')}</p>` 
      : '';

    const defaultMessage = `Hi there,

I've been building and collaborating on SaintAgent — a platform for conscious creators, healers, entrepreneurs, and visionaries.

Here's what you can do:

EARN — Complete missions, sell services, earn GGG tokens and referral rewards
LEARN — Courses, mentorship, workshops, live broadcasts, and AI insights
SELL — List your skills, manage bookings, sell digital products
COLLABORATE — AI-matched collaborators, funded projects, shared docs and video calls
MISSIONS — Real projects with milestones, tasks, and completion rewards
REPUTATION — Badges, ranks, leaderboards, challenges, and trust scores
COMMUNITY — Circles, events, messaging, forums, and matching
BUSINESS TOOLS — CRM, deal tracking, project management, and analytics

I'd love for you to join me — it only takes a few minutes to get started.`;

    const messageHtml = defaultMessage
      .replace(/\n\n/g, '</p><p style="color:#334155;font-size:14px;line-height:1.7;margin:8px 0;">')
      .replace(/\n/g, '<br/>');

    const roleSubject = roleInfo 
      ? `You've been invited as ${roleInfo.title} on SaintAgent` 
      : subject || "You're invited to join SaintAgent";

    const fullBody = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;">
<div style="text-align:center;margin-bottom:24px;">
<h1 style="color:#6d28d9;font-size:28px;margin:0;">SaintAgent</h1>
<p style="color:#64748b;font-size:14px;margin-top:4px;">A Platform for Conscious Creators</p>
</div>
${roleHtml}
<div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #e2e8f0;">
${noteHtml}
<p style="color:#334155;font-size:14px;line-height:1.7;margin:0;">${messageHtml}</p>
</div>
<div style="text-align:center;margin:28px 0;">
<a href="${link}" style="display:inline-block;background:#6d28d9;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">Join SaintAgent Now</a>
</div>
<p style="color:#94a3b8;font-size:12px;text-align:center;border-top:1px solid #e2e8f0;padding-top:16px;">Invited by ${fromName}</p>
</div>`;

    const results = [];

    for (const email of emails) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `SaintAgent <onboarding@resend.dev>`,
            to: [email.trim()],
            subject: subject || roleSubject,
            html: fullBody
          })
        });

        const data = await res.json();
        
        if (res.ok) {
          results.push({ email: email.trim(), success: true, id: data.id });
        } else {
          results.push({ email: email.trim(), success: false, error: data.message || 'Send failed' });
        }
      } catch (err) {
        results.push({ email: email.trim(), success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return Response.json({ 
      success: successCount > 0, 
      sent: successCount, 
      total: emails.length,
      results 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});