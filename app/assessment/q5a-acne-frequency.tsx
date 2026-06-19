import React from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { QuestionShell } from '../../src/components/QuestionShell';
import { OptionCard } from '../../src/components/OptionCard';
import type { AcneFrequency } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

const OPTIONS: { value: AcneFrequency; label: string; description: string }[] = [
  { value: 'rarely',  label: 'Rarely',    description: 'Once in a while, maybe once a month' },
  { value: 'monthly', label: 'Sometimes', description: 'A few times a month, comes and goes' },
  { value: 'always',  label: 'Often',     description: 'Almost always have active breakouts' },
];

export default function Q5aAcneFrequencyScreen() {
  const { profile, setAcneFrequency } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q4a-acne-type');

  return (
    <QuestionShell
      step={5}
      onBack={goBack}
      onNext={() => router.push('/assessment/q6a-acne-duration' as any)}
      nextDisabled={!profile.acne_frequency}
    >
      <Text style={{ fontSize: 26, fontWeight: '800', color: '#1A2540', lineHeight: 34, paddingHorizontal: 24, marginBottom: 32 }}>
        How often do you get breakouts?
      </Text>

      {OPTIONS.map(opt => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          description={opt.description}
          selected={profile.acne_frequency === opt.value}
          onPress={() => setAcneFrequency(opt.value)}
        />
      ))}
    </QuestionShell>
  );
}
