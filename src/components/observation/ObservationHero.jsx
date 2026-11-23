import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { HERO_IMAGES } from '@/components/hud/HeroImageData';
import useHeroCycleControls from '@/components/hud/useHeroCycleControls';
import { ChevronDown, ChevronUp, Pause, Play, SkipForward } from 'lucide-react';

const key = 'surfaceOpacitySettings';
function sharedSettings() { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } }
export default function ObservationHero({ open, setOpen, children }) {
  const [paused,setPaused] = useHeroCycleControls();
  const [image,setImage] = useState(0), [brightness,setBrightness] = useState(() => sharedSettings().heroOpacity ?? 30);
  const { data:settings } = useQuery({queryKey:['allPlatformSettings'], queryFn:() => base44.entities.PlatformSetting.list('-updated_date',50), staleTime:300000, retry:false});
  const interval = Math.max(1000, Number(settings?.find(s => s.key === 'hero_slideshow_interval')?.value) || 420000);
  const next = () => setImage(i => (i+1)%HERO_IMAGES.length);
  useEffect(() => { if (!paused) { const timer = setInterval(next,interval); return () => clearInterval(timer); } },[paused,interval]);
  useEffect(() => { const sync = e => setBrightness(e.detail?.heroOpacity ?? sharedSettings().heroOpacity ?? 30); window.addEventListener('surfaceOpacityChanged',sync); return () => window.removeEventListener('surfaceOpacityChanged',sync); },[]);
  const dim = value => { const nextSettings = {...sharedSettings(),heroOpacity:value}; setBrightness(value); try { localStorage.setItem(key,JSON.stringify(nextSettings)); } catch {} window.dispatchEvent(new CustomEvent('surfaceOpacityChanged',{detail:{heroOpacity:value}})); };
  return <section className="ob-hero" aria-label="Observation Deck header">
    {open && <><img className="ob-hero-image" alt="" src={HERO_IMAGES[image].url} style={{opacity:brightness/100}} />
    <div className="ob-hero-inner">
      <p className="ob-kicker">SAINTAGENT / MONITORING WORKSPACE</p><h1>Observation Deck</h1><p>Keep the pages you watch within reach.</p>
      <div className="ob-hero-controls"><button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Play hero cycle' : 'Pause hero cycle'}>{paused ? <Play size={14}/> : <Pause size={14}/>}</button><button type="button" onClick={next} aria-label="Next hero image"><SkipForward size={14}/></button><label>Hero brightness <input type="range" min="0" max="100" value={brightness} onChange={e => dim(+e.target.value)}/></label></div>
      {children}
    </div></>}
    <div className="ob-divider"><button type="button" aria-label={open ? 'Fold header' : 'Open Observation Deck header'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <ChevronUp size={16}/> : <><ChevronDown size={16}/> Observation Deck</>}</button></div>
  </section>;
}