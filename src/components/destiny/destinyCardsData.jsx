// Birth Card (BC) and Planetary Ruling Card (PRC) lookup by birthday
// Format: { month: { day: { bc: "Birth Card", prc: "Planetary Ruling Card" } } }

export const DESTINY_CARDS = {
  // JANUARY
  1: {
    1: { bc: "A♠", prc: "2♠" },
    2: { bc: "2♠", prc: "4♠" },
    3: { bc: "3♠", prc: "6♠" },
    4: { bc: "4♠", prc: "8♠" },
    5: { bc: "5♠", prc: "10♠" },
    6: { bc: "6♠", prc: "Q♠" },
    7: { bc: "7♠", prc: "A♥" },
    8: { bc: "8♠", prc: "3♥" },
    9: { bc: "9♠", prc: "5♥" },
    10: { bc: "10♠", prc: "7♥" },
    11: { bc: "J♠", prc: "9♥" },
    12: { bc: "Q♠", prc: "J♥" },
    13: { bc: "K♠", prc: "K♥" },
    14: { bc: "A♥", prc: "2♥" },
    15: { bc: "2♥", prc: "4♥" },
    16: { bc: "3♥", prc: "6♥" },
    17: { bc: "4♥", prc: "8♥" },
    18: { bc: "5♥", prc: "10♥" },
    19: { bc: "6♥", prc: "Q♥" },
    20: { bc: "7♥", prc: "A♣" },
    21: { bc: "8♥", prc: "3♣" },
    22: { bc: "9♥", prc: "5♣" },
    23: { bc: "10♥", prc: "7♣" },
    24: { bc: "J♥", prc: "9♣" },
    25: { bc: "Q♥", prc: "J♣" },
    26: { bc: "K♥", prc: "K♣" },
    27: { bc: "A♣", prc: "2♣" },
    28: { bc: "2♣", prc: "4♣" },
    29: { bc: "3♣", prc: "6♣" },
    30: { bc: "4♣", prc: "8♣" },
    31: { bc: "5♣", prc: "10♣" }
  },
  // FEBRUARY
  2: {
    1: { bc: "6♣", prc: "Q♣" },
    2: { bc: "7♣", prc: "A♦" },
    3: { bc: "8♣", prc: "3♦" },
    4: { bc: "9♣", prc: "5♦" },
    5: { bc: "10♣", prc: "7♦" },
    6: { bc: "J♣", prc: "9♦" },
    7: { bc: "Q♣", prc: "J♦" },
    8: { bc: "K♣", prc: "K♦" },
    9: { bc: "A♦", prc: "2♦" },
    10: { bc: "2♦", prc: "4♦" },
    11: { bc: "3♦", prc: "6♦" },
    12: { bc: "4♦", prc: "8♦" },
    13: { bc: "5♦", prc: "10♦" },
    14: { bc: "6♦", prc: "Q♦" },
    15: { bc: "7♦", prc: "A♠" },
    16: { bc: "8♦", prc: "3♠" },
    17: { bc: "9♦", prc: "5♠" },
    18: { bc: "10♦", prc: "7♠" },
    19: { bc: "J♦", prc: "9♠" },
    20: { bc: "Q♦", prc: "J♠" },
    21: { bc: "K♦", prc: "K♠" },
    22: { bc: "A♠", prc: "A♠" },
    23: { bc: "2♠", prc: "2♠" },
    24: { bc: "3♠", prc: "3♠" },
    25: { bc: "4♠", prc: "4♠" },
    26: { bc: "5♠", prc: "5♠" },
    27: { bc: "6♠", prc: "6♠" },
    28: { bc: "7♠", prc: "7♠" },
    29: { bc: "8♠", prc: "8♠" }
  },
  // MARCH
  3: {
    1: { bc: "9♠", prc: "9♠" },
    2: { bc: "10♠", prc: "10♠" },
    3: { bc: "J♠", prc: "J♠" },
    4: { bc: "Q♠", prc: "Q♠" },
    5: { bc: "K♠", prc: "K♠" },
    6: { bc: "A♥", prc: "A♥" },
    7: { bc: "2♥", prc: "2♥" },
    8: { bc: "3♥", prc: "3♥" },
    9: { bc: "4♥", prc: "4♥" },
    10: { bc: "5♥", prc: "5♥" },
    11: { bc: "6♥", prc: "6♥" },
    12: { bc: "7♥", prc: "7♥" },
    13: { bc: "8♥", prc: "8♥" },
    14: { bc: "9♥", prc: "9♥" },
    15: { bc: "10♥", prc: "10♥" },
    16: { bc: "J♥", prc: "J♥" },
    17: { bc: "Q♥", prc: "Q♥" },
    18: { bc: "K♥", prc: "K♥" },
    19: { bc: "A♣", prc: "A♣" },
    20: { bc: "2♣", prc: "2♣" },
    21: { bc: "3♣", prc: "3♣" },
    22: { bc: "4♣", prc: "4♣" },
    23: { bc: "5♣", prc: "5♣" },
    24: { bc: "6♣", prc: "6♣" },
    25: { bc: "7♣", prc: "7♣" },
    26: { bc: "8♣", prc: "8♣" },
    27: { bc: "9♣", prc: "9♣" },
    28: { bc: "10♣", prc: "10♣" },
    29: { bc: "J♣", prc: "J♣" },
    30: { bc: "Q♣", prc: "Q♣" },
    31: { bc: "K♣", prc: "K♣" }
  },
  // APRIL
  4: {
    1: { bc: "A♦", prc: "A♦" },
    2: { bc: "2♦", prc: "2♦" },
    3: { bc: "3♦", prc: "3♦" },
    4: { bc: "4♦", prc: "4♦" },
    5: { bc: "5♦", prc: "5♦" },
    6: { bc: "6♦", prc: "6♦" },
    7: { bc: "7♦", prc: "7♦" },
    8: { bc: "8♦", prc: "8♦" },
    9: { bc: "9♦", prc: "9♦" },
    10: { bc: "10♦", prc: "10♦" },
    11: { bc: "J♦", prc: "J♦" },
    12: { bc: "Q♦", prc: "Q♦" },
    13: { bc: "K♦", prc: "K♦" },
    14: { bc: "A♠", prc: "3♠" },
    15: { bc: "2♠", prc: "5♠" },
    16: { bc: "3♠", prc: "7♠" },
    17: { bc: "4♠", prc: "9♠" },
    18: { bc: "5♠", prc: "J♠" },
    19: { bc: "6♠", prc: "K♠" },
    20: { bc: "7♠", prc: "2♥" },
    21: { bc: "8♠", prc: "4♥" },
    22: { bc: "9♠", prc: "6♥" },
    23: { bc: "10♠", prc: "8♥" },
    24: { bc: "J♠", prc: "10♥" },
    25: { bc: "Q♠", prc: "Q♥" },
    26: { bc: "K♠", prc: "A♣" },
    27: { bc: "A♥", prc: "3♣" },
    28: { bc: "2♥", prc: "5♣" },
    29: { bc: "3♥", prc: "7♣" },
    30: { bc: "4♥", prc: "9♣" }
  },
  // MAY
  5: {
    1: { bc: "5♥", prc: "J♣" },
    2: { bc: "6♥", prc: "K♣" },
    3: { bc: "7♥", prc: "2♦" },
    4: { bc: "8♥", prc: "4♦" },
    5: { bc: "9♥", prc: "6♦" },
    6: { bc: "10♥", prc: "8♦" },
    7: { bc: "J♥", prc: "10♦" },
    8: { bc: "Q♥", prc: "Q♦" },
    9: { bc: "K♥", prc: "A♠" },
    10: { bc: "A♣", prc: "3♠" },
    11: { bc: "2♣", prc: "5♠" },
    12: { bc: "3♣", prc: "7♠" },
    13: { bc: "4♣", prc: "9♠" },
    14: { bc: "5♣", prc: "J♠" },
    15: { bc: "6♣", prc: "K♠" },
    16: { bc: "7♣", prc: "2♥" },
    17: { bc: "8♣", prc: "4♥" },
    18: { bc: "9♣", prc: "6♥" },
    19: { bc: "10♣", prc: "8♥" },
    20: { bc: "J♣", prc: "10♥" },
    21: { bc: "Q♣", prc: "Q♥" },
    22: { bc: "K♣", prc: "A♣" },
    23: { bc: "A♦", prc: "3♣" },
    24: { bc: "2♦", prc: "5♣" },
    25: { bc: "3♦", prc: "7♣" },
    26: { bc: "4♦", prc: "9♣" },
    27: { bc: "5♦", prc: "J♣" },
    28: { bc: "6♦", prc: "K♣" },
    29: { bc: "7♦", prc: "2♦" },
    30: { bc: "8♦", prc: "4♦" },
    31: { bc: "9♦", prc: "6♦" }
  },
  // JUNE
  6: {
    1: { bc: "10♦", prc: "8♦" },
    2: { bc: "J♦", prc: "10♦" },
    3: { bc: "Q♦", prc: "Q♦" },
    4: { bc: "K♦", prc: "A♠" },
    5: { bc: "A♠", prc: "4♠" },
    6: { bc: "2♠", prc: "6♠" },
    7: { bc: "3♠", prc: "8♠" },
    8: { bc: "4♠", prc: "10♠" },
    9: { bc: "5♠", prc: "Q♠" },
    10: { bc: "6♠", prc: "A♥" },
    11: { bc: "7♠", prc: "3♥" },
    12: { bc: "8♠", prc: "5♥" },
    13: { bc: "9♠", prc: "7♥" },
    14: { bc: "10♠", prc: "9♥" },
    15: { bc: "J♠", prc: "J♥" },
    16: { bc: "Q♠", prc: "K♥" },
    17: { bc: "K♠", prc: "2♣" },
    18: { bc: "A♥", prc: "4♣" },
    19: { bc: "2♥", prc: "6♣" },
    20: { bc: "3♥", prc: "8♣" },
    21: { bc: "4♥", prc: "10♣" },
    22: { bc: "5♥", prc: "Q♣" },
    23: { bc: "6♥", prc: "A♦" },
    24: { bc: "7♥", prc: "3♦" },
    25: { bc: "8♥", prc: "5♦" },
    26: { bc: "9♥", prc: "7♦" },
    27: { bc: "10♥", prc: "9♦" },
    28: { bc: "J♥", prc: "J♦" },
    29: { bc: "Q♥", prc: "K♦" },
    30: { bc: "K♥", prc: "2♠" }
  },
  // JULY
  7: {
    1: { bc: "A♠", prc: "3♦" },
    2: { bc: "K♦", prc: "K♥" },
    3: { bc: "Q♦", prc: "A♦" },
    4: { bc: "J♦", prc: "K♠" },
    5: { bc: "10♦", prc: "10♥" },
    6: { bc: "9♦", prc: "J♠" },
    7: { bc: "8♦", prc: "10♠" },
    8: { bc: "7♦", prc: "7♥" },
    9: { bc: "6♦", prc: "8♠" },
    10: { bc: "5♦", prc: "7♠" },
    11: { bc: "4♦", prc: "4♥" },
    12: { bc: "3♦", prc: "5♠" },
    13: { bc: "A♦", prc: "A♥" },
    14: { bc: "K♠", prc: "2♠" },
    15: { bc: "Q♠", prc: "A♠" },
    16: { bc: "J♠", prc: "Q♠" },
    17: { bc: "J♠", prc: "Q♠" },
    18: { bc: "10♠", prc: "Q♥" },
    19: { bc: "9♠", prc: "J♥" },
    20: { bc: "8♠", prc: "J♠" },
    21: { bc: "7♠", prc: "9♥" },
    22: { bc: "6♠", prc: "8♥" },
    23: { bc: "5♠", prc: "10♠", prc_alt: "5♠" },
    24: { bc: "4♠", prc: "4♠" },
    25: { bc: "3♠", prc: "3♠" },
    26: { bc: "2♠", prc: "2♠" },
    27: { bc: "A♠", prc: "A♠" },
    28: { bc: "K♥", prc: "K♥" },
    29: { bc: "Q♥", prc: "Q♥" },
    30: { bc: "J♥", prc: "J♥" },
    31: { bc: "10♥", prc: "10♥" }
  },
  // AUGUST
  8: {
    1: { bc: "Q♦", prc: "Q♦" },
    2: { bc: "J♦", prc: "J♦" },
    3: { bc: "10♦", prc: "10♦" },
    4: { bc: "9♦", prc: "9♦" },
    5: { bc: "8♦", prc: "8♦" },
    6: { bc: "7♦", prc: "7♦" },
    7: { bc: "6♦", prc: "6♦" },
    8: { bc: "5♦", prc: "5♦" },
    9: { bc: "4♦", prc: "4♦" },
    10: { bc: "3♦", prc: "3♦" },
    11: { bc: "2♦", prc: "2♦" },
    12: { bc: "A♦", prc: "A♦" },
    13: { bc: "K♠", prc: "K♠" },
    14: { bc: "Q♠", prc: "Q♠" },
    15: { bc: "J♠", prc: "J♠" },
    16: { bc: "10♠", prc: "10♠" },
    17: { bc: "9♠", prc: "9♠" },
    18: { bc: "8♠", prc: "8♠" },
    19: { bc: "7♠", prc: "7♠" },
    20: { bc: "6♠", prc: "6♠" },
    21: { bc: "5♠", prc: "5♠" },
    22: { bc: "4♠", prc: "4♠", prc_alt: "2♦" },
    23: { bc: "3♠", prc: "3♠", prc_alt: "3♠" },
    24: { bc: "2♠", prc: "K♠" },
    25: { bc: "A♠", prc: "Q♠" },
    26: { bc: "K♥", prc: "K♦" },
    27: { bc: "Q♥", prc: "Q♦" },
    28: { bc: "J♥", prc: "9♠" },
    29: { bc: "10♥", prc: "10♦" },
    30: { bc: "9♥", prc: "7♠" },
    31: { bc: "8♥", prc: "6♠" }
  },
  // SEPTEMBER
  9: {
    1: { bc: "10♦", prc: "8♠" },
    2: { bc: "9♦", prc: "7♠" },
    3: { bc: "8♦", prc: "K♠" },
    4: { bc: "7♦", prc: "5♠" },
    5: { bc: "6♦", prc: "4♠" },
    6: { bc: "5♦", prc: "Q♠" },
    7: { bc: "4♦", prc: "2♠" },
    8: { bc: "3♦", prc: "A♠" },
    9: { bc: "2♦", prc: "J♠" },
    10: { bc: "A♦", prc: "Q♦" },
    11: { bc: "K♠", prc: "J♦" },
    12: { bc: "Q♠", prc: "10♠" },
    13: { bc: "J♠", prc: "9♦" },
    14: { bc: "10♠", prc: "8♦" },
    15: { bc: "9♠", prc: "9♠" },
    16: { bc: "8♠", prc: "6♦" },
    17: { bc: "7♠", prc: "5♦" },
    18: { bc: "6♠", prc: "6♠" },
    19: { bc: "5♠", prc: "3♦" },
    20: { bc: "4♠", prc: "2♦" },
    21: { bc: "3♠", prc: "3♠" },
    22: { bc: "2♠", prc: "K♠", prc_alt: "J♦" },
    23: { bc: "A♠", prc: "Q♠", prc_alt: "10♠" },
    24: { bc: "K♥", prc: "6♥" },
    25: { bc: "Q♥", prc: "8♦" },
    26: { bc: "J♥", prc: "9♠" },
    27: { bc: "10♥", prc: "8♠" },
    28: { bc: "9♥", prc: "5♦" },
    29: { bc: "8♥", prc: "6♠" },
    30: { bc: "7♥", prc: "5♠" }
  },
  // OCTOBER
  10: {
    1: { bc: "8♦", prc: "3♥" },
    2: { bc: "7♦", prc: "J♥" },
    3: { bc: "6♦", prc: "10♥" },
    4: { bc: "5♦", prc: "J♠" },
    5: { bc: "4♦", prc: "8♥" },
    6: { bc: "3♦", prc: "7♥" },
    7: { bc: "2♦", prc: "8♠" },
    8: { bc: "A♦", prc: "5♥" },
    9: { bc: "K♠", prc: "4♥" },
    10: { bc: "Q♠", prc: "5♠" },
    11: { bc: "J♠", prc: "7♠" },
    12: { bc: "10♠", prc: "K♠" },
    13: { bc: "9♠", prc: "2♥" },
    14: { bc: "8♠", prc: "4♠" },
    15: { bc: "7♠", prc: "Q♠" },
    16: { bc: "6♠", prc: "Q♥" },
    17: { bc: "5♠", prc: "A♠" },
    18: { bc: "4♠", prc: "J♠" },
    19: { bc: "3♠", prc: "9♥" },
    20: { bc: "2♠", prc: "J♦" },
    21: { bc: "A♠", prc: "10♠" },
    22: { bc: "K♥", prc: "6♥" },
    23: { bc: "Q♥", prc: "8♦", prc_alt: "K♠ & 5♠" },
    24: { bc: "J♥", prc: "9♥", prc_alt: "2♥ & 2♦" },
    25: { bc: "10♥", prc: "A♥ & 3♠" },
    26: { bc: "9♥", prc: "Q♠ & K♠" },
    27: { bc: "8♥", prc: "Q♥ & A♠" },
    28: { bc: "7♥", prc: "J♥ & K♠" },
    29: { bc: "6♥", prc: "J♠ & 10♦" },
    30: { bc: "5♥", prc: "9♥ & 9♦" },
    31: { bc: "4♥", prc: "8♥ & 8♦" }
  },
  // NOVEMBER
  11: {
    1: { bc: "6♦", prc: "10♦ & 5♥" },
    2: { bc: "5♦", prc: "9♦ & 4♥" },
    3: { bc: "4♦", prc: "6♠ & K♠" },
    4: { bc: "3♦", prc: "7♦ & 2♥" },
    5: { bc: "2♦", prc: "6♦ & A♥" },
    6: { bc: "A♦", prc: "3♠ & Q♠" },
    7: { bc: "K♠", prc: "4♦ & Q♥" },
    8: { bc: "Q♠", prc: "3♦ & J♥" },
    9: { bc: "J♠", prc: "2♠ & 2♠" },
    10: { bc: "10♠", prc: "3♥ & 3♦" },
    11: { bc: "9♠", prc: "K♥ & J♠" },
    12: { bc: "8♠", prc: "10♥ & Q♦" },
    13: { bc: "7♠", prc: "J♠ & J♦" },
    14: { bc: "6♠", prc: "10♠ & Q♠" },
    15: { bc: "5♠", prc: "7♥ & 9♠" },
    16: { bc: "4♠", prc: "8♠ & 8♠" },
    17: { bc: "3♠", prc: "7♠ & 7♠" },
    18: { bc: "2♠", prc: "4♥ & 6♠" },
    19: { bc: "A♠", prc: "5♠ & 5♠" },
    20: { bc: "K♥", prc: "4♠ & 4♠" },
    21: { bc: "Q♥", prc: "K♠ & 5♠" },
    22: { bc: "J♥", prc: "2♥ & 2♦" },
    23: { bc: "10♥", prc: "A♦" },
    24: { bc: "9♥", prc: "J♠" },
    25: { bc: "8♥", prc: "10♠" },
    26: { bc: "7♥", prc: "9♠" },
    27: { bc: "6♥", prc: "8♠" },
    28: { bc: "5♥", prc: "7♠" },
    29: { bc: "4♥", prc: "6♠" },
    30: { bc: "3♥", prc: "5♠" }
  },
  // DECEMBER
  12: {
    1: { bc: "4♦", prc: "6♠" },
    2: { bc: "3♦", prc: "5♠" },
    3: { bc: "2♦", prc: "4♠" },
    4: { bc: "A♦", prc: "3♠" },
    5: { bc: "K♠", prc: "2♠" },
    6: { bc: "Q♠", prc: "A♠" },
    7: { bc: "J♠", prc: "K♠" },
    8: { bc: "10♠", prc: "A♠" },
    9: { bc: "9♠", prc: "K♦" },
    10: { bc: "8♠", prc: "10♦" },
    11: { bc: "7♠", prc: "9♦" },
    12: { bc: "6♠", prc: "8♦" },
    13: { bc: "5♠", prc: "7♦" },
    14: { bc: "4♠", prc: "6♦" },
    15: { bc: "3♠", prc: "5♦" },
    16: { bc: "2♠", prc: "4♦" },
    17: { bc: "A♠", prc: "3♦" },
    18: { bc: "K♥", prc: "2♦" },
    19: { bc: "Q♥", prc: "3♥" },
    20: { bc: "J♥", prc: "K♥" },
    21: { bc: "10♥", prc: "A♦", prc_alt: "Q♦" },
    22: { bc: "9♥", prc: "J♦", prc_alt: "9♦" },
    23: { bc: "8♥", prc: "8♦" },
    24: { bc: "7♥", prc: "9♠" },
    25: { bc: "6♥", prc: "6♦" },
    26: { bc: "5♥", prc: "5♦" },
    27: { bc: "4♥", prc: "6♠" },
    28: { bc: "3♥", prc: "3♦" },
    29: { bc: "2♥", prc: "2♦" },
    30: { bc: "A♥", prc: "3♠" },
    31: { bc: "Joker", prc: "Joker" }
  }
};

