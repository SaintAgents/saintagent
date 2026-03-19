import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * AI-Enhanced Task Recommendation Engine
 * Scores team members based on:
 * 1. Historical completion speed (avg days to complete similar tasks)
 * 2. Current workload capacity (active task count + hours)
 * 3. Relevant skill tag matching
 * 4. AI analysis of task requirements vs member strengths
 * Returns ranked recommendations with reasoning.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { project_id, task_title, task_description, task_priority, estimated_hours, skill_tags } = await req.json();
    if (!project_id) return Response.json({ error: 'project_id required' }, { status: 400 });

    // Fetch project, team, tasks, skills, profiles in parallel
    const [projects, allTasks, allSkills, allProfiles] = await Promise.all([
      base44.asServiceRole.entities.Project.filter({ id: project_id }),
      base44.asServiceRole.entities.ProjectTask.filter({ project_id }, '-created_date', 1000),
      base44.asServiceRole.entities.Skill.list('-created_date', 1000),
      base44.asServiceRole.entities.UserProfile.list('-updated_date', 500),
    ]);

    const project = projects[0];
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    const teamMemberIds = [...new Set([project.owner_id, ...(project.team_member_ids || [])])].filter(Boolean);
    if (teamMemberIds.length === 0) return Response.json({ recommendations: [] });

    // Build candidate data for scoring
    const candidates = [];

    for (const memberId of teamMemberIds) {
      const profile = allProfiles.find(p => p.user_id === memberId);
      const memberSkills = allSkills.filter(s => s.user_id === memberId && s.type === 'offer');

      // --- 1. HISTORICAL COMPLETION SPEED ---
      const completedTasks = allTasks.filter(t => t.assignee_id === memberId && t.status === 'completed' && t.completed_at);
      let avgCompletionDays = null;
      const completionCount = completedTasks.length;

      if (completedTasks.length > 0) {
        const durations = completedTasks.map(t => {
          const start = new Date(t.start_date || t.created_date);
          const end = new Date(t.completed_at);
          return Math.max(Math.ceil((end - start) / 86400000), 1);
        });
        avgCompletionDays = Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10;
      }

      let speedScore = 50;
      if (avgCompletionDays !== null) {
        speedScore = Math.max(10, Math.min(100, Math.round(100 - (avgCompletionDays - 1) * 8)));
      }

      // --- 2. CURRENT WORKLOAD CAPACITY ---
      const activeTasks = allTasks.filter(t => t.assignee_id === memberId && (t.status === 'in_progress' || t.status === 'todo'));
      const activeCount = activeTasks.length;
      const activeHours = activeTasks.reduce((sum, t) => sum + (t.estimated_hours || 8), 0);
      const capacityScore = Math.max(10, Math.min(100, Math.round(100 - activeCount * 10)));

      // --- 3. SKILL MATCHING (keyword + skill_tags) ---
      const taskText = `${task_title || ''} ${task_description || ''}`.toLowerCase();
      const taskWords = taskText.split(/[\s,.\-_/]+/).filter(w => w.length > 2);
      const reqSkillTags = (skill_tags || []).map(s => s.toLowerCase());

      let skillMatchCount = 0;
      const matchedSkills = [];
      for (const skill of memberSkills) {
        const skillName = (skill.skill_name || '').toLowerCase();
        const skillWords = skillName.split(/[\s,.\-_/]+/);
        const matchKeyword = skillWords.some(sw => taskWords.some(tw => tw.includes(sw) || sw.includes(tw)));
        const matchTag = reqSkillTags.some(tag => skillName.includes(tag) || tag.includes(skillName));
        if (matchKeyword || matchTag) {
          skillMatchCount++;
          matchedSkills.push({ name: skill.skill_name, proficiency: skill.proficiency || 3 });
        }
      }

      // Also check task skill_tags against member's completed task skill_tags (experience proxy)
      if (reqSkillTags.length > 0) {
        const memberCompletedSkillTags = [...new Set(completedTasks.flatMap(t => (t.skill_tags || []).map(s => s.toLowerCase())))];
        for (const reqTag of reqSkillTags) {
          if (memberCompletedSkillTags.some(mst => mst.includes(reqTag) || reqTag.includes(mst))) {
            if (!matchedSkills.find(ms => ms.name.toLowerCase().includes(reqTag))) {
              skillMatchCount++;
              matchedSkills.push({ name: reqTag + ' (experience)', proficiency: 4 });
            }
          }
        }
      }

      const skillScore = skillMatchCount === 0 ? 20 : Math.min(100, 40 + skillMatchCount * 25 + matchedSkills.reduce((s, m) => s + m.proficiency * 3, 0));

      // --- 4. ON-TIME DELIVERY RATE ---
      const tasksWithDue = completedTasks.filter(t => t.due_date && t.completed_at);
      let onTimeRate = null;
      if (tasksWithDue.length >= 2) {
        const onTime = tasksWithDue.filter(t => new Date(t.completed_at) <= new Date(t.due_date + 'T23:59:59')).length;
        onTimeRate = Math.round((onTime / tasksWithDue.length) * 100);
      }

      // --- 5. PRIORITY HANDLING ---
      let priorityBonus = 0;
      if (task_priority === 'urgent' || task_priority === 'high') {
        const urgentCompleted = completedTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
        if (urgentCompleted.length >= 2) priorityBonus = 10;
      }

      // --- COMPOSITE SCORE (weighted) ---
      const compositeScore = Math.round(
        speedScore * 0.20 +
        capacityScore * 0.35 +
        skillScore * 0.30 +
        (onTimeRate !== null ? onTimeRate * 0.10 : 50 * 0.10) +
        (priorityBonus * 0.05)
      );

      const reasons = [];
      if (capacityScore >= 70) reasons.push(`Low workload (${activeCount} active tasks, ${activeHours}h)`);
      else if (capacityScore < 40) reasons.push(`Heavy workload (${activeCount} tasks, ${activeHours}h)`);
      
      if (avgCompletionDays !== null) {
        if (speedScore >= 70) reasons.push(`Fast completer (avg ${avgCompletionDays}d, ${completionCount} tasks)`);
        else reasons.push(`Avg completion: ${avgCompletionDays}d from ${completionCount} tasks`);
      } else {
        reasons.push('No completion history on this project');
      }

      if (matchedSkills.length > 0) reasons.push(`Matching skills: ${matchedSkills.map(s => s.name).join(', ')}`);
      if (onTimeRate !== null) reasons.push(`On-time delivery: ${onTimeRate}%`);
      if (priorityBonus > 0) reasons.push('Proven with high-priority tasks');

      candidates.push({
        member_id: memberId,
        display_name: profile?.display_name || memberId.split('@')[0],
        avatar_url: profile?.avatar_url || null,
        composite_score: compositeScore,
        speed_score: speedScore,
        capacity_score: capacityScore,
        skill_score: skillScore,
        on_time_rate: onTimeRate,
        active_task_count: activeCount,
        active_hours: activeHours,
        avg_completion_days: avgCompletionDays,
        completed_count: completionCount,
        matched_skills: matchedSkills,
        reasons,
        // For AI context
        _skills: memberSkills.map(s => s.skill_name).join(', '),
        _bio: profile?.bio || '',
      });
    }

    // Sort by composite score
    candidates.sort((a, b) => b.composite_score - a.composite_score);

    // --- AI ENHANCEMENT: Use LLM to refine top candidates if task has meaningful content ---
    let aiInsight = null;
    if ((task_title || '').length > 5 && candidates.length >= 2) {
      try {
        const topCandidates = candidates.slice(0, Math.min(5, candidates.length));
        const prompt = `You are an expert project manager. A task needs to be assigned. Analyze and rank the best person.

TASK:
Title: ${task_title}
Description: ${task_description || 'N/A'}
Priority: ${task_priority || 'medium'}
Estimated: ${estimated_hours || 'unknown'}h
Required skills: ${(skill_tags || []).join(', ') || 'N/A'}

CANDIDATES (pre-scored):
${topCandidates.map((c, i) => `${i+1}. ${c.display_name} — Score: ${c.composite_score}, Skills: ${c._skills || 'none listed'}, Active tasks: ${c.active_task_count}, Completed: ${c.completed_count}, Avg completion: ${c.avg_completion_days || 'N/A'}d, On-time: ${c.on_time_rate !== null ? c.on_time_rate + '%' : 'N/A'}`).join('\n')}

Provide a brief (2-sentence max) recommendation insight for the #1 pick explaining WHY they're best for THIS specific task. Also flag if anyone is at risk of being overloaded.`;

        const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              top_pick_insight: { type: "string" },
              overload_warning: { type: "string" }
            }
          }
        });
        aiInsight = res;
      } catch (e) {
        console.warn('AI enhancement skipped:', e.message);
      }
    }

    // Strip internal fields
    const recommendations = candidates.map(({ _skills, _bio, ...rest }) => rest);

    return Response.json({ recommendations, ai_insight: aiInsight });
  } catch (error) {
    console.error('Recommend assignee error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});