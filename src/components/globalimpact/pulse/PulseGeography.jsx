import { useState } from 'react';
import { pulseRegions, pulseScope } from '@/components/globalimpact/pulse/pulseGeography';
import { demoRegionalGrowth } from '@/components/globalimpact/pulse/pulseDemo';

const control = 'impact-control min-w-0 w-full';
export default function PulseGeography({ scope, setScope, sample }) {
  const [first,setFirst] = useState(''), [second,setSecond] = useState('');
  const region = pulseRegions.find(row => row.name === scope.region);
  const place = region?.places.find(([country]) => country === scope.country);
  const countries = pulseRegions.flatMap(row => row.places.map(([country]) => country)).sort((a,b) => a.localeCompare(b));
  return <div className="space-y-4">
    <p className="impact-muted text-sm">Browse a starter set of locations. A location being listed does not mean data is available there.</p>
    <div className="grid gap-2 sm:grid-cols-3">
      <label className="min-w-0 space-y-1 text-xs font-semibold">Region<select className={control} value={scope.region} onChange={e => setScope({region:e.target.value,country:'',local:''})}><option value="">All regions</option>{pulseRegions.map(row => <option key={row.name}>{row.name}</option>)}</select></label>
      <label className="min-w-0 space-y-1 text-xs font-semibold">Country<select className={control} value={scope.country} disabled={!region} onChange={e => setScope({...scope,country:e.target.value,local:''})}><option value="">{region ? 'All countries in region' : 'Select a region first'}</option>{region?.places.map(([country]) => <option key={country}>{country}</option>)}</select></label>
      <label className="min-w-0 space-y-1 text-xs font-semibold">Local area<select className={control} value={scope.local} disabled={!place} onChange={e => setScope({...scope,local:e.target.value})}><option value="">{place ? 'Country-wide' : 'Select a country first'}</option>{place && <option>{place[1]}</option>}</select></label>
    </div>
    {!region && <ul className="grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3" aria-label="Regional breakdown">{pulseRegions.map(row => <li key={row.name}><button type="button" className={`${control} text-left`} onClick={() => setScope({region:row.name,country:'',local:''})}><span className="block">{row.name}</span><span className="impact-muted block">{sample ? `Illustrative GDP growth: ${demoRegionalGrowth[row.name]}%` : 'No verified readings'}</span></button></li>)}</ul>}
    {region && <p className="impact-muted text-sm">{sample && !scope.country ? `${region.name} · Illustrative GDP growth: ${demoRegionalGrowth[region.name]}% · World Pulse sample · No real reporting period or update time.` : `No verified readings for ${pulseScope(scope)}.`}</p>}
    <fieldset className="min-w-0 space-y-2 border-t pt-3"><legend className="pr-2 text-sm font-semibold">Compare Countries</legend>
      <div className="grid gap-2 sm:grid-cols-2">{[[first,setFirst,second],[second,setSecond,first]].map(([value,setValue,other], i) => <label key={i} className="min-w-0 space-y-1 text-xs font-semibold">{i ? 'Second country' : 'First country'}<select className={control} value={value} onChange={e => setValue(e.target.value)}><option value="">Select a country</option>{countries.map(name => <option key={name} disabled={name === other}>{name}</option>)}</select></label>)}</div>
      {first && second && <p role="status" className="impact-muted text-sm">No comparable verified series for {first} and {second} in this domain.</p>}
    </fieldset>
  </div>;
}