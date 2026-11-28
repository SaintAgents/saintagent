import { Link } from 'react-router-dom';
import { ArrowUpRight, Pin, Sparkles } from 'lucide-react';
import { commandDate } from '@/components/commandcenter/useCommandOverview';
export default function CommandCard({ source, result, card, expanded }) {
  const { Icon } = source;
  const rows = result.data?.rows;
  const span = [4,6,12].includes(card?.span) ? card.span : expanded ? 12 : 6;
  return <article className="cc-card" style={{ '--cc-span':span }}>
    <div className="cc-kicker">{source.metric || 'MEMBER INTELLIGENCE'} {card?.pinned && <Pin size={13} aria-label="Pinned" />}</div>
    <h3><Icon size={19} />{source.label}</h3>
    {!card?.collapsed && <>
      <p>{source.source}</p>
      {result.isPending ? <p role="status">Loading records…</p> : !rows ? <p>Records are temporarily unavailable.</p> : !rows.length ? <p>{source.empty}</p> : <ul>
        {rows.slice(0,expanded ? 8 : 3).map(({ label,date,link,note },i) => <li key={i}>
          <div>{link ? <Link className="cc-record" to={link}>{label} <ArrowUpRight size={13} /></Link> : label}{expanded && note && <p>{note}</p>}</div>
          {date && <small>{commandDate(date)}</small>}
        </li>)}
      </ul>}
      {rows?.length > 0 && (result.data.more || rows.length > (expanded ? 8 : 3)) && <p><small>Open the workspace for more.</small></p>}
      {result.dataUpdatedAt > 0 && rows && <p><small>Checked {commandDate(new Date(result.dataUpdatedAt).toISOString())}</small></p>}
    </>}
    <div className="cc-actions"><Link className="cc-action" to={source.path}>Open workspace <ArrowUpRight size={15} /></Link>
      {!card?.collapsed && <Link className="cc-action" to="/MyGuide" state={{ commandQuestion:`Help me review ${source.label.toLowerCase()} in My Command Center (${source.source.toLowerCase()}). ${result.data?.total == null ? '' : `The overview shows ${result.data.total} ${source.metric?.toLowerCase() || 'items'}. `}Suggest a next step for me to review.` }}><Sparkles size={15} /> Ask My Guide</Link>}
    </div>
  </article>;
}