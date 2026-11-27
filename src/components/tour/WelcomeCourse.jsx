import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DAILY_TOURS } from '@/components/tour/dailyTours';
import DailyTourDialog from '@/components/tour/DailyTourDialog';
import useDailyTours from '@/components/tour/useDailyTours';
import useReturningTourInvitation from '@/components/tour/useReturningTourInvitation';

const days = [0,1,2,3,4,5,DAILY_TOURS.findIndex(tour => tour.reward)];
const tips = ['Bookmark the Command Deck so you always have a way back.', 'Watch what you need updates on; save what you just need to reference.', 'When reaching out, say why you chose that person and offer one clear next step.', 'Check the time commitment and what counts as completion before joining a Mission.', 'Make your first milestone measurable, with a date and one owner who has agreed.', 'Read an offer’s scope, price and delivery terms before requesting a booking.', 'Keep a list of the tools that helped you and pin the ones you want to use again.'];
const tomorrow = () => { const date = new Date(); date.setHours(24,0,0,0); return date.getTime(); };
const read = key => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } };

export default function WelcomeCourse({ userId, ready, newMember }) {
  const key = `welcome-course:${userId}`;
  const [prefs,setPrefs] = useState(() => read(key));
  const invitation = useReturningTourInvitation(userId, ready && !newMember && !prefs.off && !prefs.paused);
  const refresher = !!invitation && prefs.finishedInvitation !== invitation;
  const eligible = ready && (newMember || refresher);
  const [manual,setManual] = useState(false), [day,setDay] = useState(null), [step,setStep] = useState(0), [tip,setTip] = useState(null);
  const [now,setNow] = useState(Date.now);
  const { query,record,sections,save } = useDailyTours(userId,eligible || manual);
  const pendingDay = days.findIndex(index => sections[index] < DAILY_TOURS[index].sections.length || (DAILY_TOURS[index].reward && !record?.site_skills_reward));
  const visible = manual || (eligible && !prefs.off && !prefs.paused && !(prefs.nextAt > now) && (refresher || (!query.isPending && !query.isError && pendingDay >= 0)));
  const change = values => { const next = {...prefs,...values}; try { localStorage.setItem(key,JSON.stringify(next)); } catch {} setPrefs(next); setNow(Date.now()); setManual(false); };
  useEffect(() => { const show = () => setManual(true); window.addEventListener('open-welcome-course',show); return () => window.removeEventListener('open-welcome-course',show); }, []);
  useEffect(() => { if (!eligible || !(prefs.nextAt > now)) return; const timer = setTimeout(() => setNow(Date.now()),Math.min(prefs.nextAt-now,2147483647)); return () => clearTimeout(timer); }, [eligible,prefs.nextAt,now]);
  const postpone = () => change({nextAt:Date.now()+60*60*1000});
  const openDay = index => {
    save.reset();
    const tour = DAILY_TOURS[days[index]], complete = sections[days[index]] >= tour.sections.length;
    const start = () => { setDay(index); setStep(complete ? tour.reward && !record?.site_skills_reward ? tour.sections.length-1 : 0 : sections[days[index]]); };
    if (record) start(); else save.mutate(undefined,{onSuccess:start});
  };
  if (day !== null) {
    const index = days[day], tour = DAILY_TOURS[index];
    const advance = () => { const count=step+1; const proceed=() => { if (count < tour.sections.length) {setStep(count);return;} if (refresher || day === pendingDay) change({nextAt:tomorrow(), ...(refresher && {finishedInvitation: invitation})}); setDay(null); setTip(day); }; if (sections[index] >= count && !(tour.reward && count===tour.sections.length && !record?.site_skills_reward)) proceed(); else save.mutate({day:index,count},{onSuccess:proceed}); };
    return <DailyTourDialog day={index} step={step} busy={save.isPending} error={save.isError} onClose={() => {setDay(null);postpone();}} onBack={() => {save.reset();setStep(step-1);}} onAdvance={advance} returnFocus={() => document.querySelector('[data-welcome-course-launch]')?.focus()} />;
  }
  if (!visible && tip === null) return null;
  return <Dialog open onOpenChange={open => { if (!open && !save.isPending) { if (tip !== null) setTip(null); else postpone(); } }}>
    <DialogContent data-readable-surface className="max-h-[85dvh] overflow-y-auto" hideCloseButton={save.isPending}>
      <DialogTitle>{tip !== null ? `Day ${tip+1} tip` : refresher ? 'Welcome back! Take a refresher tour' : 'Your 7-day SaintAgent course'}</DialogTitle>
      <DialogDescription>{tip !== null ? tips[tip] : refresher ? 'Pick up where you left off or replay a completed tour. Your progress and rewards are unchanged.' : 'One guided tour at a time. Your progress is saved, and you can replay any completed day. The Site Skills Quest reward is available only once.'}</DialogDescription>
      {tip !== null ? <Button type="button" onClick={() => setTip(null)}>Done</Button> : <>
        {query.isPending ? <p role="status">Loading your progress…</p> : query.isError ? <Button variant="outline" onClick={() => query.refetch()}>Retry loading progress</Button> : <ol className="space-y-1">{days.map((index,i) => <li key={index}><Button type="button" variant="outline" disabled={save.isPending || (pendingDay >= 0 && i>pendingDay) || (i===pendingDay && prefs.nextAt>now && !manual)} className="h-auto w-full justify-start whitespace-normal text-left" onClick={() => openDay(i)}>Day {i+1}: {DAILY_TOURS[index].title}{pendingDay < 0 || i<pendingDay ? ' · Replay' : ''}</Button></li>)}</ol>}
        {save.isError && <p role="alert">Couldn’t start this lesson. Try again.</p>}
        <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={save.isPending} onClick={postpone}>Remind me later</Button><Button type="button" variant="outline" disabled={save.isPending} onClick={() => change({paused:!(prefs.paused || prefs.off),off:false,nextAt:0})}>{prefs.paused || prefs.off ? 'Resume reminders' : 'Pause reminders'}</Button><Button type="button" variant="outline" disabled={save.isPending} onClick={() => change({off:true,paused:false})}>Opt out of pop-ups</Button></div>
      </>}
    </DialogContent>
  </Dialog>;
}