// NASA/JPL's approximate planetary elements (Table 1, 1800–2050):
// https://ssd.jpl.nasa.gov/planets/approx_pos.html
// Each row gives a, e, I, L, perihelion longitude and node longitude, then their rates.
const elements = {
  Earth: [[1.00000261, .01671123, -.00001531, 100.46457166, 102.93768193, 0], [.00000562, -.00004392, -.01294668, 35999.37244981, .32327364, 0]],
  Mercury: [[.38709927, .20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593], [.00000037, .00001906, -.00594749, 149472.67411175, .16047689, -.12534081]],
  Venus: [[.72333566, .00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255], [.00000390, -.00004107, -.00078890, 58517.81538729, .00268329, -.27769418]],
  Mars: [[1.52371034, .09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891], [.00001847, .00007882, -.00813131, 19140.30268499, .44441088, -.29257343]],
  Jupiter: [[5.20288700, .04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], [-.00011607, -.00013253, -.00183714, 3034.74612775, .21252668, .20469106]],
  Saturn: [[9.53667594, .05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], [-.00125060, -.00050991, .00193609, 1222.49362201, -.41897216, -.28867794]],
  Uranus: [[19.18916464, .04725744, .77263783, 313.23810451, 170.95427630, 74.01692503], [-.00196176, -.00004397, -.00242939, 428.48202785, .40805281, .04240589]],
  Neptune: [[30.06992276, .00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574], [.00026291, .00005105, .00035372, 218.45945325, -.32241464, -.00508664]],
};
const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const rad = Math.PI / 180;
const wrap = angle => ((angle % 360) + 360) % 360;

function orbit([base, rate], t) {
  const [a, e, i, l, peri, node] = base.map((value, index) => value + rate[index] * t);
  const m = (wrap(l - peri + 180) - 180) * rad;
  let anomaly = m;
  for (let n = 0; n < 8; n++) anomaly -= (anomaly - e * Math.sin(anomaly) - m) / (1 - e * Math.cos(anomaly));
  const x = a * (Math.cos(anomaly) - e), y = a * Math.sqrt(1 - e * e) * Math.sin(anomaly);
  const w = (peri - node) * rad, o = node * rad;
  const u = x * Math.cos(w) - y * Math.sin(w);
  const v = (x * Math.sin(w) + y * Math.cos(w)) * Math.cos(i * rad);
  return [u * Math.cos(o) - v * Math.sin(o), u * Math.sin(o) + v * Math.cos(o)];
}

export function planetPositions(time) {
  const t = (time - Date.UTC(2000, 0, 1, 12)) / (86400000 * 36525);
  if (!Number.isFinite(t) || t < -2 || t > .5) return [];
  const [earthX, earthY] = orbit(elements.Earth, t);
  return Object.entries(elements).slice(1).map(([planet, data]) => {
    const [x, y] = orbit(data, t);
    // Translate to Earth's viewpoint and approximately precess to the equinox of date.
    const longitude = wrap(Math.atan2(y - earthY, x - earthX) / rad + 1.397 * t + .00031 * t * t);
    const tenths = Math.round(longitude * 10) % 3600;
    return { planet, sign: signs[Math.floor(tenths / 300)], degrees: (tenths % 300 / 10).toFixed(1) };
  });
}