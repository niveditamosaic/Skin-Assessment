import type { AcneType, AcneFrequency, AcneDuration, Severity } from '../types/assessment';

export interface SeverityResult {
  severity: Severity;
  derm_flag: boolean;
}

// Implements Section 3 severity matrix exactly.
// Called after Q6a is answered (or immediately after Q4a if cystic).
export function calculateSeverity(
  acneType: AcneType,
  frequency: AcneFrequency | null,
  duration: AcneDuration | null,
): SeverityResult {
  // Cystic is always severe with derm referral, regardless of frequency/duration
  if (acneType === 'cystic') {
    return { severity: 'severe', derm_flag: true };
  }

  // Frequency takes priority: "almost always" → severe
  if (frequency === 'always') {
    return { severity: 'severe', derm_flag: false };
  }

  // Long duration escalates even if frequency is low
  if (duration === '6m_2yr' || duration === 'over_2yr') {
    return { severity: 'severe', derm_flag: false };
  }

  // Mild: infrequent AND recent (under 6 months)
  return { severity: 'mild', derm_flag: false };
}
