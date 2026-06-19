import React from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { QuestionShell } from '../../src/components/QuestionShell';
import { OptionCard } from '../../src/components/OptionCard';
import { Q2_OPTIONS } from '../../src/constants/questions';
import type { SkinType } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

export default function Q2SkinTypeScreen() {
  const { profile, setSkinType } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q1-details');

  return (
    <QuestionShell
      step={2}
      onBack={goBack}
      onNext={() => router.push('/assessment/q3-concern' as any)}
      nextDisabled={!profile.skin_type}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A3A6B', lineHeight: 36, paddingHorizontal: 24, marginBottom: 32 }}>
        How does your skin feel a few hours after washing your face?
      </Text>

      {Q2_OPTIONS.map(opt => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          description={opt.description}
          selected={profile.skin_type === opt.value}
          onPress={() => setSkinType(opt.value as SkinType)}
        />
      ))}
    </QuestionShell>
  );
}
