import { create } from 'zustand';
import type {
  AssessmentProfile,
  SkinType,
  Concern,
  AcneType,
  AcneFrequency,
  AcneDuration,
  SpotDuration,
  SpotLocation,
  SunExposure,
  ScanOiliness,
  ScanAcne,
  ScanPigmentation,
  ScanTan,
  ScanTexture,
} from '../types/assessment';
import { EMPTY_PROFILE } from '../types/assessment';
import { calculateSeverity } from '../logic/severityEngine';
import { determinePlan } from '../logic/planEngine';

interface AssessmentState {
  profile: AssessmentProfile;

  // Transient — holds the captured photo URI only while the analysis screen
  // is showing. Never persisted. Cleared when the user moves to the plan screen.
  capturedImageUri: string | null;
  setCapturedImageUri: (uri: string | null) => void;

  // Q1
  setBasicDetails: (name: string, age: string, phone: string) => void;

  // Q2
  setSkinType: (skinType: SkinType) => void;

  // Q3
  toggleConcern: (concern: Concern) => void;

  // Q4a–Q6a (acne branch)
  setAcneType: (acneType: AcneType) => void;
  setAcneFrequency: (freq: AcneFrequency) => void;
  setAcneDuration: (duration: AcneDuration) => void;

  // Q4b/c–Q6b/c (dark spots / tanning branches)
  setSpotDuration: (duration: SpotDuration) => void;
  setSpotLocation: (location: SpotLocation) => void;
  setSunExposure: (exposure: SunExposure) => void;

  // Finalise severity + plan after all branch questions are answered
  finaliseSeverityAndPlan: () => void;

  // Scan outputs
  setScanResults: (results: {
    oiliness: ScanOiliness;
    acne: ScanAcne;
    pigmentation: ScanPigmentation;
    tan: ScanTan;
    texture: ScanTexture;
  }) => void;

  // Apply scan override rules (Section 4)
  applyScanOverrides: () => void;

  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  profile: { ...EMPTY_PROFILE },
  capturedImageUri: null,

  setCapturedImageUri: uri => set({ capturedImageUri: uri }),

  setBasicDetails: (name, age, phone) =>
    set(s => ({ profile: { ...s.profile, name, age, phone } })),

  setSkinType: skinType =>
    set(s => ({ profile: { ...s.profile, skin_type: skinType } })),

  toggleConcern: concern =>
    set(s => {
      const current = s.profile.concerns;
      const next = current.includes(concern)
        ? current.filter(c => c !== concern)
        : [...current, concern];
      return { profile: { ...s.profile, concerns: next } };
    }),

  setAcneType: acneType => {
    set(s => {
      const updated = { ...s.profile, acne_type: acneType };
      if (acneType === 'cystic') {
        updated.severity = 'severe';
        updated.derm_flag = true;
      }
      return { profile: updated };
    });
  },

  setAcneFrequency: freq =>
    set(s => ({ profile: { ...s.profile, acne_frequency: freq } })),

  setAcneDuration: duration =>
    set(s => ({ profile: { ...s.profile, acne_duration: duration } })),

  setSpotDuration: duration =>
    set(s => ({ profile: { ...s.profile, spot_duration: duration } })),

  setSpotLocation: location =>
    set(s => ({ profile: { ...s.profile, spot_location: location } })),

  setSunExposure: exposure =>
    set(s => ({ profile: { ...s.profile, sun_exposure: exposure } })),

  finaliseSeverityAndPlan: () => {
    const { profile } = get();
    let severity = profile.severity;
    let derm_flag = profile.derm_flag;

    if (profile.concerns.includes('acne') && profile.acne_type !== 'cystic') {
      const result = calculateSeverity(
        profile.acne_type!,
        profile.acne_frequency,
        profile.acne_duration,
      );
      severity = result.severity;
      derm_flag = result.derm_flag;
    }

    const plan_id = determinePlan(profile.concerns, severity);
    console.log('[finaliseSeverityAndPlan] concerns:', JSON.stringify(profile.concerns), '| severity:', severity, '→ plan_id:', plan_id);
    set(s => ({ profile: { ...s.profile, severity, derm_flag, plan_id } }));
  },

  setScanResults: ({ oiliness, acne, pigmentation, tan, texture }) =>
    set(s => ({
      profile: {
        ...s.profile,
        scan_oiliness: oiliness,
        scan_acne: acne,
        scan_pigmentation: pigmentation,
        scan_tan: tan,
        scan_texture: texture,
      },
    })),

  applyScanOverrides: () => {
    const { profile } = get();
    const updatedConcerns = [...profile.concerns];
    let severity = profile.severity;

    if (
      (profile.scan_acne === 'moderate' || profile.scan_acne === 'severe') &&
      !updatedConcerns.includes('acne')
    ) {
      updatedConcerns.push('acne');
    }
    if (
      profile.scan_tan === 'widespread' &&
      !updatedConcerns.includes('tanning')
    ) {
      updatedConcerns.push('tanning');
    }
    if (
      (profile.scan_pigmentation === 'moderate' || profile.scan_pigmentation === 'deep') &&
      !updatedConcerns.includes('dark_spots')
    ) {
      updatedConcerns.push('dark_spots');
    }

    if (profile.scan_acne === 'severe' && severity === 'mild') {
      severity = 'severe';
    }

    const plan_id = determinePlan(updatedConcerns, severity);
    console.log('[applyScanOverrides] concerns before:', JSON.stringify(profile.concerns), '| concerns after:', JSON.stringify(updatedConcerns), '| severity:', severity, '→ plan_id:', plan_id);
    set(s => ({
      profile: { ...s.profile, concerns: updatedConcerns, severity, plan_id },
    }));
  },

  reset: () => set({ profile: { ...EMPTY_PROFILE }, capturedImageUri: null }),
}));
