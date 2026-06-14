import type { Concern, Severity, PlanId } from '../types/assessment';

// Implements the plan decision table from Section 5.
export function determinePlan(
  concerns: Concern[],
  severity: Severity | null,
): PlanId {
  const hasAcne = concerns.includes('acne');
  const hasDarkSpots = concerns.includes('dark_spots');
  const hasTanning = concerns.includes('tanning');
  const hasOtherWithAcne = hasDarkSpots || hasTanning;

  if (hasAcne) {
    if (severity === 'mild') return hasOtherWithAcne ? 2 : 1;
    // severe (or null treated as severe for safety)
    return hasOtherWithAcne ? 4 : 3;
  }

  if (hasDarkSpots && !hasTanning) return 5;

  // tanning only OR dark_spots + tanning
  return 6;
}
