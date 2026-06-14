import type { ScanInput, ScanOutput } from './types';

// The only interface the rest of the app ever imports.
// To swap mock → Haut.AI or Face++:
//   1. Write a new provider that satisfies ScanProvider
//   2. Change the import in the line below — nothing else changes
export interface ScanProvider {
  analyse(input: ScanInput): Promise<ScanOutput>;
}

// Runtime provider — swapped at the module level for Phase 2
import { mockScanProvider } from './mockScanProvider';
const activeProvider: ScanProvider = mockScanProvider;

export async function runScan(input: ScanInput): Promise<ScanOutput> {
  return activeProvider.analyse(input);
}
