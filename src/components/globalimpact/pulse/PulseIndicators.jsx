import { demoEconomy, demoRegionalGrowth } from '@/components/globalimpact/pulse/pulseDemo';

export default function PulseIndicators({ domain, sample, scope, location, granular = false }) {
  if (granular) return <div className="space-y-2"><p className="impact-muted text-sm">Indicator catalog for {location}. Where no verified reading is available, there is no source, unit, reporting period or update to show.</p><ul className="grid list-none gap-1 p-0 sm:grid-cols-2 lg:grid-cols-3">{domain.granular.map(label => <li key={label} className="impact-detail flex flex-wrap justify-between gap-x-2 px-3 py-2 text-xs"><span className="font-semibold">{label}</span><span className="impact-muted">Unavailable</span></li>)}</ul></div>;
  const samples = !sample ? [] : !scope.region ? demoEconomy : scope.country ? [] : [{...demoEconomy[0],value:String(demoRegionalGrowth[scope.region]),change:''}];
  return <div className="space-y-2">
    <p className="impact-muted text-sm">{samples.length ? 'Demo data · Illustrative dashboard, not current economic readings.' : `No verified headline readings for ${location}.`}</p>
    <dl className="grid grid-cols-2 gap-2 lg:grid-cols-3">{domain.headline.map((label,i) => {
      const row = samples[i];
      return <div key={label} className="impact-detail p-2.5"><dt className="impact-muted text-xs font-semibold">{label}</dt><dd className={`mt-1 font-bold ${row ? 'text-xl tabular-nums' : 'text-sm'}`}>{row ? `${row.value}${row.unit === '%' ? '%' : ` ${row.unit}`}` : 'Unavailable'}</dd>{row && <><dd className="impact-kicker mt-1 text-xs">{row.change}</dd><dd className="impact-muted mt-1 text-[11px]">{location} · {row.period}<br/>{row.source} · Updated: {row.updated}</dd></>}</div>;
    })}</dl>
  </div>;
}