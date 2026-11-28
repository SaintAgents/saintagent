import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const launch = '2027-01-12T10:27:00-07:00';
const milestones = [10_000, 100_000, 1_000_000];
const clock = [['Days', 86400, Infinity], ['Hours', 3600, 24], ['Minutes', 60, 60], ['Seconds', 1, 60]];
const remaining = () => Math.max(0, Math.ceil((Date.parse(launch) - Date.now()) / 1000));
const number = new Intl.NumberFormat('en-US');

export default function JoinLaunch() {
  const [seconds, setSeconds] = useState(remaining);
  useEffect(() => {
    if (!remaining()) return;
    const timer = window.setInterval(() => {
      const next = remaining();
      setSeconds(next);
      if (!next) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const { data: total, isPending } = useQuery({
    queryKey: ['founding-member-total'],
    queryFn: async () => (await base44.entities.FoundingMemberTotal.list('-updated_date', 1))[0]?.total ?? null,
    staleTime: 300_000,
    retry: false,
  });
  const goal = milestones.find(value => total < value) ?? milestones.at(-1);

  return <section aria-labelledby="join-launch-title" className="mx-auto max-w-4xl px-6 pb-16 text-center">
    <div className="rounded-3xl border border-sidebar-border bg-sidebar px-4 py-8 text-sidebar-foreground sm:px-10 sm:py-10">
      <h2 id="join-launch-title" className="font-heading text-3xl font-bold">{seconds ? 'Countdown to Full Launch' : 'Full Launch'}</h2>
      <p className="mt-2 text-sm"><time dateTime={launch}>January 12, 2027 at 10:27 a.m. Mountain Time</time></p>
      {seconds > 0 && <div role="timer" aria-live="off" className="mx-auto mt-6 grid max-w-lg grid-cols-4 gap-2 sm:gap-3">
        {clock.map(([label, unit, cycle]) => <div key={label} className="rounded-lg border border-sidebar-border bg-sidebar-accent py-3">
          <span className="block text-xl font-bold tabular-nums sm:text-3xl">{String(Math.floor(seconds / unit) % cycle).padStart(2, '0')}</span>
          <span className="text-xs">{label}</span>
        </div>)}
      </div>}
      {seconds > 0 && <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed">Until full launch, many profiles, posts, and other items across the platform use demo data so you can explore how it works.</p>}
      <div className="mx-auto mt-7 max-w-lg border-t border-sidebar-border pt-6">
        <h3 className="font-heading text-xl font-semibold">Founding Members</h3>
        <p className="mt-2 text-lg font-bold tabular-nums">{typeof total === 'number' ? `${number.format(total)} out of ${number.format(goal)}` : isPending ? 'Loading member count…' : 'Member count temporarily unavailable'}</p>
        {typeof total === 'number' && <progress aria-label="Progress toward the current founding member milestone" className="mt-3 h-2 w-full accent-primary" value={Math.min(total, goal)} max={goal} />}
        <p className="mt-2 text-sm">Milestones: 10,000 → 100,000 → 1 million</p>
      </div>
    </div>
  </section>;
}