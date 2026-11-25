import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { demoGrowthHistory } from '@/components/globalimpact/pulse/pulseDemo';

export default function PulseTrend({ sample, location }) {
  const [months,setMonths] = useState(12);
  if (!sample) return <p className="impact-muted text-sm">No historical series is connected for {location}. No trend or change has been calculated.</p>;
  const readings = demoGrowthHistory.slice(-months);
  return <section className="space-y-3" aria-label="Illustrative economic growth trend">
    <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-semibold">Economic growth trend</h4><div className="flex gap-1" aria-label="Sample timeframe">{[[3,'3M'],[6,'6M'],[12,'1Y']].map(([n,label]) => <button type="button" key={n} className={`impact-control ${n === months ? 'impact-selected' : ''}`} aria-pressed={n === months} onClick={() => setMonths(n)}>{label}</button>)}</div></div>
    <p className="impact-muted text-xs">Global · GDP growth (%) · Fictional sample months · World Pulse sample · No real update date</p>
    <div className="h-52 min-w-0" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><LineChart data={readings} margin={{top:10,right:16,bottom:0,left:0}}><CartesianGrid stroke="hsl(var(--impact-line))" strokeDasharray="3 3"/><XAxis dataKey="period" tick={{fill:'hsl(var(--impact-muted))',fontSize:11}}/><YAxis width={45} unit="%" domain={[0,4]} tick={{fill:'hsl(var(--impact-muted))',fontSize:11}}/><Tooltip formatter={value => [`${value}%`,'Illustrative GDP growth']} contentStyle={{background:'hsl(var(--impact-panel))',color:'hsl(var(--impact-ink))',borderColor:'hsl(var(--impact-line))'}} itemStyle={{color:'hsl(var(--impact-ink))'}} /><Line type="linear" dataKey="value" stroke="hsl(var(--impact-cyan))" strokeWidth={2} isAnimationActive={false}/></LineChart></ResponsiveContainer></div>
    <details><summary className="cursor-pointer text-xs font-semibold">View chart values</summary><dl className="mt-2 grid grid-cols-3 gap-2 text-xs sm:grid-cols-6">{readings.map(row => <div key={row.period}><dt>{row.period}</dt><dd>{row.value}%</dd></div>)}</dl></details>
  </section>;
}