import { createClientFromRequest } from 'npm:@base44/sdk@0.8.63';
import { factCheck, makeQuiz, text } from './ai.ts';

const fail = (error, status) => Response.json({ error }, { status });
const invisible = error => [403,404].includes(error.status) ? null : Promise.reject(error);
const quizScope = (card, user) => ({ id:card.id, quiz_generated_at:card.quiz_generated_at, ...(user.role === 'admin' ? {} : { $or:[{ is_public:true },{ created_by_id:user.id }] }) });

export default async function(req) {
  try {
    const app = createClientFromRequest(req);
    const user = await app.auth.me().catch(error => error.status === 401 ? null : Promise.reject(error));
    if (!user) return fail('Sign in to use Wisdom Cards.',401);
    const body = await req.json().catch(() => null);
    const { action, id, count = 5 } = body || {};
    if (!['check','generate','score'].includes(action)) return fail('Choose a valid Wisdom Card action.',400);
    if (action === 'generate' && (!Number.isInteger(count) || count < 3 || count > 8)) return fail('Choose between 3 and 8 questions.',400);
    if (action === 'check' && !id) {
      const card = body?.card;
      if (!text(card?.title,160) || !text(card?.insight,4000)) return fail('Enter a title and insight first.',400);
      return Response.json({ check:await factCheck(app.integrations.Core,card) });
    }
    if (typeof id !== 'string' || !/^[\w-]{1,160}$/.test(id)) return fail('A valid card ID is required.',400);
    const cards = app.entities.WisdomCard;
    const card = await cards.get(id).catch(invisible);
    const manages = !!card && (card.created_by_id === user.id || user.role === 'admin');
    if (!card || (!card.is_public && !manages)) return fail('This Wisdom Card is not available.',404);
    if (action === 'check') {
      if (!manages) return fail('Only the owner or an admin can recheck this card.',403);
      const check = await factCheck(app.integrations.Core,card);
      const status = ['Verified','Disputed'].includes(check.verdict) ? check.verdict : 'Needs Review';
      const result = await cards.updateMany({ id, updated_date:card.updated_date },{ $set:{ fact_check:check,fact_checked_at:check.checked_at,status } });
      if (result.matched_count === 0) return fail('This card changed during the check. Please try again.',409);
      return Response.json({ check });
    }
    // Members can update quiz-specific fields only, after a user-scoped read and access check.
    const quizCards = app.asServiceRole.entities.WisdomCard;
    if (action === 'generate') {
      if (card.quiz_ready && card.quiz?.length) return Response.json({ quiz:card.quiz, version:card.quiz_generated_at });
      const quiz = await makeQuiz(app.integrations.Core,card,count);
      const version = new Date().toISOString();
      const result = await quizCards.updateMany({ ...quizScope(card,user), title:card.title, insight:card.insight, quiz_ready:{ $ne:true } },{ $set:{ quiz,quiz_generated_at:version,quiz_ready:true } });
      if (result.matched_count === 0) {
        const latest = await cards.get(id).catch(invisible);
        if (latest?.quiz_ready && latest.quiz?.length) return Response.json({ quiz:latest.quiz,version:latest.quiz_generated_at });
        return fail('The card changed while generating. Please try again.',409);
      }
      return Response.json({ quiz,version });
    }
    const { answers, version } = body;
    if (!card.quiz_ready || !card.quiz?.length || version !== card.quiz_generated_at) return fail('This quiz has changed. Open the latest quiz to record a score.',409);
    if (!Array.isArray(answers) || answers.length !== card.quiz.length || answers.some(a => !Number.isInteger(a) || a < 0 || a > 3)) return fail('Answer every question before submitting.',400);
    const score = Math.round(100 * card.quiz.filter((q,i) => q.correct_index === answers[i]).length / card.quiz.length);
    // Atomic increment and max: simultaneous attempts cannot overwrite each other.
    const result = await quizCards.updateMany({ ...quizScope(card,user),quiz_ready:true },{ $inc:{ quiz_attempts:1 },$max:{ quiz_best_score:score } });
    if (result.matched_count === 0) return fail('The quiz changed before the score could be saved.',409);
    return Response.json({ score });
  } catch (error) {
    console.warn('Wisdom card action failed',error?.status || error?.name);
    return fail('The action could not be completed. Please try again.',500);
  }
}