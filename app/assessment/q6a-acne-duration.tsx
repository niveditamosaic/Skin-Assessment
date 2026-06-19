import React from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { QuestionShell } from '../../src/components/QuestionShell';
import { OptionCard } from '../../src/components/OptionCard';
import type { AcneDuration } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

const OPTIONS: { value: AcneDuration; label: string; description: string }[] = [
  { value: 'under_6m', label: 'Less than 6 months', description: 'Started recently' },
  { value: '6m_2yr',   label: '6 months – 2 years', description: 'Been dealing with it for a while' },
  { value: 'over_2yr', label: 'More than 2 years',  description: 'Long-standing, recurring issue' },
];

export default function Q6aAcneDurationScreen() {
  const { profile, setAcneDuration, finaliseSeverityAndPlan } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q5a-acne-frequency');

  return (
    <QuestionShell
      step={6}
      onBack={goBack}
      onNext={() => { finaliseSeverityAndPlan(); router.push('/assessment/scan-intro' as any); }}
      nextDisabled={!profile.acne_duration}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A2540', lineHeight: 36, paddingHorizontal: 24, marginBottom: 32 }}>
        How long have you been dealing with breakouts?
      </Text>

      {OPTIONS.map(opt => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          description={opt.description}
          selected={profile.acne_duration === opt.value}
          onPress={() => setAcneDuration(opt.value)}
        />
      ))}
    </QuestionShell>
  );
}
