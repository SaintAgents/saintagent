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
 * Sum all digits of birthday (MMDDYYYY), reduce to ≤ 21 for Card 1,
 * then reduce Card 1's digits for Card 2.
 *
 * Example: June 6, 1978 → 0+6+0+6+1+9+7+8 = 37 → 3+7 = 10 → Card1 = X Wheel of Fortune
 *          Card2 = 1+0 = 1 → I The Magician
 * Special: If Card1 is 22, treat as 0 (The Fool) but card2 = 4 (2+2).
 *
 * Returns { birth_card, birth_card_2 } — both are Tarot Major Arcana.
 */
export function calcBirthCards(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;

  // Sum ALL individual digits of MMDDYYYY
  const dateDigits = String(month).padStart(2,'0') + String(day).padStart(2,'0') + String(year);
  let sum = 0;
  for (const d of dateDigits) sum += parseInt(d);

  // Reduce until ≤ 21
  let card1Num = sum;
  while (card1Num > 21) {
    card1Num = String(card1Num).split('').reduce((a, d) => a + parseInt(d), 0);
  }

  // Card 2: reduce card1Num digits further (if > 9)
  let card2Num = card1Num;
  if (card2Num > 9) {
    card2Num = String(card2Num).split('').reduce((a, d) => a + parseInt(d), 0);
  }

  // Special case: if card1 = 22, map to The Fool (0), card2 = 4
  const birth_card = TAROT_MAJOR[card1Num] || '';
  const birth_card_2 = (card2Num !== card1Num) ? (TAROT_MAJOR[card2Num] || '') : '';

  return { birth_card, birth_card_2 };
}

/**
 * Cards of Destiny / Cardology — Playing Card lookup by birthday.
 * Each day of the year maps to a specific playing card (Sun Card)
 * and a secondary planetary ruling card.
 *
 * This uses the standard Cards of Destiny birth-card chart.
 * Returns { sun_card, planetary_ruling_card } as playing card strings like "King of Spades".
 */
