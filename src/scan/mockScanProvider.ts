import type { ScanProvider } from './scanAdapter';
import type { ScanInput, ScanOutput } from './types';

// Phase 1 mock. Returns plausible mid-range values.
// Simulates a 2-second analysis delay to keep the UX realistic.
export const mockScanProvider: ScanProvider = {
  async analyse(_input: ScanInput): Promise<ScanOutput> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Conservative values that do NOT trigger applyScanOverrides injection rules.
    // Override rules require acne:'moderate'|'severe', tan:'widespread',
    // pigmentation:'moderate'|'deep' to add new concerns. Keeping these below
    // those thresholds means the scan confirms findings without overwriting what
    // the user selected in Q3. A real scan API (Phase 2) will return actual values.
    return {
      oiliness: 'medium',
      acne: 'mild',
      pigmentation: 'superficial',
      tan: 'patchy',
      texture: 'uneven',
    };
  },
};
