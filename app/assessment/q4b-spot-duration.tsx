import React from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { QuestionShell } from '../../src/components/QuestionShell';
import { OptionCard } from '../../src/components/OptionCard';
import type { SpotDuration } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

const OPTIONS: { value: SpotDuration; label: string; description: string }[] = [
  { value: 'under_3m', label: 'Just started',  description: 'Less than 3 months' },
  { value: '3m_1yr',   label: 'Been a while',  description: '3 months to 1 year' },
  { value: 'over_1yr', label: 'Long time',     description: 'More than 1 year' },
];

export default function Q4bSpotDurationScreen() {
  const { profile, setSpotDuration } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q3-concern');

  return (
    <QuestionShell
      step={4}
      onBack={goBack}
      onNext={() => router.push('/assessment/q5b-spot-location' as any)}
      nextDisabled={!profile.spot_duration}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A2540', lineHeight: 36, paddingHorizontal: 24, marginBottom: 32 }}>
        How long have you had these dark spots or marks?
      </Text>

      {OPTIONS.map(opt => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          description={opt.description}
          selected={profile.spot_duration === opt.value}
          onPress={() => setSpotDuration(opt.value)}
        />
      ))}
    </QuestionShell>
  );
}
