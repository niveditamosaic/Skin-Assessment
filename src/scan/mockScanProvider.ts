import type { ScanProvider } from './scanAdapter';
import type { ScanInput, ScanOutput } from './types';

// Phase 1 mock. Returns plausible mid-range values.
// Simulates a 2-second analysis delay to keep the UX realistic.
export const mockScanProvider: ScanProvider = {
  async analyse(_input: ScanInput): Promise<ScanOutput> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Values are set high enough to trigger the override rules in applyScanOverrides:
    // acne:'moderate' → adds 'acne' concern if not already selected in Q3
    // tan:'widespread' → adds 'tanning' concern if not already selected in Q3
    // pigmentation:'moderate' → stored in profile for findings text (no override rule yet)
    return {
      oiliness: 'high',
      acne: 'moderate',
      pigmentation: 'moderate',
      tan: 'widespread',
      texture: 'uneven',
    };
  },
};
