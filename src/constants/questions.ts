// All question text and option labels live here.
// Screens import from this file — no hardcoded strings in JSX.

export const Q2_OPTIONS = [
  {
    value: 'oily' as const,
    label: 'Oily',
    description: 'Looks good in the morning, gets shiny by noon',
  },
  {
    value: 'combination' as const,
    label: 'Combination',
    description: 'Oily on the forehead and nose, normal or dry on cheeks',
  },
  {
    value: 'dry' as const,
    label: 'Dry',
    description: 'Feels tight or flaky, especially in AC or cold weather',
  },
];

export const Q3_OPTIONS = [
  {
    value: 'acne' as const,
    label: 'Acne',
    description: 'Pimples, whiteheads, or recurring breakouts',
  },
  {
    value: 'dark_spots' as const,
    label: 'Dark Spots',
    description: 'Marks left behind after a pimple heals',
  },
  {
    value: 'tanning' as const,
    label: 'Tanning',
    description: 'Darkening from sun exposure on face or neck',
  },
];

// Total question steps shown in the progress bar.
// Max 6 questions per user (spec Section 2).
export const TOTAL_STEPS = 6;
