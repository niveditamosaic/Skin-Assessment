import React from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { QuestionShell } from '../../src/components/QuestionShell';
import { OptionCard } from '../../src/components/OptionCard';
import type { SpotLocation } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

const OPTIONS: { value: SpotLocation; label: string; description: string }[] = [
  { value: 'cheeks_under_eyes', label: 'Cheeks and below the eyes', description: 'Around the cheekbones and under-eye area' },
  { value: 'forehead_nose',     label: 'Forehead and nose',         description: 'The central T-zone of the face' },
  { value: 'jaw_chin',          label: 'Jaw and chin',              description: 'The lower half of the face' },
  { value: 'all_over',          label: 'All over the face',         description: 'Spread across multiple areas' },
];

export default function Q5bSpotLocationScreen() {
  const { profile, setSpotLocation } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q4b-spot-duration');

  return (
    <QuestionShell
      step={5}
      onBack={goBack}
      onNext={() => router.push('/assessment/q6b-sun-exposure' as any)}
      nextDisabled={!profile.spot_location}
    >
      <Text style={{ fontSize: 26, fontWeight: '800', color: '#1A2540', lineHeight: 34, paddingHorizontal: 24, marginBottom: 32 }}>
        Where on your face do you notice them the most?
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
