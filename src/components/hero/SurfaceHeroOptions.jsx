const ranges = {
  opacity: ['Opacity', 0, 1, 0.01, value => `${Math.round(value * 100)}%`],
  speed: ['Speed', 0.25, 4, 0.25, value => `${value}×`],
  blur: ['Blur', 0, 20, 1, value => `${value} px`],
};

export default function SurfaceHeroOptions({ config, update, page }) {
  const image = config.mode === 'image', prefix = image ? 'image' : 'video';
  const select = (field, label, options) => <label className="grid gap-1">{label}<select className="rounded border bg-background p-1.5" value={config[field]} onChange={event => update({ [field]: event.target.value })}>{options.map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label>;
  const check = (field, label) => <label className="flex items-center gap-2"><input type="checkbox" checked={config[field]} onChange={event => update({ [field]: event.target.checked })} />{label}</label>;
  function numeric(field, label, min, max, step) {
    return <label className="grid gap-1">{label}<input type="number" className="rounded border bg-background p-1.5" min={min} max={max} step={step} value={config[field]} onChange={event => {
      const value = event.target.valueAsNumber;
      if (Number.isFinite(value)) update({ [field]: Math.min(max, Math.max(min, value)) });
    }} /></label>;
  }
  return <section className="grid gap-3 text-sm sm:grid-cols-2" aria-label="Appearance and playback">
    {check('enabled', 'Enable this background')}{check(`${prefix}Rotate`, 'Rotate carousel')}
    {select('mode', 'Media type', [['video','Video'],['image','Image']])}
    {select('theme', 'Show in theme', [['all','All'],['light','Light'],['dark','Dark']])}
    {select('fit', 'Fit', [['cover','Fill surface'],['contain','Show entire media']])}
    {select('position', 'Position', [['center','Center'],['top','Top'],['bottom','Bottom'],['left','Left'],['right','Right']])}
    {page && select('attachment', 'Page attachment', [['fixed','Fixed in viewport'],['scrolls','Scroll with page']])}
    {!image && check('muted', 'Mute video')}
    {numeric(`${prefix}Interval`, 'Time per item (seconds)', 1, 120, 1)}
    {numeric(`${prefix}Fade`, 'Crossfade (milliseconds)', 0, image ? 12000 : 6000, 100)}
    {Object.entries(ranges).filter(([field]) => !image || field !== 'speed').map(([field, [label, min, max, step, format]]) => <label className="grid gap-1" key={field}>
      <span>{label}: {format(config[field])}</span><input type="range" min={min} max={max} step={step} value={config[field]} onChange={event => update({ [field]: event.target.valueAsNumber })} />
    </label>)}
  </section>;
}