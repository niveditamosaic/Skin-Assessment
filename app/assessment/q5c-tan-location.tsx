import React from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { QuestionShell } from '../../src/components/QuestionShell';
import { OptionCard } from '../../src/components/OptionCard';
import type { SpotLocation } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

const OPTIONS: { value: SpotLocation; label: string; description: string }[] = [
  { value: 'cheeks_under_eyes', label: 'Cheeks and below the eyes', description: 'Most noticeable on cheeks and temples' },
  { value: 'forehead_nose',     label: 'Forehead and nose',         description: 'Concentrated on the centre of the face' },
  { value: 'jaw_chin',          label: 'Jaw and chin',              description: 'Along the jawline and neck' },
  { value: 'all_over',          label: 'All over the face',         description: 'General darkening across the face' },
];

export default function Q5cTanLocationScreen() {
  const { profile, setSpotLocation } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q4c-tan-duration');

  return (
    <QuestionShell
      step={5}
      onBack={goBack}
      onNext={() => router.push('/assessment/q6c-tan-sun-exposure' as any)}
      nextDisabled={!profile.spot_location}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A2540', lineHeight: 36, paddingHorizontal: 24, marginBottom: 32 }}>
        Where on your face is the tanning or unevenness most visible?
      </Text>

      {OPTIONS.map(opt => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          description={opt.description}
          selected={profile.spot_location === opt.value}
          onPress={() => setSpotLocation(opt.value)}
        />
      ))}
    </QuestionShell>
  );
}
