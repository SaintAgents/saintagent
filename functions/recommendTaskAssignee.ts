import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Task Recommendation Engine
 * Scores team members based on:
 * 1. Historical completion speed (avg days to complete similar tasks)
 * 2. Current workload capacity (active task count + hours)
 * 3. Relevant skill tag matching
 * Returns ranked recommendations with reasoning.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { project_id, task_title, task_description, task_priority, estimated_hours } = await req.json();
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

    const now = new Date();
    const recommendations = [];

    for (const memberId of teamMemberIds) {
      const profile = allProfiles.find(p => p.user_id === memberId);
      const memberSkills = allSkills.filter(s => s.user_id === memberId && s.type === 'offer');

      // --- 1. HISTORICAL COMPLETION SPEED ---
      const completedTasks = allTasks.filter(t => t.assignee_id === memberId && t.status === 'completed' && t.completed_at);
      let avgCompletionDays = null;
      let completionCount = completedTasks.length;

      if (completedTasks.length > 0) {
        const durations = completedTasks.map(t => {
          const start = new Date(t.start_date || t.created_date);
          const end = new Date(t.completed_at);
          return Math.max(Math.ceil((end - start) / 86400000), 1);
        });
        avgCompletionDays = Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10;
      }

      // Speed score: faster = higher (normalize 0-100)
      let speedScore = 50; // default for no history
      if (avgCompletionDays !== null) {
        // Under 3 days avg = 100, over 14 days = 10
        speedScore = Math.max(10, Math.min(100, Math.round(100 - (avgCompletionDays - 1) * 8)));
      }

      // --- 2. CURRENT WORKLOAD CAPACITY ---
      const activeTasks = allTasks.filter(t => t.assignee_id === memberId && (t.status === 'in_progress' || t.status === 'todo'));
      const activeCount = activeTasks.length;
      const activeHours = activeTasks.reduce((sum, t) => sum + (t.estimated_hours || 8), 0);

      // Capacity score: fewer active tasks = higher (0 tasks = 100, 10+ = 10)
      const capacityScore = Math.max(10, Math.min(100, Math.round(100 - activeCount * 10)));

      // --- 3. SKILL MATCHING ---
      // Extract keywords from task title + description
      const taskText = `${task_title || ''} ${task_description || ''}`.toLowerCase();
      const taskWords = taskText.split(/[\s,.\-_/]+/).filter(w => w.length > 2);

      let skillMatchCount = 0;
      let matchedSkills = [];
      for (const skill of memberSkills) {
        const skillName = (skill.skill_name || '').toLowerCase();
        const skillWords = skillName.split(/[\s,.\-_/]+/);
        const match = skillWords.some(sw => taskWords.some(tw => tw.includes(sw) || sw.includes(tw)));
        if (match) {
          skillMatchCount++;
          matchedSkills.push({ name: skill.skill_name, proficiency: skill.proficiency || 3 });
        }
      }

      // Also check profile-level skills from onboarding
      // Skill score: 0 matches = 20, 1 = 50, 2+ = 80-100
      const skillScore = skillMatchCount === 0 ? 20 : Math.min(100, 40 + skillMatchCount * 25 + matchedSkills.reduce((s, m) => s + m.proficiency * 3, 0));

      // --- COMPOSITE SCORE (weighted) ---
      // Speed: 25%, Capacity: 40%, Skill: 35%
      const compositeScore = Math.round(speedScore * 0.25 + capacityScore * 0.40 + skillScore * 0.35);

      // Build reasoning
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
      else if (memberSkills.length > 0) reasons.push(`${memberSkills.length} skills, none matching task keywords`);

      recommendations.push({
        member_id: memberId,
        display_name: profile?.display_name || memberId.split('@')[0],
        avatar_url: profile?.avatar_url || null,
        composite_score: compositeScore,
        speed_score: speedScore,
        capacity_score: capacityScore,
        skill_score: skillScore,
        active_task_count: activeCount,
        active_hours: activeHours,
        avg_completion_days: avgCompletionDays,
        completed_count: completionCount,
        matched_skills: matchedSkills,
        reasons,
      });
    }

    // Sort by composite score descending
    recommendations.sort((a, b) => b.composite_score - a.composite_score);

    return Response.json({ recommendations });
  } catch (error) {
    console.error('Recommend assignee error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});