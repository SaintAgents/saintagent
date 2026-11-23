import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ActivityContext } from '@/components/live/useActivity';
import useLiveActivity from '@/components/live/useLiveActivity';
import useEventToasts from '@/components/live/useEventToasts';
import EventToastCard from '@/components/live/EventToastCard';
import LiveActivityDialog from '@/components/live/LiveActivityDialog';
import ActivityTicker from '@/components/live/ActivityTicker';
import { actionable, eligible, localRead, localWrite, safePath } from '@/components/live/activity';
import { makeDemoActivity } from '@/components/live/demoActivity';
import DemoActivityToasts from '@/components/live/DemoActivityToasts';

const pageOpenedAt = Date.now();
const positions = { 'top-right':'top-20 right-4', 'top-left':'top-20 left-4', 'top-center':'top-20 left-1/2 -translate-x-1/2', 'bottom-right':'bottom-28 right-4', 'bottom-left':'bottom-28 left-4', 'bottom-center':'bottom-28 left-1/2 -translate-x-1/2' };
export default function LiveActivity({ children, user, profile, profileReady, disabled, page }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dialog, setDialog] = useState(null);
  const [closed, setClosed] = useState(false);
  const { prefs, preferences, config, configReady, events, signIns: recentSignIns } = useLiveActivity(user, !disabled);
  const history = useMemo(() => (events.data || []).filter(event => eligible(event, config, prefs)), [events.data, config, prefs]);
  const signIns = useMemo(() => (recentSignIns.data || []).filter(event => {
    if (event.category !== 'sign_ins' || event.is_demo) return false;
    if (event.audience === 'personal') return event.recipient_id === user.id && prefs.welcomeToast;
    return event.profile_user_id !== user.id && prefs.memberSignInToasts && Date.parse(event.created_date) >= pageOpenedAt;
  }), [recentSignIns.data, prefs.welcomeToast, prefs.memberSignInToasts, user.id]);
  const demoKey = `activity-ticker-demo:${user.id}`;
  const [demo, setDemo] = useState(() => localRead(demoKey, false) === true);
  const [playDemo, setPlayDemo] = useState(false);
  const [samples, setSamples] = useState(makeDemoActivity);
  const toggleDemo = () => {
    if (!demo) setSamples(makeDemoActivity());
    else setDialog(current => samples.includes(current) ? null : current);
    setPlayDemo(!demo);
    setDemo(!demo);
    localWrite(demoKey, !demo);
  };
  const dnd = profile?.status === 'dnd';
  const toastEvents = useMemo(() => demo ? signIns : [...signIns, ...history], [demo, signIns, history]);
  const { visible, dismiss } = useEventToasts(user, toastEvents, !disabled && profileReady && configReady && (events.isSuccess || recentSignIns.isSuccess), config, disabled || dnd || prefs.suppress, demo);
  const pinned = page === 'ObservationDeck';
  const placement = pinned ? 'sidebar' : prefs.placement;
  const ticker = !closed && prefs.enabled && (!dnd || pinned);
  const open = event => {
    if (event.category !== 'signals' && event.category === 'new_members' && event.profile_user_id) {
      document.dispatchEvent(new CustomEvent('openProfile', { detail:{ userId:event.profile_user_id } }));
    } else if (event.category !== 'signals' && safePath(event.action_path)) navigate(event.action_path);
    else setDialog(event);
  };
  const eventId = new URLSearchParams(location.search).get('liveEvent');
  const [dismissedLink, setDismissedLink] = useState(null);
  const knownEvent = (events.data || []).find(event => event.id === eventId);
  const linkedEvent = useQuery({ queryKey:['live-event-detail', user.id, eventId], enabled:!disabled && !!eventId && !knownEvent && dismissedLink !== eventId,
    queryFn: async () => (await base44.entities.LiveEvent.filter({ id:eventId, $or:[{ audience:'members' }, { audience:'personal', recipient_id:user.id }] }, '-created_date', 1))[0] || null,
  });
  const deepLink = eventId && dismissedLink !== eventId ? knownEvent || linkedEvent.data : null;
  useEffect(() => { setClosed(false); }, [location.pathname, prefs.enabled]);
  if (disabled) return children;
  const state = { prefs, placement, ticker, history, events, demo, toggleDemo, tickerHistory: demo ? samples : history, open, setDialog, closeTicker: () => setClosed(true) };
  return <ActivityContext.Provider value={state}>{children}<ActivityTicker placement="bottom" />
    <div className={`pointer-events-none fixed z-[9997] flex flex-col gap-2 ${positions[config.position] || positions['top-right']}`}>
      {demo && playDemo && config.enabled && !dnd && !prefs.suppress && <DemoActivityToasts events={samples.slice(0, 3)} open={open} />}
      {visible.map(event => <EventToastCard key={event.id} {...{ event, dismiss, open }} duration={event.category === 'sign_ins' ? 6500 : (Number(config.priority_durations?.[event.priority]) || config.duration_ms) * (actionable(event) ? 1.6 : 1)} />)}
    </div>
    {(dialog || deepLink) && <LiveActivityDialog dialog={dialog || deepLink} close={() => { if (deepLink) setDismissedLink(eventId); setDialog(null); }} preferences={preferences} state={state} />}
  </ActivityContext.Provider>;
}