/**
 * Get destiny cards (Birth Card and Planetary Ruling Card) from a date
 * @param {Date|string} birthDate - Date object or date string
 * @returns {{ birthCard: string, sunCard: string } | null}
 */
export function getDestinyCards(birthDate) {
  if (!birthDate) return null;
  
  const date = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (isNaN(date.getTime())) return null;
  
  const month = date.getMonth() + 1; // JS months are 0-indexed
  const day = date.getDate();
  
  const cards = DESTINY_CARDS[month]?.[day];
  if (!cards) return null;
  
  return {
    birthCard: cards.bc,
    sunCard: cards.prc
  };
}

/**
 * Format card with color styling info
 * @param {string} card - Card string like "A♠" or "K♥"
 * @returns {{ card: string, isRed: boolean }}
 */
export function getCardStyle(card) {
  if (!card) return { card: '', isRed: false };
  const isRed = card.includes('♥') || card.includes('♦');
  return { card, isRed };
}

// Card meanings for display
export const CARD_MEANINGS = {
  'A': 'New beginnings, individuality, leadership',
  '2': 'Partnership, balance, cooperation',
  '3': 'Creativity, expression, growth',
  '4': 'Stability, foundation, structure',
  '5': 'Change, adventure, freedom',
  '6': 'Harmony, responsibility, nurturing',
  '7': 'Spirituality, wisdom, introspection',
  '8': 'Power, abundance, success',
  '9': 'Completion, universal love, humanitarianism',
  '10': 'Achievement, fulfillment, mastery',
  'J': 'Youth, creativity, messenger',
  'Q': 'Intuition, nurturing, receptivity',
  'K': 'Authority, mastery, leadership',
  'Joker': 'Wild card, unlimited potential, cosmic consciousness'
};