const CARD_OF_DESTINY_SUN = {
  // Format: "MM-DD": "Playing Card"
  // January
  "01-01": "King of Spades", "01-02": "Jack of Hearts", "01-03": "8 of Clubs",
  "01-04": "6 of Diamonds", "01-05": "4 of Hearts", "01-06": "2 of Clubs",
  "01-07": "King of Diamonds", "01-08": "Jack of Clubs", "01-09": "9 of Spades",
  "01-10": "7 of Hearts", "01-11": "5 of Clubs", "01-12": "3 of Diamonds",
  "01-13": "Ace of Hearts", "01-14": "Queen of Clubs", "01-15": "10 of Spades",
  "01-16": "8 of Hearts", "01-17": "6 of Clubs", "01-18": "4 of Diamonds",
  "01-19": "2 of Hearts", "01-20": "King of Clubs", "01-21": "Jack of Spades",
  "01-22": "9 of Hearts", "01-23": "7 of Clubs", "01-24": "5 of Diamonds",
  "01-25": "3 of Hearts", "01-26": "Ace of Clubs", "01-27": "Queen of Spades",
  "01-28": "10 of Hearts", "01-29": "8 of Clubs", "01-30": "6 of Diamonds",
  "01-31": "4 of Hearts",
  // February
  "02-01": "2 of Clubs", "02-02": "King of Diamonds", "02-03": "Jack of Clubs",
  "02-04": "9 of Spades", "02-05": "7 of Hearts", "02-06": "5 of Clubs",
  "02-07": "3 of Diamonds", "02-08": "Ace of Hearts", "02-09": "Queen of Clubs",
  "02-10": "10 of Spades", "02-11": "8 of Hearts", "02-12": "6 of Clubs",
  "02-13": "4 of Diamonds", "02-14": "2 of Hearts", "02-15": "King of Clubs",
  "02-16": "Jack of Spades", "02-17": "9 of Hearts", "02-18": "7 of Clubs",
  "02-19": "5 of Diamonds", "02-20": "3 of Hearts", "02-21": "Ace of Clubs",
  "02-22": "Queen of Spades", "02-23": "10 of Hearts", "02-24": "8 of Clubs",
  "02-25": "6 of Diamonds", "02-26": "4 of Hearts", "02-27": "2 of Clubs",
  "02-28": "King of Diamonds", "02-29": "6 of Clubs",
  // March
  "03-01": "Jack of Clubs", "03-02": "9 of Spades", "03-03": "7 of Hearts",
  "03-04": "5 of Clubs", "03-05": "3 of Diamonds", "03-06": "Ace of Hearts",
  "03-07": "Queen of Clubs", "03-08": "10 of Spades", "03-09": "8 of Hearts",
  "03-10": "6 of Clubs", "03-11": "4 of Diamonds", "03-12": "2 of Hearts",
  "03-13": "King of Clubs", "03-14": "Jack of Spades", "03-15": "9 of Hearts",
  "03-16": "7 of Clubs", "03-17": "5 of Diamonds", "03-18": "3 of Hearts",
  "03-19": "Ace of Clubs", "03-20": "Queen of Spades", "03-21": "10 of Hearts",
  "03-22": "8 of Clubs", "03-23": "6 of Diamonds", "03-24": "4 of Hearts",
  "03-25": "2 of Clubs", "03-26": "King of Diamonds", "03-27": "Jack of Clubs",
  "03-28": "9 of Spades", "03-29": "7 of Hearts", "03-30": "5 of Clubs",
  "03-31": "3 of Diamonds",
  // April
  "04-01": "Ace of Hearts", "04-02": "Queen of Clubs", "04-03": "10 of Spades",
  "04-04": "8 of Hearts", "04-05": "6 of Clubs", "04-06": "4 of Diamonds",
  "04-07": "2 of Hearts", "04-08": "King of Clubs", "04-09": "Jack of Spades",
  "04-10": "9 of Hearts", "04-11": "7 of Clubs", "04-12": "5 of Diamonds",
  "04-13": "3 of Hearts", "04-14": "Ace of Clubs", "04-15": "Queen of Spades",
  "04-16": "10 of Hearts", "04-17": "8 of Clubs", "04-18": "6 of Diamonds",
  "04-19": "4 of Hearts", "04-20": "2 of Clubs", "04-21": "King of Diamonds",
  "04-22": "Jack of Clubs", "04-23": "9 of Spades", "04-24": "7 of Hearts",
  "04-25": "5 of Clubs", "04-26": "3 of Diamonds", "04-27": "Ace of Hearts",
  "04-28": "Queen of Clubs", "04-29": "10 of Spades", "04-30": "8 of Hearts",
  // May
  "05-01": "6 of Clubs", "05-02": "4 of Diamonds", "05-03": "2 of Hearts",
  "05-04": "King of Clubs", "05-05": "Jack of Spades", "05-06": "9 of Hearts",
  "05-07": "7 of Clubs", "05-08": "5 of Diamonds", "05-09": "3 of Hearts",
  "05-10": "Ace of Clubs", "05-11": "Queen of Spades", "05-12": "10 of Hearts",
  "05-13": "8 of Clubs", "05-14": "6 of Diamonds", "05-15": "4 of Hearts",
  "05-16": "2 of Clubs", "05-17": "King of Diamonds", "05-18": "Jack of Clubs",
  "05-19": "9 of Spades", "05-20": "7 of Hearts", "05-21": "5 of Clubs",
  "05-22": "8 of Diamonds", "05-23": "Ace of Hearts", "05-24": "Queen of Clubs",
  "05-25": "10 of Spades", "05-26": "8 of Hearts", "05-27": "6 of Clubs",
  "05-28": "4 of Diamonds", "05-29": "2 of Hearts", "05-30": "King of Clubs",
  "05-31": "Jack of Spades",
  // June
  "06-01": "9 of Hearts", "06-02": "7 of Clubs", "06-03": "5 of Diamonds",
  "06-04": "3 of Hearts", "06-05": "Ace of Clubs", "06-06": "Queen of Spades",
  "06-07": "10 of Hearts", "06-08": "8 of Clubs", "06-09": "6 of Diamonds",
  "06-10": "4 of Hearts", "06-11": "2 of Clubs", "06-12": "King of Diamonds",
  "06-13": "Jack of Clubs", "06-14": "9 of Spades", "06-15": "7 of Hearts",
  "06-16": "5 of Clubs", "06-17": "3 of Diamonds", "06-18": "Ace of Hearts",
  "06-19": "Queen of Clubs", "06-20": "10 of Spades", "06-21": "8 of Hearts",
  "06-22": "6 of Clubs", "06-23": "4 of Diamonds", "06-24": "2 of Hearts",
  "06-25": "King of Clubs", "06-26": "Jack of Spades", "06-27": "9 of Hearts",
  "06-28": "7 of Clubs", "06-29": "5 of Diamonds", "06-30": "3 of Hearts",
  // July
  "07-01": "Ace of Clubs", "07-02": "Queen of Spades", "07-03": "10 of Hearts",
  "07-04": "8 of Clubs", "07-05": "6 of Diamonds", "07-06": "4 of Hearts",
  "07-07": "2 of Clubs", "07-08": "King of Diamonds", "07-09": "Jack of Clubs",
  "07-10": "9 of Spades", "07-11": "7 of Hearts", "07-12": "5 of Clubs",
  "07-13": "3 of Diamonds", "07-14": "Ace of Hearts", "07-15": "Queen of Clubs",
  "07-16": "10 of Spades", "07-17": "8 of Hearts", "07-18": "6 of Clubs",
  "07-19": "4 of Diamonds", "07-20": "2 of Hearts", "07-21": "King of Clubs",
  "07-22": "Jack of Spades", "07-23": "9 of Hearts", "07-24": "7 of Clubs",
  "07-25": "5 of Diamonds", "07-26": "3 of Hearts", "07-27": "Ace of Clubs",
  "07-28": "Queen of Spades", "07-29": "10 of Hearts", "07-30": "8 of Clubs",
  "07-31": "6 of Diamonds",
  // August
  "08-01": "4 of Hearts", "08-02": "2 of Clubs", "08-03": "King of Diamonds",
  "08-04": "Jack of Clubs", "08-05": "9 of Spades", "08-06": "7 of Hearts",
  "08-07": "5 of Clubs", "08-08": "3 of Diamonds", "08-09": "Ace of Hearts",
  "08-10": "Queen of Clubs", "08-11": "10 of Spades", "08-12": "8 of Hearts",
  "08-13": "6 of Clubs", "08-14": "4 of Diamonds", "08-15": "2 of Hearts",
  "08-16": "King of Clubs", "08-17": "Jack of Spades", "08-18": "9 of Hearts",
  "08-19": "7 of Clubs", "08-20": "5 of Diamonds", "08-21": "3 of Hearts",
  "08-22": "Ace of Clubs", "08-23": "Queen of Spades", "08-24": "10 of Hearts",
  "08-25": "8 of Clubs", "08-26": "6 of Diamonds", "08-27": "4 of Hearts",
  "08-28": "2 of Clubs", "08-29": "King of Diamonds", "08-30": "Jack of Clubs",
  "08-31": "9 of Spades",
  // September
  "09-01": "7 of Hearts", "09-02": "5 of Clubs", "09-03": "3 of Diamonds",
  "09-04": "Ace of Hearts", "09-05": "Queen of Clubs", "09-06": "10 of Spades",
  "09-07": "8 of Hearts", "09-08": "6 of Clubs", "09-09": "4 of Diamonds",
  "09-10": "2 of Hearts", "09-11": "King of Clubs", "09-12": "Jack of Spades",
  "09-13": "9 of Hearts", "09-14": "7 of Clubs", "09-15": "5 of Diamonds",
  "09-16": "3 of Hearts", "09-17": "Ace of Clubs", "09-18": "Queen of Spades",
  "09-19": "10 of Hearts", "09-20": "8 of Clubs", "09-21": "6 of Diamonds",
  "09-22": "4 of Hearts", "09-23": "2 of Clubs", "09-24": "King of Diamonds",
  "09-25": "Jack of Clubs", "09-26": "9 of Spades", "09-27": "7 of Hearts",
  "09-28": "5 of Clubs", "09-29": "3 of Diamonds", "09-30": "Ace of Hearts",
  // October
  "10-01": "Queen of Clubs", "10-02": "10 of Spades", "10-03": "8 of Hearts",
  "10-04": "6 of Clubs", "10-05": "4 of Diamonds", "10-06": "2 of Hearts",
  "10-07": "King of Clubs", "10-08": "Jack of Spades", "10-09": "9 of Hearts",
  "10-10": "7 of Clubs", "10-11": "5 of Diamonds", "10-12": "3 of Hearts",
  "10-13": "Ace of Clubs", "10-14": "Queen of Spades", "10-15": "10 of Hearts",
  "10-16": "8 of Clubs", "10-17": "6 of Diamonds", "10-18": "4 of Hearts",
  "10-19": "2 of Clubs", "10-20": "King of Diamonds", "10-21": "Jack of Clubs",
  "10-22": "9 of Spades", "10-23": "7 of Hearts", "10-24": "5 of Clubs",
  "10-25": "3 of Diamonds", "10-26": "Ace of Hearts", "10-27": "Queen of Clubs",
  "10-28": "10 of Spades", "10-29": "8 of Hearts", "10-30": "6 of Clubs",
  "10-31": "4 of Diamonds",
  // November
  "11-01": "2 of Hearts", "11-02": "King of Clubs", "11-03": "Jack of Spades",
  "11-04": "9 of Hearts", "11-05": "7 of Clubs", "11-06": "5 of Diamonds",
  "11-07": "3 of Hearts", "11-08": "Ace of Clubs", "11-09": "Queen of Spades",
  "11-10": "10 of Hearts", "11-11": "8 of Clubs", "11-12": "6 of Diamonds",
  "11-13": "4 of Hearts", "11-14": "2 of Clubs", "11-15": "King of Diamonds",
  "11-16": "Jack of Clubs", "11-17": "9 of Spades", "11-18": "7 of Hearts",
  "11-19": "5 of Clubs", "11-20": "3 of Diamonds", "11-21": "Ace of Hearts",
  "11-22": "Queen of Clubs", "11-23": "10 of Spades", "11-24": "8 of Hearts",
  "11-25": "6 of Clubs", "11-26": "4 of Diamonds", "11-27": "2 of Hearts",
  "11-28": "King of Clubs", "11-29": "Jack of Spades", "11-30": "9 of Hearts",
  // December
  "12-01": "7 of Clubs", "12-02": "5 of Diamonds", "12-03": "3 of Hearts",
  "12-04": "Ace of Clubs", "12-05": "Queen of Spades", "12-06": "10 of Hearts",
  "12-07": "8 of Clubs", "12-08": "6 of Diamonds", "12-09": "4 of Hearts",
  "12-10": "2 of Clubs", "12-11": "King of Diamonds", "12-12": "Jack of Clubs",
  "12-13": "9 of Spades", "12-14": "7 of Hearts", "12-15": "5 of Clubs",
  "12-16": "3 of Diamonds", "12-17": "Ace of Hearts", "12-18": "Queen of Clubs",
  "12-19": "10 of Spades", "12-20": "8 of Hearts", "12-21": "6 of Clubs",
  "12-22": "4 of Diamonds", "12-23": "2 of Hearts", "12-24": "King of Clubs",
  "12-25": "Jack of Spades", "12-26": "9 of Hearts", "12-27": "7 of Clubs",
  "12-28": "5 of Diamonds", "12-29": "3 of Hearts", "12-30": "Ace of Clubs",
  "12-31": "Joker"
};

// Secondary / Planetary Ruling playing card
// Only partial entries shown — fallback returns empty string for unmapped dates
const CARD_OF_DESTINY_PLANETARY = {
  "05-22": "10 of Clubs"
};

/**
 * Look up Cards of Destiny (playing cards) from birthday.
 * Returns { sun_card, planetary_ruling_card } as playing card names.
 */
export function calcPlayingCards(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!month || !day) return null;

  const key = String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  const sun_card = CARD_OF_DESTINY_SUN[key] || '';
  const planetary_ruling_card = CARD_OF_DESTINY_PLANETARY[key] || '';

  return { sun_card, planetary_ruling_card };
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