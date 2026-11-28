import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import CommandBriefing from '@/components/commandcenter/CommandBriefing';
import CommandCard from '@/components/commandcenter/CommandCard';
import CommandLayoutControls from '@/components/commandcenter/CommandLayoutControls';
import { commandSources } from '@/components/commandcenter/commandSources';
import { useCommandOverview } from '@/components/commandcenter/useCommandOverview';
import useCommandLayout, { commandModes } from '@/components/commandcenter/useCommandLayout';
import '@/components/commandcenter/commandCenter.css';

function Overview({ user }) {
  const { now,data } = useCommandOverview(user);
  const settings = useCommandLayout(user);
  const { layout,visible,commit } = settings;
  return <section data-command-center className="cc-wrap">
    <div className="cc-shell">
      <Link className="cc-back" to="/CommandDeck"><ArrowLeft size={16} /> Command Deck</Link>
      <CommandBriefing user={user} now={now} data={data} />
      <nav className="cc-strip" aria-label="Command Center metrics">{commandSources.filter(s => s.metric).map(({ id,metric,Icon,path }) => {
        const result = data[id];
        return <Link key={id} to={path}><div className="cc-actions"><Icon size={17} /><ArrowUpRight size={13} /></div><strong>{result.data?.total ?? '—'}</strong><span>{metric}</span>{result.data?.total == null && <small>{result.isPending ? 'Loading…' : 'Unavailable'}</small>}</Link>;
      })}</nav>
      <div className="cc-heading"><div><div className="cc-kicker">WORKSPACE</div><h2>Operational overview</h2></div>
        <div className="cc-actions" role="group" aria-label="Dashboard view">{commandModes.map(mode => <button key={mode} type="button" className="cc-control" aria-pressed={layout.mode === mode} onClick={() => commit(old => ({ ...old,mode }))}>{mode}</button>)}</div>
      </div>
      <CommandLayoutControls settings={settings} />
      {visible.length ? <div className="cc-grid">{visible.map(id => <CommandCard key={id} source={commandSources.find(s => s.id === id)} result={data[id]} card={layout.cards[id]} expanded={layout.mode === 'Expanded'} />)}</div> : <p>No cards are visible in this view. Use Customize cards to show or pin a card.</p>}
    </div>
  </section>;
}

export default function MyCommandCenter() {
  const { user } = useAuth();
  return user?.id ? <Overview key={user.id} user={user} /> : null;
}