function position(index, total, x, orbit) {
  const y = total <= 1 ? 140 : 42 + index * (204 / (total - 1));
  return [x + orbit * Math.sin(y * Math.PI / 280), y];
}

export default function CommandCitationDiagram({ findings, sources, active }) {
  const fp = i => position(i, findings.length, 195, -29);
  const sp = i => position(i, sources.length, 329, 33);
  return <svg className="mc-graph" viewBox="0 0 400 280" role="img" aria-label="Goal to findings to sources; highlighted lines show the selected finding or source. Uncited sources have no incoming line.">
    <text x="66" y="20" textAnchor="middle">Goal</text><text x="174" y="20" textAnchor="middle">Findings</text><text x="345" y="20" textAnchor="middle">Sources</text>
    {findings.map(({ citations }, i) => {
      const [x,y] = fp(i);
      const highlight = active.finding === i || citations.includes(active.source);
      return <g key={i}><line className={highlight ? 'mc-edge-current' : 'mc-edge'} x1="66" y1="140" x2={x} y2={y} />{citations.map(n => {
        const [sx,sy] = sp(n-1);
        return <line className={active.finding === i || active.source === n ? 'mc-edge-current' : 'mc-edge'} key={n} x1={x} y1={y} x2={sx} y2={sy} />;
      })}</g>;
    })}
    <circle cx="66" cy="140" r="9" className="mc-goal-node" />
    {findings.map(({citations},i) => {const [x,y] = fp(i); return <g key={i}><circle cx={x} cy={y} r="6" className={active.finding === i || citations.includes(active.source) ? 'mc-node-current' : 'mc-node'} /><text x={x-13} y={y+3} textAnchor="end">F{i+1}</text></g>;})}
    {sources.map(({number, linked},i) => {const [x,y] = sp(i); const current = active.source === number || linked.includes(active.finding); return <g key={number}><circle cx={x} cy={y} r={linked.length > 1 ? 7 : 5} className={current ? 'mc-node-current' : linked.length ? 'mc-node' : 'mc-node-uncited'} /><text x={x-12} y={y+3} textAnchor="end">S{number}</text></g>;})}
  </svg>;
}