import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { escapeRegex } from '@/components/globalimpact/impactDiscovery';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';

const codes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
const names = new Intl.DisplayNames(['en'], {type:'region'});
const countries = codes.map(code => [code,names.of(code)]).sort((a,b) => a[1].localeCompare(b[1]));

export default function DockWatchedCountries({user, visible}) {
  const key = `sa-dock-country-focus:${user.id}`;
  const preview = isTourPreview();
  const [watched,setWatched] = useState(() => {
    if (preview) return [];
    try { const saved = JSON.parse(localStorage.getItem(key)); return Array.isArray(saved) ? saved.filter(c => codes.includes(c)) : []; } catch { return []; }
  });
  const [pick,setPick] = useState(''), [selected,setSelected] = useState(''), [error,setError] = useState('');
  const name = selected && names.of(selected);
  const stats = useQuery({queryKey:['dock-country-stats',selected],enabled:visible && !!selected && !preview,queryFn:() => base44.entities.Listing.count({status:'active',region:{$regex:`^(?:${escapeRegex(name)}|${selected})$`,$options:'i'}})});
  function save(next) {
    try { if (!preview) localStorage.setItem(key,JSON.stringify(next)); setWatched(next); setError(''); }
    catch { setError('Could not save the country focus list in this browser.'); }
  }
  return <div className="grid gap-2">
    <form className="flex flex-wrap gap-1" onSubmit={e => {e.preventDefault(); if (pick && !watched.includes(pick)) {save([...watched,pick]);setPick('');}}}>
      <select aria-label="Country to watch" value={pick} onChange={e => setPick(e.target.value)} className="min-w-0 flex-1"><option value="">Choose a country…</option>{countries.filter(([code]) => !watched.includes(code)).map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select><button disabled={!pick}>Watch</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {!watched.length && <p>No countries watched yet.</p>}
    <ul>{watched.map(code => <li key={code} className="flex flex-wrap justify-between gap-1"><button aria-pressed={selected === code} onClick={() => setSelected(code)}>{names.of(code)}</button><button aria-label={`Stop watching ${names.of(code)}`} onClick={() => {save(watched.filter(item => item !== code)); if (selected === code) setSelected('');}}>Remove</button></li>)}</ul>
    {name && <section className="grid gap-1 border-t pt-2"><h3 className="font-semibold">Country Stats: {name}</h3><p>Country code: {selected}</p>{!preview && (stats.isPending ? <p role="status">Loading listings…</p> : stats.isError ? <button onClick={() => stats.refetch()}>Retry loading listings</button> : <p>{stats.data} active SaintAgent listings tagged {name}</p>)}<a href={`https://data.worldbank.org/country/${selected}`} target="_blank" rel="noreferrer">Open World Bank country data</a></section>}
  </div>;
}