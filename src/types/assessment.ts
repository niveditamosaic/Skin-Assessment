// All enums and types mirror Section 7 of the spec exactly.

export type SkinType = 'oily' | 'dry' | 'combination';

export type Concern = 'acne' | 'dark_spots' | 'tanning';

export type AcneType = 'red_painless' | 'red_pimples' | 'pus' | 'cystic';

export type AcneFrequency = 'rarely' | 'monthly' | 'always';

export type AcneDuration = 'under_6m' | '6m_2yr' | 'over_2yr';

export type Severity = 'light' | 'mild' | 'severe';

export type ScanOiliness = 'low' | 'medium' | 'high';

export type ScanAcne = 'none' | 'mild' | 'moderate' | 'severe';

export type ScanPigmentation = 'none' | 'superficial' | 'moderate' | 'deep';

export type ScanTan = 'none' | 'patchy' | 'widespread';

export type ScanTexture = 'smooth' | 'rough' | 'uneven';

export type PlanId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Duration/location enums shared across dark-spots and tanning branches
export type SpotDuration = 'under_3m' | '3m_1yr' | 'over_1yr';

export type SpotLocation =
  | 'cheeks_under_eyes'
  | 'forehead_nose'
  | 'jaw_chin'
  | 'all_over';

export type SunExposure = 'mostly_indoors' | 'moderate' | 'mostly_outdoors';

// The complete user assessment profile (Section 7)
export interface AssessmentProfile {
  // Q1
  name: string;
  age: string;
  phone: string;

  // Q2
  skin_type: SkinType | null;

  // Q3 — stored concerns (questionnaire + scan override)
  concerns: Concern[];

  // Q4a–Q6a (acne branch)
  acne_type: AcneType | null;
  acne_frequency: AcneFrequency | null;
  acne_duration: AcneDuration | null;

  // Q4b/c–Q6b/c (dark spots / tanning branches)
  spot_duration: SpotDuration | null;
  spot_location: SpotLocation | null;
  sun_exposure: SunExposure | null;

  // Computed
  severity: Severity | null;
  derm_flag: boolean;
  plan_id: PlanId | null;

  // AI scan outputs
  scan_oiliness: ScanOiliness | null;
  scan_acne: ScanAcne | null;
  scan_pigmentation: ScanPigmentation | null;
  scan_tan: ScanTan | null;
  scan_texture: ScanTexture | null;
}

export const EMPTY_PROFILE: AssessmentProfile = {
  name: '',
  age: '',
  phone: '',
  skin_type: null,
  concerns: [],
  acne_type: null,
  acne_frequency: null,
  acne_duration: null,
  spot_duration: null,
  spot_location: null,
  sun_exposure: null,
  severity: null,
  derm_flag: false,
  plan_id: null,
  scan_oiliness: null,
  scan_acne: null,
  scan_pigmentation: null,
  scan_tan: null,
  scan_texture: null,
};