export const SUIT_MEANINGS = {
  '♠': { name: 'Spades', meaning: 'Work, health, wisdom, transformation' },
  '♥': { name: 'Hearts', meaning: 'Love, relationships, emotions, family' },
  '♣': { name: 'Clubs', meaning: 'Knowledge, communication, mental pursuits' },
  '♦': { name: 'Diamonds', meaning: 'Values, finances, material world' }
};

// Full destiny card meanings
export const DESTINY_CARD_MEANINGS = {
  // Hearts
  'A♥': { title: 'Ace of Hearts', meaning: 'A deep desire for love and affection. New emotional beginnings and a strong urge to express feelings.' },
  '2♥': { title: 'Two of Hearts', meaning: 'The card of lovers and deep partnerships. Fulfillment through one-on-one connections and mutual support.' },
  '3♥': { title: 'Three of Hearts', meaning: 'Emotional variety. Creative but may struggle with indecision or worry in relationships.' },
  '4♥': { title: 'Four of Hearts', meaning: 'Emotional protection and stability. Seeks a secure home life and is protective of loved ones.' },
  '5♥': { title: 'Five of Hearts', meaning: 'Restlessness in love. Seeks change or adventure to avoid feeling trapped emotionally.' },
  '6♥': { title: 'Six of Hearts', meaning: 'The "Law of Love". Karmic responsibility; reaping exactly what is sown emotionally.' },
  '7♥': { title: 'Seven of Hearts', meaning: 'Spiritual love. Challenge to move from personal attachment to universal, detached love.' },
  '8♥': { title: 'Eight of Hearts', meaning: 'Emotional power. Natural charm and magnetism used to lead others through feelings.' },
  '9♥': { title: 'Nine of Hearts', meaning: 'The card of universal love. Humanitarian; learning to let go of personal desires for the greater good.' },
  '10♥': { title: 'Ten of Hearts', meaning: 'Social success. Recognition through large social circles and emotional intelligence.' },
  'J♥': { title: 'Jack of Hearts', meaning: 'The "Sacrifice for Love". Creative/playful; gives up personal desires for higher romantic or family ideals.' },
  'Q♥': { title: 'Queen of Hearts', meaning: 'The "Mother of Love". Mastery of the emotional realm with great kindness and nurturing ability.' },
  'K♥': { title: 'King of Hearts', meaning: 'The "Father of Love". Rules the emotional world with authority and natural leadership.' },

  // Clubs
  'A♣': { title: 'Ace of Clubs', meaning: 'Hunger for knowledge and new ideas. Independent thinker always searching for a mental spark.' },
  '2♣': { title: 'Two of Clubs', meaning: 'Conversation and shared ideas. Excels in business partnerships where communication is key.' },
  '3♣': { title: 'Three of Clubs', meaning: 'Creative intelligence. Highly active mind; must avoid letting mental chatter turn into worry.' },
  '4♣': { title: 'Four of Clubs', meaning: 'Mental stability. Fixed ideas; provides a solid foundation for intellectual projects.' },
  '5♣': { title: 'Five of Clubs', meaning: 'Change of mind. Restless thinker; loves travel and new cultures or studies.' },
  '6♣': { title: 'Six of Clubs', meaning: 'Responsibility for truth. "Guardian of intuition"; must stay true to the inner voice.' },
  '7♣': { title: 'Seven of Clubs', meaning: 'Spiritual knowledge. Overcoming negative thinking and skepticism to find higher truths.' },
  '8♣': { title: 'Eight of Clubs', meaning: 'Mental power. Focus and concentration to achieve any goal.' },
  '9♣': { title: 'Nine of Clubs', meaning: 'Universal truth. Completes large mental projects that benefit humanity.' },
  '10♣': { title: 'Ten of Clubs', meaning: 'Intellectual success. Public recognition for writing, teaching, or speaking.' },
  'J♣': { title: 'Jack of Clubs', meaning: 'Creative intelligence. "Eternal youth"; playful, inventive, and sometimes crafty with ideas.' },
  'Q♣': { title: 'Queen of Clubs', meaning: 'The "Teacher". Mastery of information; born to share wisdom.' },
  'K♣': { title: 'King of Clubs', meaning: 'The "Master of Knowledge". Ultimate mental authority; leads through command and insight.' },

  // Diamonds
  'A♦': { title: 'Ace of Diamonds', meaning: 'Desire for money or worth. Independent and ambitious; starts new financial ventures.' },
  '2♦': { title: 'Two of Diamonds', meaning: 'Business partnerships. Financial success through cooperation and shared resources.' },
  '3♦': { title: 'Three of Diamonds', meaning: 'Financial variety. Multiple income streams but prone to worry about security.' },
  '4♦': { title: 'Four of Diamonds', meaning: 'Financial protection. Practical and grounded; builds secure material foundations.' },
  '5♦': { title: 'Five of Diamonds', meaning: 'Change in values. Financial shifts or frequent travel for business.' },
  '6♦': { title: 'Six of Diamonds', meaning: 'Financial karma. Learning the balance between giving and receiving; dealing with past-life debts.' },
  '7♦': { title: 'Seven of Diamonds', meaning: 'Spiritual values. Trusting in providence; overcoming fear of material lack.' },
  '8♦': { title: 'Eight of Diamonds', meaning: 'Financial power. Competent and visionary management of money and resources.' },
  '9♦': { title: 'Nine of Diamonds', meaning: 'Universal giving. Fulfillment through charity and letting go of material accumulation.' },
  '10♦': { title: 'Ten of Diamonds', meaning: 'Material success. Career-oriented and determined; often reaches great wealth.' },
  'J♦': { title: 'Jack of Diamonds', meaning: 'The "Merchant". Clever and creative in business; must avoid immaturity.' },
  'Q♦': { title: 'Queen of Diamonds', meaning: 'The "Philanthropist". Mastery of values; uses wealth to serve humanity.' },
  'K♦': { title: 'King of Diamonds', meaning: 'The "Master of Values". Ultimate business authority; rules through firm command.' },

  // Spades
  'A♠': { title: 'Ace of Spades', meaning: 'Spiritual initiation. Deep desire for wisdom; transformative "deaths and rebirths".' },
  '2♠': { title: 'Two of Spades', meaning: 'Cooperation in work. Success through partnerships in career or health.' },
  '3♠': { title: 'Three of Spades', meaning: 'Artistic work. Creative labor; may struggle with indecision about life path.' },
  '4♠': { title: 'Four of Spades', meaning: 'Solid work foundations. Disciplined and practical; builds a lasting career.' },
  '5♠': { title: 'Five of Spades', meaning: 'Change in work. Adventurous; changes jobs or locations to find true purpose.' },
  '6♠': { title: 'Six of Spades', meaning: 'Responsibility in work. Lifestyle and health are direct results of past actions.' },
  '7♠': { title: 'Seven of Spades', meaning: 'Spiritual challenge. Maintaining faith in the face of work or health obstacles.' },
  '8♠': { title: 'Eight of Spades', meaning: 'Power through work. High willpower and labor to achieve mastery.' },
  '9♠': { title: 'Nine of Spades', meaning: 'Universal work. Completion through a career serving a higher spiritual purpose.' },
  '10♠': { title: 'Ten of Spades', meaning: 'Success in work. Intensely determined; reaches the top of the field through labor.' },
  'J♠': { title: 'Jack of Spades', meaning: 'Creative "Initiate". Playful yet spiritual; path through arts or ancient wisdom.' },
  'Q♠': { title: 'Queen of Spades', meaning: 'The "Master of Labor". Masters the physical world to organize and nurture others.' },
  'K♠': { title: 'King of Spades', meaning: 'The Crown Authority. Highest card; represents ultimate spiritual mastery and leadership.' },

  // Special
  'Joker': { title: 'The Joker', meaning: 'Born Dec 31st. "God energy"; can take on any card\'s characteristics.' }
};

