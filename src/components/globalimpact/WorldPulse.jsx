import { useActivity } from '@/components/live/useActivity';
import PulseActivity from '@/components/globalimpact/pulse/PulseActivity';
import PulseCommandSignals from '@/components/globalimpact/pulse/PulseCommandSignals';
import { demoPulse } from '@/components/globalimpact/impactDemo';
import PulseModules from '@/components/globalimpact/pulse/PulseModules';

export default function WorldPulse({ icon: PulseIcon, demo, preview = false, standalone = false, onDemoChange }) {
  const Heading = standalone ? 'h1' : 'h2';
  const activity = useActivity();
  const events = demo ? demoPulse : (activity?.history ?? []).filter(event => !event.is_demo);
  return <section id="world-pulse" className="impact-surface scroll-mt-32 p-3 sm:p-4" aria-label="World Pulse">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2"><PulseIcon size={19} aria-hidden="true" /><Heading className={standalone ? 'text-2xl font-bold sm:text-3xl' : 'text-lg font-bold'}>World Pulse</Heading><span className="impact-chip">{demo ? 'Demo activity' : 'SaintAgent activity'}</span></div>
    </div>
    <PulseModules demo={demo} preview={preview} />
    <PulseActivity title="SaintAgent activity" events={events} query={demo ? undefined : activity?.events} demo={demo} onDemoChange={onDemoChange} />
    <PulseCommandSignals demo={demo} preview={preview} />
  </section>;
}