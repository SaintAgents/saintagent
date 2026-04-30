// Deterministic mystical profile calculations — no LLM needed

const TAROT_MAJOR = [
  '0 - The Fool','I - The Magician','II - The High Priestess','III - The Empress',
  'IV - The Emperor','V - The Hierophant','VI - The Lovers','VII - The Chariot',
  'VIII - Strength','IX - The Hermit','X - Wheel of Fortune','XI - Justice',
  'XII - The Hanged Man','XIII - Death','XIV - Temperance','XV - The Devil',
  'XVI - The Tower','XVII - The Star','XVIII - The Moon','XIX - The Sun',
  'XX - Judgement','XXI - The World'
];

// Reduce a number to single digit (1-9) or keep master numbers (11, 22, 33)
function reduceToSingle(num, keepMasters = false) {
  while (num > 9) {
    if (keepMasters && (num === 11 || num === 22 || num === 33)) return num;
    num = String(num).split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return num;
}

/**
 * Calculate Tarot Birth Cards using the two-card method.
 * Sum: month + day + century + year-within-century
 * Then reduce step-by-step to get Birth Card, Planetary Ruling Card, and Sun Card.
 *
 * Example: May 22, 1963 → 5 + 22 + 19 + 63 = 109
 *   Birth Card:             109 → 1+0+9 = 10 → but we keep 19 first → XIX The Sun
 *   Planetary Ruling Card:  10 → X Wheel of Fortune
 *   Sun Card:               1+0 = 1 → I The Magician
 */
export function calcBirthCards(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;

  const century = Math.floor(year / 100);
  const yearPart = year % 100;
  let sum = month + day + century + yearPart;

  // Step 1: If sum > 21, reduce by summing digits once
  // We want the first number ≤ 21 as the Birth Card
  let birthNum = sum;
  while (birthNum > 21) {
    birthNum = String(birthNum).split('').reduce((a, d) => a + parseInt(d), 0);
  }

  // Step 2: Planetary Ruling Card — reduce birthNum further if > 9
  let planetaryNum = birthNum;
  if (planetaryNum > 9) {
    planetaryNum = String(planetaryNum).split('').reduce((a, d) => a + parseInt(d), 0);
  }

  // Step 3: Sun Card — reduce planetaryNum further if > 9
  let sunNum = planetaryNum;
  if (sunNum > 9) {
    sunNum = String(sunNum).split('').reduce((a, d) => a + parseInt(d), 0);
  }

  // If all three are the same, we only have unique ones
  const birth_card = TAROT_MAJOR[birthNum] || '';
  const planetary_ruling_card = planetaryNum !== birthNum ? (TAROT_MAJOR[planetaryNum] || '') : '';
  const sun_card = (sunNum !== planetaryNum && sunNum !== birthNum) ? (TAROT_MAJOR[sunNum] || '') : '';

  return { birth_card, planetary_ruling_card, sun_card };
}

/**
 * Zodiac sun sign from birthday
 */
export function calcSunSign(dateStr) {
  if (!dateStr) return '';
  const [, month, day] = dateStr.split('-').map(Number);
  if (!month || !day) return '';
  const ranges = [
    [1,20,'Capricorn'],[1,31,'Aquarius'],
    [2,19,'Aquarius'],[2,29,'Pisces'],
    [3,20,'Pisces'],[3,31,'Aries'],
    [4,20,'Aries'],[4,30,'Taurus'],
    [5,21,'Taurus'],[5,31,'Gemini'],
    [6,21,'Gemini'],[6,30,'Cancer'],
    [7,22,'Cancer'],[7,31,'Leo'],
    [8,22,'Leo'],[8,31,'Virgo'],
    [9,22,'Virgo'],[9,30,'Libra'],
    [10,22,'Libra'],[10,31,'Scorpio'],
    [11,21,'Scorpio'],[11,30,'Sagittarius'],
    [12,21,'Sagittarius'],[12,31,'Capricorn']
  ];
  for (let i = 0; i < ranges.length; i += 2) {
    const [m1, d1, ] = ranges[i];
    const [m2, d2, sign] = ranges[i + 1];
    if (month === m1 && day <= d1) return ranges[i][2];
    if (month === m2 && day <= d2) return sign;
  }
  return '';
}

/**
 * Numerology Life Path from birthday (reduce each part separately then sum)
 */
export function calcLifePath(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return '';

  const reduceGroup = (n) => {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce((a, d) => a + parseInt(d), 0);
    }
    return n;
  };

  const m = reduceGroup(month);
  const d = reduceGroup(day);
  const y = reduceGroup(year);
  let total = m + d + y;
  total = reduceGroup(total);
  return String(total);
}

/**
 * Pythagorean numerology letter values
 */
function letterValue(ch) {
  const c = ch.toUpperCase();
  if (c < 'A' || c > 'Z') return 0;
  return ((c.charCodeAt(0) - 65) % 9) + 1;
}

const VOWELS = new Set(['A','E','I','O','U']);

export function calcDestinyNumber(name) {
  if (!name) return '';
  let sum = 0;
  for (const ch of name) sum += letterValue(ch);
  if (sum === 0) return '';
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return String(sum);
}

export function calcSoulUrge(name) {
  if (!name) return '';
  let sum = 0;
  for (const ch of name) {
    if (VOWELS.has(ch.toUpperCase())) sum += letterValue(ch);
  }
  if (sum === 0) return '';
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return String(sum);
}

export function calcPersonalityNumber(name) {
  if (!name) return '';
  let sum = 0;
  for (const ch of name) {
    const upper = ch.toUpperCase();
    if (upper >= 'A' && upper <= 'Z' && !VOWELS.has(upper)) sum += letterValue(ch);
  }
  if (sum === 0) return '';
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return String(sum);
}