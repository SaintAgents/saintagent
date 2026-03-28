import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emails, subject, personalNote, senderName, affiliateUrl } = await req.json();
    
    if (!emails || emails.length === 0) {
      return Response.json({ error: 'No emails provided' }, { status: 400 });
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

    const fromName = senderName || 'SaintAgent';
    const link = affiliateUrl || 'https://saintagent.world';

    const fullBody = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;">
<div style="text-align:center;margin-bottom:24px;">
<h1 style="color:#6d28d9;font-size:28px;margin:0;">SaintAgent</h1>
<p style="color:#64748b;font-size:14px;margin-top:4px;">A Platform for Conscious Creators</p>
</div>
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
            subject: subject || "You're invited to join SaintAgent",
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