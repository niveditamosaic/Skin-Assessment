import type { Concern, AcneType } from '../types/assessment';

export type AssessmentRoute =
  | '/assessment/q4a-acne-type'
  | '/assessment/q4b-spot-duration'
  | '/assessment/q4c-tan-duration'
  | '/assessment/q5a-acne-frequency'
  | '/assessment/q6a-acne-duration'
  | '/assessment/q5b-spot-location'
  | '/assessment/q6b-sun-exposure'
  | '/assessment/q5c-tan-location'
  | '/assessment/q6c-tan-sun-exposure'
  | '/assessment/scan-intro';

// Determines which screen follows Q3 based on selected concerns.
// Rule: if acne is selected alongside anything else, acne branch takes priority.
export function routeAfterQ3(concerns: Concern[]): AssessmentRoute {
  if (concerns.includes('acne')) return '/assessment/q4a-acne-type';
  if (concerns.includes('dark_spots') && !concerns.includes('tanning'))
    return '/assessment/q4b-spot-duration';
  // tanning only OR dark_spots + tanning
  return '/assessment/q4c-tan-duration';
}

// red_painless and cystic skip frequency/duration — severity is determined by
// acne type alone, so Q5a/Q6a would contribute nothing.
export function routeAfterQ4a(acneType: AcneType): AssessmentRoute {
  if (acneType === 'red_painless' || acneType === 'cystic') {
    return '/assessment/scan-intro';
  }
  return '/assessment/q5a-acne-frequency';
}
