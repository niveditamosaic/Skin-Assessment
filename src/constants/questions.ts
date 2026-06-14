// All question text and option labels live here.
// Screens import from this file — no hardcoded strings in JSX.

export const Q2_OPTIONS = [
  {
    value: 'oily' as const,
    label: 'Oily',
    description: 'Shiny or greasy feel by mid-morning',
  },
  {
    value: 'dry' as const,
    label: 'Dry',
    description: 'Tight or flaky feel throughout the day',
  },
  {
    value: 'combination' as const,
    label: 'Combination',
    description: 'Oily T-zone, dry on cheeks',
  },
];

export const Q3_OPTIONS = [
  {
    value: 'acne' as const,
    label: 'Acne',
    description: 'Pimples, breakouts, oily skin',
  },
  {
    value: 'dark_spots' as const,
    label: 'Dark Spots or Pigmentation',
    description: "Marks that won't go away, uneven tone",
  },
  {
    value: 'tanning' as const,
    label: 'Tanning or Uneven Skin',
    description: 'Sun damage, dullness, patchy skin',
  },
];

// Total question steps shown in the progress bar.
// Max 6 questions per user (spec Section 2).
export const TOTAL_STEPS = 6;
