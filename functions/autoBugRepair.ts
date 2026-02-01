import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can trigger auto-repair
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get pending bug reports
    const pendingBugs = await base44.asServiceRole.entities.BetaFeedback.filter({
      status: 'pending',
      feedback_type: 'bug'
    });

    if (pendingBugs.length === 0) {
      return Response.json({ 
        message: 'No pending bugs to process',
        processed: 0 
      });
    }

    const results = [];

    for (const bug of pendingBugs) {
      try {
        // Use Claude to analyze the bug and suggest a fix
        const analysis = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: `You are a bug analysis assistant. Analyze this bug report and provide:
1. A brief summary of the issue
2. The likely cause
3. Suggested fix approach
4. Severity assessment (low/medium/high/critical)

Bug Report:
- Page: ${bug.page_url || 'Unknown'}
- Description: ${bug.description}
- Reporter: ${bug.reporter_name || 'Anonymous'}
- Current Severity: ${bug.severity || 'medium'}

Respond in JSON format:
{
  "summary": "brief summary",
  "likely_cause": "what's causing this",
  "suggested_fix": "how to fix it",
  "severity_assessment": "low|medium|high|critical",
  "can_auto_fix": true/false,
  "auto_fix_notes": "notes if can auto fix"
}`
            }
          ]
        });

        const analysisText = analysis.content[0].text;
        let parsedAnalysis;
        
        try {
          // Extract JSON from response
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedAnalysis = JSON.parse(jsonMatch[0]);
          } else {
            parsedAnalysis = { summary: analysisText, can_auto_fix: false };
          }
        } catch {
          parsedAnalysis = { summary: analysisText, can_auto_fix: false };
        }

        // Update the bug report with analysis
        const adminNotes = `
**AI Analysis (${new Date().toISOString()})**
Summary: ${parsedAnalysis.summary || 'N/A'}
Likely Cause: ${parsedAnalysis.likely_cause || 'N/A'}
Suggested Fix: ${parsedAnalysis.suggested_fix || 'N/A'}
Severity Assessment: ${parsedAnalysis.severity_assessment || bug.severity}
Auto-fixable: ${parsedAnalysis.can_auto_fix ? 'Yes' : 'No'}
${parsedAnalysis.auto_fix_notes ? `Notes: ${parsedAnalysis.auto_fix_notes}` : ''}
        `.trim();

        await base44.asServiceRole.entities.BetaFeedback.update(bug.id, {
          status: 'reviewed',
          severity: parsedAnalysis.severity_assessment || bug.severity,
          admin_notes: adminNotes
        });

        // Log to audit
        await base44.asServiceRole.entities.UserAuditLog.create({
          user_id: user.email,
          action_type: 'other',
          action_detail: `Auto-analyzed bug report: ${bug.id}`,
          entity_type: 'BetaFeedback',
          entity_id: bug.id,
          metadata: {
            analysis: parsedAnalysis,
            original_description: bug.description
          }
        });

        results.push({
          bug_id: bug.id,
          status: 'analyzed',
          analysis: parsedAnalysis
        });

      } catch (bugError) {
        results.push({
          bug_id: bug.id,
          status: 'error',
          error: bugError.message
        });
      }
    }

    return Response.json({
      message: `Processed ${results.length} bug reports`,
      processed: results.length,
      results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});