// Map written-out card names to symbol format
const CARD_NAME_TO_SYMBOL = {
  // Hearts
  'ace of hearts': 'A♥', 'two of hearts': '2♥', 'three of hearts': '3♥', 'four of hearts': '4♥',
  'five of hearts': '5♥', 'six of hearts': '6♥', 'seven of hearts': '7♥', 'eight of hearts': '8♥',
  'nine of hearts': '9♥', 'ten of hearts': '10♥', 'jack of hearts': 'J♥', 'queen of hearts': 'Q♥', 'king of hearts': 'K♥',
  // Clubs
  'ace of clubs': 'A♣', 'two of clubs': '2♣', 'three of clubs': '3♣', 'four of clubs': '4♣',
  'five of clubs': '5♣', 'six of clubs': '6♣', 'seven of clubs': '7♣', 'eight of clubs': '8♣',
  'nine of clubs': '9♣', 'ten of clubs': '10♣', 'jack of clubs': 'J♣', 'queen of clubs': 'Q♣', 'king of clubs': 'K♣',
  // Diamonds
  'ace of diamonds': 'A♦', 'two of diamonds': '2♦', 'three of diamonds': '3♦', 'four of diamonds': '4♦',
  'five of diamonds': '5♦', 'six of diamonds': '6♦', 'seven of diamonds': '7♦', 'eight of diamonds': '8♦',
  'nine of diamonds': '9♦', 'ten of diamonds': '10♦', 'jack of diamonds': 'J♦', 'queen of diamonds': 'Q♦', 'king of diamonds': 'K♦',
  // Spades
  'ace of spades': 'A♠', 'two of spades': '2♠', 'three of spades': '3♠', 'four of spades': '4♠',
  'five of spades': '5♠', 'six of spades': '6♠', 'seven of spades': '7♠', 'eight of spades': '8♠',
  'nine of spades': '9♠', 'ten of spades': '10♠', 'jack of spades': 'J♠', 'queen of spades': 'Q♠', 'king of spades': 'K♠',
  // Joker
  'joker': 'Joker'
};

/**
 * Normalize card name to symbol format
 * @param {string} card - Card string in any format
 * @returns {string} - Normalized card symbol like "10♣"
 */
export function normalizeCardName(card) {
  if (!card) return '';
  // If already in symbol format, return as-is
  if (card.includes('♠') || card.includes('♥') || card.includes('♣') || card.includes('♦') || card === 'Joker') {
    return card;
  }
  // Try to convert from written format
  return CARD_NAME_TO_SYMBOL[card.toLowerCase()] || card;
}

/**
 * Get the full meaning for a destiny card
 * @param {string} card - Card string like "A♠", "K♥", or "Ten of Clubs"
 * @returns {{ title: string, meaning: string } | null}
 */
export function getDestinyCardMeaning(card) {
  if (!card) return null;
  const normalized = normalizeCardName(card);
  return DESTINY_CARD_MEANINGS[normalized] || null;
}