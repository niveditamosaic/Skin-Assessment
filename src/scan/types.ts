import type {
  ScanOiliness,
  ScanAcne,
  ScanPigmentation,
  ScanTan,
  ScanTexture,
} from '../types/assessment';

export interface ScanInput {
  // Phase 1: imageUri is captured but not sent (mock ignores it).
  // Phase 2: this is forwarded to Haut.AI or Face++.
  imageUri: string;
}

export interface ScanOutput {
  oiliness: ScanOiliness;
  acne: ScanAcne;
  pigmentation: ScanPigmentation;
  tan: ScanTan;
  texture: ScanTexture;
}
