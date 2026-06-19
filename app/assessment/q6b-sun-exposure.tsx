import React from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { QuestionShell } from '../../src/components/QuestionShell';
import { OptionCard } from '../../src/components/OptionCard';
import type { SunExposure } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

const OPTIONS: { value: SunExposure; label: string; description: string }[] = [
  { value: 'mostly_indoors',  label: 'Mostly indoors',  description: 'Less than 1 hour outside per day' },
  { value: 'moderate',        label: 'Moderate',        description: '1 to 3 hours outside per day' },
  { value: 'mostly_outdoors', label: 'Mostly outdoors', description: 'More than 3 hours outside per day' },
];

export default function Q6bSunExposureScreen() {
  const { profile, setSunExposure, finaliseSeverityAndPlan } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q5b-spot-location');

  return (
    <QuestionShell
      step={6}
      onBack={goBack}
      onNext={() => { finaliseSeverityAndPlan(); router.push('/assessment/scan-intro' as any); }}
      nextDisabled={!profile.sun_exposure}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A3A6B', lineHeight: 36, paddingHorizontal: 24, marginBottom: 32 }}>
        How much time do you spend outdoors on a typical day?
      </Text>

      {OPTIONS.map(opt => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          description={opt.description}
          selected={profile.sun_exposure === opt.value}
          onPress={() => setSunExposure(opt.value)}
        />
      ))}
    </QuestionShell>
  );
}
